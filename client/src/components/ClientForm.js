// 📁 client/src/components/ClientForm.js
// Your existing functionality with professional styling upgrade
import React, { useState, useEffect } from 'react';
import { clientAPI } from '../services/api';
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  Building, 
  MapPin, 
  Calendar, 
  DollarSign,
  Link,
  FileText,
  Tag,
  Save,
  AlertCircle
} from 'lucide-react';

const ClientForm = ({ client, onSave, onCancel, isOpen }) => {
  // KEEP: All your existing state exactly as is
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    status: 'prospect',
    priority: 'medium',
    source: 'other',
    preferredContactMethod: 'email',
    industry: '',
    clientValue: '',
    notes: '',
    tags: '',
    linkedinProfile: '',
    website: '',
    nextFollowUpDate: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    }
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // KEEP: Your existing useEffect exactly as is
  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name || '',
        email: client.email || '',
        phone: client.phone || '',
        company: client.company || '',
        position: client.position || '',
        status: client.status || 'prospect',
        priority: client.priority || 'medium',
        source: client.source || 'other',
        preferredContactMethod: client.preferredContactMethod || 'email',
        industry: client.industry || '',
        clientValue: client.clientValue || '',
        notes: client.notes || '',
        tags: client.tags ? client.tags.join(', ') : '',
        linkedinProfile: client.linkedinProfile || '',
        website: client.website || '',
        nextFollowUpDate: client.nextFollowUpDate ? 
          new Date(client.nextFollowUpDate).toISOString().split('T')[0] : '',
        address: {
          street: client.address?.street || '',
          city: client.address?.city || '',
          state: client.address?.state || '',
          zipCode: client.address?.zipCode || '',
          country: client.address?.country || ''
        }
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        position: '',
        status: 'prospect',
        priority: 'medium',
        source: 'other',
        preferredContactMethod: 'email',
        industry: '',
        clientValue: '',
        notes: '',
        tags: '',
        linkedinProfile: '',
        website: '',
        nextFollowUpDate: '',
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: ''
        }
      });
    }
    setErrors({});
  }, [client, isOpen]);

  // KEEP: Your existing handleChange function exactly as is
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // KEEP: Your existing validateForm function exactly as is
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.company.trim()) {
      newErrors.company = 'Company is required';
    }

    if (formData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/[\s\-\(\)]/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (formData.clientValue && isNaN(formData.clientValue)) {
      newErrors.clientValue = 'Client value must be a number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // KEEP: Your existing handleSubmit function exactly as is
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const submitData = {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
        clientValue: formData.clientValue ? parseFloat(formData.clientValue) : 0,
        nextFollowUpDate: formData.nextFollowUpDate || null,
      };

      if (!Object.values(submitData.address).some(value => value.trim())) {
        delete submitData.address;
      }

      let result;
      if (client) {
        result = await clientAPI.updateClient(client._id, submitData);
      } else {
        result = await clientAPI.createClient(submitData);
      }

      onSave(result.client);
    } catch (error) {
      console.error('Error saving client:', error);
      if (error.response?.data?.errors) {
        const backendErrors = {};
        error.response.data.errors.forEach(err => {
          backendErrors[err.path] = err.msg;
        });
        setErrors(backendErrors);
      } else {
        setErrors({ general: 'Failed to save client. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.container}>
          {/* Professional Header */}
          <div style={styles.header}>
            <div style={styles.headerLeft}>
              <div style={styles.headerIcon}>
                <User size={24} color="white" />
              </div>
              <div>
                <h3 style={styles.title}>
                  {client ? 'Edit Client' : 'Add New Client'}
                </h3>
                <p style={styles.subtitle}>
                  {client ? 'Update client information' : 'Create a new client profile'}
                </p>
              </div>
            </div>
            <button
              onClick={onCancel}
              style={styles.closeButton}
            >
              <X size={24} />
            </button>
          </div>

          {/* Professional Error Message */}
          {errors.general && (
            <div style={styles.errorAlert}>
              <AlertCircle size={20} />
              <span>{errors.general}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={styles.form}>
            {/* Basic Information Section */}
            <div style={styles.section}>
              <div style={styles.sectionHeader}>
                <User size={20} style={styles.sectionIcon} />
                <h4 style={styles.sectionTitle}>Basic Information</h4>
              </div>
              
              <div style={styles.grid}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    <Mail size={16} style={styles.labelIcon} />
                    Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    style={{
                      ...styles.input,
                      ...(errors.name ? styles.inputError : {})
                    }}
                    placeholder="Enter full name"
                  />
                  {errors.name && <p style={styles.errorText}>{errors.name}</p>}
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    <Mail size={16} style={styles.labelIcon} />
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    style={{
                      ...styles.input,
                      ...(errors.email ? styles.inputError : {})
                    }}
                    placeholder="Enter email address"
                  />
                  {errors.email && <p style={styles.errorText}>{errors.email}</p>}
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    <Phone size={16} style={styles.labelIcon} />
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    style={{
                      ...styles.input,
                      ...(errors.phone ? styles.inputError : {})
                    }}
                    placeholder="Enter phone number"
                  />
                  {errors.phone && <p style={styles.errorText}>{errors.phone}</p>}
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    <Building size={16} style={styles.labelIcon} />
                    Company *
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    style={{
                      ...styles.input,
                      ...(errors.company ? styles.inputError : {})
                    }}
                    placeholder="Enter company name"
                  />
                  {errors.company && <p style={styles.errorText}>{errors.company}</p>}
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    <User size={16} style={styles.labelIcon} />
                    Position
                  </label>
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    style={styles.input}
                    placeholder="Enter job title"
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    <Building size={16} style={styles.labelIcon} />
                    Industry
                  </label>
                  <input
                    type="text"
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    style={styles.input}
                    placeholder="Enter industry"
                  />
                </div>
              </div>
            </div>

            {/* Relationship Details Section */}
            <div style={styles.section}>
              <div style={styles.sectionHeader}>
                <FileText size={20} style={styles.sectionIcon} />
                <h4 style={styles.sectionTitle}>Relationship Details</h4>
              </div>
              
              <div style={styles.grid}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    style={styles.select}
                  >
                    <option value="prospect">Prospect</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="former">Former</option>
                  </select>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Priority</label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    style={styles.select}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Source</label>
                  <select
                    name="source"
                    value={formData.source}
                    onChange={handleChange}
                    style={styles.select}
                  >
                    <option value="referral">Referral</option>
                    <option value="networking">Networking</option>
                    <option value="marketing">Marketing</option>
                    <option value="cold_outreach">Cold Outreach</option>
                    <option value="existing_client">Existing Client</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Preferred Contact Method</label>
                  <select
                    name="preferredContactMethod"
                    value={formData.preferredContactMethod}
                    onChange={handleChange}
                    style={styles.select}
                  >
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                    <option value="meeting">Meeting</option>
                    <option value="slack">Slack</option>
                  </select>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    <DollarSign size={16} style={styles.labelIcon} />
                    Client Value ($)
                  </label>
                  <input
                    type="number"
                    name="clientValue"
                    value={formData.clientValue}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    style={{
                      ...styles.input,
                      ...(errors.clientValue ? styles.inputError : {})
                    }}
                    placeholder="0.00"
                  />
                  {errors.clientValue && <p style={styles.errorText}>{errors.clientValue}</p>}
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    <Calendar size={16} style={styles.labelIcon} />
                    Next Follow-up Date
                  </label>
                  <input
                    type="date"
                    name="nextFollowUpDate"
                    value={formData.nextFollowUpDate}
                    onChange={handleChange}
                    style={styles.input}
                  />
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div style={styles.section}>
              <div style={styles.sectionHeader}>
                <Link size={20} style={styles.sectionIcon} />
                <h4 style={styles.sectionTitle}>Contact Information</h4>
              </div>
              
              <div style={styles.grid}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    <Link size={16} style={styles.labelIcon} />
                    LinkedIn Profile
                  </label>
                  <input
                    type="url"
                    name="linkedinProfile"
                    value={formData.linkedinProfile}
                    onChange={handleChange}
                    style={styles.input}
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    <Link size={16} style={styles.labelIcon} />
                    Website
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    style={styles.input}
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>

            {/* Address Section */}
            <div style={styles.section}>
              <div style={styles.sectionHeader}>
                <MapPin size={20} style={styles.sectionIcon} />
                <h4 style={styles.sectionTitle}>Address</h4>
              </div>
              
              <div style={styles.grid}>
                <div style={{...styles.inputGroup, gridColumn: 'span 2'}}>
                  <label style={styles.label}>Street Address</label>
                  <input
                    type="text"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleChange}
                    style={styles.input}
                    placeholder="Enter street address"
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>City</label>
                  <input
                    type="text"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleChange}
                    style={styles.input}
                    placeholder="Enter city"
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>State/Province</label>
                  <input
                    type="text"
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleChange}
                    style={styles.input}
                    placeholder="Enter state"
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>ZIP/Postal Code</label>
                  <input
                    type="text"
                    name="address.zipCode"
                    value={formData.address.zipCode}
                    onChange={handleChange}
                    style={styles.input}
                    placeholder="Enter ZIP code"
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Country</label>
                  <input
                    type="text"
                    name="address.country"
                    value={formData.address.country}
                    onChange={handleChange}
                    style={styles.input}
                    placeholder="Enter country"
                  />
                </div>
              </div>
            </div>

            {/* Additional Information Section */}
            <div style={styles.section}>
              <div style={styles.sectionHeader}>
                <Tag size={20} style={styles.sectionIcon} />
                <h4 style={styles.sectionTitle}>Additional Information</h4>
              </div>
              
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  <Tag size={16} style={styles.labelIcon} />
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="e.g., VIP, tech-savvy, frequent-traveler"
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  <FileText size={16} style={styles.labelIcon} />
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="4"
                  style={styles.textarea}
                  placeholder="Any additional notes about this client..."
                />
              </div>
            </div>

            {/* Professional Form Actions */}
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
                    {client ? 'Update Client' : 'Create Client'}
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
    maxWidth: '1000px',
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

  inputError: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2'
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

  errorText: {
    fontSize: '12px',
    color: '#ef4444',
    margin: '4px 0 0 0',
    fontWeight: '500'
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
    minWidth: '140px'
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

// Add CSS animations and hover effects
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

export default ClientForm;