// =====================
        // AUTO-ADVANCE: Завершення завдання → автопросування процесу
        // =====================
'use strict';
        async function advanceProcessIfLinked(taskId) {
            // AUTO-ADVANCE обробляється backend Cloud Function onProcessTaskCompleted
            // Фронт лише логує для debug
            const task = tasks.find(t => t.id === taskId);
            if (!task?.processId) return;
            window.dbg&&dbg('[Process] Task', taskId, 'done — backend will advance process', task.processId);
        }
        
        async function completeProcessStep(processId) {
            const process = processes.find(p => p.id === processId);
            if (!process) return;
            
            const template = processTemplates.find(t => t.id === process.templateId);
            if (!template?.steps?.length) {
                showAlertModal(window.t('templateNotFound'));
                return;
            }
            
            // Re-read from Firestore to prevent stale state after auto-advance
            try {
                const freshDoc = await window.companyRef().collection('processes').doc(processId).get();
                if (freshDoc.exists) {
                    const freshData = freshDoc.data();
                    process.currentStep = freshData.currentStep || 0;
                    process.status = freshData.status || 'active';
                    process.history = freshData.history || [];
                }
            } catch(e) { /* use local state as fallback */ }
            
            if (process.status === 'completed') {
                showToast(window.t('processCompleted').replace('{name}', process.name), 'info');
                return;
            }
            
            const currentStepIndex = Math.min(process.currentStep || 0, template.steps.length - 1);
            const currentStep = template.steps[currentStepIndex];
            
            // Перевіряємо чи є незавершене автозавдання для цього кроку
            const pendingAutoTask = tasks.find(t => 
                t.processId === processId && 
                t.processStep === currentStepIndex && 
                t.status !== 'done' && t.status !== 'review'
            );
            if (pendingAutoTask) {
                const skip = await showConfirmModal(window.t('skipStepConfirm').replace('{title}', pendingAutoTask.title));
                if (!skip) return;
            }
            
            // Перевіряємо права - чи користувач є членом функції поточного етапу
            const currentFunc = functions.find(f => f.name === currentStep.function);
            if (currentFunc && !currentFunc.assigneeIds?.includes(currentUser?.uid)) {
                // Дозволяємо також власникам/менеджерам
                const userRole = currentUserData?.role;
                if (userRole !== 'owner' && userRole !== 'manager') {
                    showAlertModal(window.t('onlyFunctionMembers'));
                    return;
                }
            }
            
            const nextStepIndex = currentStepIndex + 1;
            const nextStep = template.steps[nextStepIndex];
            
            try {
                const processRef = window.companyRef().collection('processes').doc(processId);
                
                // runTransaction — race protection: два менеджери не просунуть крок двічі
                const raceDetected = await db.runTransaction(async (tx) => {
                    const freshDoc = await tx.get(processRef);
                    if (!freshDoc.exists) return true;
                    const serverStep = freshDoc.data().currentStep || 0;
                    if (serverStep !== currentStepIndex) {
                        // Хтось вже просунув цей крок
                        return true;
                    }
                    const historyEntry = {
                        step: currentStepIndex,
                        stepTitle: currentStep.title || currentStep.function,
                        completedAt: new Date().toISOString(),
                        completedBy: currentUser.uid
                    };
                    const updateData = {
                        currentStep: nextStepIndex,
                        history: firebase.firestore.FieldValue.arrayUnion(historyEntry)
                    };
                    if (!nextStep) {
                        updateData.status = 'completed';
                        updateData.completedAt = firebase.firestore.FieldValue.serverTimestamp();
                    }
                    tx.update(processRef, updateData);
                    return false;
                });
                
                if (raceDetected) {
                    showToast(window.t('processStepAlreadyCompleted') || 'Крок вже виконано іншим користувачем', 'info');
                    await loadProcessData();
                    renderProcessBoard();
                    return;
                }
                
                // ET: крок процесу виконано
                if (typeof window.trackProcessStepDone === 'function') {
                    window.trackProcessStepDone(processId, currentStepIndex, currentStep.function || '');
                }
                // ET: процес завершено (якщо немає наступного кроку)
                if (!nextStep && typeof window.trackProcessCompleted === 'function') {
                    window.trackProcessCompleted(processId, {
                        templateId: process.templateId || '',
                        totalSteps: template.steps.length,
                    });
                }
                
                // Якщо є наступний етап - створюємо завдання
                if (nextStep) {
                    const func = functions.find(f => f.name === nextStep.function);
                    if (func?.assigneeIds?.length) {
                        const headId = func.headId || func.assigneeIds[0];
                        const head = users.find(u => u.id === headId);
                        
                        // Smart deadline calculation
                        let stepDeadlineDate = getLocalDateStr();
                        if (process.deadline) {
                            const processDeadline = new Date(process.deadline + 'T18:00:00');
                            const remainingAfterThis = template.steps.slice(nextStepIndex + 1).reduce((sum, s) => sum + parseInt(s.estimatedTime || 60), 0);
                            const stepDeadline = new Date(processDeadline.getTime() - remainingAfterThis * 60000);
                            const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
                            stepDeadlineDate = stepDeadline > tomorrow ? getLocalDateStr(stepDeadline) : getLocalDateStr(tomorrow);
                        }
                        
                        const newTaskData = {
                            title: `[${process.name}] ${nextStep.title || nextStep.function}`,
                            function: nextStep.function,
                            assigneeId: headId,
                            assigneeName: head?.name || head?.email || '',
                            instruction: nextStep.instruction || '',
                            estimatedTime: nextStep.estimatedTime || '60',
                            deadlineDate: stepDeadlineDate,
                            deadlineTime: '18:00',
                            status: 'new',
                            priority: 'high',
                            processId: processId,
                            processStep: nextStepIndex,
                            createdBy: currentUser.uid,
                            creatorId: currentUser.uid,
                            createdDate: getLocalDateStr(),
                            deadline: stepDeadlineDate + 'T18:00',
                            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                            creatorName: currentUserData?.name || currentUser.email || window.t('systemUser') // FIX BN
                        };
                        const docRef = await window.companyRef().collection('tasks').add(newTaskData);
                        // Локально додаємо задачу — без повного loadAllData()
                        tasks.unshift({ id: docRef.id, ...newTaskData, createdAt: new Date(), updatedAt: new Date() });
                    } else {
                        // Попередження якщо функція не має виконавців
                        showAlertModal(window.t('functionNoExecutorsWarning').replace('{name}', nextStep.function));
                    }
                }
                
                closeModal('viewProcessModal');
                await loadProcessData();
                // Замість loadAllData() — tasks[] вже оновлено локально, рендеримо точково
                renderProcessBoard();
                if (typeof renderMyDay === 'function') renderMyDay();
                refreshCurrentView();
                showAlertModal(nextStep ? window.t('stepCompleted') : window.t('processCompleted'));
                
            } catch (error) {
                console.error('completeProcessStep error:', error);
                showAlertModal(window.t('error') + ': ' + error.message);
            }
        }
