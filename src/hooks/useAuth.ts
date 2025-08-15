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

  useEffect(() => {
    // Load initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);

        if (session?.user) {
          const { data: userData } = await supabase
            .from('users')
            .select('profile_data')
            .eq('id', session.user.id)
            .single();

          if (userData?.profile_data) {
            setLinkedInProfile(userData.profile_data);
          }
        } else {
          setLinkedInProfile(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signInWithLinkedIn = () => {
    const clientId = import.meta.env.VITE_LINKEDIN_CLIENT_ID;
    const redirectUri = import.meta.env.VITE_LINKEDIN_REDIRECT_URI;

    // Correct LinkedIn scopes (must be space-separated, not comma-separated)
    // openid, profile, email: for identity
    // w_member_social: to post, comment, react on behalf of the user
    const scope = 'openid profile email ';

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
    console.log('LinkedIn Auth URL:', authUrl);
    console.log('Client ID:', clientId);
    console.log('Redirect URI:', redirectUri);
    console.log('Scope:', scope);

    // Full-page redirect (avoids popup blocking)
    window.location.href = authUrl;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setLinkedInProfile(null);
  };

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
