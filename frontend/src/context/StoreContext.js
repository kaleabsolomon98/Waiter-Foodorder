import React, { useState } from 'react'
import { createContext, useEffect } from "react";
import { food_list } from "../assets/frontend_assets/assets";


export const StoreContext = createContext(null);

export const StoreContextProvider = (props) => {

    const [cartItems, setCartItems] = useState({});
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const addToCart = (itemId) => {
        if (!cartItems[itemId]) {
            setCartItems((prev) => ({ ...prev, [itemId]: 1 }))
        }
        else {
            setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }))
        }
    }
    const removeFromCart = (itemId) => {
        setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] - 1 }))
    }

    useEffect(() => { console.log(cartItems) }, [cartItems])

    const contextValue = {
        food_list,
        cartItems,
        setCartItems,
        addToCart,
        removeFromCart,
        isLoggedIn,
        setIsLoggedIn
    }
    return (<StoreContext.Provider value={contextValue}>
        {props.children}
    </StoreContext.Provider>);
}
