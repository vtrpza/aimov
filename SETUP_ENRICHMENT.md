# 🚀 Setup Guide - Property Enrichment System

## ⚡ Quick Setup (5 minutes)

### Step 1: Add Missing Environment Variable

The enrichment scripts need the **Supabase Service Role Key** for admin operations.

**Add this to your `.env.local` file:**

```bash
# Get from: https://supabase.com/dashboard/project/vplirczulquclpwdkegk/settings/api
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...your_service_role_key
```

**How to get it:**
1. Go to: https://supabase.com/dashboard/project/vplirczulquclpwdkegk/settings/api
2. Find **Project API keys** section
3. Copy the `service_role` secret key
4. Paste it into `.env.local`

⚠️ **IMPORTANT:** Never commit this key to git! It has admin privileges.

### Step 2: Verify Setup

```bash
pnpm validate
```

You should see a data quality report. If you get an error about missing keys, check Step 1.

### Step 3: Run Enrichment

**Test first (safe - doesn't save):**
```bash
pnpm enrich:test
```

**Then run full enrichment:**
```bash
pnpm enrich
```

This will:
- Process all properties needing enrichment
- Take ~10-15 minutes depending on volume
- Cost very little (~$0.0001 per property with GPT-4o-mini)
- Automatically save results

### Step 4: Verify Results

```bash
pnpm validate
```

You should see quality score improve from ~42 to 90+!

---

## 📂 Complete .env.local File

Your `.env.local` should have these 4 variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://vplirczulquclpwdkegk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
OPENAI_API_KEY=sk-proj-...
```

---

## ✅ What Each Script Does

### `pnpm validate`
- Checks current data quality
- Shows percentages for each field
- Gives overall quality score (0-100)
- **No changes made to database**

### `pnpm enrich:test`  
- Tests enrichment on 3 properties
- Shows what would be extracted
- **No changes made to database** (dry run)

### `pnpm enrich:dry-run`
- Tests on 10 properties
- **No changes made to database**

### `pnpm enrich`
- Processes ALL properties
- **SAVES to database**
- Takes ~15 minutes for 582 properties

---

## 🎯 Expected Results

### Before Enrichment
```
📊 DATA QUALITY VALIDATION REPORT
Total Active Properties: 104

FIELD COMPLETENESS:
  AI Summary:          19 / 104 (18.3%)
  Property Type:       101 / 104 (97.1%)  
  Neighborhood:        99 / 104 (95.2%)
  Features:            83 / 104 (79.8%)
  
OVERALL QUALITY SCORE: 55/100
⚠️ Moderate data quality
```

### After Enrichment
```
📊 DATA QUALITY VALIDATION REPORT
Total Active Properties: 104

FIELD COMPLETENESS:
  AI Summary:          104 / 104 (100%)
  Property Type:       104 / 104 (100%)
  Neighborhood:        100+ / 104 (96%+)
  Features:            100+ / 104 (96%+)
  
OVERALL QUALITY SCORE: 90+/100
✅ Excellent data quality!
```

---

## 🐛 Troubleshooting

### "supabaseKey is required"
**Fix:** Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local` (see Step 1)

### "Missing OPENAI_API_KEY"
**Fix:** Add `OPENAI_API_KEY` to `.env.local`

### "Rate limit exceeded"
**Fix:** Add delay: `pnpm enrich -- --delay=2000`

### Script hangs or is slow
**Normal!** Processing takes time with rate limiting to avoid API limits.

---

## 📚 Next Steps

After enrichment completes:

1. **Verify quality**: `pnpm validate`
2. **Test searches**: Try searching for properties with specific criteria
3. **Integrate auto-enrichment**: Add to your scraper (see `ENRICHMENT_GUIDE.md`)
4. **Build matching engine**: Now that data is clean, build intelligent property matching
5. **Consider geocoding**: Add coordinates for map views (optional)

---

## 💡 Tips

- Run `pnpm validate` anytime to check quality
- Use `pnpm enrich:test` before full runs
- The enrichment is idempotent - safe to run multiple times
- Use `--dry-run` flag to preview changes

---

**Need help?** Check `ENRICHMENT_GUIDE.md` or `lib/enrichment/README.md` for full documentation.
