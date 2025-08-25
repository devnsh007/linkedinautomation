import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
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

      // Call Supabase Edge Function with proper error handling
      const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/linkedin-auth`;
      console.log('Calling edge function:', functionUrl);
      
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          code,
          redirect_uri: import.meta.env.VITE_LINKEDIN_REDIRECT_URI
        })
      });

      console.log('Edge function response status:', response.status);
      console.log('Edge function response headers:', Object.fromEntries(response.headers.entries()));
      
      const responseText = await response.text();
      console.log('Edge function response text:', responseText);

      if (!response.ok) {
        const errorData = JSON.parse(responseText);
        if (errorData.message && errorData.setup_instructions) {
          throw new Error(`${errorData.message}\n\nSetup required: ${errorData.setup_instructions}`);
        }
        throw new Error(`Token exchange failed: ${responseText}`);
      }

      const responseData = JSON.parse(responseText);
      const { access_token, refresh_token, user_data } = responseData;
      if (!access_token) throw new Error('No access token received from LinkedIn');

      setStatus('Fetching LinkedIn profile...');
      
      // Profile data is already included in the response from our edge function
      const profileData = {
        id: user_data.id,
        firstName: user_data.firstName,
        lastName: user_data.lastName,
        email: user_data.email
      };

      setStatus('Signing in/up user...');

      // Try to sign in
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: user_data.email,
        password: user_data.id // LinkedIn ID as password (simple, can be changed)
      });

      if (authError && authError.message.includes('Invalid login credentials')) {
        // Sign up new user
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: user_data.email,
          password: user_data.id,
          options: {
            data: {
              linkedin_id: user_data.id,
              full_name: `${user_data.firstName} ${user_data.lastName}`
            }
          }
        });
        if (signUpError) throw signUpError;
        
        // For new signups, we need to sign in manually
        if (signUpData.user && !signUpData.session) {
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: user_data.email,
            password: user_data.id
          });
          if (signInError) throw signInError;
        }
      } else if (authError) {
        throw authError;
      }

      // The edge function already stored the user data, so we just need to set the profile
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
