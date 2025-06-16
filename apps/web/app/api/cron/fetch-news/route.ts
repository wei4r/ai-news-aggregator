import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fetchRSSFeed(url: string) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AI News Aggregator/1.0)'
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    
    const text = await response.text()
    
    // Simple XML parsing to extract items
    const items = []
    const itemMatches = text.match(/<item[^>]*>[\s\S]*?<\/item>/gi) || []
    
    for (const item of itemMatches.slice(0, 10)) { // Limit to 10 most recent
      const title = item.match(/<title[^>]*><!\[CDATA\[(.*?)\]\]><\/title>|<title[^>]*>(.*?)<\/title>/i)
      const link = item.match(/<link[^>]*>(.*?)<\/link>/i)
      const pubDate = item.match(/<pubDate[^>]*>(.*?)<\/pubDate>/i)
      const description = item.match(/<description[^>]*><!\[CDATA\[(.*?)\]\]><\/description>|<description[^>]*>(.*?)<\/description>/i)
      
      if (title && link) {
        items.push({
          title: (title[1] || title[2] || '').trim().substring(0, 255),
          url: (link[1] || '').trim(),
          publishedAt: pubDate ? new Date(pubDate[1]) : new Date(),
          summary: (description && (description[1] || description[2]) || '').replace(/<[^>]*>/g, '').trim().substring(0, 500)
        })
      }
    }
    
    return items
  } catch (error) {
    console.error(`Error fetching RSS feed ${url}:`, error)
    return []
  }
}

export async function GET(request: Request) {
  // Verify cron secret for security
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    console.log('🚀 Starting automated news fetch...')
    
    // Get active feed sources
    const feedSources = await prisma.feedSource.findMany({
      where: { active: true }
    })
    
    let totalAdded = 0
    const results = []
    
    for (const feed of feedSources) {
      console.log(`📡 Fetching from ${feed.name}...`)
      
      const articles = await fetchRSSFeed(feed.url)
      let addedFromFeed = 0
      
      for (const article of articles) {
        try {
          // Check if article already exists
          const existing = await prisma.aiNews.findUnique({
            where: { url: article.url }
          })
          
          if (!existing && article.title && article.url) {
            await prisma.aiNews.create({
              data: {
                title: article.title,
                content: article.summary,
                summary: article.summary || 'Summary to be generated',
                url: article.url,
                source: feed.name,
                sourceUrl: feed.url,
                publishedAt: article.publishedAt,
                tags: ['ai', 'tech'],
                processed: false
              }
            })
            addedFromFeed++
            totalAdded++
          }
        } catch (error) {
          console.error(`Error saving article from ${feed.name}:`, error)
        }
      }
      
      // Update last fetch time
      await prisma.feedSource.update({
        where: { id: feed.id },
        data: { lastFetch: new Date() }
      })
      
      results.push({
        feed: feed.name,
        articles: articles.length,
        added: addedFromFeed
      })
      
      console.log(`✅ ${feed.name}: ${addedFromFeed} new articles added`)
    }
    
    const totalCount = await prisma.aiNews.count()
    
    console.log(`🎉 Fetch complete: ${totalAdded} new articles added`)
    
    return NextResponse.json({
      success: true,
      message: 'News fetch completed',
      totalAdded,
      totalArticles: totalCount,
      results,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Cron job failed:', error)
    return NextResponse.json(
      { error: 'News fetch failed', details: error.message },
      { status: 500 }
    )
  }
}