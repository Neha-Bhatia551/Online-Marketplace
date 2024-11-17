import React from 'react';
import { Form, FormGroup, Button } from 'react-bootstrap';
import './SellItems.css';

function SellItems({ userId }) {
    const hostname = 'http://localhost:5262';

    const saveProduct = async (e) => {
        e.preventDefault();  // Prevent form from reloading the page
        //TODO: add validation for the form fields
        // Prepare the product object
        const newProduct = {
            "Title": e.target.productname.value,
            "Description": e.target.description.value,
            "rating": (Math.random() * (5 - 2) + 2).toFixed(1),
            "quantity": parseInt(e.target.quantity.value),
            "price": parseFloat(e.target.price.value),
            "discountpercentage": parseFloat(e.target.discountpercentage.value),
            "images": [
                {
                    "imageUrl": e.target.imageurl.value
                }
            ]
        };

        try {
            // Send data to the backend API
            const response = await fetch(hostname + '/addProduct', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newProduct)
            });

            const result = await response.json();

            if (response.ok) {
                console.log(`Product created successfully with ID: ${result.productId}`);
            } else {
                console.log(`Error: ${result.message}`);
            }
        } catch (error) {
            console.error('Error adding product:', error);
            console.log('An error occurred while adding the product.');
        }
    };

    return (
        <div className='flex justify-center items-center mt-4 '>
            <div className='product-content'>
                <h1 className='text-3xl font-bold'>
                    Add a New Product
                </h1>
                <br />
                {userId ? (
                    <Form onSubmit={(e) => {
                        e.preventDefault();
                        saveProduct(e);
                        e.target.reset();
                    }}>
                        <FormGroup className='mb-3'>
                            <Form.Label>Product Name</Form.Label>
                            <Form.Control type="text" name="productname" required />

                            <Form.Label>Description</Form.Label>
                            <Form.Control as="textarea" name="description" required />
                            <Form.Label>Quantity</Form.Label>
                            <Form.Control type="text" name="quantity" required />
                            <Form.Label>Price</Form.Label>
                            <Form.Control type="text" name="price" required />
                            <Form.Label>Discount Percentage</Form.Label>
                            <Form.Control type="text" name="discountpercentage" required />
                            <Form.Label>Image Url</Form.Label>
                            <Form.Control type="text" name="imageurl" placeholder='Please enter url of image' required /><br />
                            <Button variant='primary' type="submit" className="w-100">Add Product</Button>

                        </FormGroup>
                    </Form>
                ) : (
                    <h1 className='text-3xl font-bold'>
                        Please login to add a new product
                    </h1>
                )}
                <br />
            </div>
        </div>
    );
};

export default SellItems;
