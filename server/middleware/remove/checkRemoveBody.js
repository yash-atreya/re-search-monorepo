const isNullOrUndefined = require('@nempet/is-null-or-undefined');

function checkRemoveBody(req, res, next) {
  const { objectIDs, indexName } = req.body;

  if (isNullOrUndefined(objectIDs, indexName)) {
    res
      .status(400)
      .json({
        error: true,
        message: 'Bad Request',
      })
      .end();
  }

  if (!Array.isArray(objectIDs)) {
    res
      .status(400)
      .json({
        error: true,
        message: 'objectIDs should be an array',
      })
      .end();
  }

  for(let i = 0; i < objectIDs.length; i++) {
      if(typeof objectIDs[i] !== 'string') {
        res
        .status(400)
        .json({
          error: true,
          message: `objectID at index ${i} is not a string`,
        })
        .end();
        break;
      }
  }
  console.log('Remove body checked!');
  next();
}

module.exports = checkRemoveBody;
