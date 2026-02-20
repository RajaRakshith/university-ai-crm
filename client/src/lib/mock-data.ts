export const MOCK_EVENTS = [
  { id: "1", name: "AI in Finance Panel", date: "Oct 12, 2024", capacity: 150, signups: 142, category: ["Finance", "AI"], description: "Join industry experts to discuss how Artificial Intelligence is reshaping the financial sector. Networking session to follow.", url: "https://finance-ai-panel.example.com", signupForm: "https://forms.example.com/ai-finance" },
  { id: "2", name: "Startup Career Fair", date: "Oct 20, 2024", capacity: 500, signups: 320, category: ["Entrepreneurship", "Careers"], description: "Connect with over 50 fast-growing startups looking for top talent across engineering, design, and business roles.", url: "https://startup-fair.example.com", signupForm: null },
  { id: "3", name: "Sustainable Consulting Case Comp", date: "Nov 5, 2024", capacity: 80, signups: 65, category: ["Consulting", "Sustainability"], description: "Work in teams to solve a real-world sustainability challenge for a major global corporation. Cash prizes for the winning teams.", url: "https://sustain-case-comp.example.com", signupForm: "https://forms.example.com/case-comp" },
];

export const MOCK_STUDENTS = [
  { id: "1", name: "Sarah Chen", program: "MBA", year: "2025", interests: [{ tag: "AI/ML", score: 95 }, { tag: "Fintech", score: 82 }], matchScore: 92, reason: "President of AI Club, took Machine Learning for Business" },
  { id: "2", name: "David Kim", program: "Undergrad", year: "2026", interests: [{ tag: "Consulting", score: 88 }, { tag: "Finance", score: 75 }], matchScore: 85, reason: "Consulting Group Member, high GPA in Finance courses" },
  { id: "3", name: "Elena Rodriguez", program: "MBA", year: "2025", interests: [{ tag: "Entrepreneurship", score: 98 }, { tag: "Sustainability", score: 80 }], matchScore: 78, reason: "Founder of campus startup, attended 3 previous sustainability events" },
  { id: "4", name: "Marcus Johnson", program: "Masters", year: "2024", interests: [{ tag: "AI/ML", score: 91 }, { tag: "Healthcare", score: 89 }], matchScore: 94, reason: "Resume mentions NLP in Healthcare context" },
  { id: "5", name: "Priya Patel", program: "Undergrad", year: "2025", interests: [{ tag: "Fintech", score: 90 }, { tag: "Consulting", score: 70 }], matchScore: 88, reason: "Interned at Stripe, active in Investment Club" },
];

export const INTEREST_TAGS = [
  "AI/ML", "Consulting", "Entrepreneurship", "Fintech", "Healthcare", "Sustainability", "Venture Capital", "Product Management", "Design"
];
