import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

interface ContentPostInsert {
  title: string;
  content: string;
  content_type: 'post' | 'article' | 'carousel';
  tone: string;
  status?: 'draft' | 'scheduled' | 'published' | 'failed';
  hashtags?: string[];
  scheduled_at?: string | null;
  estimated_engagement?: number;
}

export interface ContentPost {
  id: string;
  user_id: string;
  title: string;
  content: string;
  content_type: 'post' | 'article' | 'carousel';
  tone: string;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  scheduled_at: string | null;
  published_at: string | null;
  linkedin_post_id: string | null;
  analytics_data: any;
  created_at: string;
  updated_at: string;
}

export const useContent = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<ContentPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchPosts();
    } else {
      setLoading(false);
      setPosts([]);
    }
  }, [user]);

  const fetchPosts = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('content_posts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
      console.log('Fetched posts:', data?.length || 0);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (postData: ContentPostInsert) => {
    if (!user) return null;

    try {
      console.log('Creating post:', postData);
      const { data, error } = await supabase
        .from('content_posts')
        .insert([{
          ...postData,
          status: postData.status || 'draft',
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;
      
      setPosts(prev => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  };

  const updatePost = async (id: string, updates: Partial<ContentPost>) => {
    try {
      console.log('Updating post:', id, updates);
      const { data, error } = await supabase
        .from('content_posts')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setPosts(prev => prev.map(post => post.id === id ? data : post));
      return data;
    } catch (error) {
      console.error('Error updating post:', error);
      throw error;
    }
  };

  const deletePost = async (id: string) => {
    try {
      console.log('Deleting post:', id);
      const { error } = await supabase
        .from('content_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setPosts(prev => prev.filter(post => post.id !== id));
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  };

  const schedulePost = async (id: string, scheduledAt: string) => {
    return updatePost(id, {
      status: 'scheduled',
      scheduled_at: scheduledAt
    });
  };

  const publishPost = async (id: string) => {
    try {
      console.log('Publishing post:', id);
      
      // Call Supabase Edge Function to publish to LinkedIn
      const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/linkedin-publisher`;
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ postId: id })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to publish post: ${errorText}`);
      }
      
      const { linkedInPostId } = await response.json();
      
      return updatePost(id, {
        status: 'published',
        published_at: new Date().toISOString(),
        linkedin_post_id: linkedInPostId
      });
    } catch (error) {
      console.error('Error publishing post:', error);
      await updatePost(id, { status: 'failed' });
      throw error;
    }
  };

  return {
    posts,
    loading,
    error,
    createPost,
    updatePost,
    deletePost,
    schedulePost,
    publishPost,
    refetch: fetchPosts,
    clearError: () => setError(null)
  };
};