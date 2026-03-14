import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('sel3a_cart');
    const savedWishlist = localStorage.getItem('sel3a_wishlist');
    if (savedCart) setCartItems(JSON.parse(savedCart));
    if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('sel3a_cart', JSON.stringify(cartItems));
    localStorage.setItem('sel3a_wishlist', JSON.stringify(wishlist));
  }, [cartItems, wishlist]);

  const addToCart = (product, size, color) => {
    const existing = cartItems.find(item => item.id === product.id && item.selectedSize === size && item.selectedColor === color);
    if (existing) {
      setCartItems(cartItems.map(item => 
        (item.id === product.id && item.selectedSize === size && item.selectedColor === color) 
        ? { ...item, quantity: item.quantity + 1 } 
        : item
      ));
    } else {
      setCartItems([...cartItems, { ...product, selectedSize: size, selectedColor: color, quantity: 1 }]);
    }
    setIsCartOpen(true);
  };

  const removeFromCart = (id, size, color) => {
    setCartItems(cartItems.filter(item => !(item.id === id && item.selectedSize === size && item.selectedColor === color)));
  };

  const updateQuantity = (id, size, color, amount) => {
    setCartItems(cartItems.map(item => {
      if (item.id === id && item.selectedSize === size && item.selectedColor === color) {
        const newQty = Math.max(1, item.quantity + amount);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const updateSize = (id, oldSize, color, newSize) => {
    setCartItems(prev => {
      const itemToUpdate = prev.find(i => i.id === id && i.selectedSize === oldSize && i.selectedColor === color);
      if (!itemToUpdate) return prev;

      const existingWithNewSize = prev.find(i => i.id === id && i.selectedSize === newSize && i.selectedColor === color);

      if (existingWithNewSize && oldSize !== newSize) {
        // Merge with existing
        return prev.filter(i => !(i.id === id && i.selectedSize === oldSize && i.selectedColor === color))
          .map(i => (i.id === id && i.selectedSize === newSize && i.selectedColor === color) 
            ? { ...i, quantity: i.quantity + itemToUpdate.quantity } 
            : i
          );
      } else {
        // Just update size
        return prev.map(i => (i.id === id && i.selectedSize === oldSize && i.selectedColor === color)
          ? { ...i, selectedSize: newSize }
          : i
        );
      }
    });
  };

  const toggleWishlist = (product) => {
    const isWishlisted = wishlist.find(item => item.id === product.id);
    if (isWishlisted) {
      setWishlist(wishlist.filter(item => item.id !== product.id));
    } else {
      setWishlist([...wishlist, product]);
    }
  };

  const clearCart = () => setCartItems([]);

  const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      wishlist, 
      isCartOpen, 
      setIsCartOpen, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      updateSize,
      toggleWishlist,
      clearCart,
      cartTotal,
      cartCount
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
