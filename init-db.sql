-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create indexes for better performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_news_embedding 
ON ai_news USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 100);

-- Create full-text search index
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_news_search 
ON ai_news USING gin(to_tsvector('english', title || ' ' || summary));