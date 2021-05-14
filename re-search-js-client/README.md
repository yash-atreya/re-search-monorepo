# re-search-js

## Installation

```sh
npm install @yashatreya/re-search-js
```

## Usage

```javascript
const ReSearch = require('re-search');

const client = new ReSearch('projectID', 'admin-apiKey','indexName');
```

### Methods

```javascript

/**
 *  Method 1: addSchema()
 *  Equivalent to the `SCHEMA` argument in `FT.CREATE` command of the redis search
 *  This helps the search API know which fields to search from.
 * 
 *  SchemaFieldObject: {
 *    type: 'TEXT' | 'NUMERIC'
 *    field: 'fieldName'
 *    sortable: boolean
 *  }
 * 
 *  client.addSchema(array: SchemaFieldObject[])
 *  Takes array of objects as parameter
 */ 

/**
 * @param {array} array - array of objects
 * @return Promise
 */

client.addSchema([
    {
        type: 'TEXT',
        field: 'fieldName',
        sortable: true,
    },
    {
        type: 'NUMERIC',
        field: 'fieldName',
        sortable: true,
    },
    {
        type: 'NUMERIC',
        field: 'fieldName',
        sortable: true,
    }
]);

```

---

```javascript
/**
 *  Method 2: saveObjects
 *  data = {
 *    objectID: 'string' - This is a mandatory field which has the value of type string. It is a unique ID for your object
 *    [key]: [value]
 *    ....
 *  }
 *  client.saveObjects(array: data[]) - Takes array of objects as parameter
 * 
 *  Currently the saveObjects is limited to only 500 objects per request
 */

const array = require("randomArray.json");

/**
 * @param {array} array - array of objects
 * @return Promise
 */

client.saveObjects(array)
```

---

```javascript
/**
 *  Method 3: removeObjects
 *  
 *  client.removeObjects(array: string[]) - Takes array of strings(objectIDs) as parameter
 * 
 *  @param {array} - array of objectID's
 *  @return Promise
 */
const arr = ['123', '2acfe', 'wvr345'];
client.removeObjects(arr);
```
