import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { FaStar, FaRegStar, FaStarHalfAlt } from 'react-icons/fa';  // Importing star icons



function ProductModal({ handleClose, show, product, addToCart, isLoggedIn }) {
  const discountedPrice = product.Price - (product.Price * (product.Discountpercentage / 100));


  const renderStars = (rating) => {
    const totalStars = 5;  // Assuming a 5-star rating system
    let stars = [];
    let fullStars = Math.floor(rating); // Full stars
    let hasHalfStar = rating % 1 >= 0.5; // Check if we need a half star

    // Render full stars
    for (let i = 1; i <= fullStars; i++) {
      stars.push(<FaStar key={i} className="text-yellow-500" />);
    }

    // Render half star if applicable
    if (hasHalfStar) {
      stars.push(<FaStarHalfAlt key="half" className="text-yellow-500" />);
    }
    // Render empty stars for the remaining ones
    for (let i = fullStars + (hasHalfStar ? 1 : 0); i < totalStars; i++) {
      stars.push(<FaRegStar key={i} className="text-gray-400" />);
    }

    return stars;
  };

  return (
    <>
      <Modal dialogClassName="modal-50w"
        aria-labelledby="contained-modal-title-vcenter"
        centered show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{product.Title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{product.Description}</p>
          {product.Images && product.Images[0] && (
            <img
              src={product.Images[0].ImageUrl}
              alt={product.Title}
              className="img-fluid h-80 w-85 mx-auto mt-2"
            />
          )}
          {/* Display Product Rating with Stars */}
          <div className="flex items-center mt-2">
            {/* Render stars horizontally */}
            <div className="flex space-x-1">
              {renderStars(product.Rating)}
            </div>
            <span className="ml-2 font-semibold">{product.Rating} / 5</span>
          </div>
          <div className='flex items-center mt-2 font-bold'>
            <h1>${discountedPrice.toFixed(2)}</h1>
            <h1 className='line-through text-gray-400 ml-2'>${product.Price}</h1>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          {/* <Button variant="primary" onClick={() => addToCart(product.Id)}>
            Add to Cart
          </Button>
           */}
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
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default ProductModal;