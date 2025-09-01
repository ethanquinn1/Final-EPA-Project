import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  Users, MessageSquare, Calendar, TrendingUp, Search, Plus, 
  Clock, ArrowUpRight, ArrowDownRight, Activity, Star,
  RefreshCw, ChevronRight, Phone, Mail, Video, Coffee,
  AlertCircle, CheckCircle, UserCheck
} from 'lucide-react';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('30');
  const [refreshing, setRefreshing] = useState(false);

  // Sample data for when API is not available
  const sampleData = {
    overview: {
      totalClients: 284,
      newClients: 23,
      totalInteractions: 1247,
      followUpsDue: 18,
      overdueFollowUps: 3,
      clientGrowthRate: 12.5,
      interactionGrowthRate: 8.3
    },
    charts: {
      clientsOverTime: [
        { _id: 'Jan', count: 45 },
        { _id: 'Feb', count: 52 },
        { _id: 'Mar', count: 48 },
        { _id: 'Apr', count: 61 },
        { _id: 'May', count: 58 },
        { _id: 'Jun', count: 67 },
        { _id: 'Jul', count: 72 }
      ],
      interactionsByType: [
        { type: 'Email', count: 342, success: 89 },
        { type: 'Call', count: 198, success: 76 },
        { type: 'Meeting', count: 156, success: 94 },
        { type: 'Follow-up', count: 89, success: 67 }
      ],
      upcomingFollowUps: [
        { 
          client: 'Acme Corporation', 
          type: 'Call', 
          dueDate: 'Today', 
          priority: 'High',
          notes: 'Discuss Q4 contract renewal',
          overdue: false
        },
        { 
          client: 'TechStart Inc', 
          type: 'Email', 
          dueDate: 'Tomorrow', 
          priority: 'Medium',
          notes: 'Send updated proposal',
          overdue: false
        },
        { 
          client: 'Global Systems', 
          type: 'Meeting', 
          dueDate: 'Oct 15', 
          priority: 'High',
          notes: 'Product demonstration',
          overdue: false
        },
        { 
          client: 'Innovation Co', 
          type: 'Call', 
          dueDate: 'Yesterday', 
          priority: 'Urgent',
          notes: 'Address technical concerns',
          overdue: true
        },
        { 
          client: 'Future Tech Ltd', 
          type: 'Email', 
          dueDate: 'Oct 18', 
          priority: 'Low',
          notes: 'Quarterly check-in',
          overdue: false
        }
      ],
      pastInteractions: [
        {
          client: 'Acme Corporation',
          type: 'Meeting',
          date: 'Oct 10, 2024',
          outcome: 'Successful',
          notes: 'Signed annual contract worth £125,000',
          value: '£125,000'
        },
        {
          client: 'TechStart Inc',
          type: 'Call',
          date: 'Oct 9, 2024',
          outcome: 'Follow-up Required',
          notes: 'Interested in premium package',
          value: '£89,000'
        },
        {
          client: 'Global Systems',
          type: 'Email',
          date: 'Oct 8, 2024',
          outcome: 'Successful',
          notes: 'Confirmed project timeline',
          value: '£67,000'
        },
        {
          client: 'Innovation Co',
          type: 'Meeting',
          date: 'Oct 7, 2024',
          outcome: 'No Response',
          notes: 'Awaiting decision on proposal',
          value: '£54,000'
        },
        {
          client: 'Future Tech Ltd',
          type: 'Call',
          date: 'Oct 6, 2024',
          outcome: 'Successful',
          notes: 'Discussed integration requirements',
          value: '£43,000'
        }
      ]
    },
    topClients: [
      { name: 'Acme Corp', interactions: 45, value: '£125,000' },
      { name: 'TechStart Inc', interactions: 32, value: '£89,000' },
      { name: 'Global Systems', interactions: 28, value: '£67,000' }
    ],
    recentActivities: [
      { type: 'call', client: 'John Doe', time: '2 hours ago' },
      { type: 'email', client: 'Jane Smith', time: '4 hours ago' },
      { type: 'meeting', client: 'Bob Johnson', time: '1 day ago' }
    ]
  };

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/analytics/dashboard?timeframe=${timeframe}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setDashboardData(data.data);
      } else {
        // Use sample data when API is not available
        setDashboardData(sampleData);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Use sample data when API fails
      setDashboardData(sampleData);
    } finally {
      setLoading(false);
    }
  }, [timeframe]);

  const fetchRecentActivity = useCallback(async () => {
    try {
      const response = await fetch('/api/analytics/recent-activity', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) {
        console.log('Recent activity fetched');
      }
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    fetchRecentActivity();
  }, [fetchDashboardData, fetchRecentActivity]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchDashboardData(), fetchRecentActivity()]);
    setRefreshing(false);
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '12px 16px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          fontSize: '14px'
        }}>
          <p style={{ margin: 0, fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>
            {label}
          </p>
          {payload.map((entry, index) => (
            <p key={index} style={{ 
              margin: '4px 0', 
              color: entry.color,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                backgroundColor: entry.color,
                borderRadius: '50%'
              }}></span>
              {entry.name}: {typeof entry.value === 'number' && entry.name.toLowerCase().includes('revenue') 
                ? formatCurrency(entry.value) 
                : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '64px',
            height: '64px',
            border: '4px solid #e3f2fd',
            borderTop: '4px solid #2196f3',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 24px'
          }}></div>
          <p style={{ 
            fontSize: '18px', 
            fontWeight: '500', 
            color: '#475569',
            margin: '0 0 8px' 
          }}>
            Loading your dashboard...
          </p>
          <p style={{ 
            fontSize: '14px', 
            color: '#94a3b8',
            margin: '0' 
          }}>
            Fetching the latest data
          </p>
        </div>
      </div>
    );
  }

  const { overview = {}, charts = {}, topClients = [], recentActivities = [] } = dashboardData || {};
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316', '#84CC16'];

  const formatGrowthRate = (rate) => {
    const numRate = parseFloat(rate) || 0;
    return numRate >= 0 ? `+${numRate.toFixed(1)}%` : `${numRate.toFixed(1)}%`;
  };

  const MetricCard = ({ title, value, change, changeType, icon: Icon, color, trend }) => (
    <div style={{
      position: 'relative',
      background: 'white',
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: '1px solid #e2e8f0',
      transition: 'all 0.3s ease',
      cursor: 'pointer'
    }}
    onMouseEnter={(e) => {
      e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
      e.target.style.borderColor = '#cbd5e1';
    }}
    onMouseLeave={(e) => {
      e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
      e.target.style.borderColor = '#e2e8f0';
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ flex: 1 }}>
          <p style={{ 
            fontSize: '14px', 
            fontWeight: '500', 
            color: '#64748b',
            margin: '0 0 4px' 
          }}>
            {title}
          </p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <p style={{ 
              fontSize: '32px', 
              fontWeight: 'bold', 
              color: '#1e293b',
              margin: '0' 
            }}>
              {value}
            </p>
            {change && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                borderRadius: '9999px',
                fontSize: '12px',
                fontWeight: '600',
                backgroundColor: changeType === 'positive' ? '#ecfdf5' : changeType === 'negative' ? '#fef2f2' : '#f8fafc',
                color: changeType === 'positive' ? '#065f46' : changeType === 'negative' ? '#991b1b' : '#475569'
              }}>
                {changeType === 'positive' ? (
                  <ArrowUpRight style={{ width: '12px', height: '12px' }} />
                ) : changeType === 'negative' ? (
                  <ArrowDownRight style={{ width: '12px', height: '12px' }} />
                ) : null}
                {change}
              </div>
            )}
          </div>
          {trend && (
            <p style={{ 
              fontSize: '12px', 
              color: '#64748b',
              margin: '8px 0 0' 
            }}>
              {trend}
            </p>
          )}
        </div>
        <div style={{
          padding: '12px',
          borderRadius: '12px',
          backgroundColor: color
        }}>
          <Icon style={{ width: '24px', height: '24px', color: 'white' }} />
        </div>
      </div>
    </div>
  );

  return (
    <>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}
      </style>
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 100%)'
      }}>
        {/* Header */}
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.8)',
          backdropFilter: 'blur(8px)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          borderBottom: '1px solid #e2e8f0',
          position: 'sticky',
          top: 0,
          zIndex: 40
        }}>
          <div style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '0 16px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '24px 0'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <h1 style={{
                    fontSize: '32px',
                    fontWeight: 'bold',
                    background: 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    margin: '0'
                  }}>
                    Dashboard
                  </h1>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      backgroundColor: '#4ade80',
                      borderRadius: '50%',
                      animation: 'pulse 2s infinite'
                    }}></div>
                    <span style={{ fontSize: '14px', color: '#64748b' }}>Live</span>
                  </div>
                </div>
                <p style={{
                  margin: '4px 0 0',
                  fontSize: '14px',
                  color: '#64748b'
                }}>
                  Welcome back! Here's your CRM performance overview
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {/* Time Period Selector */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                  {['7', '30', '90'].map((period) => (
                    <button
                      key={period}
                      onClick={() => setTimeframe(period)}
                      style={{
                        padding: '8px 16px',
                        fontSize: '14px',
                        fontWeight: '500',
                        borderRadius: '12px',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        backgroundColor: timeframe === period ? '#2563eb' : 'transparent',
                        color: timeframe === period ? 'white' : '#64748b'
                      }}
                    >
                      {period}d
                    </button>
                  ))}
                </div>

                {/* Action Buttons */}
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  style={{
                    padding: '10px',
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    color: '#64748b',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    opacity: refreshing ? 0.5 : 1
                  }}
                >
                  <RefreshCw style={{ 
                    width: '16px', 
                    height: '16px',
                    animation: refreshing ? 'spin 1s linear infinite' : 'none'
                  }} />
                </button>

                <button style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  backgroundColor: '#1e293b',
                  color: 'white',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  fontWeight: '500'
                }}>
                  <Search style={{ width: '16px', height: '16px' }} />
                  <span>Search</span>
                  <kbd style={{
                    padding: '2px 6px',
                    fontSize: '12px',
                    backgroundColor: '#475569',
                    borderRadius: '4px',
                    border: '1px solid #64748b'
                  }}>⌘K</kbd>
                </button>

                <Link
                  to="/clients/new"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 16px',
                    backgroundColor: '#2563eb',
                    color: 'white',
                    borderRadius: '12px',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    fontWeight: '500'
                  }}
                >
                  <Plus style={{ width: '16px', height: '16px' }} />
                  <span>Add Client</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '32px 16px'
        }}>
          {/* Enhanced Metrics Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '24px',
            marginBottom: '32px'
          }}>
            <MetricCard
              title="Total Clients"
              value={overview.totalClients || 0}
              change={formatGrowthRate(overview.clientGrowthRate)}
              changeType={overview.clientGrowthRate >= 0 ? 'positive' : 'negative'}
              icon={Users}
              color="#2563eb"
              trend="Active relationships"
            />
            <MetricCard
              title="New This Period"
              value={overview.newClients || 0}
              change={`${timeframe} days`}
              icon={TrendingUp}
              color="#059669"
              trend="Acquisition rate"
            />
            <MetricCard
              title="Interactions"
              value={overview.totalInteractions || 0}
              change={formatGrowthRate(overview.interactionGrowthRate)}
              changeType={overview.interactionGrowthRate >= 0 ? 'positive' : 'negative'}
              icon={MessageSquare}
              color="#7c3aed"
              trend="Engagement level"
            />
            <MetricCard
              title="Follow-ups Due"
              value={overview.followUpsDue || 0}
              change={`${overview.overdueFollowUps || 0} overdue`}
              changeType={overview.overdueFollowUps > 0 ? 'negative' : 'positive'}
              icon={Clock}
              color="#d97706"
              trend="Action required"
            />
          </div>

          {/* Complete Analytics Charts Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
            gap: '32px',
            marginBottom: '32px'
          }}>
            {/* Engagement Trends Chart */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '24px'
              }}>
                <div>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#1e293b',
                    margin: '0 0 4px'
                  }}>
                    Engagement Trends
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    color: '#64748b',
                    margin: '0'
                  }}>
                    Client interactions over time
                  </p>
                </div>
                <div style={{
                  backgroundColor: '#059669',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  Live
                </div>
              </div>
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={charts.clientsOverTime || []}>
                    <defs>
                      <linearGradient id="colorInteractions" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="_id" tick={{ fontSize: 12 }} stroke="#64748b" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#64748b" />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      fill="url(#colorInteractions)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Interaction Types Chart */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '24px'
              }}>
                <div>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#1e293b',
                    margin: '0 0 4px'
                  }}>
                    Interaction Types
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    color: '#64748b',
                    margin: '0'
                  }}>
                    Communication breakdown
                  </p>
                </div>
              </div>
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts.interactionsByType || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="type" tick={{ fontSize: 12 }} stroke="#64748b" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#64748b" />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="success" fill="#059669" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Upcoming Follow-ups Table */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '24px'
              }}>
                <div>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#1e293b',
                    margin: '0 0 4px'
                  }}>
                    Upcoming Follow-ups
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    color: '#64748b',
                    margin: '0'
                  }}>
                    Scheduled tasks and priorities
                  </p>
                </div>
                <Link
                  to="/follow-ups"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: '#2563eb',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  View all
                  <ChevronRight style={{ width: '16px', height: '16px' }} />
                </Link>
              </div>
              <div style={{ 
                maxHeight: '300px', 
                overflowY: 'auto',
                border: '1px solid #f1f5f9',
                borderRadius: '8px'
              }}>
                {(charts.upcomingFollowUps || []).map((followUp, index) => {
                  const getPriorityColor = (priority) => {
                    switch (priority) {
                      case 'Urgent': return '#dc2626';
                      case 'High': return '#d97706';
                      case 'Medium': return '#2563eb';
                      case 'Low': return '#059669';
                      default: return '#64748b';
                    }
                  };

                  const getTypeIcon = (type) => {
                    switch (type) {
                      case 'Call': return Phone;
                      case 'Email': return Mail;
                      case 'Meeting': return Video;
                      default: return Clock;
                    }
                  };

                  const TypeIcon = getTypeIcon(followUp.type);
                  
                  return (
                    <div key={index} style={{
                      padding: '16px',
                      borderBottom: index < charts.upcomingFollowUps.length - 1 ? '1px solid #f1f5f9' : 'none',
                      backgroundColor: followUp.overdue ? '#fef2f2' : 'white',
                      transition: 'background-color 0.2s ease'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: '12px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1 }}>
                          <div style={{
                            width: '32px',
                            height: '32px',
                            backgroundColor: followUp.overdue ? '#fee2e2' : '#f1f5f9',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <TypeIcon style={{ 
                              width: '16px', 
                              height: '16px', 
                              color: followUp.overdue ? '#dc2626' : '#64748b' 
                            }} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                              <p style={{
                                margin: '0',
                                fontWeight: '600',
                                color: '#1e293b',
                                fontSize: '14px'
                              }}>
                                {followUp.client}
                              </p>
                              <span style={{
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontSize: '10px',
                                fontWeight: '600',
                                backgroundColor: `${getPriorityColor(followUp.priority)}20`,
                                color: getPriorityColor(followUp.priority)
                              }}>
                                {followUp.priority}
                              </span>
                            </div>
                            <p style={{
                              margin: '0 0 4px',
                              fontSize: '12px',
                              color: '#64748b'
                            }}>
                              {followUp.notes}
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{
                                fontSize: '12px',
                                fontWeight: '500',
                                color: followUp.overdue ? '#dc2626' : '#059669'
                              }}>
                                {followUp.type} • {followUp.dueDate}
                              </span>
                              {followUp.overdue && (
                                <AlertCircle style={{ width: '12px', height: '12px', color: '#dc2626' }} />
                              )}
                            </div>
                          </div>
                        </div>
                        <button style={{
                          padding: '6px 12px',
                          backgroundColor: followUp.overdue ? '#dc2626' : '#2563eb',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '500',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}>
                          {followUp.overdue ? 'Urgent' : 'Action'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Past Interactions Table */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '24px'
              }}>
                <div>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#1e293b',
                    margin: '0 0 4px'
                  }}>
                    Past Interactions
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    color: '#64748b',
                    margin: '0'
                  }}>
                    Recent client engagements
                  </p>
                </div>
                <Link
                  to="/interactions"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: '#2563eb',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  View all
                  <ChevronRight style={{ width: '16px', height: '16px' }} />
                </Link>
              </div>
              <div style={{ 
                maxHeight: '300px', 
                overflowY: 'auto',
                border: '1px solid #f1f5f9',
                borderRadius: '8px'
              }}>
                {(charts.pastInteractions || []).map((interaction, index) => {
                  const getOutcomeColor = (outcome) => {
                    switch (outcome) {
                      case 'Successful': return '#059669';
                      case 'Follow-up Required': return '#d97706';
                      case 'No Response': return '#94a3b8';
                      case 'Declined': return '#dc2626';
                      default: return '#64748b';
                    }
                  };

                  const getOutcomeIcon = (outcome) => {
                    switch (outcome) {
                      case 'Successful': return CheckCircle;
                      case 'Follow-up Required': return Clock;
                      case 'No Response': return AlertCircle;
                      case 'Declined': return ArrowDownRight;
                      default: return Activity;
                    }
                  };

                  const getTypeIcon = (type) => {
                    switch (type) {
                      case 'Call': return Phone;
                      case 'Email': return Mail;
                      case 'Meeting': return Video;
                      default: return MessageSquare;
                    }
                  };

                  const TypeIcon = getTypeIcon(interaction.type);
                  const OutcomeIcon = getOutcomeIcon(interaction.outcome);
                  
                  return (
                    <div key={index} style={{
                      padding: '16px',
                      borderBottom: index < charts.pastInteractions.length - 1 ? '1px solid #f1f5f9' : 'none',
                      transition: 'background-color 0.2s ease'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: '12px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1 }}>
                          <div style={{
                            width: '32px',
                            height: '32px',
                            backgroundColor: '#f1f5f9',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <TypeIcon style={{ 
                              width: '16px', 
                              height: '16px', 
                              color: '#64748b' 
                            }} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                              <p style={{
                                margin: '0',
                                fontWeight: '600',
                                color: '#1e293b',
                                fontSize: '14px'
                              }}>
                                {interaction.client}
                              </p>
                              <span style={{
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontSize: '10px',
                                fontWeight: '600',
                                backgroundColor: `${getOutcomeColor(interaction.outcome)}20`,
                                color: getOutcomeColor(interaction.outcome),
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}>
                                <OutcomeIcon style={{ width: '10px', height: '10px' }} />
                                {interaction.outcome}
                              </span>
                            </div>
                            <p style={{
                              margin: '0 0 4px',
                              fontSize: '12px',
                              color: '#64748b'
                            }}>
                              {interaction.notes}
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{
                                fontSize: '12px',
                                fontWeight: '500',
                                color: '#64748b'
                              }}>
                                {interaction.type} • {interaction.date}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{
                            margin: '0',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#1e293b'
                          }}>
                            {interaction.value}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e2e8f0'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1e293b',
              margin: '0 0 24px'
            }}>
              Quick Actions
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px'
            }}>
              <Link
                to="/clients/new"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '24px',
                  background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #bfdbfe 0%, #93c5fd 100%)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)';
                }}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: '#2563eb',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '12px',
                  transition: 'transform 0.2s ease'
                }}>
                  <Plus style={{ width: '24px', height: '24px', color: 'white' }} />
                </div>
                <span style={{ fontWeight: '500', color: '#1e3a8a' }}>Add Client</span>
                <span style={{ fontSize: '12px', color: '#3730a3', marginTop: '4px' }}>Create new relationship</span>
              </Link>
              
              <Link
                to="/interactions/new"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '24px',
                  background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #a7f3d0 0%, #6ee7b7 100%)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)';
                }}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: '#059669',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '12px'
                }}>
                  <MessageSquare style={{ width: '24px', height: '24px', color: 'white' }} />
                </div>
                <span style={{ fontWeight: '500', color: '#064e3b' }}>Log Interaction</span>
                <span style={{ fontSize: '12px', color: '#065f46', marginTop: '4px' }}>Record activity</span>
              </Link>
              
              <Link
                to="/follow-ups"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '24px',
                  background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #fde68a 0%, #fcd34d 100%)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)';
                }}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: '#d97706',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '12px'
                }}>
                  <Clock style={{ width: '24px', height: '24px', color: 'white' }} />
                </div>
                <span style={{ fontWeight: '500', color: '#92400e' }}>Follow-ups</span>
                <span style={{ fontSize: '12px', color: '#a16207', marginTop: '4px' }}>Manage tasks</span>
              </Link>
              
              <button style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '24px',
                background: 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'linear-gradient(135deg, #ddd6fe 0%, #c4b5fd 100%)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)';
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: '#7c3aed',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '12px'
                }}>
                  <Search style={{ width: '24px', height: '24px', color: 'white' }} />
                </div>
                <span style={{ fontWeight: '500', color: '#581c87' }}>Search</span>
                <span style={{ fontSize: '12px', color: '#6b21a8', marginTop: '4px' }}>Find anything</span>
              </button>
            </div>
          </div>

          {/* Recent Activity & Top Clients */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '32px',
            marginTop: '32px'
          }}>
            {/* Recent Activity */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '20px'
              }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1e293b',
                  margin: '0'
                }}>
                  Recent Activity
                </h3>
                <Link
                  to="/interactions"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: '#2563eb',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  View all
                  <ChevronRight style={{ width: '16px', height: '16px' }} />
                </Link>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {(recentActivities.length > 0 ? recentActivities : [
                  { type: 'call', client: 'John Doe', time: '2 hours ago', action: 'Had a follow-up call' },
                  { type: 'email', client: 'Jane Smith', time: '4 hours ago', action: 'Sent proposal email' },
                  { type: 'meeting', client: 'Bob Johnson', time: '1 day ago', action: 'Client meeting completed' },
                  { type: 'follow-up', client: 'Alice Brown', time: '2 days ago', action: 'Scheduled follow-up' }
                ]).slice(0, 4).map((activity, index) => {
                  const getActivityIcon = (type) => {
                    switch (type) {
                      case 'call': return Phone;
                      case 'email': return Mail;
                      case 'meeting': return Video;
                      case 'follow-up': return Clock;
                      default: return Activity;
                    }
                  };
                  
                  const getActivityColor = (type) => {
                    switch (type) {
                      case 'call': return '#2563eb';
                      case 'email': return '#059669';
                      case 'meeting': return '#7c3aed';
                      case 'follow-up': return '#d97706';
                      default: return '#64748b';
                    }
                  };

                  const Icon = getActivityIcon(activity.type);
                  
                  return (
                    <div key={index} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 0',
                      borderBottom: index < 3 ? '1px solid #f1f5f9' : 'none'
                    }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        backgroundColor: `${getActivityColor(activity.type)}20`,
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Icon style={{ width: '20px', height: '20px', color: getActivityColor(activity.type) }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{
                          margin: '0 0 2px',
                          fontWeight: '500',
                          color: '#1e293b',
                          fontSize: '14px'
                        }}>
                          {activity.action || `${activity.type} with ${activity.client}`}
                        </p>
                        <p style={{
                          margin: '0',
                          fontSize: '12px',
                          color: '#64748b'
                        }}>
                          {activity.client} • {activity.time}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Clients */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '20px'
              }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1e293b',
                  margin: '0'
                }}>
                  Top Clients
                </h3>
                <Link
                  to="/clients"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: '#2563eb',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  View all
                  <ChevronRight style={{ width: '16px', height: '16px' }} />
                </Link>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {(topClients.length > 0 ? topClients : [
                  { name: 'Acme Corporation', interactions: 45, value: '£125,000', growth: '+12%' },
                  { name: 'TechStart Inc', interactions: 32, value: '£89,000', growth: '+8%' },
                  { name: 'Global Systems', interactions: 28, value: '£67,000', growth: '+15%' },
                  { name: 'Innovation Co', interactions: 24, value: '£54,000', growth: '+5%' }
                ]).slice(0, 4).map((client, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 0',
                    borderBottom: index < 3 ? '1px solid #f1f5f9' : 'none'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        backgroundColor: '#f1f5f9',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Users style={{ width: '20px', height: '20px', color: '#64748b' }} />
                      </div>
                      <div>
                        <p style={{
                          margin: '0 0 2px',
                          fontWeight: '500',
                          color: '#1e293b',
                          fontSize: '14px'
                        }}>
                          {client.name}
                        </p>
                        <p style={{
                          margin: '0',
                          fontSize: '12px',
                          color: '#64748b'
                        }}>
                          {client.interactions} interactions
                        </p>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{
                        margin: '0 0 2px',
                        fontWeight: '600',
                        color: '#1e293b',
                        fontSize: '14px'
                      }}>
                        {client.value}
                      </p>
                      <p style={{
                        margin: '0',
                        fontSize: '12px',
                        color: '#059669',
                        fontWeight: '500'
                      }}>
                        {client.growth || '+0%'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;