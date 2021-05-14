import React from 'react';
import styles from '../styles/Home.module.css';
import {useRouter} from 'next/router';
function ChangeProject({ link, uid }) {
    const router = useRouter();
    
  return (
      <div onClick={() => router.back()} className={styles.topButton}>
        <p>Change Project</p>
      </div>
  );
}

export default ChangeProject;
