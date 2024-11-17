import React from 'react'
import { FaAngleRight } from "react-icons/fa6";
import { CiHeart } from "react-icons/ci";
import './ItemCard.css';
import ProductModal from './ProductModal';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';



function ItemCard({ products, plusCartCount }) {
    const hostname = 'http://localhost:5262';
    const [show, setShow] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const userId = localStorage.getItem("userId");
    const [username, setUsername] = useState(null);


    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate(); 
    

    useEffect(() => {
        // Check if the user is logged in
        setIsLoggedIn(!!userId); // Set to true if userId exists
        const base64Credentials = Cookies.get('base64');
        if (base64Credentials) {
            const decodedCredentials = atob(base64Credentials);
            const userName = decodedCredentials.split(':');
            setUsername(userName[0]); // Store username in component state
        }
    }, []);

    const handleClose = () => {
        setShow(false);
        setSelectedProduct(null);  // Reset selected product when closing modal
    };

    const handleShow = (product) => {
        setSelectedProduct(product);  // Set the specific product to be displayed
        setShow(true);
    };

    const addToCart = (productId) => {

        if (!userId) {
            console.log("You must be logged in to add items to the cart.");
            return; // Stop execution if userId is not found
        }

        // Call the /addToCart API
        fetch(`${hostname}/addToCart?userId=${userId}&productId=${productId}&quantity=1`, {
            method: 'POST',
            headers: {
                'accept': '*/*',  // Accept any type of response
            }
        })
            .then(response => response.json())
            .then(data => {
                if (data.message) {
                    console.log(data.message);
                }
                plusCartCount();
            })
            .catch(error => {
                console.error('Error adding to cart:', error);
            });
    };

    const handleEditProduct = (productId, product) => {
        // Redirect to edit product page, passing productId and other details if needed
        navigate(`/editProduct`, { state: { product } });
    };


    return (
        <div className="flex flex-wrap gap-4  ml-[40px] mr-[40px] mt-10 scrollnone">
            {
                products.filter(product => product.Quantity > 0).map((product) => {
                    const discountedPrice = product.Price - (product.Price * (product.Discountpercentage / 100));
                    return (
                        <div className='h-[45vh] min-w-[25vw] ml-5 bg-cover pb-12 rounded-3xl'
                            style={{ backgroundImage: `url(${product.Images[0].ImageUrl})` }}
                        >
                            <div className='flex mt-2 ml-2 mr-2 items-center justify-between'>
                                <button className='hoverbuttons'>
                                    <CiHeart className='text-black' size={24} />
                                </button>
                                {(username === 'Admin' || username === 'admin')  && (
                                    <button
                                        className='hoverbuttons px-4'
                                        onClick={() => handleEditProduct(product.Id, product)}
                                    >
                                        Edit
                                    </button>
                                )}
                                <div className="relative group">
                                    <button
                                        className={`hoverbuttons px-4 ${!isLoggedIn ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        onClick={() => isLoggedIn && addToCart(product.Id)}
                                        disabled={!isLoggedIn}
                                    >
                                        Add to Cart
                                    </button>
                                    {!isLoggedIn && (
                                        <div className="absolute top-10 left-0 w-max px-2 py-1 bg-black text-white text-sm rounded-md hidden group-hover:block">
                                            Please login to add to cart
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className='w-full h-full rounded-lg px-2 flex items-end mt-2 pb-4'>
                                <div className='w-full flex items-center justify-between bg-white rounded-md p-2'>
                                    <div className='flex-col'>
                                        <h1 className='font-semibold'>{product.Title}</h1>
                                        <div className='flex items-center mt-1 font-bold'>
                                            <h1>${discountedPrice.toFixed(2)}</h1>
                                            <h1 className='line-through text-gray-400 ml-2'>${product.Price}</h1>
                                        </div>
                                    </div>
                                    <button className='hoverbuttons' onClick={() => handleShow(product)}>
                                        <FaAngleRight />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )

                })
            }
            {selectedProduct && (
                <ProductModal show={show} handleClose={handleClose} product={selectedProduct} addToCart={addToCart} isLoggedIn={isLoggedIn} />
            )}
        </div>

    )
}

export default ItemCard;