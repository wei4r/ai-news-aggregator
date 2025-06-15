import Parser from 'rss-parser'
import axios from 'axios'
import { prisma } from '@repo/db'
import { FeedSource } from '@repo/shared'

interface RSSItem {
  title?: string
  link?: string
  pubDate?: string
  contentSnippet?: string
  content?: string
  guid?: string
}

export class NewsFetcher {
  private parser: Parser<{}, RSSItem>

  constructor() {
    this.parser = new Parser({
      timeout: 10000,
      headers: {
        'User-Agent': 'AI-News-Aggregator/1.0'
      }
    })
  }

  async fetchAllFeeds() {
    console.log('🔄 Starting feed fetch process...')
    
    const feedSources = await prisma.feedSource.findMany({
      where: { active: true }
    })

    const results = await Promise.allSettled(
      feedSources.map((feed: any) => this.processFeed(feed))
    )

    const successful = results.filter(r => r.status === 'fulfilled').length
    console.log(`✅ Processed ${successful}/${feedSources.length} feeds`)

    return { successful, total: feedSources.length }
  }

  private async processFeed(feedSource: FeedSource) {
    try {
      console.log(`Processing feed: ${feedSource.name}`)
      
      const feed = await this.parser.parseURL(feedSource.url)
      const newArticles = []

      for (const item of feed.items) {
        if (!item.link || !item.title) continue

        // Check if article already exists
        const existing = await prisma.aiNews.findUnique({
          where: { url: item.link }
        })

        if (existing) continue

        // Parse publish date
        const publishedAt = item.pubDate 
          ? new Date(item.pubDate) 
          : new Date()

        // Extract content
        const content = item.content || item.contentSnippet || ''

        const article = {
          title: item.title,
          content: this.cleanContent(content),
          summary: '', // Will be filled by summarizer
          url: item.link,
          source: feedSource.name,
          sourceUrl: feedSource.url,
          publishedAt,
          tags: [],
          processed: false
        }

        await prisma.aiNews.create({ data: article })
        newArticles.push(article)
      }

      // Update last fetch time
      await prisma.feedSource.update({
        where: { id: feedSource.id },
        data: { lastFetch: new Date() }
      })

      console.log(`✅ ${feedSource.name}: ${newArticles.length} new articles`)
      return newArticles

    } catch (error) {
      console.error(`❌ Error processing ${feedSource.name}:`, error)
      throw error
    }
  }

  private cleanContent(content: string): string {
    // Remove HTML tags and clean up content
    return content
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 2000) // Limit content length
  }
}

// Default feed sources
export const DEFAULT_FEEDS: Partial<FeedSource>[] = [
  {
    name: 'OpenAI Blog',
    url: 'https://openai.com/blog/rss.xml',
    type: 'rss'
  },
  {
    name: 'Anthropic News',
    url: 'https://www.anthropic.com/news/rss.xml',
    type: 'rss'
  },
  {
    name: 'Hugging Face Blog',
    url: 'https://huggingface.co/blog/feed.xml',
    type: 'rss'
  },
  {
    name: 'NVIDIA Developer Blog AI',
    url: 'https://developer.nvidia.com/blog/tag/artificial-intelligence/feed',
    type: 'rss'
  },
  {
    name: 'TechCrunch AI',
    url: 'https://techcrunch.com/category/artificial-intelligence/feed/',
    type: 'rss'
  }
]