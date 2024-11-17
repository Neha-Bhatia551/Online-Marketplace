import React, { useState, useEffect } from 'react';
import { Form, FormGroup, Button } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import './SellItems.css';
import Navbar from 'react-bootstrap/Navbar';
import { Container } from 'react-bootstrap';
import Nav from 'react-bootstrap/Nav';

function EditProduct() {
    const location = useLocation();
    const product = location.state?.product || {}; // Access passed state product details
    const navigate = useNavigate();
    const hostname = 'http://localhost:5262';


    // If no product is passed, return an error message
    if (!product) {
        return <div>Error: Product not found</div>;
    }

    const saveProduct = async (e) => {
        e.preventDefault();
        // Prepare the updated product object
        const updatedProduct = {
            "Id": product.Id,
            "Title": e.target.productname.value,
            "Description": e.target.description.value,
            "Rating": (Math.random() * (5 - 2) + 2).toFixed(1),  // Random rating for simplicity
            "Quantity": parseInt(e.target.quantity.value),
            "Price": parseFloat(e.target.price.value),
            "Discountpercentage": parseFloat(e.target.discountpercentage.value),
            "Images": [
                {
                    "ImageUrl": e.target.imageurl.value
                }
            ]
        };

        try {
            // Send data to the backend API to update the product
            const response = await fetch(`${hostname}/updateProduct/${product.Id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedProduct)
            });

            const result = await response.json();

            if (response.ok) {
                alert(`Product updated successfully!`);

                // Redirect to the home page
                navigate('/home');
            } else {
                console.error(`Error updating product: ${result.message}`);
            }
        } catch (error) {
            console.error('Error updating product:', error);
        }
    };

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
            <div className='flex justify-center items-center mt-4 '>
                <div className='product-content'>
                    <h1 className='text-3xl font-bold'>
                        Edit Product
                    </h1>
                    <br />
                    <Form onSubmit={saveProduct}>
                        <FormGroup className='mb-3'>
                            <Form.Label>Product Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="productname"
                                defaultValue={product.Title}
                                required
                            />

                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                name="description"
                                defaultValue={product.Description}
                                required
                            />
                            <Form.Label>Quantity</Form.Label>
                            <Form.Control
                                type="text"
                                name="quantity"
                                defaultValue={product.Quantity}
                                required
                            />
                            <Form.Label>Price</Form.Label>
                            <Form.Control
                                type="text"
                                name="price"
                                defaultValue={product.Price}
                                required
                            />
                            <Form.Label>Discount Percentage</Form.Label>
                            <Form.Control
                                type="text"
                                name="discountpercentage"
                                defaultValue={product.Discountpercentage}
                                required
                            />
                            <Form.Label>Image Url</Form.Label>
                            <Form.Control
                                type="text"
                                name="imageurl"
                                placeholder="Enter image URL"
                                defaultValue={product.Images[0]?.ImageUrl || ''}
                                required
                            /><br />
                            <Button variant='primary' type="submit" className="w-100">Update Product</Button>
                        </FormGroup>
                    </Form>
                </div>
            </div>

        </div>
    );
}

export default EditProduct;
