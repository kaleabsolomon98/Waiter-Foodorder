import React, { createContext, useEffect, useState } from 'react';
import axios from 'axios';

export const StoreContext = createContext(null);

export const StoreContextProvider = (props) => {
    const [cartItems, setCartItems] = useState({});
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [foodList, setFoodList] = useState([]); // State for food items

    // Fetch food items when the component mounts
    const fetchFoodItems = async () => {
        try {
            const response = await axios.get(`${base_url}menus`);
            setFoodList(response.data);
        } catch (error) {
            console.error('Error fetching food items:', error);
        }
    };

    // Fetch food items on initial mount
    useEffect(() => {
        fetchFoodItems();
    }, []);

    const addToCart = (itemId) => {
        if (!cartItems[itemId]) {
            setCartItems((prev) => ({ ...prev, [itemId]: 1 }));
        } else {
            setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }));
        }
    };

    const removeFromCart = (itemId) => {
        setCartItems((prev) => {
            const updatedCart = { ...prev };
            if (updatedCart[itemId] > 0) {
                updatedCart[itemId] -= 1;
            }
            return updatedCart;
        });
    };

    const getTotalCartAmount = () => {
        let totalAmount = 0;
        for (const item in cartItems) {
            const itemId = parseInt(item, 10); // Convert item to an integer
            if (cartItems[itemId] > 0) {
                const itemInfo = foodList.find((product) => product.id === itemId);
                if (itemInfo) {
                    totalAmount += itemInfo.price * cartItems[itemId];
                }
            }
        }
        return totalAmount;
    };

    useEffect(() => {
        console.log(cartItems);
    }, [cartItems]);

    const contextValue = {
        foodList, // Provide the foodList in the context
        cartItems,
        setCartItems,
        addToCart,
        removeFromCart,
        isLoggedIn,
        setIsLoggedIn,
        getTotalCartAmount,
        fetchFoodItems
    };

    return (
        <StoreContext.Provider value={contextValue}>
            {props.children}
        </StoreContext.Provider>
    );
};
