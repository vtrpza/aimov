/**
 * Types for property enrichment system
 */

export interface EnrichmentInput {
  id: string
  title: string
  description: string | null
  address_city: string | null
  address_state: string | null
  // Current values that might be missing/wrong
  property_type: string | null
  listing_type: string | null
  bedrooms: number | null
  bathrooms: number | null
  price_monthly: number | null
  price_total: number | null
}

export interface EnrichmentOutput {
  property_type: 'apartamento' | 'casa' | 'sobrado' | 'sala_comercial' | 'terreno' | 'fazenda_sitio_chacara' | 'loft' | 'cobertura' | null
  listing_type: 'rent' | 'sale' | null
  bedrooms: number | null
  bathrooms: number | null
  suites: number | null
  parking_spaces: number | null
  price_monthly: number | null
  price_total: number | null
  condominium_fee: number | null
  iptu_monthly: number | null
  iptu_annual: number | null
  address_neighborhood: string | null
  furnished: 'furnished' | 'unfurnished' | 'semi_furnished' | null
  features: string[]
  ai_summary: string
}

export interface EnrichmentResult {
  success: boolean
  propertyId: string
  enrichedData?: EnrichmentOutput
  error?: string
  tokensUsed?: number
}

export interface EnrichmentStats {
  total: number
  processed: number
  succeeded: number
  failed: number
  skipped: number
  totalTokens: number
  estimatedCost: number
}

export interface BatchEnrichmentOptions {
  batchSize?: number
  delayMs?: number
  dryRun?: boolean
  forceReenrich?: boolean
  filter?: {
    missingType?: boolean
    missingSummary?: boolean
    missingNeighborhood?: boolean
  }
}
