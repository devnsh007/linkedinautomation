import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface ContentRequest {
  prompt: string;
  contentType: 'post' | 'article' | 'carousel';
  tone: 'professional' | 'casual' | 'inspirational' | 'educational';
  userProfile?: {
    industry: string;
    position: string;
    interests: string[];
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, contentType, tone, userProfile }: ContentRequest = await req.json();

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Build enhanced prompt based on content type and user profile
    let enhancedPrompt = `Create a ${contentType} for LinkedIn with a ${tone} tone. Topic: ${prompt}`;
    
    if (userProfile) {
      enhancedPrompt += ` The author works in ${userProfile.industry} as a ${userProfile.position}.`;
      if (userProfile.interests.length > 0) {
        enhancedPrompt += ` Their interests include: ${userProfile.interests.join(', ')}.`;
      }
    }

    // Add specific instructions based on content type
    switch (contentType) {
      case 'post':
        enhancedPrompt += ' Create a concise, engaging post (under 300 words) that encourages interaction. Include relevant hashtags and a call-to-action.';
        break;
      case 'article':
        enhancedPrompt += ' Write a comprehensive article (800-1200 words) with clear sections, actionable insights, and professional formatting. Include an engaging introduction and conclusion.';
        break;
      case 'carousel':
        enhancedPrompt += ' Structure as 5-7 slides for a LinkedIn carousel. Each slide should have a clear, digestible point with engaging visuals in mind. Format as "Slide 1: [Title]\\n[Content]\\n\\nSlide 2: [Title]\\n[Content]" etc.';
        break;
    }

    enhancedPrompt += ' Return the response in JSON format with fields: title, content, hashtags (array), and estimatedEngagement (number 1-10).';

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a LinkedIn content expert who creates engaging, professional content that drives meaningful engagement. Always respond with valid JSON.'
          },
          {
            role: 'user',
            content: enhancedPrompt
          }
        ],
        max_tokens: contentType === 'article' ? 2000 : 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;

    // Parse the JSON response from OpenAI
    let parsedContent;
    try {
      parsedContent = JSON.parse(generatedContent);
    } catch (parseError) {
      // Fallback if OpenAI doesn't return valid JSON
      parsedContent = {
        title: `${contentType.charAt(0).toUpperCase() + contentType.slice(1)} about ${prompt}`,
        content: generatedContent,
        hashtags: extractHashtags(prompt),
        estimatedEngagement: Math.floor(Math.random() * 5) + 5 // Random 5-10
      };
    }

    return new Response(
      JSON.stringify(parsedContent),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Content generation error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function extractHashtags(topic: string): string[] {
  const words = topic.toLowerCase().split(' ');
  const hashtags = words
    .filter(word => word.length > 3)
    .map(word => `#${word.charAt(0).toUpperCase() + word.slice(1)}`)
    .slice(0, 5);
  
  // Add some common professional hashtags
  hashtags.push('#LinkedIn', '#Professional', '#Growth');
  
  return [...new Set(hashtags)]; // Remove duplicates
}