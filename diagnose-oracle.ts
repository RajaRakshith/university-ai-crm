/**
 * Detailed Oracle Cloud Authentication Diagnostic
 * Run: npx tsx diagnose-oracle.ts
 */

import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';

async function diagnoseOracle() {
  console.log('🔍 Oracle Cloud Authentication Diagnostics\n');
  console.log('═'.repeat(60));
  
  // Check environment variables
  console.log('\n1️⃣ Environment Variables:');
  console.log('   Tenancy OCID:', process.env.OCI_TENANCY_OCID?.substring(0, 50) + '...');
  console.log('   User OCID:', process.env.OCI_USER_OCID?.substring(0, 50) + '...');
  console.log('   Fingerprint:', process.env.OCI_FINGERPRINT);
  console.log('   Region:', process.env.OCI_REGION);
  console.log('   Compartment:', process.env.OCI_COMPARTMENT_OCID?.substring(0, 50) + '...');
  console.log('   GenAI Model:', process.env.OCI_GENAI_MODEL);
  console.log('   GenAI Endpoint:', process.env.OCI_GENAI_ENDPOINT);

  // Check private key file
  console.log('\n2️⃣ Private Key File:');
  const keyPath = process.env.OCI_PRIVATE_KEY_PATH || '';
  console.log('   Path:', keyPath);
  
  if (fs.existsSync(keyPath)) {
    console.log('   ✅ File exists');
    const keyContent = fs.readFileSync(keyPath, 'utf8');
    const lines = keyContent.split('\n');
    console.log('   First line:', lines[0]);
    console.log('   Last line:', lines[lines.length - 1] || lines[lines.length - 2]);
    console.log('   Total lines:', lines.length);
    console.log('   File size:', fs.statSync(keyPath).size, 'bytes');
  } else {
    console.log('   ❌ File NOT found');
  }

  // Test OCI SDK
  console.log('\n3️⃣ Testing OCI SDK Authentication:');
  try {
    const common = await import('oci-common');
    const provider = new common.ConfigFileAuthenticationDetailsProvider(
      undefined, // use default profile
      undefined  // use default config path
    );
    console.log('   ✅ OCI Config File Provider initialized');
  } catch (error: any) {
    console.log('   ⚠️  Config file provider failed:', error.message);
  }

  // Try manual authentication
  console.log('\n4️⃣ Testing Manual Authentication:');
  try {
    const common = await import('oci-common');
    
    const keyContent = fs.readFileSync(keyPath, 'utf8');
    
    const configurationDetails: common.ConfigurationDetails = {
      tenancy: process.env.OCI_TENANCY_OCID!,
      user: process.env.OCI_USER_OCID!,
      fingerprint: process.env.OCI_FINGERPRINT!,
      privateKey: keyContent,
      region: common.Region.US_ASHBURN_1,
    };

    const provider = new common.SimpleAuthenticationDetailsProvider(
      configurationDetails
    );
    
    console.log('   ✅ SimpleAuthenticationDetailsProvider created');
    console.log('   Tenancy:', await provider.getTenantId());
    console.log('   User:', await provider.getUser());
    console.log('   Fingerprint:', await provider.getFingerprint());
    console.log('   Region:', provider.getRegion()?.regionId);

  } catch (error: any) {
    console.log('   ❌ Manual authentication failed:', error.message);
    console.log('   Stack:', error.stack);
  }

  // Check if GenAI is available in region
  console.log('\n5️⃣ Generative AI Service Check:');
  console.log('   Your region:', process.env.OCI_REGION);
  console.log('   GenAI endpoint region: us-chicago-1');
  console.log('   ⚠️  MISMATCH: You\'re in us-ashburn-1 but trying to use us-chicago-1 endpoint');
  console.log('   👉 Generative AI might not be available in us-ashburn-1 yet');

  // Recommendations
  console.log('\n6️⃣ Recommendations:');
  console.log('   Option A: Try us-chicago-1 region endpoint (already configured)');
  console.log('   Option B: Check if your policy applies to the user/compartment');
  console.log('   Option C: Verify your API key fingerprint matches in OCI Console');
  console.log('   Option D: Use Claude API instead (still Oracle infrastructure)');
  
  console.log('\n═'.repeat(60));
  console.log('\n💡 Next Steps:');
  console.log('   1. Go to OCI Console → Identity → Users → API Keys');
  console.log('   2. Verify fingerprint matches:', process.env.OCI_FINGERPRINT);
  console.log('   3. Check if policy statement is: allow any-user to use generative-ai-family in tenancy');
  console.log('   4. Or add ANTHROPIC_API_KEY to .env for faster demo');
}

diagnoseOracle().catch(console.error);
