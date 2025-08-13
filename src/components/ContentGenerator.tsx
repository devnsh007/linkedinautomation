import React, { useState } from 'react';
import { 
  Wand2, 
  FileText, 
  Image, 
  Video, 
  RefreshCw,
  Copy,
  Calendar,
  Settings,
  Sparkles,
  TrendingUp
} from 'lucide-react';

export const ContentGenerator: React.FC = () => {
  const [contentType, setContentType] = useState<'post' | 'article' | 'carousel'>('post');
  const [tone, setTone] = useState<'professional' | 'casual' | 'inspirational' | 'educational'>('professional');
  const [topic, setTopic] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const contentTypes = [
    { id: 'post', label: 'Short Post', icon: FileText, description: 'Quick updates and insights' },
    { id: 'article', label: 'Long Article', icon: Image, description: 'In-depth thought leadership' },
    { id: 'carousel', label: 'Carousel', icon: Video, description: 'Multi-slide visual content' }
  ];

  const toneOptions = [
    { id: 'professional', label: 'Professional', color: 'blue' },
    { id: 'casual', label: 'Casual', color: 'green' },
    { id: 'inspirational', label: 'Inspirational', color: 'purple' },
    { id: 'educational', label: 'Educational', color: 'orange' }
  ];

  const trendingTopics = [
    'AI in Marketing',
    'Remote Work Culture',
    'Leadership in 2025',
    'Digital Transformation',
    'Startup Growth',
    'Team Collaboration'
  ];

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    
    setIsGenerating(true);
    
    // Simulate AI generation delay
    setTimeout(() => {
      const sampleContent = {
        post: `🚀 Just had an incredible breakthrough in ${topic}!\n\nAfter months of research and experimentation, I've discovered that the key to success lies in understanding your audience's true needs.\n\nHere are 3 actionable insights I've learned:\n\n✅ Focus on value, not features\n✅ Listen before you speak\n✅ Iterate based on feedback\n\nWhat's your experience with ${topic}? I'd love to hear your thoughts in the comments!\n\n#Innovation #Growth #${topic.replace(/\s+/g, '')}`,
        article: `# The Future of ${topic}: A Comprehensive Analysis\n\nIn today's rapidly evolving business landscape, ${topic} has become more crucial than ever. As leaders and professionals, we need to understand not just what's happening now, but where we're heading.\n\n## Current State of ${topic}\n\nThe industry has seen unprecedented changes over the past few years. Companies that adapt quickly are the ones that thrive.\n\n## Key Trends to Watch\n\n1. **Technology Integration** - AI and automation are reshaping how we approach ${topic}\n2. **Human-Centric Approach** - Despite technological advances, the human element remains crucial\n3. **Sustainability Focus** - Environmental and social responsibility are becoming non-negotiable\n\n## Actionable Strategies\n\nBased on current data and market analysis, here are proven strategies that work:\n\n- Start with customer research\n- Invest in your team's development\n- Embrace data-driven decision making\n- Foster a culture of innovation\n\nThe future belongs to those who prepare for it today. What steps are you taking in your ${topic} strategy?\n\n#ThoughtLeadership #${topic.replace(/\s+/g, '')} #Innovation`,
        carousel: `Slide 1: "5 Game-Changing Tips for ${topic}"\n\nSlide 2: "Tip #1: Start with Why\nBefore diving into ${topic}, understand your core motivation and goals."\n\nSlide 3: "Tip #2: Research Your Market\nKnow your audience, competitors, and industry trends inside out."\n\nSlide 4: "Tip #3: Build Strong Relationships\nNetworking and partnerships are crucial for success in ${topic}."\n\nSlide 5: "Tip #4: Measure and Optimize\nTrack your progress and adjust your strategy based on data."\n\nSlide 6: "Tip #5: Stay Consistent\nConsistency beats perfection every time in ${topic}."\n\nSlide 7: "Ready to Transform Your ${topic} Strategy?\nSave this post and start implementing these tips today!\n\n#${topic.replace(/\s+/g, '')} #Tips #Growth"`
      };
      
      setGeneratedContent(sampleContent[contentType]);
      setIsGenerating(false);
    }, 2000);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Content Generator</h1>
          <p className="text-gray-600 mt-1">Create engaging LinkedIn content powered by AI.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Type</h3>
            <div className="space-y-3">
              {contentTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => setContentType(type.id as any)}
                    className={`w-full p-4 rounded-lg border text-left transition-all duration-200 ${
                      contentType === type.id
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="w-5 h-5" />
                      <div>
                        <p className="font-medium">{type.label}</p>
                        <p className="text-sm text-gray-600">{type.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tone & Style</h3>
            <div className="grid grid-cols-2 gap-2">
              {toneOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setTone(option.id as any)}
                  className={`p-3 rounded-lg text-center transition-all duration-200 ${
                    tone === option.id
                      ? `bg-${option.color}-100 text-${option.color}-700 border border-${option.color}-300`
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="font-medium text-sm">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Trending Topics
            </h3>
            <div className="space-y-2">
              {trendingTopics.map((trendingTopic) => (
                <button
                  key={trendingTopic}
                  onClick={() => setTopic(trendingTopic)}
                  className="w-full text-left px-3 py-2 text-sm bg-gray-50 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200"
                >
                  {trendingTopic}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Content Input</h3>
              <div className="flex items-center space-x-2">
                <Settings className="w-4 h-4 text-gray-400" />
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Topic or Keywords
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Leadership, Digital Marketing, Startup Growth"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                />
              </div>
              
              <button
                onClick={handleGenerate}
                disabled={!topic.trim() || isGenerating}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    <span>Generate Content</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {generatedContent && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Sparkles className="w-5 h-5 mr-2 text-yellow-500" />
                  Generated Content
                </h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={copyToClipboard}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                    title="Copy to clipboard"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleGenerate}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                    title="Regenerate"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono leading-relaxed">
                  {generatedContent}
                </pre>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {generatedContent.length} characters
                </div>
                <div className="flex items-center space-x-3">
                  <button className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200">
                    Edit
                  </button>
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>Schedule Post</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};