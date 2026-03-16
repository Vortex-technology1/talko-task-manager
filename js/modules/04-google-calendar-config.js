// =====================
        // GOOGLE CALENDAR CONFIG
        // =====================
'use strict';
        const GOOGLE_CLIENT_ID = '181519398491-bdf5etulogchaabvlja3okthr08hl0t1.apps.googleusercontent.com';
        const GOOGLE_SCOPES = 'https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/userinfo.email';
        let googleAccessToken = null;
        let tokenClient = null;
