import Cookies from 'js-cookie';
import './Login.css';
import React, { useState } from 'react';
import { Form, FormGroup, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const hostname = "http://localhost:5262";
function Authenticate(e, setErrorMessage, navigate) {


    fetch(hostname + '/login',
        {
            method: "POST",
            headers:
            {
                "Content-type": "application/json",
                "Authorization": "Basic " + btoa(e.target.elements.username.value + ":" + e.target.elements.password.value)
            },
            body: JSON.stringify(
                {
                    username: e.target.elements.username.value,
                    password: e.target.elements.password.value
                }
            )
        }
    )
        .then(response => {
            if (response.ok) { // Check if response went through
                return response.text();
            } else {
                throw new Error('Network response was not ok.');
            }
        })
        .then(data => {
            console.log(data);
            let dataObj = JSON.parse(data);
            console.log(dataObj)
            Cookies.set('auth', data, { expires: 7 }); // The cookie will expire after 7 days
            Cookies.set('base64', btoa(dataObj.username + ":" + dataObj.password), { expires: 7 });
            localStorage.setItem('userId', dataObj.id);
            setErrorMessage(''); // Clear any error messages
            navigate('/home');
        })
        .catch(error => {
            console.log('There has been a problem with your fetch operation: ', error.message);
            if (error.message === 'Unauthorized') {
                setErrorMessage('Login failed. Please check your credentials.');
            } else {
                setErrorMessage('An error occurred. Please try again later.');
            }
        })
}


function NewUser(e, setErrorMessage, setIsCreatingAccount) {
    fetch(hostname + '/newUser', {
        method: "POST",
        headers: {
            "Content-type": "application/json",

        },
        body: JSON.stringify(
            {
                username: e.target.elements.new_username.value,
                password: e.target.elements.new_password.value,
            }
        )
    })
        .then(response => response.text())
        .then(response => {
            if (response.includes('success')) {
                // Reset the error message and switch to login form
                setErrorMessage('');
                setIsCreatingAccount(false);  // Show the login form
                console.log('Account created successfully!');

            } else if (response.includes('Username already in use')) {
                setErrorMessage('Username already in use! Please try again');
            } else {
                setErrorMessage('Account creation failed. Please try again.');
            }
        })
        .catch(error => {
            setErrorMessage('Failed to create account. Please try again.');
        });
}

function Login() {
    const [isCreatingAccount, setIsCreatingAccount] = useState(false);

    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    // Handle input change to clear error message
    const handleInputChange = () => {
        setErrorMessage(''); // Clear error message when the user starts typing
    };

    return (
        <div className='flex justify-center items-center mt-52'>
            <div className="login-content">
                <h1 className='text-3xl font-bold'>
                    {isCreatingAccount ? 'Create Account' : 'Login'}
                </h1>
                <br />
                {isCreatingAccount ? (
                    <Form onSubmit={(e) => {
                        e.preventDefault();
                        NewUser(e, setErrorMessage, setIsCreatingAccount);
                        e.target.reset();
                    }}>
                        <FormGroup className='mb-3'>
                            <Form.Label>Username</Form.Label>
                            <Form.Control type="text" name="new_username" onChange={handleInputChange} required />

                            <Form.Label>Password</Form.Label>
                            <Form.Control type="password" name="new_password" onChange={handleInputChange} required />
                        </FormGroup>
                        <Button variant='primary' type="submit" className="w-100">Create Account</Button>
                    </Form>
                ) : (
                    <Form onSubmit={(e) => {
                        e.preventDefault();
                        Authenticate(e, setErrorMessage, navigate);
                        e.target.reset();
                    }}>
                        <FormGroup className='mb-3'>
                            <Form.Label>Username</Form.Label>
                            <Form.Control type="text" name="username" onChange={handleInputChange} required />

                            <Form.Label>Password</Form.Label>
                            <Form.Control type="password" name="password" onChange={handleInputChange} required />
                        </FormGroup>
                        <Button variant='primary' type="submit" className="w-100">Login</Button>
                    </Form>
                )}
                <br />

                {errorMessage && (
                    <div className="text-danger text-center mb-3">
                        {errorMessage}
                    </div>
                )}

                <div className="text-center">
                    <a
                        href="#"
                        onClick={() => {
                            setIsCreatingAccount(!isCreatingAccount);
                            setErrorMessage(''); // Clear error message when switching forms
                        }}
                        className="text-primary"
                    >
                        {isCreatingAccount ? 'Back to Login' : 'Create a New Account'}
                    </a>
                </div>
            </div>
        </div>
    );
}


export default Login;