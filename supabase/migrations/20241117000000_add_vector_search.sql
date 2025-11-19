-- Enable pgvector extension for semantic search
CREATE EXTENSION IF NOT EXISTS vector;

-- Add vector columns for embeddings (1536 dimensions for OpenAI text-embedding-3-small)
-- Properties embeddings for semantic search
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS ai_embedding vector(1536);

-- Clients preferences embeddings for matching
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS preferences_embedding vector(1536);

-- Create HNSW indexes for fast similarity search
-- HNSW (Hierarchical Navigable Small World) is optimized for high-dimensional vectors
CREATE INDEX IF NOT EXISTS properties_ai_embedding_idx 
ON properties 
USING hnsw (ai_embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

CREATE INDEX IF NOT EXISTS clients_preferences_embedding_idx 
ON clients 
USING hnsw (preferences_embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Function to search properties by semantic similarity
CREATE OR REPLACE FUNCTION match_properties(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  property_type text,
  listing_type text,
  price_monthly numeric,
  price_total numeric,
  address_city text,
  address_state text,
  address_neighborhood text,
  bedrooms int,
  bathrooms int,
  area_total numeric,
  features jsonb,
  ai_summary text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.title,
    p.description,
    p.property_type,
    p.listing_type,
    p.price_monthly,
    p.price_total,
    p.address_city,
    p.address_state,
    p.address_neighborhood,
    p.bedrooms,
    p.bathrooms,
    p.area_total,
    p.features,
    p.ai_summary,
    1 - (p.ai_embedding <=> query_embedding) as similarity
  FROM properties p
  WHERE 
    p.ai_embedding IS NOT NULL
    AND p.deleted_at IS NULL
    AND p.status = 'active'
    AND 1 - (p.ai_embedding <=> query_embedding) > match_threshold
  ORDER BY p.ai_embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Function to find similar properties (for "properties like this" feature)
CREATE OR REPLACE FUNCTION find_similar_properties(
  property_id uuid,
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  property_type text,
  listing_type text,
  price_monthly numeric,
  price_total numeric,
  address_city text,
  address_state text,
  address_neighborhood text,
  bedrooms int,
  bathrooms int,
  area_total numeric,
  features jsonb,
  ai_summary text,
  similarity float
)
LANGUAGE plpgsql
AS $$
DECLARE
  source_embedding vector(1536);
BEGIN
  -- Get the embedding of the source property
  SELECT ai_embedding INTO source_embedding
  FROM properties
  WHERE properties.id = property_id
  AND ai_embedding IS NOT NULL;

  IF source_embedding IS NULL THEN
    RAISE EXCEPTION 'Property not found or has no embedding';
  END IF;

  RETURN QUERY
  SELECT
    p.id,
    p.title,
    p.description,
    p.property_type,
    p.listing_type,
    p.price_monthly,
    p.price_total,
    p.address_city,
    p.address_state,
    p.address_neighborhood,
    p.bedrooms,
    p.bathrooms,
    p.area_total,
    p.features,
    p.ai_summary,
    1 - (p.ai_embedding <=> source_embedding) as similarity
  FROM properties p
  WHERE 
    p.id != property_id
    AND p.ai_embedding IS NOT NULL
    AND p.deleted_at IS NULL
    AND p.status = 'active'
    AND 1 - (p.ai_embedding <=> source_embedding) > match_threshold
  ORDER BY p.ai_embedding <=> source_embedding
  LIMIT match_count;
END;
$$;

-- Function to match properties for a client based on their preferences embedding
CREATE OR REPLACE FUNCTION match_properties_for_client(
  client_id uuid,
  match_threshold float DEFAULT 0.6,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  property_type text,
  listing_type text,
  price_monthly numeric,
  price_total numeric,
  address_city text,
  address_state text,
  address_neighborhood text,
  bedrooms int,
  bathrooms int,
  area_total numeric,
  features jsonb,
  ai_summary text,
  similarity float
)
LANGUAGE plpgsql
AS $$
DECLARE
  client_embedding vector(1536);
BEGIN
  -- Get the client's preferences embedding
  SELECT preferences_embedding INTO client_embedding
  FROM clients
  WHERE clients.id = client_id
  AND preferences_embedding IS NOT NULL;

  IF client_embedding IS NULL THEN
    RAISE EXCEPTION 'Client not found or has no preferences embedding';
  END IF;

  RETURN QUERY
  SELECT
    p.id,
    p.title,
    p.description,
    p.property_type,
    p.listing_type,
    p.price_monthly,
    p.price_total,
    p.address_city,
    p.address_state,
    p.address_neighborhood,
    p.bedrooms,
    p.bathrooms,
    p.area_total,
    p.features,
    p.ai_summary,
    1 - (p.ai_embedding <=> client_embedding) as similarity
  FROM properties p
  WHERE 
    p.ai_embedding IS NOT NULL
    AND p.deleted_at IS NULL
    AND p.status = 'active'
    AND 1 - (p.ai_embedding <=> client_embedding) > match_threshold
  ORDER BY p.ai_embedding <=> client_embedding
  LIMIT match_count;
END;
$$;

-- Add comment for documentation
COMMENT ON FUNCTION match_properties IS 'Semantic search for properties using natural language query embedding';
COMMENT ON FUNCTION find_similar_properties IS 'Find properties similar to a given property based on embeddings';
COMMENT ON FUNCTION match_properties_for_client IS 'Match properties to a client based on their preferences embedding';
