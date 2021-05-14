import styles from '../styles/Home.module.css'
import Head from 'next/head';
import {useRouter} from 'next/router';
import firebase from '../config/firebase';
const {auth} = firebase;
import ProjecComponent from '../components/ProjectComponent';
import {useAppContext} from '../context';
import { useEffect } from 'react';
import axios from 'axios';
function Auth() {
    // ROUTER
    const router = useRouter();

    useEffect(() => {
       const unsub = auth().onAuthStateChanged(async user => {
            if(user) {
                const token = await user.getIdToken();
                try {
                    const result = await axios.get(`/api/preview?uid=${user.uid}`);
                } catch(e) {
                    console.error(e);
                }
                router.push(`/dashboard?uid=${user.uid}&token=${token}`, '/dashboard');
            }
        })
        return unsub;
    }, [])
    const handleSignIn = async (event) => {
        const provider = new auth.GithubAuthProvider();
        
        try {
            // SIGN IN WITH POP-UP
            const result = await auth().signInWithPopup(provider);

            // CREDENTIALS
            const credential = result.credential;
            const user = result.user;
            const token = credential.accessToken;
            
        } catch (e) {
            console.log(e);
        }
        
    }

    return (
        <div className={styles.container}>
            <Head>
                <title>Sign-In with Github</title>
            </Head>

            <div className={styles.main}>
                <img width={120} src="/Gitconnect.svg" />
                <div className={styles.heroSpacer} />
                    <a className={styles.ctaSignIn} onClick={handleSignIn}>
                        <p style={{display: 'inline-block'}}>Sign In with Github</p>
                        <img style={{display: 'inline-block', marginLeft: 16}} src="/github.svg" />
                    </a>
            </div>
        </div>
    )
}

export default Auth;