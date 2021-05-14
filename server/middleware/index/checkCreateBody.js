const isNullOrUndefined = require('@nempet/is-null-or-undefined');

function checkCreateBody(req, res, next) {
    const {uid, projectID, cluster, indexName} = req.body;

    console.log('RECD DATA: ', JSON.stringify({
        uid,
        projectID,
        cluster,
        indexName,
    }));

    if(isNullOrUndefined(uid, projectID, cluster, indexName, cluster.external_ip, cluster.redis_port, cluster.db_index)) {
        res.status(400).json({
            error: true,
            message: 'Bad Request',
        }).end();
    }
    next();
}

module.exports = checkCreateBody;