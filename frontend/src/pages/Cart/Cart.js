import React, { useContext, useState } from 'react';
import axios from 'axios';
import './Cart.css';
import { StoreContext } from '../../context/StoreContext';
import baseUrl from '../../components/Constants/base_url';
import CircularProgress from '@mui/material/CircularProgress';

const Cart = () => {
  const { cartItems, foodList, removeFromCart, getTotalCartAmount } = useContext(StoreContext);
  const [tableNumber, setTableNumber] = useState('');
  const [loading, setLoading] = useState(false); // Loading state


  const handleTableNumberClick = (number) => {
    setTableNumber((prev) => prev + number);
  };

  const clearTableNumber = () => {
    setTableNumber('');
  };

  const handlePlaceOrder = async () => {
    const totalAmount = getTotalCartAmount();

    if (!tableNumber || totalAmount === 0) {
      alert("Please enter a table number and add items to the cart.");
      return;
    }

    const receiptData = {
      Receipt_Date: new Date().toISOString().split('T')[0],
      Table_Number: tableNumber,
      Amount: totalAmount,
      Status: 'Pending',
      UserID: 1,
      Waiter: 'John Doe',
      Discount: 0
    };

    const receiptDetails = foodList
      .filter(item => cartItems[item.id] > 0)
      .map(item => ({
        Item_Name: item.name,
        Category: item.category,
        Quantity: cartItems[item.id],
        Price: item.price,
        Sub_Total: item.price * cartItems[item.id],
        Status: 1,
        kitchen_tv: 1
      }));

    try {
      setLoading(true); // Set loading to true when starting the order process
      const response = await axios.post(`${baseUrl}orders`, {
        receiptData,
        receiptDetails
      });

      if (response.status === 200) {
        setLoading(false);
        alert("Order placed successfully!");

      } else {
        setLoading(false);
        console.error("Failed to place order.");
        alert("Failed to place order. Please try again."); // Show alert on failure
      }
    } catch (error) {
      setLoading(false);
      console.error("Error:", error);
      alert("An error occurred while placing the order. Please try again."); // Show alert on error
    } finally {
      setLoading(false); // Set loading to false after the order process completes
    }
  };

  return (
    <div className='cart'>
      <div className='cart-items'>
        <div className='cart-items-title'>
          <p>Items</p>
          <p>Title</p>
          <p>Price</p>
          <p>Quantity</p>
          <p>Total</p>
          <p>Remove</p>
        </div>
        <br />
        <hr />
        {foodList.map((item, index) => {
          if (cartItems[item.id] > 0) {
            return (
              <div key={index}>
                <div className='cart-items-title cart-items-item'>
                  <img src={item.image} alt="" />
                  <p>{item.name}</p>
                  <p>${item.price}</p>
                  <p>{cartItems[item.id]}</p>
                  <p>${item.price * cartItems[item.id]}</p>
                  <p onClick={() => removeFromCart(item.id)} className='cross'>x</p>
                </div>
                <hr />
              </div>
            );
          }
          return null; // Ensure we return something if condition is false
        })}
      </div>
      <div className='cart-bottom'>
        <div className='cart-total'>
          <h2>Cart Totals</h2>
          <div>
            <div className='cart-total-details'>
              <p>Total</p>
              <p>${getTotalCartAmount()}</p>
            </div>
            <hr />
          </div>
          <button onClick={handlePlaceOrder} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : "PLACE ORDER"}
          </button>
        </div>
        <div className='cart-promocode'>
          <div>
            <p>Enter the table number here</p>
            <div className='cart-promocode-input'>
              <input
                type='text'
                placeholder='Table number'
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
              />
            </div>
            <div className='table-number-grid'>
              {Array.from({ length: 15 }, (_, i) => i + 1).map((number) => (
                <button key={number} onClick={() => handleTableNumberClick(number.toString())}>
                  {number}
                </button>
              ))}
              <button onClick={clearTableNumber}>Clear</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;
