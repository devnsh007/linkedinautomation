# 🚀 LinkedIn AI Content Automation Tool

A powerful AI-driven platform that helps professionals create, schedule, and analyze LinkedIn content automatically. Built with React, TypeScript, Supabase, and OpenAI.

![LinkedIn AI Tool](https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=1200&h=400&fit=crop&q=80)

## ✨ Features

### 🤖 AI Content Generation
- **Smart Content Creation**: Generate engaging LinkedIn posts, articles, and carousels using OpenAI GPT-4
- **Multiple Content Types**: Support for short posts, long-form articles, and multi-slide carousels
- **Tone Customization**: Professional, casual, inspirational, and educational tones
- **Hashtag Generation**: Automatically suggests relevant hashtags for better reach
- **Engagement Prediction**: AI-powered engagement score estimation

### 📅 Smart Scheduling
- **Visual Calendar**: Intuitive calendar interface for content planning
- **Optimal Timing**: Schedule posts for maximum engagement
- **Bulk Scheduling**: Plan weeks or months of content in advance
- **Auto-Publishing**: Automated posting to LinkedIn via API

### 📊 Advanced Analytics
- **Performance Tracking**: Monitor impressions, likes, comments, and shares
- **Engagement Insights**: Detailed engagement rate analysis
- **Content Performance**: Track which content types perform best
- **Audience Analytics**: Understand your LinkedIn audience better
- **Trend Analysis**: Identify trending topics and optimal posting times

### 👤 Profile Analysis
- **LinkedIn Integration**: Seamless OAuth login with LinkedIn
- **Profile Optimization**: AI-powered suggestions to improve your profile
- **Content Strategy**: Personalized recommendations based on your industry
- **Competitor Analysis**: Compare your performance with industry benchmarks

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Edge Functions, Auth)
- **AI**: OpenAI GPT-4 API
- **Social**: LinkedIn API v2
- **Deployment**: Cloudflare Pages
- **Build Tool**: Vite

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- LinkedIn Developer App
- OpenAI API key

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/linkedin-ai-automation.git
cd linkedin-ai-automation
npm install
```

### 2. Environment Setup
Create a `.env` file in the root directory:
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# LinkedIn OAuth
VITE_LINKEDIN_CLIENT_ID=your-linkedin-client-id
VITE_LINKEDIN_REDIRECT_URI=http://localhost:5173/auth/linkedin/callback

# OpenAI (set in Supabase Edge Functions)
OPENAI_API_KEY=your-openai-api-key
```

### 3. LinkedIn Developer App Setup
1. Go to [LinkedIn Developer Portal](https://www.linkedin.com/developers/apps)
2. Create a new app or use existing one
3. Add these products:
   - **Sign In with LinkedIn using OpenID Connect**
   - **Share on LinkedIn**
4. Set redirect URI: `http://localhost:5173/auth/linkedin/callback`
5. Note your Client ID and Client Secret

### 4. Supabase Setup
1. Create a new Supabase project
2. Run the database migrations:
```bash
npx supabase migration up
```

3. Deploy Edge Functions:
```bash
npx supabase functions deploy linkedin-auth
npx supabase functions deploy content-generator
npx supabase functions deploy analytics-sync
npx supabase functions deploy linkedin-publisher
```

4. Set environment variables in Supabase Dashboard:
   - Go to Edge Functions → Settings
   - Add `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET`, `OPENAI_API_KEY`

### 5. Run the Application
```bash
npm run dev
```

Visit `http://localhost:5173` to see the app running!

## 📁 Project Structure

```
├── src/
│   ├── components/           # React components
│   │   ├── Dashboard.tsx     # Main dashboard
│   │   ├── ContentGenerator.tsx # AI content creation
│   │   ├── ContentCalendar.tsx  # Scheduling interface
│   │   ├── Analytics.tsx     # Performance analytics
│   │   └── ProfileAnalysis.tsx # Profile insights
│   ├── hooks/               # Custom React hooks
│   │   ├── useAuth.ts       # Authentication hook
│   │   ├── useContent.ts    # Content management
│   │   └── useAnalytics.ts  # Analytics data
│   ├── lib/                 # Utility libraries
│   │   ├── supabase.ts      # Supabase client
│   │   ├── linkedin.ts      # LinkedIn API wrapper
│   │   └── openai.ts        # OpenAI integration
│   └── App.tsx              # Main application component
├── supabase/
│   ├── functions/           # Edge Functions
│   │   ├── linkedin-auth/   # LinkedIn OAuth handler
│   │   ├── content-generator/ # AI content generation
│   │   ├── analytics-sync/  # Analytics data sync
│   │   └── linkedin-publisher/ # Auto-posting
│   └── migrations/          # Database schema
└── README.md
```

## 🔄 Database Schema

### Users Table
Stores user authentication and LinkedIn profile data.

### Content Posts Table  
Manages all generated content with metadata and status.

### Analytics Metrics Table
Tracks performance metrics for each post.

### Scheduled Posts Table
Handles automated post scheduling and publishing.

## 🔌 API Endpoints

### Edge Functions
- `POST /functions/v1/linkedin-auth` - LinkedIn OAuth flow
- `POST /functions/v1/content-generator` - Generate AI content
- `POST /functions/v1/linkedin-publisher` - Publish to LinkedIn
- `POST /functions/v1/analytics-sync` - Sync analytics data

### LinkedIn API Integration
- **Profile API**: Fetch user profile data
- **Posts API**: Publish content to LinkedIn
- **Analytics API**: Retrieve post performance metrics

## 🛡 Security Features

- **Row Level Security (RLS)**: Database-level access control
- **OAuth 2.0**: Secure LinkedIn authentication
- **Environment Variables**: Secure API key management
- **CORS Protection**: Cross-origin request security
- **Input Validation**: Sanitized user inputs

## 📊 Analytics & Insights

The platform provides comprehensive analytics including:
- **Engagement Metrics**: Likes, comments, shares, clicks
- **Reach Analytics**: Impressions and unique views
- **Audience Insights**: Demographics and behavior
- **Content Performance**: Best performing post types
- **Optimal Timing**: Best times to post for your audience

## 🎯 AI Content Features

### Content Generation
- **Context-Aware**: Understands your industry and role
- **Tone Matching**: Adapts to your preferred communication style
- **Trending Topics**: Incorporates current industry trends
- **Hashtag Optimization**: Suggests high-performing hashtags

### Content Types
1. **Short Posts** (under 300 words): Quick updates and insights
2. **Long Articles** (800-1200 words): Thought leadership content  
3. **Carousels** (5-7 slides): Multi-slide visual content

## 🚀 Deployment

### Production Deployment
1. Build the application:
```bash
npm run build
```

2. Deploy to Cloudflare Pages:
```bash
npm run deploy
```

3. Update environment variables for production URLs

### Environment Variables for Production
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-key
VITE_LINKEDIN_CLIENT_ID=your-linkedin-client-id
VITE_LINKEDIN_REDIRECT_URI=https://your-domain.com/auth/linkedin/callback
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

For support, email support@yourdomain.com or join our [Discord community](https://discord.gg/yourserver).

## 🔗 Links

- [LinkedIn Developer Portal](https://www.linkedin.com/developers/)
- [Supabase Documentation](https://supabase.com/docs)
- [OpenAI API Reference](https://platform.openai.com/docs)
- [React Documentation](https://reactjs.org/docs)

---

**Made with ❤️ by [Your Name](https://github.com/yourusername)**

> Transform your LinkedIn presence with the power of AI! 🚀