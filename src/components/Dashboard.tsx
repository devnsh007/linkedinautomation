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
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const Dashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get auth data with error handling
  let authData;
  try {
    authData = useAuth();
  } catch (err) {
    console.error('Auth hook error:', err);
    authData = { user: null, linkedInProfile: null, loading: false };
  }

  const { linkedInProfile, user } = authData;

  useEffect(() => {
    console.log('Dashboard mounted');
    console.log('User:', user);
    console.log('LinkedIn Profile:', linkedInProfile);
    
    // Simulate loading completion
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [user, linkedInProfile]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 text-center mb-2">Error</h3>
          <p className="text-red-600 text-center">{error}</p>
        </div>
      </div>
    );
  }

  // Check if Supabase is configured
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const isSupabaseConfigured = supabaseUrl && supabaseKey;

  const displayName = linkedInProfile ? 
    `${linkedInProfile.firstName} ${linkedInProfile.lastName}` : 
    user?.email?.split('@')[0] || 'User';

  // Simple mock stats
  const stats = [
    { 
      label: 'Posts This Month', 
      value: '12', 
      change: '+15%', 
      icon: FileText, 
      color: 'blue' 
    },
    { 
      label: 'Total Impressions', 
      value: '24.5K', 
      change: '+23%', 
      icon: Eye, 
      color: 'green' 
    },
    { 
      label: 'Engagement Rate', 
      value: '6.8%', 
      change: '+12%', 
      icon: Heart, 
      color: 'pink' 
    },
    { 
      label: 'New Followers', 
      value: '89', 
      change: '+8%', 
      icon: Users, 
      color: 'purple' 
    },
  ];

  const recentPosts = [
    {
      id: 1,
      title: "AI Marketing Trends for 2025",
      status: 'published',
      date: '2 days ago',
      impressions: 1240,
      likes: 45,
      comments: 12
    },
    {
      id: 2,
      title: "Leadership Lessons from Remote Work",
      status: 'scheduled',
      date: 'Tomorrow at 9:00 AM',
      impressions: 0,
      likes: 0,
      comments: 0
    },
    {
      id: 3,
      title: "Building Company Culture in 2025",
      status: 'draft',
      date: 'Draft',
      impressions: 0,
      likes: 0,
      comments: 0
    }
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

  const getStatusBadge = (status: string) => {
    const statusMap = {
      published: 'bg-green-100 text-green-800',
      scheduled: 'bg-blue-100 text-blue-800',
      draft: 'bg-gray-100 text-gray-800',
    };
    return statusMap[status as keyof typeof statusMap] || 'bg-gray-100 text-gray-800';
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
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
          Generate Content
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
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
          <div className="space-y-4">
            {recentPosts.map((post) => (
              <div key={post.id} className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900 truncate flex-1">{post.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(post.status)}`}>
                    {post.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{post.date}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Eye className="w-4 h-4" />
                    <span>{post.impressions.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Heart className="w-4 h-4" />
                    <span>{post.likes}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MessageSquare className="w-4 h-4" />
                    <span>{post.comments}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Schedule */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Upcoming Schedule</h2>
            <Calendar className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Leadership Lessons from Remote Work</p>
                <p className="text-sm text-gray-600">Tomorrow at 9:00 AM</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
              <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Weekly Marketing Tips</p>
                <p className="text-sm text-gray-600">Friday at 2:00 PM</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors duration-200 text-center">
              <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="font-medium text-gray-900">Generate Post</p>
              <p className="text-sm text-gray-600">Create AI-powered content</p>
            </button>
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors duration-200 text-center">
              <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="font-medium text-gray-900">Schedule Posts</p>
              <p className="text-sm text-gray-600">Plan your content calendar</p>
            </button>
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors duration-200 text-center">
              <TrendingUp className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="font-medium text-gray-900">View Analytics</p>
              <p className="text-sm text-gray-600">Track your performance</p>
            </button>
          </div>
        </div>
      </div>

      {/* Debug Info (only in development) */}
      {import.meta.env.DEV && (
        <div className="bg-gray-100 p-4 rounded-lg text-sm">
          <h3 className="font-semibold mb-2">Debug Info:</h3>
          <p>User ID: {user?.id || 'None'}</p>
          <p>User Email: {user?.email || 'None'}</p>
          <p>LinkedIn Profile: {linkedInProfile ? 'Loaded' : 'None'}</p>
          <p>Supabase URL: {supabaseUrl ? 'Set' : 'Missing'}</p>
          <p>Supabase Key: {supabaseKey ? 'Set' : 'Missing'}</p>
        </div>
      )}
    </div>
  );
};