import React from 'react';
import './Browse.css';
import ItemCard from './ItemCard';
import { useState, useEffect } from 'react';

function Browse({plusCartCount}) {
    const [items, setItems] = useState([]);
    const hostname = 'http://localhost:5262';

    async function fetchItems() {
        try {
            const response = await fetch(hostname + '/getItems');
            const data = await response.json();
            setItems(data);
        } catch (error) {
            console.error('Error fetching Items:', error);
        }
    }

    useEffect(() => {

        //only execute the fetch if the topics array is empty
        if (items.length === 0) {
            
            fetchItems();
        }
        console.log(items);
    }, [items]);
    return (
        <div>
            <h1 className='header'>New Arrivals</h1>
            <ItemCard products={items} plusCartCount={plusCartCount} />
        </div>
    );
}

export default Browse;