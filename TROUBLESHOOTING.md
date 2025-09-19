# Troubleshooting Guide

## "Analysis failed. Please try again." Error

This error can occur for several reasons. Follow these steps to diagnose and fix the issue:

### Step 1: Check Environment Variables

Make sure you have a `.env.local` file in your project root with:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

**To get these values:**
1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to Settings → API
4. Copy the Project URL and anon/public key

### Step 2: Test Database Connection

Run the database test script:

```bash
# Install dotenv if not already installed
npm install dotenv

# Run the test
node test-database.js
```

This will check if:
- Environment variables are set correctly
- Database connection works
- Required tables exist

### Step 3: Set Up Database Tables

If the database test fails, you need to create the tables:

1. **Go to your Supabase dashboard**
2. **Open the SQL Editor**
3. **Run the schema script:**

```sql
-- Copy and paste the contents of scripts/001_create_database_schema.sql
-- This creates the profiles, plant_diseases, and predictions tables
```

4. **Run the seed data script:**

```sql
-- Copy and paste the contents of scripts/002_seed_plant_diseases.sql
-- This adds sample plant disease data
```

### Step 4: Check Authentication

Make sure you're logged in to the application:

1. Go to `/auth/login`
2. Sign in with your account
3. Try the analysis again

### Step 5: Check Browser Console

1. Open browser developer tools (F12)
2. Go to the Console tab
3. Try uploading an image
4. Look for any error messages

### Step 6: Check Server Logs

If you're running the development server, check the terminal for error messages:

```bash
npm run dev
```

Look for any error messages when you try to analyze an image.

## Common Error Messages and Solutions

### "Unauthorized" or "Authentication failed"
- **Solution:** Make sure you're logged in to the application
- **Check:** Go to `/auth/login` and sign in

### "Missing image or plant type"
- **Solution:** Make sure you've selected both an image and a plant type
- **Check:** Upload an image and select a plant type from the dropdown

### "Invalid file type"
- **Solution:** Only upload image files (PNG, JPG, WEBP)
- **Check:** Make sure your file is an image

### "Failed to save prediction"
- **Solution:** Database table might not exist
- **Check:** Run the database setup scripts in Step 3

### "Internal server error"
- **Solution:** Check server logs for more details
- **Check:** Look at the terminal where you're running `npm run dev`

## Testing the Integration

### 1. Test with Mock Data
The current implementation uses mock data, so it should work even without your actual model.

### 2. Test Database
```bash
node test-database.js
```

### 3. Test Upload Flow
1. Go to `/dashboard`
2. Upload an image
3. Select a plant type
4. Click "Analyze Plant"
5. Check for results

## Still Having Issues?

### Check These Files:
1. **`.env.local`** - Environment variables
2. **`app/api/analyze/route.ts`** - API endpoint
3. **`components/dashboard/upload-section.tsx`** - Upload component
4. **Browser console** - Client-side errors
5. **Server terminal** - Server-side errors

### Get More Detailed Error Information:
The updated API endpoint now provides more detailed error messages. Check:
- Browser console for client errors
- Server terminal for server errors
- Network tab in browser dev tools for API responses

## Quick Fix Checklist

- [ ] `.env.local` file exists with correct Supabase credentials
- [ ] Database tables are created (run SQL scripts)
- [ ] You're logged in to the application
- [ ] You've selected both an image and plant type
- [ ] Image file is a valid image format
- [ ] Development server is running (`npm run dev`)
- [ ] No errors in browser console
- [ ] No errors in server terminal

## Need Help?

If you're still having issues:
1. Run `node test-database.js` and share the output
2. Check browser console for errors
3. Check server terminal for errors
4. Make sure all steps above are completed

The integration should work with the mock data even without your actual model file.
