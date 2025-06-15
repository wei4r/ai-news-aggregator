'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { formatDistanceToNow } from 'date-fns'
// Type definitions
interface NewsItem {
  id: string
  title: string
  summary: string
  url: string
  source: string
  publishedAt: Date
  tags: string[]
}

interface NewsListResponse {
  articles: NewsItem[]
  pagination: {
    page: number
    limit: number
    total: number
    hasMore: boolean
  }
}

interface SearchResponse {
  results: NewsItem[]
  query: string
  total: number
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

interface AiNewsWidgetProps {
  maxItems?: number
  showSearch?: boolean
  className?: string
}

export function AiNewsWidget({ 
  maxItems = 10, 
  showSearch = true,
  className = ''
}: AiNewsWidgetProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  const { data: newsData, error: newsError } = useSWR<NewsListResponse>(
    !isSearching ? `/api/news?limit=${maxItems}` : null,
    fetcher,
    { refreshInterval: 1800000 } // 30 minutes
  )

  const { data: searchData, error: searchError } = useSWR<SearchResponse>(
    isSearching && searchQuery ? `/api/search?q=${encodeURIComponent(searchQuery)}&limit=${maxItems}` : null,
    fetcher
  )

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setIsSearching(true)
    }
  }

  const clearSearch = () => {
    setSearchQuery('')
    setIsSearching(false)
  }

  const articles = isSearching ? searchData?.results || [] : newsData?.articles || []
  const isLoading = (!newsData && !newsError && !isSearching) || (isSearching && !searchData && !searchError)
  const error = newsError || searchError

  return (
    <div className={`ai-news-widget ${className}`}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Latest AI News
        </h2>
        
        {showSearch && (
          <form onSubmit={handleSearch} className="mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search AI news..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-label="Search AI news"
              />
              <button
                type="submit"
                disabled={!searchQuery.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Search
              </button>
              {isSearching && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Clear
                </button>
              )}
            </div>
          </form>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">
            Failed to load news articles. Please try again later.
          </p>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {isSearching ? 'No articles found for your search.' : 'No news articles available.'}
        </div>
      ) : (
        <div className="space-y-6">
          {articles.map((article) => (
            <article
              key={article.id}
              className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900 leading-tight">
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-blue-600 transition-colors"
                  >
                    {article.title}
                  </a>
                </h3>
              </div>
              
              <p className="text-gray-700 mb-4 leading-relaxed">
                {article.summary}
              </p>

              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-4">
                  <span className="font-medium">{article.source}</span>
                  <time dateTime={article.publishedAt.toString()}>
                    {formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}
                  </time>
                </div>
                
                {article.tags.length > 0 && (
                  <div className="flex gap-1">
                    {article.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {!isSearching && newsData?.pagination.hasMore && (
        <div className="text-center mt-6">
          <a
            href="/ai-news"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            View All News
          </a>
        </div>
      )}
    </div>
  )
}