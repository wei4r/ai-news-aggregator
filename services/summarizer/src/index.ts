import OpenAI from 'openai'
import { prisma } from '@repo/db'
import { LLMSummaryResponse } from '@repo/shared'

export class NewsSummarizer {
  private openai: OpenAI

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })
  }

  async processUnprocessedArticles() {
    console.log('🤖 Starting summarization process...')
    
    const unprocessed = await prisma.aiNews.findMany({
      where: { processed: false },
      take: 10 // Process in batches
    })

    console.log(`Found ${unprocessed.length} articles to process`)

    const results = await Promise.allSettled(
      unprocessed.map((article: any) => this.processArticle(article))
    )

    const successful = results.filter(r => r.status === 'fulfilled').length
    console.log(`✅ Processed ${successful}/${unprocessed.length} articles`)

    return { successful, total: unprocessed.length }
  }

  private async processArticle(article: any) {
    try {
      console.log(`Processing: ${article.title}`)

      // Generate summary using GPT-4
      const summary = await this.generateSummary(article)
      
      // Generate embedding
      const embedding = await this.generateEmbedding(
        `${article.title} ${summary.summary}`
      )

      // Update article with summary and embedding
      await prisma.aiNews.update({
        where: { id: article.id },
        data: {
          summary: summary.summary,
          tags: summary.tags,
          embedding: `[${embedding.join(',')}]`,
          processed: true
        }
      })

      console.log(`✅ Processed: ${article.title}`)

    } catch (error) {
      console.error(`❌ Error processing article ${article.id}:`, error)
      throw error
    }
  }

  private async generateSummary(article: any): Promise<LLMSummaryResponse> {
    const prompt = `
Analyze this AI/tech news article and provide a JSON response with:
- title: Clean, concise title (max 80 chars)
- summary: Key points in ≤60 words
- tags: Array of 2-5 relevant tags

Article:
Title: ${article.title}
Content: ${article.content}

Respond with valid JSON only:
`

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 300
    })

    const content = response.choices[0]?.message?.content
    if (!content) throw new Error('No response from OpenAI')

    try {
      return JSON.parse(content) as LLMSummaryResponse
    } catch (error) {
      console.error('Failed to parse OpenAI response:', content)
      throw new Error('Invalid JSON response from OpenAI')
    }
  }

  private async generateEmbedding(text: string): Promise<number[]> {
    const response = await this.openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text.substring(0, 8000) // Limit input length
    })

    return response.data[0].embedding
  }
}