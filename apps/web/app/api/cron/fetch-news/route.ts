import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  // Verify cron secret for security
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // For now, return a simple success message
    // The manual fetch script can be used instead
    return NextResponse.json({
      success: true,
      message: 'Use manual-fetch.js script for now',
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