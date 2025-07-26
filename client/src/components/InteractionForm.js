import React, { useState, useEffect } from 'react';
import { interactionAPI } from '../services/interactionAPI';
import { clientAPI } from '../services/api';

const InteractionForm = ({ 
  interaction = null, 
  clientId = null, 
  onSubmit, 
  onCancel,
  clients = [] 
}) => {
  const [formData, setFormData] = useState({
    clientId: clientId || '',
    type: 'note',
    subject: '',
    content: '',
    date: new Date().toISOString().slice(0, 16), // datetime-local format
    duration: '',
    outcome: '',
    followUpRequired: false,
    followUpDate: '',
    priority: 'medium',
    tags: []
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [availableClients, setAvailableClients] = useState(clients);
  const [tagInput, setTagInput] = useState('');

  // Load form data if editing
  useEffect(() => {
    if (interaction) {
      setFormData({
        clientId: interaction.clientId?._id || interaction.clientId,
        type: interaction.type,
        subject: interaction.subject,
        content: interaction.content || '',
        date: new Date(interaction.date).toISOString().slice(0, 16),
        duration: interaction.duration || '',
        outcome: interaction.outcome || '',
        followUpRequired: interaction.followUpRequired || false,
        followUpDate: interaction.followUpDate 
          ? new Date(interaction.followUpDate).toISOString().slice(0, 16)
          : '',
        priority: interaction.priority || 'medium',
        tags: interaction.tags || []
      });
    }
  }, [interaction]);

  // Load clients if not provided
  useEffect(() => {
    if (availableClients.length === 0) {
      const loadClients = async () => {
        try {
          const response = await clientAPI.getClients({ limit: 1000 });
          setAvailableClients(response.clients || []);
        } catch (error) {
          console.error('Error loading clients:', error);
        }
      };
      loadClients();
    }
  }, [availableClients.length]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleTagAdd = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (!formData.tags.includes(newTag)) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, newTag]
        }));
      }
      setTagInput('');
    }
  };

  const handleTagRemove = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.clientId) {
      newErrors.clientId = 'Client is required';
    }
    
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    } else if (formData.subject.length > 200) {
      newErrors.subject = 'Subject must be less than 200 characters';
    }

    if (formData.content && formData.content.length > 5000) {
      newErrors.content = 'Content must be less than 5000 characters';
    }

    if (formData.duration && (isNaN(formData.duration) || formData.duration < 0 || formData.duration > 1440)) {
      newErrors.duration = 'Duration must be between 0 and 1440 minutes';
    }

    if (formData.followUpRequired && !formData.followUpDate) {
      newErrors.followUpDate = 'Follow-up date is required when follow-up is needed';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const submitData = {
        ...formData,
        duration: formData.duration ? parseInt(formData.duration) : undefined,
        followUpDate: formData.followUpDate || undefined
      };

      let result;
      if (interaction) {
        result = await interactionAPI.updateInteraction(interaction._id, submitData);
      } else {
        result = await interactionAPI.createInteraction(submitData);
      }

      onSubmit(result);
    } catch (error) {
      console.error('Error submitting interaction:', error);
      if (error.response?.data?.errors) {
        const apiErrors = {};
        error.response.data.errors.forEach(err => {
          const field = err.path || err.param || 'general';
          apiErrors[field] = err.msg || err.message;
        });
        setErrors(apiErrors);
      } else {
        setErrors({ general: 'Failed to save interaction. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const selectedClient = availableClients.find(c => c._id === formData.clientId);

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {interaction ? 'Edit Interaction' : 'New Interaction'}
        </h2>
        {selectedClient && (
          <div className="text-sm text-gray-600">
            Client: <span className="font-medium">{selectedClient.name}</span>
            {selectedClient.company && (
              <span> ({selectedClient.company})</span>
            )}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Client Selection */}
        <div>
          <label htmlFor="clientId" className="block text-sm font-medium text-gray-700 mb-1">
            Client *
          </label>
          <select
            id="clientId"
            name="clientId"
            value={formData.clientId}
            onChange={handleInputChange}
            disabled={!!clientId} // Disable if clientId is preset
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.clientId ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            <option value="">Select a client...</option>
            {availableClients.map(client => (
              <option key={client._id} value={client._id}>
                {client.name} {client.company && `(${client.company})`}
              </option>
            ))}
          </select>
          {errors.clientId && <p className="mt-1 text-sm text-red-600">{errors.clientId}</p>}
        </div>

        {/* Type and Priority Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              Type *
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="email">📧 Email</option>
              <option value="meeting">🤝 Meeting</option>
              <option value="call">📞 Call</option>
              <option value="note">📝 Note</option>
            </select>
          </div>

          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="low">🟢 Low</option>
              <option value="medium">🟡 Medium</option>
              <option value="high">🔴 High</option>
            </select>
          </div>
        </div>

        {/* Subject */}
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
            Subject *
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleInputChange}
            maxLength={200}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.subject ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Brief description of the interaction..."
          />
          {errors.subject && <p className="mt-1 text-sm text-red-600">{errors.subject}</p>}
          <p className="mt-1 text-sm text-gray-500">{formData.subject.length}/200 characters</p>
        </div>

        {/* Date and Duration Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              Date & Time *
            </label>
            <input
              type="datetime-local"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
              Duration (minutes)
            </label>
            <input
              type="number"
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleInputChange}
              min="0"
              max="1440"
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.duration ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="e.g., 30"
            />
            {errors.duration && <p className="mt-1 text-sm text-red-600">{errors.duration}</p>}
          </div>
        </div>

        {/* Content */}
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
            Content
          </label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            rows={4}
            maxLength={5000}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.content ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Detailed notes about the interaction..."
          />
          {errors.content && <p className="mt-1 text-sm text-red-600">{errors.content}</p>}
          <p className="mt-1 text-sm text-gray-500">{formData.content.length}/5000 characters</p>
        </div>

        {/* Outcome */}
        <div>
          <label htmlFor="outcome" className="block text-sm font-medium text-gray-700 mb-1">
            Outcome
          </label>
          <select
            id="outcome"
            name="outcome"
            value={formData.outcome}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select outcome...</option>
            <option value="positive">✅ Positive</option>
            <option value="neutral">➖ Neutral</option>
            <option value="negative">❌ Negative</option>
            <option value="follow-up-needed">🔄 Follow-up Needed</option>
          </select>
        </div>

        {/* Follow-up Section */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center mb-3">
            <input
              type="checkbox"
              id="followUpRequired"
              name="followUpRequired"
              checked={formData.followUpRequired}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="followUpRequired" className="ml-2 block text-sm font-medium text-gray-700">
              Follow-up required
            </label>
          </div>
          
          {formData.followUpRequired && (
            <div>
              <label htmlFor="followUpDate" className="block text-sm font-medium text-gray-700 mb-1">
                Follow-up Date *
              </label>
              <input
                type="datetime-local"
                id="followUpDate"
                name="followUpDate"
                value={formData.followUpDate}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.followUpDate ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.followUpDate && <p className="mt-1 text-sm text-red-600">{errors.followUpDate}</p>}
            </div>
          )}
        </div>

        {/* Tags */}
        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
            Tags
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.tags.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleTagRemove(tag)}
                  className="ml-1 h-3 w-3 rounded-full inline-flex items-center justify-center text-blue-400 hover:bg-blue-200 hover:text-blue-600 focus:outline-none"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagAdd}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Type a tag and press Enter..."
          />
        </div>

        {/* Error Messages */}
        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-600">{errors.general}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-6 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : (interaction ? 'Update Interaction' : 'Create Interaction')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InteractionForm;