import { NextResponse } from 'next/server'
import { NewsSummarizer } from 'news-summarizer'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const summarizer = new NewsSummarizer()
    const result = await summarizer.processUnprocessedArticles()
    
    console.log(`Summarization completed: ${result.successful}/${result.total} articles processed`)
    
    return NextResponse.json({
      success: true,
      ...result,
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