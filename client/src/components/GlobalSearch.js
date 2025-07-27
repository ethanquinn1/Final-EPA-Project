import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const GlobalSearch = ({ onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState({ clients: [], interactions: [], totalResults: 0 });
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    dateFrom: '',
    dateTo: '',
    tags: ''
  });
  const searchInputRef = useRef(null);

  useEffect(() => {
    // Focus on search input when component mounts
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        handleSearch();
      } else {
        setResults({ clients: [], interactions: [], totalResults: 0 });
      }
    }, 300); // Debounce search

    return () => clearTimeout(delayedSearch);
  }, [searchQuery, filters]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const params = new URLSearchParams({
        q: searchQuery,
        ...Object.fromEntries(Object.entries(filters).filter(([_, value]) => value))
      });
      
      const response = await fetch(`/api/search/global?${params}`);
      if (!response.ok) throw new Error('Search failed');
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Search error:', error);
      setResults({ clients: [], interactions: [], totalResults: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      type: '',
      status: '',
      dateFrom: '',
      dateTo: '',
      tags: ''
    });
  };

  const highlightMatch = (text, query) => {
    if (!query || !text) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, index) => 
      regex.test(part) ? 
        <mark key={index} className="bg-yellow-200 px-1 rounded">{part}</mark> : 
        part
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-16">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search clients, interactions, notes..."
                className="w-full border border-gray-300 rounded-lg px-4 py-2 pl-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyDown={(e) => e.key === 'Escape' && onClose()}
              />
              <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {loading && (
                <div className="absolute right-3 top-2.5">
                  <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                </div>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
              </svg>
              Filters
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="prospect">Prospect</option>
                  <option value="inactive">Inactive</option>
                  <option value="closed">Closed</option>
                </select>
                
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                >
                  <option value="">All Types</option>
                  <option value="email">Email</option>
                  <option value="meeting">Meeting</option>
                  <option value="call">Call</option>
                  <option value="note">Note</option>
                </select>
                
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                  placeholder="From Date"
                />
                
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                  placeholder="To Date"
                />
                
                <input
                  type="text"
                  value={filters.tags}
                  onChange={(e) => handleFilterChange('tags', e.target.value)}
                  placeholder="Tags (comma-separated)"
                  className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                />
                
                <button
                  onClick={clearFilters}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Clear All
                </button>
              </div>
            </div>
          )}

          {/* Results Summary */}
          {searchQuery && (
            <div className="mt-3 text-sm text-gray-600">
              {results.totalResults > 0 ? (
                <span>Found {results.totalResults} results for "{searchQuery}"</span>
              ) : loading ? (
                <span>Searching...</span>
              ) : (
                <span>No results found for "{searchQuery}"</span>
              )}
            </div>
          )}
        </div>

        {/* Results */}
        <div className="overflow-y-auto max-h-96">
          {searchQuery && results.totalResults > 0 && (
            <div className="p-4 space-y-6">
              {/* Client Results */}
              {results.clients.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-3 text-gray-900">
                    Clients ({results.clients.length})
                  </h3>
                  <div className="space-y-3">
                    {results.clients.map((client) => (
                      <Link
                        key={client._id}
                        to={`/clients/${client._id}`}
                        onClick={onClose}
                        className="block border-l-4 border-blue-400 pl-4 py-3 hover:bg-gray-50 rounded-r-lg transition-colors"
                      >
                        <div className="font-medium text-gray-900">
                          {highlightMatch(client.name, searchQuery)}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {highlightMatch(client.company, searchQuery)} • {client.email}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            client.status === 'active' ? 'bg-green-100 text-green-800' :
                            client.status === 'prospect' ? 'bg-blue-100 text-blue-800' :
                            client.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {client.status}
                          </span>
                          <span className="text-xs text-gray-500">
                            Score: {client.engagementScore}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Interaction Results */}
              {results.interactions.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-3 text-gray-900">
                    Interactions ({results.interactions.length})
                  </h3>
                  <div className="space-y-3">
                    {results.interactions.map((interaction) => (
                      <Link
                        key={interaction._id}
                        to={`/clients/${interaction.clientId?._id}`}
                        onClick={onClose}
                        className="block border-l-4 border-green-400 pl-4 py-3 hover:bg-gray-50 rounded-r-lg transition-colors"
                      >
                        <div className="font-medium text-gray-900">
                          {highlightMatch(interaction.subject, searchQuery)}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {interaction.clientId?.name} • {interaction.type} • 
                          {new Date(interaction.date).toLocaleDateString()}
                        </div>
                        {interaction.content && (
                          <div className="text-xs text-gray-500 mt-2 line-clamp-2">
                            {highlightMatch(interaction.content, searchQuery)}
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            interaction.priority >= 4 ? 'bg-red-100 text-red-800' :
                            interaction.priority >= 3 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            Priority {interaction.priority}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs ${
                            interaction.outcome === 'positive' ? 'bg-green-100 text-green-800' :
                            interaction.outcome === 'negative' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {interaction.outcome}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Empty State */}
          {searchQuery && !loading && results.totalResults === 0 && (
            <div className="p-8 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-500">Try adjusting your search terms or filters</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 text-xs text-gray-500 flex justify-between">
          <span>Use ↑↓ to navigate, Enter to select, Esc to close</span>
          <span>Tip: Type at least 2 characters to search</span>
        </div>
      </div>
    </div>
  );
};

export default GlobalSearch;