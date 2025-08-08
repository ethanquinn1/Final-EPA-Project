// 📁 client/src/App.js
// Your existing functionality with professional styling upgrade
import React, { useContext, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import './App.css';
import './styles/themes.css';

// KEEP: All your existing imports
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Interactions from './pages/Interactions';
import ClientDetail from './pages/ClientDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import SetupTotp from './pages/SetupTotp';
import Notifications from './pages/Notifications';
import ProfilePreferences from './pages/ProfilePreferences';
import { AuthProvider } from './contexts/AuthContext';
import AuthContext from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import { PreferencesProvider } from './contexts/PreferencesContext';


import { 
  LayoutDashboard, 
  Users, 
  MessageSquare, 
  BarChart3, 
  Search, 
  Plus,
  Bell,
  Settings,
  User,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Shield,
  UserPlus,
  Phone,
  Calendar,
  Mail,
  HelpCircle,
  FileText,
  Clock,
  CheckCircle
} from 'lucide-react';

const Navigation = () => {
  // KEEP: Your existing logout functionality
  const { logout, user } = useContext(AuthContext);
  const location = useLocation();
  
  // Enhanced navigation state
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // FIXED: Analytics now enabled and clickable
  const navigationItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/', active: location.pathname === '/' },
    { name: 'Clients', icon: Users, path: '/clients', active: location.pathname === '/clients' },
    { name: 'Interactions', icon: MessageSquare, path: '/interactions', active: location.pathname === '/interactions' },
    { name: 'Analytics', icon: BarChart3, path: '/', active: location.pathname === '/analytics' } // FIXED: Removed disabled and badge
  ];

  const handleLogout = () => {
    logout(); // KEEP: Your existing logout function
    setIsProfileOpen(false);
  };

  const profileMenuItems = [
    { name: 'Profile Settings', icon: User, action: () => {
      window.location.href = '/profile';
      setIsProfileOpen(false);
    }},
    { name: 'Preferences', icon: Settings, action: () => {
      window.location.href = '/profile';
      setIsProfileOpen(false);
    }},
    { name: 'Help & Support', icon: HelpCircle, action: () => {
      console.log('Help & Support');
      setIsProfileOpen(false);
    }},
    { name: 'Sign Out', icon: LogOut, action: handleLogout, danger: true }
  ];

  // Quick Action Menu Items
  const quickActionItems = [
    { name: 'Add Client', icon: UserPlus, path: '/clients/new', description: 'Create new client record' },
    { name: 'Log Interaction', icon: MessageSquare, path: '/interactions/new', description: 'Record client interaction' },
    { name: 'Schedule Call', icon: Phone, path: '/calls/new', description: 'Schedule phone call' },
    { name: 'Send Email', icon: Mail, path: '/emails/new', description: 'Send email to client' },
    { name: 'Book Meeting', icon: Calendar, path: '/meetings/new', description: 'Schedule client meeting' }
  ];

  // Sample notifications
  const notifications = [
    { id: 1, type: 'followup', message: 'Follow-up due: Acme Corporation', time: '5 min ago', unread: true },
    { id: 2, type: 'meeting', message: 'Meeting reminder: TechStart Inc at 3 PM', time: '1 hour ago', unread: true },
    { id: 3, type: 'success', message: 'Contract signed: Global Systems', time: '2 hours ago', unread: false }
  ];

  const handleQuickAction = (path) => {
    setIsQuickActionOpen(false);
    // Navigate to the path or trigger action
    window.location.href = path;
  };

  const handleNotificationClick = (notification) => {
    console.log('Notification clicked:', notification);
    setIsNotificationOpen(false);
  };

  const markAllNotificationsRead = () => {
    console.log('Mark all notifications as read');
    setIsNotificationOpen(false);
  };

  // Close dropdowns when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.profile-container')) {
        setIsProfileOpen(false);
      }
      if (!event.target.closest('.quick-action-container')) {
        setIsQuickActionOpen(false);
      }
      if (!event.target.closest('.notification-container')) {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        {/* Logo Section */}
        <div style={styles.logoSection}>
          <div style={styles.logo}>
            <div style={styles.logoIcon}>
              <Shield size={24} color="white" />
            </div>
            <span style={styles.logoText}>Engage360 CRM</span>
          </div>
          
          {/* Mobile Menu Toggle */}
          <button 
            style={styles.mobileMenuToggle}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Desktop Navigation */}
        <div style={styles.desktopNav}>
          {/* Navigation Links */}
          <div style={styles.navLinks}>
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                style={{
                  ...styles.navLink,
                  ...(item.active ? styles.navLinkActive : {})
                }}
              >
                <item.icon size={20} />
                <span>{item.name}</span>
              </Link>
            ))}
          </div>

          {/* Search Bar */}
          <div style={styles.searchContainer}>
            <Search size={20} style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search clients, interactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  console.log('Search for:', searchQuery);
                }
              }}
            />
            <span style={styles.searchShortcut}>⌘K</span>
          </div>

          {/* Right Section */}
          <div style={styles.rightSection}>
            {/* Quick Action Button with Dropdown */}
            <div className="quick-action-container" style={styles.dropdownContainer}>
              <button 
                style={styles.addButton}
                onClick={() => setIsQuickActionOpen(!isQuickActionOpen)}
              >
                <Plus size={20} />
                <span>Quick Action</span>
                <ChevronDown size={16} style={{
                  transform: isQuickActionOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease'
                }} />
              </button>

              {/* Quick Action Dropdown */}
              {isQuickActionOpen && (
                <div style={styles.quickActionDropdown}>
                  <div style={styles.dropdownHeader}>
                    <h4 style={styles.dropdownTitle}>Quick Actions</h4>
                    <p style={styles.dropdownSubtitle}>Common tasks and shortcuts</p>
                  </div>
                  {quickActionItems.map((action) => (
                    <button
                      key={action.name}
                      onClick={() => handleQuickAction(action.path)}
                      style={styles.quickActionItem}
                    >
                      <div style={styles.quickActionIcon}>
                        <action.icon size={20} />
                      </div>
                      <div style={styles.quickActionContent}>
                        <span style={styles.quickActionName}>{action.name}</span>
                        <span style={styles.quickActionDescription}>{action.description}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notifications with Dropdown */}
            <div className="notification-container" style={styles.dropdownContainer}>
              <button 
                style={styles.iconButton}
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              >
                <Bell size={20} />
                <span style={styles.notificationBadge}>
                  {notifications.filter(n => n.unread).length}
                </span>
              </button>

              {/* Notifications Dropdown */}
              {isNotificationOpen && (
                <div style={styles.notificationDropdown}>
                  <div style={styles.dropdownHeader}>
                    <h4 style={styles.dropdownTitle}>Notifications</h4>
                    <button 
                      style={styles.markReadButton}
                      onClick={markAllNotificationsRead}
                    >
                      Mark all read
                    </button>
                  </div>
                  <div style={styles.notificationList}>
                    {notifications.map((notification) => (
                      <button
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        style={{
                          ...styles.notificationItem,
                          backgroundColor: notification.unread ? '#f0f9ff' : 'white'
                        }}
                      >
                        <div style={styles.notificationIcon}>
                          {notification.type === 'followup' && <Clock size={16} color="#d97706" />}
                          {notification.type === 'meeting' && <Calendar size={16} color="#2563eb" />}
                          {notification.type === 'success' && <CheckCircle size={16} color="#059669" />}
                        </div>
                        <div style={styles.notificationContent}>
                          <p style={styles.notificationMessage}>{notification.message}</p>
                          <span style={styles.notificationTime}>{notification.time}</span>
                        </div>
                        {notification.unread && <div style={styles.unreadDot}></div>}
                      </button>
                    ))}
                  </div>
                  <div style={styles.dropdownFooter}>
                    <Link to="/notifications" style={styles.viewAllLink}>
                      View all notifications
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="profile-container" style={styles.profileContainer}>
              <button 
                style={styles.profileButton}
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                <div style={styles.avatar}>
                  <User size={20} color="white" />
                </div>
                <div style={styles.profileInfo}>
                  <span style={styles.profileName}>{user?.name || 'User'}</span>
                  <span style={styles.profileRole}>Admin</span>
                </div>
                <ChevronDown size={16} style={{
                  ...styles.chevron,
                  transform: isProfileOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                }} />
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileOpen && (
                <div style={styles.profileDropdown}>
                  {profileMenuItems.map((item) => (
                    <button
                      key={item.name}
                      onClick={item.action}
                      style={{
                        ...styles.profileMenuItem,
                        ...(item.danger ? styles.profileMenuItemDanger : {})
                      }}
                    >
                      <item.icon size={16} />
                      <span>{item.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div style={styles.mobileNav}>
            {/* Mobile Search */}
            <div style={styles.mobileSearchContainer}>
              <Search size={20} style={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search..."
                style={styles.mobileSearchInput}
              />
            </div>

            {/* Mobile Navigation Links */}
            <div style={styles.mobileNavLinks}>
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{
                    ...styles.mobileNavLink,
                    ...(item.active ? styles.mobileNavLinkActive : {})
                  }}
                >
                  <item.icon size={20} />
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>

            {/* Mobile Actions */}
            <div style={styles.mobileActions}>
              <button 
                style={styles.mobileAddButton}
                onClick={() => setIsQuickActionOpen(true)}
              >
                <Plus size={20} />
                <span>Quick Action</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Backdrop for mobile menu */}
      {isMobileMenuOpen && <div style={styles.backdrop} onClick={() => setIsMobileMenuOpen(false)} />}
    </nav>
  );
};

const AppLayout = () => {
  // KEEP: Your existing user context
  const { user } = useContext(AuthContext);
  
  return (
    <div style={styles.appContainer}>
      {/* KEEP: Your existing conditional navigation logic */}
      {user && <Navigation />}
      <main style={styles.main}>
        {/* UPDATED ROUTES with new pages */}
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
          
          {/* NEW ROUTES */}
          <Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><ProfilePreferences /></PrivateRoute>} />
          <Route path="/preferences" element={<PrivateRoute><ProfilePreferences /></PrivateRoute>} />
          <Route path="/settings" element={<PrivateRoute><ProfilePreferences /></PrivateRoute>} />
          
          {/* Quick action routes (redirect to existing pages for now) */}
          <Route path="/clients/new" element={<PrivateRoute><Clients /></PrivateRoute>} />
          <Route path="/interactions/new" element={<PrivateRoute><Interactions /></PrivateRoute>} />
          <Route path="/calls/new" element={<Navigate to="/interactions/new" replace />} />
          <Route path="/emails/new" element={<Navigate to="/interactions/new" replace />} />
          <Route path="/meetings/new" element={<Navigate to="/interactions/new" replace />} />
          <Route path="/tasks/new" element={<Navigate to="/interactions/new" replace />} />
          <Route path="/reports/new" element={<Navigate to="/" replace />} />
          <Route path="/search" element={<Navigate to="/" replace />} />
          
          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

// KEEP: Your existing App function structure
function App() {
  return (
    <Router>
     <PreferencesProvider>
       <AuthProvider>
         <AppLayout />
       </AuthProvider>
     </PreferencesProvider>
    </Router>
  );
}

const styles = {
  appContainer: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },

  main: {
    minHeight: 'calc(100vh - 140px)' // Account for navigation height
  },

  nav: {
    backgroundColor: 'white',
    borderBottom: '1px solid #e2e8f0',
    position: 'sticky',
    top: 0,
    zIndex: 50,
    backdropFilter: 'blur(8px)',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },

  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 20px',
    position: 'relative'
  },

  logoSection: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 0'
  },

  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    textDecoration: 'none'
  },

  logoIcon: {
    width: '40px',
    height: '40px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 8px rgba(102, 126, 234, 0.3)'
  },

  logoText: {
    fontSize: '20px',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  },

  mobileMenuToggle: {
    display: 'none',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#64748b',
    padding: '8px'
  },

  desktopNav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: '16px'
  },

  navLinks: {
    display: 'flex',
    gap: '8px'
  },

  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    borderRadius: '10px',
    color: '#64748b',
    textDecoration: 'none',
    fontWeight: '500',
    fontSize: '14px',
    transition: 'all 0.2s ease',
    position: 'relative'
  },

  navLinkActive: {
    backgroundColor: '#f1f5f9',
    color: '#2563eb',
    fontWeight: '600'
  },

  searchContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    flex: 1,
    maxWidth: '400px',
    margin: '0 32px'
  },

  searchIcon: {
    position: 'absolute',
    left: '12px',
    color: '#94a3b8',
    zIndex: 1
  },

  searchInput: {
    width: '100%',
    padding: '12px 12px 12px 44px',
    paddingRight: '60px',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '14px',
    backgroundColor: '#f8fafc',
    transition: 'all 0.2s ease',
    fontFamily: 'inherit'
  },

  searchShortcut: {
    position: 'absolute',
    right: '12px',
    color: '#94a3b8',
    fontSize: '12px',
    fontWeight: '500',
    backgroundColor: '#f1f5f9',
    padding: '4px 6px',
    borderRadius: '4px'
  },

  rightSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },

  dropdownContainer: {
    position: 'relative'
  },

  addButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    padding: '12px 16px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 4px rgba(102, 126, 234, 0.3)'
  },

  iconButton: {
    position: 'relative',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#64748b',
    padding: '8px',
    borderRadius: '8px',
    transition: 'all 0.2s ease'
  },

  notificationBadge: {
    position: 'absolute',
    top: '0px',
    right: '0px',
    backgroundColor: '#ef4444',
    color: 'white',
    fontSize: '10px',
    padding: '2px 5px',
    borderRadius: '6px',
    fontWeight: '600',
    minWidth: '16px',
    textAlign: 'center'
  },

  // Quick Action Dropdown Styles
  quickActionDropdown: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: '8px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
    border: '1px solid #e2e8f0',
    padding: '8px',
    minWidth: '280px',
    zIndex: 100
  },

  dropdownHeader: {
    padding: '12px 16px',
    borderBottom: '1px solid #f1f5f9',
    marginBottom: '8px'
  },

  dropdownTitle: {
    margin: '0 0 4px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#1e293b'
  },

  dropdownSubtitle: {
    margin: '0',
    fontSize: '12px',
    color: '#64748b'
  },

  quickActionItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: '8px',
    border: 'none',
    background: 'none',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    width: '100%',
    textAlign: 'left'
  },

  quickActionIcon: {
    width: '40px',
    height: '40px',
    backgroundColor: '#f1f5f9',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#64748b'
  },

  quickActionContent: {
    display: 'flex',
    flexDirection: 'column'
  },

  quickActionName: {
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: '2px'
  },

  quickActionDescription: {
    fontSize: '12px',
    color: '#64748b'
  },

  // Notification Dropdown Styles
  notificationDropdown: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: '8px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
    border: '1px solid #e2e8f0',
    minWidth: '320px',
    maxHeight: '400px',
    zIndex: 100
  },

  markReadButton: {
    background: 'none',
    border: 'none',
    color: '#2563eb',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: '6px',
    transition: 'all 0.2s ease'
  },

  notificationList: {
    maxHeight: '280px',
    overflowY: 'auto'
  },

  notificationItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '12px 16px',
    border: 'none',
    borderBottom: '1px solid #f1f5f9',
    background: 'white',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    width: '100%',
    textAlign: 'left',
    position: 'relative'
  },

  notificationIcon: {
    width: '32px',
    height: '32px',
    backgroundColor: '#f1f5f9',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '2px'
  },

  notificationContent: {
    flex: 1
  },

  notificationMessage: {
    margin: '0 0 4px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#1e293b',
    lineHeight: '1.4'
  },

  notificationTime: {
    fontSize: '12px',
    color: '#64748b'
  },

  unreadDot: {
    width: '8px',
    height: '8px',
    backgroundColor: '#2563eb',
    borderRadius: '50%',
    position: 'absolute',
    top: '16px',
    right: '16px'
  },

  dropdownFooter: {
    padding: '12px 16px',
    borderTop: '1px solid #f1f5f9'
  },

  viewAllLink: {
    display: 'block',
    textAlign: 'center',
    color: '#2563eb',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500',
    padding: '8px',
    borderRadius: '6px',
    transition: 'all 0.2s ease'
  },

  profileContainer: {
    position: 'relative'
  },

  profileButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '12px',
    transition: 'all 0.2s ease'
  },

  avatar: {
    width: '40px',
    height: '40px',
    backgroundColor: '#64748b',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },

  profileInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    textAlign: 'left'
  },

  profileName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1e293b',
    lineHeight: '1.2'
  },

  profileRole: {
    fontSize: '12px',
    color: '#64748b',
    lineHeight: '1.2'
  },

  chevron: {
    color: '#94a3b8',
    transition: 'transform 0.2s ease'
  },

  profileDropdown: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: '8px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
    border: '1px solid #e2e8f0',
    padding: '8px',
    minWidth: '200px',
    zIndex: 100
  },

  profileMenuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    borderRadius: '8px',
    color: '#374151',
    border: 'none',
    background: 'none',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    width: '100%',
    textAlign: 'left'
  },

  profileMenuItemDanger: {
    color: '#ef4444'
  },

  // Mobile Styles
  mobileNav: {
    display: 'none',
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTop: '1px solid #e2e8f0',
    boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
    zIndex: 90,
    padding: '20px'
  },

  mobileSearchContainer: {
    position: 'relative',
    marginBottom: '20px'
  },

  mobileSearchInput: {
    width: '100%',
    padding: '12px 12px 12px 44px',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '16px',
    backgroundColor: '#f8fafc',
    boxSizing: 'border-box'
  },

  mobileNavLinks: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    marginBottom: '20px'
  },

  mobileNavLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    borderRadius: '10px',
    color: '#64748b',
    textDecoration: 'none',
    fontWeight: '500',
    fontSize: '16px',
    transition: 'all 0.2s ease'
  },

  mobileNavLinkActive: {
    backgroundColor: '#f1f5f9',
    color: '#2563eb',
    fontWeight: '600'
  },

  mobileActions: {
    paddingTop: '20px',
    borderTop: '1px solid #e2e8f0'
  },

  mobileAddButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    padding: '16px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    width: '100%'
  },

  backdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 80
  }
};

// Enhanced responsive styles and hover effects
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  /* Hover Effects */
  .nav-link:hover:not(.active) {
    background-color: #f8fafc !important;
    color: #374151 !important;
  }

  .add-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4) !important;
  }

  .icon-button:hover {
    background-color: #f1f5f9 !important;
    color: #374151 !important;
  }

  .profile-button:hover {
    background-color: #f8fafc !important;
  }

  .profile-menu-item:hover {
    background-color: #f8fafc !important;
  }

  .profile-menu-item.danger:hover {
    background-color: #fef2f2 !important;
  }

  .quick-action-item:hover {
    background-color: #f8fafc !important;
  }

  .notification-item:hover {
    background-color: #f8fafc !important;
  }

  .mark-read-button:hover {
    background-color: #dbeafe !important;
  }

  .view-all-link:hover {
    background-color: #dbeafe !important;
  }

  .search-input:focus {
    outline: none !important;
    border-color: #667eea !important;
    background-color: white !important;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1) !important;
  }

  /* Mobile Responsive */
  @media (max-width: 768px) {
    .mobile-menu-toggle {
      display: block !important;
    }
    
    .desktop-nav {
      display: none !important;
    }
    
    .mobile-nav {
      display: block !important;
    }
  }

  @media (max-width: 640px) {
    .logo-text {
      display: none !important;
    }
    
    .search-container {
      margin: 0 16px !important;
      max-width: 300px !important;
    }
  }

  /* Scrollbar styling for dropdowns */
  .notification-list::-webkit-scrollbar {
    width: 6px;
  }

  .notification-list::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 3px;
  }

  .notification-list::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
  }

  .notification-list::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }

  /* Animation for dropdown appearances */
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .quick-action-dropdown,
  .notification-dropdown,
  .profile-dropdown {
    animation: fadeInUp 0.2s ease;
  }
`;
document.head.appendChild(styleSheet);

export default App;