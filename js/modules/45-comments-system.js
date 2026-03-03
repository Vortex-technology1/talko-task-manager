// =====================
        // COMMENTS SYSTEM
        // =====================
        
        let currentTaskIdForComments = null;
        let commentsUnsubscribe = null;
        
        // Initialize comments when opening task modal for editing
        function initTaskComments(taskId) {
            currentTaskIdForComments = taskId;
            const section = document.getElementById('taskCommentsSection');
            
            if (!taskId) {
                // New task - hide comments
                section.classList.add('hidden');
                document.getElementById('taskHistorySection')?.classList.add('hidden');
                return;
            }
            
            // Show comments section for existing tasks
            section.classList.remove('hidden');
            loadComments(taskId);
            loadTaskFiles(taskId);
            
            // Load audit history
            loadTaskHistory(taskId);
            
            // Re-initialize lucide icons for comment section
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        }
        
        // Load comments with real-time listener
        function loadComments(taskId) {
            const listEl = document.getElementById('commentsList');
            const countEl = document.getElementById('commentCount');
            
            // Unsubscribe from previous listener
            if (commentsUnsubscribe) {
                commentsUnsubscribe();
            }
            
            listEl.innerHTML = '<div class="comments-loading" data-i18n="uploading">Завантаження...</div>';
            
            // Real-time listener for comments
            commentsUnsubscribe = db.collection('companies').doc(currentCompany)
                .collection('tasks').doc(taskId)
                .collection('comments')
                .orderBy('createdAt', 'asc')
                .onSnapshot(snapshot => {
                    const comments = [];
                    snapshot.forEach(doc => {
                        comments.push({ id: doc.id, ...doc.data() });
                    });
                    
                    renderComments(comments);
                    countEl.textContent = comments.length;
                    
                    // Синхронізуємо denormalized count якщо розходиться
                    const localTask = tasks.find(t => t.id === taskId);
                    if (localTask && (localTask.commentCount || 0) !== comments.length) {
                        localTask.commentCount = comments.length;
                        db.collection('companies').doc(currentCompany)
                            .collection('tasks').doc(taskId)
                            .update({ commentCount: comments.length })
                            .catch(() => {});
                    }
                }, error => {
                    console.error('Error loading comments:', error);
                    listEl.innerHTML = '<div class="comments-empty">Помилка завантаження</div>';
                });
        }
        
        // Linkify — convert URLs to clickable links (after escaping HTML)
        function linkifyText(escapedText) {
            if (!escapedText) return '';
            // Match URLs in already-escaped text
            const urlRegex = /(https?:\/\/[^\s<>"']+)/gi;
            return escapedText.replace(urlRegex, function(url) {
                // Trim trailing punctuation that's likely not part of URL
                let cleanUrl = url.replace(/[.,;:!?)]+$/, '');
                let trailing = url.slice(cleanUrl.length);
                return `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer">${cleanUrl}</a>${trailing}`;
            });
        }
        
        // Render comments list
        function renderComments(comments) {
            const listEl = document.getElementById('commentsList');
            const currentUserId = currentUser?.uid;
            
            if (comments.length === 0) {
                listEl.innerHTML = `
                    <div class="comments-empty">
                        <div class="comments-empty-icon"><i data-lucide="message-circle" class="icon icon-xl"></i></div>
                        <span data-i18n="noComments">Ще немає коментарів</span>
                    </div>
                `;
                return;
            }
            
            listEl.innerHTML = comments.map(comment => {
                const isOwn = comment.authorId === currentUserId;
                const time = formatCommentTime(comment.createdAt);
                
                // Escape HTML first, then linkify URLs
                const safeText = linkifyText(escapeHtml(comment.text));
                
                return `
                    <div class="comment-item ${isOwn ? 'own-comment' : ''}">
                        <div class="comment-header">
                            <span class="comment-author">${escapeHtml(comment.authorName || t('unknown'))}</span>
                            <span class="comment-time">${time}</span>
                        </div>
                        <div class="comment-text">${safeText}</div>
                    </div>
                `;
            }).join('');
            
            // Scroll to bottom
            listEl.scrollTop = listEl.scrollHeight;
        }
        
        // Format comment timestamp
        function formatCommentTime(timestamp) {
            if (!timestamp) return '';
            
            const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
            const now = new Date();
            const diff = now - date;
            
            // Less than 1 minute
            if (diff < 60000) return t('justNow');
            
            // Less than 1 hour
            if (diff < 3600000) {
                const mins = Math.floor(diff / 60000);
                return `${mins} хв тому`;
            }
            
            // Today
            if (date.toDateString() === now.toDateString()) {
                return date.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });
            }
            
            // Yesterday
            const yesterday = new Date(now);
            yesterday.setDate(yesterday.getDate() - 1);
            if (date.toDateString() === yesterday.toDateString()) {
                return 'вчора ' + date.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });
            }
            
            // Older
            return date.toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' }) + 
                   ' ' + date.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });
        }
        
        // Send new comment
        async function sendComment() {
            const input = document.getElementById('commentInput');
            const btn = document.getElementById('sendCommentBtn');
            const text = input.value.trim();
            
            if (!text || !currentTaskIdForComments || !currentUser) return;
            
            btn.disabled = true;
            
            try {
                await db.collection('companies').doc(currentCompany)
                    .collection('tasks').doc(currentTaskIdForComments)
                    .collection('comments')
                    .add({
                        text: text,
                        authorId: currentUser.uid,
                        authorName: currentUserData?.name || currentUser.email,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                
                // Denormalized count — для відображення на картці без subcollection query
                db.collection('companies').doc(currentCompany)
                    .collection('tasks').doc(currentTaskIdForComments)
                    .update({ commentCount: firebase.firestore.FieldValue.increment(1) })
                    .catch(() => {}); // non-blocking
                
                // Оновлюємо локально
                const localTask = tasks.find(t => t.id === currentTaskIdForComments);
                if (localTask) localTask.commentCount = (localTask.commentCount || 0) + 1;
                
                input.value = '';
                input.style.height = 'auto';
            } catch (error) {
                console.error('Error sending comment:', error);
                showToast(t('commentSendError'), 'error');
            } finally {
                btn.disabled = false;
            }
        }
        
        // Handle Enter key in comment input
        function handleCommentKeydown(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendComment();
            }
        }
