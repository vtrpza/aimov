/**
 * Types for semantic search and embeddings system
 */

export interface EmbeddingOptions {
  limit?: number
  threshold?: number // 0-1, minimum similarity score (default 0.7)
  includeMetadata?: boolean
}

export interface SemanticSearchResult {
  id: string
  title: string
  description: string | null
  property_type: string | null
  listing_type: string | null
  price_monthly: number | null
  price_total: number | null
  address_city: string | null
  address_state: string | null
  address_neighborhood: string | null
  bedrooms: number | null
  bathrooms: number | null
  area_total: number | null
  features: any
  ai_summary: string | null
  similarity: number // Cosine similarity score (0-1)
}

export interface PropertyEmbeddingInput {
  id: string
  title: string
  description: string | null
  property_type: string | null
  listing_type: string | null
  address_city: string | null
  address_state: string | null
  address_neighborhood: string | null
  bedrooms: number | null
  bathrooms: number | null
  parking_spaces: number | null
  area_total: number | null
  features: any
  ai_summary: string | null
}

export interface ClientEmbeddingInput {
  id: string
  full_name: string
  budget_min: number | null
  budget_max: number | null
  preferred_neighborhoods: string[] | null
  preferred_property_types: string[] | null
  min_bedrooms: number | null
  min_bathrooms: number | null
  required_features: string[] | null
  notes: string | null
}

export interface EmbeddingGenerationResult {
  success: boolean
  id: string
  embedding?: number[]
  error?: string
  tokensUsed?: number
}

export interface BatchEmbeddingStats {
  total: number
  processed: number
  succeeded: number
  failed: number
  skipped: number
  totalTokens: number
  estimatedCost: number
}

export interface HybridSearchOptions extends EmbeddingOptions {
  // Traditional filters that can be combined with semantic search
  city?: string
  state?: string
  neighborhood?: string
  propertyType?: string
  listingType?: 'rent' | 'sale'
  minPrice?: number
  maxPrice?: number
  minBedrooms?: number
  maxBedrooms?: number
  minBathrooms?: number
  minArea?: number
  maxArea?: number
}
