const {default: axios} = require('axios');
const {checkSchema, hasObjectID} = require('./utils');
/**
 * @class ReSearch
 */
class ReSearch {
    // ATTRIBUTES
    appID = null;
    apiKey = null;
    index = null;
    SAVE_URL = 'https://re-search.eu.ngrok.io/saveObjects';
    REMOVE_URL = 'https://re-search.eu.ngrok.io/removeObjects';
    ALTER_INDEX_URL = 'https://re-search.eu.ngrok.io/alterIndex';
    // METHODS
    /**
     * @param {string} appID - your projectID
     * @param {string} apiKey - admin apiKey of this project
     * @param {string} index - the indexName/ID you wish to upload the objects to.
     */
    constructor(appID, apiKey, index) {
        this.apiKey = apiKey;
        this.appID = appID;
        this.index = index;
    }

    // SAVE

    async saveObjects (array = []) {
        if(array.length === 0) {
            throw new Error('Array of objects is empty');
        }
        if(array.length > 500) {
            throw new Error('Number of objects per request should be <= 500');
        }
        for(let i = 0; i < array.length; i++) {
            if(!hasObjectID(array[i])) {
                throw new Error(`Object at index ${i} does not have an objectID`);
            }
        }
        const result = await axios.post(`${this.SAVE_URL}`, {
            objects: array,
            apiKey: this.apiKey,
            indexName: this.index,
            projectID: this.appID,
        });
        return result.data;
    }

    // REMOVE

    async removeObjects(array = []) {
        if(array.length === 0) {
            throw new Error('Array of objectIDs is empty');
        }
        if(array.length > 500) {
            throw new Error('Number of objectIDs per request should be <= 500');
        }
        for(let i = 0; i < array.length; i++) {
            const type = typeof array[i];
            if(type !== 'string' || type === 'undefined' || array[i] === null) {
                throw new TypeError(`objectID at index ${i} is not a string`);
            }
        }

        const result = await axios.post(`${this.REMOVE_URL}`, {
            objectIDs: array,
            apiKey: this.apiKey,
            indexName: this.index,
            projectID: this.appID,
        })
        console.log('Result: ', result.data);
        return result.data;
    }

    // ADD SCHEMA

    async addSchema (schemaObjects = []) {
        if(schemaObjects.length === 0) {
            throw new Error('Array of schemaObjects is empty');
        }
        if(schemaObjects.length > 100) {
            throw new Error('Number of schemaObjects per request should be <= 100');
        }

        const checked = checkSchema(schemaObjects);
        console.log('Checked: ', checked);
        if(checked.error) {
            throw new Error(checked.errorType);
        }

        try {
            const result = await axios.post(this.ALTER_INDEX_URL, {
                schema: schemaObjects,
                indexName: this.index,
                apiKey: this.apiKey,
                projectID: this.appID,
            });

            if(result.status === 200) {
                return result.data.message;
            }
        } catch(e) {
            console.log('error in req ', e);
            throw new Error(e);
        }
    }
}

module.exports = ReSearch;