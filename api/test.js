module.exports = (req, res) => {
    res.status(200).json({
        ok: true,
        env: {
            hasProjectId: !!process.env.FIREBASE_PROJECT_ID,
            hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
            hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
            pkStart: (process.env.FIREBASE_PRIVATE_KEY || '').substring(0, 30),
            pkLength: (process.env.FIREBASE_PRIVATE_KEY || '').length,
        }
    });
};
