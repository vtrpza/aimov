#!/usr/bin/env tsx
/**
 * Validation script to check data quality after enrichment
 * 
 * Usage:
 *   pnpm tsx scripts/validate-enrichment.ts
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import path from 'path'

// Load environment variables from .env.local
config({ path: path.join(__dirname, '..', '.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface ValidationReport {
  totalProperties: number
  withAiSummary: number
  withPropertyType: number
  withListingType: number
  withBedrooms: number
  withBathrooms: number
  withNeighborhood: number
  withFeatures: number
  completeness: {
    full: number
    partial: number
    minimal: number
  }
  qualityScore: number
}

async function generateValidationReport(): Promise<ValidationReport> {
  console.log('📊 Generating data quality report...\n')

  const { data: properties, error } = await supabase
    .from('properties')
    .select('*')
    .is('deleted_at', null)
    .eq('status', 'active')

  if (error || !properties) {
    throw new Error(`Failed to fetch properties: ${error?.message}`)
  }

  const report: ValidationReport = {
    totalProperties: properties.length,
    withAiSummary: 0,
    withPropertyType: 0,
    withListingType: 0,
    withBedrooms: 0,
    withBathrooms: 0,
    withNeighborhood: 0,
    withFeatures: 0,
    completeness: {
      full: 0,
      partial: 0,
      minimal: 0,
    },
    qualityScore: 0,
  }

  properties.forEach((prop) => {
    if (prop.ai_summary) report.withAiSummary++
    if (prop.property_type) report.withPropertyType++
    if (prop.listing_type) report.withListingType++
    if (prop.bedrooms) report.withBedrooms++
    if (prop.bathrooms) report.withBathrooms++
    if (prop.address_neighborhood) report.withNeighborhood++
    if (prop.features && Array.isArray(prop.features) && prop.features.length > 0) {
      report.withFeatures++
    }

    // Calculate completeness score for this property
    let score = 0
    const criticalFields = [
      prop.ai_summary,
      prop.property_type,
      prop.listing_type,
    ]
    const importantFields = [
      prop.bedrooms,
      prop.bathrooms,
      prop.address_neighborhood,
    ]
    const niceToHave = [
      prop.features && prop.features.length > 0,
      prop.parking_spaces,
      prop.condominium_fee,
    ]

    score += criticalFields.filter(Boolean).length * 3
    score += importantFields.filter(Boolean).length * 2
    score += niceToHave.filter(Boolean).length

    const maxScore = criticalFields.length * 3 + importantFields.length * 2 + niceToHave.length
    const percentage = (score / maxScore) * 100

    if (percentage >= 80) {
      report.completeness.full++
    } else if (percentage >= 50) {
      report.completeness.partial++
    } else {
      report.completeness.minimal++
    }
  })

  // Calculate overall quality score (0-100)
  const weights = {
    aiSummary: 0.25,
    propertyType: 0.20,
    listingType: 0.15,
    bedrooms: 0.15,
    neighborhood: 0.15,
    features: 0.10,
  }

  report.qualityScore = Math.round(
    (report.withAiSummary / report.totalProperties) * weights.aiSummary * 100 +
    (report.withPropertyType / report.totalProperties) * weights.propertyType * 100 +
    (report.withListingType / report.totalProperties) * weights.listingType * 100 +
    (report.withBedrooms / report.totalProperties) * weights.bedrooms * 100 +
    (report.withNeighborhood / report.totalProperties) * weights.neighborhood * 100 +
    (report.withFeatures / report.totalProperties) * weights.features * 100
  )

  return report
}

function printReport(report: ValidationReport) {
  const pct = (count: number) => `${((count / report.totalProperties) * 100).toFixed(1)}%`

  console.log('='.repeat(60))
  console.log('📊 DATA QUALITY VALIDATION REPORT')
  console.log('='.repeat(60))
  console.log(`\nTotal Active Properties: ${report.totalProperties}\n`)
  
  console.log('FIELD COMPLETENESS:')
  console.log(`  AI Summary:          ${report.withAiSummary.toString().padStart(3)} / ${report.totalProperties} (${pct(report.withAiSummary)})`)
  console.log(`  Property Type:       ${report.withPropertyType.toString().padStart(3)} / ${report.totalProperties} (${pct(report.withPropertyType)})`)
  console.log(`  Listing Type:        ${report.withListingType.toString().padStart(3)} / ${report.totalProperties} (${pct(report.withListingType)})`)
  console.log(`  Bedrooms:            ${report.withBedrooms.toString().padStart(3)} / ${report.totalProperties} (${pct(report.withBedrooms)})`)
  console.log(`  Bathrooms:           ${report.withBathrooms.toString().padStart(3)} / ${report.totalProperties} (${pct(report.withBathrooms)})`)
  console.log(`  Neighborhood:        ${report.withNeighborhood.toString().padStart(3)} / ${report.totalProperties} (${pct(report.withNeighborhood)})`)
  console.log(`  Features:            ${report.withFeatures.toString().padStart(3)} / ${report.totalProperties} (${pct(report.withFeatures)})`)

  console.log('\nCOMPLETENESS DISTRIBUTION:')
  console.log(`  Full (80%+):         ${report.completeness.full.toString().padStart(3)} properties`)
  console.log(`  Partial (50-80%):    ${report.completeness.partial.toString().padStart(3)} properties`)
  console.log(`  Minimal (<50%):      ${report.completeness.minimal.toString().padStart(3)} properties`)

  console.log(`\nOVERALL QUALITY SCORE: ${report.qualityScore}/100`)

  // Recommendations
  console.log('\nRECOMMENDATIONS:')
  if (report.qualityScore >= 90) {
    console.log('  ✅ Excellent data quality! Ready for production.')
  } else if (report.qualityScore >= 70) {
    console.log('  ⚠️  Good data quality, but some improvements needed.')
  } else if (report.qualityScore >= 50) {
    console.log('  ⚠️  Moderate data quality. Run enrichment script.')
  } else {
    console.log('  ❌ Poor data quality. Enrichment highly recommended!')
  }

  if (report.withAiSummary < report.totalProperties) {
    const missing = report.totalProperties - report.withAiSummary
    console.log(`  - ${missing} properties missing AI summaries`)
  }
  if (report.withPropertyType < report.totalProperties) {
    const missing = report.totalProperties - report.withPropertyType
    console.log(`  - ${missing} properties missing property type`)
  }
  if (report.withNeighborhood < report.totalProperties) {
    const missing = report.totalProperties - report.withNeighborhood
    console.log(`  - ${missing} properties missing neighborhood`)
  }

  console.log('\n' + '='.repeat(60) + '\n')
}

async function main() {
  try {
    const report = await generateValidationReport()
    printReport(report)
    
    // Exit with error code if quality is poor
    if (report.qualityScore < 50) {
      process.exit(1)
    }
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

export { generateValidationReport }
