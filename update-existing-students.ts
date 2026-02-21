/**
 * Update existing students' interests using the new Oracle GenAI with Gemini
 */
import * as fs from 'fs';
import * as path from 'path';

// Manually load .env file
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach((line) => {
    line = line.trim();
    if (!line || line.startsWith('#')) return;
    
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      value = value.replace(/^["']|["']$/g, '');
      process.env[key] = value;
    }
  });
}

import { PrismaClient } from '@prisma/client';
import { extractInterestsWithOracle } from './src/lib/ingest/extract-oracle.js';

const prisma = new PrismaClient();

async function updateStudent(studentId: string) {
  console.log(`\n📝 Updating student ${studentId}...`);
  
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: { interests: { include: { topic: true } } },
  });

  if (!student) {
    console.log('❌ Student not found');
    return;
  }

  console.log(`Student: ${student.name} (${student.email})`);
  console.log(`Current interests: ${student.interests.map(i => i.topic.name).join(', ')}`);

  if (!student.resumeText && !student.transcriptText) {
    console.log('⚠️  No resume or transcript text to re-extract from');
    return;
  }

  console.log('\n🧠 Re-extracting interests with Oracle GenAI (Gemini)...');
  
  const combinedText = [student.resumeText, student.transcriptText]
    .filter(Boolean)
    .join('\n\n');

  const result = await extractInterestsWithOracle(combinedText);
  const extractedInterests = result.topics;

  console.log(`\n✅ Extracted ${extractedInterests.length} new interests:`);
  extractedInterests.forEach(interest => {
    console.log(`  - ${interest.topic}: ${Math.round(interest.weight * 100)}%`);
  });

  // Delete old interests
  await prisma.studentInterest.deleteMany({
    where: { studentId: student.id },
  });

  console.log('\n🗑️  Deleted old interests');

  // Deduplicate topics by name (keep highest weight)
  const topicMap = new Map<string, number>();
  for (const interest of extractedInterests) {
    const existing = topicMap.get(interest.topic);
    if (!existing || interest.weight > existing) {
      topicMap.set(interest.topic, interest.weight);
    }
  }

  const uniqueInterests = Array.from(topicMap.entries()).map(([topic, weight]) => ({
    topic,
    weight,
  }));

  console.log(`📊 Deduplicated to ${uniqueInterests.length} unique topics`);

  // Create new interests
  for (const interest of uniqueInterests) {
    // Find or create topic
    const topic = await prisma.interestTopic.findUnique({
      where: { name: interest.topic },
    });

    let topicId: string;
    if (topic) {
      topicId = topic.id;
    } else {
      const newTopic = await prisma.interestTopic.create({
        data: { name: interest.topic },
      });
      topicId = newTopic.id;
    }

    // Create student interest
    await prisma.studentInterest.create({
      data: {
        studentId: student.id,
        topicId: topicId,
        weight: interest.weight,
        source: 'resume+transcript (updated)',
      },
    });
  }

  console.log('✅ Created new interests in database');

  // Show matching events
  console.log('\n🔍 Finding matching events...');
  const events = await prisma.event.findMany({
    include: { topics: { include: { topic: true } } },
  });

  if (events.length === 0) {
    console.log('⚠️  No events in database yet');
  } else {
    for (const event of events) {
      const eventTopics = event.topics.map(t => t.topic.name.toLowerCase());
      const studentTopics = extractedInterests.map(i => i.topic.toLowerCase());
      const matches = eventTopics.filter(t => studentTopics.includes(t));
      
      if (matches.length > 0) {
        console.log(`\n📌 ${event.title}`);
        console.log(`   Matched topics: ${matches.join(', ')}`);
      }
    }
  }
}

async function main() {
  console.log('🔄 Updating existing students with new Oracle GenAI extraction...\n');

  const students = await prisma.student.findMany({
    select: { id: true, email: true, name: true },
  });

  console.log(`Found ${students.length} students in database`);

  if (students.length === 0) {
    console.log('\n✅ No students to update. Database is ready for new onboarding!');
    return;
  }

  console.log('\nStudents:');
  students.forEach((s, i) => {
    console.log(`${i + 1}. ${s.name} (${s.email})`);
  });

  // Update all students
  for (const student of students) {
    await updateStudent(student.id);
  }

  console.log('\n✅ All students updated!');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
