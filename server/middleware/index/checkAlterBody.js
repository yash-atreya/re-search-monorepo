const isNullOrUndefined = require('@nempet/is-null-or-undefined');

function checkAlterBody(req, res, next) {
  const { projectID, indexName, schema } = req.body;
  if (isNullOrUndefined(projectID, indexName, schema)) {
    res
      .status(400)
      .json({
        error: true,
        message: 'Bad Request',
      })
      .end();
  }

  if (!Array.isArray(schema)) {
    res
      .status(400)
      .json({
        error: true,
        message: 'Schema should be an array of objects',
      })
      .end();
  }

  if (schema.length > 100) {
    res
      .status(400)
      .json({
        error: true,
        message: 'Cannot add more than 100 fields in one request',
      })
      .end();
  }

  const checkedSchema = checkSchema(schema);

  if (checkedSchema.error) {
    res
      .status(400)
      .json({
        error: true,
        message: `Schema parsing error at index: ${checkedSchema.index}`,
      })
      .end();
  }
  console.log('Alter Body Checked!');
  next();
}

const checkSchema = (schema = []) => {
  const len = schema.length;
  for (let i = 0; i < len; i++) {
    const schema1 = schema[i];
    if (isNullOrUndefined(schema1.field, schema1.type, schema1.sortable)) {
      return {
        error: true,
        index: i,
        errorType: 'TypeError: one or more keys in schema is null or undefined at index: ' + i,
      };
    } else if (schema1.type !== 'TEXT' && schema1.type !== 'NUMERIC' && schema1.type !== 'GEO' && schema1.type !== 'TAG') {
      return {
        error: true,
        index: i,
        errorType: 'SchemaTypeError: type of field is not correct, should be one of TEXT, NUMERIC, GEO, TAG at index: ' + i,
      };
    }
  }
  return {
    error: false,
    index: -1,
    errorType: null,
  };
};

module.exports = checkAlterBody;
