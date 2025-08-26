import React from 'react';
import { Linkedin, Zap, BarChart3, Calendar, PenTool } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { signInWithLinkedIn, loading, user } = useAuth();
  
  console.log('LoginPage render:', { user: !!user, loading });
  
  // If user is already logged in, redirect to dashboard
  if (user && !loading) {
    console.log('User already logged in, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }
  
  // Show loading state while authentication is initializing
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Initializing...</p>
        </div>
      </div>
    );
  }
  
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const linkedinClientId = import.meta.env.VITE_LINKEDIN_CLIENT_ID;
  const linkedinRedirectUri = import.meta.env.VITE_LINKEDIN_REDIRECT_URI;
  
  const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);
  const isLinkedInConfigured = Boolean(linkedinClientId && linkedinRedirectUri);
  
  console.log('LoginPage configuration:', { 
    isSupabaseConfigured, 
    isLinkedInConfigured,
    supabaseUrl: supabaseUrl ? 'configured' : 'missing',
    supabaseKey: supabaseKey ? 'configured' : 'missing',
    linkedinClientId: linkedinClientId ? 'configured' : 'missing',
    linkedinRedirectUri: linkedinRedirectUri ? 'configured' : 'missing'
  });

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

  const handleSignIn = () => {
    console.log('Sign in button clicked');
    if (!isSupabaseConfigured) {
      alert('Supabase is not configured. Please set up your .env file with Supabase credentials.');
      return;
    }
    if (!isLinkedInConfigured) {
      alert('LinkedIn OAuth is not configured. Please set up LinkedIn OAuth credentials.');
      return;
    }
    signInWithLinkedIn();
  };

  // Show setup instructions if not configured
  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto p-8 bg-white rounded-xl shadow-lg">
          <div className="text-center mb-6">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Setup Required</h1>
            <p className="text-gray-600">Configure your environment to get started</p>
          </div>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="font-semibold text-red-800 mb-3">Missing Configuration</h3>
            <div className="space-y-2 text-sm">
              <p className="text-red-700">Create a <code>.env</code> file with:</p>
              <div className="bg-red-100 p-3 rounded font-mono text-xs">
                VITE_SUPABASE_URL=your_supabase_url<br/>
                VITE_SUPABASE_ANON_KEY=your_anon_key<br/>
                VITE_LINKEDIN_CLIENT_ID=your_linkedin_id<br/>
                VITE_LINKEDIN_REDIRECT_URI=http://localhost:5173/auth/linkedin/callback
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => window.location.reload()} 
            className="w-full mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Check Configuration
          </button>
        </div>
      </div>
    );
  }

  return (
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

              {!isSupabaseConfigured && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="text-sm text-yellow-800">
                    <p className="font-semibold mb-2">⚠️ Supabase Configuration Missing</p>
                    <p className="mb-2">The app will run in demo mode. To enable full functionality, add these to your .env file:</p>
                    <code className="block bg-yellow-100 p-2 rounded text-xs">
                      VITE_SUPABASE_URL=your_supabase_url<br/>
                      VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
                    </code>
                  </div>
                </div>
              )}
              
              {isSupabaseConfigured && !isLinkedInConfigured && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-2">🔧 LinkedIn OAuth Setup Required</p>
                    <p className="mb-2">Add these LinkedIn OAuth variables to your .env file:</p>
                    <code className="block bg-blue-100 p-2 rounded text-xs">
                      VITE_LINKEDIN_CLIENT_ID=your_linkedin_client_id<br/>
                      VITE_LINKEDIN_REDIRECT_URI=http://localhost:5173/auth/linkedin/callback
                    </code>
                  </div>
                </div>
              )}
              
              {isSupabaseConfigured && isLinkedInConfigured && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>✅ Configuration Complete</strong> - Ready to connect with LinkedIn!
                  </p>
                </div>
              )}
              
              <button
                onClick={handleSignIn}
                disabled={loading}
                className={`w-full py-4 px-6 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-3 ${
                  loading ? 'opacity-50 cursor-not-allowed' :
                  isLinkedInConfigured
                    ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-0.5' 
                    : 'bg-gray-400 text-white cursor-not-allowed'
                }`}
              >
                <Linkedin className="w-5 h-5" />
                <span>
                  {loading ? 'Connecting...' : 
                   isLinkedInConfigured ? 'Continue with LinkedIn' : 'Setup Required'}
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