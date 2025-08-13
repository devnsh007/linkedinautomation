import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get all published posts that need analytics updates
    const { data: posts, error: postsError } = await supabase
      .from('content_posts')
      .select(`
        id,
        user_id,
        linkedin_post_id,
        published_at,
        users (
          linkedin_access_token
        )
      `)
      .eq('status', 'published')
      .not('linkedin_post_id', 'is', null);

    if (postsError) {
      throw new Error(`Error fetching posts: ${postsError.message}`);
    }

    const results = [];

    for (const post of posts || []) {
      try {
        const accessToken = post.users.linkedin_access_token;
        
        if (!accessToken) {
          console.log(`No access token for post ${post.id}`);
          continue;
        }

        // Fetch analytics from LinkedIn API
        const analyticsResponse = await fetch(
          `https://api.linkedin.com/v2/socialActions/${post.linkedin_post_id}/statistics`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'X-Restli-Protocol-Version': '2.0.0'
            }
          }
        );

        if (!analyticsResponse.ok) {
          console.log(`Failed to fetch analytics for post ${post.id}: ${analyticsResponse.status}`);
          continue;
        }

        const analyticsData = await analyticsResponse.json();
        
        // Extract metrics (LinkedIn API structure may vary)
        const metrics = {
          impressions: analyticsData.impressions || 0,
          likes: analyticsData.likes || 0,
          comments: analyticsData.comments || 0,
          shares: analyticsData.shares || 0,
          clicks: analyticsData.clicks || 0,
        };

        // Calculate engagement rate
        const totalEngagements = metrics.likes + metrics.comments + metrics.shares;
        const engagementRate = metrics.impressions > 0 
          ? (totalEngagements / metrics.impressions) * 100 
          : 0;

        // Insert or update analytics metrics
        const { error: metricsError } = await supabase
          .from('analytics_metrics')
          .upsert({
            user_id: post.user_id,
            post_id: post.id,
            impressions: metrics.impressions,
            likes: metrics.likes,
            comments: metrics.comments,
            shares: metrics.shares,
            clicks: metrics.clicks,
            engagement_rate: parseFloat(engagementRate.toFixed(2)),
            recorded_at: new Date().toISOString()
          }, {
            onConflict: 'post_id,date_trunc(hour,recorded_at)'
          });

        if (metricsError) {
          console.error(`Error saving metrics for post ${post.id}:`, metricsError);
        } else {
          results.push({
            postId: post.id,
            status: 'success',
            metrics: { ...metrics, engagementRate }
          });
        }

        // Update post's analytics_data cache
        await supabase
          .from('content_posts')
          .update({
            analytics_data: {
              ...metrics,
              engagement_rate: engagementRate,
              last_updated: new Date().toISOString()
            }
          })
          .eq('id', post.id);

      } catch (error) {
        console.error(`Error processing post ${post.id}:`, error);
        results.push({
          postId: post.id,
          status: 'error',
          error: error.message
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: results.length,
        results: results
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Analytics sync error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});