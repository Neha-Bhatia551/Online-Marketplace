import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';
import { useState, useEffect } from 'react';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ToggleButton from 'react-bootstrap/ToggleButton';
import Cookies from 'js-cookie';
import SellItems from './components/SellItems';
import Browse from './components/Browse';
import { CgProfile } from 'react-icons/cg'; // Import the profile icon
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection
import Button from 'react-bootstrap/Button';
import { NavbarText } from 'react-bootstrap';
import { FaShoppingCart } from "react-icons/fa";





function NavHeader() {
    const [buttonValue, setbuttonValue] = useState('1');
    const [username, setUsername] = useState(null);
    const navigate = useNavigate(); // Initialize useNavigate hook
    const [cartCount, setCartCount] = useState(null);
    const userId = localStorage.getItem("userId");
    const hostname = "http://localhost:5262";

    const buttons = [
        { name: 'Browse', value: '1' },
        { name: 'Sell', value: '2' }
    ];

  
    function plusCartCount() {
        setCartCount(cartCount + 1);
    }


    const handleCartClick = () => {
        navigate('/checkout', { state: { userId } }); // Pass userId as state
    };

    useEffect(() => {
        // Retrieve username from cookies
        const base64Credentials = Cookies.get('base64');
        if (base64Credentials) {
            const decodedCredentials = atob(base64Credentials);
            const userName = decodedCredentials.split(':');
            setUsername(userName); // Store username in component state
            fetchCartCount(userId);
        }
    }, []); // Empty dependency array ensures it runs once on component mount

    let selectedComponent;
    if (buttonValue === '1') {
        selectedComponent = <Browse plusCartCount={plusCartCount}/>;
    } else if (buttonValue === '2') {
        selectedComponent = <SellItems userId={userId} />;
    }



    const fetchCartCount = async (userId) => {
        try {
            const response = await fetch(hostname + `/cartItemCount?userId=${userId}`);
            if (response.ok) {
                const data = await response.json();
                console.log(data);
                setCartCount(data.cartItemCount || null);
            } else {
                console.error("Failed to fetch cart count");
            }
        } catch (error) {
            console.error("Error fetching cart count:", error);
        }
    };

    
    // Handle logout functionality
    const handleLogout = () => {
        // Clear the cookies
        Cookies.remove('auth');
        Cookies.remove('base64');
        setUsername(null); // Reset username
        setCartCount(0);
        localStorage.removeItem('userId');
        navigate('/login'); // Redirect to login page
    };

    const handleRedirect = () => {
        navigate('/login'); // Redirect to the login page
    };


    return (
        <div className='navheader'>
            <Navbar bg="dark" data-bs-theme="dark">
                <Container>
                    <Navbar.Brand href="/home" ><h3>Marketplace</h3></Navbar.Brand>
                    <Nav>
                        <ButtonGroup className="mb-2">
                            {buttons.map((radio, idx) => (
                                <ToggleButton
                                    key={idx}
                                    id={`radio-${idx}`}
                                    type="radio"
                                    variant="dark"
                                    name="radio"
                                    size="lg"
                                    value={radio.value}
                                    checked={buttonValue === radio.value}
                                    onChange={(e) => setbuttonValue(e.currentTarget.value)}
                                >
                                    {radio.name}
                                </ToggleButton>
                            ))}
                        </ButtonGroup>
                    </Nav>

                    {username ? (

                        <div className='flex mt-2'>
                            <NavbarText className="text-white flex">
                                <FaShoppingCart size={25} className="text-white ml-2" onClick={handleCartClick} />
                                <div className="text-white ml-1 mr-4">{cartCount}</div>
                                <CgProfile size={25}  className='ml-2'/>
                                <div className='ml-2'>{username[0]}</div>
                            </NavbarText>
                            <Button className="ml-3" onClick={handleLogout} variant="dark">Logout</Button>
                        </div>

                    ) : (
                        <Button onClick={handleRedirect} variant="dark">Login</Button>
                    )}

                </Container>
            </Navbar>
            {/* Render the selected component */}
            <div className="content">
                {selectedComponent}
            </div>
        </div>
    );
}
export default NavHeader;