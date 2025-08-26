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
  Loader2,
  Clock,
  CheckCircle,
  Edit3,
  BarChart3,
  PenTool,
  RefreshCw
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalPosts: 0,
    publishedPosts: 0,
    scheduledPosts: 0,
    draftPosts: 0,
    totalImpressions: 0,
    totalEngagements: 0,
    averageEngagementRate: 0,
    thisWeekPosts: 0
  });
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [upcomingPosts, setUpcomingPosts] = useState<any[]>([]);

  // Check environment variables
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const isSupabaseConfigured = supabaseUrl && supabaseKey;

  console.log('Dashboard: Component rendered', {
    supabaseConfigured: isSupabaseConfigured,
    supabaseUrl: !!supabaseUrl,
    supabaseKey: !!supabaseKey,
  });

  useEffect(() => {
    console.log('Dashboard: useEffect triggered');
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    console.log('Dashboard: Starting to load data...');
    setLoading(true);
    setError(null);

    try {
      // If Supabase is not configured, use demo data
      if (!isSupabaseConfigured) {
        console.log('Dashboard: Supabase not configured, using demo data');
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate loading
        setDemoData();
        setLoading(false);
        return;
      }

      console.log('Dashboard: Attempting to connect to Supabase...');
      
      // Dynamic import to handle potential module issues
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(supabaseUrl, supabaseKey);

      console.log('Dashboard: Supabase client created');

      // Try to fetch user session first
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('Dashboard: Session check', { hasSession: !!session, sessionError });

      if (sessionError) {
        throw new Error(`Session error: ${sessionError.message}`);
      }

      if (!session?.user) {
        console.log('Dashboard: No authenticated user, showing login prompt');
        setError('Please log in to view your dashboard data.');
        setLoading(false);
        return;
      }

      const userId = session.user.id;
      console.log('Dashboard: Authenticated user found:', userId);

      // Fetch posts data
      console.log('Dashboard: Fetching posts...');
      const { data: posts, error: postsError } = await supabase
        .from('content_posts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (postsError) {
        console.error('Dashboard: Posts fetch error:', postsError);
        throw new Error(`Failed to fetch posts: ${postsError.message}`);
      }

      console.log('Dashboard: Posts fetched:', posts?.length || 0);

      // Fetch analytics data
      console.log('Dashboard: Fetching analytics...');
      const { data: analytics, error: analyticsError } = await supabase
        .from('analytics_metrics')
        .select('*')
        .eq('user_id', userId)
        .order('recorded_at', { ascending: false });

      if (analyticsError) {
        console.warn('Dashboard: Analytics fetch error (non-critical):', analyticsError);
      }

      console.log('Dashboard: Analytics fetched:', analytics?.length || 0);

      // Process the data
      const postsArray = posts || [];
      const analyticsArray = analytics || [];

      // Calculate stats
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const calculatedStats = {
        totalPosts: postsArray.length,
        publishedPosts: postsArray.filter(p => p.status === 'published').length,
        scheduledPosts: postsArray.filter(p => p.status === 'scheduled').length,
        draftPosts: postsArray.filter(p => p.status === 'draft').length,
        totalImpressions: analyticsArray.reduce((sum, a) => sum + (a.impressions || 0), 0),
        totalEngagements: analyticsArray.reduce((sum, a) => 
          sum + (a.likes || 0) + (a.comments || 0) + (a.shares || 0), 0
        ),
        averageEngagementRate: analyticsArray.length > 0 
          ? analyticsArray.reduce((sum, a) => sum + (a.engagement_rate || 0), 0) / analyticsArray.length
          : 0,
        thisWeekPosts: postsArray.filter(p => 
          new Date(p.created_at) >= oneWeekAgo
        ).length
      };

      // Get recent posts with analytics
      const recentPostsWithAnalytics = postsArray.slice(0, 5).map(post => {
        const postAnalytics = analyticsArray.find(a => a.post_id === post.id);
        return {
          ...post,
          analytics: postAnalytics || null
        };
      });

      // Get upcoming scheduled posts
      const now = new Date();
      const upcoming = postsArray
        .filter(p => 
          p.status === 'scheduled' && 
          p.scheduled_at && 
          new Date(p.scheduled_at) > now
        )
        .sort((a, b) => new Date(a.scheduled_at!).getTime() - new Date(b.scheduled_at!).getTime())
        .slice(0, 5);

      // Update state
      setStats(calculatedStats);
      setRecentPosts(recentPostsWithAnalytics);
      setUpcomingPosts(upcoming);

      console.log('Dashboard: Data loaded successfully', {
        stats: calculatedStats,
        recentPosts: recentPostsWithAnalytics.length,
        upcomingPosts: upcoming.length
      });

    } catch (err: any) {
      console.error('Dashboard: Load error:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const setDemoData = () => {
    console.log('Dashboard: Setting demo data');
    setStats({
      totalPosts: 24,
      publishedPosts: 18,
      scheduledPosts: 4,
      draftPosts: 2,
      totalImpressions: 45600,
      totalEngagements: 1280,
      averageEngagementRate: 6.8,
      thisWeekPosts: 3
    });

    setRecentPosts([
      {
        id: '1',
        title: 'AI Marketing Trends for 2025',
        content: 'The future of marketing is here...',
        status: 'published',
        content_type: 'article',
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        published_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        analytics: {
          impressions: 2400,
          likes: 45,
          comments: 12,
          shares: 8,
          engagement_rate: 7.2
        }
      },
      {
        id: '2',
        title: 'Leadership Lessons from Remote Work',
        content: 'What I learned managing a remote team...',
        status: 'published',
        content_type: 'post',
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        published_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        analytics: {
          impressions: 1800,
          likes: 32,
          comments: 8,
          shares: 5,
          engagement_rate: 5.8
        }
      },
      {
        id: '3',
        title: 'Digital Transformation Strategy',
        content: 'How we transformed our business...',
        status: 'scheduled',
        content_type: 'carousel',
        created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        scheduled_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        analytics: null
      }
    ]);

    setUpcomingPosts([
      {
        id: '4',
        title: 'Weekly Industry Update',
        scheduled_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        content_type: 'post',
        status: 'scheduled'
      },
      {
        id: '5',
        title: 'Team Building Best Practices',
        scheduled_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        content_type: 'article',
        status: 'scheduled'
      }
    ]);
  };

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

  console.log('Dashboard: Rendering component', { loading, error, isSupabaseConfigured });

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading Dashboard...</p>
          <p className="text-gray-500 text-sm mt-2">
            {isSupabaseConfigured ? 'Fetching your data...' : 'Loading demo data...'}
          </p>
        </div>
      </div>
    );
  }

  // Environment warning
  if (!isSupabaseConfigured) {
    return (
      <div className="space-y-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-6 h-6 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-yellow-800">Demo Mode - Setup Required</h3>
              <p className="text-yellow-700 mt-2">
                Configure your environment variables to connect to your Supabase database:
              </p>
              <ul className="list-disc list-inside text-yellow-700 mt-2 space-y-1">
                <li><code className="bg-yellow-100 px-2 py-1 rounded">VITE_SUPABASE_URL</code></li>
                <li><code className="bg-yellow-100 px-2 py-1 rounded">VITE_SUPABASE_ANON_KEY</code></li>
              </ul>
              <p className="text-yellow-700 mt-2">
                Below is demo data showing how your dashboard will look.
              </p>
            </div>
          </div>
        </div>
        {renderDashboard()}
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
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-800">Dashboard Error</h3>
              <p className="text-red-700 mt-1">{error}</p>
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

  return renderDashboard();

  function renderDashboard() {
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
              {isSupabaseConfigured ? 
                "Welcome back! Here's your LinkedIn performance overview." : 
                "Demo Dashboard - showing sample data"
              }
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
                    
                    {post.analytics && (
                      <div className="flex items-center space-x-4 text-sm text-gray-500 pt-3 border-t border-gray-100">
                        <div className="flex items-center space-x-1">
                          <Eye className="w-4 h-4" />
                          <span>{formatNumber(post.analytics.impressions || 0)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Heart className="w-4 h-4" />
                          <span>{post.analytics.likes || 0}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageSquare className="w-4 h-4" />
                          <span>{post.analytics.comments || 0}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Share className="w-4 h-4" />
                          <span>{post.analytics.shares || 0}</span>
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

        {/* Debug Info (Development Only) */}
        {import.meta.env.DEV && (
          <div className="bg-gray-100 p-4 rounded-lg text-sm">
            <h3 className="font-semibold mb-2">Debug Information:</h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p><strong>Supabase URL:</strong> {supabaseUrl ? '✅' : '❌'}</p>
                <p><strong>Supabase Key:</strong> {supabaseKey ? '✅' : '❌'}</p>
                <p><strong>Environment:</strong> {import.meta.env.NODE_ENV}</p>
                <p><strong>Loading:</strong> {loading.toString()}</p>
                <p><strong>Error:</strong> {error || 'None'}</p>
              </div>
              <div>
                <p><strong>Total Posts:</strong> {stats.totalPosts}</p>
                <p><strong>Recent Posts:</strong> {recentPosts.length}</p>
                <p><strong>Upcoming Posts:</strong> {upcomingPosts.length}</p>
                <p><strong>Total Impressions:</strong> {stats.totalImpressions}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center space-x-2">
              <button 
                onClick={loadDashboardData}
                className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
              >
                Reload Data
              </button>
              <button 
                onClick={() => console.log('Dashboard State:', { stats, recentPosts, upcomingPosts, error, loading })}
                className="px-3 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700 transition-colors"
              >
                Log State
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
};