import React from 'react';
import styles from '../styles/Home.module.css';

export default function IndiceCell({index, onSelectIndex}) {
    return (
        <div className={styles.indiceCell} onClick={() => onSelectIndex(index)}>
            <p className={styles.indice}>{index.name}</p>
        </div>
    )
}
