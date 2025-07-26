const mongoose = require('mongoose');

const interactionSchema = new mongoose.Schema({
  clientId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Client', 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['email', 'meeting', 'call', 'note'], 
    required: true 
  },
  subject: { 
    type: String, 
    required: true,
    trim: true
  },
  content: { 
    type: String,
    default: ''
  },
  date: { 
    type: Date, 
    default: Date.now 
  },
  duration: { 
    type: Number, // in minutes
    min: 0
  },
  outcome: { 
    type: String,
    enum: ['positive', 'neutral', 'negative', 'follow-up-needed', ''],
    default: ''
  },
  followUpRequired: { 
    type: Boolean, 
    default: false 
  },
  followUpDate: { 
    type: Date 
  },
  attachments: [{
    name: { type: String, required: true },
    url: { type: String, required: true },
    size: { type: Number },
    uploadDate: { type: Date, default: Date.now }
  }],
  tags: [{ 
    type: String, 
    trim: true 
  }],
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

// Index for better query performance
interactionSchema.index({ clientId: 1, date: -1 });
interactionSchema.index({ type: 1 });
interactionSchema.index({ followUpRequired: 1, followUpDate: 1 });

// Update engagement score in client when interaction is created/updated
interactionSchema.post('save', async function() {
  const Client = mongoose.model('Client');
  try {
    const client = await Client.findById(this.clientId);
    if (client) {
      await client.updateEngagementScore();
    }
  } catch (error) {
    console.error('Error updating client engagement score:', error);
  }
});

module.exports = mongoose.model('Interaction', interactionSchema);