import React, { useState } from 'react';
import ClientList from '../components/ClientList';
import ClientForm from '../components/ClientForm';

const Clients = () => {
  const [selectedClient, setSelectedClient] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Handle adding new client
  const handleAddClient = () => {
    setEditingClient(null);
    setIsFormOpen(true);
  };

  // Handle editing existing client
  const handleEditClient = (client) => {
    setEditingClient(client);
    setIsFormOpen(true);
  };

  // Handle client selection (for future detail view)
  const handleClientSelect = (client) => {
    setSelectedClient(client);
    // TODO: Navigate to client detail page or show detail panel
    console.log('Selected client:', client);
  };

  // Handle form save
  const handleFormSave = (savedClient) => {
    setIsFormOpen(false);
    setEditingClient(null);
    setRefreshKey(prev => prev + 1); // Refresh the list
    
    // Show success message
    const action = editingClient ? 'updated' : 'created';
    console.log(`Client ${action} successfully:`, savedClient);
  };

  // Handle form cancel
  const handleFormCancel = () => {
    setIsFormOpen(false);
    setEditingClient(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Client Management</h1>
          <p className="mt-2 text-gray-600">
            Manage your client relationships and track engagement
          </p>
        </div>

        {/* Client List */}
        <ClientList
          key={refreshKey} // Force refresh when refreshKey changes
          onClientSelect={handleClientSelect}
          onClientEdit={handleEditClient}
          onClientAdd={handleAddClient}
        />

        {/* Client Form Modal */}
        <ClientForm
          client={editingClient}
          onSave={handleFormSave}
          onCancel={handleFormCancel}
          isOpen={isFormOpen}
        />
      </div>
    </div>
  );
};

export default Clients;