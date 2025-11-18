# Neighborhood Data Enrichment Guide

**Issue:** 47% of properties (306/650) are missing neighborhood data  
**Impact:** Location-based searches miss ~half of properties  
**Priority:** Medium (system is functional, but this improves precision)

---

## Why Neighborhoods Matter

Neighborhoods are crucial for:
- ✅ Location-specific searches ("apartments in Jardins")
- ✅ Local market analysis and pricing
- ✅ Property value comparisons
- ✅ Client preference matching by area
- ✅ Better property recommendations

---

## Current Status

```
Total Properties: 650
With Neighborhood: 344 (52.9%)
Missing Neighborhood: 306 (47.1%)
```

**Why some are missing:**
1. Property descriptions don't explicitly mention neighborhood
2. Informal neighborhood names not recognized by AI
3. Only city/state mentioned in source data

---

## Solutions

### Option 1: Re-run AI Enrichment (Recommended)

Try extracting neighborhoods again from existing data:

```bash
# Test first (dry run)
pnpm enrich -- --missing-neighborhood --dry-run --limit=10

# Review results, then run for real
pnpm enrich -- --missing-neighborhood
```

**Expected:**
- May find 50-100 more neighborhoods from descriptions
- Cost: ~$0.03 (306 properties)
- Time: 5-10 minutes
- Improvement: 53% → 65-70%

**Limitations:**
- Only works if neighborhood is mentioned in description
- Won't help if source data lacks neighborhood info

---

### Option 2: Geocoding Enhancement (Best Results)

If you have latitude/longitude data, use reverse geocoding:

**Implementation:**

```typescript
// lib/geocoding/reverse-geocode.ts
import axios from 'axios'

export async function getNeighborhoodFromCoords(
  lat: number,
  lng: number
): Promise<string | null> {
  try {
    // Option A: Google Maps Geocoding API
    const response = await axios.get(
      'https://maps.googleapis.com/maps/api/geocode/json',
      {
        params: {
          latlng: `${lat},${lng}`,
          key: process.env.GOOGLE_MAPS_API_KEY,
          language: 'pt-BR',
        },
      }
    )

    // Extract neighborhood from results
    const results = response.data.results[0]
    const neighborhood = results?.address_components?.find(
      (comp: any) =>
        comp.types.includes('sublocality') ||
        comp.types.includes('neighborhood')
    )

    return neighborhood?.long_name || null
  } catch (error) {
    console.error('Geocoding error:', error)
    return null
  }
}

// Option B: OpenCage Data (cheaper alternative)
// Option C: Nominatim (free but rate-limited)
```

**Script to backfill:**

```typescript
// scripts/backfill-neighborhoods.ts
import { createClient } from '@supabase/supabase-js'
import { getNeighborhoodFromCoords } from '../lib/geocoding/reverse-geocode'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function backfillNeighborhoods() {
  // Get properties with coords but no neighborhood
  const { data: properties } = await supabase
    .from('properties')
    .select('id, latitude, longitude, address_city')
    .is('address_neighborhood', null)
    .not('latitude', 'is', null)
    .not('longitude', 'is', null)
    .is('deleted_at', null)
    .eq('status', 'active')

  console.log(`Found ${properties?.length} properties to geocode`)

  let updated = 0
  for (const prop of properties || []) {
    const neighborhood = await getNeighborhoodFromCoords(
      prop.latitude,
      prop.longitude
    )

    if (neighborhood) {
      await supabase
        .from('properties')
        .update({ address_neighborhood: neighborhood })
        .eq('id', prop.id)

      updated++
      console.log(`Updated ${prop.id}: ${neighborhood}`)
    }

    // Rate limiting
    await new Promise((r) => setTimeout(r, 100))
  }

  console.log(`✅ Updated ${updated} properties`)
}

backfillNeighborhoods()
```

**Costs:**
- Google Maps: $5 per 1000 requests → ~$1.50 for 306 properties
- OpenCage: $1 per 1000 requests → ~$0.31 for 306 properties
- Nominatim: Free (but 1 req/sec limit) → Time: ~5 minutes

**Expected:** 53% → 85-95% (depending on coord availability)

---

### Option 3: Data Source Enhancement

Update your scraper to capture neighborhood data:

```typescript
// When scraping properties
const propertyData = {
  title: scrapedData.title,
  description: scrapedData.description,
  address_city: scrapedData.city,
  address_state: scrapedData.state,
  address_neighborhood: scrapedData.neighborhood, // ← ADD THIS
  latitude: scrapedData.lat,
  longitude: scrapedData.lng,
  // ... other fields
}
```

Many property listing sites (VivaReal, ZapImóveis, etc.) include neighborhood in structured data.

**Expected:** 100% for new properties going forward

---

### Option 4: Manual Categorization (High-Value Only)

For premium/featured properties, manually add neighborhoods:

```sql
-- Example: Update specific properties
UPDATE properties 
SET address_neighborhood = 'Jardins'
WHERE id = 'property-uuid';

-- Or bulk update for a city
UPDATE properties
SET address_neighborhood = 'Centro'
WHERE address_full ILIKE '%centro%'
  AND address_city = 'São Paulo'
  AND address_neighborhood IS NULL;
```

**Expected:** Focused improvement on key listings

---

## Recommended Approach

**Phase 1: Quick Win (5 minutes)**

Try AI re-enrichment first:
```bash
pnpm enrich -- --missing-neighborhood --dry-run --limit=10
# Review, then:
pnpm enrich -- --missing-neighborhood
```

**Phase 2: If Still < 70% (Optional)**

Consider geocoding if you have lat/lng:
- Check how many properties have coordinates
- If 80%+, implement geocoding backfill
- Cost: ~$0.30-1.50 depending on service

**Phase 3: Ongoing (Recommended)**

- Update scraper to capture neighborhood from source
- Ensure new properties have this data
- Run validation monthly: `pnpm validate`

---

## Validation

After any enrichment, check progress:

```bash
pnpm validate
```

Look for "Neighborhood" line:
```
Neighborhood:        XXX / 650 (XX.X%)
```

Target: 80%+ for excellent location search

---

## Impact Analysis

### Current State (53%)

```
Search: "Apartamentos em Jardins"
Results: Shows ~50 properties (only those with neighborhood data)
Missing: ~50 properties in Jardins without neighborhood tag
```

### After Enrichment (80%+)

```
Search: "Apartamentos em Jardins"
Results: Shows ~95 properties (most with neighborhood data)
Missing: ~5 properties (acceptable)
```

### Search Quality Improvement

| Scenario | Before | After |
|----------|--------|-------|
| City search | ✅ 100% | ✅ 100% |
| State search | ✅ 100% | ✅ 100% |
| Neighborhood search | ⚠️ 53% | ✅ 80%+ |
| Location-based sorting | ⚠️ Partial | ✅ Excellent |

---

## Cost Comparison

| Method | Cost | Time | Coverage | Difficulty |
|--------|------|------|----------|------------|
| AI Re-enrichment | $0.03 | 5-10 min | +10-15% | Easy |
| Google Geocoding | $1.50 | 15 min | +30-40% | Medium |
| OpenCage Geocoding | $0.31 | 15 min | +30-40% | Medium |
| Nominatim (Free) | $0 | 5-10 min | +30-40% | Medium |
| Scraper Update | $0 | 30 min | 100% future | Medium |

---

## Code Snippets

### Check How Many Have Coordinates

```sql
SELECT 
  COUNT(*) FILTER (WHERE latitude IS NOT NULL AND longitude IS NOT NULL) as with_coords,
  COUNT(*) FILTER (WHERE address_neighborhood IS NULL) as missing_neighborhood,
  COUNT(*) FILTER (
    WHERE address_neighborhood IS NULL 
    AND latitude IS NOT NULL 
    AND longitude IS NOT NULL
  ) as geocodable
FROM properties
WHERE deleted_at IS NULL AND status = 'active';
```

### Batch Update from CSV

If you have a CSV with property IDs and neighborhoods:

```sql
-- Create temp table
CREATE TEMP TABLE neighborhood_updates (
  property_id UUID,
  neighborhood TEXT
);

-- Import CSV
\copy neighborhood_updates FROM 'neighborhoods.csv' CSV HEADER;

-- Update properties
UPDATE properties p
SET address_neighborhood = nu.neighborhood
FROM neighborhood_updates nu
WHERE p.id = nu.property_id;
```

---

## Monitoring

Add to your weekly checks:

```bash
# Check overall quality
pnpm validate

# Check specifically neighborhood coverage
echo "SELECT 
  COUNT(*) FILTER (WHERE address_neighborhood IS NOT NULL)::float / COUNT(*) * 100 as pct
FROM properties 
WHERE deleted_at IS NULL AND status = 'active'" | \
psql $DATABASE_URL
```

Target threshold: Keep above 75%

---

## Summary

Your system is **production-ready at 92/100**, but improving neighborhood coverage from 53% to 80%+ would:
- Improve location-based search precision
- Enable better property recommendations
- Provide better market analysis capabilities

**Quick Action:**
```bash
pnpm enrich -- --missing-neighborhood
```

**Best Long-term Solution:**
- Capture neighborhoods from scraper
- Backfill with geocoding if needed
- Monitor monthly

---

**Created:** 2025-11-17  
**Status:** Optional improvement (not critical)  
**Estimated Impact:** Medium (location search quality)
