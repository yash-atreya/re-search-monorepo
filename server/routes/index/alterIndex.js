const admin = require('firebase-admin');
const isNullOrUndefined = require('@nempet/is-null-or-undefined');
const createClient = require('../../redis/conn');
const db = admin.firestore();

async function alterIndex(req, res) {
  const { apiKey, projectID, indexName, schema } = req.body;

  console.log(
    'RECD DATA: ',
    JSON.stringify({
      apiKey,
      projectID,
      indexName,
      schema,
    })
  );

  let cluster;
  // GET CLUSTER
  try {
    const doc = await db.collection('Projects').doc(projectID).get();
    if (!doc.exists) {
      res
        .status(400)
        .json({
          error: true,
          message: 'Project DNE',
        })
        .end();
    }

    cluster = doc.data().cluster;
  } catch (e) {
    console.error('IN search - Error getting cluster', e);
    res
      .status(500)
      .json({
        error: true,
        message: 'Internal Server Error',
      })
      .end();
  }

  if (isNullOrUndefined(cluster)) {
    res
      .status(400)
      .json({
        error: true,
        message: 'Project DNE',
      })
      .end();
  }

  console.log('Cluster', JSON.stringify(cluster, null, 2));

  const promises = [];
  const batch = db.batch();
  const schemaRef = db.collection('Projects').doc(projectID).collection('Indices').doc(indexName.toLowerCase()).collection('Schema');
  const indexRef = db.collection('Projects').doc(projectID).collection('Indices').doc(indexName.toLowerCase());
  const schema_added = await (await indexRef.get()).data().schema_added;
  console.log('SCHEMA_ADDED: ', schema_added);

  // REDIS CLIENT
  const client = createClient(cluster.external_ip, cluster.redis_port, cluster.db_index);

  client.connect().then(async () => {
    client.redis.on('error', e => {
      console.error('IN alterIndex - Error redis: ', e);
      res
        .status(500)
        .json({
          error: true,
          message: 'Internal Server Error',
        })
        .end();
    });

    const schemaIndex = projectID + ':idx:' + indexName.toLowerCase();
    console.log('Altering Index: ', schemaIndex);
    for (let i = 0, len = schema.length; i < len; i++) {
      promises.push(
        client.alter(schemaIndex, schema[i].field, schema[i].type, {
          sortable: schema[i].sortable,
        })
      );
      batch.set(schemaRef.doc(schema[i].field), {
        field: schema[i].field,
        type: schema[i].type,
        sortable: schema[i].sortable,
        creationTimestamp: new Date(),
        indexID: indexName.toLowerCase(),
        projectID,
      });
    }
    if (!schema_added) {
      batch.update(indexRef, {
        schema_added: true,
      });
    }

    await Promise.all(promises);
    await batch.commit();

    console.log('Altered Index Schema');
    res.status(200).json({
      error: false,
      message: 'Success',
    });
  }).catch(e => {
    console.error('IN alterIndex - Error redis: ', e);
    res.status(500).json({
        error: true,
        message: `${e}`,
      });
  }).finally(() => {
      client.disconnect();
  });
}

module.exports = alterIndex;
