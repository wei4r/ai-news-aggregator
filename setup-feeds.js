const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlfa2V5IjoiMDFKWFNYQ1c2MUozMDFFODdCUkNSWE5ONFYiLCJ0ZW5hbnRfaWQiOiJjNjJlZTEzMDU5NTIyNTk0NGNiODJmNDIxZTMyNWViNzE4YTcwZDU5ZmY4M2ZlNzM2MDRlMGU4ZDgwYmI0YzM1IiwiaW50ZXJuYWxfc2VjcmV0IjoiNDVjZjc1ZGMtNTEzYy00NzhkLWE3NTgtYTQzMmMwYjc2ZTkwIn0.Wmhagj4PSCaagOeq1fc_hJNYrO8lv9GkxlyxVctdR8c"
    }
  }
});

const FEED_SOURCES = [
  {
    name: 'OpenAI Blog',
    url: 'https://openai.com/blog/rss.xml',
    type: 'rss',
    active: true
  },
  {
    name: 'Hugging Face Blog', 
    url: 'https://huggingface.co/blog/feed.xml',
    type: 'rss',
    active: true
  },
  {
    name: 'TechCrunch AI',
    url: 'https://techcrunch.com/category/artificial-intelligence/feed/',
    type: 'rss', 
    active: true
  }
];

async function setupFeeds() {
  console.log('🔧 Setting up RSS feed sources...');
  
  for (const feed of FEED_SOURCES) {
    try {
      const existing = await prisma.feedSource.findUnique({
        where: { url: feed.url }
      });
      
      if (!existing) {
        await prisma.feedSource.create({ data: feed });
        console.log(`✅ Added feed: ${feed.name}`);
      } else {
        console.log(`⏭️  Feed exists: ${feed.name}`);
      }
    } catch (error) {
      console.error(`❌ Error adding feed ${feed.name}:`, error.message);
    }
  }
  
  const count = await prisma.feedSource.count();
  console.log(`📊 Total feeds configured: ${count}`);
}

setupFeeds().finally(() => prisma.$disconnect());