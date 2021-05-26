const admin = require('firebase-admin');
const db = admin.firestore();
// COMPUTE
const Compute = require('@google-cloud/compute');
const startupscript = require('./startupscript');
const compute = new Compute({
  projectId: 'redis-search',
  keyFilename: './routes/project/createComputeInstances.json',
});
// UTILS
const { v5: uuidv5 } = require('uuid');
const { uniqueNamesGenerator, names, NumberDictionary } = require('unique-names-generator');
const numbersDict = NumberDictionary.generate({ min: 0, max: 9 });
const logger = require('../../logger');

async function createProject(req, res) {
  const { projectFormData, uid } = req.body;
  const projectID = createProjectID();

  console.log(
    JSON.stringify(
      {
        projectData: {
          name: projectFormData.name,
          cluster: projectFormData.cluster,
        },
        uid,
        projectID,
      },
      null,
      2
    )
  );

  // CREATE COMPUTE/REDIS INSTANCE
  let vm;
  let vm_created = false;
  let err = false;

  try {
    vm = await createVMWithStartupScript(projectFormData.cluster);
    if (vm === null) {
      throw new Error('Vm is null');
    }
    vm_created = true;
    console.log('Getting VM metadata');
    const data = await vm.getMetadata();
    var metadata = {
      id: data[0].id,
      creationTimestamp: data[0].creationTimestamp,
      name: data[0].name,
      external_ip: data[0].networkInterfaces[0].accessConfigs[0].natIP,
      redis_port: '6379',
    };
  } catch (e) {
    err = true;
    console.error('IN app/createProject: ', e);
    res
      .status(500)
      .json({
        error: true,
        message: 'Error creating VM',
        projectID: null,
      })
      .end();
    return;
  } finally {
    if (err && vm) {
      console.log('Deleting VM..');
      vm.delete()
        .then(() => console.log('VM Deleted!'))
        .catch((e) => console.error('IN app/createProject - Delete VM: ', e));
    }
  }

  // WRITE TO FIRESTORE
  const projectData = {
    projectID: projectID,
    name: projectFormData.name,
    uid: uid,
    pricing_plan: 'free',
    cluster: {
      ...metadata,
      redis_auth_key: process.env.REDIS_AUTH_KEY,
      zone: projectFormData.cluster,
      machine_type: 'e2-medium',
    },
    admin_key: generateAPIKey('admin', projectID, uid),
    search_key: generateAPIKey('search', projectID, uid),
  };

  console.log('PROJECT DATA = ', JSON.stringify(projectData, null, 2));

  try {
    const status = await writeProjectToFirestore(projectData);
    if (status === null) {
      throw new Error('status = null, Unable to create project');
    }
    console.log('Project created');
    res
      .status(200)
      .json({
        error: false,
        message: 'Success',
        projectID,
      })
      .end();
    return;
  } catch (e) {
    console.error('IN app/createProject/writeProjectToFirestore: ', e);
    res
      .status(500)
      .json({
        error: true,
        message: 'Error creating project',
        projectID: null,
      })
      .end();
    return;
  }
}

/**
 * @return {string} Unique projectID string
 */
const createProjectID = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let str = '';
  for (let i = 0; i < 10; i++) {
    str = str.concat(chars.charAt(Math.floor(Math.random() * 36)));
  }
  return str;
};

/**
 *
 * @param {string} cluster
 * @param {string} projectID
 * @param {string} uid
 * @returns {object | null} VM object or null
 */

const createVMWithStartupScript = async (cluster) => {
  const zone = compute.zone(cluster);
  logger.info('Creating VM...');
  const str = instanceNameGenerator();
  console.log('VM name: ', str);
  const [vm, operation] = await zone.createVM(str, {
    os: 'debian',
    http: true,
    https: true,
    machineType: 'e2-medium',
  });

  console.log('VM Object: ', JSON.stringify({ id: vm.id, name: vm.name }, null, 2));

  try {
    logger.info('Awaiting Operation');
    await operation.promise();
    logger.info('VM created');
    console.log('Adding Metadata: ');
    await vm.setMetadata({
      'startup-script': startupscript,
    });
    console.log('Metadata added');

    return vm;
  } catch (e) {
    logger.error('IN app/createProject/createVMWithStartupScript \n', e);
    return null;
  }
};

/**
 *
 * @return {string}
 */
 const instanceNameGenerator = () => {
    const str = uniqueNamesGenerator({
        dictionaries: [names, numbersDict],
        separator: '-',
        length: 2,
    });

    return str.toLowerCase();
};

/**
 * WRITE PROJECT TO FIRESTORE
 * @param {object} projectData
 * @field projectID {string}
 * @field name {string}
 * @field cluster {object}
 */
 const writeProjectToFirestore = async (projectData) => {
    // REFS

    const projectRef = db.collection('Projects').doc(projectData.projectID);
    const clusterRef = db.collection('Clusters').doc(projectData.cluster.id);
    const apiAdminKeyRef = projectRef.collection('Keys').doc('admin');
    const apiSearchKeyRef = projectRef.collection('Keys').doc('search');
    const projectInClusterRef = clusterRef.collection('ProjectsInCluster').doc(projectData.projectID);

    // WRITES

    const clusterDoc = {
        id: projectData.cluster.id,
        creationTimestamp: projectData.cluster.creationTimestamp,
        name: projectData.cluster.name,
        zone: projectData.cluster.zone,
        external_ip: projectData.cluster.external_ip,
        redis_port: projectData.cluster.redis_port,
        machine_type: projectData.cluster.machine_type,
        redis_auth_key: projectData.cluster.redis_auth_key,
        db_index: 0,
    };

    const projectDoc = {
        id: projectData.projectID,
        name: projectData.name,
        creationTimestamp: admin.firestore.Timestamp.now(),
        uid: projectData.uid,
        cluster_count: 1,
        indices_count: 0,
        pricing_plan: projectData.pricing_plan,
        is_billing_enabled: false,
        cluster: {
            ...clusterDoc,
        },
    };

    const projectInClusterDoc = {
        id: projectData.projectID,
        name: projectData.name,
        uid: projectData.uid,
    };
    const apiAdminKeyDoc = {
        type: 'admin',
        key: projectData.admin_key,
        creationTimestamp: admin.firestore.Timestamp.now(),
        uid: projectData.uid,
    };
    const apiSearchKeyDoc = {
        type: 'search',
        key: projectData.search_key,
        creationTimestamp: admin.firestore.Timestamp.now(),
        uid: projectData.uid,
    };

    // BATCH
    const batch = db.batch();
    batch.set(projectRef, projectDoc);
    batch.set(clusterRef, clusterDoc, {merge: true});
    batch.set(projectInClusterRef, projectInClusterDoc);
    batch.set(apiAdminKeyRef, apiAdminKeyDoc);
    batch.set(apiSearchKeyRef, apiSearchKeyDoc);

    try {
        await batch.commit();
        console.log('Batch Written');
        return {status: 'OK'};
    } catch (e) {
        console.error('IN app/createProject/writeProjectToFirestore: ', e);
        return null;
    }
};

const generateAPIKey = (type, projectID, uid) => {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const partUid = uid.slice(0, 14);
    const NAME = timestamp + '-' + type + '-' + partUid + '-' + projectID;
    const NAMESPACE = 'e7543e66-c7cb-4ce8-abcc-ed02b7fd94fc';
    const key = uuidv5(NAME, NAMESPACE);

    return key;
};

module.exports = createProject;
