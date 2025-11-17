/**
 * Automatic enrichment for newly added properties
 * Can be called from API routes or background jobs
 */

import { enrichPropertyWithAI } from './parser'
import { EnrichmentInput } from './types'
import { createClient } from '@/lib/supabase/server'

/**
 * Check if a property needs enrichment
 */
export function needsEnrichment(property: any): boolean {
  // Needs enrichment if:
  // 1. Missing ai_summary
  // 2. Missing property_type
  // 3. Missing listing_type
  // 4. Missing bedrooms (for residential properties)
  
  if (!property.ai_summary) return true
  if (!property.property_type) return true
  if (!property.listing_type) return true
  
  // For properties that should have bedrooms
  const shouldHaveBedrooms = [
    'apartamento',
    'casa',
    'sobrado',
    'loft',
    'cobertura',
  ].includes(property.property_type)
  
  if (shouldHaveBedrooms && !property.bedrooms) return true
  
  return false
}

/**
 * Automatically enrich a single property
 * This can be called whenever a new property is inserted
 */
export async function autoEnrichProperty(propertyId: string): Promise<boolean> {
  try {
    const supabase = await createClient()

    // Fetch property
    const { data: property, error: fetchError } = await supabase
      .from('properties')
      .select('*')
      .eq('id', propertyId)
      .single()

    if (fetchError || !property) {
      console.error(`Failed to fetch property ${propertyId}:`, fetchError)
      return false
    }

    // Check if enrichment is needed
    if (!needsEnrichment(property)) {
      console.log(`Property ${propertyId} already enriched, skipping`)
      return true
    }

    console.log(`🤖 Auto-enriching property ${propertyId}`)

    // Enrich using AI
    const result = await enrichPropertyWithAI(property as EnrichmentInput)

    if (!result.success || !result.enrichedData) {
      console.error(`Failed to enrich property ${propertyId}:`, result.error)
      return false
    }

    // Update property
    const { error: updateError } = await supabase
      .from('properties')
      // @ts-ignore - Supabase type inference issue
      .update(result.enrichedData)
      .eq('id', propertyId)

    if (updateError) {
      console.error(`Failed to update property ${propertyId}:`, updateError)
      return false
    }

    console.log(`✅ Successfully enriched property ${propertyId}`)
    return true
  } catch (error) {
    console.error(`Error in autoEnrichProperty:`, error)
    return false
  }
}

/**
 * Enrich multiple properties at once
 */
export async function autoEnrichProperties(propertyIds: string[]): Promise<{
  succeeded: string[]
  failed: string[]
}> {
  const results = {
    succeeded: [] as string[],
    failed: [] as string[],
  }

  for (const propertyId of propertyIds) {
    const success = await autoEnrichProperty(propertyId)
    if (success) {
      results.succeeded.push(propertyId)
    } else {
      results.failed.push(propertyId)
    }
  }

  return results
}
