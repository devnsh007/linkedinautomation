import React from 'react';
import { 
  User, 
  Briefcase, 
  Award, 
  TrendingUp, 
  Target,
  Users,
  MessageCircle,
  Star
} from 'lucide-react';

export const ProfileAnalysis: React.FC = () => {
  const profileData = {
    name: "Sarah Johnson",
    title: "Senior Marketing Director",
    company: "TechFlow Inc.",
    connections: 2847,
    followers: 5621,
    posts: 124,
    engagement: 6.8
  };

  const strengths = [
    { category: "Content Quality", score: 92, description: "High-quality posts with professional imagery" },
    { category: "Engagement", score: 85, description: "Strong interaction with your network" },
    { category: "Consistency", score: 78, description: "Regular posting schedule maintained" },
    { category: "Industry Authority", score: 88, description: "Recognized thought leader in marketing" }
  ];

  const improvements = [
    { area: "Video Content", impact: "High", suggestion: "Add 2-3 video posts per week to boost engagement by 40%" },
    { area: "Hashtag Strategy", impact: "Medium", suggestion: "Use trending industry hashtags to increase reach" },
    { area: "Connection Growth", impact: "Medium", suggestion: "Engage with 10 new prospects daily" }
  ];

  const contentTopics = [
    { topic: "Digital Marketing", posts: 28, engagement: 7.2 },
    { topic: "Leadership", posts: 22, engagement: 8.1 },
    { topic: "Industry Trends", posts: 18, engagement: 6.9 },
    { topic: "Team Management", posts: 15, engagement: 7.8 }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile Analysis</h1>
          <p className="text-gray-600 mt-1">AI-powered insights to optimize your LinkedIn presence.</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
          Refresh Analysis
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">{profileData.name}</h2>
              <p className="text-gray-600">{profileData.title}</p>
              <p className="text-gray-500 text-sm">{profileData.company}</p>
            </div>
            
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Connections</span>
                </div>
                <span className="font-semibold text-gray-900">{profileData.connections.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Followers</span>
                </div>
                <span className="font-semibold text-gray-900">{profileData.followers.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MessageCircle className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Posts</span>
                </div>
                <span className="font-semibold text-gray-900">{profileData.posts}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Avg. Engagement</span>
                </div>
                <span className="font-semibold text-gray-900">{profileData.engagement}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Profile Strengths</h3>
            <div className="space-y-4">
              {strengths.map((strength) => (
                <div key={strength.category}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{strength.category}</span>
                    <span className="text-sm font-semibold text-gray-700">{strength.score}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${strength.score}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600">{strength.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Improvement Opportunities</h3>
            <div className="space-y-4">
              {improvements.map((improvement, index) => (
                <div key={index} className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{improvement.area}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      improvement.impact === 'High' ? 'bg-red-100 text-red-700' :
                      improvement.impact === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {improvement.impact} Impact
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{improvement.suggestion}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Content Performance by Topic</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {contentTopics.map((topic) => (
            <div key={topic.topic} className="p-4 border border-gray-100 rounded-lg text-center hover:shadow-md transition-shadow duration-200">
              <h4 className="font-medium text-gray-900 mb-2">{topic.topic}</h4>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>{topic.posts} posts</span>
                <span className="font-semibold text-blue-600">{topic.engagement}% eng.</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};