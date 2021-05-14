const isNullOrUndefined = require('@nempet/is-null-or-undefined');
/**
 * 
 * @param {object} obj 
 */
const hasObjectID = (obj) => {
    if(obj === null || typeof obj === 'undefined') {
        throw new Error('TypeError: Object is null or undefined');
    }
    if(obj.hasOwnProperty('objectID') && (obj['objectID'] !== null && typeof obj['objectID'] !== 'undefined') && typeof obj['objectID'] === 'string') {
        return true;
    } else {
        return false;
    }
}
/**
 * 
 * @param {array} schema - Array of schema objects
 * @returns 
 */
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
        } else if(schema1.field.length === 0 || schema1.field.replace(/\s/g, '').length === 0) {
            return {
                error: true,
                index: i,
                errorType: 'SchemaFieldError: field at index ' + i + ' is empty',
            };
        }
    }
    return {
        error: false,
        index: -1,
        errorType: null,
    };
};

module.exports = {
    hasObjectID,
    checkSchema,
}