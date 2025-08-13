import React from 'react';
import { 
  TrendingUp, 
  Users, 
  Eye, 
  Heart,
  MessageSquare,
  Share,
  Calendar,
  Target,
  Award,
  Zap
} from 'lucide-react';

export const Analytics: React.FC = () => {
  const overviewStats = [
    { label: 'Total Impressions', value: '156.2K', change: '+23.5%', trend: 'up', icon: Eye },
    { label: 'Profile Views', value: '8.4K', change: '+15.2%', trend: 'up', icon: Users },
    { label: 'Post Engagements', value: '12.8K', change: '+18.7%', trend: 'up', icon: Heart },
    { label: 'New Connections', value: '342', change: '+8.1%', trend: 'up', icon: Target },
  ];

  const engagementData = [
    { month: 'Jan', impressions: 12500, engagements: 850, posts: 8 },
    { month: 'Feb', impressions: 15200, engagements: 1020, posts: 12 },
    { month: 'Mar', impressions: 18900, engagements: 1380, posts: 15 },
    { month: 'Apr', impressions: 21300, engagements: 1590, posts: 18 },
    { month: 'May', impressions: 25600, engagements: 1840, posts: 22 },
    { month: 'Jun', impressions: 28100, engagements: 2180, posts: 24 },
  ];

  const topPerformingPosts = [
    {
      id: 1,
      content: "5 AI Marketing Trends That Will Dominate 2025 🚀",
      type: 'carousel',
      date: '2 days ago',
      metrics: { impressions: 15420, likes: 342, comments: 87, shares: 45 }
    },
    {
      id: 2,
      content: "The Leadership Lesson That Changed My Career Path",
      type: 'article',
      date: '1 week ago',
      metrics: { impressions: 12890, likes: 298, comments: 62, shares: 38 }
    },
    {
      id: 3,
      content: "Remote work productivity hack that doubled my output 💡",
      type: 'post',
      date: '3 days ago',
      metrics: { impressions: 9670, likes: 234, comments: 43, shares: 22 }
    }
  ];

  const audienceInsights = [
    { category: 'Marketing Professionals', percentage: 35, color: 'bg-blue-500' },
    { category: 'Tech Executives', percentage: 28, color: 'bg-green-500' },
    { category: 'Startup Founders', percentage: 22, color: 'bg-purple-500' },
    { category: 'Consultants', percentage: 15, color: 'bg-orange-500' },
  ];

  const contentPerformance = [
    { type: 'Articles', posts: 12, avgEngagement: 7.8, totalReach: '45.2K' },
    { type: 'Carousels', posts: 18, avgEngagement: 9.2, totalReach: '67.8K' },
    { type: 'Short Posts', posts: 28, avgEngagement: 5.4, totalReach: '38.9K' },
    { type: 'Videos', posts: 6, avgEngagement: 12.1, totalReach: '23.4K' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">Track your LinkedIn performance and optimize your content strategy.</p>
        </div>
        <div className="flex items-center space-x-3">
          <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
            <option>Last 30 days</option>
            <option>Last 90 days</option>
            <option>Last 6 months</option>
            <option>Last year</option>
          </select>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
            Export Report
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {overviewStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Icon className="w-6 h-6 text-blue-600" />
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
        {/* Engagement Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Engagement Trends</h2>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-gray-600">Impressions</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">Engagements</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            {engagementData.map((data, index) => (
              <div key={data.month} className="flex items-center space-x-4">
                <div className="w-12 text-sm font-medium text-gray-600">{data.month}</div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(data.impressions / 30000) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500 ml-2 w-12">{(data.impressions / 1000).toFixed(1)}K</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(data.engagements / 2500) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500 ml-2 w-12">{data.engagements}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audience Insights */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Audience Breakdown</h2>
          <div className="space-y-4">
            {audienceInsights.map((audience) => (
              <div key={audience.category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">{audience.category}</span>
                  <span className="text-sm text-gray-600">{audience.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`${audience.color} h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${audience.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Award className="w-4 h-4 text-yellow-500" />
              <span className="font-medium text-gray-900">Top Engagement Time</span>
            </div>
            <p className="text-sm text-gray-600">Tuesday, 9:00 AM - 11:00 AM</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Performing Posts */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Top Performing Posts</h2>
          <div className="space-y-4">
            {topPerformingPosts.map((post, index) => (
              <div key={post.id} className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-gray-900">#{index + 1}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      post.type === 'article' ? 'bg-purple-100 text-purple-700' :
                      post.type === 'carousel' ? 'bg-green-100 text-green-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {post.type}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">{post.date}</span>
                </div>
                
                <p className="text-gray-900 text-sm mb-3 font-medium">{post.content}</p>
                
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <Eye className="w-4 h-4 text-gray-400" />
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{post.metrics.impressions.toLocaleString()}</span>
                    <p className="text-xs text-gray-500">Impressions</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <Heart className="w-4 h-4 text-gray-400" />
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{post.metrics.likes}</span>
                    <p className="text-xs text-gray-500">Likes</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <MessageSquare className="w-4 h-4 text-gray-400" />
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{post.metrics.comments}</span>
                    <p className="text-xs text-gray-500">Comments</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <Share className="w-4 h-4 text-gray-400" />
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{post.metrics.shares}</span>
                    <p className="text-xs text-gray-500">Shares</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Content Performance */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Content Performance</h2>
          <div className="space-y-4">
            {contentPerformance.map((content) => (
              <div key={content.type} className="p-4 border border-gray-100 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{content.type}</h3>
                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                    {content.posts} posts
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Avg. Engagement</span>
                    <span className="text-sm font-semibold text-gray-900">{content.avgEngagement}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Reach</span>
                    <span className="text-sm font-semibold text-gray-900">{content.totalReach}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Zap className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-blue-900">Recommendation</span>
            </div>
            <p className="text-sm text-blue-800">Focus on video content and carousels for higher engagement rates.</p>
          </div>
        </div>
      </div>
    </div>
  );
};