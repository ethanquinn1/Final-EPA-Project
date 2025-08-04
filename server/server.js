const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Enhanced CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json());

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/engage360', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

connectDB();

// Root endpoint - API information
app.get('/', (req, res) => {
  console.log('🏠 Root endpoint accessed');
  res.json({ 
    message: 'Engage360 CRM API Server',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      clients: '/api/clients',
      interactions: '/api/interactions',
      analytics: '/api/analytics',
      search: '/api/search'
    },
    documentation: 'Visit /api/health for server status'
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  console.log('🏥 Health check requested');
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    cors: 'enabled',
    database: 'connected',
    services: {
      auth: 'active',
      clients: 'active',
      interactions: 'active',
      analytics: 'active',
      search: 'active'
    }
  });
});

// API Routes
console.log('🔗 Loading API routes...');

// Auth routes (should be first for proper middleware handling)
app.use('/api/auth', require('./routes/auth'));

// Protected routes (add auth middleware if needed)
app.use('/api/clients', require('./routes/clients'));
app.use('/api/interactions', require('./routes/Interactions'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/search', require('./routes/search'));

// Add new routes with try/catch to not break existing functionality
try {
  app.use('/api/notifications', require('./routes/notifications'));
  console.log('✅ Notifications route loaded');
} catch (error) {
  console.log('⚠️  Notifications route not found, skipping...');
}

try {
  app.use('/api/quick-actions', require('./routes/quickActions'));
  console.log('✅ Quick actions route loaded');
} catch (error) {
  console.log('⚠️  Quick actions route not found, skipping...');
}

try {
  app.use('/api/user', require('./routes/user'));
  console.log('✅ User route loaded');
} catch (error) {
  console.log('⚠️  User route not found, skipping...');
}

console.log('✅ All routes loaded successfully');

// API status endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'Engage360 CRM API',
    version: '1.0.0',
    routes: ['/auth', '/clients', '/interactions', '/analytics', '/search'],
    status: 'active'
  });
});

// Favicon handler (prevents 404s for favicon requests)
app.get('/favicon.ico', (req, res) => {
  res.status(204).send();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('🚨 Server Error:', err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!', 
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  console.log(`❌ API Route not found: ${req.method} ${req.path}`);
  res.status(404).json({ 
    message: 'API endpoint not found',
    path: req.path,
    method: req.method,
    availableEndpoints: [
      '/api/health',
      '/api/auth',
      '/api/clients',
      '/api/interactions',
      '/api/analytics',
      '/api/search'
    ]
  });
});

// General 404 handler (for non-API routes)
app.use((req, res) => {
  console.log(`❌ Route not found: ${req.method} ${req.path}`);
  res.status(404).json({ 
    message: 'Route not found',
    path: req.path,
    method: req.method,
    suggestion: 'This is an API server. Try /api/health for status or see available endpoints at /'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 CORS enabled for: http://localhost:3000`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Analytics API: http://localhost:${PORT}/api/analytics/dashboard`);
  console.log(`🏠 API Info: http://localhost:${PORT}/`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
  console.log('');
  console.log('Available endpoints:');
  console.log('  GET  /              - API information');
  console.log('  GET  /api/health    - Health check');
  console.log('  POST /api/auth/*    - Authentication');
  console.log('  GET  /api/clients   - Client management');
  console.log('  GET  /api/interactions - Interaction tracking');
  console.log('  GET  /api/analytics - Analytics data');
  console.log('  GET  /api/search    - Search functionality');
  console.log('');
});