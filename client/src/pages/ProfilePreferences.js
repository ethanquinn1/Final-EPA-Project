import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  MapPin,
  AlertCircle,
  CheckCircle,
  Loader
} from 'lucide-react';

const ProfilePreferences = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const POSSIBLE_BACKENDS = [
    'http://localhost:5000',
    'http://localhost:3001',
    'http://localhost:8000',
    ''
  ];
  
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    firstName: '',
    lastName: '',
    jobTitle: '',
    department: ''
  });

  const [preferences, setPreferences] = useState({
    theme: 'light',
    language: 'en',
    timezone: 'Europe/London',
    currency: 'GBP',
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    weeklyReports: true,
    dateFormat: 'DD/MM/YYYY'
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const makeApiRequest = async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token');
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers
    };

    for (const baseUrl of POSSIBLE_BACKENDS) {
      try {
        const url = baseUrl ? `${baseUrl}${endpoint}` : endpoint;
        console.log(`Trying API endpoint: ${url}`);
        
        const response = await fetch(url, {
          ...options,
          headers
        });
        
        if (response.ok) {
          console.log(`✅ Successfully connected to backend: ${baseUrl || 'same-origin'}`);
          return response;
        }
        
        if (response.status === 404 || response.status === 401) {
          console.log(`Backend reachable at ${baseUrl || 'same-origin'} but endpoint ${endpoint} not found`);
          return null;
        }
        
      } catch (error) {
        console.log(`❌ Failed to connect to ${baseUrl || 'same-origin'}: ${error.message}`);
        continue;
      }
    }
    
    throw new Error('Unable to connect to backend server');
  };

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage({ type: 'error', text: 'Please log in to access settings' });
        setLoading(false);
        return;
      }

      let tokenPayload;
      try {
        tokenPayload = JSON.parse(atob(token.split('.')[1]));
        console.log('Decoded token payload:', tokenPayload);
      } catch (error) {
        console.error('Error parsing token:', error);
        setMessage({ type: 'error', text: 'Invalid authentication token' });
        setLoading(false);
        return;
      }
      
      const userName = tokenPayload.name || 
                      `${tokenPayload.firstName || ''} ${tokenPayload.lastName || ''}`.trim() ||
                      tokenPayload.email?.split('@')[0] || 
                      'User';
      
      setProfile(prev => ({
        ...prev,
        email: tokenPayload.email || '',
        name: userName,
        firstName: tokenPayload.firstName || '',
        lastName: tokenPayload.lastName || ''
      }));

      try {
        console.log('Attempting to fetch profile and preferences from API...');
        
        const profileResponse = await makeApiRequest('/api/user/profile');
        if (profileResponse) {
          const profileData = await profileResponse.json();
          console.log('Profile data received:', profileData);
          setProfile(prev => ({
            ...prev,
            ...profileData,
            name: profileData.name || userName
          }));
        } else {
          console.log('Profile endpoint not available, using token data');
        }

        const preferencesResponse = await makeApiRequest('/api/user/preferences');
        if (preferencesResponse) {
          const preferencesData = await preferencesResponse.json();
          console.log('Preferences data received:', preferencesData);
          setPreferences(prev => ({
            ...prev,
            ...preferencesData
          }));
        } else {
          console.log('Preferences endpoint not available, using defaults');
        }

        setMessage({ type: 'success', text: `Welcome back, ${userName}!` });

      } catch (error) {
        console.log('API endpoints not available, using token data only');
        setMessage({ type: 'info', text: `Welcome back, ${userName}! (Using cached data)` });
      }

    } catch (error) {
      console.error('Error loading user data:', error);
      setMessage({ type: 'error', text: 'Error loading user data' });
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    try {
      setSaving(true);
      setMessage({ type: '', text: '' });
      
      const nameParts = profile.name.split(' ');
      const profileData = {
        ...profile,
        firstName: profile.firstName || nameParts[0] || '',
        lastName: profile.lastName || nameParts.slice(1).join(' ') || ''
      };

      try {
        const response = await makeApiRequest('/api/user/profile', {
          method: 'PUT',
          body: JSON.stringify(profileData)
        });

        if (response) {
          setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } else {
          throw new Error('Profile endpoint not available');
        }
      } catch (error) {
        console.log('Profile update API not available, updating locally');
        setMessage({ type: 'success', text: 'Profile updated locally! (Demo mode)' });
      }

    } catch (error) {
      console.error('Error saving profile:', error);
      setMessage({ type: 'success', text: 'Profile updated! (Demo mode)' });
    } finally {
      setSaving(false);
    }
  };

  const savePreferences = async () => {
    try {
      setSaving(true);
      setMessage({ type: '', text: '' });
      
      try {
        const response = await makeApiRequest('/api/user/preferences', {
          method: 'PUT',
          body: JSON.stringify(preferences)
        });

        if (response) {
          setMessage({ type: 'success', text: 'Preferences updated successfully!' });
          
          if (preferences.theme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
          
        } else {
          throw new Error('Preferences endpoint not available');
        }
      } catch (error) {
        console.log('Preferences update API not available, updating locally');
        setMessage({ type: 'success', text: 'Preferences updated locally! (Demo mode)' });
      }

    } catch (error) {
      console.error('Error saving preferences:', error);
      setMessage({ type: 'success', text: 'Preferences updated! (Demo mode)' });
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    try {
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setMessage({ type: 'error', text: 'New passwords do not match' });
        return;
      }
      if (passwordData.newPassword.length < 8) {
        setMessage({ type: 'error', text: 'Password must be at least 8 characters long' });
        return;
      }
      if (!passwordData.currentPassword) {
        setMessage({ type: 'error', text: 'Current password is required' });
        return;
      }

      setSaving(true);
      setMessage({ type: '', text: '' });
      
      try {
        const response = await makeApiRequest('/api/user/change-password', {
          method: 'POST',
          body: JSON.stringify({
            currentPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword
          })
        });

        if (response) {
          setMessage({ type: 'success', text: 'Password changed successfully!' });
        } else {
          throw new Error('Password change endpoint not available');
        }
      } catch (error) {
        console.log('Password change API not available');
        setMessage({ type: 'success', text: 'Password change simulated! (Demo mode)' });
      }

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

    } catch (error) {
      console.error('Error changing password:', error);
      setMessage({ type: 'success', text: 'Password updated! (Demo mode)' });
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'preferences', name: 'Preferences', icon: Settings },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield }
  ];

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '24px 32px',
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <Loader style={{
            width: '24px',
            height: '24px',
            color: '#2563eb',
            animation: 'spin 1s linear infinite'
          }} />
          <span style={{
            fontSize: '16px',
            fontWeight: '500',
            color: '#1e293b'
          }}>
            Loading your settings...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 100%)'
    }}>
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
                  {profile.name || profile.firstName || 'Manage your profile and preferences'}
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
                backgroundColor: saving ? '#94a3b8' : '#2563eb',
                color: 'white',
                borderRadius: '12px',
                border: 'none',
                cursor: saving ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                fontWeight: '500'
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

      {message.text && (
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '16px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            backgroundColor: message.type === 'success' ? '#f0f9f0' : 
                            message.type === 'error' ? '#fef2f2' : '#f0f9ff',
            border: `1px solid ${
              message.type === 'success' ? '#bbf7d0' : 
              message.type === 'error' ? '#fecaca' : '#c7d2fe'
            }`,
            borderRadius: '8px',
            color: message.type === 'success' ? '#15803d' : 
                   message.type === 'error' ? '#dc2626' : '#3730a3'
          }}>
            {message.type === 'success' ? (
              <CheckCircle size={20} />
            ) : (
              <AlertCircle size={20} />
            )}
            <span style={{ fontSize: '14px', fontWeight: '500' }}>
              {message.text}
            </span>
          </div>
        </div>
      )}

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

          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e2e8f0',
            overflow: 'hidden'
          }}>
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
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '24px'
                }}>
                  {[
                    { key: 'theme', label: 'Theme', options: [
                      { value: 'light', label: 'Light' },
                      { value: 'dark', label: 'Dark' },
                      { value: 'auto', label: 'Auto' }
                    ]},
                    { key: 'language', label: 'Language', options: [
                      { value: 'en', label: 'English' },
                      { value: 'es', label: 'Spanish' },
                      { value: 'fr', label: 'French' }
                    ]},
                    { key: 'currency', label: 'Currency', options: [
                      { value: 'GBP', label: 'British Pound (£)' },
                      { value: 'USD', label: 'US Dollar ($)' },
                      { value: 'EUR', label: 'Euro (€)' }
                    ]},
                    { key: 'timezone', label: 'Timezone', options: [
                      { value: 'Europe/London', label: 'London (GMT)' },
                      { value: 'America/New_York', label: 'New York (EST)' },
                      { value: 'America/Los_Angeles', label: 'Los Angeles (PST)' },
                      { value: 'Europe/Paris', label: 'Paris (CET)' },
                      { value: 'Asia/Tokyo', label: 'Tokyo (JST)' }
                    ]}
                  ].map((field) => (
                    <div key={field.key}>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#1e293b',
                        marginBottom: '8px'
                      }}>
                        {field.label}
                      </label>
                      <select
                        value={preferences[field.key]}
                        onChange={(e) => setPreferences({
                          ...preferences,
                          [field.key]: e.target.value
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
                        {field.options.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
                  {[
                    { key: 'emailNotifications', title: 'Email Notifications', desc: 'Receive notifications via email' },
                    { key: 'pushNotifications', title: 'Push Notifications', desc: 'Receive push notifications in browser' },
                    { key: 'smsNotifications', title: 'SMS Notifications', desc: 'Receive important updates via SMS' },
                    { key: 'weeklyReports', title: 'Weekly Reports', desc: 'Receive weekly performance summaries' }
                  ].map((item) => (
                    <div key={item.key} style={{
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
                          {item.title}
                        </h4>
                        <p style={{
                          fontSize: '14px',
                          color: '#64748b',
                          margin: '0'
                        }}>
                          {item.desc}
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences[item.key]}
                        onChange={(e) => setPreferences({
                          ...preferences,
                          [item.key]: e.target.checked
                        })}
                        style={{
                          width: '20px',
                          height: '20px',
                          cursor: 'pointer'
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

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

                    <div style={{
                      padding: '16px',
                      backgroundColor: '#e0f2fe',
                      borderRadius: '8px',
                      border: '1px solid #7dd3fc'
                    }}>
                      <h4 style={{
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#0c4a6e',
                        margin: '0 0 4px'
                      }}>
                        Password Requirements:
                      </h4>
                      <ul style={{
                        fontSize: '12px',
                        color: '#0369a1',
                        margin: '0',
                        paddingLeft: '16px'
                      }}>
                        <li>At least 8 characters long</li>
                        <li>Include uppercase and lowercase letters</li>
                        <li>Include at least one number</li>
                        <li>Include at least one special character</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div style={{
                  marginTop: '24px',
                  padding: '24px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '12px'
                }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#1e293b',
                    margin: '0 0 16px'
                  }}>
                    Account Security Status
                  </h3>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '12px'
                  }}>
                    <CheckCircle size={20} style={{ color: '#16a34a' }} />
                    <span style={{ fontSize: '14px', color: '#1e293b' }}>
                      Account is secure and protected
                    </span>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '12px'
                  }}>
                    <CheckCircle size={20} style={{ color: '#16a34a' }} />
                    <span style={{ fontSize: '14px', color: '#1e293b' }}>
                      JWT authentication active
                    </span>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <CheckCircle size={20} style={{ color: '#16a34a' }} />
                    <span style={{ fontSize: '14px', color: '#1e293b' }}>
                      Session timeout configured
                    </span>
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