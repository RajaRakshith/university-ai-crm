/**
 * Quick test to verify Oracle GenAI with Gemini is working
 */
import * as fs from 'fs';
import * as path from 'path';

// Manually load .env file
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach((line, index) => {
    line = line.trim();
    // Skip empty lines and comments
    if (!line || line.startsWith('#')) return;
    
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      // Remove quotes if present
      value = value.replace(/^["']|["']$/g, '');
      process.env[key] = value;
      if (key.includes('OCI_GENERATIVE') || key.includes('OCI_GENAI')) {
        console.log(`Loaded: ${key} = ${value}`);
      }
    }
  });
  console.log('✅ Loaded .env file');
  console.log('DEBUG: OCI_GENERATIVE_AI_ENABLED =', process.env.OCI_GENERATIVE_AI_ENABLED);
  console.log('DEBUG: OCI_GENAI_MODEL =', process.env.OCI_GENAI_MODEL);
}

import { extractInterestsWithOracle } from './src/lib/ingest/extract-oracle.js';

const testResume = `
Dr. Maya R. Srinivasan
Harvard Medical School - Doctor of Medicine

Clinical Training:
- Internal Medicine Residency at Massachusetts General Hospital
- Managed oncology cases including hematologic malignancies
- Clinical Research Fellow (Oncology) at Dana-Farber Cancer Institute
- Conducted Phase II immunotherapy clinical trial for metastatic melanoma

Research:
- Cancer Immunotherapy Research Assistant
- Investigated PD-1/PD-L1 pathway inhibition mechanisms
- Liquid Biopsy Biomarker Study
- Health Equity in Oncology Initiative

Skills:
- Oncology Clinical Management
- Clinical Trial Design & Monitoring
- Biostatistics (R, STATA)
`;

async function testGemini() {
  console.log('🧪 Testing Oracle GenAI with Gemini...\n');
  
  try {
    const result = await extractInterestsWithOracle(testResume);
    
    console.log('✅ Extraction successful!');
    console.log('\nExtracted topics:');
    result.topics.forEach(t => {
      console.log(`  - ${t.topic}: ${Math.round(t.weight * 100)}%`);
    });
    
    const hasMedicalTopics = result.topics.some(t => 
      t.topic.toLowerCase().includes('cancer') || 
      t.topic.toLowerCase().includes('oncology') ||
      t.topic.toLowerCase().includes('medical') ||
      t.topic.toLowerCase().includes('clinical')
    );
    
    if (hasMedicalTopics) {
      console.log('\n🎉 SUCCESS: Gemini extracted medical/cancer-related topics!');
    } else {
      console.log('\n⚠️  WARNING: No medical topics extracted. Topics found:', result.topics.map(t => t.topic).join(', '));
    }
    
  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('  - Make sure your .env has OCI_GENERATIVE_AI_ENABLED=true');
    console.error('  - Verify OCI_GENAI_MODEL="google.gemini-2.5-flash"');
    console.error('  - Check that your Oracle Cloud credentials are correct');
  }
}

testGemini();
