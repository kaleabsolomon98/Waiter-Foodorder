import React, { useContext } from 'react'
import './Cart.css'
import { StoreContext } from '../../context/StoreContext'

const Cart = () => {
  const { cartItems, foodList, removeFromCart,  getTotalCartAmount } = useContext(StoreContext);
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
        {
          foodList.map((item, index) => {
            if (cartItems[item.id] > 0) {
              return (
                <div>
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
          })
        }
      </div>
      <div className='cart-bottom'>
        <div className='cart-total'>
          <h2>Cart Totals</h2>
          <div>
            <div className='cart-total-details'>
              <p>Total</p>
              <p>${getTotalCartAmount()}</p>
            </div>
            <hr/>
          </div>
          <button>PLACE ORDER</button>
        </div>
      </div>
    </div>
  )
}

export default Cart
