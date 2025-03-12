import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from "./components/Register";
import UserDashboard from './components/UserDashboard';
import BankerDashboard from './components/BankerDashboard';

// Protected route component
const ProtectedRoute = ({ children, allowedUserType }) => {
  const token = localStorage.getItem('token');
  const userType = localStorage.getItem('userType');
  
  if (!token) {
    return <Navigate to="/login" />;
  }
  
  if (allowedUserType && userType !== allowedUserType) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={
          <ProtectedRoute allowedUserType="user">
            <UserDashboard />
          </ProtectedRoute>
        } />
        <Route path="/banker-dashboard" element={
          <ProtectedRoute allowedUserType="banker">
            <BankerDashboard />
          </ProtectedRoute>
        } />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;