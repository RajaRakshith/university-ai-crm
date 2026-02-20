/**
 * Seed script to populate database with sample students and postings for testing.
 * Run with: npm run seed
 * 
 * This script creates 8 diverse sample students and 10 sample postings.
 * Students will have topics extracted using Gemini (if configured) or fallback pattern matching.
 * All data is inserted directly into the database for testing purposes.
 */

import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// Load .env before anything else
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../.env") });
if (!process.env.DATABASE_URL) {
  config({ path: resolve(__dirname, "../../../../.env") });
}

import { storage } from "./storage";
import { inferTopicsWithGemini, createEmbedding, isOciConfigured } from "./oci";

// Sample resume and transcript texts with diverse backgrounds
const SAMPLE_STUDENTS = [
  {
    firstName: "Alex",
    lastName: "Chen",
    email: "alex.chen@umich.edu",
    resume: `Alex Chen
Software Engineer | Machine Learning Researcher

EDUCATION
University of Michigan, Ann Arbor
Bachelor of Science in Computer Science, GPA: 3.9/4.0
Expected Graduation: May 2026

Relevant Coursework: Machine Learning, Deep Learning, Natural Language Processing, Computer Vision, Distributed Systems

EXPERIENCE
Research Assistant - ML Lab, University of Michigan (Jan 2024 - Present)
- Developed transformer-based models for protein structure prediction using PyTorch
- Published paper on "Attention Mechanisms in Computational Biology" (under review)
- Collaborated with biology department on multi-modal learning approaches
- Reduced prediction error by 23% using novel attention architectures

Software Engineering Intern - Google Cloud AI (Summer 2024)
- Built scalable ML pipelines for document understanding using TensorFlow
- Implemented distributed training for large language models on Kubernetes
- Optimized inference latency by 40% using model quantization techniques
- Worked on AutoML features for enterprise customers

PROJECTS
Protein Folding Predictor (2024)
- Built end-to-end pipeline for predicting protein structures from amino acid sequences
- Used graph neural networks and attention mechanisms
- Achieved state-of-the-art results on CASP14 benchmark dataset

SKILLS
Programming: Python, C++, CUDA, TypeScript
ML Frameworks: PyTorch, TensorFlow, JAX, Hugging Face Transformers
Cloud: Google Cloud Platform, Kubernetes, Docker
Research: Computational Biology, Protein Structure Prediction, Multi-modal Learning`,
    transcript: `University of Michigan Transcript
Alex Chen - Student ID: 12345678

Fall 2023
EECS 281 - Data Structures and Algorithms: A
EECS 445 - Machine Learning: A
MATH 214 - Applied Linear Algebra: A-
STATS 250 - Introduction to Statistics: A

Winter 2024
EECS 442 - Computer Vision: A
EECS 484 - Database Systems: A
EECS 492 - Artificial Intelligence: A
BIOLOGY 305 - Molecular Biology: B+

Spring 2024
EECS 545 - Machine Learning: Advanced Topics: A
EECS 586 - Distributed Systems: A
EECS 498 - Natural Language Processing: A
CHEM 210 - Organic Chemistry: B`,
  },
  {
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.j@umich.edu",
    resume: `Sarah Johnson
Quantitative Finance & Data Science

EDUCATION
University of Michigan, Ross School of Business
Bachelor of Business Administration, Concentration: Finance
Minor: Mathematics
GPA: 3.85/4.0
Expected Graduation: May 2026

EXPERIENCE
Quantitative Trading Intern - Citadel Securities (Summer 2024)
- Developed algorithmic trading strategies using Python and C++
- Built statistical arbitrage models for equity markets
- Analyzed high-frequency trading data using pandas and NumPy
- Contributed to strategy that generated $2M+ in alpha

Research Assistant - Financial Engineering Lab (Jan 2024 - Present)
- Researching applications of machine learning in portfolio optimization
- Implementing reinforcement learning for dynamic asset allocation
- Using Monte Carlo simulations for risk analysis
- Co-authoring paper on "Deep Learning for Option Pricing"

PROJECTS
Cryptocurrency Trading Bot (2023)
- Built automated trading system using technical indicators and ML
- Implemented backtesting framework with realistic transaction costs
- Achieved 15% annualized returns with controlled risk

SKILLS
Programming: Python, C++, R, SQL, MATLAB
Finance: Options Pricing, Risk Management, Portfolio Theory, Derivatives
Data Science: scikit-learn, pandas, NumPy, Jupyter, Statistical Modeling
Trading: Algorithmic Trading, High-Frequency Trading, Market Microstructure`,
    transcript: `University of Michigan Transcript
Sarah Johnson - Student ID: 23456789

Fall 2023
FIN 300 - Corporate Finance: A
MATH 214 - Applied Linear Algebra: A
STATS 250 - Introduction to Statistics: A
ECON 101 - Principles of Economics: A-

Winter 2024
FIN 302 - Investments: A
MATH 216 - Introduction to Differential Equations: A
EECS 183 - Elementary Programming Concepts: A
ACC 300 - Financial Accounting: B+

Spring 2024
FIN 401 - Financial Markets: A
MATH 425 - Probability: A
EECS 280 - Programming and Intro Data Structures: A
STATS 412 - Introduction to Probability and Statistics: A`,
  },
  {
    firstName: "Michael",
    lastName: "Rodriguez",
    email: "mrodriguez@umich.edu",
    resume: `Michael Rodriguez
Mechanical Engineering | Sustainable Energy Systems

EDUCATION
University of Michigan, College of Engineering
Bachelor of Science in Mechanical Engineering
GPA: 3.7/4.0
Expected Graduation: May 2026

EXPERIENCE
Engineering Intern - Tesla Energy (Summer 2024)
- Designed thermal management systems for battery storage solutions
- Conducted CFD simulations using ANSYS Fluent for heat dissipation
- Prototyped cooling solutions for grid-scale energy storage
- Reduced thermal stress by 18% through optimized design

Research Assistant - Sustainable Energy Lab (Sep 2023 - Present)
- Developing novel solar panel mounting systems for extreme weather
- Testing materials for wind turbine blade optimization
- Using finite element analysis (FEA) for structural design
- Field testing renewable energy installations

PROJECTS
Solar-Powered Water Purification System (2024)
- Designed and built portable water purification unit for developing regions
- Integrated solar panels with battery storage and filtration system
- Won 1st place at University Engineering Design Competition

SKILLS
Engineering: CAD (SolidWorks, AutoCAD), FEA, CFD, MATLAB, LabVIEW
Manufacturing: 3D Printing, CNC Machining, Welding, Prototyping
Energy Systems: Solar PV Design, Battery Systems, Grid Integration
Software: Python, C++, MATLAB, ANSYS, COMSOL`,
    transcript: `University of Michigan Transcript
Michael Rodriguez - Student ID: 34567890

Fall 2023
MECHENG 211 - Introduction to Solid Mechanics: B+
MECHENG 240 - Introduction to Dynamics and Vibrations: A
MATH 216 - Introduction to Differential Equations: A
PHYSICS 240 - General Physics II: A-

Winter 2024
MECHENG 250 - Design and Manufacturing I: A
MECHENG 360 - Thermodynamics: A
MATH 214 - Applied Linear Algebra: B+
CHEM 130 - General Chemistry: A

Spring 2024
MECHENG 350 - Fluid Mechanics: A
MECHENG 365 - Heat Transfer: A
EECS 183 - Elementary Programming Concepts: A
ENGR 100 - Introduction to Engineering: A`,
  },
  {
    firstName: "Emily",
    lastName: "Wang",
    email: "ewang@umich.edu",
    resume: `Emily Wang
Biomedical Engineering | Medical Device Innovation

EDUCATION
University of Michigan, College of Engineering
Bachelor of Science in Biomedical Engineering
GPA: 3.9/4.0
Expected Graduation: May 2026

EXPERIENCE
Medical Device Intern - Medtronic (Summer 2024)
- Designed components for next-generation pacemaker systems
- Conducted biocompatibility testing per ISO 10993 standards
- Used CAD software (SolidWorks) for device prototyping
- Collaborated with clinical team on user-centered design

Research Assistant - Tissue Engineering Lab (Jan 2024 - Present)
- Developing 3D bioprinted scaffolds for cartilage regeneration
- Using stem cell culture techniques and biomaterials
- Characterizing mechanical properties using atomic force microscopy
- Co-authoring paper on "Hydrogel-Based Tissue Constructs"

PROJECTS
Wearable ECG Monitor (2024)
- Designed low-cost ECG monitoring device for remote patient care
- Integrated machine learning for arrhythmia detection
- Built mobile app for data visualization and alerts
- Prototyped using Arduino and custom PCB design

SKILLS
Engineering: CAD (SolidWorks, Fusion 360), FEA, Prototyping, 3D Printing
Biomedical: Cell Culture, Biomaterials, Medical Device Design, Regulatory (FDA)
Programming: Python, MATLAB, C++, Arduino
Research: Tissue Engineering, Regenerative Medicine, Biomechanics`,
    transcript: `University of Michigan Transcript
Emily Wang - Student ID: 45678901

Fall 2023
BIOMEDE 211 - Introduction to Biomedical Engineering: A
BIOMEDE 221 - Biomechanics: A
CHEM 210 - Organic Chemistry: A
MATH 214 - Applied Linear Algebra: A

Winter 2024
BIOMEDE 231 - Biomaterials: A
BIOMEDE 241 - Biomedical Instrumentation: A
BIOLOGY 305 - Molecular Biology: A
STATS 250 - Introduction to Statistics: A-

Spring 2024
BIOMEDE 351 - Tissue Engineering: A
BIOMEDE 361 - Biomedical Signal Processing: A
EECS 183 - Elementary Programming Concepts: A
PHYSICS 240 - General Physics II: A`,
  },
  {
    firstName: "David",
    lastName: "Kim",
    email: "dkim@umich.edu",
    resume: `David Kim
Product Design | User Experience Research

EDUCATION
University of Michigan, Stamps School of Art & Design
Bachelor of Fine Arts in Design
Minor: Psychology
GPA: 3.8/4.0
Expected Graduation: May 2026

EXPERIENCE
UX Design Intern - Apple (Summer 2024)
- Designed interaction patterns for iOS accessibility features
- Conducted user research with visually impaired users
- Created high-fidelity prototypes using Figma and Principle
- Contributed to design system for inclusive interfaces

Design Research Assistant - Human-Computer Interaction Lab (Sep 2023 - Present)
- Researching voice user interfaces for elderly populations
- Conducting usability studies and analyzing user behavior
- Using eye-tracking technology for attention analysis
- Publishing findings on "Designing for Cognitive Accessibility"

PROJECTS
Accessible Navigation App (2024)
- Designed mobile app for indoor navigation using AR
- Focused on accessibility for users with visual impairments
- Conducted 20+ user interviews and iterative testing
- Won Design Excellence Award at University Design Showcase

SKILLS
Design: Figma, Sketch, Adobe Creative Suite, Principle, Framer
Research: User Interviews, Usability Testing, Eye-Tracking, Surveys
Prototyping: Interactive Prototypes, Wireframing, User Flows
Technical: HTML/CSS, JavaScript, React (basic), Design Systems`,
    transcript: `University of Michigan Transcript
David Kim - Student ID: 56789012

Fall 2023
ARTDES 200 - Introduction to Design: A
ARTDES 250 - Digital Design Tools: A
PSYCH 240 - Introduction to Cognitive Psychology: A
SI 110 - Introduction to Information Studies: A-

Winter 2024
ARTDES 300 - Interaction Design: A
ARTDES 350 - User Experience Design: A
PSYCH 280 - Research Methods in Psychology: A
SI 330 - Data Manipulation: B+

Spring 2024
ARTDES 400 - Advanced Design Studio: A
ARTDES 450 - Design Research Methods: A
EECS 183 - Elementary Programming Concepts: A
SI 339 - Web Design and Development: A`,
  },
  {
    firstName: "Jessica",
    lastName: "Martinez",
    email: "jmartinez@umich.edu",
    resume: `Jessica Martinez
Data Science | Healthcare Analytics

EDUCATION
University of Michigan, School of Information
Bachelor of Science in Information
Concentration: Data Analytics
GPA: 3.9/4.0
Expected Graduation: May 2026

EXPERIENCE
Data Science Intern - Blue Cross Blue Shield (Summer 2024)
- Built predictive models for patient readmission risk
- Analyzed healthcare claims data using SQL and Python
- Created dashboards in Tableau for clinical decision support
- Reduced false positive rate by 30% using ensemble methods

Research Assistant - Health Informatics Lab (Jan 2024 - Present)
- Analyzing electronic health records for disease prediction
- Using natural language processing to extract clinical insights
- Implementing privacy-preserving ML techniques (federated learning)
- Co-authoring paper on "ML for Early Disease Detection"

PROJECTS
Mental Health Prediction Model (2024)
- Developed ML model to predict depression risk from social media
- Used NLP techniques to analyze text patterns
- Achieved 78% accuracy with ethical considerations for privacy
- Presented at Undergraduate Research Symposium

SKILLS
Data Science: Python (pandas, scikit-learn, TensorFlow), R, SQL
Visualization: Tableau, Power BI, D3.js, matplotlib, seaborn
Healthcare: Electronic Health Records, Clinical Data, HIPAA Compliance
ML: Predictive Modeling, NLP, Time Series Analysis, Feature Engineering`,
    transcript: `University of Michigan Transcript
Jessica Martinez - Student ID: 67890123

Fall 2023
SI 330 - Data Manipulation: A
SI 339 - Web Design and Development: A
STATS 250 - Introduction to Statistics: A
PUBHLTH 200 - Introduction to Public Health: A-

Winter 2024
SI 370 - Data Exploration: A
SI 380 - Information Systems Analysis: A
EECS 183 - Elementary Programming Concepts: A
PUBHLTH 300 - Epidemiology: A

Spring 2024
SI 430 - Database Design: A
SI 470 - Data Mining: A
STATS 412 - Introduction to Probability and Statistics: A
PUBHLTH 310 - Health Informatics: A`,
  },
  {
    firstName: "Ryan",
    lastName: "Thompson",
    email: "rthompson@umich.edu",
    resume: `Ryan Thompson
Cybersecurity | Network Security Research

EDUCATION
University of Michigan, College of Engineering
Bachelor of Science in Computer Science
Concentration: Cybersecurity
GPA: 3.8/4.0
Expected Graduation: May 2026

EXPERIENCE
Security Engineering Intern - CrowdStrike (Summer 2024)
- Developed threat detection algorithms for endpoint security
- Analyzed malware samples using reverse engineering techniques
- Built automated analysis pipeline using Python and YARA rules
- Identified zero-day vulnerability in popular software

Security Research Assistant - Cybersecurity Lab (Sep 2023 - Present)
- Researching adversarial attacks on machine learning models
- Developing defense mechanisms for neural network security
- Using penetration testing tools (Metasploit, Burp Suite)
- Publishing research on "Adversarial Robustness in ML Systems"

PROJECTS
Blockchain-Based Voting System (2024)
- Designed secure voting protocol using blockchain technology
- Implemented cryptographic voting schemes (homomorphic encryption)
- Built web interface with React and smart contracts (Solidity)
- Won Best Security Project at University Hackathon

SKILLS
Security: Penetration Testing, Reverse Engineering, Cryptography, Threat Analysis
Programming: Python, C, C++, Go, Solidity, Assembly
Tools: Wireshark, Metasploit, Burp Suite, IDA Pro, Ghidra
Networking: TCP/IP, Network Protocols, Firewall Configuration, VPN`,
    transcript: `University of Michigan Transcript
Ryan Thompson - Student ID: 78901234

Fall 2023
EECS 281 - Data Structures and Algorithms: A
EECS 388 - Introduction to Computer Security: A
EECS 484 - Database Systems: A
MATH 214 - Applied Linear Algebra: A-

Winter 2024
EECS 498 - Network Security: A
EECS 492 - Artificial Intelligence: A
EECS 388 - Computer Security: A
MATH 425 - Probability: A

Spring 2024
EECS 598 - Advanced Cryptography: A
EECS 545 - Machine Learning: Advanced Topics: A
EECS 586 - Distributed Systems: A
PHIL 340 - Ethics of Technology: A`,
  },
  {
    firstName: "Olivia",
    lastName: "Brown",
    email: "obrown@umich.edu",
    resume: `Olivia Brown
Environmental Science | Climate Policy Research

EDUCATION
University of Michigan, School for Environment and Sustainability
Bachelor of Science in Environmental Science
GPA: 3.9/4.0
Expected Graduation: May 2026

EXPERIENCE
Policy Research Intern - Environmental Defense Fund (Summer 2024)
- Analyzed climate policy impacts using statistical models
- Researched carbon pricing mechanisms and their effectiveness
- Created policy briefs for congressional staff
- Contributed to report on "Renewable Energy Transition Pathways"

Research Assistant - Climate Science Lab (Jan 2024 - Present)
- Modeling climate change impacts on agricultural systems
- Using GIS software (ArcGIS, QGIS) for spatial analysis
- Analyzing satellite data for deforestation monitoring
- Co-authoring paper on "Climate Adaptation Strategies"

PROJECTS
Carbon Footprint Calculator (2024)
- Built web application to calculate personal carbon footprints
- Integrated API data for transportation and energy consumption
- Created visualization dashboard showing reduction strategies
- Deployed for use by 500+ users in sustainability program

SKILLS
Environmental: Climate Modeling, GIS, Remote Sensing, Policy Analysis
Data Analysis: Python (pandas, NumPy), R, MATLAB, Excel
Research: Statistical Analysis, Survey Design, Literature Review
Software: ArcGIS, QGIS, Google Earth Engine, RStudio`,
    transcript: `University of Michigan Transcript
Olivia Brown - Student ID: 89012345

Fall 2023
ENVIRON 201 - Introduction to Environmental Science: A
ENVIRON 211 - Introduction to Environmental Policy: A
STATS 250 - Introduction to Statistics: A
GEOG 205 - Introduction to Geographic Information Systems: A-

Winter 2024
ENVIRON 301 - Climate Change Science: A
ENVIRON 311 - Environmental Policy Analysis: A
ENVIRON 321 - Environmental Economics: A
GEOG 305 - Advanced GIS: A

Spring 2024
ENVIRON 401 - Climate Adaptation: A
ENVIRON 411 - Renewable Energy Systems: A
STATS 412 - Introduction to Probability and Statistics: A
PUBPOL 310 - Public Policy Analysis: A`,
  },
];

const SAMPLE_POSTINGS = [
  {
    posterName: "Dr. James Wilson",
    posterEmail: "jwilson@umich.edu",
    title: "Machine Learning Research Assistant - Protein Structure Prediction",
    description: "We are seeking a motivated undergraduate researcher to join our computational biology lab. The project involves developing deep learning models for predicting protein structures from amino acid sequences. You will work with transformer architectures and graph neural networks.",
    whoTheyNeed: "Looking for students with strong Python programming skills, experience with PyTorch or TensorFlow, and interest in computational biology. Background in machine learning and biology preferred.",
  },
  {
    posterName: "Prof. Maria Garcia",
    posterEmail: "mgarcia@umich.edu",
    title: "Quantitative Finance Internship - Algorithmic Trading",
    description: "Join our quantitative trading team to develop and test algorithmic trading strategies. You'll work with high-frequency market data, build statistical arbitrage models, and analyze trading performance. This is a paid internship with potential for full-time conversion.",
    whoTheyNeed: "Seeking students with strong quantitative skills, programming experience (Python/C++), and interest in financial markets. Coursework in statistics, machine learning, or finance preferred.",
  },
  {
    posterName: "Dr. Robert Chen",
    posterEmail: "rchen@umich.edu",
    title: "Renewable Energy Engineering Research - Solar Panel Optimization",
    description: "Research position focusing on optimizing solar panel mounting systems for extreme weather conditions. You'll conduct CFD simulations, test materials, and prototype new designs. Field testing opportunities available.",
    whoTheyNeed: "Mechanical engineering students with CAD experience (SolidWorks), knowledge of thermal systems, and interest in renewable energy. FEA/CFD experience a plus.",
  },
  {
    posterName: "Dr. Lisa Anderson",
    posterEmail: "landerson@umich.edu",
    title: "Biomedical Device Design - Medical Implants",
    description: "Work on designing next-generation medical implants with focus on biocompatibility and patient outcomes. You'll use CAD software, conduct material testing, and collaborate with clinical teams. Opportunity to see devices through FDA approval process.",
    whoTheyNeed: "Biomedical engineering students with CAD skills, knowledge of biomaterials, and interest in medical device design. Cell culture experience preferred.",
  },
  {
    posterName: "Sarah Lee",
    posterEmail: "slee@umich.edu",
    title: "UX Design Intern - Accessibility Features",
    description: "Design team seeking intern to work on accessibility features for mobile applications. You'll conduct user research, create prototypes, and test with users with disabilities. Focus on inclusive design principles.",
    whoTheyNeed: "Design students with UX/UI experience, proficiency in Figma or Sketch, and passion for accessibility. User research experience preferred.",
  },
  {
    posterName: "Dr. Michael Park",
    posterEmail: "mpark@umich.edu",
    title: "Healthcare Data Science - Predictive Analytics",
    description: "Research position analyzing electronic health records to predict patient outcomes. You'll build machine learning models, work with clinical data, and create dashboards for healthcare providers. Focus on improving patient care through data-driven insights.",
    whoTheyNeed: "Data science or information students with Python skills, experience with healthcare data, and knowledge of machine learning. SQL and Tableau experience preferred.",
  },
  {
    posterName: "Prof. David Lee",
    posterEmail: "dlee@umich.edu",
    title: "Cybersecurity Research - Threat Detection",
    description: "Join our cybersecurity lab researching advanced threat detection techniques. You'll analyze malware, develop detection algorithms, and work on adversarial machine learning defenses. Opportunity to publish research.",
    whoTheyNeed: "Computer science students with security background, programming skills (Python/C++), and interest in cybersecurity. Reverse engineering or penetration testing experience a plus.",
  },
  {
    posterName: "Dr. Jennifer White",
    posterEmail: "jwhite@umich.edu",
    title: "Climate Policy Research - Carbon Pricing Analysis",
    description: "Research position analyzing climate policy effectiveness, focusing on carbon pricing mechanisms. You'll use statistical models, analyze policy data, and contribute to policy briefs. Opportunity to present findings to policymakers.",
    whoTheyNeed: "Environmental science or policy students with quantitative skills, knowledge of climate policy, and experience with data analysis. GIS skills preferred.",
  },
  {
    posterName: "Dr. Christopher Taylor",
    posterEmail: "ctaylor@umich.edu",
    title: "Computer Vision Research - Medical Imaging",
    description: "Research project developing computer vision models for medical image analysis. You'll work with MRI and CT scans, develop deep learning models, and collaborate with medical professionals. Focus on early disease detection.",
    whoTheyNeed: "Computer science or engineering students with machine learning experience, Python skills, and interest in medical applications. Computer vision coursework preferred.",
  },
  {
    posterName: "Prof. Amanda Davis",
    posterEmail: "adavis@umich.edu",
    title: "Robotics Engineering - Autonomous Systems",
    description: "Join our robotics lab working on autonomous navigation systems. You'll develop algorithms, test robots in real-world environments, and work with ROS (Robot Operating System). Projects include drone navigation and ground robot systems.",
    whoTheyNeed: "Engineering students with robotics experience, C++/Python skills, and knowledge of control systems. ROS experience preferred but not required.",
  },
];

async function seedDatabase() {
  console.log("🌱 Starting database seed...\n");

  try {
    // Seed students
    console.log("📚 Creating sample students...");
    const createdStudents = [];
    
    for (const studentData of SAMPLE_STUDENTS) {
      const combinedText = `${studentData.resume}\n\n${studentData.transcript}`;
      
      // Extract topics using Gemini if available
      let topics: string[] = [];
      if (isOciConfigured()) {
        console.log(`  Processing ${studentData.firstName} ${studentData.lastName}...`);
        topics = await inferTopicsWithGemini(combinedText);
        if (topics.length === 0) {
          console.warn(`    ⚠️  Gemini returned no topics for ${studentData.firstName}, using fallback`);
          // Simple fallback - just extract some key terms
          topics = extractBasicTopics(combinedText);
        } else {
          console.log(`    ✅ Extracted ${topics.length} topics from Gemini`);
        }
      } else {
        console.warn(`  ⚠️  OCI not configured, using basic topic extraction for ${studentData.firstName}`);
        topics = extractBasicTopics(combinedText);
      }

      // Create embedding if OCI is configured
      let embedding: number[] | null = null;
      if (isOciConfigured() && combinedText.trim()) {
        embedding = await createEmbedding(combinedText);
      }

      const student = await storage.createStudent({
        name: `${studentData.firstName} ${studentData.lastName}`,
        email: studentData.email,
        resumeObjectUrl: null,
        transcriptObjectUrl: null,
        rawResumeText: studentData.resume,
        rawTranscriptText: studentData.transcript,
        topics,
        embedding,
      });

      createdStudents.push(student);
      console.log(`  ✅ Created student: ${student.name} (${student.topics.length} topics)\n`);
    }

    // Seed postings
    console.log("📋 Creating sample postings...\n");
    const createdPostings = [];
    
    for (const postingData of SAMPLE_POSTINGS) {
      const combinedText = [
        postingData.title,
        postingData.description,
        postingData.whoTheyNeed,
      ].join(" ");

      // Extract topics using pattern matching (as per API reference)
      const topics = extractBasicTopics(combinedText);

      // Create embedding if OCI is configured
      let embedding: number[] | null = null;
      if (isOciConfigured() && combinedText.trim()) {
        embedding = await createEmbedding(combinedText);
      }

      const posting = await storage.createPosting({
        posterName: postingData.posterName,
        posterEmail: postingData.posterEmail,
        title: postingData.title,
        description: postingData.description,
        whoTheyNeed: postingData.whoTheyNeed,
        optionalPdfObjectUrl: null,
        topics,
        embedding,
      });

      createdPostings.push(posting);
      console.log(`  ✅ Created posting: ${posting.title} (${posting.topics.length} topics)`);
    }

    console.log("\n✨ Seed completed successfully!");
    console.log(`\n📊 Summary:`);
    console.log(`   - ${createdStudents.length} students created`);
    console.log(`   - ${createdPostings.length} postings created`);
    console.log(`\n💡 You can now test the matching functionality!`);

  } catch (error: any) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

// Simple topic extraction fallback (basic keyword matching)
function extractBasicTopics(text: string): string[] {
  const lower = text.toLowerCase();
  const keywords: string[] = [];
  
  // Look for common technical terms
  const techTerms = [
    "machine learning", "deep learning", "artificial intelligence",
    "python", "tensorflow", "pytorch", "neural networks",
    "data science", "statistics", "quantitative",
    "engineering", "design", "research",
    "cybersecurity", "security", "networking",
    "healthcare", "medical", "biomedical",
    "finance", "trading", "algorithmic",
    "renewable energy", "solar", "sustainability",
    "user experience", "ux", "design",
    "computer vision", "image processing",
  ];

  for (const term of techTerms) {
    if (lower.includes(term) && !keywords.includes(term)) {
      keywords.push(term);
    }
  }

  return keywords.slice(0, 15);
}

// Run seed if executed directly
seedDatabase()
  .then(() => {
    console.log("\n✅ Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });

export { seedDatabase };
