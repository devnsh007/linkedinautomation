import React, { useState, useEffect } from 'react';
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
  Loader2
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

interface DashboardStats {
  totalPosts: number;
  publishedPosts: number;
  scheduledPosts: number;
  draftPosts: number;
  totalImpressions: number;
  totalEngagements: number;
  averageEngagementRate: number;
  newFollowers: number;
}

interface RecentPost {
  id: string;
  title: string;
  content: string;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  content_type: 'post' | 'article' | 'carousel';
  created_at: string;
  scheduled_at?: string;
  published_at?: string;
  analytics_data?: any;
}

interface ScheduledPost {
  id: string;
  title: string;
  scheduled_at: string;
  content_type: 'post' | 'article' | 'carousel';
}

export const Dashboard: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalPosts: 0,
    publishedPosts: 0,
    scheduledPosts: 0,
    draftPosts: 0,
    totalImpressions: 0,
    totalEngagements: 0,
    averageEngagementRate: 0,
    newFollowers: 0
  });
  const [recentPosts, setRecentPosts] = useState<RecentPost[]>([]);
  const [upcomingPosts, setUpcomingPosts] = useState<ScheduledPost[]>([]);

  // Check if Supabase is configured
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const isSupabaseConfigured = supabaseUrl && supabaseKey;

  useEffect(() => {
    if (!authLoading) {
      if (user && isSupabaseConfigured) {
        loadDashboardData();
      } else {
        setLoading(false);
      }
    }
  }, [user, authLoading, isSupabaseConfigured]);

  const loadDashboardData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);

      console.log('Loading dashboard data for user:', user.id);

      // Fetch user's posts
      const { data: posts, error: postsError } = await supabase
        .from('content_posts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (postsError) {
        console.error('Error fetching posts:', postsError);
        throw new Error(`Failed to load posts: ${postsError.message}`);
      }

      console.log('Posts loaded:', posts?.length || 0);

      // Fetch analytics data for published posts
      const { data: analytics, error: analyticsError } = await supabase
        .from('analytics_metrics')
        .select('*')
        .eq('user_id', user.id);

      if (analyticsError) {
        console.warn('Error fetching analytics:', analyticsError);
        // Don't throw here, analytics might not exist yet
      }

      console.log('Analytics loaded:', analytics?.length || 0);

      // Calculate stats
      const totalPosts = posts?.length || 0;
      const publishedPosts = posts?.filter(p => p.status === 'published').length || 0;
      const scheduledPosts = posts?.filter(p => p.status === 'scheduled').length || 0;
      const draftPosts = posts?.filter(p => p.status === 'draft').length || 0;

      // Calculate analytics
      const totalImpressions = analytics?.reduce((sum, a) => sum + (a.impressions || 0), 0) || 0;
      const totalLikes = analytics?.reduce((sum, a) => sum + (a.likes || 0), 0) || 0;
      const totalComments = analytics?.reduce((sum, a) => sum + (a.comments || 0), 0) || 0;
      const totalShares = analytics?.reduce((sum, a) => sum + (a.shares || 0), 0) || 0;
      const totalEngagements = totalLikes + totalComments + totalShares;
      
      const averageEngagementRate = analytics?.length 
        ? analytics.reduce((sum, a) => sum + (a.engagement_rate || 0), 0) / analytics.length
        : 0;

      setStats({
        totalPosts,
        publishedPosts,
        scheduledPosts,
        draftPosts,
        totalImpressions,
        totalEngagements,
        averageEngagementRate: Math.round(averageEngagementRate * 100) / 100,
        newFollowers: Math.floor(Math.random() * 50) + 10 // Mock data for now
      });

      // Set recent posts (last 5)
      setRecentPosts(posts?.slice(0, 5) || []);

      // Set upcoming scheduled posts
      const upcoming = posts?.filter(p => 
        p.status === 'scheduled' && 
        p.scheduled_at && 
        new Date(p.scheduled_at) > new Date()
      ).sort((a, b) => new Date(a.scheduled_at!).getTime() - new Date(b.scheduled_at!).getTime()).slice(0, 3) || [];

      setUpcomingPosts(upcoming.map(p => ({
        id: p.id,
        title: p.title,
        scheduled_at: p.scheduled_at!,
        content_type: p.content_type
      })));

    } catch (err) {
      console.error('Dashboard loading error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-red-800">Dashboard Error</h3>
              <p className="text-red-700 mt-1">{error}</p>
              <button 
                onClick={loadDashboardData}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Retry Loading
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Authentication Required</h3>
          <p className="text-gray-600">Please log in to access the dashboard.</p>
        </div>
      </div>
    );
  }

  const displayName = user?.email?.split('@')[0] || 'User';

  const getStatusBadge = (status: string) => {
    const statusMap = {
      published: 'bg-green-100 text-green-800',
      scheduled: 'bg-blue-100 text-blue-800',
      draft: 'bg-gray-100 text-gray-800',
      failed: 'bg-red-100 text-red-800',
    };
    return statusMap[status as keyof typeof statusMap] || 'bg-gray-100 text-gray-800';
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'article': return '📄';
      case 'carousel': return '📋';
      default: return '📝';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const statsCards = [
    { 
      label: 'Total Posts', 
      value: stats.totalPosts.toString(), 
      change: stats.totalPosts > 0 ? '+100%' : '0%', 
      icon: FileText, 
      color: 'blue' 
    },
    { 
      label: 'Total Impressions', 
      value: stats.totalImpressions > 0 ? `${(stats.totalImpressions / 1000).toFixed(1)}K` : '0', 
      change: stats.totalImpressions > 0 ? '+100%' : '0%', 
      icon: Eye, 
      color: 'green' 
    },
    { 
      label: 'Engagement Rate', 
      value: `${stats.averageEngagementRate}%`, 
      change: stats.averageEngagementRate > 0 ? '+100%' : '0%', 
      icon: Heart, 
      color: 'pink' 
    },
    { 
      label: 'New Followers', 
      value: stats.newFollowers.toString(), 
      change: '+8%', 
      icon: Users, 
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
      {/* Environment Warning */}
      {!isSupabaseConfigured && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">Demo Mode</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Supabase not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable database features.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {displayName}! Here's your LinkedIn performance overview.
          </p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Generate Content</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-lg ${getColorClasses(stat.color)}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-green-500 text-sm font-medium">{stat.change}</span>
                  </div>
                </div>
              </div>
              <p className="text-gray-600 mt-4 font-medium">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Posts */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Posts</h2>
            <button className="text-blue-600 hover:text-blue-700 font-medium">View All</button>
          </div>
          
          {recentPosts.length > 0 ? (
            <div className="space-y-4">
              {recentPosts.map((post) => (
                <div key={post.id} className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getContentTypeIcon(post.content_type)}</span>
                      <h3 className="font-medium text-gray-900 truncate flex-1">{post.title}</h3>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(post.status)}`}>
                      {post.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{formatDate(post.created_at)}</p>
                  
                  {post.analytics_data && (
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Eye className="w-4 h-4" />
                        <span>{post.analytics_data.impressions || 0}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Heart className="w-4 h-4" />
                        <span>{post.analytics_data.likes || 0}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageSquare className="w-4 h-4" />
                        <span>{post.analytics_data.comments || 0}</span>
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
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Create Your First Post
              </button>
            </div>
          )}
        </div>

        {/* Upcoming Schedule */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Upcoming Schedule</h2>
            <Calendar className="w-5 h-5 text-gray-400" />
          </div>
          
          {upcomingPosts.length > 0 ? (
            <div className="space-y-4">
              {upcomingPosts.map((post) => (
                <div key={post.id} className="flex items-center space-x-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0"></div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm">{getContentTypeIcon(post.content_type)}</span>
                      <p className="font-medium text-gray-900">{post.title}</p>
                    </div>
                    <p className="text-sm text-gray-600">{formatDate(post.scheduled_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No scheduled posts</p>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                Schedule a Post
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Debug Info (development only) */}
      {import.meta.env.DEV && (
        <div className="bg-gray-100 p-4 rounded-lg text-sm">
          <h3 className="font-semibold mb-2">Debug Info:</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p><strong>User ID:</strong> {user?.id || 'None'}</p>
              <p><strong>Email:</strong> {user?.email || 'None'}</p>
              <p><strong>Posts:</strong> {recentPosts.length}</p>
              <p><strong>Scheduled:</strong> {upcomingPosts.length}</p>
            </div>
            <div>
              <p><strong>Supabase URL:</strong> {supabaseUrl ? 'Configured' : 'Missing'}</p>
              <p><strong>Supabase Key:</strong> {supabaseKey ? 'Configured' : 'Missing'}</p>
              <p><strong>Total Impressions:</strong> {stats.totalImpressions}</p>
              <p><strong>Avg Engagement:</strong> {stats.averageEngagementRate}%</p>
            </div>
          </div>
          <button 
            onClick={loadDashboardData}
            className="mt-3 px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
          >
            Refresh Data
          </button>
        </div>
      )}
    </div>
  );
};