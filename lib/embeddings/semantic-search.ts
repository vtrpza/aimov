/**
 * Semantic search functions using pgvector embeddings
 */
// @ts-nocheck - POC project with ignoreBuildErrors enabled
import { createClient } from '@/lib/supabase/server'
import { generateQueryEmbedding } from './openai-embeddings'
import type { SemanticSearchResult, EmbeddingOptions, HybridSearchOptions } from './types'

/**
 * Search properties using natural language query
 */
export async function semanticSearchProperties(
  query: string,
  options: EmbeddingOptions = {}
): Promise<SemanticSearchResult[]> {
  const { limit = 10, threshold = 0.7 } = options

  // Generate embedding for the query
  const queryEmbedding = await generateQueryEmbedding(query)

  // Call Postgres function for semantic search
  const supabase = await createClient()
  
  const { data, error } = await supabase.rpc('match_properties', {
    query_embedding: JSON.stringify(queryEmbedding),
    match_threshold: threshold,
    match_count: limit,
  }) as any

  if (error) {
    throw new Error(`Semantic search failed: ${error.message}`)
  }

  return (data || []) as SemanticSearchResult[]
}

/**
 * Find similar properties to a given property
 */
export async function findSimilarProperties(
  propertyId: string,
  options: EmbeddingOptions = {}
): Promise<SemanticSearchResult[]> {
  const { limit = 5, threshold = 0.7 } = options

  const supabase = await createClient()

  const { data, error } = await supabase.rpc('find_similar_properties', {
    property_id: propertyId,
    match_threshold: threshold,
    match_count: limit,
  }) as any

  if (error) {
    throw new Error(`Failed to find similar properties: ${error.message}`)
  }

  return (data || []) as SemanticSearchResult[]
}

/**
 * Match properties for a client based on their preferences embedding
 */
export async function matchPropertiesForClient(
  clientId: string,
  options: EmbeddingOptions = {}
): Promise<SemanticSearchResult[]> {
  const { limit = 10, threshold = 0.6 } = options

  const supabase = await createClient()

  const { data, error } = await supabase.rpc('match_properties_for_client', {
    client_id: clientId,
    match_threshold: threshold,
    match_count: limit,
  }) as any

  if (error) {
    throw new Error(`Failed to match properties for client: ${error.message}`)
  }

  return (data || []) as SemanticSearchResult[]
}

/**
 * Hybrid search: Combines semantic search with traditional filters
 */
export async function hybridSearch(
  query: string,
  options: HybridSearchOptions = {}
): Promise<SemanticSearchResult[]> {
  const {
    limit = 10,
    threshold = 0.7,
    city,
    state,
    neighborhood,
    propertyType,
    listingType,
    minPrice,
    maxPrice,
    minBedrooms,
    maxBedrooms,
    minBathrooms,
    minArea,
    maxArea,
  } = options

  // Generate embedding for the query
  const queryEmbedding = await generateQueryEmbedding(query)
  const supabase = await createClient()

  // Build query that combines semantic search with filters
  let queryBuilder = supabase
    .from('properties')
    .select('*')
    .is('deleted_at', null)
    .eq('status', 'active')

  // Apply traditional filters
  if (city) queryBuilder = queryBuilder.ilike('address_city', `%${city}%`)
  if (state) queryBuilder = queryBuilder.eq('address_state', state)
  if (neighborhood) queryBuilder = queryBuilder.ilike('address_neighborhood', `%${neighborhood}%`)
  if (propertyType) queryBuilder = queryBuilder.eq('property_type', propertyType)
  if (listingType) queryBuilder = queryBuilder.eq('listing_type', listingType)

  // Price filters (check both rent and sale)
  if (minPrice) {
    queryBuilder = queryBuilder.or(`price_monthly.gte.${minPrice},price_total.gte.${minPrice}`)
  }
  if (maxPrice) {
    queryBuilder = queryBuilder.or(`price_monthly.lte.${maxPrice},price_total.lte.${maxPrice}`)
  }

  // Room filters
  if (minBedrooms) queryBuilder = queryBuilder.gte('bedrooms', minBedrooms)
  if (maxBedrooms) queryBuilder = queryBuilder.lte('bedrooms', maxBedrooms)
  if (minBathrooms) queryBuilder = queryBuilder.gte('bathrooms', minBathrooms)

  // Area filters
  if (minArea) queryBuilder = queryBuilder.gte('area_total', minArea)
  if (maxArea) queryBuilder = queryBuilder.lte('area_total', maxArea)

  // Must have embedding for semantic search
  queryBuilder = queryBuilder.not('ai_embedding', 'is', null)

  const { data: properties, error } = await queryBuilder as any

  if (error) {
    throw new Error(`Hybrid search failed: ${error.message}`)
  }

  if (!properties || properties.length === 0) {
    return []
  }

  // Calculate similarity scores manually for filtered results
  const results: SemanticSearchResult[] = []

  for (const property of properties) {
    try {
      // Parse embedding (stored as JSON string)
      const propertyEmbedding = JSON.parse(property.ai_embedding)
      
      // Calculate cosine similarity
      const similarity = cosineSimilarity(queryEmbedding, propertyEmbedding)

      if (similarity >= threshold) {
        results.push({
          ...property,
          similarity,
        })
      }
    } catch (err) {
      console.error('Error calculating similarity:', err)
    }
  }

  // Sort by similarity descending
  results.sort((a, b) => b.similarity - a.similarity)

  // Return top N results
  return results.slice(0, limit)
}

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have the same length')
  }

  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i]
    normA += vecA[i] * vecA[i]
    normB += vecB[i] * vecB[i]
  }

  normA = Math.sqrt(normA)
  normB = Math.sqrt(normB)

  if (normA === 0 || normB === 0) {
    return 0
  }

  return dotProduct / (normA * normB)
}
