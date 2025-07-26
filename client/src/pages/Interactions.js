import React, { useState } from 'react';
import InteractionList from '../components/InteractionList';
import InteractionForm from '../components/InteractionForm';

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
    setRefreshTrigger(prev => prev + 1); // Trigger refresh
  };

  if (showForm) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <InteractionForm
          interaction={editingInteraction}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Interactions</h1>
            <p className="mt-2 text-gray-600">
              Track all your client communications and activities
            </p>
          </div>
          <button
            onClick={handleNewInteraction}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Interaction
          </button>
        </div>
      </div>

      {/* Interactions List */}
      <InteractionList
        onInteractionEdit={handleEditInteraction}
        onInteractionDelete={handleInteractionDelete}
        refreshTrigger={refreshTrigger}
      />
    </div>
  );
};

export default Interactions;