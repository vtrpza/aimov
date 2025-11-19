#!/usr/bin/env tsx
// @ts-nocheck - POC project with ignoreBuildErrors enabled
/**
 * Script to generate embeddings for properties and clients
 * 
 * Usage:
 *   pnpm embed                    # Generate embeddings for all
 *   pnpm embed:properties         # Only properties
 *   pnpm embed:clients            # Only clients
 *   pnpm embed:dry-run            # Preview without saving
 * 
 * Options:
 *   --type=properties|clients     # Type to process
 *   --limit=N                     # Limit number to process
 *   --force                       # Re-generate even if embedding exists
 *   --dry-run                     # Don't save to database
 */

import { config } from 'dotenv'
import { resolve } from 'path'

// Load .env.local first, then .env as fallback
config({ path: resolve(process.cwd(), '.env.local') })
config({ path: resolve(process.cwd(), '.env') })
import { createClient } from '@supabase/supabase-js'
import {
  batchGeneratePropertyEmbeddings,
  batchGenerateClientEmbeddings,
  calculateEmbeddingCost,
  estimateTokens,
  propertyToText,
  clientPreferencesToText,
} from '../lib/embeddings/openai-embeddings'
import type { Database } from '../types/database'
import type { PropertyEmbeddingInput, ClientEmbeddingInput, BatchEmbeddingStats } from '../lib/embeddings/types'

// Parse command line arguments
const args = process.argv.slice(2)
const getArg = (name: string): string | undefined => {
  const arg = args.find((a) => a.startsWith(`--${name}=`))
  return arg?.split('=')[1]
}
const hasFlag = (name: string): boolean => args.includes(`--${name}`)

const typeArg = getArg('type') as 'properties' | 'clients' | undefined
const limitArg = getArg('limit') ? parseInt(getArg('limit')!) : undefined
const isDryRun = hasFlag('dry-run')
const forceRegenerate = hasFlag('force')

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in environment variables')
  process.exit(1)
}

if (!process.env.OPENAI_API_KEY) {
  console.error('❌ Missing OPENAI_API_KEY in environment variables')
  process.exit(1)
}

const supabase = createClient<Database>(supabaseUrl, supabaseKey)

/**
 * Generate embeddings for properties
 */
async function generatePropertyEmbeddings(): Promise<BatchEmbeddingStats> {
  console.log('\n🏠 Generating embeddings for properties...\n')

  // Fetch properties that need embeddings
  let query = supabase
    .from('properties')
    .select('id, title, description, property_type, listing_type, address_city, address_state, address_neighborhood, bedrooms, bathrooms, parking_spaces, area_total, features, ai_summary')
    .is('deleted_at', null)

  if (!forceRegenerate) {
    query = query.is('ai_embedding', null)
  }

  if (limitArg) {
    query = query.limit(limitArg)
  }

  const { data: properties, error } = await query as any

  if (error) {
    throw new Error(`Failed to fetch properties: ${error.message}`)
  }

  if (!properties || properties.length === 0) {
    console.log('✅ No properties need embeddings')
    return {
      total: 0,
      processed: 0,
      succeeded: 0,
      failed: 0,
      skipped: 0,
      totalTokens: 0,
      estimatedCost: 0,
    }
  }

  console.log(`📊 Found ${properties.length} properties to process`)

  // Estimate cost
  const estimatedTokens = properties.reduce((sum: number, prop: any) => {
    const text = propertyToText(prop as unknown as PropertyEmbeddingInput)
    return sum + estimateTokens(text)
  }, 0)
  const estimatedCost = calculateEmbeddingCost(estimatedTokens)

  console.log(`💰 Estimated: ${estimatedTokens.toLocaleString()} tokens, $${estimatedCost.toFixed(4)} USD\n`)

  if (isDryRun) {
    console.log('🔍 DRY RUN - No embeddings will be generated or saved\n')
    properties.slice(0, 3).forEach((prop: any, idx: number) => {
      const text = propertyToText(prop as unknown as PropertyEmbeddingInput)
      console.log(`${idx + 1}. ${prop.title}`)
      console.log(`   Text: ${text.substring(0, 150)}...`)
      console.log(`   Estimated tokens: ${estimateTokens(text)}`)
      console.log()
    })

    return {
      total: properties.length,
      processed: 0,
      succeeded: 0,
      failed: 0,
      skipped: properties.length,
      totalTokens: 0,
      estimatedCost: 0,
    }
  }

  // Generate embeddings
  const stats: BatchEmbeddingStats = {
    total: properties.length,
    processed: 0,
    succeeded: 0,
    failed: 0,
    skipped: 0,
    totalTokens: 0,
    estimatedCost: 0,
  }

  console.log('🚀 Generating embeddings...\n')

  const results = await batchGeneratePropertyEmbeddings(
    properties as unknown as PropertyEmbeddingInput[],
    (processed, total) => {
      process.stdout.write(`\r⏳ Progress: ${processed}/${total} (${Math.round((processed / total) * 100)}%)`)
    }
  )

  console.log('\n')

  // Save embeddings to database
  for (const result of results) {
    stats.processed++

    if (!result.success) {
      stats.failed++
      console.error(`❌ Failed: ${result.id} - ${result.error}`)
      continue
    }

    // Update property with embedding
    const { error: updateError } = await supabase
      .from('properties')
      .update({ ai_embedding: JSON.stringify(result.embedding) } as any)
      .eq('id', result.id)

    if (updateError) {
      stats.failed++
      console.error(`❌ Failed to save: ${result.id} - ${updateError.message}`)
    } else {
      stats.succeeded++
      stats.totalTokens += result.tokensUsed || 0
    }
  }

  stats.estimatedCost = calculateEmbeddingCost(stats.totalTokens)

  return stats
}

/**
 * Generate embeddings for clients
 */
async function generateClientEmbeddings(): Promise<BatchEmbeddingStats> {
  console.log('\n👥 Generating embeddings for clients...\n')

  // Fetch clients that need embeddings
  let query = supabase
    .from('clients')
    .select('id, full_name, budget_min, budget_max, preferred_neighborhoods, preferred_property_types, min_bedrooms, min_bathrooms, required_features, notes')
    .is('deleted_at', null)

  if (!forceRegenerate) {
    query = query.is('preferences_embedding', null)
  }

  if (limitArg) {
    query = query.limit(limitArg)
  }

  const { data: clients, error } = await query as any

  if (error) {
    throw new Error(`Failed to fetch clients: ${error.message}`)
  }

  if (!clients || clients.length === 0) {
    console.log('✅ No clients need embeddings')
    return {
      total: 0,
      processed: 0,
      succeeded: 0,
      failed: 0,
      skipped: 0,
      totalTokens: 0,
      estimatedCost: 0,
    }
  }

  console.log(`📊 Found ${clients.length} clients to process`)

  // Estimate cost
  const estimatedTokens = clients.reduce((sum: number, client: any) => {
    const text = clientPreferencesToText(client as unknown as ClientEmbeddingInput)
    return sum + estimateTokens(text)
  }, 0)
  const estimatedCost = calculateEmbeddingCost(estimatedTokens)

  console.log(`💰 Estimated: ${estimatedTokens.toLocaleString()} tokens, $${estimatedCost.toFixed(4)} USD\n`)

  if (isDryRun) {
    console.log('🔍 DRY RUN - No embeddings will be generated or saved\n')
    clients.slice(0, 3).forEach((client: any, idx: number) => {
      const text = clientPreferencesToText(client as unknown as ClientEmbeddingInput)
      console.log(`${idx + 1}. ${client.full_name}`)
      console.log(`   Text: ${text.substring(0, 150)}...`)
      console.log(`   Estimated tokens: ${estimateTokens(text)}`)
      console.log()
    })

    return {
      total: clients.length,
      processed: 0,
      succeeded: 0,
      failed: 0,
      skipped: clients.length,
      totalTokens: 0,
      estimatedCost: 0,
    }
  }

  // Generate embeddings
  const stats: BatchEmbeddingStats = {
    total: clients.length,
    processed: 0,
    succeeded: 0,
    failed: 0,
    skipped: 0,
    totalTokens: 0,
    estimatedCost: 0,
  }

  console.log('🚀 Generating embeddings...\n')

  const results = await batchGenerateClientEmbeddings(
    clients as unknown as ClientEmbeddingInput[],
    (processed, total) => {
      process.stdout.write(`\r⏳ Progress: ${processed}/${total} (${Math.round((processed / total) * 100)}%)`)
    }
  )

  console.log('\n')

  // Save embeddings to database
  for (const result of results) {
    stats.processed++

    if (!result.success) {
      stats.failed++
      console.error(`❌ Failed: ${result.id} - ${result.error}`)
      continue
    }

    // Update client with embedding
    const { error: updateError } = await supabase
      .from('clients')
      .update({ preferences_embedding: JSON.stringify(result.embedding) } as any)
      .eq('id', result.id)

    if (updateError) {
      stats.failed++
      console.error(`❌ Failed to save: ${result.id} - ${updateError.message}`)
    } else {
      stats.succeeded++
      stats.totalTokens += result.tokensUsed || 0
    }
  }

  stats.estimatedCost = calculateEmbeddingCost(stats.totalTokens)

  return stats
}

/**
 * Print statistics
 */
function printStats(stats: BatchEmbeddingStats, type: string) {
  console.log(`\n${'='.repeat(60)}`)
  console.log(`📊 ${type.toUpperCase()} - FINAL STATISTICS`)
  console.log('='.repeat(60))
  console.log(`Total:      ${stats.total}`)
  console.log(`Processed:  ${stats.processed}`)
  console.log(`✅ Success: ${stats.succeeded}`)
  console.log(`❌ Failed:  ${stats.failed}`)
  console.log(`⏭️  Skipped: ${stats.skipped}`)
  console.log(`🎯 Tokens:  ${stats.totalTokens.toLocaleString()}`)
  console.log(`💰 Cost:    $${stats.estimatedCost.toFixed(4)} USD`)
  console.log('='.repeat(60))
}

/**
 * Main execution
 */
async function main() {
  console.log('╔══════════════════════════════════════════════════════════╗')
  console.log('║          🤖 EMBEDDINGS GENERATION SCRIPT                ║')
  console.log('╚══════════════════════════════════════════════════════════╝')

  if (isDryRun) {
    console.log('⚠️  DRY RUN MODE - No changes will be made')
  }

  if (forceRegenerate) {
    console.log('⚠️  FORCE MODE - Will regenerate existing embeddings')
  }

  try {
    if (typeArg === 'properties') {
      const stats = await generatePropertyEmbeddings()
      printStats(stats, 'Properties')
    } else if (typeArg === 'clients') {
      const stats = await generateClientEmbeddings()
      printStats(stats, 'Clients')
    } else {
      // Generate both
      const propertyStats = await generatePropertyEmbeddings()
      const clientStats = await generateClientEmbeddings()

      printStats(propertyStats, 'Properties')
      printStats(clientStats, 'Clients')

      // Combined stats
      const totalCost = propertyStats.estimatedCost + clientStats.estimatedCost
      const totalTokens = propertyStats.totalTokens + clientStats.totalTokens
      console.log(`\n💵 TOTAL COST: $${totalCost.toFixed(4)} USD (${totalTokens.toLocaleString()} tokens)\n`)
    }

    console.log('✅ Done!\n')
  } catch (error: any) {
    console.error('\n❌ Error:', error.message)
    process.exit(1)
  }
}

main()
