// =====================
        // AUTO-GENERATE REGULAR TASKS
        // =====================
        let myDayPopupShown = false;
        
        // Хелпер: перевірка чи регулярне завдання заплановане на певний день
        function isRegularTaskDay(rt, date) {
            const day = date.getDay(); // 0-6
            const dateNum = date.getDate(); // 1-31
            
            if (rt.period === 'daily') return true;
            
            if (rt.period === 'weekly') {
                if (rt.daysOfWeek && Array.isArray(rt.daysOfWeek)) {
                    return rt.daysOfWeek.includes(day.toString());
                }
                return rt.dayOfWeek === day.toString();
            }
            
            if (rt.period === 'monthly') {
                if (rt.dayOfMonth === 'last') {
                    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
                    return dateNum === lastDay;
                }
                return dateNum === parseInt(rt.dayOfMonth);
            }
            
            if (rt.period === 'quarterly') {
                const quarterStartMonth = Math.floor(date.getMonth() / 3) * 3;
                if (date.getMonth() !== quarterStartMonth) return false;
                if (rt.dayOfMonth === 'last') {
                    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
                    return dateNum === lastDay;
                }
                return dateNum === parseInt(rt.dayOfMonth);
            }
            
            return false;
        }
