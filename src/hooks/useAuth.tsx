import { useState, useEffect, useContext, createContext } from 'react';
import { supabase } from '../lib/supabase';

interface User {
  id: string;
  email: string;
  linkedin_id?: string;
  profile_data?: any;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithLinkedIn: () => void;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('useAuthProvider useEffect triggered');
    
    console.log('Initializing authentication...');
    
    // Load initial session with timeout
    const loadSession = async () => {
      try {
        console.log('Getting session from Supabase...');
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) throw error;

        if (session?.user) {
          console.log('Session found, loading profile...');
          await loadUserProfile(session.user.id);
        } else {
          console.log('No session found');
        }
      } catch (error) {
        console.error('Authentication initialization failed:', error);
        throw error;
      } finally {
        setLoading(false);
        console.log('Setting loading to false');
      }
    };

    loadSession();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, !!session);
        
        if (session?.user) {
          await loadUserProfile(session.user.id);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    console.log('Auth state listener set up successfully');

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      const profilePromise = supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Profile load timeout')), 3000)
      );

      const { data, error } = await Promise.race([
        profilePromise,
        timeoutPromise
      ]) as any;

      if (error) throw error;
      
      setUser(data);
      console.log('User profile loaded:', data);
    } catch (error) {
      console.warn('Failed to load user profile:', error);
      // Create a basic user object from auth
      setUser({
        id: userId,
        email: 'demo@example.com'
      });
    }
  };

  const signInWithLinkedIn = () => {
    console.log('Starting LinkedIn OAuth flow');
    const clientId = import.meta.env.VITE_LINKEDIN_CLIENT_ID;
    const redirectUri = import.meta.env.VITE_LINKEDIN_REDIRECT_URI;
    
    if (!clientId || !redirectUri) {
      console.error('LinkedIn OAuth not configured', { clientId: !!clientId, redirectUri: !!redirectUri });
      alert('LinkedIn OAuth is not configured. Please set up your environment variables.');
      return;
    }

    const scope = 'openid profile email w_member_social';
    const state = Math.random().toString(36).substring(2, 15);
    
    console.log('Generated OAuth state:', state);
    // Store state in sessionStorage for CSRF protection
    sessionStorage.setItem('linkedin_oauth_state', state);
    
    const linkedinUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&state=${state}`;
    
    console.log('Redirecting to LinkedIn:', linkedinUrl);
    window.location.href = linkedinUrl;
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Add function to update LinkedIn profile
  const setLinkedInProfile = (profile: any) => {
    console.log('Setting LinkedIn profile:', profile);
    setUser(prev => prev ? { ...prev, ...profile } : null);
  };

  const value = {
    user,
    loading,
    signInWithLinkedIn,
    signOut,
    setLinkedInProfile
  };

  console.log('useAuthProvider returning:', { user: !!user, loading });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}