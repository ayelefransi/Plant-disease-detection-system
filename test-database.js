/**
 * Database Test Script
 * 
 * This script helps test if your Supabase database is set up correctly.
 * Run this with: node test-database.js
 * 
 * Make sure you have your .env.local file set up with:
 * NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
 * NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function testDatabase() {
  console.log('Testing Supabase database connection...')
  
  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing environment variables!')
    console.log('Please create a .env.local file with:')
    console.log('NEXT_PUBLIC_SUPABASE_URL=your_supabase_url')
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key')
    return
  }
  
  console.log('✅ Environment variables found')
  
  // Create Supabase client
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  try {
    // Test connection
    console.log('Testing database connection...')
    const { data, error } = await supabase.from('plant_diseases').select('count').limit(1)
    
    if (error) {
      console.error('❌ Database connection failed:', error.message)
      console.log('\nPossible solutions:')
      console.log('1. Make sure your Supabase project is running')
      console.log('2. Check if the database tables exist')
      console.log('3. Run the SQL scripts in the scripts/ folder')
      return
    }
    
    console.log('✅ Database connection successful')
    
    // Test predictions table
    console.log('Testing predictions table...')
    const { data: predictionsData, error: predictionsError } = await supabase
      .from('predictions')
      .select('count')
      .limit(1)
    
    if (predictionsError) {
      console.error('❌ Predictions table error:', predictionsError.message)
      console.log('\nThe predictions table might not exist. Please run:')
      console.log('1. Go to your Supabase dashboard')
      console.log('2. Open the SQL Editor')
      console.log('3. Run the script from scripts/001_create_database_schema.sql')
      return
    }
    
    console.log('✅ Predictions table accessible')
    
    // Test plant_diseases table
    console.log('Testing plant_diseases table...')
    const { data: diseasesData, error: diseasesError } = await supabase
      .from('plant_diseases')
      .select('count')
      .limit(1)
    
    if (diseasesError) {
      console.error('❌ Plant diseases table error:', diseasesError.message)
      return
    }
    
    console.log('✅ Plant diseases table accessible')
    
    // Get sample data
    const { data: sampleDiseases } = await supabase
      .from('plant_diseases')
      .select('name, plant_type')
      .limit(5)
    
    console.log('✅ Sample plant diseases:', sampleDiseases?.length || 0, 'found')
    
    console.log('\n🎉 Database setup is working correctly!')
    console.log('\nNext steps:')
    console.log('1. Make sure you are logged in to the web application')
    console.log('2. Try uploading an image for analysis')
    console.log('3. Check the browser console for any errors')
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
  }
}

// Run the test
testDatabase()
