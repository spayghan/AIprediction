import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(() => {
        try {
            const saved = localStorage.getItem('nexstore_cart');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem('nexstore_cart', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (product, quantity = 1) => {
        const qtyToAdd = Math.max(1, Number(quantity));

        setCartItems(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                const updatedQty = Math.min(product.stock_quantity, existing.quantity + qtyToAdd);
                return prev.map(item =>
                    item.id === product.id ? { ...item, quantity: updatedQty } : item
                );
            } else {
                const initialQty = Math.min(product.stock_quantity, qtyToAdd);
                return [...prev, {
                    id: product.id,
                    name: product.name,
                    sku: product.sku,
                    price: Number(product.price),
                    image_url: product.image_url,
                    stock_quantity: product.stock_quantity,
                    quantity: initialQty
                }];
            }
        });
    };

    const updateQuantity = (productId, newQuantity) => {
        if (newQuantity <= 0) {
            removeFromCart(productId);
            return;
        }

        setCartItems(prev => prev.map(item => {
            if (item.id === productId) {
                const safeQty = Math.min(item.stock_quantity, newQuantity);
                return { ...item, quantity: safeQty };
            }
            return item;
        }));
    };

    const removeFromCart = (productId) => {
        setCartItems(prev => prev.filter(item => item.id !== productId));
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const cartTotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            updateQuantity,
            removeFromCart,
            clearCart,
            cartTotal,
            cartCount
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
