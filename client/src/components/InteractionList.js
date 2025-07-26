import React, { useState, useEffect } from 'react';
import { interactionAPI } from '../services/interactionAPI';

const InteractionList = ({ 
  clientId = null, 
  onInteractionEdit, 
  onInteractionDelete,
  refreshTrigger = 0 
}) => {
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

  // Load interactions
  const loadInteractions = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = { ...filters };
      if (clientId) params.clientId = clientId;

      // Remove empty filters
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

  // Load interactions on mount and when filters change
  useEffect(() => {
    loadInteractions();
  }, [clientId, filters, refreshTrigger]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filtering
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
      await loadInteractions(); // Refresh the list
      if (onInteractionDelete) {
        onInteractionDelete(interaction);
      }
    } catch (error) {
      console.error('Error deleting interaction:', error);
      alert('Failed to delete interaction');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getTypeIcon = (type) => {
    const icons = {
      email: '📧',
      meeting: '🤝',
      call: '📞',
      note: '📝'
    };
    return icons[type] || '📝';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const getOutcomeColor = (outcome) => {
    const colors = {
      positive: 'bg-green-100 text-green-800',
      neutral: 'bg-gray-100 text-gray-800',
      negative: 'bg-red-100 text-red-800',
      'follow-up-needed': 'bg-orange-100 text-orange-800'
    };
    return colors[outcome] || 'bg-gray-100 text-gray-800';
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

  if (loading && interactions.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              {clientId ? 'Client Interactions' : 'All Interactions'}
            </h3>
            <p className="text-sm text-gray-500">
              {pagination.totalItems || 0} total interactions
            </p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search subject, content..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">All types</option>
                <option value="email">📧 Email</option>
                <option value="meeting">🤝 Meeting</option>
                <option value="call">📞 Call</option>
                <option value="note">📝 Note</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={filters.priority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">All priorities</option>
                <option value="low">🟢 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🔴 High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Follow-ups</label>
              <select
                value={filters.followUpRequired}
                onChange={(e) => handleFilterChange('followUpRequired', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">All interactions</option>
                <option value="true">Needs follow-up</option>
                <option value="false">No follow-up needed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="-date">Newest first</option>
                <option value="date">Oldest first</option>
                <option value="subject">Subject A-Z</option>
                <option value="-subject">Subject Z-A</option>
                <option value="type">Type</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="px-6 py-4 bg-red-50 border-b border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Interactions List */}
      <div className="divide-y divide-gray-200">
        {interactions.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="text-gray-400 text-4xl mb-4">📝</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No interactions found</h3>
            <p className="text-gray-500">
              {filters.search || filters.type || filters.priority ? 
                'Try adjusting your filters to see more results.' : 
                'Start by creating your first interaction.'
              }
            </p>
          </div>
        ) : (
          interactions.map((interaction) => (
            <div key={interaction._id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-lg">{getTypeIcon(interaction.type)}</span>
                    <h4 className="text-lg font-medium text-gray-900 truncate">
                      {interaction.subject}
                    </h4>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(interaction.priority)}`}>
                      {interaction.priority}
                    </span>
                    {interaction.outcome && (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getOutcomeColor(interaction.outcome)}`}>
                        {interaction.outcome.replace('-', ' ')}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                    {!clientId && interaction.clientId && (
                      <span>
                        <strong>Client:</strong> {interaction.clientId.name}
                        {interaction.clientId.company && ` (${interaction.clientId.company})`}
                      </span>
                    )}
                    <span><strong>Date:</strong> {formatDate(interaction.date)}</span>
                    {interaction.duration && (
                      <span><strong>Duration:</strong> {interaction.duration} min</span>
                    )}
                  </div>

                  {interaction.content && (
                    <p className="text-gray-700 text-sm mb-2">
                      {interaction.content.length > 200 
                        ? `${interaction.content.substring(0, 200)}...` 
                        : interaction.content
                      }
                    </p>
                  )}

                  <div className="flex items-center space-x-4 text-sm">
                    {interaction.followUpRequired && (
                      <span className="flex items-center text-orange-600">
                        🔄 Follow-up: {interaction.followUpDate ? 
                          new Date(interaction.followUpDate).toLocaleDateString() : 
                          'Date TBD'
                        }
                      </span>
                    )}
                    
                    {interaction.tags && interaction.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {interaction.tags.map(tag => (
                          <span
                            key={tag}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => onInteractionEdit && onInteractionEdit(interaction)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md"
                    title="Edit interaction"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(interaction)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md"
                    title="Delete interaction"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{' '}
              {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
              {pagination.totalItems} results
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage <= 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {/* Page Numbers */}
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const pageNum = Math.max(1, pagination.currentPage - 2) + i;
                if (pageNum > pagination.totalPages) return null;
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      pageNum === pagination.currentPage
                        ? 'text-blue-600 bg-blue-50 border border-blue-300'
                        : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage >= pagination.totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && interactions.length > 0 && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );
};

export default InteractionList;