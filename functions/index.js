/* eslint-disable camelcase */
/* eslint-disable no-new-wrappers */
/* eslint-disable keyword-spacing */
/* eslint-disable no-prototype-builtins */
/* eslint-disable max-len */
/* eslint-disable indent */
/* eslint-disable quotes */
// FIREBASE IMPORTS
const functions = require('firebase-functions');
const admin = require('firebase-admin');
/**
 * FIREBASE INITIALISATION
 */
admin.initializeApp();
const db = admin.firestore();

// UTILS
const isNullOrUndefined = require('@nempet/is-null-or-undefined');


/**
 * GET - getProjects
 */

exports.getProject = functions.https.onRequest(async (req, res) => {
  const {projectID, uid} = req.query;
  console.log('Getting project...', projectID, uid);

  const result = {
    projectData: null,
    indices: [],
    apiKeys: [],
    error: false,
  };
  if(isNullOrUndefined(projectID, uid)) {
    res.status(400).json({
      ...result,
      error: true,
      message: 'Bad Request',
    }).end();
    throw new Error('projectID is null or undefined');
  }

  const projectRef = db.collection('Projects').doc(projectID);
  const indicesRef = projectRef.collection('Indices');
  const keysRef = projectRef.collection('Keys');

  try {
    const projectDoc = await projectRef.get();
    if(projectDoc.exists) {
        result.projectData = projectDoc.data();
    }
    const indicesDocs = await indicesRef.get();

    if(!indicesDocs.empty) {
      result.indices = indicesDocs.docs.map((doc, index) => {
        return {
          ...doc.data(),
        };
      });
    }

    const keysDocs = await keysRef.get();
    if(!keysDocs.empty) {
      result.apiKeys = keysDocs.docs.map((keyDoc, index) => {
        return {
          ...keyDoc.data(),
        };
      });
    }

    res.status(200).json(result).end();
    return;
  } catch (e) {
    console.error(e);
    res.status(500).json({
      ...result,
      error: true,
    }).end();
    return;
  }
});
/**
 *
 * CLOUD FUNCTIONS
 *
 */

exports.onCreateUser = functions.auth.user().onCreate(async (user, context) => {
  console.log('USer', user.toJSON());

  const ref = db.collection('Users').doc(user.uid);

  try {
    await ref.set({
      uid: user.uid,
      email: user.email ? user.email : null,
      project_count: 0,
      creationTimestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
  } catch (e) {
    console.error('IN onCreateUser: ', e);
  }

  return;
});
exports.verifyStartupScript = functions.https.onRequest(async (req, res) => {
  const {external_ip, authKey} = req.body;
  console.log('EXTERNAL IP: ', external_ip, ' KEY: ', authKey);
  console.log('functions auth key: ', functions.config().startup_script.authkey);
  if (authKey !== functions.config().startup_script.authkey) {
    console.warn('IN verifyStartupScript', 'Unauthorised attempt');
    res.status(401).end();
    return;
  }
  try {
    const ref = db.collection('Clusters').where('external_ip', '==', external_ip);
    const docs = await ref.get();

    if (docs.empty) {
      throw new Error('Cluster DNE');
    }
    const doc = docs.docs[0];

    console.log('Found cluster: ', JSON.stringify({
      ...doc.data(),
    }, null, 2));
    await db.collection('Clusters').doc(doc.id).update({
      startup_script_successful: true,
    });

    res.status(200).end();
    return;
  } catch (e) {
    console.error('IN verifyStartupScript', e);
    res.status(500).end();
  }
});

