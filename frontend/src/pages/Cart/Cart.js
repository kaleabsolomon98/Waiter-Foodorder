import React, { useContext, useState } from 'react';
import axios from 'axios';
import './Cart.css';
import { StoreContext } from '../../context/StoreContext';
import baseUrl from '../../components/Constants/base_url';

const Cart = () => {
  const { cartItems, foodList, removeFromCart, getTotalCartAmount } = useContext(StoreContext);
  const [tableNumber, setTableNumber] = useState('');

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
      const response = await axios.post(`${baseUrl}orders`, {
        receiptData,
        receiptDetails
      });

      if (response.status === 200) {
        alert("Order placed successfully!");
      } else {
        console.error("Failed to place order.");
      }
    } catch (error) {
      console.error("Error:", error);
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
          <button onClick={handlePlaceOrder}>PLACE ORDER</button>
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
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;
