import { PrismaClient } from '@prisma/client';
export const prisma = globalThis.__prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') {
    globalThis.__prisma = prisma;
}
export * from '@prisma/client';
// Vector search utilities
export async function searchArticlesByVector(embedding, limit = 10, threshold = 0.7) {
    const embeddingString = `[${embedding.join(',')}]`;
    return prisma.$queryRaw `
    SELECT 
      id, title, summary, url, source, "publishedAt", tags,
      1 - (embedding <=> ${embeddingString}::vector) as similarity
    FROM ai_news 
    WHERE 1 - (embedding <=> ${embeddingString}::vector) > ${threshold}
    ORDER BY embedding <=> ${embeddingString}::vector
    LIMIT ${limit}
  `;
}
