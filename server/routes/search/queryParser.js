const isNullOrUndefined = require('@nempet/is-null-or-undefined');
function queryParser(q) {
  const query = isNullOrUndefined(q) || q === '*' || q.replace(/\s/g, '').length === 0 ? '*' : q.length === 1 ? '%' + q + '%' : q + '*';

  return query;
}

module.exports = queryParser;
