const isNullOrUndefined = require('@nempet/is-null-or-undefined');
const scanSchema = (obj) => {
    if (isNullOrUndefined(obj)) {
        throw new TypeError('Object is null or undefined');
    }

    const keys = Object.keys(obj);
    const schemaFields = [];
    for (let i = 0; i < keys.length; i++) {
        const type = assignType(obj[keys[i]]);
        const field = keys[i];
        const sortable = type === 'NUMERIC' ? true : false;
        schemaFields.push({
            type,
            field,
            sortable,
        });
    }

    return schemaFields;
};

const assignType = (val) => {
    switch (typeof val) {
    case 'string':
        return 'TEXT';
    case 'number':
        return 'NUMERIC';
    case 'bigint':
        return 'NUMERIC';
    default:
        return 'TEXT';
    }
};

module.exports = scanSchema;
