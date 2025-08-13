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
    const { postId } = await req.json();
    
    if (!postId) {
      throw new Error('Post ID is required');
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get post and user data
    const { data: postData, error: postError } = await supabase
      .from('content_posts')
      .select(`
        *,
        users (
          linkedin_access_token,
          linkedin_id
        )
      `)
      .eq('id', postId)
      .single();

    if (postError || !postData) {
      throw new Error('Post not found');
    }

    const accessToken = postData.users.linkedin_access_token;
    const linkedinId = postData.users.linkedin_id;

    if (!accessToken) {
      throw new Error('LinkedIn access token not found');
    }

    // Prepare LinkedIn post data
    const postPayload = {
      author: `urn:li:person:${linkedinId}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: postData.content
          },
          shareMediaCategory: 'NONE'
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    };

    // Publish to LinkedIn
    const linkedinResponse = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0'
      },
      body: JSON.stringify(postPayload)
    });

    if (!linkedinResponse.ok) {
      const errorText = await linkedinResponse.text();
      throw new Error(`LinkedIn API error: ${errorText}`);
    }

    const linkedinData = await linkedinResponse.json();
    const linkedinPostId = linkedinData.id;

    // Update post status in database
    const { error: updateError } = await supabase
      .from('content_posts')
      .update({
        status: 'published',
        published_at: new Date().toISOString(),
        linkedin_post_id: linkedinPostId,
        updated_at: new Date().toISOString()
      })
      .eq('id', postId);

    if (updateError) {
      console.error('Error updating post status:', updateError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        linkedinPostId: linkedinPostId,
        message: 'Post published successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Publishing error:', error);
    
    // Update post status to failed if we have the postId
    const { postId } = await req.json().catch(() => ({}));
    if (postId) {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );
      
      await supabase
        .from('content_posts')
        .update({
          status: 'failed',
          updated_at: new Date().toISOString()
        })
        .eq('id', postId);
    }

    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});