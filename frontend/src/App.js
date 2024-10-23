import React, { useContext } from 'react';
import Navbar from './components/Navbar/Navbar';
import { Route, Routes, Navigate } from 'react-router-dom';
import Placeorder from './pages/PlaceOrder/Placeorder';
import Home from './pages/Home/Home';
import Cart from './pages/Cart/Cart';
import Login from './pages/Login/Login';
import { StoreContext } from './context/StoreContext';
import './App.css';
import MenuRegistration from './pages/MenuRegistration/MenuRegistration';

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
        <Route path='/cart' element={isLoggedIn ? <Cart /> : <Navigate to="/" replace />} />
        <Route path='/order' element={isLoggedIn ? <Placeorder /> : <Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

export default App;
