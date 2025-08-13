import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { LinkedInAPI } from '../lib/linkedin';
import { useAuth } from '../hooks/useAuth';

export const LinkedInCallback: React.FC = () => {
  const navigate = useNavigate();
  const { setLinkedInProfile } = useAuth();
  const [status, setStatus] = useState('Processing LinkedIn authentication...');

  useEffect(() => {
    handleLinkedInCallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLinkedInCallback = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const error = urlParams.get('error');
      const state = urlParams.get('state');

      if (error) {
        throw new Error(`LinkedIn OAuth error: ${error}`);
      }
      if (!code) {
        throw new Error('No authorization code received from LinkedIn');
      }

      // Validate CSRF state
      const storedState = sessionStorage.getItem('linkedin_oauth_state');
      if (!state || state !== storedState) {
        throw new Error('Invalid or missing OAuth state (possible CSRF attack)');
      }

      setStatus('Exchanging authorization code for token...');

      // Call your Supabase Edge Function or backend API
      const response = await fetch('/api/auth/linkedin/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          redirect_uri: import.meta.env.VITE_LINKEDIN_REDIRECT_URI
        })
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Token exchange failed: ${text}`);
      }

      const { access_token, refresh_token, user_data } = await response.json();
      if (!access_token) throw new Error('No access token received from LinkedIn');

      setStatus('Fetching LinkedIn profile...');
      const linkedInAPI = new LinkedInAPI(access_token);
      const profileData = await linkedInAPI.getProfile();

      setStatus('Signing in/up user...');

      // Try to sign in
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: user_data.email,
        password: user_data.id // LinkedIn ID as password (simple, can be changed)
      });

      if (authError && authError.message.includes('Invalid login credentials')) {
        // Sign up new user
        const { error: signUpError } = await supabase.auth.signUp({
          email: user_data.email,
          password: user_data.id,
          options: {
            data: {
              linkedin_id: user_data.id,
              full_name: `${profileData.firstName} ${profileData.lastName}`
            }
          }
        });
        if (signUpError) throw signUpError;
      } else if (authError) {
        throw authError;
      }

      // Store LinkedIn profile + tokens
      const { error: updateError } = await supabase
        .from('users')
        .upsert({
          email: user_data.email,
          linkedin_id: user_data.id,
          linkedin_access_token: access_token,
          linkedin_refresh_token: refresh_token,
          profile_data: profileData,
          updated_at: new Date().toISOString()
        });

      if (updateError) throw updateError;

      setLinkedInProfile(profileData);
      setStatus('Authentication successful! Redirecting...');
      navigate('/dashboard', { replace: true });

    } catch (err) {
      console.error('LinkedIn callback error:', err);
      setStatus(`Authentication failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setTimeout(() => navigate('/login', { replace: true }), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full mx-4">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Connecting to LinkedIn
        </h2>
        <p className="text-gray-600">{status}</p>
      </div>
    </div>
  );
};
