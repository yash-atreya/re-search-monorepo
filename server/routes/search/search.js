const isNullOrUndefined = require('@nempet/is-null-or-undefined');
const admin = require('firebase-admin');
const db = admin.firestore();
const createClient = require('../../redis/conn');
const queryParser = require('./queryParser');

async function search(req, res) {
  const { projectID, indexName, limit, offset, q } = req.query;
  let { retrieveAllWhenEmpty } = req.query;

  const query = queryParser(q);

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

  console.log('Cluster', JSON.stringify(cluster, null, 2));

  if (isNullOrUndefined(cluster)) {
    res
      .status(400)
      .json({
        error: true,
        message: 'Project DNE',
      })
      .end();
  }

  //
  if (isNullOrUndefined(retrieveAllWhenEmpty)) {
    retrieveAllWhenEmpty = true;
  }

  if (retrieveAllWhenEmpty === false && (isNullOrUndefined(query) || query.length === 0 || query.replace(/\s\\g/, '').length === 0)) {
    res
      .status(200)
      .json({
        hits: [],
        error: false,
        hits_count: 0,
      })
      .end();
  }

  const client = createClient(cluster.external_ip, cluster.redis_port, cluster.db_index);

  client
    .connect()
    .then(() => {
      client.redis.on('error', e => {
        console.error('IN search - Error redis: ', e);
        res
          .status(500)
          .json({
            error: true,
            message: 'Internal Server Error',
          })
          .end();
      });

      const searchIndex = projectID + ':idx:' + indexName.toLowerCase();
      const commands = [searchIndex, query];
      if (Number(limit)) {
        commands.push('LIMIT');
        if (Number(offset)) {
          commands.push(Number(offset));
        } else {
          commands.push(0);
        }
        commands.push(Number(limit));
      }
      const start = Date.now();
      client
        .sendCommand('FT.SEARCH', commands)
        .then((results) => {
            const timeTaken = Date.now() - start;
            console.log('Timetaken ', timeTaken);
          if (results === 0 || results.length === 0) {
            res
              .status(200)
              .json({
                hits: [],
                error: false,
                hits_count: 0,
                next_offset: 0,
              })
              .end();
          }

          if (!Array.isArray(results)) {
            res
              .status(500)
              .json({
                hits: [],
                error: true,
                hits_count: 0,
                next_offset: 0,
              })
              .end();
            return;
          }
          const count = results.shift();
          console.log('num of result', count);
          if (isNullOrUndefined(count)) {
            res
              .status(200)
              .json({
                hits: [],
                error: false,
                hits_count: 0,
                next_offset: 0,
              })
              .end();
            return;
          }

          // PROCESSING RESULTS
          const hits = [];
          if (count > 0 && results.length % 2 === 0) {
            for (let i = 0; i < results.length; i += 2) {
              let data = {};
              if (i % 2 === 0 && !Array.isArray(results[i])) {
                data = transformArrayToObject(results[i + 1]);
                hits.push(data);
              }
            }
          }

          res
            .status(200)
            .json({
              hits: hits,
              error: false,
              next_offset: Number(offset) + Number(limit),
            })
            .end();
        })
        .catch((e) => {
          console.error('IN search error redis: ', e);
          res
            .status(500)
            .json({
              hits: [],
              error: e,
              next_offset: 0,
            })
            .end();
        })
        .finally(() => {
          client.disconnect();
        });
    })
    .catch((e) => {
      console.error('IN search error redis: ', e);
      res
        .status(500)
        .json({
          hits: [],
          error: true,
          next_offset: 0,
        })
        .end();
    });
}

const transformArrayToObject = (a) => {
  const data = {};

  for (let i = 0, len = a.length; i < len && len % 2 === 0; i += 2) {
    data[a[i]] = isString(a[i + 1]) ? a[i + 1] : JSON.parse(a[i + 1]);
  }

  return data;
};
const isString = (val) => {
  try {
    JSON.parse(val);
    return false;
  } catch (e) {
    return true;
  }
};

module.exports = search;
