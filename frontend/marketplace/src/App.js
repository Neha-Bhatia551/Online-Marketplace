import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './Home';
import React from 'react'
import Login from './Login';
import Checkout from './components/Checkout';
import EditProduct from './components/EditProduct.js';


function App() {
  return (
    <Router>
      <Routes>
        {/* Redirect the root path to /login */}
        <Route path="/" element={<Login/>} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/checkout" element={<Checkout/>} />
        <Route path="/editProduct" element={<EditProduct/>} />

      </Routes>
    </Router>
  );
  
}

export default App;


