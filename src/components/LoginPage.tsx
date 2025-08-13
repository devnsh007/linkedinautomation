import React from 'react';
import { Linkedin, Zap, BarChart3, Calendar, PenTool } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const LoginPage: React.FC = () => {
  const { signInWithLinkedIn, loading } = useAuth();

  const features = [
    {
      icon: PenTool,
      title: 'AI Content Generation',
      description: 'Create engaging LinkedIn posts, articles, and carousels with AI assistance'
    },
    {
      icon: Calendar,
      title: 'Smart Scheduling',
      description: 'Schedule posts at optimal times for maximum engagement'
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Track performance and optimize your content strategy'
    },
    {
      icon: Zap,
      title: 'Automation',
      description: 'Automate your LinkedIn presence while maintaining authenticity'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="p-3 bg-blue-600 rounded-xl">
                <Linkedin className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900">LinkedIn AI</h1>
            </div>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Transform your LinkedIn presence with AI-powered content creation, 
              smart scheduling, and advanced analytics.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Features */}
            <div className="space-y-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                Supercharge Your LinkedIn Strategy
              </h2>
              
              <div className="space-y-6">
                {features.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <div key={feature.title} className="flex items-start space-x-4">
                      <div className="p-3 bg-blue-100 rounded-lg flex-shrink-0">
                        <Icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-gray-600">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Login Card */}
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Get Started Today
                </h3>
                <p className="text-gray-600">
                  Connect your LinkedIn account to begin optimizing your content strategy
                </p>
              </div>

              <button
                onClick={signInWithLinkedIn}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Linkedin className="w-5 h-5" />
                <span>
                  {loading ? 'Connecting...' : 'Continue with LinkedIn'}
                </span>
              </button>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                  By continuing, you agree to our Terms of Service and Privacy Policy
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">10K+</div>
                    <div className="text-xs text-gray-500">Posts Generated</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">85%</div>
                    <div className="text-xs text-gray-500">Engagement Boost</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">500+</div>
                    <div className="text-xs text-gray-500">Active Users</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 text-center">
            <p className="text-gray-500 mb-6">Trusted by professionals at</p>
            <div className="flex items-center justify-center space-x-8 opacity-60">
              <div className="text-lg font-semibold text-gray-400">Microsoft</div>
              <div className="text-lg font-semibold text-gray-400">Google</div>
              <div className="text-lg font-semibold text-gray-400">Amazon</div>
              <div className="text-lg font-semibold text-gray-400">Meta</div>
              <div className="text-lg font-semibold text-gray-400">Apple</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};