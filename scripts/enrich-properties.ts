#!/usr/bin/env tsx
/**
 * Batch enrichment script for existing properties
 * 
 * Usage:
 *   pnpm tsx scripts/enrich-properties.ts [options]
 * 
 * Options:
 *   --dry-run          Don't save to database, just show results
 *   --force            Re-enrich properties that already have ai_summary
 *   --limit=N          Process only N properties
 *   --batch-size=N     Process N properties at a time (default: 5)
 *   --delay=N          Delay N ms between batches (default: 1000)
 *   --missing-type     Only enrich properties missing property_type
 *   --missing-summary  Only enrich properties missing ai_summary
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { enrichPropertyWithAI } from '../lib/enrichment/parser'
import { EnrichmentStats, BatchEnrichmentOptions } from '../lib/enrichment/types'
import path from 'path'

// Load environment variables from .env.local
config({ path: path.join(__dirname, '..', '.env.local') })

// Initialize Supabase client with service role key for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * Parse command line arguments
 */
function parseArgs(): BatchEnrichmentOptions & { limit?: number } {
  const args = process.argv.slice(2)
  const options: BatchEnrichmentOptions & { limit?: number } = {
    batchSize: 5,
    delayMs: 1000,
    dryRun: false,
    forceReenrich: false,
    filter: {},
  }

  args.forEach((arg) => {
    if (arg === '--dry-run') options.dryRun = true
    if (arg === '--force') options.forceReenrich = true
    if (arg === '--missing-type') options.filter!.missingType = true
    if (arg === '--missing-summary') options.filter!.missingSummary = true
    
    const limitMatch = arg.match(/--limit=(\d+)/)
    if (limitMatch) options.limit = parseInt(limitMatch[1])
    
    const batchMatch = arg.match(/--batch-size=(\d+)/)
    if (batchMatch) options.batchSize = parseInt(batchMatch[1])
    
    const delayMatch = arg.match(/--delay=(\d+)/)
    if (delayMatch) options.delayMs = parseInt(delayMatch[1])
  })

  return options
}

/**
 * Fetch properties that need enrichment
 */
async function fetchPropertiesToEnrich(options: BatchEnrichmentOptions & { limit?: number }) {
  console.log('📊 Fetching properties to enrich...')

  let query = supabase
    .from('properties')
    .select('id, title, description, address_city, address_state, property_type, listing_type, bedrooms, bathrooms, price_monthly, price_total, ai_summary')
    .is('deleted_at', null)
    .eq('status', 'active')

  // Apply filters
  if (!options.forceReenrich) {
    // Default: only enrich properties without ai_summary
    if (options.filter?.missingSummary !== false) {
      query = query.is('ai_summary', null)
    }
  }

  if (options.filter?.missingType) {
    query = query.is('property_type', null)
  }

  if (options.limit) {
    query = query.limit(options.limit)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to fetch properties: ${error.message}`)
  }

  console.log(`✅ Found ${data?.length || 0} properties to enrich`)
  return data || []
}

/**
 * Process properties in batches
 */
async function enrichInBatches(
  properties: any[],
  options: BatchEnrichmentOptions
): Promise<EnrichmentStats> {
  const stats: EnrichmentStats = {
    total: properties.length,
    processed: 0,
    succeeded: 0,
    failed: 0,
    skipped: 0,
    totalTokens: 0,
    estimatedCost: 0,
  }

  const batchSize = options.batchSize || 5
  const batches: any[][] = []

  // Split into batches
  for (let i = 0; i < properties.length; i += batchSize) {
    batches.push(properties.slice(i, i + batchSize))
  }

  console.log(`\n🚀 Processing ${properties.length} properties in ${batches.length} batches of ${batchSize}\n`)

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i]
    console.log(`📦 Batch ${i + 1}/${batches.length} (${batch.length} properties)`)

    // Process batch in parallel
    const results = await Promise.all(
      batch.map((property) => enrichPropertyWithAI(property))
    )

    // Update database and collect stats
    for (const result of results) {
      stats.processed++

      if (result.success && result.enrichedData) {
        stats.succeeded++
        stats.totalTokens += result.tokensUsed || 0

        console.log(`  ✅ ${result.propertyId.slice(0, 8)}... - ${result.enrichedData.property_type || 'unknown type'}`)

        // Save to database (unless dry-run)
        if (!options.dryRun) {
          const { error } = await supabase
            .from('properties')
            .update(result.enrichedData)
            .eq('id', result.propertyId)

          if (error) {
            console.error(`  ❌ Failed to save ${result.propertyId}: ${error.message}`)
            stats.failed++
            stats.succeeded-- // Rollback success count
          }
        } else {
          console.log(`  🔍 [DRY RUN] Would update:`, {
            property_type: result.enrichedData.property_type,
            bedrooms: result.enrichedData.bedrooms,
            price_monthly: result.enrichedData.price_monthly,
            features_count: result.enrichedData.features.length,
          })
        }
      } else {
        stats.failed++
        console.error(`  ❌ ${result.propertyId.slice(0, 8)}... - ${result.error}`)
      }
    }

    // Delay between batches (except for last batch)
    if (i < batches.length - 1 && options.delayMs) {
      console.log(`  ⏳ Waiting ${options.delayMs}ms before next batch...\n`)
      await new Promise((resolve) => setTimeout(resolve, options.delayMs))
    }
  }

  // Calculate estimated cost (GPT-4o-mini pricing)
  // Input: $0.150 / 1M tokens, Output: $0.600 / 1M tokens
  // Average ~500 tokens per property, so use conservative estimate
  stats.estimatedCost = (stats.totalTokens / 1_000_000) * 0.4 // Average of input/output

  return stats
}

/**
 * Print final stats
 */
function printStats(stats: EnrichmentStats, dryRun: boolean) {
  console.log('\n' + '='.repeat(60))
  console.log('📊 ENRICHMENT SUMMARY')
  console.log('='.repeat(60))
  console.log(`Total Properties:    ${stats.total}`)
  console.log(`Processed:           ${stats.processed}`)
  console.log(`Succeeded:           ${stats.succeeded} ✅`)
  console.log(`Failed:              ${stats.failed} ❌`)
  console.log(`Skipped:             ${stats.skipped}`)
  console.log(`Total Tokens Used:   ${stats.totalTokens.toLocaleString()}`)
  console.log(`Estimated Cost:      $${stats.estimatedCost.toFixed(4)}`)
  
  if (dryRun) {
    console.log('\n⚠️  DRY RUN MODE - No changes were saved to database')
  } else {
    console.log('\n✅ Changes saved to database')
  }
  
  console.log('='.repeat(60) + '\n')
}

/**
 * Main execution
 */
async function main() {
  console.log('🤖 Property Enrichment Script\n')

  const options = parseArgs()

  console.log('Configuration:')
  console.log(`  Dry Run:           ${options.dryRun ? 'YES' : 'NO'}`)
  console.log(`  Force Re-enrich:   ${options.forceReenrich ? 'YES' : 'NO'}`)
  console.log(`  Batch Size:        ${options.batchSize}`)
  console.log(`  Delay (ms):        ${options.delayMs}`)
  console.log(`  Limit:             ${options.limit || 'NONE'}`)
  console.log(`  Filter:            ${JSON.stringify(options.filter)}\n`)

  // Validate environment variables
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable')
  }
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('Missing OPENAI_API_KEY environment variable')
  }

  try {
    // Fetch properties
    const properties = await fetchPropertiesToEnrich(options)

    if (properties.length === 0) {
      console.log('✨ No properties to enrich!')
      return
    }

    // Confirm before proceeding (unless dry-run)
    if (!options.dryRun) {
      console.log(`\n⚠️  About to enrich ${properties.length} properties. Press Ctrl+C to cancel...`)
      await new Promise((resolve) => setTimeout(resolve, 3000))
    }

    // Process batches
    const stats = await enrichInBatches(properties, options)

    // Print results
    printStats(stats, options.dryRun || false)

    process.exit(0)
  } catch (error) {
    console.error('\n❌ Fatal error:', error)
    process.exit(1)
  }
}

// Run if executed directly
if (require.main === module) {
  main()
}

export { main }
