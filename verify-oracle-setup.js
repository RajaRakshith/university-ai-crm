/**
 * Oracle Cloud Setup Verification Script
 * Run: node verify-oracle-setup.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Oracle Cloud Setup...\n');

let allGood = true;

// Check .env file
console.log('1️⃣ Checking .env file...');
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  const requiredVars = [
    'OCI_GENERATIVE_AI_ENABLED',
    'OCI_TENANCY_OCID',
    'OCI_USER_OCID',
    'OCI_FINGERPRINT',
    'OCI_PRIVATE_KEY_PATH',
    'OCI_REGION',
    'OCI_COMPARTMENT_OCID'
  ];
  
  const missing = requiredVars.filter(v => !envContent.includes(v));
  
  if (missing.length === 0) {
    console.log('   ✅ .env file configured with Oracle credentials\n');
  } else {
    console.log(`   ❌ Missing variables: ${missing.join(', ')}\n`);
    allGood = false;
  }
} else {
  console.log('   ❌ .env file not found\n');
  allGood = false;
}

// Check private key file
console.log('2️⃣ Checking private key file...');
const keyPath = 'C:\\Users\\aniru\\OneDrive\\Documents\\Anirudh\\UofM\\university-ai-crm\\ocu_private.pem';
if (fs.existsSync(keyPath)) {
  const keyContent = fs.readFileSync(keyPath, 'utf8');
  if (keyContent.includes('BEGIN RSA PRIVATE KEY') || keyContent.includes('BEGIN PRIVATE KEY')) {
    console.log('   ✅ Private key file found and valid\n');
  } else {
    console.log('   ❌ Private key file exists but may be invalid\n');
    allGood = false;
  }
} else {
  console.log('   ❌ Private key file not found at:', keyPath);
  console.log('   📝 Make sure you downloaded the private key to this location\n');
  allGood = false;
}

// Check OCI config file
console.log('3️⃣ Checking OCI config file...');
const ociConfigPath = path.join(process.env.USERPROFILE || process.env.HOME, '.oci', 'config');
if (fs.existsSync(ociConfigPath)) {
  console.log('   ✅ OCI config file exists at:', ociConfigPath, '\n');
} else {
  console.log('   ⚠️  OCI config file not found (optional for this app)\n');
}

// Check Node.js version
console.log('4️⃣ Checking Node.js version...');
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
if (majorVersion >= 18) {
  console.log(`   ✅ Node.js ${nodeVersion} (compatible)\n`);
} else {
  console.log(`   ❌ Node.js ${nodeVersion} - Need 18 or higher\n`);
  allGood = false;
}

// Check if dependencies are installed
console.log('5️⃣ Checking dependencies...');
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (fs.existsSync(nodeModulesPath)) {
  console.log('   ✅ Dependencies installed\n');
} else {
  console.log('   ⚠️  Dependencies not installed - run: npm install\n');
}

// Summary
console.log('═══════════════════════════════════════');
if (allGood) {
  console.log('✅ All checks passed!');
  console.log('\n📝 Next steps:');
  console.log('   1. Enable Generative AI in OCI Console');
  console.log('      → Analytics & AI → Generative AI → Enable');
  console.log('   2. Run: npm install');
  console.log('   3. Run: npx prisma db push');
  console.log('   4. Run: npm run db:seed');
  console.log('   5. Run: npm run dev');
  console.log('\n🚀 Your app will use Oracle Generative AI!');
} else {
  console.log('❌ Some issues found - fix them and run this script again');
  console.log('\n📝 Common fixes:');
  console.log('   - Make sure ocu_private.pem is in the project root');
  console.log('   - Check .env file has all Oracle credentials');
  console.log('   - Update Node.js to version 18+');
}
console.log('═══════════════════════════════════════\n');
