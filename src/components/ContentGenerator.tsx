import React, { useState } from "react";
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
  TrendingUp,
} from "lucide-react";
import { useAuth } from '../hooks/useAuth';

export const ContentGenerator: React.FC = () => {
  const { user } = useAuth();
  const [contentType, setContentType] = useState<
    "post" | "article" | "carousel"
  >("post");
  const [tone, setTone] = useState<
    "professional" | "casual" | "inspirational" | "educational"
  >("professional");
  const [topic, setTopic] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedData, setGeneratedData] = useState<any>(null);

  const contentTypes = [
    {
      id: "post",
      label: "Short Post",
      icon: FileText,
      description: "Quick updates and insights",
    },
    {
      id: "article",
      label: "Long Article",
      icon: Image,
      description: "In-depth thought leadership",
    },
    {
      id: "carousel",
      label: "Carousel",
      icon: Video,
      description: "Multi-slide visual content",
    },
  ];

  const toneOptions = [
    { id: "professional", label: "Professional", color: "blue" },
    { id: "casual", label: "Casual", color: "green" },
    { id: "inspirational", label: "Inspirational", color: "purple" },
    { id: "educational", label: "Educational", color: "orange" },
  ];

  const trendingTopics = [
    "AI in Marketing",
    "Remote Work Culture",
    "Leadership in 2025",
    "Digital Transformation",
    "Startup Growth",
    "Team Collaboration",
  ];

  const handleGenerate = async () => {
    if (!topic.trim()) return;

    setIsGenerating(true);
    setGeneratedContent("");
    setGeneratedData(null);

    try {
      console.log('Calling content generator function...');
      
      const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/content-generator`;
      
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          topic,
          contentType,
          tone
        })
      });

      console.log('Content generator response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Content generator error:', errorText);
        throw new Error(`Content generation failed: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Generated content received:', data);
      
      setGeneratedData(data);
      setGeneratedContent(data.content || 'No content generated');
      
    } catch (error: any) {
      console.error('Content generation error:', error);
      setGeneratedContent(`❌ Failed to generate content: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent);
  };
  
  const saveAsDraft = async () => {
    if (!generatedData || !user) return;
    
    try {
      // You can implement saving to Supabase here
      console.log('Saving as draft...', generatedData);
      alert('Draft saved successfully!');
    } catch (error) {
      console.error('Error saving draft:', error);
      alert('Failed to save draft');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Content Generator
          </h1>
          <p className="text-gray-600 mt-1">
            Create engaging LinkedIn content powered by AI.
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Content Type */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Content Type
            </h3>
            <div className="space-y-3">
              {contentTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => setContentType(type.id as any)}
                    className={`w-full p-4 rounded-lg border text-left transition-all duration-200 ${
                      contentType === type.id
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="w-5 h-5" />
                      <div>
                        <p className="font-medium">{type.label}</p>
                        <p className="text-sm text-gray-600">
                          {type.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tone & Style */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Tone & Style
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {toneOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setTone(option.id as any)}
                  className={`p-3 rounded-lg text-center transition-all duration-200 ${
                    tone === option.id
                      ? `bg-${option.color}-100 text-${option.color}-700 border border-${option.color}-300`
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <span className="font-medium text-sm">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Trending Topics */}
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

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Input */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Content Input
              </h3>
              <Settings className="w-4 h-4 text-gray-400" />
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

          {/* Output */}
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

              {generatedData && (
                <div className="bg-blue-50 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Title:</span>
                      <p className="text-gray-900">{generatedData.title}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Est. Engagement:</span>
                      <p className="text-gray-900">{generatedData.estimatedEngagement}/10</p>
                    </div>
                    <div className="col-span-2">
                      <span className="font-medium text-gray-700">Hashtags:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {generatedData.hashtags?.map((hashtag: string, index: number) => (
                          <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                            {hashtag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {generatedContent.length} characters
                </div>
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={saveAsDraft}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                  >
                    Save as Draft
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
