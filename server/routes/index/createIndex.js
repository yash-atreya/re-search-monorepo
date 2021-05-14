const isNullOrUndefined = require('@nempet/is-null-or-undefined');
const admin = require('firebase-admin');
const db = admin.firestore();
const createClient = require('../../redis/conn');

async function createIndex(req, res) {
  const { uid, projectID, indexName, cluster } = req.body;
  console.log(
    'Received Body = ',
    JSON.stringify(
      {
        uid,
        projectID,
        indexName,
        ...cluster,
      },
      null,
      2
    )
  );

  const indexRef = db.collection('Projects').doc(projectID).collection('Indices').doc(indexName.toLowerCase());
  const indexDoc = await indexRef.get();
  if (indexDoc.exists) {
    res.status(200).json({
      error: false,
      message: 'Index already exists',
    });
  }

  const client = createClient(cluster.external_ip, cluster.redis_port); // REDIS CLIENT
  let indexCreated = false;
  let error = false;

  client.connect().then(async () => {
    const redisIndexName = (projectID + ':idx:' + indexName.toLowerCase()).replace(/\s/g, '');
    const prefix = (projectID + ':' + indexName.toLowerCase() + ':').replace(/\s/g, '');
    console.log('PREFIX FOR ', indexName, ' IS ', prefix);
    try {
      const status = await client.create(redisIndexName, [], {
        prefix: [
          {
            count: 1,
            name: prefix,
          },
        ],
      });

      if (status !== 'OK') {
        await client.disconnect();
        throw new Error('IN app/createIndex - Err creating index');
      }
      indexCreated = true;
    } catch (e) {
      console.error('IN createIndex', e);
      res
        .status(500)
        .json({
          error: true,
          message: `${e}`,
        })
        .end();
    }

    if (indexCreated) {
      // WRITE TO FIRESTORE
      const indexID = indexName.toLowerCase();
      const data = {
        id: indexID,
        creationTimestamp: new Date(),
        name: indexName,
        cluster: {
          ...cluster,
        },
        projectID: projectID,
        uid: uid,
        docs_count: 0,
        is_replica: false,
        schema_added: false,
        objects_added: false,
        prefix: prefix,
        redis_name: redisIndexName,
      };
      await indexRef.set(data);
      console.log('Index created!');
      res
        .status(200)
        .json({
          error: false,
          message: 'Success',
          ...data,
        })
        .end();
    }
  });
}

module.exports = createIndex;
