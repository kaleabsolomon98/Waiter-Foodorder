import React, { useContext, useState, useEffect } from 'react';
import axios from 'axios';
import './Cart.css';
import { StoreContext } from '../../context/StoreContext';
import baseUrl from '../../components/Constants/base_url';
import CircularProgress from '@mui/material/CircularProgress';

const Cart = () => {
  const { cartItems, foodList, removeFromCart, getTotalCartAmount } = useContext(StoreContext);
  const [tableNumber, setTableNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [tables, setTables] = useState([]); // All tables fetched from backend
  const [selectedGroup, setSelectedGroup] = useState(1); // Default to group 1
  const [groups, setGroups] = useState([]); // Array to hold unique group IDs
  const [selectedTable, setSelectedTable] = useState(null); // Track selected table number


  // Fetch tables from backend
  useEffect(() => {
    const fetchTables = async () => {
      try {
        const response = await axios.get(`${baseUrl}tables`);
        setTables(response.data);

        // Extract unique group IDs
        const uniqueGroups = Array.from(new Set(response.data.map(table => table.groupid)));
        setGroups(uniqueGroups);
      } catch (error) {
        console.error("Failed to fetch tables:", error);
      }
    };

    fetchTables();
  }, []);

  // Handle clicking on a table number (replace and highlight)
  const handleTableNumberClick = (number) => {
    setTableNumber(number.toString()); // Replace with the new number
    setSelectedTable(number); // Set selected table number
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
      setLoading(true);
      const response = await axios.post(`${baseUrl}orders`, {
        receiptData,
        receiptDetails
      });

      if (response.status === 200) {
        alert("Order placed successfully!");
      } else {
        alert("Failed to place order. Please try again.");
      }
    } catch (error) {
      alert("An error occurred while placing the order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Filter tables by selected group
  const filteredTables = tables.filter(table => table.groupid === selectedGroup);

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
          return null;
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

            {/* Group selection buttons */}
            <div className='group-buttons'>
              {groups.map(groupID => (
                <button
                  key={groupID}
                  className={selectedGroup === groupID ? 'active group-button' : 'group-button'}
                  onClick={() => setSelectedGroup(groupID)}
                >
                  Group {groupID}
                </button>
              ))}
            </div>

            {/* Table numbers grid */}
            <div className='table-number-grid'>
              {filteredTables.map(table => (
                <button
                  key={table.table_number}
                  onClick={() => handleTableNumberClick(table.table_number)}
                  className={`table-button ${table.table_number === selectedTable ? 'selected' : ''} ${table.status === 'Available' ? 'available' : 'occupied'}`}
                >
                  {table.table_number}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;
