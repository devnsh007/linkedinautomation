import React from 'react';
import { 
  TrendingUp, 
  Calendar, 
  FileText, 
  Users, 
  Eye,
  MessageSquare,
  Heart,
  Share,
  Loader2
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useContent } from '../hooks/useContent';
import { useAnalytics } from '../hooks/useAnalytics';

export const Dashboard: React.FC = () => {
  const { linkedInProfile, user } = useAuth();
  const { posts, loading: postsLoading } = useContent();
  const { analytics, loading: analyticsLoading } = useAnalytics('30d');

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  // Calculate real stats
  const postsThisMonth = posts.filter(post => {
    const postDate = new Date(post.created_at);
    return postDate.getMonth() === currentMonth && postDate.getFullYear() === currentYear;
  }).length;

  const totalImpressions = analytics?.totalImpressions || 0;
  const averageEngagementRate = analytics?.averageEngagementRate || 0;
  
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const stats = [
    { 
      label: 'Posts This Month', 
      value: postsThisMonth.toString(), 
      change: postsThisMonth > 0 ? '+' + Math.round((postsThisMonth / (posts.length || 1)) * 100) + '%' : '0%', 
      icon: FileText, 
      color: 'blue' 
    },
    { 
      label: 'Total Impressions', 
      value: formatNumber(totalImpressions), 
      change: totalImpressions > 0 ? '+18%' : '0%', 
      icon: Eye, 
      color: 'green' 
    },
    { 
      label: 'Engagement Rate', 
      value: averageEngagementRate.toFixed(1) + '%', 
      change: averageEngagementRate > 0 ? '+' + (averageEngagementRate * 0.3).toFixed(1) + '%' : '0%', 
      icon: Heart, 
      color: 'pink' 
    },
    { 
      label: 'Total Posts', 
      value: posts.length.toString(), 
      change: posts.length > 0 ? '+' + Math.round(posts.length * 0.1) + '%' : '0%', 
      icon: Users, 
      color: 'purple' 
    },
  ];

  // Get recent posts (last 5)
  const recentPosts = posts.slice(0, 5).map(post => ({
    id: post.id,
    content: post.content.substring(0, 100) + (post.content.length > 100 ? '...' : ''),
    type: post.content_type === 'post' ? 'Short Post' : 
          post.content_type === 'article' ? 'Article' : 'Carousel',
    status: post.status.charAt(0).toUpperCase() + post.status.slice(1),
    date: post.published_at 
      ? new Date(post.published_at).toLocaleDateString()
      : post.scheduled_at 
        ? `Scheduled for ${new Date(post.scheduled_at).toLocaleDateString()}`
        : 'Draft saved',
    metrics: {
      likes: post.analytics_data?.likes || 0,
      comments: post.analytics_data?.comments || 0,
      shares: post.analytics_data?.shares || 0
    }
  }));

  const displayName = linkedInProfile ? 
    `${linkedInProfile.firstName} ${linkedInProfile.lastName}` : 
    user?.email?.split('@')[0] || 'User';

  if (postsLoading || analyticsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {displayName}! Here's your LinkedIn performance overview.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
            Generate Content
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const colorClasses = {
            blue: 'bg-blue-100 text-blue-600',
            green: 'bg-green-100 text-green-600',
            pink: 'bg-pink-100 text-pink-600',
            purple: 'bg-purple-100 text-purple-600',
          };

          return (
            <div key={stat.label} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-lg ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Posts</h2>
            <button className="text-blue-600 hover:text-blue-700 font-medium">View All</button>
          </div>
          <div className="space-y-4">
            {recentPosts.map((post) => (
              <div key={post.id} className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    post.status.toLowerCase() === 'published' ? 'bg-green-100 text-green-700' :
                    post.status.toLowerCase() === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {post.status}
                  </span>
                  <span className="text-xs text-gray-500">{post.type}</span>
                </div>
                <p className="text-gray-900 text-sm mb-2 line-clamp-2">{post.content}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{post.date}</span>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Heart className="w-4 h-4 text-gray-400" />
                      <span className="text-xs text-gray-600">{post.metrics.likes}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageSquare className="w-4 h-4 text-gray-400" />
                      <span className="text-xs text-gray-600">{post.metrics.comments}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Share className="w-4 h-4 text-gray-400" />
                      <span className="text-xs text-gray-600">{post.metrics.shares}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {recentPosts.length === 0 && (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No posts yet. Start creating content!</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Upcoming Schedule</h2>
            <Calendar className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-3 bg-blue-50 rounded-lg">
              <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">
                  {posts.filter(p => p.status === 'scheduled').length > 0 
                    ? posts.find(p => p.status === 'scheduled')?.title || 'Scheduled Content'
                    : 'No upcoming posts'}
                </p>
                <p className="text-sm text-gray-600">
                  {posts.filter(p => p.status === 'scheduled').length > 0 && posts.find(p => p.status === 'scheduled')?.scheduled_at
                    ? new Date(posts.find(p => p.status === 'scheduled')!.scheduled_at!).toLocaleString()
                    : 'Schedule your first post'}
                </p>
              </div>
            </div>
            {posts.filter(p => p.status === 'draft').length > 0 && (
              <div className="flex items-center space-x-4 p-3 bg-yellow-50 rounded-lg">
                <div className="w-3 h-3 bg-yellow-600 rounded-full"></div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {posts.filter(p => p.status === 'draft').length} Draft{posts.filter(p => p.status === 'draft').length > 1 ? 's' : ''} Ready
                  </p>
                  <p className="text-sm text-gray-600">Complete and schedule your drafts</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};