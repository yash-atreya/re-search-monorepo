import {useState} from 'react';
import styles from '../styles/Home.module.css';
import {Listbox} from '@headlessui/react';

function CreateNewProject (props) {


    return (
        <a onClick={props.onClick} className={styles.newProjectContainer}>
            <p className={styles.newProjHeding}>
                + &nbsp; Create new project
            </p>
        </a>
      )    
}

export default CreateNewProject;