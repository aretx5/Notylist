/**
 * OAuth Configuration Checker
 * Run this script to verify your Supabase OAuth setup
 * 
 * Usage: node scripts/check-oauth-config.js
 */

require('dotenv').config({ path: '.env.local' });

const REQUIRED_ENV_VARS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY'
];

console.log('🔍 Checking OAuth Configuration...\n');

// Check environment variables
let allEnvVarsPresent = true;
REQUIRED_ENV_VARS.forEach(varName => {
  if (process.env[varName]) {
    console.log(`✅ ${varName}: Set`);
  } else {
    console.log(`❌ ${varName}: Missing`);
    allEnvVarsPresent = false;
  }
});

console.log('\n📋 Configuration Checklist:\n');

console.log('[ ] 1. Supabase Dashboard Configuration');
console.log('    → Go to: https://app.supabase.com/project/iarjyzdqttiytsczssmg/auth/url-configuration');
console.log('    → Add Redirect URL: http://localhost:3000/auth/callback');
console.log('    → Verify Flow Type: PKCE (not Implicit)\n');

console.log('[ ] 2. Code Configuration');
console.log('    → OAuth callback route: /app/auth/callback/route.ts');
console.log('    → Redirect parameter in signInWithOAuth: /auth/callback');
console.log('    → Middleware allows /auth/callback to pass through\n');

console.log('[ ] 3. Testing Steps');
console.log('    → Clear browser cookies and localStorage');
console.log('    → Visit: http://localhost:3000/login');
console.log('    → Click "Continue with Google"');
console.log('    → Expected URL after auth: http://localhost:3000/auth/callback?code=...');
console.log('    → Should redirect to: http://localhost:3000/dashboard\n');

if (allEnvVarsPresent) {
  console.log('✅ All environment variables are set!');
  console.log('\n🎯 Next Step: Configure redirect URL in Supabase Dashboard');
  console.log('   Then test the OAuth flow by clicking "Continue with Google"\n');
} else {
  console.log('❌ Some environment variables are missing!');
  console.log('   Please add them to your .env.local file\n');
  process.exit(1);
}

// Extract project reference from URL
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (supabaseUrl) {
  const match = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
  if (match) {
    const projectRef = match[1];
    console.log(`🔗 Quick Links:`);
    console.log(`   Dashboard: https://app.supabase.com/project/${projectRef}`);
    console.log(`   Auth Settings: https://app.supabase.com/project/${projectRef}/auth/url-configuration`);
    console.log(`   Providers: https://app.supabase.com/project/${projectRef}/auth/providers\n`);
  }
}
