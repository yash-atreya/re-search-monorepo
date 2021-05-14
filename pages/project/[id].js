import React from 'react';
import { useEffect, useState, Fragment } from 'react';
import moment from 'moment';
import firebase from '../../config/firebase';
import styles from '../../styles/Home.module.css';
import LogOut from '../../components/LogOut';
import ChangeProject from '../../components/ChangeProject';
import Search from '../../components/Search';
import { Dialog, Transition } from '@headlessui/react';
import API_Keys from '../../components/API_Keys';
import API_Heading from '../../components/API_Heading';
import Code from '../../components/Code';
import IndiceCell from '../../components/IndiceCell';
import axios from 'axios';
import { useAppContext } from '../../context';
function Project({ projectID, projectData, initial_indices, apiKeys, error }) {
  // console.log(JSON.stringify({
  //   ...projectData,
  // }, null, 2));
  // UID
  const { uid } = useAppContext();
  const name = projectData && projectData.name ? projectData.name : null;

  // STATE
  // const [name, setName] = useState(null);
  const [err, setErr] = useState(false);
  const [indices, setIndices] = useState([]);
  const [loading, setLoading] = useState(false);
  // const [apiKeys, setApiKeys] = useState([]);
  const [creating, setCreating] = useState(false);
  const [indexName, setIndexName] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [hits, setHits] = useState([]);
  const [diff, setDiff] = useState(null);

  useEffect(() => {
    if(projectData && projectData.creationTimestamp) {
      const creationTimestamp = projectData && projectData.creationTimestamp ? moment(new Date(projectData.creationTimestamp._seconds * 1000)) : null;
      const now = moment();
      setDiff(now.diff(creationTimestamp, 'minutes'));
    }
  }, [projectData])
  useEffect(() => {
      setIndices(initial_indices);
  }, []);
  useEffect(() => {
    if(indices && indices.length > 0) {
      setSelectedIndex(indices[0]);
    }
  }, [indices])
  let [isOpen, setIsOpen] = useState(false);


  useEffect(() => {
      setHits([]);
  }, [selectedIndex])
  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    setIsOpen(true);
  }

  let [isOpen2, setIsOpen2] = useState(false);

  function closeModal2() {
    setIsOpen2(false);
  }

  function openModal2() {
    setIsOpen2(true);
  }

  let [isOpen3, setIsOpen3] = useState(false);

  function closeModal3() {
    setIsOpen3(false);
  }

  function openModal3() {
    setIsOpen3(true);
  }

  const onSelectIndex = (index) => {
    setSelectedIndex(index);
    closeModal2();
  };

  async function onCreateIndex() {
    setCreating(true);
    try {
      const token = await firebase.auth().currentUser.getIdToken();
      const result = await axios.post(
        `${process.env.NGROK_URL}/createIndex`,
        {
          uid: firebase.auth().currentUser.uid,
          projectID: projectID,
          indexName: indexName,
          cluster: {
            ...projectData.cluster,
          },
          apiKey: apiKeys[0].key,
          token: token,
        }
      );
      if (result.status === 200) {
        const newIndex = result.data;
        delete newIndex['error'];
        delete newIndex['message'];
        const newIndices = indices;
        newIndices.push(newIndex);
        setIndices(newIndices);
        setSelectedIndex(newIndex);
      }
    } catch (e) {
    } finally {
      closeModal3();
      setCreating(false);
    }
  }

  const sendHits = (newHits) => {
    setHits(newHits);
  };

  const isLoading = (bool) => {
    setSearchLoading(bool);
  }
  return (
    <>
      {apiKeys.length >= 0 && indices && indices.length >= 0 ? (
        <>
          <head>
            <title>{name ? name : projectID}</title>
          </head>
          <main className={styles.projectMain}>
            <div
              style={{
                alignSelf: 'flex-end',
                display: 'flex',
                flexDirection: 'row',
                marginBottom: 32,
              }}
            >
              <ChangeProject link={`/dashboard`} uid={uid} />
              <LogOut />
            </div>
            <div className={styles.headingIndice}>
              <div>
                <p className={styles.indice}>Indices/</p>
                {indices.length && selectedIndex !== null && !error ? <span className={styles.indiceName}>{selectedIndex.name}</span> : <span className={styles.indiceName}>No indices created</span>}
              </div>
              <div style={{ display: 'flex' }}>
                <a style={{ marginRight: 12 }} onClick={() => indices.length === 0 ? openModal3() : openModal2()} className={styles.topButton}>
                  <p>{indices.length === 0 ? 'Create Index' : 'Change Index'}</p>
                </a>
                <a onClick={openModal} className={styles.apiKeyContainer}>
                  <img src="/API_Key.svg" />
                </a>
              </div>
            </div> 
            <>
              {selectedIndex !== null && indices.length > 0 && apiKeys.length > 0 ? (
                <>
                  <Search sendHits={sendHits} isLoading={isLoading} projectID={projectID} cluster={projectData.cluster} indexID={selectedIndex.name} apiKey={apiKeys[1].key} />
                  {hits.length > 0 ? (
                    <>
                      {hits.map((hit, i) => (
                        <Code language="javascript" code={JSON.stringify(hit, null, 2)} key={hit.objectID} />
                      ))}
                    </>
                  ) : (
                    <>
                    {!selectedIndex.objects_added ? <p>You have not added any objects to this index. Read the docs to learn how to do that</p> : <p>{searchLoading ? 'Loading results...' : 'No results'}</p>}
                    </>
                  )}
                </>
              ) : (
                <>
                  {diff <= 5 ? <p>We are setting up your redis instance, give us a few minutes before creating an index. Until then, you can learn more about re-search <a href={'https://www.youtube.com/watch?v=dQw4w9WgXcQ'}>here.</a></p> : <p onClick={() => {
                    if(!(diff <= 5)) {
                      openModal3();
                    }
                  }}>Create Index</p>}
                </>
              )}
            </>
          </main>
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
                        API Keys
                      </Dialog.Title>
                      {apiKeys.length > 0 ? (
                        <div className="mt-2">
                          <API_Heading title="Project ID" />
                          <API_Keys apiKey={projectID} />
                          <API_Heading title="Search-only API Key" />
                          <API_Keys apiKey={apiKeys.filter((val, i) => val.type === 'search')[0].key} />
                          <API_Heading title="Admin API Key" />
                          <API_Keys apiKey={apiKeys.filter((val, i) => val.type === 'admin')[0].key} />
                        </div>
                      ) : (
                        <p>Loading keys...</p>
                      )}

                      <div className="mt-10">
                        <button
                          type="button"
                          className="inline-flex justify-center px-4 py-2 text-sm font-medium text-blue-900 bg-blue-100 border border-transparent rounded-md hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                          style={{ marginRight: 12 }}
                          onClick={closeModal}
                        >
                          Regenerate
                        </button>
                        <button
                          type="button"
                          className="inline-flex justify-center px-4 py-2 text-sm font-medium text-blue-900 bg-blue-100 border border-transparent rounded-md hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                          onClick={closeModal}
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  </Transition.Child>
                </div>
              </Dialog>
            </Transition>
          </>
          <>
            <Transition appear show={isOpen2} as={Fragment}>
              <Dialog as="div" className="fixed inset-0 z-10 overflow-y-auto" onClose={closeModal2}>
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
                        Indices
                      </Dialog.Title>
                      <div className="mt-2">
                        {indices.length > 0 ? (
                          <>
                            {indices.map((index, i) => {
                              return <IndiceCell index={index} key={i} onSelectIndex={onSelectIndex} />;
                            })}
                          </>
                        ) : null}
                      </div>
                      <div className="mt-10">
                      <button
                          disabled={diff <= 5 ? true : false}
                          type="button"
                          className="inline-flex justify-center px-4 py-2 text-sm font-medium text-blue-900 bg-blue-100 border border-transparent rounded-md hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                          style={{ marginRight: 12 }}
                          onClick={() => {
                            closeModal2();
                            setTimeout(() => {
                              openModal3();
                            }, 300);
                          }}
                        >
                          Create Index
                        </button>
                        <button
                          type="button"
                          className="inline-flex justify-center px-4 py-2 text-sm font-medium text-red-900 bg-red-100 border border-transparent rounded-md hover:bg-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-500"
                          onClick={closeModal2}
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
          <>
            <Transition appear show={isOpen3} as={Fragment}>
              <Dialog as="div" className="fixed inset-0 z-10 overflow-y-auto" onClose={closeModal3}>
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
                        Create index
                      </Dialog.Title>
                      <div className="mt-2">
                        <input className={styles.input} placeholder="Index name" onChange={(e) => setIndexName(e.target.value)} required />
                      </div>
                      <div className="mt-10">
                        <button
                          type="button"
                          className="inline-flex justify-center px-4 py-2 text-sm font-medium text-blue-900 bg-blue-100 border border-transparent rounded-md hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                          onClick={onCreateIndex}
                        >
                          {creating ? 'Creating Index...just a minute...' : 'Create Index'}
                        </button>
                        <button
                          type="button"
                          className="inline-flex justify-center px-4 py-2 text-sm font-medium text-red-900 bg-red-100 border border-transparent rounded-md hover:bg-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-500"
                          onClick={() => setIsOpen3(false)}
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
        </>
      ) : (
        <>{loading ? <p>Loading...</p> : <p>Oops! Looks like something went wrong</p>}</>
      )}
    </>
  );
}

export default Project;

export async function getServerSideProps(context) {
  const id = context.params.id;
  const {uid} = context.query;
  try {
    const res = await axios.get('https://us-central1-redis-search.cloudfunctions.net/getProject', {
      params: {
        projectID: id,
        uid: uid,
      },
    });
    if(res.status === 200) {
      return {
        props: {
          initial_indices: res.data.indices,
          apiKeys: res.data.apiKeys,
          projectData: res.data.projectData,
          projectID: res.data.projectData.id,
          error: false,
        }
      }
    } else {
      return {
        props: {
          initial_indices: [],
          apiKeys: [],
          projectData: null,
          projectID: id,
          error: true,
        }
      }
    }
  } catch (e) {
    return {
      props: {
        initial_indices: [],
        apiKeys: [],
        projectData: null,
        projectID: id,
        error: true,
      }
    }
  }
}
