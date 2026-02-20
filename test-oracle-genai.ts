/**
 * Simple test to check if Oracle GenAI is accessible
 * Run: npx tsx test-oracle-genai.ts
 */

import 'dotenv/config';
import { extractInterestsFromText } from './src/lib/ingest/extract';

async function testOracleGenAI() {
  console.log('🧪 Testing Oracle Generative AI Connection...\n');

  // Check if enabled
  const enabled = process.env.OCI_GENERATIVE_AI_ENABLED === 'true';
  console.log('Oracle GenAI Enabled:', enabled);
  console.log('Model:', process.env.OCI_GENAI_MODEL);
  console.log('Endpoint:', process.env.OCI_GENAI_ENDPOINT);
  console.log('Region:', process.env.OCI_REGION);
  console.log('');

  const testResume = `
    Passionate computer science student with strong interest in artificial intelligence
    and machine learning. Built several ML models for healthcare applications. 
    Love attending startup events and hackathons. Also interested in climate technology
    and renewable energy solutions.
  `;

  console.log('📝 Sending test resume to AI service...\n');

  try {
    const interests = await extractInterestsFromText(testResume);

    console.log('✅ SUCCESS! AI extraction is working!\n');
    console.log('📊 Extracted Interests:');
    interests.forEach((interest, i) => {
      console.log(`   ${i + 1}. ${interest.topicName} (weight: ${interest.weight})`);
    });

    if (enabled) {
      console.log('\n🎉 Oracle Generative AI is fully functional!');
    } else {
      console.log('\n✨ Using fallback AI provider (Claude or keyword matching)');
    }

    console.log('\n✅ You can now use the student onboarding at:');
    console.log('   http://localhost:3000/student/onboard');

  } catch (error: any) {
    console.log('❌ AI Extraction Failed\n');
    console.log('Error:', error.message);
    
    if (error.message.includes('404') || error.message.includes('NotAuthorizedOrNotFound')) {
      console.log('\n💡 The Generative AI service may not be enabled or accessible.');
      console.log('   This could mean:');
      console.log('   • Service is already enabled but needs policy permissions');
      console.log('   • No "Enable" button means it might already be active');
      console.log('   • The error could be a policy/permissions issue instead');
      console.log('\n📋 Next steps:');
      console.log('   1. Check OCI Console → Identity → Policies');
      console.log('   2. Add policy: allow group <your-group> to use generative-ai-family in compartment ross_ai_hackathon');
      console.log('   3. Or ask your tenancy admin to grant you access');
    } else if (error.message.includes('401')) {
      console.log('\n💡 Authentication issue - check credentials');
    }
    
    console.log('\n✨ GOOD NEWS: The app has fallback options!');
    console.log('   You can still demo the full application.');
    console.log('   Add ANTHROPIC_API_KEY to .env for AI extraction.');
  }
}

testOracleGenAI().catch(console.error);
