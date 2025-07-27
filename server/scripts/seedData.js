const mongoose = require('mongoose');
const Client = require('../models/Client');
const Interaction = require('../models/Interaction');
require('dotenv').config();

const sampleClients = [
  {
    name: 'Acme Corporation',
    email: 'contact@acme.com',
    phone: '15550101',
    company: 'Acme Corporation',
    status: 'active',
    engagementScore: 85,
    tags: ['enterprise', 'technology'],
    notes: 'Key enterprise client with high growth potential'
  },
  {
    name: 'Tech Solutions Ltd',
    email: 'info@techsolutions.com',
    phone: '15550102',
    company: 'Tech Solutions Ltd',
    status: 'prospect',
    engagementScore: 62,
    tags: ['prospect', 'software'],
    notes: 'Interested in our premium package'
  },
  {
    name: 'Global Manufacturing Inc',
    email: 'partnerships@globalmanuf.com',
    phone: '15550103',
    company: 'Global Manufacturing Inc',
    status: 'active',
    engagementScore: 78,
    tags: ['manufacturing', 'B2B'],
    notes: 'Long-term partnership potential'
  },
  {
    name: 'StartupX',
    email: 'founder@startupx.io',
    phone: '15550104',
    company: 'StartupX',
    status: 'prospect',
    engagementScore: 45,
    tags: ['startup', 'early-stage'],
    notes: 'Emerging company, price-sensitive'
  },
  {
    name: 'Enterprise Dynamics',
    email: 'procurement@entdynamics.com',
    phone: '15550105',
    company: 'Enterprise Dynamics',
    status: 'inactive',
    engagementScore: 23,
    tags: ['enterprise', 'dormant'],
    notes: 'Contract ended, potential for renewal'
  },
  {
    name: 'Innovation Labs',
    email: 'hello@innovationlabs.com',
    phone: '15550106',
    company: 'Innovation Labs',
    status: 'active',
    engagementScore: 92,
    tags: ['technology', 'R&D'],
    notes: 'Highly engaged client with multiple projects'
  },
  {
    name: 'Retail Chain Plus',
    email: 'purchasing@retailchain.com',
    phone: '15550107',
    company: 'Retail Chain Plus',
    status: 'prospect',
    engagementScore: 58,
    tags: ['retail', 'expansion'],
    notes: 'Considering enterprise-wide implementation'
  },
  {
    name: 'Medical Solutions Inc',
    email: 'admin@medsolutions.com',
    phone: '15550108',
    company: 'Medical Solutions Inc',
    status: 'active',
    engagementScore: 71,
    tags: ['healthcare', 'compliance'],
    notes: 'Requires high security and compliance features'
  }
];

const generateSampleInteractions = (clients) => {
  const interactionTypes = ['email', 'meeting', 'call', 'note'];
  const outcomes = ['positive', 'neutral', 'negative', 'follow-up-needed', ''];
  const priorities = ['low', 'medium', 'high'];
  const subjects = [
    'Q1 Strategy Discussion',
    'Product Demo Follow-up',
    'Contract Negotiation',
    'Technical Requirements Review',
    'Renewal Discussion',
    'Support Request',
    'Partnership Opportunity',
    'Price Quote Request',
    'Implementation Planning',
    'Security Assessment',
    'Training Session',
    'Performance Review',
    'Feature Request Discussion',
    'Budget Planning Meeting',
    'Compliance Review',
    'Integration Planning'
  ];

  const interactionContents = [
    'Discussed current challenges and potential solutions',
    'Reviewed technical specifications and requirements',
    'Presented new features and capabilities',
    'Addressed concerns about implementation timeline',
    'Provided cost analysis and ROI projections',
    'Scheduled follow-up demonstration',
    'Resolved technical support issues',
    'Outlined next steps in the process'
  ];

  return clients.flatMap(client => {
    const numInteractions = Math.floor(Math.random() * 8) + 3;
    return Array.from({ length: numInteractions }, () => {
      const hasFollowUp = Math.random() > 0.7;
      const isOverdue = Math.random() > 0.8;

      return {
        clientId: client._id,
        type: interactionTypes[Math.floor(Math.random() * interactionTypes.length)],
        subject: subjects[Math.floor(Math.random() * subjects.length)],
        content: interactionContents[Math.floor(Math.random() * interactionContents.length)],
        date: new Date(Date.now() - Math.random() * 120 * 24 * 60 * 60 * 1000),
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        outcome: outcomes[Math.floor(Math.random() * outcomes.length)],
        followUpRequired: hasFollowUp,
        followUpDate: hasFollowUp
          ? new Date(
              Date.now() +
                (isOverdue ? -Math.random() * 7 : Math.random() * 30) *
                  24 *
                  60 *
                  60 *
                  1000
            )
          : undefined,
        followUpNotes: hasFollowUp
          ? [
              'Follow up on pricing discussion',
              'Schedule technical demo',
              'Provide additional documentation',
              'Review contract terms'
            ][Math.floor(Math.random() * 4)]
          : undefined,
        tags: ['sample-data']
      };
    });
  });
};

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing sample data
    console.log('Clearing existing sample data...');
    await Client.deleteMany({ tags: 'sample-data' });
    await Interaction.deleteMany({ tags: 'sample-data' });

    // Create clients
    console.log('Creating sample clients...');
    const createdClients = await Client.insertMany(
      sampleClients.map(client => ({
        ...client,
        tags: [...client.tags, 'sample-data']
      }))
    );

    console.log(`✅ Created ${createdClients.length} sample clients`);

    // Create interactions
    console.log('Creating sample interactions...');
    const interactions = generateSampleInteractions(createdClients);
    await Interaction.insertMany(interactions);
    console.log(`✅ Created ${interactions.length} sample interactions`);

    // Update engagement scores
    console.log('Updating engagement scores...');
    const priorityMap = { low: 1, medium: 2, high: 3 };

    for (const client of createdClients) {
      const clientInteractions = interactions.filter(i => i.clientId.toString() === client._id.toString());

      if (clientInteractions.length > 0) {
        const avgPriority =
          clientInteractions.reduce((sum, i) => sum + (priorityMap[i.priority] || 2), 0) /
          clientInteractions.length;

        const recentInteractions = clientInteractions.filter(
          i => new Date(i.date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        ).length;

        const engagementScore = Math.min(
          100,
          Math.round(avgPriority * 10 + recentInteractions * 5 + clientInteractions.length * 2)
        );

        await Client.findByIdAndUpdate(client._id, { engagementScore });
      } else {
        await Client.findByIdAndUpdate(client._id, { engagementScore: 0 });
      }
    }

    console.log('🎉 Sample data seeded successfully!');
    console.log('📊 Dashboard should now show populated charts and metrics');
    console.log('🚀 Ready to test the system with real data');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
