import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Default feed sources
const DEFAULT_FEEDS = [
  {
    name: 'OpenAI Blog',
    url: 'https://openai.com/blog/rss.xml',
    type: 'rss'
  },
  {
    name: 'Anthropic News',
    url: 'https://www.anthropic.com/news/rss.xml',
    type: 'rss'
  },
  {
    name: 'Hugging Face Blog',
    url: 'https://huggingface.co/blog/feed.xml',
    type: 'rss'
  },
  {
    name: 'NVIDIA Developer Blog AI',
    url: 'https://developer.nvidia.com/blog/tag/artificial-intelligence/feed',
    type: 'rss'
  },
  {
    name: 'TechCrunch AI',
    url: 'https://techcrunch.com/category/artificial-intelligence/feed/',
    type: 'rss'
  }
]

async function seedFeedSources() {
  console.log('🌱 Seeding feed sources...')
  
  for (const feed of DEFAULT_FEEDS) {
    await prisma.feedSource.upsert({
      where: { url: feed.url },
      update: {},
      create: {
        name: feed.name,
        url: feed.url,
        type: feed.type,
        active: true
      }
    })
  }
  
  console.log('✅ Feed sources seeded')
}

async function main() {
  try {
    await seedFeedSources()
    console.log('🎉 Database seeded successfully')
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()