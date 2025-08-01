// client/src/pages/Dashboard.js - Professional version with regular CSS
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  Users, MessageSquare, Calendar, TrendingUp, Search, Plus, 
  Clock, ArrowUpRight, ArrowDownRight, Activity, Star,
  RefreshCw, ChevronRight
} from 'lucide-react';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('30');
  const [refreshing, setRefreshing] = useState(false);

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
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setDashboardData({
        overview: {
          totalClients: 0, newClients: 0, totalInteractions: 0,
          followUpsDue: 0, overdueFollowUps: 0, clientGrowthRate: 0, interactionGrowthRate: 0
        },
        charts: { 
          clientsOverTime: [], 
          interactionsByType: [], 
          interactionOutcomes: [], 
          clientStatusDistribution: [] 
        },
        topClients: [], 
        recentActivities: []
      });
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
        `}
      </style>
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 100%)'
      }}>
        {/* Enhanced Header */}
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

          {/* Enhanced Charts Grid */}
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      backgroundColor: '#3B82F6',
                      borderRadius: '50%'
                    }}></div>
                    <span style={{ color: '#64748b' }}>Interactions</span>
                  </div>
                </div>
              </div>
              <div style={{ height: '288px' }}>
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
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e2e8f0', 
                        borderRadius: '12px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                      }} 
                    />
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

            {/* Other charts would go here with similar styling */}
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
        </div>
      </div>
    </>
  );
};

export default Dashboard;