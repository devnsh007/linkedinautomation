import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface ContentRequest {
  topic: string;
  contentType: 'post' | 'article' | 'carousel';
  tone: 'professional' | 'casual' | 'inspirational' | 'educational';
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    });
  }

  try {
    console.log('=== Content Generator Function Started ===');
    
    const { topic, contentType, tone }: ContentRequest = await req.json();
    
    console.log('Request parameters:', { topic, contentType, tone });

    if (!topic || !contentType || !tone) {
      throw new Error('Missing required parameters: topic, contentType, or tone');
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      console.error('OpenAI API key not found in environment');
      throw new Error('OpenAI API key not configured');
    }

    console.log('OpenAI API key found, building prompt...');

    // Build enhanced prompt based on content type
    let systemPrompt = "You are a professional LinkedIn content creator who generates engaging, authentic content that drives meaningful professional engagement.";
    
    let userPrompt = `Create a LinkedIn ${contentType} about "${topic}" with a ${tone} tone.`;
    
    // Add specific instructions based on content type
    switch (contentType) {
      case 'post':
        userPrompt += ` 

Requirements:
- Keep it under 300 words
- Make it engaging and authentic
- Include a hook in the first line
- Add a call-to-action
- Include 3-5 relevant hashtags
- Format for easy reading with line breaks

Structure your response as JSON:
{
  "title": "Brief title for the post",
  "content": "The full post content with proper formatting",
  "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3"],
  "estimatedEngagement": 7
}`;
        break;
        
      case 'article':
        userPrompt += `

Requirements:
- Write 800-1200 words
- Create clear sections with headers
- Include actionable insights
- Add an engaging introduction and strong conclusion
- Include relevant examples
- Add 5-7 strategic hashtags

Structure your response as JSON:
{
  "title": "Compelling article title",
  "content": "Full article with headers and sections",
  "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3", "#hashtag4", "#hashtag5"],
  "estimatedEngagement": 8
}`;
        break;
        
      case 'carousel':
        userPrompt += `

Requirements:
- Create 5-7 slides for LinkedIn carousel
- Each slide should have a clear title and 2-3 bullet points
- Make it visually structured and easy to follow
- Include a strong opening slide and call-to-action on the last slide
- Add relevant hashtags

Format each slide as:
Slide 1: [Title]
• Point 1
• Point 2

Structure your response as JSON:
{
  "title": "Carousel title",
  "content": "All slides formatted as above",
  "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3", "#hashtag4"],
  "estimatedEngagement": 9
}`;
        break;
    }

    console.log('Calling OpenAI API...');

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        max_tokens: contentType === 'article' ? 2000 : 1000,
        temperature: 0.7,
      }),
    });

    console.log('OpenAI response status:', response.status);

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData}`);
    }

    const data = await response.json();
    console.log('OpenAI response received');
    
    const generatedContent = data.choices[0].message.content;
    console.log('Generated content length:', generatedContent.length);

    // Parse the JSON response from OpenAI
    let parsedContent;
    try {
      // Remove any markdown code block formatting if present
      const cleanContent = generatedContent.replace(/```json\n?|\n?```/g, '').trim();
      parsedContent = JSON.parse(cleanContent);
      console.log('Successfully parsed OpenAI response');
    } catch (parseError) {
      console.warn('Failed to parse JSON, creating fallback response');
      // Fallback if OpenAI doesn't return valid JSON
      parsedContent = {
        title: `${contentType.charAt(0).toUpperCase() + contentType.slice(1)} about ${topic}`,
        content: generatedContent,
        hashtags: generateFallbackHashtags(topic),
        estimatedEngagement: Math.floor(Math.random() * 3) + 6 // Random 6-8
      };
    }

    console.log('=== Content Generation Successful ===');

    return new Response(
      JSON.stringify(parsedContent),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('=== Content Generation Error ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    const errorResponse = { 
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      details: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    };
    
    return new Response(
      JSON.stringify(errorResponse),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

function generateFallbackHashtags(topic: string): string[] {
  const words = topic.toLowerCase().split(' ');
  const hashtags = words
    .filter(word => word.length > 3)
    .map(word => `#${word.charAt(0).toUpperCase() + word.slice(1)}`)
    .slice(0, 3);
  
  // Add common professional hashtags
  hashtags.push('#LinkedIn', '#Professional');
  
  return [...new Set(hashtags)]; // Remove duplicates
}