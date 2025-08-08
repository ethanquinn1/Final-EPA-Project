# Final-EPA-Project

# Engage360 CRM

Customer Relationship Management system built with React and Node.js.

## Features

- **Interactive Dashboard** with analytics charts and data tables
- **Client Management** with detailed profiles and interaction tracking
- **User Authentication** with JWT tokens
- **Profile Settings** with real-time preferences and theme switching to be
- **Notification System** in progress
- **Responsive Design** optimized for all devices

## Tech Stack

**Frontend:**
- React 18 with Hooks
- React Router for navigation
- Recharts for data visualization
- Lucide React for icons

**Backend:**
- Node.js with Express
- MongoDB with Mongoose
- JWT authentication
- CORS enabled
- RESTful API design

## Quick Start

### Prerequisites
- Node.js (v16+)
- MongoDB (local or Atlas)
- Git

### Installation

1. **Clone the repository:**
```bash
git clone <your-repo-url>
cd engage360-crm
```

2. **Install dependencies:**
```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd client
npm install

# Install backend dependencies
cd ../server
npm install
cd ..
```

3. **Environment setup:**
Create `.env` file in `/server` directory:
```
MONGODB_URI=mongodb+srv://ethanquinnbelfast:CRMProject2025@engage360.ma0agtf.mongodb.net/engage360?retryWrites=true&w=majority&appName=Engage360
PORT=5000
NODE_ENV=development
JWT_SECRET=engage360_super_secure_jwt_key
EMAIL_USER=ethanquinnbelfast@outlook.com
EMAIL_PASS=XbOxOnE12!
```

4. **Start the application:**
```bash
# From root directory - starts both frontend and backend
npm run dev
```

This will start:
- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:5000

## Usage

### First Time Setup

1. **Register a new account** at http://localhost:3000/register
2. **Login** with your credentials
3. **Access the dashboard** to see analytics and manage clients
4. **Visit Profile Settings** to customize your preferences

### Key Pages

- **Dashboard** (`/`) - Analytics overview with charts and tables
- **Clients** (`/clients`) - Client management and detailed profiles
- **Interactions** (`/interactions`) - Track all client communications
- **Analytics** (`/analytics`) - Advanced business analytics
- **Profile Settings** (`/profile`) - User preferences and account settings

### API Endpoints

**Authentication:**
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - User login

**Clients:**
- `GET /api/clients` - Get all clients
- `POST /api/clients` - Create new client
- `GET /api/clients/:id` - Get client details

**User Management:**
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update profile
- `GET /api/user/preferences` - Get preferences
- `PUT /api/user/preferences` - Update preferences

## Development

### Project Structure
```
engage360-crm/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/         # Main page components
│   │   ├── contexts/      # React contexts
│   │   └── App.js         # Main app component
├── server/                # Node.js backend
│   ├── routes/           # API route handlers
│   ├── middleware/       # Authentication middleware
│   ├── models/          # MongoDB models
│   └── server.js        # Express server
└── package.json         # Root package.json
```

### Available Scripts

```bash
# Development (runs both frontend and backend)
npm run dev

# Frontend only
npm run client

# Backend only  
npm run server

# Build for production
npm run build
```

### Database

The application uses MongoDB. Sample data is automatically generated for development. No additional setup required for basic functionality.

## Current Status

✅ **Complete Authentication System** - JWT-based login/register
✅ **Interactive Navigation** - All buttons and menus functional
✅ **Analytics Dashboard** - 4 charts + 2 data tables working
✅ **Client Management** - Full CRUD operations
✅ **Profile Settings** - Real user data integration
✅ **Notification System** - Live notifications with backend API
✅ **British Currency** - £ symbols throughout application
✅ **Mobile Responsive** - Works on all screen sizes

## Known Issues

- Theme switching saves to backend but doesn't apply to frontend yet
- Currency changes save but don't update existing displays
- Some preference changes require page refresh

## Support

For issues or questions:
1. Check the browser console for errors
2. Verify both frontend (3000) and backend (5000) are running
3. Ensure MongoDB connection is active
4. Check network requests in browser dev tools

## License

This project is proprietary software for internal use.