import React, { useContext, useState } from 'react'
import './Navbar.css'
import { assets } from '../../assets/frontend_assets/assets';
import { Link, useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';
import { useEffect } from 'react';



const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  var [menu, setMenu] = useState("home");

  const { getTotalCartAmount, setIsLoggedIn } = useContext(StoreContext);

  useEffect(() => {
    // Scroll to #explore-menu when on the home page and menu is selected
    if (location.pathname === '/home' && menu === 'menu') {
      const element = document.getElementById('explore-menu');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location, menu]); 

  return (
    <div className='navbar'>
      <img src={assets.logo} alt="" className="logo"></img>
      <ul className='navbar-menu'>
        <Link to='/home' onClick={() => setMenu('home')} className={menu === 'home' ? 'active' : ''} >home</Link>
        <Link to='/home' onClick={() => setMenu('menu')}  className={menu === 'menu' ? 'active' : ''} >Menu</Link>
        {/* <a href='#explore-menu' onClick={() => setMenu('menu')} className={menu === 'menu' ? 'active' : ''} >Menu</a> */}
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
        <button onClick={() => {
          console.log("--------PRINT LOGGING OUT--------");
          setIsLoggedIn(false);
          navigate('/', { replace: true });
        }}>Sign Out</button>
      </div>
    </div>
  )
}

export default Navbar
