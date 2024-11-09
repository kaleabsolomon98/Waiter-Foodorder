import React, { useContext } from 'react';
import Navbar from './components/Navbar/Navbar';
import { Route, Routes, Navigate } from 'react-router-dom';
import Home from './pages/Home/Home';
import Cart from './pages/Cart/Cart';
import Login from './pages/Login/Login';
import { StoreContext } from './context/StoreContext';
import './App.css';
import MenuRegistration from './pages/MenuRegistration/MenuRegistration';
import SubCategory from './pages/SubCategory/SubCategory';
import Category from './pages/Category/Category';
import OrderList from './pages/Order/OrderList';
import OrderDetails from './pages/OrderDetail/OrderDetail';
import EmployeeRegistration from './pages/Employee/Employee';
import UserRegistration from './pages/User/User';

const App = () => {
  const { isLoggedIn } = useContext(StoreContext);

  return (
    <div className={`${!isLoggedIn ? 'full-width' : 'app'}`}>
      {isLoggedIn && <Navbar />}
      <Routes>
        {/* Redirect to home if logged in and tries to access login page */}
        <Route path='/' element={isLoggedIn ? <Navigate to="/home" replace /> : <Login />} />
        {/* Ensure that home and other routes are accessible only if not logged in */}
        <Route path='/home' element={isLoggedIn ? <Home /> : <Navigate to="/" replace />} />
        <Route path='/menu' element={isLoggedIn ? <MenuRegistration /> : <Navigate to="/" replace />} />
        <Route path='/category' element={isLoggedIn ? <Category /> : <Navigate to="/" replace />} />
        <Route path='/subcategory' element={isLoggedIn ? <SubCategory /> : <Navigate to="/" replace />} />
        <Route path='/cart' element={isLoggedIn ? <Cart /> : <Navigate to="/" replace />} />
        <Route path='/order' element={isLoggedIn ? <OrderList /> : <Navigate to="/" replace />} />
        <Route path='/order-details/:id' element={isLoggedIn ? <OrderDetails /> : <Navigate to="/" replace />} />
        <Route path='/employee' element={isLoggedIn ? <EmployeeRegistration /> : <Navigate to="/" replace />} />
        <Route path='/adduser' element={isLoggedIn ? <UserRegistration /> : <Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

export default App;
