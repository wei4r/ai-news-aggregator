import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // For now, return a simple success message
    return NextResponse.json({
      success: true,
      message: 'Summarization service temporarily disabled',
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