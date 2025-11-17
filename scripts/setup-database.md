# Database Setup for Existing Supabase Project

Your Supabase project: **vplirczulquclpwdkegk**

## Step 1: Get Your API Keys

1. Go to: https://supabase.com/dashboard/project/vplirczulquclpwdkegk/settings/api
2. Copy the following values and paste them into `.env.local`:
   - **Project URL**: Already set to `https://vplirczulquclpwdkegk.supabase.co`
   - **anon/public key**: Copy and replace `your_anon_key_here`
   - **service_role key**: Copy and replace `your_service_role_key_here`

## Step 2: Run the Database Schema

### Option A: Using Supabase Dashboard (Recommended)

1. Go to: https://supabase.com/dashboard/project/vplirczulquclpwdkegk/editor
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy the entire contents of `supabase/schema.sql` from this project
5. Paste it into the SQL editor
6. Click "Run" or press Cmd/Ctrl + Enter
7. Wait for it to complete (you should see "Success" messages)

### Option B: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref vplirczulquclpwdkegk

# Run the migration
supabase db push
```

### Option C: Using psql directly

If you have database access:

```bash
psql postgresql://postgres:[YOUR-PASSWORD]@db.vplirczulquclpwdkegk.supabase.co:5432/postgres < supabase/schema.sql
```

## Step 3: Verify the Setup

After running the schema, verify that the tables were created:

1. Go to: https://supabase.com/dashboard/project/vplirczulquclpwdkegk/editor
2. Click on "Table Editor"
3. You should see these tables:
   - `properties` (with 6 sample Brazilian properties)
   - `leads`
   - `conversations`
   - `messages`
   - `property_interactions`

## Step 4: Set Up OpenAI API Key

1. Go to: https://platform.openai.com/api-keys
2. Create a new API key
3. Copy it and paste it into `.env.local` for `OPENAI_API_KEY`

## Step 5: Run the Application

```bash
pnpm dev
```

Then open http://localhost:3000 in your browser!

## Troubleshooting

### "Permission denied" errors
- Make sure you ran the SQL as the database owner/admin
- The schema includes Row Level Security (RLS) policies

### "Table already exists" errors
- Your database already has these tables
- You can either drop them first or skip this step

### Need to reset the database?
Run this first before running the schema:

```sql
DROP TABLE IF EXISTS property_interactions CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS leads CASCADE;
DROP TABLE IF EXISTS properties CASCADE;
```
