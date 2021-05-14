import Head from 'next/head'
import styles from '../styles/Home.module.css'
import Re_search_Icon from '../components/research-icon';
import ListBoxComponent from '../components/ListBox';
import { useAppContext } from '../context';

export default function Home() {
  // UID 
  const {uid} = useAppContext();
  return (
    <div className={styles.container}>
      <Head>
        <title>Re-search</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        {/* <img src="/re-search.svg" alt="Redis Logo" /> */}
        <div className={styles.svg}>
          <Re_search_Icon w={250} h={50} />
        </div>
        <div className={styles.heroSpacer} />
        <p className={styles.heroTitle}>
          <span className={styles.cursive}>Blazing</span> 
          <span className={styles.poppins}> fast search ⚡️</span>
          
        </p>

        <div className={styles.grid}>
          <a href={uid ? '/dashboard' : '/auth'} className={styles.card}>
            <p>Get started &nbsp;&rarr;</p>
          </a>
        </div>
      </main>
      {/* <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <img src="/vercel.svg" alt="Vercel Logo" className={styles.logo} />
        </a>
      </footer> */}
    </div>
  )
}
