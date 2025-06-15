import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@repo/db'
import { NewsListResponse } from '@repo/shared'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const source = searchParams.get('source')
    const tag = searchParams.get('tag')

    const skip = (page - 1) * limit

    const where: any = { processed: true }
    if (source) where.source = source
    if (tag) where.tags = { has: tag }

    const [articles, total] = await Promise.all([
      prisma.aiNews.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          summary: true,
          url: true,
          source: true,
          publishedAt: true,
          tags: true,
          createdAt: true,
          updatedAt: true
        }
      }),
      prisma.aiNews.count({ where })
    ])

    const response: NewsListResponse = {
      articles: articles.map(article => ({
        ...article,
        content: undefined,
        processed: true
      })),
      pagination: {
        page,
        limit,
        total,
        hasMore: skip + limit < total
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error fetching news:', error)
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 }
    )
  }
}