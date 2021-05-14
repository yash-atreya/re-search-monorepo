import { useState } from 'react';
import styles from '../styles/Home.module.css';
import { useRouter } from 'next/router';
import { useAppContext } from '../context';
import Link from 'next/link';
function ProjectComponent({ projectName, id }) {
  const { uid } = useAppContext();
  return (
    <Link
      href={{
        pathname: '/project/' + id,
        query: { uid: uid },
      }}
      as={`/project/${id}`}
    >
      <div className={styles.projectContainer}>
        <>
          <p className={styles.subHeading}>Project Name:</p>
          <p className={styles.projectName}>{projectName}</p>
          <p className={styles.subHeading}>Project ID:</p>
          <p className={styles.projectID}>{id}</p>
        </>
      </div>
    </Link>
  );
}

export default ProjectComponent;
