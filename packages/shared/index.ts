export interface NewsItem {
  id: string
  title: string
  content?: string
  summary: string
  url: string
  source: string
  sourceUrl?: string
  publishedAt: Date
  tags: string[]
  processed: boolean
  createdAt: Date
  updatedAt: Date
}

export interface FeedSource {
  id: string
  name: string
  url: string
  type: 'rss' | 'atom' | 'rest'
  active: boolean
  lastFetch?: Date
}

export interface LLMSummaryResponse {
  title: string
  summary: string
  tags: string[]
}

export interface SearchResult {
  id: string
  title: string
  summary: string
  url: string
  source: string
  publishedAt: Date
  tags: string[]
  similarity?: number
}

// API Response types
export interface NewsListResponse {
  articles: NewsItem[]
  pagination: {
    page: number
    limit: number
    total: number
    hasMore: boolean
  }
}

export interface SearchResponse {
  results: SearchResult[]
  query: string
  total: number
}