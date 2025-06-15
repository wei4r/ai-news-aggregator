# AI News Aggregation Service

A complete AI-powered news aggregation service built with Vercel's ecosystem, featuring automated RSS feed processing, LLM-powered summarization, and semantic search capabilities.

## 🏗️ Architecture

This is a monorepo containing:

- **`apps/web`** - Next.js frontend with news display and search
- **`apps/api`** - Next.js API endpoints (optional separate deployment)
- **`packages/db`** - Prisma database layer with PostgreSQL + pgvector
- **`packages/shared`** - Shared TypeScript types and utilities
- **`services/fetcher`** - RSS feed fetching and processing service
- **`services/summarizer`** - OpenAI-powered news summarization service

## ✨ Features

- 🔄 **Automated RSS Feed Processing** - Fetches from 5+ AI news sources every 30 minutes
- 🤖 **LLM-Powered Summarization** - Uses GPT-4o-mini for concise article summaries
- 🔍 **Semantic Search** - Vector embeddings enable intelligent content discovery
- 📱 **Responsive UI** - Clean, accessible interface built with Tailwind CSS
- ⚡ **Real-time Updates** - SWR for optimistic updates and background refresh
- 🚀 **Production Ready** - Vercel deployment with automated cron jobs

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm/yarn
- OpenAI API key
- Vercel account (for deployment)

### Local Development

1. **Clone and install dependencies:**
   ```bash
   git clone <your-repo>
   cd ai-news-aggregator
   npm install
   ```

2. **Start local database:**
   ```bash
   docker-compose up -d
   ```

3. **Setup environment variables:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your API keys and database URL
   ```

4. **Initialize database:**
   ```bash
   npm run db:generate
   npm run db:push
   npm run db:seed
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```

Visit `http://localhost:3000` to see the application.

## 📋 Available Scripts

```bash
# Development
npm run dev              # Start web app
npm run db:generate      # Generate Prisma client
npm run db:push          # Push schema to database
npm run db:seed          # Seed default feeds
npm run db:migrate       # Run database migrations

# Production
npm run build            # Build all packages
npm run start            # Start production server

# Testing
npm run test             # Run all tests
npm run test:watch       # Run tests in watch mode
npm run type-check       # TypeScript type checking
npm run lint             # ESLint checking
```

## 🔧 Configuration

### Environment Variables

Create `.env.local` in the root directory:

```bash
# Database (use Docker Compose for local dev)
POSTGRES_URL="postgresql://dev_user:dev_password@localhost:5432/ai_news_dev"
POSTGRES_PRISMA_URL="postgresql://dev_user:dev_password@localhost:5432/ai_news_dev"

# OpenAI
OPENAI_API_KEY="sk-your-openai-api-key"

# Cron Security
CRON_SECRET="your-secure-random-string"
```

### Feed Sources

The system comes with 5 default AI news sources:
- OpenAI Blog
- Anthropic News  
- Hugging Face Blog
- NVIDIA Developer Blog (AI)
- TechCrunch AI

Add more feeds by inserting into the `feed_sources` table or modifying `DEFAULT_FEEDS` in the fetcher service.

## 🚀 Deployment to Vercel

### Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyour-username%2Fai-news-aggregator)

### Manual Deployment

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Initial commit: AI news aggregator"
   git push origin main
   ```

2. **Deploy to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Set Root Directory to `apps/web`
   - Deploy!

3. **Add Vercel Postgres:**
   - In your Vercel dashboard, go to Storage
   - Create a new Postgres database
   - This will automatically add all POSTGRES_* environment variables

4. **Set additional environment variables:**
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `CRON_SECRET`: A secure random string for cron job authentication

5. **Initialize database:**
   - Run `npx prisma db push` from the Vercel dashboard terminal
   - Or use the manual fetch script to populate data

The cron jobs will automatically run every 30 minutes to fetch and process news!

## 🏃‍♂️ Manual Operations

### Force refresh feeds
```bash
curl -X GET "https://your-app.vercel.app/api/cron/fetch-news" \
  -H "Authorization: Bearer your-cron-secret"
```

### Process articles
```bash
curl -X GET "https://your-app.vercel.app/api/cron/summarize" \
  -H "Authorization: Bearer your-cron-secret"
```

### Search articles
```bash
curl "https://your-app.vercel.app/api/search?q=GPT-4"
```

## 📊 API Endpoints

- `GET /api/news` - List paginated articles
- `GET /api/search?q=query` - Search articles (semantic + keyword)
- `GET /api/cron/fetch-news` - Trigger feed refresh (cron protected)
- `GET /api/cron/summarize` - Trigger article processing (cron protected)

## 🧪 Testing

The project includes comprehensive testing setup:

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Test specific workspace
npm run test --workspace=services/fetcher
```

## 🔒 Security

- Cron endpoints protected with `CRON_SECRET`
- API rate limiting recommended for production
- OpenAI API key rotation recommended
- Environment variables for all secrets

## 📈 Monitoring

For production monitoring:
- Vercel Analytics for performance
- Monitor cron job execution in Vercel dashboard
- Set up error tracking (Sentry recommended)
- Track OpenAI API usage and costs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.