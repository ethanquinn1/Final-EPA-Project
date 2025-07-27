import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, BarChart, Bar, AreaChart, Area
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
        fetch('/api/analytics/interaction-stats?period=month'),
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

      {/* Global Search Modal */}
      {showSearch && (
        <GlobalSearch onClose={() => setShowSearch(false)} />
      )}

      {/* Additional Sections Placeholder */}
      <div className="text-sm text-gray-400 text-center mt-10">
        📊 Chart and graph sections can go here (e.g., Trends, Status Breakdown, etc.)
      </div>
    </div>
  );
};

export default Dashboard;
