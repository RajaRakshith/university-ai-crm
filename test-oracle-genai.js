/**
 * Test Oracle Generative AI Connection
 * Run: npx tsx test-oracle-genai.ts
 */

import { config } from 'dotenv';
config();

async function testOracleGenAI() {
  console.log('🧪 Testing Oracle Generative AI Connection...\n');

  // Check environment variables
  console.log('1️⃣ Checking environment variables...');
  const requiredVars = {
    'OCI_GENERATIVE_AI_ENABLED': process.env.OCI_GENERATIVE_AI_ENABLED,
    'OCI_TENANCY_OCID': process.env.OCI_TENANCY_OCID,
    'OCI_USER_OCID': process.env.OCI_USER_OCID,
    'OCI_FINGERPRINT': process.env.OCI_FINGERPRINT,
    'OCI_PRIVATE_KEY_PATH': process.env.OCI_PRIVATE_KEY_PATH,
    'OCI_REGION': process.env.OCI_REGION,
    'OCI_COMPARTMENT_OCID': process.env.OCI_COMPARTMENT_OCID,
    'OCI_GENAI_MODEL': process.env.OCI_GENAI_MODEL,
    'OCI_GENAI_ENDPOINT': process.env.OCI_GENAI_ENDPOINT,
  };

  let allPresent = true;
  for (const [key, value] of Object.entries(requiredVars)) {
    if (!value) {
      console.log(`   ❌ Missing: ${key}`);
      allPresent = false;
    } else {
      console.log(`   ✅ ${key}: ${value.substring(0, 30)}...`);
    }
  }

  if (!allPresent) {
    console.log('\n❌ Missing required environment variables');
    return;
  }

  console.log('\n2️⃣ Testing Oracle GenAI API call...');
  
  try {
    // Import the extract function
    const { extractInterestsFromText } = require('./src/lib/ingest/extract.js');
    
    const testResume = `
      Passionate computer science student with strong interest in artificial intelligence
      and machine learning. Built several ML models for healthcare applications. 
      Love attending startup events and hackathons. Also interested in climate technology
      and renewable energy solutions.
    `;

    console.log('   Sending test resume to Oracle GenAI...');
    console.log('   Using model:', process.env.OCI_GENAI_MODEL);
    console.log('   Endpoint:', process.env.OCI_GENAI_ENDPOINT);
    console.log('');

    const interests = await extractInterestsFromText(testResume);

    console.log('✅ SUCCESS! Oracle GenAI is working!\n');
    console.log('📊 Extracted Interests:');
    console.log(JSON.stringify(interests, null, 2));
    console.log('\n🎉 Your Oracle Generative AI integration is fully functional!');
    console.log('\nYou can now use the student onboarding at:');
    console.log('http://localhost:3000/student/onboard');

  } catch (error) {
    console.log('\n⚠️  Oracle GenAI Test Result:\n');
    
    if (error.message.includes('404') || error.message.includes('NotAuthorizedOrNotFound')) {
      console.log('❌ Service Not Enabled or Not Accessible');
      console.log('\nPossible reasons:');
      console.log('1. Generative AI service is not enabled in your compartment');
      console.log('2. User does not have policy permissions for Generative AI');
      console.log('3. Service is not available in your region (us-ashburn-1)');
      console.log('\nHow to fix:');
      console.log('• Check OCI Console → Identity & Security → Policies');
      console.log('• Verify you have: "allow group <your-group> to use generative-ai-family in compartment ross_ai_hackathon"');
      console.log('• Try the Chicago region endpoint (already configured in .env)');
    } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      console.log('❌ Authentication Failed');
      console.log('\nPossible reasons:');
      console.log('1. Private key file is invalid');
      console.log('2. Fingerprint does not match the API key');
      console.log('3. User OCID is incorrect');
      console.log('\nHow to fix:');
      console.log('• Verify fingerprint in .env matches OCI Console → User Settings → API Keys');
      console.log('• Ensure ocu_private.pem is the correct private key file');
    } else if (error.message.includes('ENOENT') || error.message.includes('private key')) {
      console.log('❌ Private Key File Not Found');
      console.log('\nHow to fix:');
      console.log('• Make sure ocu_private.pem is in the project root directory');
      console.log('• Current expected path:', process.env.OCI_PRIVATE_KEY_PATH);
    } else {
      console.log('❌ Unexpected Error:', error.message);
      console.log('\nFull error details:');
      console.log(error);
    }

    console.log('\n💡 FALLBACK OPTION:');
    console.log('The app will automatically fall back to keyword matching if Oracle GenAI is unavailable.');
    console.log('You can still demo the full application - just without AI extraction.');
    console.log('\nOr, add an Anthropic API key to .env:');
    console.log('ANTHROPIC_API_KEY=your_key_here');
  }
}

// Run the test
testOracleGenAI().catch(console.error);
