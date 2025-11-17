# 🤖 Property Enrichment System

AI-powered data enrichment for real estate properties using OpenAI GPT-4o-mini.

## 📋 Overview

This system automatically extracts and structures data from property listings to improve search quality and data consistency.

### What It Does

Transforms messy, unstructured property data like this:

```json
{
  "title": "Apartamento com 3 Quartos para Alugar em Jundiaí",
  "description": "Lindo apartamento...",
  "property_type": null,
  "bedrooms": null,
  "address_neighborhood": null,
  "features": []
}
```

Into clean, structured data like this:

```json
{
  "property_type": "apartamento",
  "listing_type": "rent",
  "bedrooms": 3,
  "bathrooms": 2,
  "parking_spaces": 1,
  "address_neighborhood": "Centro",
  "features": ["piscina", "academia", "churrasqueira"],
  "ai_summary": "Apartamento de 3 quartos no Centro de Jundiaí..."
}
```

## 🚀 Quick Start

### 1. Validate Current Data Quality

Check how much of your data needs enrichment:

```bash
pnpm validate
```

Example output:
```
📊 DATA QUALITY VALIDATION REPORT
Total Active Properties: 582
  AI Summary:          45 / 582 (7.7%)
  Property Type:       430 / 582 (73.9%)
  Neighborhood:        2 / 582 (0.3%)

OVERALL QUALITY SCORE: 42/100
⚠️ Poor data quality. Enrichment highly recommended!
```

### 2. Test Enrichment (Dry Run)

Test on 3 properties without saving:

```bash
pnpm enrich:test
```

### 3. Run Full Enrichment

Process all properties:

```bash
pnpm enrich
```

Advanced options:

```bash
# Process only 50 properties
pnpm enrich -- --limit=50

# Only enrich properties missing summaries
pnpm enrich -- --missing-summary

# Force re-enrich all properties
pnpm enrich -- --force

# Dry run on 100 properties
pnpm enrich -- --dry-run --limit=100

# Custom batch size and delay
pnpm enrich -- --batch-size=10 --delay=2000
```

## 📁 File Structure

```
lib/enrichment/
├── types.ts           # TypeScript type definitions
├── parser.ts          # OpenAI-powered parsing logic
├── auto-enrich.ts     # Automatic enrichment for new properties
└── README.md          # This file

scripts/
├── enrich-properties.ts      # Batch enrichment script
└── validate-enrichment.ts    # Data quality validation

app/api/properties/enrich/
└── route.ts           # API endpoint for on-demand enrichment
```

## 🔧 How It Works

### Batch Enrichment (scripts/enrich-properties.ts)

1. **Fetch** properties needing enrichment from Supabase
2. **Process** in batches of 5 (configurable) using OpenAI
3. **Extract** structured data from title + description
4. **Validate** extracted data (enums, numbers, etc.)
5. **Save** to database
6. **Report** stats and estimated cost

**Cost**: ~$0.0001 per property (~$0.06 for 582 properties)
**Time**: ~15 minutes for 582 properties (with rate limiting)

### Automatic Enrichment (lib/enrichment/auto-enrich.ts)

Called automatically when new properties are added:

```typescript
import { autoEnrichProperty } from '@/lib/enrichment/auto-enrich'

// After inserting a new property
await autoEnrichProperty(newProperty.id)
```

Or via API:

```bash
curl -X POST http://localhost:3000/api/properties/enrich \
  -H "Content-Type: application/json" \
  -d '{"propertyId": "uuid-here"}'
```

## 🎯 What Gets Extracted

### Critical Fields (Always Extracted)
- `property_type` - apartamento, casa, sobrado, etc.
- `listing_type` - rent or sale
- `ai_summary` - 2-3 sentence summary in Portuguese

### Important Fields (When Available)
- `bedrooms` - Number of bedrooms
- `bathrooms` - Number of bathrooms
- `suites` - Number of suites (bedrooms with private bathroom)
- `parking_spaces` - Number of parking spots
- `address_neighborhood` - Neighborhood name

### Financial Fields
- `price_monthly` - Monthly rental price
- `price_total` - Total sale price
- `condominium_fee` - Monthly condo fee
- `iptu_monthly` / `iptu_annual` - Property tax

### Additional Data
- `furnished` - furnished, unfurnished, semi_furnished
- `features` - Array of amenities (piscina, academia, etc.)

## 📊 Data Quality Metrics

The validation script calculates a quality score (0-100) based on:

- **AI Summary** (25 weight) - Critical for search and display
- **Property Type** (20%) - Essential for filtering
- **Listing Type** (15%) - Rent vs sale classification
- **Bedrooms** (15%) - Important search criterion
- **Neighborhood** (15%) - Key location data
- **Features** (10%) - Nice-to-have amenities

**Quality Levels:**
- 90-100: Excellent (production-ready)
- 70-89: Good (minor improvements needed)
- 50-69: Moderate (enrichment recommended)
- 0-49: Poor (enrichment required)

## 🔄 Workflow Integration

### For New Properties (Future Scraper Integration)

Add enrichment to your property ingestion pipeline:

```typescript
// In your scraper/import script
import { autoEnrichProperty } from '@/lib/enrichment/auto-enrich'

const newProperty = await supabase.from('properties').insert({
  source_url: url,
  title: scrapedTitle,
  description: scrapedDescription,
  // ... other fields
}).select().single()

// Automatically enrich
await autoEnrichProperty(newProperty.id)
```

### Background Job (Optional)

For continuous enrichment, set up a cron job:

```typescript
// Example: Vercel Cron or similar
export async function GET() {
  // Find unenriched properties
  const { data } = await supabase
    .from('properties')
    .select('id')
    .is('ai_summary', null)
    .limit(50)
  
  // Enrich them
  await autoEnrichProperties(data.map(p => p.id))
  
  return Response.json({ enriched: data.length })
}
```

## ⚠️ Important Notes

### Environment Variables Required

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_key
```

### Rate Limiting

The batch script includes built-in delays (default: 1000ms between batches) to avoid hitting OpenAI rate limits.

### Token Usage

- Average: ~500 tokens per property
- Cost: ~$0.0001 per property (GPT-4o-mini)
- 582 properties ≈ 290,000 tokens ≈ $0.06 total

### Data Validation

All extracted data is validated before saving:
- Enums are checked against allowed values
- Numbers are parsed and validated
- Arrays are deduplicated and cleaned
- Missing fields default to `null`

## 🐛 Troubleshooting

### "Missing OPENAI_API_KEY"
Make sure your `.env.local` file has the OpenAI API key set.

### "Empty response from OpenAI"
Rare error - the script will retry or you can re-run with the failed property IDs.

### "Property already enriched, skipping"
The script only enriches properties missing `ai_summary` by default. Use `--force` to re-enrich.

### Rate limit errors
Increase the delay: `pnpm enrich -- --delay=2000`

## 📈 Expected Results

After running enrichment on 582 properties:

**Before:**
- AI Summary: 7.7%
- Property Type: 73.9%
- Neighborhood: 0.3%
- Quality Score: 42/100

**After:**
- AI Summary: 100%
- Property Type: 100%
- Neighborhood: 85%+
- Quality Score: 90+/100

This will dramatically improve:
- ✅ Search accuracy
- ✅ Agent productivity
- ✅ Property matching quality
- ✅ User experience

## 🎯 Next Steps

1. Run `pnpm validate` to check current quality
2. Run `pnpm enrich:test` to test on 3 properties
3. Review results, then run full enrichment
4. Integrate auto-enrichment into your scraper
5. Set up validation as part of CI/CD

---

**Questions?** Check the code comments in:
- `lib/enrichment/parser.ts` - Core enrichment logic
- `scripts/enrich-properties.ts` - Batch processing
- `lib/enrichment/auto-enrich.ts` - Auto-enrichment
