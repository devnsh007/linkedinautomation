import React from 'react';
import { 
  TrendingUp, 
  Calendar, 
  FileText, 
  Users, 
  Eye,
  MessageSquare,
  Heart,
  Share
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const Dashboard: React.FC = () => {
  const { linkedInProfile } = useAuth();

  const stats = [
    { label: 'Posts This Month', value: '24', change: '+12%', icon: FileText, color: 'blue' },
    { label: 'Total Impressions', value: '45.2K', change: '+18%', icon: Eye, color: 'green' },
    { label: 'Engagement Rate', value: '6.8%', change: '+2.1%', icon: Heart, color: 'pink' },
    { label: 'New Connections', value: '127', change: '+8%', icon: Users, color: 'purple' },
  ];

  const recentPosts = [
    {
      id: 1,
      content: "Just launched our new AI-powered content strategy. The results speak for themselves! 🚀",
      type: 'Short Update',
      status: 'Published',
      date: '2 hours ago',
      metrics: { likes: 24, comments: 8, shares: 3 }
    },
    {
      id: 2,
      content: "5 Key Trends Shaping the Future of Digital Marketing in 2025...",
      type: 'Article',
      status: 'Scheduled',
      date: 'Tomorrow 9:00 AM',
      metrics: { likes: 0, comments: 0, shares: 0 }
    },
    {
      id: 3,
      content: "Behind the scenes of building a successful remote team...",
      type: 'Carousel',
      status: 'Draft',
      date: 'Draft saved',
      metrics: { likes: 0, comments: 0, shares: 0 }
    }
  ];

  const displayName = linkedInProfile ? 
    `${linkedInProfile.firstName} ${linkedInProfile.lastName}` : 
    'User';

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
                    post.status === 'Published' ? 'bg-green-100 text-green-700' :
                    post.status === 'Scheduled' ? 'bg-blue-100 text-blue-700' :
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
                <p className="font-medium text-gray-900">Tech Industry Insights</p>
                <p className="text-sm text-gray-600">Tomorrow, 9:00 AM</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 p-3 bg-green-50 rounded-lg">
              <div className="w-3 h-3 bg-green-600 rounded-full"></div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Leadership Tips Carousel</p>
                <p className="text-sm text-gray-600">Jan 30, 2:00 PM</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 p-3 bg-purple-50 rounded-lg">
              <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Company Culture Update</p>
                <p className="text-sm text-gray-600">Feb 1, 11:00 AM</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};