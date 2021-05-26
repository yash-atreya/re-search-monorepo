require('dotenv').config({
    path: './server.env',
})
const admin = require('firebase-admin');
admin.initializeApp();
const express = require('express');
const cors = require('cors');
const app = express();

// MIDDLEWARE
const adminAuth = require('./middleware/adminAuth');
const checkSaveBody = require('./middleware/save/checkSaveBody');
const checkPrefix = require('./middleware/save/checkPrefix');
const checkRemoveBody = require('./middleware/remove/checkRemoveBody');
const webAuth = require('./middleware/webAuth');
const checkCreateBody = require('./middleware/index/checkCreateBody');
const checkAlterBody = require('./middleware/index/checkAlterBody');
const searchAuth = require('./middleware/searchAuth');
// ROUTES
const saveObjects = require('./routes/save/saveObjects');
const removeObjects = require('./routes/remove/removeObjects');
const search = require('./routes/search/search');
const alterIndex = require('./routes/index/alterIndex');
const createIndex = require('./routes/index/createIndex');
const checkProjectBody = require('./middleware/project/checkProjectBody');
const createProject = require('./routes/project/createProject');

app.use(cors({
    origin: ['https://re-search-liart.vercel.app','http://localhost:3000', 'http://127.0.0.1:3000','*'],
    preflightContinue: false, 
    methods: ['GET', 'POST'],
}))
app.use(express.json({ limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true}))

// HELLO WORLD
app.get('/helloWorld', (req, res) => {
    res.status(200).send('Hello World !').end();
})
// PROJECT
app.post('/createProject', webAuth, checkProjectBody, createProject);

// INDEX
app.post('/createIndex', webAuth, checkCreateBody, createIndex);
app.post('/alterIndex', adminAuth, checkAlterBody, alterIndex);

// SAVE OBJECTS
app.post('/saveObjects', adminAuth, checkSaveBody, checkPrefix, saveObjects);

// REMOVE OBJECTS
app.post('/removeObjects', adminAuth, checkRemoveBody, removeObjects);

// SEARCH
app.get('/search', searchAuth, search);

app.listen(3000, () => {
    console.log('Server Started!');
});