const admin = require('firebase-admin');
const logger = require('../../logger');
const db = admin.firestore();
async function checkPrefix(req, res, next) {
    const {projectID, indexName} = req.body;

    const indexRef = db.collection('Projects').doc(projectID).collection('Indices').doc(indexName.toLowerCase());

    try {
        const doc = await indexRef.get();

        if(!doc.exists) {
            res.status(500).json({
                error: true,
                message: `index: ${indexName} does not exist`,
            }).end();
        }
        const incomingPrefix = projectID + ':' + indexName.toLowerCase() + ':'
        if(incomingPrefix !== doc.data().prefix) {
            res.status(400).json({
                error: true,
                message: `incoming indexName: ${indexName} does not match existing prefix`,
            }).end();
        }
    } catch(e) {
        logger.error('IN checkPrefix: ', e);
        res.status(500).json({
            error: true,
            message: `Internal server error`,
        }).end();
    }
    console.log('Prefix checked!');
    next();
}
module.exports = checkPrefix;