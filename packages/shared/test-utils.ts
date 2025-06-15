import { NewsItem, FeedSource, LLMSummaryResponse } from './index'

export function createMockNewsItem(overrides: Partial<NewsItem> = {}): NewsItem {
  return {
    id: 'test-id',
    title: 'Test Article',
    content: 'Test content',
    summary: 'Test summary',
    url: 'https://example.com/test',
    source: 'Test Source',
    sourceUrl: 'https://example.com',
    publishedAt: new Date(),
    tags: ['test'],
    processed: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  }
}

export function createMockFeedSource(overrides: Partial<FeedSource> = {}): FeedSource {
  return {
    id: 'test-feed-id',
    name: 'Test Feed',
    url: 'https://example.com/feed.xml',
    type: 'rss',
    active: true,
    lastFetch: new Date(),
    ...overrides
  }
}

export function createMockLLMResponse(overrides: Partial<LLMSummaryResponse> = {}): LLMSummaryResponse {
  return {
    title: 'Test Title',
    summary: 'Test summary within 60 words',
    tags: ['ai', 'tech'],
    ...overrides
  }
}