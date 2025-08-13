import axios from 'axios';

export interface ContentGenerationRequest {
  topic: string;
  contentType: 'post' | 'article' | 'carousel';
  tone: 'professional' | 'casual' | 'inspirational' | 'educational';
  userProfile?: {
    industry: string;
    position: string;
    interests: string[];
  };
  trendingTopics?: string[];
}

export interface GeneratedContent {
  title: string;
  content: string;
  hashtags: string[];
  estimatedEngagement: number;
}

export class OpenAIService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateContent(request: ContentGenerationRequest): Promise<GeneratedContent> {
    try {
      const prompt = this.buildPrompt(request);
      
      const response = await axios.post('/api/content/generate', {
        prompt,
        contentType: request.contentType,
        tone: request.tone
      });

      return response.data;
    } catch (error) {
      console.error('Error generating content:', error);
      throw new Error('Failed to generate content');
    }
  }

  async analyzeProfile(profileData: any): Promise<{
    strengths: Array<{ category: string; score: number; description: string }>;
    improvements: Array<{ area: string; impact: string; suggestion: string }>;
    contentSuggestions: string[];
  }> {
    try {
      const response = await axios.post('/api/profile/analyze', {
        profileData
      });

      return response.data;
    } catch (error) {
      console.error('Error analyzing profile:', error);
      throw new Error('Failed to analyze profile');
    }
  }

  private buildPrompt(request: ContentGenerationRequest): string {
    const { topic, contentType, tone, userProfile, trendingTopics } = request;
    
    let prompt = `Generate a ${contentType} for LinkedIn with a ${tone} tone about "${topic}".`;
    
    if (userProfile) {
      prompt += ` The author works in ${userProfile.industry} as a ${userProfile.position}.`;
    }
    
    if (trendingTopics && trendingTopics.length > 0) {
      prompt += ` Consider incorporating these trending topics: ${trendingTopics.join(', ')}.`;
    }
    
    switch (contentType) {
      case 'post':
        prompt += ' Keep it concise (under 300 words), engaging, and include relevant hashtags.';
        break;
      case 'article':
        prompt += ' Create a comprehensive article (800-1200 words) with clear sections and actionable insights.';
        break;
      case 'carousel':
        prompt += ' Structure as 5-7 slides with clear, digestible points for each slide.';
        break;
    }
    
    prompt += ' Include suggested hashtags and estimate potential engagement level.';
    
    return prompt;
  }
}