import { AiNewsWidget } from '@/components/AiNewsWidget'

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI News Aggregator
          </h1>
          <p className="text-lg text-gray-600">
            Stay updated with the latest AI news, product releases, and technical updates from leading companies.
          </p>
        </div>
        
        <AiNewsWidget 
          maxItems={20} 
          showSearch={true}
          className="w-full"
        />
      </div>
    </div>
  )
}