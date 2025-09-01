import React, { useState, useEffect } from 'react';
import { interactionAPI } from '../services/interactionAPI';

const FollowUpDashboard = () => {
  const [followUps, setFollowUps] = useState([]);
  const [filter, setFilter] = useState('due'); // 'due', 'overdue', 'upcoming'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadFollowUps();
  }, [filter]);

  const loadFollowUps = async () => {
    try {
      setLoading(true);
      let data = [];
      
      switch (filter) {
        case 'due':
          data = await interactionAPI.getDueFollowUps(0); // Due today
          break;
        case 'overdue':
          data = await interactionAPI.getDueFollowUps(-7); // Overdue (past 7 days)
          break;
        case 'upcoming':
          data = await interactionAPI.getDueFollowUps(7); // Due in next 7 days
          break;
        default:
          data = await interactionAPI.getDueFollowUps(7);
      }
      
      setFollowUps(data);
    } catch (err) {
      setError('Failed to load follow-ups');
      console.error('Follow-up loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const markFollowUpComplete = async (interactionId) => {
    try {
      await interactionAPI.updateInteraction(interactionId, {
        outcome: 'completed',
        followUpCompleted: true
      });
      
      // Remove from current list
      setFollowUps(prev => prev.filter(item => item._id !== interactionId));
    } catch (err) {
      console.error('Error marking follow-up complete:', err);
      alert('Failed to mark follow-up as complete');
    }
  };

  const getDaysUntilDue = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getPriorityColor = (priority, daysUntilDue) => {
    if (daysUntilDue < 0) return 'bg-red-100 text-red-800 border-red-200'; // Overdue
    if (daysUntilDue === 0) return 'bg-orange-100 text-orange-800 border-orange-200'; // Due today
    if (priority >= 4) return 'bg-red-50 text-red-700 border-red-100'; // High priority
    if (priority >= 3) return 'bg-yellow-50 text-yellow-700 border-yellow-100'; // Medium priority
    return 'bg-green-50 text-green-700 border-green-100'; // Low priority
  };

  const formatDueStatus = (dueDate) => {
    const days = getDaysUntilDue(dueDate);
    if (days < 0) return `${Math.abs(days)} days overdue`;
    if (days === 0) return 'Due today';
    if (days === 1) return 'Due tomorrow';
    return `Due in ${days} days`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Follow-up Management</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('overdue')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                filter === 'overdue'
                  ? 'bg-red-100 text-red-700 border border-red-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Overdue ({followUps.filter(f => getDaysUntilDue(f.followUpDate) < 0).length})
            </button>
            <button
              onClick={() => setFilter('due')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                filter === 'due'
                  ? 'bg-orange-100 text-orange-700 border border-orange-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Due Today
            </button>
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                filter === 'upcoming'
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Upcoming
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
            <div className="text-red-800">{error}</div>
            <button 
              onClick={loadFollowUps}
              className="mt-2 text-red-600 hover:text-red-800 underline"
            >
              Retry
            </button>
          </div>
        )}

        {followUps.length === 0 ? (
          <div className="text-center py-8">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No follow-ups found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filter === 'overdue' && "Great! No overdue follow-ups."}
              {filter === 'due' && "No follow-ups due today."}
              {filter === 'upcoming' && "No upcoming follow-ups in the next 7 days."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {followUps.map((followUp) => {
              const daysUntilDue = getDaysUntilDue(followUp.followUpDate);
              return (
                <div
                  key={followUp._id}
                  className={`p-4 rounded-lg border-2 ${getPriorityColor(followUp.priority, daysUntilDue)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-xs font-medium uppercase tracking-wide opacity-75">
                          {followUp.type}
                        </span>
                        <span className="text-xs font-medium opacity-75">
                          {followUp.clientId?.name || 'Unknown Client'}
                        </span>
                      </div>
                      <h4 className="font-medium text-gray-900 mb-1">{followUp.subject}</h4>
                      {followUp.followUpNotes && (
                        <p className="text-sm opacity-75 mb-2">{followUp.followUpNotes}</p>
                      )}
                      <div className="flex items-center space-x-4 text-xs">
                        <span className="font-medium">
                          {formatDueStatus(followUp.followUpDate)}
                        </span>
                        <span>
                          Priority: {followUp.priority}/5
                        </span>
                        <span>
                          {new Date(followUp.followUpDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => markFollowUpComplete(followUp._id)}
                        className="px-3 py-1 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 transition-colors"
                      >
                        Mark Complete
                      </button>
                      <button
                        onClick={() => {
                          // Navigate to edit interaction
                          window.location.href = `/interactions?edit=${followUp._id}`;
                        }}
                        className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      {followUps.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {followUps.length} follow-up{followUps.length !== 1 ? 's' : ''} {filter}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  const overdueCount = followUps.filter(f => getDaysUntilDue(f.followUpDate) < 0).length;
                  if (overdueCount > 0) {
                    alert(`You have ${overdueCount} overdue follow-ups that need attention!`);
                  }
                }}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                View All
              </button>
              <button
                onClick={loadFollowUps}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FollowUpDashboard;