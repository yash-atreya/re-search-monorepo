import React from 'react'
import styles from '../styles/Home.module.css'
export default function API_Keys({apiKey}) {
    return (
        <div className={styles.APICell}>
            <p className={styles.APIKey}>
                {apiKey}
            </p>
            <a className={styles.copyTab}>
                <img src="/copy.svg" />
            </a>
        </div>
    )
}
