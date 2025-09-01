import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  Check,
  CheckCircle,
  Clock,
  Calendar,
  Mail,
  Phone,
  AlertCircle,
  Trash2,
  Filter,
  MoreVertical,
  ArrowLeft,
  RefreshCw
} from 'lucide-react';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [selectedType, setSelectedType] = useState('all'); // all, followup, meeting, success, email, task
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/notifications', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setNotifications(data.data.notifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([
        {
          id: 1,
          type: 'followup',
          title: 'Follow-up due',
          message: 'Follow-up due: Acme Corporation',
          timeAgo: '5 min ago',
          unread: true,
          priority: 'high'
        },
        {
          id: 2,
          type: 'meeting',
          title: 'Meeting reminder',
          message: 'Meeting reminder: TechStart Inc at 3 PM',
          timeAgo: '1 hour ago',
          unread: true,
          priority: 'medium'
        },
        {
          id: 3,
          type: 'success',
          title: 'Contract signed',
          message: 'Contract signed: Global Systems',
          timeAgo: '2 hours ago',
          unread: false,
          priority: 'low'
        },
        {
          id: 4,
          type: 'email',
          title: 'Email response',
          message: 'New email from Innovation Co',
          timeAgo: '1 day ago',
          unread: true,
          priority: 'medium'
        },
        {
          id: 5,
          type: 'task',
          title: 'Task overdue',
          message: 'Proposal deadline passed for Future Tech Ltd',
          timeAgo: '3 days ago',
          unread: true,
          priority: 'urgent'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(`/api/notifications/mark-read/${notificationId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === notificationId 
              ? { ...notification, unread: false }
              : notification
          )
        );
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, unread: false }
            : notification
        )
      );
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, unread: false }))
        );
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, unread: false }))
      );
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        setNotifications(prev => 
          prev.filter(notification => notification.id !== notificationId)
        );
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      setNotifications(prev => 
        prev.filter(notification => notification.id !== notificationId)
      );
    }
  };

  const getFilteredNotifications = () => {
    return notifications.filter(notification => {
      const matchesReadFilter = filter === 'all' || 
        (filter === 'unread' && notification.unread) ||
        (filter === 'read' && !notification.unread);
      
      const matchesTypeFilter = selectedType === 'all' || notification.type === selectedType;
      
      return matchesReadFilter && matchesTypeFilter;
    });
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'followup': return Clock;
      case 'meeting': return Calendar;
      case 'success': return CheckCircle;
      case 'email': return Mail;
      case 'task': return AlertCircle;
      case 'call': return Phone;
      default: return Bell;
    }
  };

  const getNotificationColor = (type, priority) => {
    if (priority === 'urgent') return '#dc2626';
    switch (type) {
      case 'followup': return '#d97706';
      case 'meeting': return '#2563eb';
      case 'success': return '#059669';
      case 'email': return '#7c3aed';
      case 'task': return '#dc2626';
      case 'call': return '#2563eb';
      default: return '#64748b';
    }
  };

  const getPriorityBadgeColor = (priority) => {
    switch (priority) {
      case 'urgent': return { bg: '#fef2f2', color: '#dc2626' };
      case 'high': return { bg: '#fef3c7', color: '#d97706' };
      case 'medium': return { bg: '#dbeafe', color: '#2563eb' };
      case 'low': return { bg: '#ecfdf5', color: '#059669' };
      default: return { bg: '#f1f5f9', color: '#64748b' };
    }
  };

  const filteredNotifications = getFilteredNotifications();
  const unreadCount = notifications.filter(n => n.unread).length;

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
          <p style={{ fontSize: '18px', fontWeight: '500', color: '#475569', margin: '0' }}>
            Loading notifications...
          </p>
        </div>
      </div>
    );
  }

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
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Link
                  to="/"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#64748b',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  <ArrowLeft size={20} />
                  <span>Back to Dashboard</span>
                </Link>
                <div>
                  <h1 style={{
                    fontSize: '32px',
                    fontWeight: 'bold',
                    background: 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    margin: '0'
                  }}>
                    Notifications
                  </h1>
                  <p style={{
                    margin: '4px 0 0',
                    fontSize: '14px',
                    color: '#64748b'
                  }}>
                    {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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

                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 16px',
                      backgroundColor: '#2563eb',
                      color: 'white',
                      borderRadius: '12px',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                      fontWeight: '500'
                    }}
                  >
                    <Check style={{ width: '16px', height: '16px' }} />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '32px 16px'
        }}>
          {/* Filters */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px'
            }}>
              {/* Read/Unread Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Filter size={20} style={{ color: '#64748b' }} />
                <div style={{
                  display: 'flex',
                  backgroundColor: '#f1f5f9',
                  borderRadius: '8px',
                  padding: '4px'
                }}>
                  {['all', 'unread', 'read'].map((filterOption) => (
                    <button
                      key={filterOption}
                      onClick={() => setFilter(filterOption)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: 'none',
                        backgroundColor: filter === filterOption ? '#2563eb' : 'transparent',
                        color: filter === filterOption ? 'white' : '#64748b',
                        fontWeight: '500',
                        fontSize: '14px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        textTransform: 'capitalize'
                      }}
                    >
                      {filterOption}
                    </button>
                  ))}
                </div>
              </div>

              {/* Type Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    backgroundColor: 'white',
                    color: '#1e293b',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  <option value="all">All Types</option>
                  <option value="followup">Follow-ups</option>
                  <option value="meeting">Meetings</option>
                  <option value="email">Emails</option>
                  <option value="task">Tasks</option>
                  <option value="success">Success</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e2e8f0',
            overflow: 'hidden'
          }}>
            {filteredNotifications.length === 0 ? (
              <div style={{
                padding: '64px 24px',
                textAlign: 'center'
              }}>
                <Bell size={48} style={{ color: '#94a3b8', marginBottom: '16px' }} />
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1e293b',
                  margin: '0 0 8px'
                }}>
                  No notifications found
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: '#64748b',
                  margin: '0'
                }}>
                  {filter === 'unread' ? 'All notifications have been read' : 'You\'re all caught up!'}
                </p>
              </div>
            ) : (
              filteredNotifications.map((notification, index) => {
                const Icon = getNotificationIcon(notification.type);
                const iconColor = getNotificationColor(notification.type, notification.priority);
                const priorityColors = getPriorityBadgeColor(notification.priority);

                return (
                  <div
                    key={notification.id}
                    style={{
                      padding: '20px 24px',
                      borderBottom: index < filteredNotifications.length - 1 ? '1px solid #f1f5f9' : 'none',
                      backgroundColor: notification.unread ? '#f8fafc' : 'white',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = notification.unread ? '#f1f5f9' : '#f8fafc';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = notification.unread ? '#f8fafc' : 'white';
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '16px'
                    }}>
                      {/* Icon */}
                      <div style={{
                        width: '48px',
                        height: '48px',
                        backgroundColor: `${iconColor}20`,
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <Icon size={24} style={{ color: iconColor }} />
                      </div>

                      {/* Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'space-between',
                          marginBottom: '8px'
                        }}>
                          <div style={{ flex: 1 }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              marginBottom: '4px'
                            }}>
                              <h4 style={{
                                fontSize: '16px',
                                fontWeight: '600',
                                color: '#1e293b',
                                margin: '0'
                              }}>
                                {notification.title}
                              </h4>
                              
                              {notification.priority && notification.priority !== 'low' && (
                                <span style={{
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  fontSize: '10px',
                                  fontWeight: '600',
                                  backgroundColor: priorityColors.bg,
                                  color: priorityColors.color,
                                  textTransform: 'uppercase'
                                }}>
                                  {notification.priority}
                                </span>
                              )}

                              {notification.unread && (
                                <div style={{
                                  width: '8px',
                                  height: '8px',
                                  backgroundColor: '#2563eb',
                                  borderRadius: '50%'
                                }}></div>
                              )}
                            </div>

                            <p style={{
                              fontSize: '14px',
                              color: '#64748b',
                              margin: '0 0 8px',
                              lineHeight: '1.5'
                            }}>
                              {notification.message}
                            </p>

                            <span style={{
                              fontSize: '12px',
                              color: '#94a3b8',
                              fontWeight: '500'
                            }}>
                              {notification.timeAgo}
                            </span>
                          </div>

                          {/* Actions */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}>
                            {notification.unread && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification.id);
                                }}
                                style={{
                                  padding: '6px',
                                  backgroundColor: 'transparent',
                                  border: '1px solid #e2e8f0',
                                  borderRadius: '6px',
                                  color: '#64748b',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease'
                                }}
                                title="Mark as read"
                              >
                                <Check size={14} />
                              </button>
                            )}

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                              style={{
                                padding: '6px',
                                backgroundColor: 'transparent',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                color: '#64748b',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                              }}
                              title="Delete notification"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Notifications;