import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export interface AnalyticsData {
  totalImpressions: number;
  totalEngagements: number;
  averageEngagementRate: number;
  topPerformingPosts: Array<{
    id: string;
    title: string;
    content: string;
    impressions: number;
    likes: number;
    comments: number;
    shares: number;
    engagement_rate: number;
    published_at: string;
  }>;
  engagementTrends: Array<{
    date: string;
    impressions: number;
    engagements: number;
    posts: number;
  }>;
  audienceInsights: Array<{
    category: string;
    percentage: number;
  }>;
}

export const useAnalytics = (timeRange: '30d' | '90d' | '6m' | '1y' = '30d') => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user, timeRange]);

  const fetchAnalytics = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      
      switch (timeRange) {
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
        case '6m':
          startDate.setMonth(endDate.getMonth() - 6);
          break;
        case '1y':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
      }

      // Fetch analytics data
      const { data: metricsData, error: metricsError } = await supabase
        .from('analytics_metrics')
        .select(`
          *,
          content_posts (
            id,
            title,
            content,
            published_at
          )
        `)
        .eq('user_id', user.id)
        .gte('recorded_at', startDate.toISOString())
        .lte('recorded_at', endDate.toISOString());

      if (metricsError) throw metricsError;

      // Process the data
      const processedData = processAnalyticsData(metricsData || []);
      setAnalytics(processedData);
      
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const processAnalyticsData = (rawData: any[]): AnalyticsData => {
    const totalImpressions = rawData.reduce((sum, item) => sum + (item.impressions || 0), 0);
    const totalEngagements = rawData.reduce((sum, item) => 
      sum + (item.likes || 0) + (item.comments || 0) + (item.shares || 0), 0
    );
    const averageEngagementRate = rawData.length > 0 
      ? rawData.reduce((sum, item) => sum + (item.engagement_rate || 0), 0) / rawData.length
      : 0;

    // Top performing posts
    const topPerformingPosts = rawData
      .sort((a, b) => (b.engagement_rate || 0) - (a.engagement_rate || 0))
      .slice(0, 5)
      .map(item => ({
        id: item.post_id,
        title: item.content_posts?.title || 'Untitled',
        content: item.content_posts?.content || '',
        impressions: item.impressions || 0,
        likes: item.likes || 0,
        comments: item.comments || 0,
        shares: item.shares || 0,
        engagement_rate: item.engagement_rate || 0,
        published_at: item.content_posts?.published_at || item.recorded_at
      }));

    // Engagement trends (group by week/month depending on time range)
    const engagementTrends = groupDataByPeriod(rawData, timeRange);

    // Mock audience insights (would come from LinkedIn API in production)
    const audienceInsights = [
      { category: 'Marketing Professionals', percentage: 35 },
      { category: 'Tech Executives', percentage: 28 },
      { category: 'Startup Founders', percentage: 22 },
      { category: 'Consultants', percentage: 15 }
    ];

    return {
      totalImpressions,
      totalEngagements,
      averageEngagementRate,
      topPerformingPosts,
      engagementTrends,
      audienceInsights
    };
  };

  const groupDataByPeriod = (data: any[], period: string) => {
    // Group data by appropriate time periods
    const grouped: { [key: string]: any } = {};
    
    data.forEach(item => {
      const date = new Date(item.recorded_at);
      let key: string;
      
      if (period === '30d') {
        // Group by day
        key = date.toISOString().split('T')[0];
      } else if (period === '90d') {
        // Group by week
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
      } else {
        // Group by month
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }
      
      if (!grouped[key]) {
        grouped[key] = {
          date: key,
          impressions: 0,
          engagements: 0,
          posts: new Set()
        };
      }
      
      grouped[key].impressions += item.impressions || 0;
      grouped[key].engagements += (item.likes || 0) + (item.comments || 0) + (item.shares || 0);
      grouped[key].posts.add(item.post_id);
    });
    
    return Object.values(grouped).map((item: any) => ({
      ...item,
      posts: item.posts.size
    }));
  };

  const refreshAnalytics = async () => {
    // Trigger analytics refresh from LinkedIn API
    try {
      await fetch('/api/analytics/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      // Refetch local data
      await fetchAnalytics();
    } catch (error) {
      console.error('Error refreshing analytics:', error);
    }
  };

  return {
    analytics,
    loading,
    refreshAnalytics,
    refetch: fetchAnalytics
  };
};