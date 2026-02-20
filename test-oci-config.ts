/**
 * Test Oracle GenAI with OCI config file method
 */

import * as common from 'oci-common';
import * as genai from 'oci-generativeaiinference';

async function testWithConfigFile() {
  console.log('🧪 Testing Oracle GenAI with config file authentication...\n');

  try {
    // Use config file provider (reads from ~/.oci/config)
    const provider = new common.ConfigFileAuthenticationDetailsProvider();
    
    console.log('✅ Config file provider created');
    console.log('   Tenancy:', await provider.getTenantId());
    console.log('   User:', await provider.getUser());
    console.log('   Fingerprint:', await provider.getFingerprint());
    console.log('   Region:', provider.getRegion()?.regionId);

    // Create client
    const client = new genai.GenerativeAiInferenceClient({
      authenticationDetailsProvider: provider,
    });

    // Set Chicago endpoint (where GenAI is available)
    client.endpoint = 'https://inference.generativeai.us-ashburn-1.oci.oraclecloud.com';

    console.log('\n📝 Sending test request...');

    const request: genai.requests.GenerateTextRequest = {
      generateTextDetails: {
        compartmentId: process.env.OCI_COMPARTMENT_OCID || await provider.getTenantId(),
        servingMode: {
          servingType: 'ON_DEMAND',
          modelId: 'cohere.command-r-plus',
        } as genai.models.OnDemandServingMode,
        inferenceRequest: {
          runtimeType: 'COHERE',
          prompt: 'Say "Hello from Oracle Generative AI!"',
          maxTokens: 50,
          temperature: 0.7,
        } as genai.models.CohereLlmInferenceRequest,
      },
    };

    const response = await client.generateText(request);
    
    console.log('\n✅ SUCCESS! Oracle Generative AI is working!');
    console.log('\nResponse:');
    const inferenceResponse = response.generateTextResult.inferenceResponse as genai.models.CohereLlmInferenceResponse;
    console.log(inferenceResponse.generatedTexts?.[0]?.text);

  } catch (error: any) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Status code:', error.statusCode);
    console.error('Service:', error.serviceName);
    
    if (error.statusCode === 401) {
      console.error('\n💡 Authentication failed - check:');
      console.error('   - ~/.oci/config file exists and is valid');
      console.error('   - Fingerprint matches API key in console');
      console.error('   - Private key path is correct');
    } else if (error.statusCode === 404) {
      console.error('\n💡 Service not found - check:');
      console.error('   - Generative AI is enabled in your region');
      console.error('   - Model ID is correct: cohere.command-r-plus');
    } else if (error.statusCode === 403) {
      console.error('\n💡 Authorization failed - check:');
      console.error('   - Policy exists: allow any-user to use generative-ai-family in tenancy');
      console.error('   - Policy is in the correct compartment');
      console.error('   - Your user has the right group membership');
    }
  }
}

testWithConfigFile();
