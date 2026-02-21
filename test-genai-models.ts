/**
 * Test script to find available Oracle GenAI models
 */
import * as common from 'oci-common';
import * as genai from 'oci-generativeaiinference';
import * as fs from 'fs';

// Load environment variables manually
const envPath = '.env';
const envContent = fs.readFileSync(envPath, 'utf8');
const env: Record<string, string> = {};
envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const match = trimmed.match(/^([^=]+)=(.+)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      // Remove quotes
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      env[key] = value;
    }
  }
});

console.log('Loaded config:');
console.log('  Private Key Path:', env.OCI_PRIVATE_KEY_PATH);
console.log('  Region:', env.OCI_REGION);
console.log('');

async function testModel(client: genai.GenerativeAiInferenceClient, compartmentId: string, modelId: string) {
  console.log(`\n🔍 Testing model: ${modelId}`);
  
  try {
    const generateTextDetails: genai.requests.GenerateTextRequest = {
      generateTextDetails: {
        compartmentId: compartmentId,
        servingMode: {
          servingType: 'ON_DEMAND',
          modelId: modelId,
        } as genai.models.OnDemandServingMode,
        inferenceRequest: {
          runtimeType: 'COHERE',
          prompt: 'Say "Hello"',
          maxTokens: 10,
          temperature: 0.3,
          isStream: false,
        } as genai.models.CohereLlmInferenceRequest,
      },
    };

    const response = await client.generateText(generateTextDetails);
    console.log(`✅ SUCCESS: ${modelId} works!`);
    return true;
  } catch (error: any) {
    console.log(`❌ FAILED: ${modelId}`);
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🔍 Testing Oracle GenAI Models in us-ashburn-1...\n');

  // Load config
  const privateKey = fs.readFileSync(env.OCI_PRIVATE_KEY_PATH, 'utf8');
  
  const provider = new common.SimpleAuthenticationDetailsProvider(
    env.OCI_TENANCY_OCID,
    env.OCI_USER_OCID,
    env.OCI_FINGERPRINT,
    privateKey,
    null,
    common.Region.fromRegionId(env.OCI_REGION)
  );

  const client = new genai.GenerativeAiInferenceClient({
    authenticationDetailsProvider: provider,
  });

  client.endpoint = env.OCI_GENAI_ENDPOINT;
  const compartmentId = env.OCI_COMPARTMENT_OCID;

  // Test different model IDs that might be available
  const modelsToTest = [
    // Cohere models
    'cohere.command-r-plus',
    'cohere.command-r-plus-08-2024',
    'cohere.command-r-16k',
    'cohere.command-r',
    'cohere.command',
    'cohere.command-light',
    
    // Meta Llama models
    'meta.llama-3-70b-instruct',
    'meta.llama-3.1-70b-instruct',
    'meta.llama-2-70b-chat',
    
    // Potentially with region prefix
    'ocid1.generativeaimodel.oc1.us-ashburn-1.cohere.command-r-plus',
  ];

  console.log('Testing models...\n');
  const workingModels = [];
  
  for (const modelId of modelsToTest) {
    const works = await testModel(client, compartmentId, modelId);
    if (works) {
      workingModels.push(modelId);
    }
    await new Promise(resolve => setTimeout(resolve, 500)); // Rate limit
  }

  console.log('\n\n📊 RESULTS:');
  console.log('='.repeat(50));
  if (workingModels.length > 0) {
    console.log('✅ Working models:');
    workingModels.forEach(model => console.log(`   - ${model}`));
    console.log(`\n💡 Update your .env file:`);
    console.log(`   OCI_GENAI_MODEL="${workingModels[0]}"`);
  } else {
    console.log('❌ No models worked!');
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Make sure Generative AI is enabled in your tenancy');
    console.log('   2. Check if you need to subscribe to models in OCI Console');
    console.log('   3. Verify your region supports GenAI (us-ashburn-1 should work)');
    console.log('   4. Check IAM policies grant access to generative-ai-family');
  }
}

main().catch(console.error);
