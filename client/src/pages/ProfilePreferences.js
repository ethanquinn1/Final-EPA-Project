// client/src/pages/ProfilePreferences.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Settings,
  Bell,
  Shield,
  ArrowLeft,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';

const ProfilePreferences = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Profile state
  const [profile, setProfile] = useState({
    name: 'John Doe',
    email: 'john@engage360.com',
    phone: '+44 20 1234 5678',
    address: 'London, UK'
  });

  // Preferences state
  const [preferences, setPreferences] = useState({
    theme: 'light',
    language: 'en',
    timezone: 'Europe/London',
    currency: 'GBP',
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false
  });

  // Password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const saveProfile = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      alert('Profile updated successfully!');
    }, 1000);
  };

  const savePreferences = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      alert('Preferences updated successfully!');
    }, 1000);
  };

  const changePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 8) {
      alert('Password must be at least 8 characters long');
      return;
    }
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      alert('Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }, 1000);
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'preferences', name: 'Preferences', icon: Settings },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 100%)'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'rgba(255,255,255,0.8)',
        backdropFilter: 'blur(8px)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        borderBottom: '1px solid #e2e8f0',
        position: 'sticky',
        top: 0,
        zIndex: 40
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 16px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '24px 0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Link
                to="/"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#64748b',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                <ArrowLeft size={20} />
                <span>Back to Dashboard</span>
              </Link>
              <div>
                <h1 style={{
                  fontSize: '32px',
                  fontWeight: 'bold',
                  background: 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  margin: '0'
                }}>
                  Settings
                </h1>
                <p style={{
                  margin: '4px 0 0',
                  fontSize: '14px',
                  color: '#64748b'
                }}>
                  Manage your profile and preferences
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                if (activeTab === 'profile') saveProfile();
                else if (activeTab === 'preferences' || activeTab === 'notifications') savePreferences();
                else if (activeTab === 'security') changePassword();
              }}
              disabled={saving}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                backgroundColor: '#2563eb',
                color: 'white',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                fontWeight: '500',
                opacity: saving ? 0.7 : 1
              }}
            >
              {saving ? (
                <>
                  <RefreshCw style={{ 
                    width: '16px', 
                    height: '16px',
                    animation: 'spin 1s linear infinite'
                  }} />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save style={{ width: '16px', height: '16px' }} />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '32px 16px'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '280px 1fr',
          gap: '32px'
        }}>
          {/* Sidebar */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e2e8f0',
            height: 'fit-content'
          }}>
            <nav>
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      width: '100%',
                      padding: '12px 16px',
                      marginBottom: '8px',
                      backgroundColor: activeTab === tab.id ? '#f1f5f9' : 'transparent',
                      color: activeTab === tab.id ? '#2563eb' : '#64748b',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      fontSize: '14px',
                      fontWeight: '500',
                      textAlign: 'left'
                    }}
                  >
                    <Icon size={20} />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e2e8f0',
            overflow: 'hidden'
          }}>
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div style={{ padding: '32px' }}>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: '600',
                  color: '#1e293b',
                  margin: '0 0 24px'
                }}>
                  Profile Information
                </h2>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '24px'
                }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#1e293b',
                      marginBottom: '8px'
                    }}>
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfile({...profile, name: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontFamily: 'inherit',
                        boxSizing: 'border-box'
                      }}
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#1e293b',
                      marginBottom: '8px'
                    }}>
                      Email Address
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={20} style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#94a3b8'
                      }} />
                      <input
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({...profile, email: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '12px 16px 12px 44px',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontFamily: 'inherit',
                          boxSizing: 'border-box'
                        }}
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#1e293b',
                      marginBottom: '8px'
                    }}>
                      Phone Number
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Phone size={20} style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#94a3b8'
                      }} />
                      <input
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => setProfile({...profile, phone: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '12px 16px 12px 44px',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontFamily: 'inherit',
                          boxSizing: 'border-box'
                        }}
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#1e293b',
                      marginBottom: '8px'
                    }}>
                      Address
                    </label>
                    <div style={{ position: 'relative' }}>
                      <MapPin size={20} style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#94a3b8'
                      }} />
                      <input
                        type="text"
                        value={profile.address}
                        onChange={(e) => setProfile({...profile, address: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '12px 16px 12px 44px',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontFamily: 'inherit',
                          boxSizing: 'border-box'
                        }}
                        placeholder="Enter your address"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div style={{ padding: '32px' }}>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: '600',
                  color: '#1e293b',
                  margin: '0 0 24px'
                }}>
                  Preferences
                </h2>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '24px'
                }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#1e293b',
                      marginBottom: '8px'
                    }}>
                      Theme
                    </label>
                    <select
                      value={preferences.theme}
                      onChange={(e) => setPreferences({
                        ...preferences,
                        theme: e.target.value
                      })}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontFamily: 'inherit',
                        boxSizing: 'border-box'
                      }}
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="auto">Auto</option>
                    </select>
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#1e293b',
                      marginBottom: '8px'
                    }}>
                      Language
                    </label>
                    <select
                      value={preferences.language}
                      onChange={(e) => setPreferences({
                        ...preferences,
                        language: e.target.value
                      })}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontFamily: 'inherit',
                        boxSizing: 'border-box'
                      }}
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                    </select>
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#1e293b',
                      marginBottom: '8px'
                    }}>
                      Currency
                    </label>
                    <select
                      value={preferences.currency}
                      onChange={(e) => setPreferences({
                        ...preferences,
                        currency: e.target.value
                      })}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontFamily: 'inherit',
                        boxSizing: 'border-box'
                      }}
                    >
                      <option value="GBP">British Pound (£)</option>
                      <option value="USD">US Dollar ($)</option>
                      <option value="EUR">Euro (€)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div style={{ padding: '32px' }}>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: '600',
                  color: '#1e293b',
                  margin: '0 0 24px'
                }}>
                  Notification Settings
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}>
                    <div>
                      <h4 style={{
                        fontSize: '16px',
                        fontWeight: '500',
                        color: '#1e293b',
                        margin: '0 0 4px'
                      }}>
                        Email Notifications
                      </h4>
                      <p style={{
                        fontSize: '14px',
                        color: '#64748b',
                        margin: '0'
                      }}>
                        Receive notifications via email
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.emailNotifications}
                      onChange={(e) => setPreferences({
                        ...preferences,
                        emailNotifications: e.target.checked
                      })}
                      style={{
                        width: '20px',
                        height: '20px',
                        cursor: 'pointer'
                      }}
                    />
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}>
                    <div>
                      <h4 style={{
                        fontSize: '16px',
                        fontWeight: '500',
                        color: '#1e293b',
                        margin: '0 0 4px'
                      }}>
                        Push Notifications
                      </h4>
                      <p style={{
                        fontSize: '14px',
                        color: '#64748b',
                        margin: '0'
                      }}>
                        Receive push notifications in browser
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.pushNotifications}
                      onChange={(e) => setPreferences({
                        ...preferences,
                        pushNotifications: e.target.checked
                      })}
                      style={{
                        width: '20px',
                        height: '20px',
                        cursor: 'pointer'
                      }}
                    />
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}>
                    <div>
                      <h4 style={{
                        fontSize: '16px',
                        fontWeight: '500',
                        color: '#1e293b',
                        margin: '0 0 4px'
                      }}>
                        SMS Notifications
                      </h4>
                      <p style={{
                        fontSize: '14px',
                        color: '#64748b',
                        margin: '0'
                      }}>
                        Receive important updates via SMS
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.smsNotifications}
                      onChange={(e) => setPreferences({
                        ...preferences,
                        smsNotifications: e.target.checked
                      })}
                      style={{
                        width: '20px',
                        height: '20px',
                        cursor: 'pointer'
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div style={{ padding: '32px' }}>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: '600',
                  color: '#1e293b',
                  margin: '0 0 24px'
                }}>
                  Security Settings
                </h2>

                <div style={{
                  backgroundColor: '#f8fafc',
                  padding: '24px',
                  borderRadius: '12px'
                }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#1e293b',
                    margin: '0 0 16px'
                  }}>
                    Change Password
                  </h3>

                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px'
                  }}>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#1e293b',
                        marginBottom: '8px'
                      }}>
                        Current Password
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({
                            ...passwordData,
                            currentPassword: e.target.value
                          })}
                          style={{
                            width: '100%',
                            padding: '12px 44px 12px 16px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontFamily: 'inherit',
                            boxSizing: 'border-box'
                          }}
                          placeholder="Enter current password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          style={{
                            position: 'absolute',
                            right: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#94a3b8'
                          }}
                        >
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '16px'
                    }}>
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '14px',
                          fontWeight: '500',
                          color: '#1e293b',
                          marginBottom: '8px'
                        }}>
                          New Password
                        </label>
                        <input
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({
                            ...passwordData,
                            newPassword: e.target.value
                          })}
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontFamily: 'inherit',
                            boxSizing: 'border-box'
                          }}
                          placeholder="Enter new password"
                        />
                      </div>

                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '14px',
                          fontWeight: '500',
                          color: '#1e293b',
                          marginBottom: '8px'
                        }}>
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({
                            ...passwordData,
                            confirmPassword: e.target.value
                          })}
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontFamily: 'inherit',
                            boxSizing: 'border-box'
                          }}
                          placeholder="Confirm new password"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default ProfilePreferences;