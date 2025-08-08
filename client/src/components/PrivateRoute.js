// 📁 client/src/components/PrivateRoute.js
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="text-center py-10 text-gray-500">Checking authentication...</div>;
  }

  return user ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
