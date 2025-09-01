import React, { useState, useEffect } from 'react';
import { interactionAPI } from '../services/interactionAPI';
import { clientAPI } from '../services/api';
import { 
  X, 
  User, 
  Mail, 
  Calendar, 
  Clock, 
  MessageSquare, 
  FileText, 
  Tag, 
  Save, 
  AlertCircle,
  Phone,
  Video,
  Target,
  CheckCircle
} from 'lucide-react';

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
    date: new Date().toISOString().slice(0, 16),
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
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.container}>
          {/* Header */}
          <div style={styles.header}>
            <div style={styles.headerLeft}>
              <div style={styles.headerIcon}>
                <MessageSquare size={24} color="white" />
              </div>
              <div>
                <h2 style={styles.title}>
                  {interaction ? 'Edit Interaction' : 'New Interaction'}
                </h2>
                {selectedClient && (
                  <p style={styles.subtitle}>
                    Client: <strong>{selectedClient.name}</strong>
                    {selectedClient.company && ` (${selectedClient.company})`}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={onCancel}
              style={styles.closeButton}
            >
              <X size={24} />
            </button>
          </div>

          {/* Error Message */}
          {errors.general && (
            <div style={styles.errorAlert}>
              <AlertCircle size={20} />
              <span>{errors.general}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={styles.form}>
            {/* Client Selection Section */}
            <div style={styles.section}>
              <div style={styles.sectionHeader}>
                <User size={20} style={styles.sectionIcon} />
                <h4 style={styles.sectionTitle}>Client Information</h4>
              </div>
              
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  <User size={16} style={styles.labelIcon} />
                  Client *
                </label>
                <select
                  name="clientId"
                  value={formData.clientId}
                  onChange={handleInputChange}
                  disabled={!!clientId}
                  style={{
                    ...styles.select,
                    ...(errors.clientId ? styles.inputError : {}),
                    ...(clientId ? styles.selectDisabled : {})
                  }}
                >
                  <option value="">Select a client...</option>
                  {availableClients.map(client => (
                    <option key={client._id} value={client._id}>
                      {client.name} {client.company && `(${client.company})`}
                    </option>
                  ))}
                </select>
                {errors.clientId && <p style={styles.errorText}>{errors.clientId}</p>}
              </div>
            </div>

            {/* Interaction Details Section */}
            <div style={styles.section}>
              <div style={styles.sectionHeader}>
                <MessageSquare size={20} style={styles.sectionIcon} />
                <h4 style={styles.sectionTitle}>Interaction Details</h4>
              </div>
              
              <div style={styles.grid}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Type *</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    style={styles.select}
                  >
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
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    style={styles.select}
                  >
                    <option value="low">🟢 Low</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="high">🔴 High</option>
                  </select>
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  <FileText size={16} style={styles.labelIcon} />
                  Subject *
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  maxLength={200}
                  style={{
                    ...styles.input,
                    ...(errors.subject ? styles.inputError : {})
                  }}
                  placeholder="Brief description of the interaction..."
                />
                {errors.subject && <p style={styles.errorText}>{errors.subject}</p>}
                <p style={styles.helpText}>{formData.subject.length}/200 characters</p>
              </div>

              <div style={styles.grid}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    <Calendar size={16} style={styles.labelIcon} />
                    Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    style={styles.input}
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    <Clock size={16} style={styles.labelIcon} />
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    min="0"
                    max="1440"
                    style={{
                      ...styles.input,
                      ...(errors.duration ? styles.inputError : {})
                    }}
                    placeholder="e.g., 30"
                  />
                  {errors.duration && <p style={styles.errorText}>{errors.duration}</p>}
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  <FileText size={16} style={styles.labelIcon} />
                  Content
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  rows={4}
                  maxLength={5000}
                  style={{
                    ...styles.textarea,
                    ...(errors.content ? styles.inputError : {})
                  }}
                  placeholder="Detailed notes about the interaction..."
                />
                {errors.content && <p style={styles.errorText}>{errors.content}</p>}
                <p style={styles.helpText}>{formData.content.length}/5000 characters</p>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  <CheckCircle size={16} style={styles.labelIcon} />
                  Outcome
                </label>
                <select
                  name="outcome"
                  value={formData.outcome}
                  onChange={handleInputChange}
                  style={styles.select}
                >
                  <option value="">Select outcome...</option>
                  <option value="positive">✅ Positive</option>
                  <option value="neutral">➖ Neutral</option>
                  <option value="negative">❌ Negative</option>
                  <option value="follow-up-needed">🔄 Follow-up Needed</option>
                </select>
              </div>
            </div>

            {/* Follow-up Section */}
            <div style={styles.section}>
              <div style={styles.sectionHeader}>
                <Target size={20} style={styles.sectionIcon} />
                <h4 style={styles.sectionTitle}>Follow-up</h4>
              </div>
              
              <div style={styles.followUpContainer}>
                <div style={styles.checkboxContainer}>
                  <input
                    type="checkbox"
                    id="followUpRequired"
                    name="followUpRequired"
                    checked={formData.followUpRequired}
                    onChange={handleInputChange}
                    style={styles.checkbox}
                  />
                  <label htmlFor="followUpRequired" style={styles.checkboxLabel}>
                    Follow-up required
                  </label>
                </div>
                
                {formData.followUpRequired && (
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>
                      <Calendar size={16} style={styles.labelIcon} />
                      Follow-up Date *
                    </label>
                    <input
                      type="datetime-local"
                      name="followUpDate"
                      value={formData.followUpDate}
                      onChange={handleInputChange}
                      style={{
                        ...styles.input,
                        ...(errors.followUpDate ? styles.inputError : {})
                      }}
                    />
                    {errors.followUpDate && <p style={styles.errorText}>{errors.followUpDate}</p>}
                  </div>
                )}
              </div>
            </div>

            {/* Tags Section */}
            <div style={styles.section}>
              <div style={styles.sectionHeader}>
                <Tag size={20} style={styles.sectionIcon} />
                <h4 style={styles.sectionTitle}>Tags</h4>
              </div>
              
              <div style={styles.inputGroup}>
                <div style={styles.tagsContainer}>
                  {formData.tags.map(tag => (
                    <span key={tag} style={styles.tag}>
                      #{tag}
                      <button
                        type="button"
                        onClick={() => handleTagRemove(tag)}
                        style={styles.tagRemove}
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
                  style={styles.input}
                  placeholder="Type a tag and press Enter..."
                />
              </div>
            </div>

            {/* Form Actions */}
            <div style={styles.actions}>
              <button
                type="button"
                onClick={onCancel}
                style={styles.cancelButton}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  ...styles.submitButton,
                  ...(loading ? styles.submitButtonDisabled : {})
                }}
              >
                {loading ? (
                  <div style={styles.loadingContent}>
                    <div style={styles.spinner}></div>
                    Saving...
                  </div>
                ) : (
                  <div style={styles.submitContent}>
                    <Save size={20} />
                    {interaction ? 'Update Interaction' : 'Create Interaction'}
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    overflowY: 'auto',
    height: '100%',
    width: '100%',
    zIndex: 50,
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    padding: '20px'
  },

  modal: {
    position: 'relative',
    width: '100%',
    maxWidth: '800px',
    backgroundColor: 'white',
    borderRadius: '20px',
    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
    marginTop: '40px',
    marginBottom: '40px'
  },

  container: {
    padding: '32px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
    paddingBottom: '24px',
    borderBottom: '1px solid #f1f5f9'
  },

  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },

  headerIcon: {
    width: '48px',
    height: '48px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
  },

  title: {
    fontSize: '24px',
    fontWeight: '700',
    margin: 0,
    color: '#1e293b'
  },

  subtitle: {
    fontSize: '14px',
    color: '#64748b',
    margin: '4px 0 0 0'
  },

  closeButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    backgroundColor: 'white',
    color: '#64748b',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },

  errorAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '12px',
    color: '#991b1b',
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '24px'
  },

  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '32px'
  },

  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },

  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    paddingBottom: '16px',
    borderBottom: '1px solid #f1f5f9'
  },

  sectionIcon: {
    color: '#667eea'
  },

  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    margin: 0,
    color: '#1e293b'
  },

  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px'
  },

  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },

  label: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '4px'
  },

  labelIcon: {
    color: '#94a3b8'
  },

  input: {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '14px',
    fontFamily: 'inherit',
    transition: 'all 0.2s ease',
    backgroundColor: '#f8fafc',
    boxSizing: 'border-box'
  },

  select: {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '14px',
    fontFamily: 'inherit',
    transition: 'all 0.2s ease',
    backgroundColor: '#f8fafc',
    boxSizing: 'border-box',
    cursor: 'pointer'
  },

  selectDisabled: {
    backgroundColor: '#f1f5f9',
    color: '#94a3b8',
    cursor: 'not-allowed'
  },

  textarea: {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '14px',
    fontFamily: 'inherit',
    transition: 'all 0.2s ease',
    backgroundColor: '#f8fafc',
    boxSizing: 'border-box',
    resize: 'vertical',
    minHeight: '100px'
  },

  inputError: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2'
  },

  errorText: {
    fontSize: '12px',
    color: '#ef4444',
    margin: '4px 0 0 0',
    fontWeight: '500'
  },

  helpText: {
    fontSize: '12px',
    color: '#64748b',
    margin: '4px 0 0 0'
  },

  followUpContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #f1f5f9'
  },

  checkboxContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px'
  },

  checkbox: {
    width: '18px',
    height: '18px',
    accentColor: '#667eea',
    cursor: 'pointer'
  },

  checkboxLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    cursor: 'pointer'
  },

  tagsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginBottom: '12px',
    minHeight: '24px'
  },

  tag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    backgroundColor: '#dbeafe',
    color: '#1d4ed8',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '500'
  },

  tagRemove: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '16px',
    height: '16px',
    backgroundColor: 'rgba(29, 78, 216, 0.2)',
    border: 'none',
    borderRadius: '50%',
    color: '#1d4ed8',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 'bold',
    transition: 'all 0.2s ease'
  },

  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    paddingTop: '24px',
    borderTop: '1px solid #f1f5f9'
  },

  cancelButton: {
    padding: '12px 24px',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    backgroundColor: 'white',
    color: '#64748b',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },

  submitButton: {
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
    minWidth: '160px'
  },

  submitButtonDisabled: {
    opacity: 0.7,
    cursor: 'not-allowed'
  },

  loadingContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },

  submitContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },

  spinner: {
    width: '16px',
    height: '16px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTop: '2px solid white',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  }
};

// Adds CSS animations and hover effects
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  /* Focus and hover effects */
  input:focus, select:focus, textarea:focus {
    outline: none !important;
    border-color: #667eea !important;
    background-color: white !important;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1) !important;
  }

  .close-button:hover {
    background-color: #f8fafc !important;
    border-color: #cbd5e1 !important;
    color: #374151 !important;
  }

  .cancel-button:hover {
    background-color: #f8fafc !important;
    border-color: #cbd5e1 !important;
    color: #374151 !important;
  }

  .submit-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4) !important;
  }

  .tag-remove:hover {
    background-color: rgba(29, 78, 216, 0.3) !important;
  }

  /* Responsive design */
  @media (max-width: 768px) {
    .modal {
      margin: 20px !important;
      max-width: calc(100% - 40px) !important;
    }

    .container {
      padding: 24px !important;
    }

    .grid {
      grid-template-columns: 1fr !important;
    }

    .header {
      flex-direction: column !important;
      gap: 16px !important;
      align-items: flex-start !important;
    }

    .header-left {
      width: 100% !important;
    }

    .actions {
      flex-direction: column-reverse !important;
    }

    .cancel-button, .submit-button {
      width: 100% !important;
      justify-content: center !important;
    }
  }

  @media (max-width: 480px) {
    .overlay {
      padding: 10px !important;
    }

    .modal {
      margin: 10px !important;
      max-width: calc(100% - 20px) !important;
    }

    .container {
      padding: 20px !important;
    }

    .title {
      fontSize: 20px !important;
    }

    .header-icon {
      width: 40px !important;
      height: 40px !important;
    }
  }
`;
document.head.appendChild(styleSheet);

export default InteractionForm;