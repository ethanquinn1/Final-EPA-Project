import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Import pages
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Interactions from './pages/Interactions';
import ClientDetail from './pages/ClientDetail';


// Navigation component
const Navigation = () => {
  return (
    <nav className="bg-white shadow-lg border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-gray-900">Engage360 CRM</h1>
            </div>
            <div className="flex space-x-6">
              <a 
                href="/" 
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium border-b-2 border-transparent hover:border-blue-600 transition-colors"
              >
                Dashboard
              </a>
              <a 
                href="/clients" 
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium border-b-2 border-transparent hover:border-blue-600 transition-colors"
              >
                Clients
              </a>
              <a 
                href="/interactions" 
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium border-b-2 border-transparent hover:border-blue-600 transition-colors"
              >
                Interactions
              </a>
              <a 
                href="#" 
                className="text-gray-400 px-3 py-2 rounded-md text-sm font-medium cursor-not-allowed"
              >
                Analytics (Coming Soon)
              </a>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
              Quick Action
            </button>
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-gray-600">U</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

// Main App component
function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="max-w-7xl mx-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Navigate to="/" replace />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/interactions" element={<Interactions />} />
            <Route path="*" element={<Navigate to="/" replace />} />
            <Route path="/clients/:id" element={<ClientDetail />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;