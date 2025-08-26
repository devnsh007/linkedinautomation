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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('useAuthProvider useEffect triggered');
    
    // Check if Supabase is configured
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.warn('Supabase not configured - running in demo mode');
      setLoading(false);
      return;
    }

    console.log('Loading initial session...');
    
    // Load initial session with timeout
    const loadSession = async () => {
      try {
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session load timeout')), 3000)
        );

        const { data: { session }, error } = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]) as any;

        if (error) throw error;

        if (session?.user) {
          console.log('Session found, loading profile...');
          await loadUserProfile(session.user.id);
        } else {
          console.log('No session found');
        }
      } catch (error) {
        console.warn('Supabase connection failed:', error);
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
    const clientId = import.meta.env.VITE_LINKEDIN_CLIENT_ID;
    const redirectUri = import.meta.env.VITE_LINKEDIN_REDIRECT_URI;
    
    if (!clientId || !redirectUri) {
      console.error('LinkedIn OAuth not configured');
      return;
    }

    const scope = 'openid profile email w_member_social';
    const state = Math.random().toString(36).substring(2, 15);
    
    const linkedinUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&state=${state}`;
    
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

  const value = {
    user,
    loading,
    signInWithLinkedIn,
    signOut
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