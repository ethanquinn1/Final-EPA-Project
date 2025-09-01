const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  company: {
    type: String,
    trim: true,
    maxlength: 100
  },
  position: {
    type: String,
    trim: true,
    maxlength: 100
  },
  industry: {
    type: String,
    trim: true,
    maxlength: 50
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'prospect', 'archived'],
    default: 'prospect'
  },
  source: {
    type: String,
    enum: ['website', 'referral', 'social-media', 'cold-outreach', 'event', 'advertisement', 'other'],
    default: 'other'
  },
  notes: {
    type: String,
    maxlength: 1000
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 30
  }],
  engagementScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  lastContactDate: {
    type: Date,
    default: Date.now
  },
  nextFollowUpDate: {
    type: Date
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  address: {
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    zipCode: { type: String, trim: true },
    country: { type: String, trim: true, default: 'US' }
  },
  socialMedia: {
    linkedin: { type: String, trim: true },
    twitter: { type: String, trim: true },
    facebook: { type: String, trim: true }
  },
  customFields: {
    type: Map,
    of: String
  }
}, {
  timestamps: true
});

// Indexes for better performance
clientSchema.index({ email: 1 }, { unique: true });
clientSchema.index({ company: 1 });
clientSchema.index({ status: 1 });
clientSchema.index({ engagementScore: -1 });
clientSchema.index({ lastContactDate: -1 });
clientSchema.index({ nextFollowUpDate: 1 });
clientSchema.index({ name: 'text', company: 'text', notes: 'text' });

// Virtual for full name display
clientSchema.virtual('displayName').get(function() {
  return this.company ? `${this.name} (${this.company})` : this.name;
});

// Method to calculate and update engagement score based on interactions
clientSchema.methods.updateEngagementScore = async function() {
  try {
    const Interaction = mongoose.model('Interaction');
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    const ninetyDaysAgo = new Date(now.getTime() - (90 * 24 * 60 * 60 * 1000));

    // Get interactions for score calculation
    const recentInteractions = await Interaction.find({
      clientId: this._id,
      date: { $gte: ninetyDaysAgo }
    }).sort({ date: -1 });

    let score = 0;

    // Base score from client status
    const statusScores = {
      'active': 20,
      'prospect': 10,
      'inactive': 5,
      'archived': 0
    };
    score += statusScores[this.status] || 0;

    // Interaction frequency score (max 30 points)
    const interactionsLast30Days = recentInteractions.filter(i => i.date >= thirtyDaysAgo).length;
    const interactionsLast90Days = recentInteractions.length;
    
    if (interactionsLast30Days >= 5) score += 30;
    else if (interactionsLast30Days >= 3) score += 20;
    else if (interactionsLast30Days >= 1) score += 10;
    else if (interactionsLast90Days >= 2) score += 5;

    // Interaction quality score (max 25 points)
    const positiveInteractions = recentInteractions.filter(i => i.outcome === 'positive').length;
    const totalInteractions = recentInteractions.length;
    
    if (totalInteractions > 0) {
      const positiveRatio = positiveInteractions / totalInteractions;
      score += Math.round(positiveRatio * 25);
    }

    // Interaction variety score (max 10 points)
    const interactionTypes = [...new Set(recentInteractions.map(i => i.type))];
    score += Math.min(interactionTypes.length * 3, 10);

    // Recency score (max 10 points)
    if (recentInteractions.length > 0) {
      const daysSinceLastContact = Math.floor((now - recentInteractions[0].date) / (1000 * 60 * 60 * 24));
      if (daysSinceLastContact <= 1) score += 10;
      else if (daysSinceLastContact <= 7) score += 7;
      else if (daysSinceLastContact <= 14) score += 5;
      else if (daysSinceLastContact <= 30) score += 3;
    }

    // Follow-up responsiveness (max 5 points)
    const overdueFollowUps = await Interaction.countDocuments({
      clientId: this._id,
      followUpRequired: true,
      followUpDate: { $lt: now }
    });
    
    if (overdueFollowUps === 0) score += 5;
    else if (overdueFollowUps <= 2) score += 2;

    // Caps score at 100
    this.engagementScore = Math.min(Math.round(score), 100);
    
    // Update last contact date if we have interactions
    if (recentInteractions.length > 0) {
      this.lastContactDate = recentInteractions[0].date;
    }

    await this.save();
    return this.engagementScore;
  } catch (error) {
    console.error('Error updating engagement score:', error);
    return this.engagementScore;
  }
};

// Static method to recalculate all engagement scores
clientSchema.statics.recalculateAllEngagementScores = async function() {
  try {
    const clients = await this.find({});
    const results = await Promise.allSettled(
      clients.map(client => client.updateEngagementScore())
    );
    
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    
    console.log(`Engagement scores updated: ${successful} successful, ${failed} failed`);
    return { successful, failed };
  } catch (error) {
    console.error('Error recalculating engagement scores:', error);
    throw error;
  }
};

// Pre-save middleware
clientSchema.pre('save', function(next) {
  // Update timestamps
  if (this.isModified() && !this.isNew) {
    this.updatedAt = new Date();
  }
  
  // Clean up tags
  if (this.tags) {
    this.tags = this.tags.filter(tag => tag && tag.trim().length > 0)
                         .map(tag => tag.trim().toLowerCase());
  }
  
  next();
});

// Post-save middleware to update engagement score
clientSchema.post('save', function() {
  // Don't update engagement score if it's a new client (will be 0 anyway)
  if (!this.isNew) {
    // Use setTimeout to avoid blocking the save operation
    setTimeout(() => {
      this.updateEngagementScore().catch(err => 
        console.error('Failed to update engagement score:', err)
      );
    }, 100);
  }
});

module.exports = mongoose.model('Client', clientSchema);