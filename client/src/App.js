import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Pages
import Clients from './pages/Clients';

// Simple Navigation Component
const Navigation = () => {
  return (
    <nav className="bg-blue-600 shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-white text-xl font-bold">Engage360</h1>
            </div>
            <div className="ml-10 flex space-x-8">
              <a
                href="/clients"
                className="text-white hover:text-blue-200 px-3 py-2 rounded-md text-sm font-medium"
              >
                Clients
              </a>
              <a
                href="/dashboard"
                className="text-blue-200 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Dashboard (Coming Soon)
              </a>
              <a
                href="/interactions"
                className="text-blue-200 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Interactions (Coming Soon)
              </a>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

// Simple Dashboard Component
const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Welcome to Engage360 CRM
          </p>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Stats</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-800">Total Clients</h3>
              <p className="text-2xl font-bold text-blue-900">Coming Soon</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-green-800">Active Clients</h3>
              <p className="text-2xl font-bold text-green-900">Coming Soon</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-yellow-800">Follow-ups Due</h3>
              <p className="text-2xl font-bold text-yellow-900">Coming Soon</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-purple-800">Avg Engagement</h3>
              <p className="text-2xl font-bold text-purple-900">Coming Soon</p>
            </div>
          </div>
          
          <div className="mt-8">
            <p className="text-gray-600">
              Get started by <a href="/clients" className="text-blue-600 hover:text-blue-800">managing your clients</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <div className="App">
        <Navigation />
        <main>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;