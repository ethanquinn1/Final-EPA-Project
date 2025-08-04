// 📁 client/src/components/InteractionList.js
// Your existing functionality with professional styling upgrade
import React, { useState, useEffect } from 'react';
import { interactionAPI } from '../services/interactionAPI';
import { 
  MessageSquare, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  Video, 
  FileText, 
  Edit, 
  Trash2, 
  MoreVertical, 
  RefreshCw,
  Tag,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const InteractionList = ({ 
  clientId = null, 
  onInteractionEdit, 
  onInteractionDelete,
  refreshTrigger = 0 
}) => {
  // KEEP: All your existing state exactly as is
  const [interactions, setInteractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    type: '',
    search: '',
    startDate: '',
    endDate: '',
    followUpRequired: '',
    priority: '',
    page: 1,
    limit: 20,
    sort: '-date'
  });
  const [pagination, setPagination] = useState({});
  const [showFilters, setShowFilters] = useState(false);

  // KEEP: All your existing functions exactly as they are
  const loadInteractions = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = { ...filters };
      if (clientId) params.clientId = clientId;

      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });

      let response;
      if (clientId) {
        response = await interactionAPI.getClientInteractions(clientId, params);
      } else {
        response = await interactionAPI.getInteractions(params);
      }

      setInteractions(response.interactions || []);
      setPagination(response.pagination || {});
    } catch (err) {
      console.error('Error loading interactions:', err);
      setError('Failed to load interactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInteractions();
  }, [clientId, filters, refreshTrigger]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleDelete = async (interaction) => {
    if (!window.confirm(`Are you sure you want to delete this ${interaction.type}?`)) {
      return;
    }

    try {
      await interactionAPI.deleteInteraction(interaction._id);
      await loadInteractions();
      if (onInteractionDelete) {
        onInteractionDelete(interaction);
      }
    } catch (error) {
      console.error('Error deleting interaction:', error);
      alert('Failed to delete interaction');
    }
  };

  // ENHANCED: Professional date formatting with UK format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB') + ' at ' + date.toLocaleTimeString('en-GB', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // ENHANCED: Professional type icons with Lucide React
  const getTypeIcon = (type) => {
    const icons = {
      email: Mail,
      meeting: Calendar,
      call: Phone,
      'video-call': Video,
      note: FileText,
      message: MessageSquare
    };
    return icons[type] || FileText;
  };

  // ENHANCED: Professional priority colors
  const getPriorityColor = (priority) => {
    const colors = {
      low: { bg: '#dcfce7', text: '#166534', border: '#bbf7d0' },
      medium: { bg: '#fef3c7', text: '#92400e', border: '#fde68a' },
      high: { bg: '#fef2f2', text: '#991b1b', border: '#fecaca' }
    };
    return colors[priority] || colors.medium;
  };

  // ENHANCED: Professional outcome colors
  const getOutcomeColor = (outcome) => {
    const colors = {
      positive: { bg: '#dcfce7', text: '#166534', border: '#bbf7d0' },
      neutral: { bg: '#f1f5f9', text: '#475569', border: '#e2e8f0' },
      negative: { bg: '#fef2f2', text: '#991b1b', border: '#fecaca' },
      'follow-up-needed': { bg: '#fff7ed', text: '#c2410c', border: '#fed7aa' }
    };
    return colors[outcome] || colors.neutral;
  };

  const clearFilters = () => {
    setFilters({
      type: '',
      search: '',
      startDate: '',
      endDate: '',
      followUpRequired: '',
      priority: '',
      page: 1,
      limit: 20,
      sort: '-date'
    });
  };

  // Professional loading state
  if (loading && interactions.length === 0) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Loading interactions...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Professional Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h3 style={styles.title}>
            {clientId ? 'Client Interactions' : 'All Interactions'}
          </h3>
          <p style={styles.subtitle}>
            {pagination.totalItems || 0} total interactions
          </p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          style={{
            ...styles.filterToggle,
            ...(showFilters ? styles.filterToggleActive : {})
          }}
        >
          <Filter size={16} />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>

      {/* Professional Filters */}
      {showFilters && (
        <div style={styles.filtersContainer}>
          <div style={styles.filtersGrid}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Search</label>
              <div style={styles.searchContainer}>
                <Search size={16} style={styles.searchIcon} />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Search subject, content..."
                  style={styles.searchInput}
                />
              </div>
            </div>
            
            <div style={styles.inputGroup}>
              <label style={styles.label}>Type</label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                style={styles.select}
              >
                <option value="">All types</option>
                <option value="email">📧 Email</option>
                <option value="meeting">📅 Meeting</option>
                <option value="call">📞 Call</option>
                <option value="video-call">📹 Video Call</option>
                <option value="note">📝 Note</option>
              </select>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Priority</label>
              <select
                value={filters.priority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                style={styles.select}
              >
                <option value="">All priorities</option>
                <option value="low">🟢 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🔴 High</option>
              </select>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Follow-ups</label>
              <select
                value={filters.followUpRequired}
                onChange={(e) => handleFilterChange('followUpRequired', e.target.value)}
                style={styles.select}
              >
                <option value="">All interactions</option>
                <option value="true">Needs follow-up</option>
                <option value="false">No follow-up needed</option>
              </select>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Sort By</label>
              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                style={styles.select}
              >
                <option value="-date">Newest first</option>
                <option value="date">Oldest first</option>
                <option value="subject">Subject A-Z</option>
                <option value="-subject">Subject Z-A</option>
                <option value="type">Type</option>
              </select>
            </div>

            <div style={styles.clearFilterContainer}>
              <button
                onClick={clearFilters}
                style={styles.clearButton}
              >
                <RefreshCw size={16} />
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Professional Error Message */}
      {error && (
        <div style={styles.errorContainer}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Professional Interactions List */}
      <div style={styles.interactionsContainer}>
        {interactions.length === 0 ? (
          <div style={styles.emptyState}>
            <MessageSquare size={48} color="#94a3b8" />
            <h3 style={styles.emptyStateTitle}>No interactions found</h3>
            <p style={styles.emptyStateText}>
              {filters.search || filters.type || filters.priority ? 
                'Try adjusting your filters to see more results.' : 
                'Start by creating your first interaction.'
              }
            </p>
          </div>
        ) : (
          interactions.map((interaction) => {
            const TypeIcon = getTypeIcon(interaction.type);
            const priorityColors = getPriorityColor(interaction.priority);
            const outcomeColors = getOutcomeColor(interaction.outcome);

            return (
              <div key={interaction._id} style={styles.interactionCard}>
                <div style={styles.cardHeader}>
                  <div style={styles.cardHeaderLeft}>
                    <div style={styles.typeIconContainer}>
                      <TypeIcon size={20} color="#667eea" />
                    </div>
                    <div style={styles.interactionMeta}>
                      <h4 style={styles.interactionSubject}>{interaction.subject}</h4>
                      <div style={styles.badges}>
                        <span style={{
                          ...styles.priorityBadge,
                          backgroundColor: priorityColors.bg,
                          color: priorityColors.text,
                          borderColor: priorityColors.border
                        }}>
                          {interaction.priority}
                        </span>
                        {interaction.outcome && (
                          <span style={{
                            ...styles.outcomeBadge,
                            backgroundColor: outcomeColors.bg,
                            color: outcomeColors.text,
                            borderColor: outcomeColors.border
                          }}>
                            {interaction.outcome.replace('-', ' ')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={styles.cardActions}>
                    <button
                      onClick={() => onInteractionEdit && onInteractionEdit(interaction)}
                      style={styles.actionButton}
                      title="Edit interaction"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(interaction)}
                      style={{...styles.actionButton, ...styles.deleteButton}}
                      title="Delete interaction"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div style={styles.cardContent}>
                  <div style={styles.interactionDetails}>
                    {!clientId && interaction.clientId && (
                      <div style={styles.detailItem}>
                        <User size={16} />
                        <span>
                          <strong>{interaction.clientId.name}</strong>
                          {interaction.clientId.company && ` (${interaction.clientId.company})`}
                        </span>
                      </div>
                    )}
                    <div style={styles.detailItem}>
                      <Calendar size={16} />
                      <span>{formatDate(interaction.date)}</span>
                    </div>
                    {interaction.duration && (
                      <div style={styles.detailItem}>
                        <Clock size={16} />
                        <span>{interaction.duration} minutes</span>
                      </div>
                    )}
                  </div>

                  {interaction.content && (
                    <div style={styles.contentSection}>
                      <p style={styles.interactionContent}>
                        {interaction.content.length > 200 
                          ? `${interaction.content.substring(0, 200)}...` 
                          : interaction.content
                        }
                      </p>
                    </div>
                  )}

                  <div style={styles.cardFooter}>
                    {interaction.followUpRequired && (
                      <div style={styles.followUpSection}>
                        <ArrowRight size={16} />
                        <span>
                          Follow-up: {interaction.followUpDate ? 
                            new Date(interaction.followUpDate).toLocaleDateString('en-GB') : 
                            'Date TBD'
                          }
                        </span>
                      </div>
                    )}
                    
                    {interaction.tags && interaction.tags.length > 0 && (
                      <div style={styles.tagsSection}>
                        {interaction.tags.map(tag => (
                          <span key={tag} style={styles.tag}>
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Professional Pagination */}
      {pagination.totalPages > 1 && (
        <div style={styles.paginationContainer}>
          <div style={styles.paginationInfo}>
            Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{' '}
            {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
            {pagination.totalItems} results
          </div>
          
          <div style={styles.paginationControls}>
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage <= 1}
              style={{
                ...styles.paginationButton,
                ...(pagination.currentPage <= 1 ? styles.paginationButtonDisabled : {})
              }}
            >
              <ChevronLeft size={16} />
              Previous
            </button>
            
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              const pageNum = Math.max(1, pagination.currentPage - 2) + i;
              if (pageNum > pagination.totalPages) return null;
              
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  style={{
                    ...styles.pageButton,
                    ...(pageNum === pagination.currentPage ? styles.pageButtonActive : {})
                  }}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage >= pagination.totalPages}
              style={{
                ...styles.paginationButton,
                ...(pagination.currentPage >= pagination.totalPages ? styles.paginationButtonDisabled : {})
              }}
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && interactions.length > 0 && (
        <div style={styles.loadingOverlay}>
          <div style={styles.spinner}></div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: 'transparent',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },

  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '64px 20px',
    color: '#64748b'
  },

  spinner: {
    width: '32px',
    height: '32px',
    border: '3px solid #f1f5f9',
    borderTop: '3px solid #667eea',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '16px'
  },

  loadingText: {
    fontSize: '16px',
    color: '#64748b'
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '16px'
  },

  headerLeft: {
    flex: 1,
    minWidth: '200px'
  },

  title: {
    fontSize: '24px',
    fontWeight: '700',
    margin: '0 0 4px 0',
    color: '#1e293b'
  },

  subtitle: {
    fontSize: '14px',
    color: '#64748b',
    margin: 0
  },

  filterToggle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    backgroundColor: '#f8fafc',
    color: '#64748b',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    fontSize: '14px'
  },

  filterToggleActive: {
    backgroundColor: '#667eea',
    color: 'white',
    borderColor: '#667eea'
  },

  filtersContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
    border: '1px solid #f1f5f9'
  },

  filtersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px'
  },

  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },

  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151'
  },

  searchContainer: {
    position: 'relative'
  },

  searchIcon: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#94a3b8'
  },

  searchInput: {
    width: '100%',
    padding: '12px 12px 12px 40px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    backgroundColor: 'white',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box'
  },

  input: {
    width: '100%',
    padding: '12px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    backgroundColor: 'white',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box'
  },

  select: {
    width: '100%',
    padding: '12px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    backgroundColor: 'white',
    cursor: 'pointer',
    fontFamily: 'inherit',
    boxSizing: 'border-box'
  },

  clearFilterContainer: {
    display: 'flex',
    alignItems: 'end'
  },

  clearButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    backgroundColor: 'white',
    color: '#64748b',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    fontSize: '14px'
  },

  errorContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '10px',
    color: '#991b1b',
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '24px'
  },

  interactionsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },

  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 20px',
    textAlign: 'center'
  },

  emptyStateTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#374151',
    margin: '16px 0 8px 0'
  },

  emptyStateText: {
    fontSize: '14px',
    color: '#64748b',
    margin: 0
  },

  interactionCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #f1f5f9',
    transition: 'all 0.2s ease'
  },

  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px'
  },

  cardHeaderLeft: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    flex: 1
  },

  typeIconContainer: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    backgroundColor: '#f0f4ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },

  interactionMeta: {
    flex: 1,
    minWidth: 0
  },

  interactionSubject: {
    fontSize: '16px',
    fontWeight: '600',
    margin: '0 0 8px 0',
    color: '#1e293b'
  },

  badges: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap'
  },

  priorityBadge: {
    display: 'inline-block',
    padding: '4px 8px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '500',
    border: '1px solid',
    textTransform: 'capitalize'
  },

  outcomeBadge: {
    display: 'inline-block',
    padding: '4px 8px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '500',
    border: '1px solid',
    textTransform: 'capitalize'
  },

  cardActions: {
    display: 'flex',
    gap: '8px'
  },

  actionButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    backgroundColor: 'white',
    color: '#64748b',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },

  deleteButton: {
    color: '#ef4444'
  },

  cardContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },

  interactionDetails: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px'
  },

  detailItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '14px',
    color: '#64748b'
  },

  contentSection: {
    padding: '16px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    border: '1px solid #f1f5f9'
  },

  interactionContent: {
    fontSize: '14px',
    color: '#374151',
    lineHeight: '1.6',
    margin: 0
  },

  cardFooter: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },

  followUpSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    backgroundColor: '#fffbeb',
    borderRadius: '8px',
    border: '1px solid #fef3c7',
    fontSize: '14px',
    color: '#92400e',
    fontWeight: '500'
  },

  tagsSection: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px'
  },

  tag: {
    padding: '4px 8px',
    backgroundColor: '#f1f5f9',
    color: '#64748b',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '500'
  },

  paginationContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '24px',
    flexWrap: 'wrap',
    gap: '16px'
  },

  paginationInfo: {
    fontSize: '14px',
    color: '#64748b'
  },

  paginationControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },

  paginationButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '8px 12px',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    backgroundColor: 'white',
    color: '#374151',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease'
  },

  paginationButtonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed'
  },

  pageButton: {
    padding: '8px 12px',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    backgroundColor: 'white',
    color: '#374151',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease'
  },

  pageButtonActive: {
    backgroundColor: '#667eea',
    color: 'white',
    borderColor: '#667eea'
  },

  loadingOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(255,255,255,0.75)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
};

// Add CSS animations and hover effects
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  /* Hover Effects */
  .interaction-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
  }

  .filter-toggle:hover:not(.active) {
    background-color: white !important;
    border-color: #cbd5e1 !important;
  }

  .clear-button:hover {
    background-color: #f8fafc !important;
    border-color: #cbd5e1 !important;
  }

  .action-button:hover {
    background-color: #f8fafc !important;
    border-color: #cbd5e1 !important;
    transform: translateY(-1px);
  }

  .delete-button:hover {
   background-color: #fef2f2 !important;
   border-color: #fecaca !important;
 }

 .search-input:focus, .input:focus, .select:focus {
   outline: none !important;
   border-color: #667eea !important;
   box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1) !important;
 }

 .pagination-button:hover:not(:disabled) {
   background-color: #f8fafc !important;
   border-color: #cbd5e1 !important;
 }

 .page-button:hover:not(.active) {
   background-color: #f8fafc !important;
   border-color: #cbd5e1 !important;
 }

 .tag:hover {
   background-color: #e2e8f0 !important;
   color: #475569 !important;
 }

 /* Responsive Design */
 @media (max-width: 768px) {
   .header {
     flex-direction: column !important;
     align-items: stretch !important;
   }

   .filters-grid {
     grid-template-columns: 1fr !important;
   }

   .interaction-details {
     flex-direction: column !important;
     gap: 8px !important;
   }

   .card-header {
     flex-direction: column !important;
     gap: 12px !important;
     align-items: stretch !important;
   }

   .card-actions {
     justify-content: space-between !important;
   }

   .pagination-container {
     flex-direction: column !important;
     text-align: center !important;
   }

   .pagination-controls {
     justify-content: center !important;
     flex-wrap: wrap !important;
   }
 }

 @media (max-width: 480px) {
   .interaction-card {
     padding: 16px !important;
   }

   .filters-container {
     padding: 16px !important;
   }

   .badges {
     flex-direction: column !important;
     align-items: flex-start !important;
   }

   .card-header-left {
     flex-direction: column !important;
     gap: 8px !important;
   }

   .type-icon-container {
     align-self: flex-start !important;
   }
 }
`;
document.head.appendChild(styleSheet);

export default InteractionList;