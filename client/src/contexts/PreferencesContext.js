import React, { createContext, useContext, useState, useEffect } from 'react';

const PreferencesContext = createContext();

export const usePreferences = () => {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within PreferencesProvider');
  }
  return context;
};

export const PreferencesProvider = ({ children }) => {
  const [preferences, setPreferences] = useState({
    theme: 'light',
    language: 'en',
    timezone: 'Europe/London',
    currency: 'GBP',
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    weeklyReports: true
  });

  const loadPreferences = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:5000/api/user/preferences', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPreferences(data);
        applyTheme(data.theme);
      }
    } catch (error) {
      console.log('Using default preferences');
    }
  };

  const updatePreferences = async (newPreferences) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:5000/api/user/preferences', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newPreferences)
      });

      if (response.ok) {
        setPreferences(newPreferences);
        applyTheme(newPreferences.theme);
        return true;
      }
    } catch (error) {
      console.error('Failed to update preferences:', error);
    }
    return false;
  };

  const applyTheme = (theme) => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  const formatCurrency = (amount) => {
    const symbols = { GBP: '£', USD: '$', EUR: '€' };
    return `${symbols[preferences.currency] || '£'}${amount.toLocaleString()}`;
  };

  useEffect(() => {
    loadPreferences();
  }, []);

  return (
    <PreferencesContext.Provider value={{
      preferences,
      updatePreferences,
      formatCurrency,
      loadPreferences
    }}>
      {children}
    </PreferencesContext.Provider>
  );
};