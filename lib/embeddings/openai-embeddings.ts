/**
 * OpenAI Embeddings client for semantic search
 * Uses text-embedding-3-small model (1536 dimensions, $0.02/1M tokens)
 */

import OpenAI from 'openai'
import type {
  PropertyEmbeddingInput,
  ClientEmbeddingInput,
  EmbeddingGenerationResult,
} from './types'

// Lazy initialization to allow environment variables to be loaded first
let openai: OpenAI | null = null

function getOpenAIClient(): OpenAI {
  if (!openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is not set')
    }
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  }
  return openai
}

const EMBEDDING_MODEL = 'text-embedding-3-small'
const MAX_RETRIES = 3
const RETRY_DELAY_MS = 1000

/**
 * Generate text representation of a property for embedding
 */
export function propertyToText(property: PropertyEmbeddingInput): string {
  const parts: string[] = []

  // Title and description (most important)
  if (property.title) parts.push(property.title)
  if (property.description) parts.push(property.description)

  // AI summary if available
  if (property.ai_summary) parts.push(property.ai_summary)

  // Property type and listing type
  const typeMap: Record<string, string> = {
    apartamento: 'apartamento',
    casa: 'casa',
    sobrado: 'sobrado',
    sala_comercial: 'sala comercial',
    terreno: 'terreno',
    fazenda_sitio_chacara: 'fazenda, sítio ou chácara',
    loft: 'loft',
    cobertura: 'cobertura',
  }
  
  if (property.property_type) {
    const typeText = typeMap[property.property_type] || property.property_type
    const listingText = property.listing_type === 'rent' ? 'para alugar' : 'para vender'
    parts.push(`${typeText} ${listingText}`)
  }

  // Specs
  const specs: string[] = []
  if (property.bedrooms) specs.push(`${property.bedrooms} quartos`)
  if (property.bathrooms) specs.push(`${property.bathrooms} banheiros`)
  if (property.parking_spaces) specs.push(`${property.parking_spaces} vagas`)
  if (property.area_total) specs.push(`${property.area_total}m²`)
  if (specs.length > 0) parts.push(specs.join(', '))

  // Location
  const location: string[] = []
  if (property.address_neighborhood) location.push(property.address_neighborhood)
  if (property.address_city) location.push(property.address_city)
  if (property.address_state) location.push(property.address_state)
  if (location.length > 0) parts.push(`Localização: ${location.join(', ')}`)

  // Features
  if (property.features && Array.isArray(property.features)) {
    const featuresText = property.features.join(', ')
    if (featuresText) parts.push(`Características: ${featuresText}`)
  }

  return parts.filter(Boolean).join('. ')
}

/**
 * Generate text representation of a client's preferences for embedding
 */
export function clientPreferencesToText(client: ClientEmbeddingInput): string {
  const parts: string[] = []

  // Budget range
  if (client.budget_min || client.budget_max) {
    const budgetParts: string[] = []
    if (client.budget_min) budgetParts.push(`a partir de R$ ${client.budget_min.toLocaleString('pt-BR')}`)
    if (client.budget_max) budgetParts.push(`até R$ ${client.budget_max.toLocaleString('pt-BR')}`)
    parts.push(`Orçamento: ${budgetParts.join(' ')}`)
  }

  // Property types preference
  if (client.preferred_property_types && client.preferred_property_types.length > 0) {
    const typeMap: Record<string, string> = {
      apartamento: 'apartamento',
      casa: 'casa',
      sobrado: 'sobrado',
      sala_comercial: 'sala comercial',
      terreno: 'terreno',
      fazenda_sitio_chacara: 'fazenda, sítio ou chácara',
      loft: 'loft',
      cobertura: 'cobertura',
    }
    const types = client.preferred_property_types
      .map((t) => typeMap[t] || t)
      .join(', ')
    parts.push(`Tipos de imóvel: ${types}`)
  }

  // Minimum requirements
  const reqs: string[] = []
  if (client.min_bedrooms) reqs.push(`pelo menos ${client.min_bedrooms} quartos`)
  if (client.min_bathrooms) reqs.push(`pelo menos ${client.min_bathrooms} banheiros`)
  if (reqs.length > 0) parts.push(`Requisitos: ${reqs.join(', ')}`)

  // Preferred neighborhoods
  if (client.preferred_neighborhoods && client.preferred_neighborhoods.length > 0) {
    parts.push(`Bairros preferidos: ${client.preferred_neighborhoods.join(', ')}`)
  }

  // Required features
  if (client.required_features && client.required_features.length > 0) {
    parts.push(`Características essenciais: ${client.required_features.join(', ')}`)
  }

  // Notes
  if (client.notes) {
    parts.push(client.notes)
  }

  return parts.filter(Boolean).join('. ')
}

/**
 * Generate embedding for a text using OpenAI
 */
async function generateEmbeddingWithRetry(
  text: string,
  retries = 0
): Promise<{ embedding: number[]; tokensUsed: number }> {
  try {
    const client = getOpenAIClient()
    const response = await client.embeddings.create({
      model: EMBEDDING_MODEL,
      input: text,
      encoding_format: 'float',
    })

    const embedding = response.data[0].embedding
    const tokensUsed = response.usage?.total_tokens || 0

    return { embedding, tokensUsed }
  } catch (error: any) {
    // Retry on rate limit or transient errors
    if (retries < MAX_RETRIES && (error?.status === 429 || error?.status >= 500)) {
      const delay = RETRY_DELAY_MS * Math.pow(2, retries)
      console.warn(`⚠️  OpenAI error, retrying in ${delay}ms... (attempt ${retries + 1}/${MAX_RETRIES})`)
      await new Promise((resolve) => setTimeout(resolve, delay))
      return generateEmbeddingWithRetry(text, retries + 1)
    }
    throw error
  }
}

/**
 * Generate embedding for a property
 */
export async function generatePropertyEmbedding(
  property: PropertyEmbeddingInput
): Promise<EmbeddingGenerationResult> {
  try {
    const text = propertyToText(property)
    
    if (!text || text.trim().length === 0) {
      return {
        success: false,
        id: property.id,
        error: 'No text content to generate embedding',
      }
    }

    const { embedding, tokensUsed } = await generateEmbeddingWithRetry(text)

    return {
      success: true,
      id: property.id,
      embedding,
      tokensUsed,
    }
  } catch (error: any) {
    console.error(`❌ Error generating embedding for property ${property.id}:`, error.message)
    return {
      success: false,
      id: property.id,
      error: error.message || 'Unknown error',
    }
  }
}

/**
 * Generate embedding for a client's preferences
 */
export async function generateClientEmbedding(
  client: ClientEmbeddingInput
): Promise<EmbeddingGenerationResult> {
  try {
    const text = clientPreferencesToText(client)

    if (!text || text.trim().length === 0) {
      return {
        success: false,
        id: client.id,
        error: 'No preferences to generate embedding',
      }
    }

    const { embedding, tokensUsed } = await generateEmbeddingWithRetry(text)

    return {
      success: true,
      id: client.id,
      embedding,
      tokensUsed,
    }
  } catch (error: any) {
    console.error(`❌ Error generating embedding for client ${client.id}:`, error.message)
    return {
      success: false,
      id: client.id,
      error: error.message || 'Unknown error',
    }
  }
}

/**
 * Generate embedding for a search query
 */
export async function generateQueryEmbedding(query: string): Promise<number[]> {
  if (!query || query.trim().length === 0) {
    throw new Error('Query cannot be empty')
  }

  const { embedding } = await generateEmbeddingWithRetry(query)
  return embedding
}

/**
 * Batch generate embeddings for multiple properties
 */
export async function batchGeneratePropertyEmbeddings(
  properties: PropertyEmbeddingInput[],
  onProgress?: (processed: number, total: number) => void
): Promise<EmbeddingGenerationResult[]> {
  const results: EmbeddingGenerationResult[] = []

  for (let i = 0; i < properties.length; i++) {
    const result = await generatePropertyEmbedding(properties[i])
    results.push(result)

    if (onProgress) {
      onProgress(i + 1, properties.length)
    }

    // Rate limiting: small delay between requests
    if (i < properties.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 50))
    }
  }

  return results
}

/**
 * Batch generate embeddings for multiple clients
 */
export async function batchGenerateClientEmbeddings(
  clients: ClientEmbeddingInput[],
  onProgress?: (processed: number, total: number) => void
): Promise<EmbeddingGenerationResult[]> {
  const results: EmbeddingGenerationResult[] = []

  for (let i = 0; i < clients.length; i++) {
    const result = await generateClientEmbedding(clients[i])
    results.push(result)

    if (onProgress) {
      onProgress(i + 1, clients.length)
    }

    // Rate limiting: small delay between requests
    if (i < clients.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 50))
    }
  }

  return results
}

/**
 * Calculate estimated cost for generating embeddings
 * @param tokenCount Total number of tokens
 * @returns Cost in USD
 */
export function calculateEmbeddingCost(tokenCount: number): number {
  // text-embedding-3-small: $0.02 per 1M tokens
  return (tokenCount / 1_000_000) * 0.02
}

/**
 * Estimate tokens for a text (rough approximation)
 * On average: 1 token ≈ 4 characters for Portuguese
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}
