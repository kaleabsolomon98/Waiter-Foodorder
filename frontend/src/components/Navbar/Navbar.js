import React, { useContext, useState, useRef, useEffect } from 'react';
import './Navbar.css';
import { assets } from '../../assets/frontend_assets/assets';
import { Link, useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [menu, setMenu] = useState("home");
  const { getTotalCartAmount, setIsLoggedIn, fetchFoodItems } = useContext(StoreContext);
  const previousPath = useRef(location.pathname);

  useEffect(() => {
    // Scroll to #explore-menu when on the home page and menu is selected
    if (location.pathname === '/home' && menu === 'menu') {
      const element = document.getElementById('explore-menu');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location, menu]);

  useEffect(() => {
    const isNavigatingToHome = location.pathname === '/home' && previousPath.current !== '/menu';
    const isNavigatingToMenu = location.pathname === '/menu' && previousPath.current !== '/home';
    const isNavigatingToCart = location.pathname === '/cart';

    if (isNavigatingToHome || isNavigatingToMenu) {
      fetchFoodItems();
    }

    // Reset menu when navigating to cart
    if (isNavigatingToCart) {
      setMenu(''); // or set it to a default value like 'home'
    }

    // Update the previous path
    previousPath.current = location.pathname;
  }, [location, fetchFoodItems]);

  return (
    <div className='navbar'>
      <img src={assets.logo} alt="" className="logo"></img>
      <ul className='navbar-menu'>
        <Link to='/home' onClick={() => setMenu('home')} className={menu === 'home' ? 'active' : ''}>Home</Link>
        <Link to='/home' onClick={() => setMenu('menu')} className={menu === 'menu' ? 'active' : ''}>Menu</Link>
        <Link to='/category' onClick={() => setMenu('category')} className={menu === 'category' ? 'active' : ''}>Category</Link>
        <Link to='/subcategory' onClick={() => setMenu('subCategory')} className={menu === 'subCategory' ? 'active' : ''}>Sub Category</Link>
        <Link to='/menu' onClick={() => setMenu('addMenu')} className={menu === 'addMenu' ? 'active' : ''}>Add Menu</Link>
        <Link to='/order' onClick={() => setMenu('order')} className={menu === 'order' ? 'active' : ''}>Orders</Link>
        <Link to='/employee' onClick={() => setMenu('employee')} className={menu === 'employee' ? 'active' : ''}>Employee</Link>
        <Link to='/adduser' onClick={() => setMenu('adduser')} className={menu === 'adduser' ? 'active' : ''}>Add user</Link>
      </ul>
      <div className="navbar-right">
        <div onClick={() => navigate('/cart', { replace: true })} className='navbar-search-icon'>
          <img src={assets.basket_icon} alt='' />
          <div className={getTotalCartAmount() === 0 ? '' : 'dot'}></div>
        </div>
        <button onClick={() => {
          setIsLoggedIn(false);
          navigate('/', { replace: true });
        }}>Sign Out</button>
      </div>
    </div>
  );
}

export default Navbar;
