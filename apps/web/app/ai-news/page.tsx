import { AiNewsWidget } from '@/components/AiNewsWidget'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI News - Latest Updates in Artificial Intelligence',
  description: 'Stay updated with the latest AI news, product releases, and technical updates from leading companies.',
}

export const revalidate = 1800 // 30 minutes

export default function AiNewsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <AiNewsWidget 
          maxItems={50} 
          showSearch={true}
          className="w-full"
        />
      </div>
    </div>
  )
}