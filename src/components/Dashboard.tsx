import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useContent } from '../hooks/useContent';
import { useAnalytics } from '../hooks/useAnalytics';
import { Navigate } from 'react-router-dom';
import { 
  TrendingUp, 
  Calendar, 
  FileText, 
  Users, 
  Eye,
  MessageSquare,
  Heart,
  Share,
  Plus,
  AlertCircle,
  Loader2,
  Clock,
  CheckCircle,
  Edit3,
  BarChart3,
  PenTool,
  RefreshCw
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { posts, loading: postsLoading, error: postsError } = useContent();
  const { analytics, loading: analyticsLoading } = useAnalytics('30d');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate stats from real data
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const stats = {
    totalPosts: posts.length,
    publishedPosts: posts.filter(p => p.status === 'published').length,
    scheduledPosts: posts.filter(p => p.status === 'scheduled').length,
    draftPosts: posts.filter(p => p.status === 'draft').length,
    totalImpressions: analytics?.totalImpressions || 0,
    totalEngagements: analytics?.totalEngagements || 0,
    averageEngagementRate: analytics?.averageEngagementRate || 0,
    thisWeekPosts: posts.filter(p => 
      new Date(p.created_at) >= oneWeekAgo
    ).length
  };

  // Get recent posts (last 5)
  const recentPosts = posts.slice(0, 5);

  // Get upcoming scheduled posts
  const now = new Date();
  const upcomingPosts = posts
    .filter(p => 
      p.status === 'scheduled' && 
      p.scheduled_at && 
      new Date(p.scheduled_at) > now
    )
    .sort((a, b) => new Date(a.scheduled_at!).getTime() - new Date(b.scheduled_at!).getTime())
    .slice(0, 5);

  const isLoading = postsLoading || analyticsLoading;
  const hasError = postsError || error;

  // Utility functions
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'scheduled':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'draft':
        return <Edit3 className="w-4 h-4 text-gray-600" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      published: 'bg-green-100 text-green-800 border-green-200',
      scheduled: 'bg-blue-100 text-blue-800 border-blue-200',
      draft: 'bg-gray-100 text-gray-800 border-gray-200',
      failed: 'bg-red-100 text-red-800 border-red-200',
    };
    return statusMap[status as keyof typeof statusMap] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'article': return '📄';
      case 'carousel': return '📋';
      default: return '📝';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const loadDashboardData = () => {
    // This will be handled by the hooks automatically
    window.location.reload();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading Dashboard...</p>
          <p className="text-gray-500 text-sm mt-2">
            {user ? 'Fetching your LinkedIn data...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  // Redirect if no user
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Error state
  if (hasError) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-800">Dashboard Error</h3>
              <p className="text-red-700 mt-1">{hasError}</p>
              <div className="mt-4 flex items-center space-x-3">
                <button 
                  onClick={loadDashboardData}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Retry Loading
                </button>
                <button 
                  onClick={() => setError(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main dashboard render
    const statsCards = [
      { 
        label: 'Total Posts', 
        value: stats.totalPosts.toString(), 
        change: stats.thisWeekPosts > 0 ? `+${stats.thisWeekPosts} this week` : 'No posts this week', 
        icon: FileText, 
        color: 'blue' 
      },
      { 
        label: 'Total Impressions', 
        value: formatNumber(stats.totalImpressions), 
        change: stats.totalImpressions > 0 ? 'Growing' : 'Start posting', 
        icon: Eye, 
        color: 'green' 
      },
      { 
        label: 'Engagement Rate', 
        value: `${stats.averageEngagementRate.toFixed(1)}%`, 
        change: stats.averageEngagementRate > 5 ? 'Great!' : 'Keep improving', 
        icon: Heart, 
        color: 'pink' 
      },
      { 
        label: 'Published Posts', 
        value: stats.publishedPosts.toString(), 
        change: `${stats.scheduledPosts} scheduled`, 
        icon: CheckCircle, 
        color: 'purple' 
      },
    ];

    const getColorClasses = (color: string) => {
      const colorMap = {
        blue: 'bg-blue-100 text-blue-600',
        green: 'bg-green-100 text-green-600',
        pink: 'bg-pink-100 text-pink-600',
        purple: 'bg-purple-100 text-purple-600',
      };
      return colorMap[color as keyof typeof colorMap] || 'bg-gray-100 text-gray-600';
    };

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Welcome back! Here's your LinkedIn performance overview.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={loadDashboardData}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Create Content</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${getColorClasses(stat.color)}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-gray-500 mt-1">{stat.change}</p>
                  </div>
                </div>
                <p className="text-gray-600 font-medium">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Posts */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Recent Posts
              </h2>
              <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">View All</button>
            </div>
            
            {recentPosts.length > 0 ? (
              <div className="space-y-4">
                {recentPosts.map((post) => (
                  <div key={post.id} className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3 flex-1">
                        <span className="text-lg">{getContentTypeIcon(post.content_type)}</span>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 truncate">{post.title}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            {getStatusIcon(post.status)}
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(post.status)}`}>
                              {post.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-500 mb-3">
                      {post.status === 'published' && post.published_at 
                        ? `Published ${formatDate(post.published_at)}`
                        : post.status === 'scheduled' && post.scheduled_at
                        ? `Scheduled for ${formatDate(post.scheduled_at)}`
                        : `Created ${formatDate(post.created_at)}`
                      }
                    </p>

                    {post.analytics_data && Object.keys(post.analytics_data).length > 0 && (
                      <div className="flex items-center space-x-4 text-sm text-gray-500 pt-3 border-t border-gray-100">
                        <div className="flex items-center space-x-1">
                          <Eye className="w-4 h-4" />
                          <span>{formatNumber(post.analytics_data.impressions || 0)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Heart className="w-4 h-4" />
                          <span>{post.analytics_data.likes || 0}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageSquare className="w-4 h-4" />
                          <span>{post.analytics_data.comments || 0}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Share className="w-4 h-4" />
                          <span>{post.analytics_data.shares || 0}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No posts created yet</p>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto">
                  <PenTool className="w-4 h-4" />
                  <span>Create Your First Post</span>
                </button>
              </div>
            )}
          </div>

          {/* Upcoming Schedule */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Upcoming Posts
              </h2>
              <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">View Calendar</button>
            </div>
            
            {upcomingPosts.length > 0 ? (
              <div className="space-y-4">
                {upcomingPosts.map((post) => (
                  <div key={post.id} className="flex items-center space-x-4 p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors duration-200">
                    <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-lg">{getContentTypeIcon(post.content_type)}</span>
                        <p className="font-medium text-gray-900 truncate">{post.title}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <p className="text-sm text-gray-600">{formatDate(post.scheduled_at)}</p>
                        <Clock className="w-4 h-4 text-blue-600" />
                      </div>
                    </div>
                    <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No scheduled posts</p>
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 mx-auto">
                  <Clock className="w-4 h-4" />
                  <span>Schedule a Post</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors duration-200 text-left">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <PenTool className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Generate Content</p>
                  <p className="text-sm text-gray-600">Create AI-powered posts</p>
                </div>
              </div>
            </button>
            
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-colors duration-200 text-left">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Schedule Posts</p>
                  <p className="text-sm text-gray-600">Plan your content calendar</p>
                </div>
              </div>
            </button>
            
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-colors duration-200 text-left">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">View Analytics</p>
                  <p className="text-sm text-gray-600">Track your performance</p>
                </div>
              </div>
            </button>
          </div>
        </div>

      </div>
    );
};