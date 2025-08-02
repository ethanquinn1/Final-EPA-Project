// Professional Navigation Component
// Location: client/src/components/Navigation.js

import React, { useState } from 'react';
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
  X
} from 'lucide-react';

const Navigation = ({ currentPage = 'Dashboard', onNavigate, onLogout }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navigationItems = [
    { name: 'Dashboard', icon: LayoutDashboard, active: currentPage === 'Dashboard' },
    { name: 'Clients', icon: Users, active: currentPage === 'Clients' },
    { name: 'Interactions', icon: MessageSquare, active: currentPage === 'Interactions' },
    { name: 'Analytics', icon: BarChart3, active: currentPage === 'Analytics', badge: 'Soon' }
  ];

  const handleNavigation = (pageName) => {
    onNavigate(pageName);
    setIsMobileMenuOpen(false);
    setIsProfileOpen(false);
  };

  const handleLogout = () => {
    onLogout();
    setIsProfileOpen(false);
  };

  const profileMenuItems = [
    { name: 'Profile Settings', icon: User, action: () => console.log('Profile Settings') },
    { name: 'Preferences', icon: Settings, action: () => console.log('Preferences') },
    { name: 'Sign Out', icon: LogOut, action: handleLogout, danger: true }
  ];

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        {/* Logo Section */}
        <div style={styles.logoSection}>
          <div style={styles.logo}>
            <div style={styles.logoIcon}>
              <LayoutDashboard size={24} color="white" />
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
              <button
                key={item.name}
                onClick={() => handleNavigation(item.name)}
                style={{
                  ...styles.navLink,
                  ...(item.active ? styles.navLinkActive : {})
                }}
              >
                <item.icon size={20} />
                <span>{item.name}</span>
                {item.badge && (
                  <span style={styles.badge}>{item.badge}</span>
                )}
              </button>
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
            />
            <span style={styles.searchShortcut}>⌘K</span>
          </div>

          {/* Right Section */}
          <div style={styles.rightSection}>
            {/* Add Client Button */}
            <button style={styles.addButton}>
              <Plus size={20} />
              <span>Add Client</span>
            </button>

            {/* Notifications */}
            <button style={styles.iconButton}>
              <Bell size={20} />
              <span style={styles.notificationBadge}>3</span>
            </button>

            {/* Profile Dropdown */}
            <div style={styles.profileContainer}>
              <button 
                style={styles.profileButton}
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                <div style={styles.avatar}>
                  <User size={20} color="white" />
                </div>
                <div style={styles.profileInfo}>
                  <span style={styles.profileName}>John Doe</span>
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
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.name)}
                  style={{
                    ...styles.mobileNavLink,
                    ...(item.active ? styles.mobileNavLinkActive : {})
                  }}
                >
                  <item.icon size={20} />
                  <span>{item.name}</span>
                  {item.badge && (
                    <span style={styles.mobileBadge}>{item.badge}</span>
                  )}
                </button>
              ))}
            </div>

            {/* Mobile Actions */}
            <div style={styles.mobileActions}>
              <button style={styles.mobileAddButton}>
                <Plus size={20} />
                <span>Add Client</span>
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

const styles = {
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

  badge: {
    backgroundColor: '#f59e0b',
    color: 'white',
    fontSize: '10px',
    padding: '2px 6px',
    borderRadius: '6px',
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
    border: 'none',
    background: 'none',
    fontWeight: '500',
    fontSize: '16px',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    width: '100%',
    textAlign: 'left'
  },

  mobileNavLinkActive: {
    backgroundColor: '#f1f5f9',
    color: '#2563eb',
    fontWeight: '600'
  },

  mobileBadge: {
    backgroundColor: '#f59e0b',
    color: 'white',
    fontSize: '10px',
    padding: '2px 6px',
    borderRadius: '6px',
    fontWeight: '600',
    marginLeft: 'auto'
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
`;
document.head.appendChild(styleSheet);

export default Navigation;