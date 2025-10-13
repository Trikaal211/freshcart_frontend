import React from 'react';

const CartContext = React.createContext({
  cart: { products: [] },
  cartItems: [],
  addToCart: () => {},
  setToken: () => {}
});

export default CartContext;