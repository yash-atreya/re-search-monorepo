const isNullOrUndefined = require('@nempet/is-null-or-undefined');
const admin = require('firebase-admin');
const db = admin.firestore();
const auth = admin.auth();

async function webAuth (req, res, next) {
    const {token, uid} = req.body;

    try {
        const decoded = await auth.verifyIdToken(token);
        if(decoded.uid !== uid) {
            res.status(401).json({
                error: true,
                message: 'Unauthorized',
            }).end();
        }

        next();
    } catch(e) {
        console.error('Error in webAuth: ', e);
        res.status(401).json({
            error: true,
            message: 'Unauthorized',
        }).end();
    }
}

module.exports = webAuth;