import { NextRequest, NextResponse } from 'next/server'
import { prisma, searchArticlesByVector } from '@repo/db'
import { SearchResponse } from '@repo/shared'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter required' },
        { status: 400 }
      )
    }

    // Generate embedding for search query
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query
    })

    const queryEmbedding = embeddingResponse.data[0].embedding

    // Perform vector search
    const results = await searchArticlesByVector(queryEmbedding, limit)

    // Also perform keyword search as fallback
    const keywordResults = await prisma.aiNews.findMany({
      where: {
        processed: true,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { summary: { contains: query, mode: 'insensitive' } },
          { tags: { has: query.toLowerCase() } }
        ]
      },
      take: limit,
      orderBy: { publishedAt: 'desc' }
    })

    // Combine and deduplicate results
    const combinedResults = [...results, ...keywordResults]
    const uniqueResults = combinedResults.filter((item, index, self) =>
      index === self.findIndex(t => t.id === item.id)
    )

    const response: SearchResponse = {
      results: uniqueResults.slice(0, limit),
      query,
      total: uniqueResults.length
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    )
  }
}