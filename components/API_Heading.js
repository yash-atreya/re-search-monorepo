import React from 'react'
import styles from '../styles/Home.module.css'

export default function API_Headings(props) {
    return (
        <h1 className={styles.APITitle}>
            {props.title}:
        </h1>
    )
}
