const isNullOrUndefined = require('@nempet/is-null-or-undefined');
function checkSaveBody (req, res, next)  {
  const { objects, indexName } = req.body;

  if (isNullOrUndefined(objects, indexName)) {
    res.status(400).json({
      error: true,
      message: 'Bad Request',
    }).end();
  }

  if (!Array.isArray(objects)) {
    res
      .status(400)
      .json({
        error: true,
        message: 'objects should be an array',
        objectIDs: null,
      })
      .end();
  }

  for (let i = 0; i < objects.length; i++) {
    if (!hasObjectID(objects[i])) {
      console.log(`objectID is not present at index ${i}`);
      res
        .status(400)
        .json({
          error: true,
          message: `objectID is not present at index ${i}`,
          objectIDs: null,
        })
        .end();
    }
  }
  console.log('elements are not null');
  next();
};

/**
 *
 * @param {object} obj
 * @return {boolean}
 */
 const hasObjectID = (obj) => {
    if (obj === null || typeof obj === 'undefined') {
        throw new Error('TypeError: Object is null or undefined');
    }
    if (obj.hasOwnProperty('objectID') && obj['objectID'] !== null && typeof obj['objectID'] !== 'undefined' && typeof obj['objectID'] === 'string') {
        return true;
    } else {
        return false;
    }
};

module.exports = checkSaveBody;
