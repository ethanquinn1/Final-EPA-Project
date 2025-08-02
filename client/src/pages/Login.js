import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { Eye, EyeOff, Mail, Lock, Shield, ArrowRight, AlertCircle } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { refreshUser } = useContext(AuthContext);

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true); // Add loading state
    
    try {
      const res = await fetch('/api/auth/verify-totp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, token })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');

      localStorage.setItem('token', data.token);
      await refreshUser(); // Update AuthContext
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false); // Reset loading state
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.backgroundPattern}></div>
      
      <div style={styles.loginCard}>
        <div style={styles.logoSection}>
          <div style={styles.logoIcon}>
            <Shield size={32} color="white" />
          </div>
          <h1 style={styles.logoText}>Engage360</h1>
          <p style={styles.subtitle}>Secure access to your CRM</p>
        </div>

        {error && (
          <div style={styles.errorAlert}>
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <div style={styles.inputContainer}>
              <Mail size={20} style={styles.inputIcon} />
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
                required
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <div style={styles.inputContainer}>
              <Lock size={20} style={styles.inputIcon} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.passwordToggle}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Authenticator Code</label>
            <div style={styles.inputContainer}>
              <Shield size={20} style={styles.inputIcon} />
              <input
                type="text"
                placeholder="6-digit code from your authenticator app"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                style={styles.input}
                maxLength="6"
                required
              />
            </div>
            <p style={styles.helpText}>
              Enter the 6-digit code from your authenticator app
            </p>
          </div>

          <button 
            type="submit" 
            style={styles.submitButton} 
            disabled={isLoading}
          >
            {isLoading ? (
              <div style={styles.spinner}></div>
            ) : (
              <>
                Sign In Securely
                <ArrowRight size={20} style={styles.buttonIcon} />
              </>
            )}
          </button>
        </form>

        <div style={styles.footer}>
          <p style={styles.footerText}>
            Don't have an account? 
            <a href="/register" style={styles.registerLink}> Register here</a>
          </p>
        </div>

        {/* Security Badge */}
        <div style={styles.securityBadge}>
          <Shield size={16} />
          <span>Protected by 2FA</span>
        </div>
      </div>

      {/* Features Preview */}
      <div style={styles.featuresSection}>
        <h3 style={styles.featuresTitle}>Secure CRM Access</h3>
        <div style={styles.featuresList}>
          <div style={styles.feature}>
            <div style={styles.featureIcon}>🔐</div>
            <span>Two-Factor Authentication</span>
          </div>
          <div style={styles.feature}>
            <div style={styles.featureIcon}>📊</div>
            <span>Real-time Analytics</span>
          </div>
          <div style={styles.feature}>
            <div style={styles.featureIcon}>👥</div>
            <span>Client Management</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    position: 'relative',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },

  backgroundPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: `
      radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%),
      radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 0%, transparent 50%)
    `,
    pointerEvents: 'none'
  },

  loginCard: {
    backgroundColor: 'white',
    borderRadius: '24px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
    padding: '48px',
    width: '100%',
    maxWidth: '480px',
    position: 'relative',
    zIndex: 1
  },

  logoSection: {
    textAlign: 'center',
    marginBottom: '32px'
  },

  logoIcon: {
    width: '64px',
    height: '64px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px',
    boxShadow: '0 8px 16px rgba(102, 126, 234, 0.3)'
  },

  logoText: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1e293b',
    margin: '0 0 8px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  },

  subtitle: {
    color: '#64748b',
    fontSize: '16px',
    margin: 0
  },

  errorAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '12px',
    color: '#991b1b',
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '24px'
  },

  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },

  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },

  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '4px'
  },

  inputContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },

  input: {
    width: '100%',
    padding: '16px 16px 16px 48px',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '16px',
    fontFamily: 'inherit',
    transition: 'all 0.2s ease',
    backgroundColor: '#f8fafc',
    boxSizing: 'border-box'
  },

  inputIcon: {
    position: 'absolute',
    left: '16px',
    color: '#94a3b8',
    zIndex: 1
  },

  passwordToggle: {
    position: 'absolute',
    right: '16px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#94a3b8',
    padding: '4px',
    borderRadius: '4px',
    transition: 'color 0.2s ease'
  },

  helpText: {
    fontSize: '12px',
    color: '#64748b',
    margin: '4px 0 0 0',
    fontStyle: 'italic'
  },

  submitButton: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    padding: '16px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
    minHeight: '52px'
  },

  buttonIcon: {
    transition: 'transform 0.2s ease'
  },

  spinner: {
    width: '20px',
    height: '20px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTop: '2px solid white',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },

  footer: {
    textAlign: 'center',
    marginTop: '32px',
    paddingTop: '24px',
    borderTop: '1px solid #e2e8f0'
  },

  footerText: {
    color: '#64748b',
    fontSize: '14px',
    margin: 0
  },

  registerLink: {
    color: '#667eea',
    textDecoration: 'none',
    fontWeight: '600'
  },

  securityBadge: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    marginTop: '24px',
    padding: '12px',
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: '10px',
    color: '#166534',
    fontSize: '14px',
    fontWeight: '500'
  },

  featuresSection: {
    position: 'absolute',
    bottom: '40px',
    left: '50%',
    transform: 'translateX(-50%)',
    textAlign: 'center',
    color: 'white'
  },

  featuresTitle: {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '16px',
    opacity: 0.9
  },

  featuresList: {
    display: 'flex',
    gap: '32px',
    justifyContent: 'center'
  },

  feature: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    opacity: 0.8
  },

  featureIcon: {
    fontSize: '24px',
    marginBottom: '4px'
  }
};

const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  input:focus {
    outline: none !important;
    border-color: #667eea !important;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1) !important;
    background-color: white !important;
  }
  
  button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4) !important;
  }

  button:hover .buttonIcon {
    transform: translateX(4px);
  }

  a:hover {
    color: #5a67d8 !important;
  }

  .passwordToggle:hover {
    color: #667eea !important;
  }

  button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none !important;
  }

  @media (max-width: 768px) {
    .login-card {
      padding: 32px 24px !important;
      margin: 16px !important;
    }

    .features-section {
      position: relative !important;
      bottom: auto !important;
      left: auto !important;
      transform: none !important;
      margin-top: 32px !important;
    }

    .features-list {
      flex-direction: column !important;
      gap: 16px !important;
    }

    .feature {
      flex-direction: row !important;
      justify-content: center !important;
    }
  }

  @media (max-width: 480px) {
    .container {
      padding: 16px !important;
    }

    .login-card {
      padding: 24px 20px !important;
    }

    .logo-text {
      fontSize: 24px !important;
    }
  }
`;
document.head.appendChild(styleSheet);

export default Login;