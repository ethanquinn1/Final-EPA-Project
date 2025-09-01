import React, { useState } from 'react';
import InteractionList from '../components/InteractionList';
import InteractionForm from '../components/InteractionForm';
import { 
  MessageSquare, 
  Plus, 
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  Target,
  Activity
} from 'lucide-react';

const Interactions = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingInteraction, setEditingInteraction] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleNewInteraction = () => {
    setEditingInteraction(null);
    setShowForm(true);
  };

  const handleEditInteraction = (interaction) => {
    setEditingInteraction(interaction);
    setShowForm(true);
  };

  const handleFormSubmit = (interaction) => {
    setShowForm(false);
    setEditingInteraction(null);
    setRefreshTrigger(prev => prev + 1); // Trigger refresh
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingInteraction(null);
  };

  const handleInteractionDelete = () => {
    setRefreshTrigger(prev => prev + 1); 
  };

  if (showForm) {
    return (
      <div style={styles.formContainer}>
        <InteractionForm
          interaction={editingInteraction}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header Section */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.titleSection}>
            <MessageSquare size={32} style={styles.headerIcon} />
            <div>
              <h1 style={styles.pageTitle}>Interactions</h1>
              <p style={styles.pageSubtitle}>
                Track all your client communications and activities
              </p>
            </div>
          </div>
        </div>

        <div style={styles.headerRight}>
          <button 
            style={styles.exportButton}
            onClick={() => console.log('Export functionality')}
          >
            <Calendar size={20} />
            Export Report
          </button>
          <button 
            style={styles.addButton}
            onClick={handleNewInteraction} 
          >
            <Plus size={20} />
            New Interaction
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={{...styles.statIcon, backgroundColor: '#dbeafe'}}>
            <MessageSquare size={24} color="#2563eb" />
          </div>
          <div style={styles.statContent}>
            <h3 style={styles.statNumber}>--</h3>
            <p style={styles.statLabel}>Total Interactions</p>
            <div style={styles.statChange}>
              <TrendingUp size={16} color="#10b981" />
              <span style={{color: '#10b981'}}>Active engagement</span>
            </div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={{...styles.statIcon, backgroundColor: '#dcfce7'}}>
            <CheckCircle size={24} color="#059669" />
          </div>
          <div style={styles.statContent}>
            <h3 style={styles.statNumber}>--</h3>
            <p style={styles.statLabel}>Successful</p>
            <div style={styles.statChange}>
              <CheckCircle size={16} color="#10b981" />
              <span style={{color: '#10b981'}}>Great success rate</span>
            </div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={{...styles.statIcon, backgroundColor: '#fef3c7'}}>
            <Clock size={24} color="#d97706" />
          </div>
          <div style={styles.statContent}>
            <h3 style={styles.statNumber}>--</h3>
            <p style={styles.statLabel}>Pending Response</p>
            <div style={styles.statChange}>
              <Clock size={16} color="#f59e0b" />
              <span style={{color: '#f59e0b'}}>Awaiting replies</span>
            </div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={{...styles.statIcon, backgroundColor: '#fef2f2'}}>
            <AlertCircle size={24} color="#dc2626" />
          </div>
          <div style={styles.statContent}>
            <h3 style={styles.statNumber}>--</h3>
            <p style={styles.statLabel}>Need Follow-up</p>
            <div style={styles.statChange}>
              <Target size={16} color="#ef4444" />
              <span style={{color: '#ef4444'}}>Action required</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Section */}
      <div style={styles.quickActions}>
        <h3 style={styles.quickActionsTitle}>Quick Actions</h3>
        <div style={styles.quickActionButtons}>
          <button 
            style={styles.quickActionButton}
            onClick={handleNewInteraction}
          >
            <MessageSquare size={20} />
            <span>Log Call</span>
          </button>
          <button 
            style={styles.quickActionButton}
            onClick={handleNewInteraction}
          >
            <Calendar size={20} />
            <span>Schedule Meeting</span>
          </button>
          <button 
            style={styles.quickActionButton}
            onClick={handleNewInteraction}
          >
            <Activity size={20} />
            <span>Send Email</span>
          </button>
          <button 
            style={styles.quickActionButton}
            onClick={handleNewInteraction}
          >
            <Target size={20} />
            <span>Add Note</span>
          </button>
        </div>
      </div>

      <div style={styles.contentWrapper}>
        <InteractionList
          onInteractionEdit={handleEditInteraction} // KEEP: Your existing handlers
          onInteractionDelete={handleInteractionDelete}
          refreshTrigger={refreshTrigger}
        />
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 100%)',
    padding: '32px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },

  formContainer: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 100%)',
    padding: '32px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px'
  },

  headerLeft: {
    display: 'flex',
    alignItems: 'center'
  },

  titleSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },

  headerIcon: {
    color: '#667eea'
  },

  pageTitle: {
    fontSize: '32px',
    fontWeight: '700',
    margin: 0,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  },

  pageSubtitle: {
    color: '#64748b',
    margin: '4px 0 0 0',
    fontSize: '16px'
  },

  headerRight: {
    display: 'flex',
    gap: '12px'
  },

  exportButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    backgroundColor: 'white',
    color: '#64748b',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    fontSize: '14px'
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
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
    fontSize: '14px'
  },

  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '24px',
    marginBottom: '32px'
  },

  statCard: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    border: '1px solid #f1f5f9',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    transition: 'all 0.2s ease'
  },

  statIcon: {
    width: '56px',
    height: '56px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },

  statContent: {
    flex: 1
  },

  statNumber: {
    fontSize: '28px',
    fontWeight: '700',
    margin: '0 0 4px 0',
    color: '#1e293b'
  },

  statLabel: {
    color: '#64748b',
    fontSize: '14px',
    margin: '0 0 8px 0'
  },

  statChange: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px',
    fontWeight: '500'
  },

  quickActions: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    border: '1px solid #f1f5f9',
    marginBottom: '24px'
  },

  quickActionsTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1e293b',
    margin: '0 0 16px 0'
  },

  quickActionButtons: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '12px'
  },

  quickActionButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    backgroundColor: '#f8fafc',
    color: '#374151',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '14px',
    transition: 'all 0.2s ease'
  },

  contentWrapper: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    border: '1px solid #f1f5f9'
  }
};

// Add professional hover effects
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  .add-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4) !important;
  }

  .export-button:hover {
    background-color: #f8fafc !important;
    border-color: #cbd5e1 !important;
    transform: translateY(-1px);
  }

  .stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
  }

  .quick-action-button:hover {
    background-color: white !important;
    border-color: #667eea !important;
    color: #667eea !important;
    transform: translateY(-1px);
  }

  .quick-actions:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .header {
      flex-direction: column !important;
      gap: 16px !important;
      align-items: stretch !important;
    }

    .header-right {
      justify-content: space-between !important;
    }

    .stats-grid {
      grid-template-columns: 1fr !important;
    }

    .quick-action-buttons {
      grid-template-columns: repeat(2, 1fr) !important;
    }

    .container, .form-container {
      padding: 16px !important;
    }

    .content-wrapper, .quick-actions {
      padding: 16px !important;
    }
  }

  @media (max-width: 480px) {
    .page-title {
      fontSize: 24px !important;
    }

    .stats-grid {
      gap: 16px !important;
    }

    .stat-card {
      padding: 16px !important;
    }

    .quick-action-buttons {
      grid-template-columns: 1fr !important;
    }

    .quick-action-button {
      padding: 12px !important;
    }
  }
`;
document.head.appendChild(styleSheet);

export default Interactions;