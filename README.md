# Online Marketplace

Online Marketplace is a web application to puchase and sell products, with .NET backend and React frontend with CSS and TailwindCss.

### Run online marketplace
1. Navigate to backend/marketplace folder, build and then Start backend (.Net) 
2. Navigate to frontend/marketplace, first run "npm install" and then run "npm start" 

### Current Features of Online Marketplace
1. Login page appears initially, there is functionality to create an account. In current functionality 2 users cannot have the same user name
2. Once you create a user, login using username and password. 
3. Once you login homepage appears with existing products
4. Functionality to view product in detail
5. Functionality to add to cart and remove from cart, and also maintaining the state of cart in database for user
6. Functionality to check cart items and checkout
7. Logout Functionality
8. If user is an admin, option to edit products on home screen
9. Sell page - to add your products
10. Users state is maintained even if the web application is refreshed or restarted


### API's on the backend

#### POST API's
1. /newUser - api used to create a new user
2. /login - api to authenticate the user
3. /addProduct - api to add product to product table
4. /addToCart - Add a product to cart

#### GET API's
1. /reset - reset the product table, and add intial products from items.json
2. /getItems - return the list of all products
3. /getCartItems/UserId - get cart items for userid
4. /cartItemCount - returns the cart item count for specific user logged in
 
#### DELETE API's
1. /removeFromCart - remove a particular item from cart for logged in user
2. /clearcart - clear cart of logged in user

#### PUT API's
1. /edit/productid - api to edit product details 


###  If I had more time, what would I do differently
1. Add Oauth login 
2. Store history of user orders and add payment functionality
3. Have a dashboard of user, where it shows all the items he/she has sold and purchased
4. Add Favourites functionality
5. Add filters on the UI to filter products based on categories
6. Consider quantity after the item has been added to cart/checked out