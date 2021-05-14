const isNullOrUndefined = require('@nempet/is-null-or-undefined');
const admin = require('firebase-admin');
const logger = require('../logger');
const db = admin.firestore();
async function adminAuth(req, res, next) {
    const {apiKey, projectID} = req.body;
    // CHECK NULLITY
    if(isNullOrUndefined(apiKey, projectID)) {
        res.status(400).json({
            error: true,
            message: 'Bad Request',
        }).end();
    }
    
    const adminKeyRef = db.collection('Projects').doc(projectID).collection('Keys').doc('admin');

    try {
        const doc = await adminKeyRef.get();
        if (!doc.exists) {
            console.log('admin key DNE');
            res.status(401).json({
                error: true,
                message: 'Unauthorized',
            }).end();
        }
        console.log('Comparing key: ', apiKey, ' to ', doc.data().key);
        if (doc.data().key === apiKey) {
            console.log('Authenticated!');
            next();
        } else {
            res.status(401).json({
                error: true,
                message: 'Unauthorized',
            }).end();
        }
    } catch (e) {
        console.error('IN saveObjects: ', e);
        res.status(401).json({
            error: true,
            message: 'Unauthorized',
        }).end();
    }

}

module.exports = adminAuth;