import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

const ClientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [clientData, setClientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showNewInteraction, setShowNewInteraction] = useState(false);

  useEffect(() => {
    fetchClientDetail();
  }, [id]);

  const fetchClientDetail = async () => {
    try {
      const response = await fetch(`/api/clients/${id}/detail`);
      if (!response.ok) throw new Error('Failed to fetch client details');
      const data = await response.json();
      setClientData(data);
    } catch (error) {
      console.error('Error fetching client detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteFollowUp = async (interactionId) => {
    try {
      await fetch(`/api/interactions/${interactionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ outcome: 'completed' })
      });
      fetchClientDetail(); // Refresh data
    } catch (error) {
      console.error('Error completing follow-up:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!clientData) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Client not found</h2>
          <Link to="/clients" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
            ← Back to Clients
          </Link>
        </div>
      </div>
    );
  }

  const { client, interactions, engagementHistory, interactionTypeStats, upcomingFollowUps, analytics } = clientData;

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800 border-green-200',
      prospect: 'bg-blue-100 text-blue-800 border-blue-200',
      inactive: 'bg-gray-100 text-gray-800 border-gray-200',
      closed: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getEngagementColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPriorityColor = (priority) => {
    if (priority >= 4) return 'bg-red-100 text-red-800';
    if (priority >= 3) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <button 
            onClick={() => navigate('/clients')}
            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Clients
          </button>
        </div>
        
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
          <div className="flex-1">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{client.name}</h1>
            <p className="text-gray-600 text-lg">{client.company}</p>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(client.status)}`}>
                {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
              </span>
              {client.tags?.filter(tag => tag !== 'sample-data').map(tag => (
                <span key={tag} className="inline-block px-2 py-1 rounded bg-gray-100 text-gray-700 text-xs">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          
          <div className="flex flex-col items-center lg:items-end">
            <div className={`text-3xl lg:text-4xl font-bold ${getEngagementColor(client.engagementScore)}`}>
              {client.engagementScore}
            </div>
            <div className="text-sm text-gray-600">Engagement Score</div>
            <div className="text-xs text-gray-500 mt-1">
              Last updated: {new Date(client.updatedAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-xl lg:text-2xl font-bold text-gray-900">{analytics.totalInteractions}</div>
          <div className="text-sm text-gray-600">Total Interactions</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-xl lg:text-2xl font-bold text-gray-900">
            {analytics.avgPriority ? analytics.avgPriority.toFixed(1) : '0'}
          </div>
          <div className="text-sm text-gray-600">Avg Priority</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-xl lg:text-2xl font-bold text-orange-600">{analytics.pendingFollowUps}</div>
          <div className="text-sm text-gray-600">Pending Follow-ups</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-xl lg:text-2xl font-bold text-gray-900">
            {analytics.lastInteraction ? new Date(analytics.lastInteraction).toLocaleDateString() : 'N/A'}
          </div>
          <div className="text-sm text-gray-600">Last Contact</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <nav className="flex space-x-1 lg:space-x-8 overflow-x-auto">
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'interactions', label: 'Interactions' },
            { key: 'analytics', label: 'Analytics' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`py-2 px-3 lg:px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Client Information */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Client Information</h3>
              <Link 
                to={`/clients/${id}/edit`}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Edit
              </Link>
            </div>
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row">
                <span className="font-medium sm:w-24 text-gray-700">Email:</span> 
                <a href={`mailto:${client.email}`} className="text-blue-600 hover:underline">{client.email}</a>
              </div>
              <div className="flex flex-col sm:flex-row">
                <span className="font-medium sm:w-24 text-gray-700">Phone:</span> 
                <a href={`tel:${client.phone}`} className="text-blue-600 hover:underline">{client.phone || 'N/A'}</a>
              </div>
              <div className="flex flex-col sm:flex-row">
                <span className="font-medium sm:w-24 text-gray-700">Company:</span> 
                <span>{client.company}</span>
              </div>
              <div className="flex flex-col sm:flex-row">
                <span className="font-medium sm:w-24 text-gray-700">Tags:</span> 
                <span>{client.tags?.filter(tag => tag !== 'sample-data').join(', ') || 'None'}</span>
              </div>
              {client.notes && (
                <div className="pt-3 border-t">
                  <span className="font-medium text-gray-700">Notes:</span>
                  <p className="mt-1 text-gray-600">{client.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Follow-ups */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Upcoming Follow-ups</h3>
              <button
                onClick={() => setShowNewInteraction(true)}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                + Add Interaction
              </button>
            </div>
            {upcomingFollowUps && upcomingFollowUps.length > 0 ? (
              <div className="space-y-3">
                {upcomingFollowUps.slice(0, 5).map((followUp) => {
                  const isOverdue = new Date(followUp.followUpDate) < new Date();
                  return (
                    <div key={followUp._id} className={`border-l-4 pl-3 py-2 ${isOverdue ? 'border-red-400 bg-red-50' : 'border-yellow-400 bg-yellow-50'}`}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{followUp.subject}</div>
                          <div className="text-xs text-gray-600 mt-1">
                            {isOverdue ? 'Overdue: ' : 'Due: '}
                            {new Date(followUp.followUpDate).toLocaleDateString()}
                          </div>
                          {followUp.followUpNotes && (
                            <div className="text-xs text-gray-500 mt-1">{followUp.followUpNotes}</div>
                          )}
                        </div>
                        <button
                          onClick={() => handleCompleteFollowUp(followUp._id)}
                          className="text-green-600 hover:text-green-800 text-xs ml-2"
                        >
                          Complete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No upcoming follow-ups</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'interactions' && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Recent Interactions</h3>
              <button
                onClick={() => setShowNewInteraction(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
              >
                + New Interaction
              </button>
            </div>
            <div className="space-y-4">
              {interactions && interactions.length > 0 ? interactions.map((interaction) => (
                <div key={interaction._id} className="border-l-4 border-blue-400 pl-4 py-3 bg-gray-50 rounded-r-lg">
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-2">
                    <div className="flex-1">
                      <div className="font-medium">{interaction.subject}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        <span className="capitalize">{interaction.type}</span>
                        <span className={`ml-2 px-2 py-1 rounded text-xs ${getPriorityColor(interaction.priority)}`}>
                          Priority {interaction.priority}
                        </span>
                        <span className="ml-2 text-gray-500">
                          {new Date(interaction.date).toLocaleDateString()}
                        </span>
                      </div>
                      {interaction.content && (
                        <div className="text-sm text-gray-700 mt-2 bg-white p-2 rounded">{interaction.content}</div>
                      )}
                      {interaction.followUpDate && interaction.outcome !== 'completed' && (
                        <div className="text-xs text-orange-600 mt-2">
                          Follow-up due: {new Date(interaction.followUpDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        interaction.outcome === 'positive' ? 'bg-green-100 text-green-800' :
                        interaction.outcome === 'negative' ? 'bg-red-100 text-red-800' :
                        interaction.outcome === 'completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {interaction.outcome.replace('-', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
              )) : (
                <p className="text-gray-500 text-center py-8">No interactions yet</p>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Interaction Type Distribution */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">Interaction Types</h3>
            {interactionTypeStats && interactionTypeStats.length > 0 ? (
              <div className="flex justify-center">
                <PieChart width={300} height={250}>
                  <Pie
                    data={interactionTypeStats.map((stat) => ({ 
                      name: stat._id.charAt(0).toUpperCase() + stat._id.slice(1), 
                      value: stat.count 
                    }))}
                    cx={150}
                    cy={125}
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {interactionTypeStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No interaction data available</p>
            )}
          </div>

          {/* Engagement History */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">Monthly Activity</h3>
            {engagementHistory && engagementHistory.length > 0 ? (
              <div className="flex justify-center">
                <BarChart width={300} height={250} data={engagementHistory.map(item => ({
                  month: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
                  interactions: item.interactionCount,
                  avgPriority: item.avgScore
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="interactions" fill="#3B82F6" />
                </BarChart>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No historical data available</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDetail;