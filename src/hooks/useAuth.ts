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
        // Check if Supabase is properly configured
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !supabaseKey) {
          console.log('Supabase not configured, skipping session load');
          setUser(null);
          setLoading(false);
          return;
        }

        console.log('Supabase configured, attempting to get session...');
        
        // Add timeout to prevent hanging
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Session load timeout')), 10000)
        );

        const { data: { session }, error } = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]) as any;

        if (error) {
          console.error('Session load error:', error);
          setUser(null);
        } else {
          console.log('Session loaded:', { hasSession: !!session, user: !!session?.user });
          setUser(session?.user ?? null);
        }
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
    
    // Only set up listener if Supabase is configured
    let subscription: any = null;
    
    if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
      try {
        const { data } = supabase.auth.onAuthStateChange(
          async (_event, session) => {
            console.log('Auth state changed:', { event: _event, hasSession: !!session });
            setUser(session?.user ?? null);
            setLoading(false);

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
                } else {
                  console.log('No profile data found');
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
        subscription = data.subscription;
        console.log('Auth state listener set up successfully');
      } catch (error) {
        console.error('Failed to set up auth listener:', error);
        setLoading(false);
      }
    } else {
      console.log('Skipping auth listener setup - Supabase not configured');
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe();
        console.log('Auth listener unsubscribed');
      }
    };
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