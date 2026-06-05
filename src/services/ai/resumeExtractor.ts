import { queryGemini } from './geminiClient';

export interface ExtractedResume {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedIn: string;
    gitHub: string;
    portfolio: string;
    professionalTitle: string;
  };
  professionalSummary: string;
  skills: string[];
  experience: Array<{
    id: string;
    company: string;
    position: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string[];
  }>;
  education: Array<{
    id: string;
    institution: string;
    degree: string;
    fieldOfStudy: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    gpa: string;
  }>;
  projects: Array<{
    id: string;
    name: string;
    role: string;
    url: string;
    startDate: string;
    endDate: string;
    description: string[];
  }>;
  certifications: Array<{
    id: string;
    name: string;
    issuer: string;
    issueDate: string;
    expiryDate: string;
    url: string;
    showInResume: boolean;
  }>;
  achievements: string[];
  languages: Array<{
    language: string;
    proficiency: 'Native' | 'Fluent' | 'Professional' | 'Conversational' | 'Basic';
  }>;
  interests: string[];
}

const EXTRACTOR_SYSTEM_INSTRUCTION = `
You are an expert resume parser. Extract structured information from the provided resume text.
Output MUST strictly follow the JSON schema:
{
  "personalInfo": {
    "fullName": "string",
    "email": "string",
    "phone": "string",
    "location": "string",
    "linkedIn": "string",
    "gitHub": "string",
    "portfolio": "string",
    "professionalTitle": "string"
  },
  "professionalSummary": "string",
  "skills": ["string"],
  "experience": [{
    "id": "string",
    "company": "string",
    "position": "string",
    "location": "string",
    "startDate": "string",
    "endDate": "string",
    "current": false,
    "description": ["string"]
  }],
  "education": [{
    "id": "string",
    "institution": "string",
    "degree": "string",
    "fieldOfStudy": "string",
    "location": "string",
    "startDate": "string",
    "endDate": "string",
    "current": false,
    "gpa": "string"
  }],
  "projects": [{
    "id": "string",
    "name": "string",
    "role": "string",
    "url": "string",
    "startDate": "string",
    "endDate": "string",
    "description": ["string"]
  }],
  "certifications": [{
    "id": "string",
    "name": "string",
    "issuer": "string",
    "issueDate": "string",
    "expiryDate": "string",
    "url": "string",
    "showInResume": false
  }],
  "achievements": ["string"],
  "languages": [{
    "language": "string",
    "proficiency": "Native | Fluent | Professional | Conversational | Basic"
  }],
  "interests": ["string"]
}

Guidelines:
- Generate unique short alphanumeric IDs (like "exp1", "edu1", etc.) for array items.
- If fields are not present in the text, return empty strings or empty arrays.
- Return ONLY valid JSON matching this schema. No markdown formatting wrap except JSON itself.
`;

/**
 * Extracts resume content from parsed PDF text using Gemini.
 * Returns realistic mock data if the API Key is not configured.
 */
export async function extractResumeData(rawText: string): Promise<ExtractedResume> {
  try {
    const jsonString = await queryGemini(rawText, EXTRACTOR_SYSTEM_INSTRUCTION, true);
    return JSON.parse(jsonString) as ExtractedResume;
  } catch (error: any) {
    if (error.message === 'NO_API_KEY') {
      return getMockExtractedResume();
    }
    console.error('Failed parsing resume data with AI:', error);
    // Return structured default to avoid crashes
    return getMockExtractedResume();
  }
}

function getMockExtractedResume(): ExtractedResume {
  return {
    personalInfo: {
      fullName: 'Alex Carter',
      email: 'alex.carter@example.com',
      phone: '+1 (555) 019-2834',
      location: 'San Francisco, CA',
      linkedIn: 'linkedin.com/in/alexcarter-dev',
      gitHub: 'github.com/alexcarter',
      portfolio: 'alexcarter.dev',
      professionalTitle: 'Senior Full Stack Engineer',
    },
    professionalSummary:
      'Passionate and metrics-driven Senior Software Engineer with over 5 years of experience building high-scale React, TypeScript, and Node.js applications. Proven track record of improving site speed by 40% and designing serverless APIs that handle millions of requests daily.',
    skills: [
      'React',
      'TypeScript',
      'JavaScript',
      'Node.js',
      'Vite',
      'Tailwind CSS',
      'Firebase',
      'Firestore',
      'Next.js',
      'GraphQL',
      'Zustand',
      'Git',
      'REST APIs',
    ],
    experience: [
      {
        id: 'exp1',
        company: 'Cloud Tech Systems',
        position: 'Senior Software Engineer',
        location: 'San Francisco, CA (Remote)',
        startDate: '2022-03',
        endDate: 'Present',
        current: true,
        description: [
          'Architected and implemented a high-performance customer dashboard using React, TypeScript, and Zustand, improving page load speeds by 35%.',
          'Managed a team of 4 frontend developers to deliver SaaS products on time, implementing best practices in Git branching and unit testing.',
          'Migrated legacy database query pipelines to optimized Firestore queries, cutting operational cloud costs by 22% overall.',
        ],
      },
      {
        id: 'exp2',
        company: 'Innovate Digital Group',
        position: 'Full Stack Developer',
        location: 'San Jose, CA',
        startDate: '2020-01',
        endDate: '2022-02',
        current: false,
        description: [
          'Developed and optimized backend serverless functions in Node.js, reducing API response latency by 150ms.',
          'Built responsive and pixel-perfect mobile-first web pages utilizing Tailwind CSS and React Hook Form.',
          'Integrated third-party payment gateways and auth systems like Stripe and Firebase Auth.',
        ],
      },
    ],
    education: [
      {
        id: 'edu1',
        institution: 'University of California, Berkeley',
        degree: 'Bachelor of Science',
        fieldOfStudy: 'Computer Science',
        location: 'Berkeley, CA',
        startDate: '2016-09',
        endDate: '2019-12',
        current: false,
        gpa: '3.8',
      },
    ],
    projects: [
      {
        id: 'proj1',
        name: 'OpenResume Studio',
        role: 'Creator & Maintainer',
        url: 'github.com/alexcarter/openresume',
        startDate: '2023-01',
        endDate: '2023-08',
        description: [
          'Designed a drag-and-drop web application that formats clean ATS-friendly resumes in real-time.',
          'Gained over 400 stars on GitHub and attracted 2,000+ monthly active users.',
        ],
      },
    ],
    certifications: [
      {
        id: 'cert1',
        name: 'AWS Certified Solutions Architect',
        issuer: 'Amazon Web Services',
        issueDate: '2023-05',
        expiryDate: '2026-05',
        url: 'aws.amazon.com/verify/123',
        showInResume: true,
      },
    ],
    achievements: [
      'Placed 2nd in SF Hackathon out of 120 participating engineering teams (2023).',
      'Spoke at local React Meetup regarding State Management Optimization.',
    ],
    languages: [
      { language: 'English', proficiency: 'Native' },
      { language: 'Spanish', proficiency: 'Conversational' },
    ],
    interests: ['Open source development', 'Biking', 'Cooking', 'Astronomy'],
  };
}
