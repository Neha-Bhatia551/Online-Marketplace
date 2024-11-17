import React, { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import { useLocation, useNavigate} from 'react-router-dom';
import './Checkout.css';
import Navbar from 'react-bootstrap/Navbar';
import { Container } from 'react-bootstrap';
import Nav from 'react-bootstrap/Nav';



function Checkout() {
    const hostname = "http://localhost:5262";
    const location = useLocation();
    const userId = location.state?.userId;
    const [cartItems, setCartItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();  // To handle redirection after checkout


    useEffect(() => {
        fetchCartItems(userId);
    }, [userId]);

    const fetchCartItems = async (userId) => {
        try {
            const response = await fetch(`${hostname}/getCartItems/${userId}`);
            if (response.ok) {
                const data = await response.json();
                setCartItems(data);
            } else {
                console.error("Failed to fetch cart items");
            }
        } catch (error) {
            console.error("Error fetching cart items:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const removeFromCart = async (productId) => {
        try {
            // Construct the URL with query parameters
            const url = `${hostname}/removeFromCart?userId=${userId}&productId=${productId}`;

            const response = await fetch(url, {
                method: "DELETE",
                headers: { "accept": "*/*" }, // Include the required headers
            });

            if (response.ok) {
                // Update the cart items in state
                setCartItems(cartItems.filter(item => item.product.id !== productId));
            } else {
                const errorText = await response.text(); // Log backend error details
                console.error("Failed to remove item from cart:", errorText);
            }
        } catch (error) {
            console.error("Error removing item from cart:", error);
        }
    };

    const handleCheckout = async () => {
        try {
            // Call the clearCart API to remove all items from the cart
            const response = await fetch(`${hostname}/clearCart?userId=${userId}`, {
                method: "DELETE",
                headers: { "accept": "*/*" },
            });

            if (response.ok) {
                // Show success message
                alert("Order placed successfully!");

                // Empty the cart on the frontend
                setCartItems([]);

                // Redirect to the home page
                navigate('/home');
            } else {
                console.error("Failed to clear cart during checkout");
            }
        } catch (error) {
            console.error("Error during checkout:", error);
        }
    };

    if (isLoading) return <div>Loading...</div>;

    return (
        <div>
            <Navbar bg="dark" data-bs-theme="dark">
                <Container>
                    <Navbar.Brand href="/home" ><h3>Marketplace</h3></Navbar.Brand>
                    <Nav>
                        <Button href="/home" ><h3>Home</h3></Button>
                    </Nav>
                </Container>
            </Navbar>

            <div className="checkout-container">


                <h2 className='header'>Your Cart</h2>
                <br />
                {cartItems.length === 0 ? (
                    <p>No items in cart</p>
                ) : (
                    <div>
                        <div className='flex flex-col items-center justify-center'>
                            {cartItems.map((item, idx) => {
                                const discountedPrice = item.product.price - (item.product.price * (item.product.discountpercentage / 100));
                                return (
                                    <div key={idx} className="cart-item mt-4">
                                        <img className="h-[15vh] min-w-[6vw]" src={item.product.images[0].imageUrl} alt={item.product.title} width="100" />
                                        <span>
                                            <h5 className='text-2xl font-extrabold'>{item.product.title}</h5>
                                            <p>Quantity: {item.quantity}</p>
                                            <p>Price: ${discountedPrice}</p>
                                            <Button variant="danger" onClick={() => removeFromCart(item.product.id)}>
                                                Remove
                                            </Button>
                                        </span>
                                    </div>
                                );
                            })}
                            <br />
                        </div>
                        <div className="mt-4 flex justify-center">
                            <Button onClick={handleCheckout} variant="success">
                                Checkout
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Checkout;
