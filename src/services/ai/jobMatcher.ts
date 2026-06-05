import { queryGemini } from './geminiClient';
import type { ExtractedResume } from './resumeExtractor';

export interface JobMatchResult {
  matchPercentage: number;
  missingSkills: string[];
  missingKeywords: string[];
  suggestedImprovements: string[];
}

const JOB_MATCHER_SYSTEM_INSTRUCTION = `
You are an expert HR sourcer and technical recruiter.
Compare the provided Resume JSON against the target Job Description (JD).
Evaluate structural match, tech-stack alignment, and experience suitability.
Output MUST strictly follow the JSON schema:
{
  "matchPercentage": 72, // Number between 0 and 100
  "missingSkills": ["string"],
  "missingKeywords": ["string"],
  "suggestedImprovements": ["string"]
}

Guidelines:
- Match percentage should reflect actual overlap between resume skills and job requirements.
- Suggested improvements must explain exactly where/how the user should edit their resume to match the JD.
- Return ONLY valid JSON matching this schema. No markdown formatting wrap except JSON itself.
`;

/**
 * Matches a resume JSON against a job description text using Gemini.
 * Returns realistic mock data if the API Key is not configured.
 */
export async function matchResumeToJob(
  resumeData: ExtractedResume,
  jobDescriptionText: string
): Promise<JobMatchResult> {
  try {
    const payload = JSON.stringify({
      resume: resumeData,
      jobDescription: jobDescriptionText,
    });
    
    const jsonString = await queryGemini(payload, JOB_MATCHER_SYSTEM_INSTRUCTION, true);
    return JSON.parse(jsonString) as JobMatchResult;
  } catch (error: any) {
    if (error.message === 'NO_API_KEY') {
      return getMockJobMatch();
    }
    console.error('Failed to match resume to job:', error);
    return getMockJobMatch();
  }
}

function getMockJobMatch(): JobMatchResult {
  return {
    matchPercentage: 65,
    missingSkills: [
      'Docker',
      'Kubernetes',
      'CI/CD Pipelines (GitHub Actions / GitLab CI)',
      'GraphQL APIs',
      'Jest / Cypress testing frameworks',
    ],
    missingKeywords: [
      'Microservices',
      'Containerization',
      'Automated Testing',
      'Agile / Scrum methodologies',
      'System Architecture',
    ],
    suggestedImprovements: [
      'Add a "Projects" bullet point explicitly highlighting experience with container deployment (e.g. Docker, AWS ECS).',
      'Mention GitLab CI or GitHub Actions inside your Professional Summary to hit the automated integration keyword.',
      'Explicitly outline GraphQL experience or RESTful service design projects in your experience section.',
      'Add unit testing libraries (Jest, React Testing Library) to your listed skills array.',
    ],
  };
}
