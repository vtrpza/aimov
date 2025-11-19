#!/usr/bin/env tsx
/**
 * Re-enrichment script to extract missing neighborhood data from existing properties
 * 
 * This script specifically targets properties that are missing address_neighborhood
 * and uses AI to extract it from title/description
 * 
 * Usage:
 *   pnpm tsx scripts/re-enrich-neighborhoods.ts [--dry-run] [--batch-size=50]
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'
import path from 'path'

// Load environment variables
config({ path: path.join(__dirname, '..', '.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface Property {
  id: string
  title: string
  description: string | null
  address_city: string | null
  address_state: string | null
  address_neighborhood: string | null
  address_street: string | null
  address_number: string | null
  address_zipcode: string | null
}

interface NeighborhoodExtractionResult {
  neighborhood: string | null
  confidence: 'high' | 'medium' | 'low'
}

// Parse command line args
const args = process.argv.slice(2)
const isDryRun = args.includes('--dry-run')
const batchSizeArg = args.find(arg => arg.startsWith('--batch-size='))
const batchSize = batchSizeArg ? parseInt(batchSizeArg.split('=')[1]) : 50

/**
 * Extract neighborhood from property data using AI
 */
async function extractNeighborhood(property: Property): Promise<NeighborhoodExtractionResult> {
  const prompt = `Analise esta listagem de imóvel e extraia APENAS o nome do bairro:

TÍTULO: ${property.title}
DESCRIÇÃO: ${property.description || 'N/A'}
RUA: ${property.address_street || 'N/A'}
NÚMERO: ${property.address_number || 'N/A'}
CEP: ${property.address_zipcode || 'N/A'}
CIDADE: ${property.address_city || 'N/A'}
ESTADO: ${property.address_state || 'N/A'}

Retorne um JSON com:
{
  "neighborhood": "nome do bairro" ou null,
  "confidence": "high|medium|low"
}

REGRAS IMPORTANTES:
1. PRIORIDADE 1: Use o nome da rua (address_street) para identificar o bairro conhecido em Jundiaí
2. PRIORIDADE 2: Procure por menções explícitas de bairro no título ou descrição
3. Exemplos de bairros em Jundiaí: "Centro", "Vila Arens", "Jardim Ana Estela", "Anhangabaú", "Vila Hortolândia", "Engordadouro", "Malota"
4. Se mencionar apenas "região central" ou "centro", use "Centro" como bairro
5. Use seu conhecimento de ruas de Jundiaí para identificar o bairro pela rua
6. Se tiver CEP, use-o para ajudar a identificar o bairro
7. confidence = "high" se o bairro é mencionado explicitamente ou se a rua é bem conhecida
8. confidence = "medium" se for inferido de contexto ou conhecimento da rua
9. confidence = "low" se houver dúvida ou informação insuficiente

Retorne APENAS o JSON, sem texto adicional.`

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Você é um especialista em imóveis brasileiros. Extraia nomes de bairros com precisão.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0,
    })

    const content = response.choices[0].message.content
    if (!content) {
      throw new Error('Empty response from OpenAI')
    }

    const result = JSON.parse(content) as NeighborhoodExtractionResult

    // Validate and clean
    if (result.neighborhood) {
      result.neighborhood = result.neighborhood.trim()
      if (result.neighborhood.length === 0) {
        result.neighborhood = null
      }
    }

    return result
  } catch (error) {
    console.error(`❌ Error extracting neighborhood for ${property.id}:`, error)
    return { neighborhood: null, confidence: 'low' }
  }
}

/**
 * Process properties in batches
 */
async function processPropertiesInBatches() {
  console.log('🔍 Fetching properties without neighborhood...\n')

  const { data: properties, error } = await supabase
    .from('properties')
    .select('id, title, description, address_city, address_state, address_neighborhood, address_street, address_number, address_zipcode')
    .is('deleted_at', null)
    .eq('status', 'active')
    .is('address_neighborhood', null)

  if (error || !properties) {
    throw new Error(`Failed to fetch properties: ${error?.message}`)
  }

  console.log(`Found ${properties.length} properties without neighborhood\n`)

  if (properties.length === 0) {
    console.log('✅ No properties need re-enrichment!')
    return
  }

  if (isDryRun) {
    console.log('🔍 DRY RUN MODE - No changes will be saved\n')
  }

  let updated = 0
  let skipped = 0
  let failed = 0
  const results: Array<{ id: string; neighborhood: string | null; confidence: string }> = []

  // Process in batches
  for (let i = 0; i < properties.length; i += batchSize) {
    const batch = properties.slice(i, i + batchSize)
    const batchNum = Math.floor(i / batchSize) + 1
    const totalBatches = Math.ceil(properties.length / batchSize)

    console.log(`\n📦 Processing batch ${batchNum}/${totalBatches} (${batch.length} properties)...`)

    // Process batch sequentially to avoid rate limits
    for (const property of batch) {
      try {
        const result = await extractNeighborhood(property)

        if (result.neighborhood) {
          console.log(
            `  ✓ ${property.id}: "${result.neighborhood}" (confidence: ${result.confidence})`
          )

          results.push({
            id: property.id,
            neighborhood: result.neighborhood,
            confidence: result.confidence,
          })

          if (!isDryRun) {
            const { error: updateError } = await supabase
              .from('properties')
              .update({ address_neighborhood: result.neighborhood })
              .eq('id', property.id)

            if (updateError) {
              console.error(`  ❌ Failed to update ${property.id}:`, updateError)
              failed++
            } else {
              updated++
            }
          } else {
            updated++ // Count as updated in dry run
          }
        } else {
          console.log(`  - ${property.id}: No neighborhood found`)
          skipped++
        }

        // Small delay to avoid rate limits
        await new Promise((resolve) => setTimeout(resolve, 100))
      } catch (error) {
        console.error(`  ❌ Error processing ${property.id}:`, error)
        failed++
      }
    }

    // Longer delay between batches
    if (i + batchSize < properties.length) {
      console.log('  ⏸️  Pausing before next batch...')
      await new Promise((resolve) => setTimeout(resolve, 2000))
    }
  }

  // Print summary
  console.log('\n' + '='.repeat(60))
  console.log('📊 RE-ENRICHMENT SUMMARY')
  console.log('='.repeat(60))
  console.log(`Total properties processed: ${properties.length}`)
  console.log(`✅ Updated: ${updated}`)
  console.log(`⏭️  Skipped (no neighborhood found): ${skipped}`)
  console.log(`❌ Failed: ${failed}`)
  console.log()

  // Show confidence breakdown
  if (results.length > 0) {
    const high = results.filter((r) => r.confidence === 'high').length
    const medium = results.filter((r) => r.confidence === 'medium').length
    const low = results.filter((r) => r.confidence === 'low').length

    console.log('CONFIDENCE BREAKDOWN:')
    console.log(`  High:   ${high} (${((high / results.length) * 100).toFixed(1)}%)`)
    console.log(`  Medium: ${medium} (${((medium / results.length) * 100).toFixed(1)}%)`)
    console.log(`  Low:    ${low} (${((low / results.length) * 100).toFixed(1)}%)`)
    console.log()
  }

  if (isDryRun) {
    console.log('ℹ️  This was a dry run. Run without --dry-run to save changes.')
  } else {
    console.log('✅ Re-enrichment complete! Run validate script to see new stats.')
  }

  console.log('='.repeat(60) + '\n')
}

async function main() {
  try {
    console.log('🏘️  NEIGHBORHOOD RE-ENRICHMENT SCRIPT')
    console.log('='.repeat(60))
    console.log(`Mode: ${isDryRun ? 'DRY RUN' : 'LIVE'}`)
    console.log(`Batch size: ${batchSize}`)
    console.log('='.repeat(60) + '\n')

    await processPropertiesInBatches()
  } catch (error) {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

export { extractNeighborhood }
