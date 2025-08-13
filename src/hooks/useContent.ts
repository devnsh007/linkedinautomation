import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

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

  useEffect(() => {
    if (user) {
      fetchPosts();
    }
  }, [user]);

  const fetchPosts = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('content_posts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (postData: Omit<ContentPost, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('content_posts')
        .insert([{
          ...postData,
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
      // This would integrate with LinkedIn API
      const response = await fetch('/api/posts/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: id })
      });

      if (!response.ok) throw new Error('Failed to publish post');
      
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
    createPost,
    updatePost,
    deletePost,
    schedulePost,
    publishPost,
    refetch: fetchPosts
  };
};