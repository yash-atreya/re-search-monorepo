const isNullOrUndefined = require('@nempet/is-null-or-undefined');
const admin = require('firebase-admin');
const db = admin.firestore();

async function searchAuth(req, res, next) {
    const {projectID, indexName, apiKey} = req.query;

    console.log('In search auth: ', JSON.stringify({
        apiKey,
        projectID,
        indexName,
    }, null, 2));

     // CHECK NULLITY
    if(isNullOrUndefined(apiKey, projectID, indexName)) {
        res.status(400).json({
            error: true,
            message: 'Bad Request',
        }).end();
    }

    const keysRef = db.collection('Projects').doc(projectID).collection('Keys');

    try {
        const doc = await keysRef.get();
        if(doc.empty) {
            console.log('keys DNE');
            res.status(401).json({
                error: true,
                message: 'Unauthorized',
            }).end();
        }

        console.log('Comparing key: ', apiKey);

        if(apiKey === doc.docs[0].data().key || apiKey === doc.docs[1].data().key) {
            console.log('Search key Authenticated!');
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

module.exports = searchAuth;