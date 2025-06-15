import { NextResponse } from 'next/server'
import { NewsFetcher } from 'news-fetcher'

export async function GET(request: Request) {
  // Verify cron secret for security
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const fetcher = new NewsFetcher()
    const result = await fetcher.fetchAllFeeds()
    
    console.log(`Cron job completed: ${result.successful}/${result.total} feeds processed`)
    
    return NextResponse.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Cron job failed:', error)
    return NextResponse.json(
      { error: 'Cron job failed' },
      { status: 500 }
    )
  }
}