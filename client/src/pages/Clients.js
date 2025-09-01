import React, { useState } from 'react';
import ClientList from '../components/ClientList';
import ClientForm from '../components/ClientForm';

const Clients = () => {
  const [selectedClient, setSelectedClient] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAddClient = () => {
    setEditingClient(null);
    setIsFormOpen(true);
  };

  const handleEditClient = (client) => {
    setEditingClient(client);
    setIsFormOpen(true);
  };

  const handleClientSelect = (client) => {
    setSelectedClient(client);
    console.log('Selected client:', client);
  };

  const handleFormSave = (savedClient) => {
    setIsFormOpen(false);
    setEditingClient(null);
    setRefreshKey(prev => prev + 1);
    
    const action = editingClient ? 'updated' : 'created';
    console.log(`Client ${action} successfully:`, savedClient);
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setEditingClient(null);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.titleSection}>
          <h1 style={styles.pageTitle}>Client Management</h1>
          <p style={styles.pageSubtitle}>
            Manage your client relationships and track engagement
          </p>
        </div>
        <button 
          style={styles.addButton}
          onClick={handleAddClient} 
        >
          + Add Client
        </button>
      </div>

      {/* Simple Content Wrapper - a white background */}
      <div style={styles.contentWrapper}>
        <ClientList
          key={refreshKey} 
          onClientSelect={handleClientSelect} 
          onClientEdit={handleEditClient}
          onClientAdd={handleAddClient}
        />
      </div>

      <ClientForm
        client={editingClient}
        onSave={handleFormSave}
        onCancel={handleFormCancel}
        isOpen={isFormOpen}
      />
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

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
    flexWrap: 'wrap',
    gap: '16px'
  },

  titleSection: {
    flex: 1,
    minWidth: '300px'
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

  addButton: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    padding: '12px 24px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
    fontSize: '14px'
  },

  contentWrapper: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    border: '1px solid #f1f5f9'
  }
};

export default Clients;