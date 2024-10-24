import React, { useContext, useState } from 'react'
import './Navbar.css'
import { assets } from '../../assets/frontend_assets/assets';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';



const Navbar = () => {
  const navigate = useNavigate();

  var [menu, setMenu] = useState("home");

  const { getTotalCartAmount } = useContext(StoreContext);

  return (
    <div className='navbar'>
      <img src={assets.logo} alt="" className="logo"></img>
      <ul className='navbar-menu'>
        <Link to='/home' onClick={() => setMenu('home')} className={menu === 'home' ? 'active' : ''} >home</Link>
        <a href='#explore-menu' onClick={() => setMenu('menu')} className={menu === 'menu' ? 'active' : ''} >Menu</a>
        <Link to='/category' onClick={() => setMenu('category')} className={menu === 'category' ? 'active' : ''} >Category</Link>
        <Link to='/subcategory' onClick={() => setMenu('subCategory')} className={menu === 'subCategory' ? 'active' : ''} >Sub Category</Link>
        <Link to='/menu' onClick={() => setMenu('addMenu')} className={menu === 'addMenu' ? 'active' : ''} >Add Menu</Link>

      </ul>
      <div className="navbar-right">
        {/* <img src={assets.search_icon} alt="" /> */}
        <div onClick={() => navigate('/cart', { replace: true })} className='navbar-search-icon'>
          <img src={assets.basket_icon} alt='' />
          <div className={getTotalCartAmount() === 0 ? '' : 'dot'}></div>
        </div>
        <button onClick={() => navigate('/', { replace: true })}>Sign Out</button>
      </div>
    </div>
  )
}

export default Navbar
