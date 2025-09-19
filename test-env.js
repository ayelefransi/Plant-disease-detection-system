/**
 * Simple Environment Variables Test
 * 
 * This script tests if your environment variables are set correctly.
 * Run this with: node test-env.js
 */

require('dotenv').config({ path: '.env.local' })

console.log('Testing environment variables...')
console.log('=' * 50)

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL is not set')
} else {
  console.log('✅ NEXT_PUBLIC_SUPABASE_URL is set')
  console.log('   URL:', supabaseUrl.substring(0, 30) + '...')
}

if (!supabaseKey) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is not set')
} else {
  console.log('✅ NEXT_PUBLIC_SUPABASE_ANON_KEY is set')
  console.log('   Key:', supabaseKey.substring(0, 20) + '...')
}

if (supabaseUrl && supabaseKey) {
  console.log('\n🎉 Environment variables are configured correctly!')
  console.log('\nNext steps:')
  console.log('1. Go to your Supabase dashboard')
  console.log('2. Open the SQL Editor')
  console.log('3. Run the database schema scripts')
  console.log('4. Test the application again')
} else {
  console.log('\n❌ Please create a .env.local file with your Supabase credentials')
  console.log('\nExample .env.local file:')
  console.log('NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co')
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...')
}

