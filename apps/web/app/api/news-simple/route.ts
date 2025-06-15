import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const articles = await prisma.aiNews.findMany({
      orderBy: { publishedAt: 'desc' },
      take: 20,
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
    })

    return NextResponse.json({
      articles: articles.map(article => ({
        ...article,
        processed: true
      })),
      total: articles.length
    })

  } catch (error) {
    console.error('Error fetching news:', error)
    return NextResponse.json(
      { error: 'Failed to fetch news', details: error.message },
      { status: 500 }
    )
  }
}