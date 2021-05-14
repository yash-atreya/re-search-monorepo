import React, { useEffect } from 'react'
import styles from '../styles/Home.module.css';
import {useState} from 'react';
import axios from 'axios';

function Search({apiKey, sendHits, projectID, cluster, indexID, isLoading}) {
    const [offset, setOffSet] = useState(0);
    
    useEffect(() => {
        onSearch('*');
    }, [])

    useEffect(() => {
        onSearch('*');
    }, [indexID]);
    const onSearch = async (q) => {
        try {
            isLoading(true);
            const result = await axios.get(`${process.env.NGROK_URL}/search?q=${q}`, {
                params: {
                    apiKey: apiKey,
                    projectID: projectID,
                    retrieveAllWhenEmpty: true,
                    indexName: indexID,
                    limit: 10,
                    offset: offset,
                },
            });
            if(result.status === 200 && result.data.error === false) {
                sendHits(result.data.hits);
            }
        } catch(e) {
            sendHits([]);
        } finally {
            isLoading(false);
        }
  }
    return (
            <input className={
                    styles.searchInput
                }
                placeholder="Search"
                onChange={
                    e => onSearch(e.target.value)
                }/>
    )
}

export default Search
