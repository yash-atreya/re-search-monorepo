const admin = require('firebase-admin');
const db = admin.firestore();
const createClient = require('../../redis/conn');
async function removeObjects(req, res) {
  const { apiKey, projectID, objectIDs, indexName } = req.body;
  console.log(
    JSON.stringify(
      {
        apiKey,
        projectID,
        objectIDs,
        indexName,
      },
      null,
      2
    )
  );

  try {
    const projectCluster = await db.collectionGroup('ProjectsInCluster').where('id', '==', projectID).get();
    let clusterDoc;
    console.log('cluster exists: ', !projectCluster.empty);
    if (!projectCluster.empty) {
      clusterDoc = await projectCluster.docs[0].ref.parent.parent.get();
    }
    console.log(
      'ClusterDoc: ',
      JSON.stringify({
        ...clusterDoc.data(),
      })
    );
    if (!clusterDoc.exists) {
      throw new Error('Cluster DNE for project');
    }
    const ip = clusterDoc.data().external_ip;
    const port = clusterDoc.data().redis_port;
    const db_index = clusterDoc.data().db_index;
    const client = createClient(ip, port, db_index);

    const promises = [];
    client
      .connect()
      .then(() => {
        for (let i = 0, len = objectIDs.length; i < len; i++) {
          promises.push(client.redis.del(projectID + ':' + indexName.toLowerCase() + ':' + objectIDs[i]));
        }
      })
      .catch((e) => {
        console.error('IN saveObjects - DEL', e);
        throw new Error(e);
      });
    await Promise.all(promises);
    console.log('Objects removed!');
    res
      .status(200)
      .json({
        error: false,
        message: 'Success',
        objectIDs,
      })
      .end();
  } catch (e) {
    console.error(e);
    res.status(500).json({
      error: true,
      message: 'Internal server error',
      objectIDs: null,
    });
  }
}

module.exports = removeObjects;
