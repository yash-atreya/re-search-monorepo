const admin = require('firebase-admin');
const logger = require('../../logger');
const db = admin.firestore();
const createClient = require('../../redis/conn');
const saveObjects = async (req, res) => {
  const { projectID, indexName, objects } = req.body;
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
    console.log(
      'Cluster: ',
      JSON.stringify({
        ip,
        port,
        db_index,
      })
    );
    const promises = [];
    const objectIDs = [];
    const start = Date.now();
    client
      .connect()
      .then(async () => {
        for (let i = 0, len = objects.length; i < len; i++) {
          promises.push(client.redis.hset(projectID + ':' + indexName.toLowerCase() + ':' + objects[i].objectID, transformObjectForHash(objects[i])));
        }
      })
      .catch((e) => {
        console.error('IN saveObjects - HSET', e);
        throw new Error(e);
      });
    await Promise.all(promises);
    const timeTaken = Date.now() - start + 'ms';
    console.log('Objects written!');
    const objects_added = await db.collection('Projects').doc(projectID).collection('Indices').doc(indexName.toLowerCase()).update({
      objects_added: true,
    });
    res
      .status(200)
      .json({
        error: false,
        message: 'Success',
        objectIDs,
        timeTaken,
      })
      .end();
    return;
  } catch (e) {
    console.error('IN saveObjects', e);
    res.status(500).json({
      error: true,
      message: 'Internal server error',
      objectIDs: null,
    });
  }
};

const transformObjectForHash = (obj) => {
  const keys = Object.keys(obj);
  for (let i = 0, len = keys.length; i < len; i++) {
    if (Array.isArray(obj[keys[i]]) || typeof obj[keys[i]] === 'object') {
      obj[keys[i]] = JSON.stringify(obj[keys[i]]);
    }
  }
  return obj;
};

module.exports = saveObjects;
