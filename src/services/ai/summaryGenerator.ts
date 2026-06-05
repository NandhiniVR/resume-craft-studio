import { queryGemini } from './geminiClient';

export interface SummaryGenerationResult {
  summaries: string[];
}

const SUMMARY_GENERATOR_SYSTEM_INSTRUCTION = `
You are a professional executive resume writer and career coach.
Generate 3 distinct, high-impact, ATS-optimized professional summaries based on the provided skills, experience years, and target role.
Summaries should represent different styles:
1. Executive / Leadership focused
2. Technical / Implementation focused
3. Action & Results oriented

Output MUST strictly follow the JSON schema:
{
  "summaries": [
    "string", // Style 1: Executive/Leadership
    "string", // Style 2: Technical/Implementation
    "string"  // Style 3: Action & Results oriented
  ]
}

Guidelines:
- Each summary should be 3-4 lines (approx. 50-80 words).
- Use professional keywords, strong action verbs, and metric placeholders like [X]%.
- Return ONLY valid JSON matching this schema. No markdown formatting wrap except JSON itself.
`;

/**
 * Generates professional summaries using Gemini.
 * Returns realistic mock options if the API Key is not configured.
 */
export async function generateSummaries(
  skills: string[],
  experienceYears: number,
  targetRole: string
): Promise<SummaryGenerationResult> {
  try {
    const payload = JSON.stringify({
      skills,
      experienceYears,
      targetRole,
    });
    
    const jsonString = await queryGemini(payload, SUMMARY_GENERATOR_SYSTEM_INSTRUCTION, true);
    return JSON.parse(jsonString) as SummaryGenerationResult;
  } catch (error: any) {
    if (error.message === 'NO_API_KEY') {
      return getMockSummaries(targetRole, experienceYears);
    }
    console.error('Failed to generate summaries:', error);
    return getMockSummaries(targetRole, experienceYears);
  }
}

function getMockSummaries(role: string, years: number): SummaryGenerationResult {
  const roleName = role || 'Senior Software Engineer';
  const yearsText = years || 5;

  return {
    summaries: [
      `Results-oriented ${roleName} with over ${yearsText} years of experience leading cross-functional teams to build high-scale, enterprise applications. Adept at driving project lifecycles from architectural design to deployment, while collaborating with stakeholders to deliver innovative features. Proven track record of improving operational efficiency by 25% and mentoring junior engineers to achieve peak velocity.`,
      `Detail-focused ${roleName} with ${yearsText}+ years of hands-on expertise in design patterns, cloud infrastructures, and high-performance frontend solutions. Specialized in utilizing React, TypeScript, and optimized backend configurations to build secure, scalable APIs and user interfaces. Skilled in implementing automated tests and CI/CD pipelines to guarantee code reliability and minimize bug rates.`,
      `High-performing ${roleName} with ${yearsText} years of experience accelerating application deliveries and engineering robust SaaS architectures. Demonstrated success in optimizing page load performance by 40% and designing serverless backend pipelines that cut hosting overhead costs by 30%. Passionate about refactoring code bases for maximum maintainability and leading agile sprints to meet strict deadlines.`,
    ],
  };
}
