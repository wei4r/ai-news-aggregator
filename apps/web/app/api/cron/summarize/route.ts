import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Count articles without summaries
    const unprocessed = await prisma.aiNews.count({
      where: { summary: '' }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Summarization service placeholder',
      unprocessedCount: unprocessed,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Summarization failed:', error)
    return NextResponse.json(
      { error: 'Summarization failed' },
      { status: 500 }
    )
  }
}