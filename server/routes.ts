import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { PrismaClient } from "@prisma/client";
import { extractInterestsFromText } from "../src/lib/ingest/extract.js";
import { extractInterestsFromTranscript, mergeInterests } from "../src/lib/ingest/extract-transcript.js";
import { normalizeWeights } from "../src/lib/ingest/normalize.js";
import { scoreEventsForStudent, scoreStudentsForEvent } from "../src/lib/scoring.js";
import multer from "multer";
import { processUploadedDocument } from "../src/lib/storage/file-handler.js";

const prisma = new PrismaClient();
const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  console.log('\n✅ Routes registered - Topic normalization ENABLED\n');
  
  // Student onboarding
  app.post("/api/students/onboard", async (req, res) => {
    try {
      const { 
        email, 
        name, 
        major, 
        year, 
        resumeText,
        resumeUrl,
        transcriptText,
        transcriptUrl
      } = req.body;

      if (!email || !name) {
        return res.status(400).json({ error: 'Email and name are required' });
      }

      // Check if student already exists
      const existing = await prisma.student.findUnique({
        where: { email },
      });

      if (existing) {
        return res.status(409).json({ error: 'Student with this email already exists' });
      }

      // Extract interests
      let interests: any[] = [];
      
      if (resumeText || transcriptText) {
        let resumeInterests: any[] = [];
        let transcriptInterests: any[] = [];
        
        if (resumeText) {
          const extracted = await extractInterestsFromText(resumeText);
          resumeInterests = extracted.topics;
        }
        
        if (transcriptText) {
          const extracted = await extractInterestsFromTranscript(transcriptText);
          transcriptInterests = extracted.topics;
        }
        
        if (resumeInterests.length > 0 && transcriptInterests.length > 0) {
          interests = mergeInterests(resumeInterests, transcriptInterests);
        } else if (resumeInterests.length > 0) {
          interests = resumeInterests;
        } else if (transcriptInterests.length > 0) {
          interests = transcriptInterests;
        }
        
        interests = normalizeWeights(interests);
      }

      // Create student
      const student = await prisma.student.create({
        data: {
          email,
          name,
          major,
          year,
          resumeText,
          resumeUrl,
          transcriptText,
          transcriptUrl,
        },
      });

      // Save interests
      if (interests.length > 0) {
        for (const interest of interests) {
          let topic = await prisma.interestTopic.findUnique({
            where: { name: interest.topic },
          });

          if (!topic) {
            topic = await prisma.interestTopic.create({
              data: { name: interest.topic },
            });
          }

          await prisma.studentInterest.create({
            data: {
              studentId: student.id,
              topicId: topic.id,
              weight: interest.weight,
              source: resumeText && transcriptText ? 'resume+transcript' : (resumeText ? 'resume' : 'transcript'),
            },
          });
        }
      }

      // Fetch complete student
      const completeStudent = await prisma.student.findUnique({
        where: { id: student.id },
        include: {
          interests: {
            include: {
              topic: true,
            },
          },
        },
      });

      res.json({
        student: completeStudent,
        extractedInterests: interests,
      });
    } catch (error: any) {
      console.error('Error onboarding student:', error);
      res.status(500).json({ error: `Failed to onboard student: ${error.message}` });
    }
  });

  // Organizer onboarding
  app.post("/api/organizers/onboard", async (req, res) => {
    try {
      const { email, name, organization } = req.body;

      if (!email || !name) {
        return res.status(400).json({ error: 'Email and name are required' });
      }

      // Check if organizer already exists
      const existing = await prisma.organizer.findUnique({
        where: { email },
      });

      if (existing) {
        return res.status(409).json({ error: 'Organizer with this email already exists' });
      }

      // Create organizer
      const organizer = await prisma.organizer.create({
        data: {
          email,
          name,
          organization,
        },
      });

      res.json({ organizer });
    } catch (error: any) {
      console.error('Error onboarding organizer:', error);
      res.status(500).json({ error: `Failed to onboard organizer: ${error.message}` });
    }
  });

  // Get organizers (with optional email filter for login)
  app.get("/api/organizers", async (req, res) => {
    try {
      const { email } = req.query;
      
      const organizers = await prisma.organizer.findMany({
        where: email ? { email: String(email) } : undefined,
        include: {
          events: {
            select: {
              id: true,
              title: true,
              eventDate: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      // If filtering by email, return array directly for login compatibility
      res.json(email ? organizers : { organizers });
    } catch (error: any) {
      console.error('Error fetching organizers:', error);
      res.status(500).json({ error: 'Failed to fetch organizers' });
    }
  });

  // Get single organizer
  app.get("/api/organizers/:id", async (req, res) => {
    try {
      const organizer = await prisma.organizer.findUnique({
        where: { id: req.params.id },
        include: {
          events: {
            include: {
              topics: {
                include: {
                  topic: true,
                },
              },
            },
          },
        },
      });

      if (!organizer) {
        return res.status(404).json({ error: 'Organizer not found' });
      }

      res.json(organizer);
    } catch (error: any) {
      console.error('Error fetching organizer:', error);
      res.status(500).json({ error: 'Failed to fetch organizer' });
    }
  });

  // File upload endpoint
  app.post("/api/students/upload", upload.single('file'), async (req, res) => {
    try {
      const file = req.file;
      const type = req.body.type as 'resume' | 'transcript';
      
      if (!file) {
        return res.status(400).json({ error: 'No file provided' });
      }
      
      if (!type || (type !== 'resume' && type !== 'transcript')) {
        return res.status(400).json({ error: 'Invalid type. Must be "resume" or "transcript"' });
      }
      
      const folder = type === 'resume' ? 'resumes' : 'transcripts';
      const result = await processUploadedDocument(
        file.buffer,
        file.originalname,
        folder
      );
      
      res.json({
        text: result.text,
        url: result.url,
        filename: file.originalname,
        size: file.size,
      });
    } catch (error: any) {
      console.error('Error uploading file:', error);
      res.status(500).json({ error: error.message || 'Failed to upload file' });
    }
  });

  // Create event
  app.post("/api/events", async (req, res) => {
    try {
      const {
        centerId,
        organizerId,
        title,
        description,
        eventDate,
        location,
        topics,
        requirements,
        requiredMajors,
        requiredYears,
      } = req.body;

      if (!centerId || !organizerId || !title || !description || !eventDate) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const event = await prisma.event.create({
        data: {
          centerId,
          organizerId,
          title,
          description,
          eventDate: new Date(eventDate),
          location,
          requirements,
          requiredMajors,
          requiredYears,
        },
      });

      if (topics && Array.isArray(topics)) {
        for (const topicData of topics) {
          let topic = await prisma.interestTopic.findUnique({
            where: { name: topicData.topic },
          });

          if (!topic) {
            topic = await prisma.interestTopic.create({
              data: { name: topicData.topic },
            });
          }

          await prisma.eventTopic.create({
            data: {
              eventId: event.id,
              topicId: topic.id,
              weight: topicData.weight || 1.0,
            },
          });
        }
      }

      const completeEvent = await prisma.event.findUnique({
        where: { id: event.id },
        include: {
          center: true,
          topics: {
            include: {
              topic: true,
            },
          },
        },
      });

      res.json({ event: completeEvent });
    } catch (error: any) {
      console.error('Error creating event:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get all events (with optional organizerId filter)
  app.get("/api/events", async (req, res) => {
    try {
      const { organizerId } = req.query;
      
      const events = await prisma.event.findMany({
        where: organizerId ? { organizerId: String(organizerId) } : undefined,
        include: {
          center: true,
          organizer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          topics: {
            include: {
              topic: true,
            },
          },
        },
        orderBy: {
          eventDate: 'asc',
        },
      });

      res.json({ events });
    } catch (error: any) {
      console.error('Error fetching events:', error);
      res.status(500).json({ error: 'Failed to fetch events' });
    }
  });

  // Get all students (or filter by email)
  app.get("/api/students", async (req, res) => {
    try {
      const { email } = req.query;
      
      const students = await prisma.student.findMany({
        where: email ? { email: String(email) } : undefined,
        include: {
          interests: {
            include: {
              topic: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      // If filtering by email, return array directly for compatibility
      res.json(email ? students : { students });
    } catch (error: any) {
      console.error('Error fetching students:', error);
      res.status(500).json({ error: 'Failed to fetch students' });
    }
  });

  // Get single student
  app.get("/api/students/:id", async (req, res) => {
    try {
      const student = await prisma.student.findUnique({
        where: { id: req.params.id },
        include: {
          interests: {
            include: {
              topic: true,
            },
          },
        },
      });

      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }

      res.json({ student });
    } catch (error: any) {
      console.error('Error fetching student:', error);
      res.status(500).json({ error: 'Failed to fetch student' });
    }
  });

  // Get all centers
  app.get("/api/centers", async (req, res) => {
    try {
      const centers = await prisma.center.findMany({
        orderBy: {
          name: 'asc',
        },
      });

      res.json({ centers });
    } catch (error: any) {
      console.error('Error fetching centers:', error);
      res.status(500).json({ error: 'Failed to fetch centers' });
    }
  });

  // Create center
  app.post("/api/centers", async (req, res) => {
    try {
      const { name, description } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Name is required' });
      }

      const center = await prisma.center.create({
        data: {
          name,
          description,
        },
      });

      res.json({ center });
    } catch (error: any) {
      console.error('Error creating center:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get matched events for a student
  app.get("/api/students/:id/matches", async (req, res) => {
    try {
      const studentId = req.params.id;
      const threshold = parseFloat(req.query.threshold as string) || 0.3;

      // Get student with interests
      const student = await prisma.student.findUnique({
        where: { id: studentId },
        include: {
          interests: {
            include: {
              topic: true,
            },
          },
        },
      });

      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }

      // Get all events with topics
      const events = await prisma.event.findMany({
        include: {
          center: true,
          topics: {
            include: {
              topic: true,
            },
          },
        },
      });

      // Convert to scoring format
      const studentVector = {
        studentId: student.id,
        topics: student.interests.map(i => ({
          topic: i.topic.name,
          weight: i.weight,
        })),
        major: student.major,
        year: student.year,
      };

      const eventVectors = events.map(e => ({
        eventId: e.id,
        topics: e.topics.map(t => ({
          topic: t.topic.name,
          weight: t.weight,
        })),
        requiredMajors: e.requiredMajors,
        requiredYears: e.requiredYears,
      }));

      // Calculate matches
      const matches = scoreEventsForStudent(studentVector, eventVectors, threshold);

      // Enrich with full event data
      const enrichedMatches = matches.map(match => ({
        ...match,
        event: events.find(e => e.id === match.eventId),
      }));

      res.json({ matches: enrichedMatches });
    } catch (error: any) {
      console.error('Error getting student matches:', error);
      res.status(500).json({ error: 'Failed to get matches' });
    }
  });

  // Get matched students for an event
  app.get("/api/events/:id/matches", async (req, res) => {
    try {
      const eventId = req.params.id;
      const threshold = parseFloat(req.query.threshold as string) || 0.3;

      // Get event with topics
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: {
          topics: {
            include: {
              topic: true,
            },
          },
        },
      });

      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }

      console.log('\n🔍 DEBUG: Event matching for:', event.title);
      console.log('Event topics:', event.topics.map(t => t.topic.name));

      // Get all students with interests
      const students = await prisma.student.findMany({
        include: {
          interests: {
            include: {
              topic: true,
            },
          },
        },
      });

      console.log(`Found ${students.length} students`);
      students.forEach(s => {
        console.log(`  - ${s.name}: ${s.interests.map(i => i.topic.name).slice(0, 3).join(', ')}...`);
      });

      // Convert to scoring format
      const eventVector = {
        eventId: event.id,
        topics: event.topics.map(t => ({
          topic: t.topic.name,
          weight: t.weight,
        })),
        requiredMajors: event.requiredMajors,
        requiredYears: event.requiredYears,
      };

      const studentVectors = students.map(s => ({
        studentId: s.id,
        topics: s.interests.map(i => ({
          topic: i.topic.name,
          weight: i.weight,
        })),
        major: s.major,
        year: s.year,
      }));

      // Calculate matches
      const matches = scoreStudentsForEvent(studentVectors, eventVector, threshold);

      console.log(`Matches found (threshold: ${threshold}):`, matches.length);
      matches.forEach(m => {
        console.log(`  - ${m.studentId}: ${(m.score * 100).toFixed(1)}% (${m.matchedTopics.join(', ')})`);
      });

      // Enrich with full student data
      const enrichedMatches = matches.map(match => ({
        ...match,
        student: students.find(s => s.id === match.studentId),
      }));

      res.json({ matches: enrichedMatches });
    } catch (error: any) {
      console.error('Error getting event matches:', error);
      res.status(500).json({ error: 'Failed to get matches' });
    }
  });

  // Send campaign emails
  app.post("/api/campaigns/send", async (req, res) => {
    try {
      const { eventId, subject, message, recipients } = req.body;

      if (!eventId || !subject || !message || !recipients || !Array.isArray(recipients)) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // In a production app, you would integrate with an email service like SendGrid, Mailgun, etc.
      // For now, we'll simulate sending emails by logging them
      console.log('\n📧 CAMPAIGN SENT:');
      console.log('Event ID:', eventId);
      console.log('Subject:', subject);
      console.log('Recipients:', recipients.length);
      console.log('\n--- Sample Email ---');
      
      if (recipients.length > 0) {
        const sampleRecipient = recipients[0];
        const personalizedMessage = message.replace(/{name}/g, sampleRecipient.name);
        console.log('To:', sampleRecipient.email);
        console.log('Subject:', subject);
        console.log('Body:\n', personalizedMessage);
        console.log('-------------------\n');
      }

      // Log all recipients
      recipients.forEach((recipient: any, index: number) => {
        console.log(`${index + 1}. ${recipient.name} <${recipient.email}>`);
      });

      // In production, you would:
      // 1. Create a Campaign record in the database
      // 2. Send emails via email service
      // 3. Track delivery status
      // 
      // Example with SendGrid:
      // const sgMail = require('@sendgrid/mail');
      // for (const recipient of recipients) {
      //   const personalizedMessage = message.replace(/{name}/g, recipient.name);
      //   await sgMail.send({
      //     to: recipient.email,
      //     from: 'events@university.edu',
      //     subject: subject,
      //     text: personalizedMessage,
      //   });
      // }

      res.json({ 
        success: true, 
        message: `Campaign sent to ${recipients.length} students`,
        // In production, return campaign ID and tracking info
      });
    } catch (error: any) {
      console.error('Error sending campaign:', error);
      res.status(500).json({ error: 'Failed to send campaign' });
    }
  });

  return httpServer;
}
