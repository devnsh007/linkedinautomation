import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './components/AuthProvider';
import { LoginPage } from './components/LoginPage';
import { LinkedInCallback } from './components/LinkedInCallback';
import { useAuth } from './hooks/useAuth';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { ContentGenerator } from './components/ContentGenerator';
import { ContentCalendar } from './components/ContentCalendar';
import { Analytics } from './components/Analytics';
import { ProfileAnalysis } from './components/ProfileAnalysis';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [activeView, setActiveView] = useState<'dashboard' | 'profile' | 'generator' | 'calendar' | 'analytics'>('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'profile':
        return <ProfileAnalysis />;
      case 'generator':
        return <ContentGenerator />;
      case 'calendar':
        return <ContentCalendar />;
      case 'analytics':
        return <Analytics />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      <main className="flex-1 ml-64 p-6">
        {renderActiveView()}
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/linkedin/callback" element={<LinkedInCallback />} />
          <Route path="/dashboard" element={<AppContent />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;