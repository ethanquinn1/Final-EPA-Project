import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import './App.css';

// Import pages
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Interactions from './pages/Interactions';
import ClientDetail from './pages/ClientDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import SetupTotp from './pages/SetupTotp';

// Auth & Protected Routes
import { AuthProvider } from './context/AuthContext';
import AuthContext from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';

const Navigation = () => {
  const { logout } = useContext(AuthContext);
  
  return (
    <nav className="bg-white shadow-lg border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-gray-900">Engage360 CRM</h1>
            </div>
            <div className="flex space-x-6">
              <Link 
                to="/" 
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium border-b-2 border-transparent hover:border-blue-600 transition-colors"
              >
                Dashboard
              </Link>
              <Link 
                to="/clients" 
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium border-b-2 border-transparent hover:border-blue-600 transition-colors"
              >
                Clients
              </Link>
              <Link 
                to="/interactions" 
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium border-b-2 border-transparent hover:border-blue-600 transition-colors"
              >
                Interactions
              </Link>
              <span className="text-gray-400 px-3 py-2 rounded-md text-sm font-medium cursor-not-allowed">
                Analytics (Coming Soon)
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
              Quick Action
            </button>
            <button
              onClick={logout}
              className="bg-gray-200 hover:bg-gray-300 text-sm text-gray-700 px-3 py-1 rounded"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

const AppLayout = () => {
  const { user } = useContext(AuthContext);
  
  return (
    <div className="min-h-screen bg-gray-50">
      {user && <Navigation />}
      <main className="max-w-7xl mx-auto">
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/setup-totp" element={<SetupTotp />} />
          
          {/* Protected routes */}
          <Route 
            path="/" 
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } 
          />
          <Route path="/dashboard" element={<Navigate to="/" replace />} />
          <Route path="/clients" element={<PrivateRoute><Clients /></PrivateRoute>} />
          <Route path="/interactions" element={<PrivateRoute><Interactions /></PrivateRoute>} />
          <Route path="/clients/:id" element={<PrivateRoute><ClientDetail /></PrivateRoute>} />
          
          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </Router>
  );
}

export default App;