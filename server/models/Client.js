const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  company: {
    type: String,
    required: true,
    trim: true
  },
  position: {
    type: String,
    trim: true
  },
  
  // Engagement Information
  status: {
    type: String,
    enum: ['active', 'inactive', 'prospect', 'former'],
    default: 'prospect'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  
  // Relationship Details
  source: {
    type: String,
    enum: ['referral', 'networking', 'marketing', 'cold_outreach', 'existing_client', 'other'],
    default: 'other'
  },
  assignedTo: {
    type: String,
    required: true // This would be the user's ID in a multi-user system
  },
  
  // Contact Preferences
  preferredContactMethod: {
    type: String,
    enum: ['email', 'phone', 'meeting', 'slack'],
    default: 'email'
  },
  timezone: {
    type: String,
    default: 'UTC'
  },
  
  // Business Information
  industry: {
    type: String,
    trim: true
  },
  clientValue: {
    type: Number,
    default: 0
  },
  
  // Engagement Metrics
  lastContactDate: {
    type: Date
  },
  nextFollowUpDate: {
    type: Date
  },
  engagementScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  
  // Additional Information
  notes: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  
  // Social Media & Links
  linkedinProfile: {
    type: String,
    trim: true
  },
  website: {
    type: String,
    trim: true
  },
  
  // Address Information
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  
  // System Fields
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full address
clientSchema.virtual('fullAddress').get(function() {
  if (!this.address) return '';
  const { street, city, state, zipCode, country } = this.address;
  return [street, city, state, zipCode, country].filter(Boolean).join(', ');
});

// Virtual for days since last contact
clientSchema.virtual('daysSinceLastContact').get(function() {
  if (!this.lastContactDate) return null;
  const now = new Date();
  const diffTime = Math.abs(now - this.lastContactDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for overdue follow-ups
clientSchema.virtual('isOverdue').get(function() {
  if (!this.nextFollowUpDate) return false;
  return new Date() > this.nextFollowUpDate;
});

// Indexes for better query performance
clientSchema.index({ email: 1 });
clientSchema.index({ company: 1 });
clientSchema.index({ assignedTo: 1 });
clientSchema.index({ status: 1 });
clientSchema.index({ nextFollowUpDate: 1 });
clientSchema.index({ engagementScore: -1 });

// Pre-save middleware to update the updatedAt field
clientSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Method to calculate engagement score
clientSchema.methods.calculateEngagementScore = function() {
  let score = 0;
  
  // Base score for active status
  if (this.status === 'active') score += 20;
  else if (this.status === 'prospect') score += 10;
  
  // Score based on recent contact
  if (this.daysSinceLastContact) {
    if (this.daysSinceLastContact <= 7) score += 30;
    else if (this.daysSinceLastContact <= 30) score += 20;
    else if (this.daysSinceLastContact <= 90) score += 10;
  }
  
  // Score based on priority
  if (this.priority === 'critical') score += 25;
  else if (this.priority === 'high') score += 20;
  else if (this.priority === 'medium') score += 10;
  
  // Score based on client value
  if (this.clientValue > 100000) score += 20;
  else if (this.clientValue > 50000) score += 15;
  else if (this.clientValue > 10000) score += 10;
  
  // Cap the score at 100
  this.engagementScore = Math.min(score, 100);
  return this.engagementScore;
};

module.exports = mongoose.model('Client', clientSchema);