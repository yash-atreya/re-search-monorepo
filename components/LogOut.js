import React from 'react';
import styles from '../styles/Home.module.css'
import firebase from '../config/firebase';
import {useRouter} from 'next/router';
function LogOut() {
    const router = useRouter();
    const handleLogout = async () => {
       await firebase.auth().signOut();
       router.push('/auth');
    }
    return (
        <div className={styles.topButton} onClick={handleLogout}>
            <p>Logout</p>
        </div>
    )
}

export default LogOut
