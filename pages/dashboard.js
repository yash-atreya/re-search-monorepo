import styles from '../styles/Home.module.css';
import Head from 'next/head';
import { useRouter } from 'next/router';
import firebase from '../config/firebase';
import axios from 'axios';
import ProjectComponent from '../components/ProjectComponent';
import CreateNewProject from '../components/CreateNewProject';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect, useState } from 'react';
const { auth, firestore } = firebase;
// COMPONENTS
import ListBoxComponent from '../components/ListBox';
import { useAppContext } from '../context';
const clusters = [
  'asia-south1-a',
  'asia-northeast1-a',
  'asia-east2-a',
  'asia-northeast3-a',
  'australia-southeast1-b',
  'northamerica-northeast1-b',
  'us-central1-c',
  'us-east4-a',
  'us-west1-a',
  'europe-west3-b',
  'europe-west2-b',
  'europe-north1-a',
  'europe-west1-b',
  'southamerica-east1-b',
];
function Dashboard({projects, error}) {
  // UID
  const { uid } = useAppContext();
  // ROUTER
  const router = useRouter();
  // STATE
  
  // FOR createProject form name, cluster(zone);
  const [name, setName] = useState(null);
  const [cluster, setCluster] = useState(clusters[0]);
  // PROCESS
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(false);

  let [isOpen, setIsOpen] = useState(false);

  function closeModal() {
    setIsOpen(false);
  }


  function openModal() {
    setIsOpen(true);
  }

  const handleCreateProject = async () => {
    // e.preventDefault();
    setCreating(true);
    try {
      const token = await auth().currentUser.getIdToken();
      const res = await axios.post(
        `${process.env.NGROK_URL}/createProject`,
        {
          projectFormData: {
            name: name,
            cluster: cluster,
          },
          uid: auth().currentUser.uid,
          token: token,
        }
      );
      if (res.status === 200) {
        router.push(`/project/${res.data.projectID}?uid=${uid}&token=${token}`, `/project/${res.data.projectID}`);
      } else {
        throw new Error(res.data);
      }
    } catch (e) {
      // console.error(e);
    } finally {
      setCreating(false);
      // closeModal();
    }
  };

  const onChangeCluster = (cluster) => {
    setCluster(cluster);
  };
  return (
    <div className={styles.main}>
      <Head>
        <title>Dashboard</title>
      </Head>
      <CreateNewProject onClick={openModal} />
      <div>
        <p className={styles.existingProjectsSH}>Existing Projects:</p>
        {projects.length > 0 ? (
          <div className={styles.allProjectsContainer}>
            {projects.map((project, index) => {
              return <ProjectComponent projectName={project.name} id={project.id} key={index} />;
            })}
          </div>
        ) : (
          <p>{error ? 'Oops! Looks like something went wrong' : 'You have not created any projects yet'}</p>
        )}
      </div>
      <>
        <Transition appear show={isOpen} as={Fragment}>
          <Dialog as="div" className="fixed inset-0 z-10 overflow-y-auto" onClose={closeModal}>
            {/* Use the overlay to style a dim backdrop for your dialog */}
            <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
            <div className="min-h-screen px-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Dialog.Overlay className="fixed inset-0" />
              </Transition.Child>

              {/* This element is to trick the browser into centering the modal contents. */}
              <span className="inline-block h-screen align-middle" aria-hidden="true">
                &#8203;
              </span>
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900" style={{ marginBottom: 24 }}>
                    Create Project
                  </Dialog.Title>
                  <div className="mt-2">
                    <form>
                      <input required className={styles.input} placeholder="Project name" onChange={(e) => setName(e.target.value)} />
                      <ListBoxComponent data={clusters} onChangeValue={onChangeCluster} />
                    </form>
                  </div>

                  <div className="mt-4">
                    <button
                      type="button"
                      className="inline-flex justify-center px-4 py-2 text-sm font-medium text-blue-900 bg-blue-100 border border-transparent rounded-md hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                      style={{ marginRight: 12 }}
                      onClick={handleCreateProject}
                    >
                      {creating ? 'Creating...just a minute' : 'Create'}
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center px-4 py-2 text-sm font-medium text-red-900 bg-red-100 border border-transparent rounded-md hover:bg-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-500"
                      onClick={closeModal}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition>
      </>
    </div>
  );
}

export default Dashboard;

export async function getServerSideProps(context) {
  const {uid, token} = context.query;
  if(uid) {
    const ref = firestore().collection('Projects').where('uid', '==', uid);
    try {
      const docSnaps = await ref.get();
      if(docSnaps.empty) {
        return {
          props: {
            projects: [],
            error: false,
          }
        }
      }

      const projects = docSnaps.docs.map((project, key) => {
        return {
          ...project.data(),
          creationTimestamp: project.data().creationTimestamp.toString(),
        }
      });

      return {
        props: {
          projects: projects,
          error: false,
        }
      }
    } catch (e) {
      return {
        props: {
          projects: [],
          error: true,
        }
      }
    }
  }
  
  return {
    props: {
      projects: [],
      error: false,
    }
  }
}