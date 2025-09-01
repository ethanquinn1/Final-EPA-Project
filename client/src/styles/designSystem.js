export const designSystem = {
  // Color Palette
  colors: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe', 
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      900: '#1e3a8a'
    },
    success: {
      50: '#ecfdf5',
      500: '#10b981',
      600: '#059669',
      700: '#047857'
    },
    warning: {
      50: '#fffbeb',
      500: '#f59e0b',
      600: '#d97706'
    },
    danger: {
      50: '#fef2f2',
      500: '#ef4444',
      600: '#dc2626'
    },
    purple: {
      500: '#8b5cf6',
      600: '#7c3aed'
    },
    gray: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a'
    }
  },

  // Typography
  typography: {
    fontFamily: {
      sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      mono: 'Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem'
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700'
    }
  },

  // Spacing
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem'
  },

  // Border Radius
  borderRadius: {
    none: '0',
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    full: '9999px'
  },

  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
  },

  // Gradients
  gradients: {
    primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 100%)',
    card: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
    button: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    success: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    warning: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
  }
};

export const componentStyles = {
  // Button Styles
  button: {
    base: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: designSystem.borderRadius.lg,
      fontWeight: designSystem.typography.fontWeight.medium,
      fontSize: designSystem.typography.fontSize.sm,
      padding: `${designSystem.spacing.sm} ${designSystem.spacing.lg}`,
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      textDecoration: 'none'
    },
    primary: {
      background: designSystem.gradients.button,
      color: 'white',
      boxShadow: designSystem.shadows.sm
    },
    secondary: {
      backgroundColor: designSystem.colors.gray[100],
      color: designSystem.colors.gray[700],
      border: `1px solid ${designSystem.colors.gray[200]}`
    },
    success: {
      background: designSystem.gradients.success,
      color: 'white'
    },
    danger: {
      backgroundColor: designSystem.colors.danger[500],
      color: 'white'
    }
  },

  // Card Styles
  card: {
    base: {
      backgroundColor: 'white',
      borderRadius: designSystem.borderRadius.xl,
      boxShadow: designSystem.shadows.base,
      padding: designSystem.spacing.xl,
      border: `1px solid ${designSystem.colors.gray[100]}`
    },
    hover: {
      boxShadow: designSystem.shadows.md,
      transform: 'translateY(-2px)'
    }
  },

  // Input Styles
  input: {
    base: {
      width: '100%',
      padding: `${designSystem.spacing.sm} ${designSystem.spacing.md}`,
      border: `1px solid ${designSystem.colors.gray[300]}`,
      borderRadius: designSystem.borderRadius.lg,
      fontSize: designSystem.typography.fontSize.base,
      fontFamily: designSystem.typography.fontFamily.sans,
      transition: 'all 0.2s ease',
      backgroundColor: 'white'
    },
    focus: {
      outline: 'none',
      borderColor: designSystem.colors.primary[500],
      boxShadow: `0 0 0 3px ${designSystem.colors.primary[100]}`
    }
  },

  // Navigation Styles
  nav: {
    base: {
      backgroundColor: 'white',
      borderBottom: `1px solid ${designSystem.colors.gray[200]}`,
      padding: `${designSystem.spacing.md} 0`,
      position: 'sticky',
      top: 0,
      zIndex: 50,
      backdropFilter: 'blur(8px)'
    },
    link: {
      padding: `${designSystem.spacing.sm} ${designSystem.spacing.md}`,
      borderRadius: designSystem.borderRadius.lg,
      color: designSystem.colors.gray[600],
      textDecoration: 'none',
      fontWeight: designSystem.typography.fontWeight.medium,
      transition: 'all 0.2s ease'
    },
    linkActive: {
      backgroundColor: designSystem.colors.primary[50],
      color: designSystem.colors.primary[600]
    }
  },

  // Table Styles
  table: {
    container: {
      backgroundColor: 'white',
      borderRadius: designSystem.borderRadius.xl,
      boxShadow: designSystem.shadows.base,
      overflow: 'hidden',
      border: `1px solid ${designSystem.colors.gray[100]}`
    },
    header: {
      backgroundColor: designSystem.colors.gray[50],
      borderBottom: `1px solid ${designSystem.colors.gray[200]}`
    },
    cell: {
      padding: `${designSystem.spacing.md} ${designSystem.spacing.lg}`,
      borderBottom: `1px solid ${designSystem.colors.gray[100]}`
    }
  }
};

// Utility Functions
export const utils = {
  // Merge styles
  mergeStyles: (...styles) => Object.assign({}, ...styles),
  
  // Create hover effect
  createHoverEffect: (baseStyles, hoverStyles) => ({
    ...baseStyles,
    ':hover': hoverStyles
  }),
  
  // Responsive breakpoints
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px'
  }
};