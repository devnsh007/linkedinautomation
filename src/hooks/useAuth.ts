import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithLinkedIn: () => void;
  signOut: () => Promise<void>;
  linkedInProfile: any;
  setLinkedInProfile: (profile: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useAuthProvider = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [linkedInProfile, setLinkedInProfile] = useState<any>(null);

  console.log('useAuthProvider hook initialized');

  useEffect(() => {
    console.log('useAuthProvider useEffect triggered');
    // Load initial session
    const loadSession = async () => {
      console.log('Loading initial session...');
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Session loaded:', { hasSession: !!session, user: !!session?.user });
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Supabase connection failed:', error);
        setUser(null);
      } finally {
        console.log('Setting loading to false');
        setLoading(false);
      }
    };

    loadSession();

    // Listen for auth state changes
    console.log('Setting up auth state listener');
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        console.log('Auth state changed:', { event: _event, hasSession: !!session });
        setUser(session?.user ?? null);

        try {
          if (session?.user) {
            console.log('User session found, loading profile data');
            const { data: userData } = await supabase
              .from('users')
              .select('profile_data')
              .eq('id', session.user.id)
              .single();

            if (userData?.profile_data) {
              console.log('Profile data loaded');
              setLinkedInProfile(userData.profile_data);
            }
          } else {
            console.log('No user session, clearing profile');
            setLinkedInProfile(null);
          }
        } catch (error) {
          console.error('Error loading profile data:', error);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signInWithLinkedIn = () => {
    console.log('signInWithLinkedIn called');
    const clientId = import.meta.env.VITE_LINKEDIN_CLIENT_ID;
    const redirectUri = import.meta.env.VITE_LINKEDIN_REDIRECT_URI;

    console.log('LinkedIn OAuth config:', { 
      hasClientId: !!clientId, 
      hasRedirectUri: !!redirectUri,
      clientId,
      redirectUri 
    });

    if (!clientId || !redirectUri) {
      console.error('Missing LinkedIn OAuth configuration');
      alert('LinkedIn authentication is not properly configured. Please check your environment variables.');
      return;
    }

    // Correct LinkedIn scopes (must be space-separated, not comma-separated)
    // openid, profile, email: for identity
    // w_member_social: to post, comment, react on behalf of the user
    const scope = 'openid profile email w_member_social';

    const state = crypto.randomUUID(); // for CSRF protection

    // Save state for callback verification
    sessionStorage.setItem('linkedin_oauth_state', state);

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: redirectUri,
      scope,
      state
    });

    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
    console.log('Redirecting to LinkedIn OAuth:', authUrl);

    // Full-page redirect (avoids popup blocking)
    window.location.href = authUrl;
  };

  const signOut = async () => {
    console.log('Signing out user');
    await supabase.auth.signOut();
    setLinkedInProfile(null);
  };

  console.log('useAuthProvider returning:', { user: !!user, loading, hasProfile: !!linkedInProfile });

  return {
    user,
    loading,
    signInWithLinkedIn,
    signOut,
    linkedInProfile,
    setLinkedInProfile,
  };
};

export { AuthContext };