import React, { useEffect } from "react";
import Prism from "prismjs";
// import "prismjs/themes/prism-nightOwl.css";
import styles from '../styles/Home.module.css';

export default function Code({ code, language }) {
    useEffect(() => {
    Prism.highlightAll();
  }, []);
  return (
    <div className={styles.code}>
      <pre>
        <code className={`language-${language}`}>{code}</code>
      </pre>
    </div>
  );
}
