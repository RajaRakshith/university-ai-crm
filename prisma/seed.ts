import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create centers
  const centers = await Promise.all([
    prisma.center.upsert({
      where: { name: 'Entrepreneurship Center' },
      update: {},
      create: {
        name: 'Entrepreneurship Center',
        description: 'Supporting student startups and innovation',
      },
    }),
    prisma.center.upsert({
      where: { name: 'AI Research Lab' },
      update: {},
      create: {
        name: 'AI Research Lab',
        description: 'Advancing artificial intelligence research',
      },
    }),
    prisma.center.upsert({
      where: { name: 'Career Services' },
      update: {},
      create: {
        name: 'Career Services',
        description: 'Career development and job placement',
      },
    }),
    prisma.center.upsert({
      where: { name: 'Sustainability Institute' },
      update: {},
      create: {
        name: 'Sustainability Institute',
        description: 'Climate and environmental initiatives',
      },
    }),
  ]);

  console.log(`✅ Created ${centers.length} centers`);

  // Create topics
  const topics = await Promise.all([
    prisma.interestTopic.upsert({ where: { name: 'AI' }, update: {}, create: { name: 'AI', category: 'Technology' } }),
    prisma.interestTopic.upsert({ where: { name: 'Machine Learning' }, update: {}, create: { name: 'Machine Learning', category: 'Technology' } }),
    prisma.interestTopic.upsert({ where: { name: 'Healthcare' }, update: {}, create: { name: 'Healthcare', category: 'Industry' } }),
    prisma.interestTopic.upsert({ where: { name: 'Climate' }, update: {}, create: { name: 'Climate', category: 'Industry' } }),
    prisma.interestTopic.upsert({ where: { name: 'Entrepreneurship' }, update: {}, create: { name: 'Entrepreneurship', category: 'Career' } }),
    prisma.interestTopic.upsert({ where: { name: 'VC' }, update: {}, create: { name: 'VC', category: 'Finance' } }),
    prisma.interestTopic.upsert({ where: { name: 'Startups' }, update: {}, create: { name: 'Startups', category: 'Career' } }),
    prisma.interestTopic.upsert({ where: { name: 'Data Science' }, update: {}, create: { name: 'Data Science', category: 'Technology' } }),
    prisma.interestTopic.upsert({ where: { name: 'Product Management' }, update: {}, create: { name: 'Product Management', category: 'Career' } }),
    prisma.interestTopic.upsert({ where: { name: 'Consulting' }, update: {}, create: { name: 'Consulting', category: 'Career' } }),
    prisma.interestTopic.upsert({ where: { name: 'Finance' }, update: {}, create: { name: 'Finance', category: 'Career' } }),
    prisma.interestTopic.upsert({ where: { name: 'Supply Chain' }, update: {}, create: { name: 'Supply Chain', category: 'Industry' } }),
    prisma.interestTopic.upsert({ where: { name: 'Web3' }, update: {}, create: { name: 'Web3', category: 'Technology' } }),
    prisma.interestTopic.upsert({ where: { name: 'Networking' }, update: {}, create: { name: 'Networking', category: 'Skill' } }),
    prisma.interestTopic.upsert({ where: { name: 'Research' }, update: {}, create: { name: 'Research', category: 'Academic' } }),
  ]);

  console.log(`✅ Created ${topics.length} topics`);

  // Create sample students
  const students = await Promise.all([
    prisma.student.create({
      data: {
        email: 'alice@university.edu',
        name: 'Alice Chen',
        major: 'Computer Science & Business',
        year: 'MBA',
        interests: {
          create: [
            { topicId: topics.find(t => t.name === 'AI')!.id, weight: 0.95, source: 'resume' },
            { topicId: topics.find(t => t.name === 'Healthcare')!.id, weight: 0.82, source: 'resume' },
            { topicId: topics.find(t => t.name === 'Startups')!.id, weight: 0.78, source: 'resume' },
          ],
        },
      },
    }),
    prisma.student.create({
      data: {
        email: 'bob@university.edu',
        name: 'Bob Martinez',
        major: 'Environmental Engineering',
        year: 'Graduate',
        interests: {
          create: [
            { topicId: topics.find(t => t.name === 'Climate')!.id, weight: 0.91, source: 'resume' },
            { topicId: topics.find(t => t.name === 'Entrepreneurship')!.id, weight: 0.73, source: 'resume' },
            { topicId: topics.find(t => t.name === 'Data Science')!.id, weight: 0.65, source: 'resume' },
          ],
        },
      },
    }),
    prisma.student.create({
      data: {
        email: 'carol@university.edu',
        name: 'Carol Singh',
        major: 'Finance',
        year: 'MBA',
        interests: {
          create: [
            { topicId: topics.find(t => t.name === 'VC')!.id, weight: 0.88, source: 'resume' },
            { topicId: topics.find(t => t.name === 'Startups')!.id, weight: 0.85, source: 'resume' },
            { topicId: topics.find(t => t.name === 'Entrepreneurship')!.id, weight: 0.79, source: 'resume' },
          ],
        },
      },
    }),
  ]);

  console.log(`✅ Created ${students.length} sample students`);

  // Create sample events
  const events = await Promise.all([
    prisma.event.create({
      data: {
        centerId: centers.find(c => c.name === 'AI Research Lab')!.id,
        title: 'AI for Healthcare Pitch Night',
        description: 'Present your AI healthcare startup ideas to industry experts',
        eventDate: new Date('2026-03-15T18:00:00'),
        location: 'Ross School of Business',
        topics: {
          create: [
            { topicId: topics.find(t => t.name === 'AI')!.id, weight: 1.0 },
            { topicId: topics.find(t => t.name === 'Healthcare')!.id, weight: 1.0 },
            { topicId: topics.find(t => t.name === 'Startups')!.id, weight: 0.8 },
          ],
        },
      },
    }),
    prisma.event.create({
      data: {
        centerId: centers.find(c => c.name === 'Sustainability Institute')!.id,
        title: 'Climate Tech Grant Workshop',
        description: 'Learn how to apply for $50K climate innovation grants',
        eventDate: new Date('2026-03-20T16:00:00'),
        location: 'Engineering Building',
        topics: {
          create: [
            { topicId: topics.find(t => t.name === 'Climate')!.id, weight: 1.0 },
            { topicId: topics.find(t => t.name === 'Entrepreneurship')!.id, weight: 0.7 },
          ],
        },
      },
    }),
    prisma.event.create({
      data: {
        centerId: centers.find(c => c.name === 'Entrepreneurship Center')!.id,
        title: 'VC Office Hours',
        description: 'One-on-one sessions with venture capital partners',
        eventDate: new Date('2026-03-18T14:00:00'),
        location: 'Virtual',
        topics: {
          create: [
            { topicId: topics.find(t => t.name === 'VC')!.id, weight: 1.0 },
            { topicId: topics.find(t => t.name === 'Startups')!.id, weight: 0.9 },
            { topicId: topics.find(t => t.name === 'Networking')!.id, weight: 0.6 },
          ],
        },
      },
    }),
    prisma.event.create({
      data: {
        centerId: centers.find(c => c.name === 'Career Services')!.id,
        title: 'Product Management Career Panel',
        description: 'Hear from PMs at Google, Meta, and Amazon',
        eventDate: new Date('2026-03-22T17:30:00'),
        location: 'Student Union',
        topics: {
          create: [
            { topicId: topics.find(t => t.name === 'Product Management')!.id, weight: 1.0 },
            { topicId: topics.find(t => t.name === 'Networking')!.id, weight: 0.7 },
          ],
        },
      },
    }),
  ]);

  console.log(`✅ Created ${events.length} sample events`);

  console.log('🎉 Seeding complete!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
