import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { clientAPI } from '../services/api';
import { 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  MoreVertical, 
  Mail, 
  Building, 
  TrendingUp, 
  User,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

const ClientList = ({ onClientSelect, onClientEdit, onClientAdd }) => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});

  // fetch function 
  const fetchClients = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm,
        status: statusFilter,
        priority: priorityFilter,
      };

      Object.keys(params).forEach(key => {
        if (params[key] === '') delete params[key];
      });

      const data = await clientAPI.getClients(params);
      setClients(data.clients);
      setPagination(data.pagination);
      setError(null);
    } catch (err) {
      setError('Failed to load clients. Please try again.');
      console.error('Error fetching clients:', err);
    } finally {
      setLoading(false);
    }
  };

  // useEffect 
  useEffect(() => {
    fetchClients();
  }, [currentPage, searchTerm, statusFilter, priorityFilter]);

  // delete handler 
  const handleDelete = async (clientId) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        await clientAPI.deleteClient(clientId);
        fetchClients();
      } catch (err) {
        setError('Failed to delete client. Please try again.');
        console.error('Error deleting client:', err);
      }
    }
  };

  // status colors
  const getStatusColor = (status) => {
    const colors = {
      active: { bg: '#dcfce7', text: '#166534', border: '#bbf7d0' },
      prospect: { bg: '#dbeafe', text: '#1d4ed8', border: '#bfdbfe' },
      inactive: { bg: '#fef3c7', text: '#92400e', border: '#fde68a' },
      former: { bg: '#fef2f2', text: '#991b1b', border: '#fecaca' }
    };
    return colors[status] || colors.inactive;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      critical: { bg: '#fef2f2', text: '#991b1b', border: '#fecaca' },
      high: { bg: '#fff7ed', text: '#c2410c', border: '#fed7aa' },
      medium: { bg: '#fef3c7', text: '#92400e', border: '#fde68a' },
      low: { bg: '#dcfce7', text: '#166534', border: '#bbf7d0' }
    };
    return colors[priority] || colors.medium;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setPriorityFilter('');
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Loading clients...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h2 style={styles.title}>Clients</h2>
          <p style={styles.subtitle}>Manage and track your client relationships</p>
        </div>
        <button
          onClick={onClientAdd}
          style={styles.addButton}
        >
          <User size={20} />
          Add Client
        </button>
      </div>

      {/* Filters */}
      <div style={styles.filtersContainer}>
        <div style={styles.searchContainer}>
          <Search size={20} style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        <div style={styles.filters}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="prospect">Prospect</option>
            <option value="inactive">Inactive</option>
            <option value="former">Former</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <button
            onClick={handleClearFilters}
            style={styles.clearButton}
          >
            <RefreshCw size={16} />
            Clear Filters
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div style={styles.errorContainer}>
          <p style={styles.errorText}>{error}</p>
        </div>
      )}

      {/* Professional Table Container */}
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead style={styles.tableHeader}>
            <tr>
              <th style={styles.tableHeaderCell}>Client</th>
              <th style={styles.tableHeaderCell}>Company</th>
              <th style={styles.tableHeaderCell}>Status</th>
              <th style={styles.tableHeaderCell}>Priority</th>
              <th style={styles.tableHeaderCell}>Last Contact</th>
              <th style={styles.tableHeaderCell}>Engagement</th>
              <th style={styles.tableHeaderCellRight}>Actions</th>
            </tr>
          </thead>
          <tbody style={styles.tableBody}>
            {clients.length === 0 ? (
              <tr>
                <td colSpan="7" style={styles.emptyState}>
                  <div style={styles.emptyStateContent}>
                    <User size={48} color="#94a3b8" />
                    <h3 style={styles.emptyStateTitle}>No clients found</h3>
                    <p style={styles.emptyStateText}>
                      {searchTerm || statusFilter || priorityFilter 
                        ? 'Try adjusting your search or filters' 
                        : 'Get started by adding your first client'
                      }
                    </p>
                    {onClientAdd && !searchTerm && !statusFilter && !priorityFilter && (
                      <button
                        onClick={onClientAdd}
                        style={styles.emptyStateButton}
                      >
                        Add your first client
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              clients.map((client) => {
                const statusColors = getStatusColor(client.status);
                const priorityColors = getPriorityColor(client.priority);
                
                return (
                  <tr
                    key={client._id}
                    style={styles.tableRow}
                    onClick={() => onClientSelect && onClientSelect(client)}
                  >
                    <td style={styles.tableCell}>
                      <div style={styles.clientInfo}>
                        <div style={styles.clientAvatar}>
                          {client.name ? client.name.charAt(0).toUpperCase() : 'C'}
                        </div>
                        <div>
                          <div style={styles.clientName}>{client.name}</div>
                          <div style={styles.clientEmail}>{client.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={styles.tableCell}>
                      <div style={styles.companyInfo}>
                        <Building size={16} style={styles.companyIcon} />
                        <span>{client.company}</span>
                      </div>
                    </td>
                    <td style={styles.tableCell}>
                      <span style={{
                        ...styles.statusBadge,
                        backgroundColor: statusColors.bg,
                        color: statusColors.text,
                        borderColor: statusColors.border
                      }}>
                        {client.status}
                      </span>
                    </td>
                    <td style={styles.tableCell}>
                      <span style={{
                        ...styles.priorityBadge,
                        backgroundColor: priorityColors.bg,
                        color: priorityColors.text,
                        borderColor: priorityColors.border
                      }}>
                        {client.priority}
                      </span>
                    </td>
                    <td style={styles.tableCell}>
                      <span style={styles.dateText}>{formatDate(client.lastContactDate)}</span>
                    </td>
                    <td style={styles.tableCell}>
                      <div style={styles.engagementContainer}>
                        <div style={styles.engagementBar}>
                          <div
                            style={{
                              ...styles.engagementFill,
                              width: `${client.engagementScore}%`,
                              backgroundColor: client.engagementScore > 70 ? '#10b981' : 
                                             client.engagementScore > 40 ? '#f59e0b' : '#ef4444'
                            }}
                          />
                        </div>
                        <span style={styles.engagementText}>{client.engagementScore}%</span>
                      </div>
                    </td>
                    <td style={styles.tableCellRight}>
                      <div style={styles.actionsContainer}>
                        <Link
                          to={`/clients/${client._id}`}
                          onClick={(e) => e.stopPropagation()}
                          style={styles.actionButton}
                        >
                          <Eye size={16} />
                        </Link>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onClientEdit && onClientEdit(client);
                          }}
                          style={styles.actionButton}
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(client._id);
                          }}
                          style={{...styles.actionButton, ...styles.deleteButton}}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div style={styles.paginationContainer}>
          <div style={styles.paginationInfo}>
            Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, pagination.totalClients)} of {pagination.totalClients} clients
          </div>
          <div style={styles.paginationControls}>
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={!pagination.hasPrev}
              style={{
                ...styles.paginationButton,
                ...(pagination.hasPrev ? {} : styles.paginationButtonDisabled)
              }}
            >
              Previous
            </button>
            <span style={styles.paginationText}>
              Page {currentPage} of {pagination.totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={!pagination.hasNext}
              style={{
                ...styles.paginationButton,
                ...(pagination.hasNext ? {} : styles.paginationButtonDisabled)
              }}
            >
              Next
            </button>
          </div>
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

  filtersContainer: {
    display: 'flex',
    gap: '16px',
    marginBottom: '24px',
    flexWrap: 'wrap',
    alignItems: 'center'
  },

  searchContainer: {
    position: 'relative',
    flex: 1,
    minWidth: '300px'
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
    padding: '12px 12px 12px 44px',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '14px',
    backgroundColor: '#f8fafc',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box'
  },

  filters: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap'
  },

  filterSelect: {
    padding: '12px 16px',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    backgroundColor: '#f8fafc',
    fontSize: '14px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    minWidth: '140px'
  },

  clearButton: {
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

  errorContainer: {
    padding: '16px',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '10px',
    marginBottom: '24px'
  },

  errorText: {
    color: '#991b1b',
    fontSize: '14px',
    margin: 0
  },

  tableContainer: {
    backgroundColor: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #f1f5f9'
  },

  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },

  tableHeader: {
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e2e8f0'
  },

  tableHeaderCell: {
    padding: '16px 20px',
    textAlign: 'left',
    fontSize: '12px',
    fontWeight: '600',
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },

  tableHeaderCellRight: {
    padding: '16px 20px',
    textAlign: 'right',
    fontSize: '12px',
    fontWeight: '600',
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },

  tableBody: {
    backgroundColor: 'white'
  },

  tableRow: {
    borderBottom: '1px solid #f1f5f9',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },

  tableCell: {
    padding: '20px',
    fontSize: '14px',
    color: '#374151',
    verticalAlign: 'middle'
  },

  tableCellRight: {
    padding: '20px',
    fontSize: '14px',
    color: '#374151',
    verticalAlign: 'middle',
    textAlign: 'right'
  },

  clientInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },

  clientAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '16px',
    fontWeight: '600'
  },

  clientName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '2px'
  },

  clientEmail: {
    fontSize: '12px',
    color: '#64748b'
  },

  companyInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#374151'
  },

  companyIcon: {
    color: '#94a3b8'
  },

  statusBadge: {
    display: 'inline-block',
    padding: '4px 8px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '500',
    border: '1px solid',
    textTransform: 'capitalize'
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

  dateText: {
    color: '#64748b',
    fontSize: '14px'
  },

  engagementContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },

  engagementBar: {
    width: '80px',
    height: '6px',
    backgroundColor: '#f1f5f9',
    borderRadius: '3px',
    overflow: 'hidden'
  },

  engagementFill: {
    height: '100%',
    borderRadius: '3px',
    transition: 'width 0.3s ease'
  },

  engagementText: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    minWidth: '35px'
  },

  actionsContainer: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'flex-end'
  },

  actionButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    backgroundColor: 'white',
    color: '#64748b',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textDecoration: 'none'
  },

  deleteButton: {
    color: '#ef4444'
  },

  emptyState: {
    padding: '80px 20px',
    textAlign: 'center',
    borderBottom: 'none'
  },

  emptyStateContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px'
  },

  emptyStateTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#374151',
    margin: 0
  },

  emptyStateText: {
    fontSize: '14px',
    color: '#64748b',
    margin: 0
  },

  emptyStateButton: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    padding: '12px 24px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontSize: '14px'
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
    gap: '16px'
  },

  paginationButton: {
    padding: '8px 16px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
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

  paginationText: {
    fontSize: '14px',
    color: '#64748b'
  }
};

const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  /* Hover Effects */
  .table-row:hover {
    background-color: #f8fafc !important;
  }

  .add-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4) !important;
  }

  .clear-button:hover {
    background-color: white !important;
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

  .search-input:focus, .filter-select:focus {
    outline: none !important;
    border-color: #667eea !important;
    background-color: white !important;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1) !important;
  }

  .pagination-button:hover:not(:disabled) {
    background-color: #f8fafc !important;
    border-color: #cbd5e1 !important;
  }

  .empty-state-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4) !important;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .filters-container {
      flex-direction: column !important;
      align-items: stretch !important;
    }

    .search-container {
      min-width: auto !important;
    }

    .filters {
      justify-content: space-between !important;
    }

    .filter-select {
      flex: 1 !important;
      min-width: auto !important;
    }

    .table-container {
      overflow-x: auto !important;
    }

    .pagination-container {
      flex-direction: column !important;
      text-align: center !important;
    }

    .header {
      flex-direction: column !important;
      align-items: stretch !important;
    }

    .header-left {
      text-align: center !important;
      margin-bottom: 16px !important;
    }
  }
`;
document.head.appendChild(styleSheet);

export default ClientList;