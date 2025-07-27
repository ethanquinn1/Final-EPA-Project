import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, Legend,
  PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import GlobalSearch from '../components/GlobalSearch';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [engagementTrends, setEngagementTrends] = useState([]);
  const [interactionStats, setInteractionStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [showSearch, setShowSearch] = useState(false);
  const [recentActivity, setRecentActivity] = useState([]);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  useEffect(() => {
    fetchDashboardData();
  }, [selectedPeriod]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(true);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dashboardRes, trendsRes, statsRes, activityRes] = await Promise.all([
        fetch('/api/analytics/dashboard'),
        fetch(`/api/analytics/engagement-trends?days=${selectedPeriod}`),
        fetch('/api/analytics/interaction-type-summary'),
        fetch('/api/analytics/recent-activity?limit=10')
      ]);

      const [dashboard, trends, stats, activity] = await Promise.all([
        dashboardRes.json(),
        trendsRes.json(),
        statsRes.json(),
        activityRes.json()
      ]);

      setDashboardData(dashboard);
      setEngagementTrends(trends);
      setInteractionStats(stats);
      setRecentActivity(activity);

      console.log('📊 dashboardData:', dashboard);
      console.log('📈 engagementTrends:', trends);
      console.log('📞 interactionStats:', stats);
      console.log('📦 Full dashboardData:', JSON.stringify(dashboard, null, 2));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center text-gray-600 py-10">
        <h2 className="text-xl font-semibold">Dashboard unavailable</h2>
        <p>Data could not be loaded. Please try refreshing or check back later.</p>
      </div>
    );
  }

  const clientStatusData = dashboardData.clients?.byStatus?.map(item => ({
    name: item._id || 'Unknown',
    value: item.count,
    percentage: dashboardData.clients.total
      ? ((item.count / dashboardData.clients.total) * 100).toFixed(1)
      : 0
  })) || [];

  const monthlyTrends = engagementTrends?.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    interactions: item.interactionCount,
    avgEngagement: item.avgEngagementScore,
    newClients: item.newClients || 0
  })) || [];

  const interactionTypeData = interactionStats?.interactionsByType?.map(item => ({
    name: item._id.charAt(0).toUpperCase() + item._id.slice(1),
    value: item.count
  })) || [];

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">Overview of CRM performance</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
          </select>
          <button
            onClick={fetchDashboardData}
            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 shadow rounded border text-center">
          <p className="text-sm text-gray-500">Total Clients</p>
          <p className="text-2xl font-bold">{dashboardData.clients?.total ?? '–'}</p>
        </div>
        <div className="bg-white p-4 shadow rounded border text-center">
          <p className="text-sm text-gray-500">Total Interactions</p>
          <p className="text-2xl font-bold">{dashboardData.interactions?.total ?? '–'}</p>
        </div>
        <div className="bg-white p-4 shadow rounded border text-center">
          <p className="text-sm text-gray-500">Follow-ups Due</p>
          <p className="text-2xl font-bold">{dashboardData.followUps?.due ?? '–'}</p>
        </div>
        <div className="bg-white p-4 shadow rounded border text-center">
          <p className="text-sm text-gray-500">Avg Engagement</p>
          <p className="text-2xl font-bold">
            {dashboardData.engagement?.avgScore !== undefined
              ? dashboardData.engagement.avgScore.toFixed(1)
              : '–'}
          </p>
        </div>
      </div>

      {/* AreaChart: Engagement Trends */}
      <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
        <h3 className="text-lg font-semibold mb-4">Engagement Trends</h3>
        {monthlyTrends.length > 0 ? (
          <div className="h-64 w-full overflow-x-auto">
            <AreaChart width={600} height={250} data={monthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="interactions"
                stroke="#3B82F6"
                fill="#3B82F6"
                fillOpacity={0.4}
                name="Interactions"
              />
              <Area
                type="monotone"
                dataKey="newClients"
                stroke="#10B981"
                fill="#10B981"
                fillOpacity={0.4}
                name="New Clients"
              />
            </AreaChart>
          </div>
        ) : (
          <div className="text-gray-500 text-sm text-center">No trend data available</div>
        )}
      </div>

      {/* BarChart: Interaction Types */}
      <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
        <h3 className="text-lg font-semibold mb-4">Interaction Types</h3>
        {interactionTypeData.length > 0 ? (
          <div className="h-64 w-full overflow-x-auto">
            <BarChart width={600} height={250} data={interactionTypeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#3B82F6" name="Count" />
            </BarChart>
          </div>
        ) : (
          <div className="text-gray-500 text-sm text-center">No interaction type data available</div>
        )}
      </div>

      {/* Global Search Modal */}
      {showSearch && (
        <GlobalSearch onClose={() => setShowSearch(false)} />
      )}
    </div>
  );
};

export default Dashboard;
