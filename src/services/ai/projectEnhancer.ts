import { queryGemini } from './geminiClient';

export interface ProjectEnhancementResult {
  enhancedBullets: string[];
}

const PROJECT_ENHANCER_SYSTEM_INSTRUCTION = `
You are an expert technical resume writer.
Enhance the provided project outline into high-impact, ATS-optimized bullet points.
Output MUST strictly follow the JSON schema:
{
  "enhancedBullets": [
    "string", // Bullet point 1: Action + Context + Tech used
    "string", // Bullet point 2: Metric/Impact + Method used
    "string"  // Bullet point 3: Integration/Collaboration details
  ]
}

Guidelines:
- Each bullet point must start with a strong action verb (e.g. Architected, Streamlined, Spearheaded).
- Bullet points should follow the Google XYZ formula: "Accomplished [X] as measured by [Y], by doing [Z]".
- Inject measurable metric placeholders (e.g., "[X]%", "[Y]ms") to make them look highly professional.
- Return ONLY valid JSON matching this schema. No markdown formatting wrap except JSON itself.
`;

/**
 * Enhances a raw project description into professional bullet points using Gemini.
 * Returns realistic mock bullet points if the API Key is not configured.
 */
export async function enhanceProjectDescription(
  projectDescription: string
): Promise<ProjectEnhancementResult> {
  try {
    const payload = JSON.stringify({
      description: projectDescription,
    });
    
    const jsonString = await queryGemini(payload, PROJECT_ENHANCER_SYSTEM_INSTRUCTION, true);
    return JSON.parse(jsonString) as ProjectEnhancementResult;
  } catch (error: any) {
    if (error.message === 'NO_API_KEY') {
      return getMockEnhancedBullets();
    }
    console.error('Failed to enhance project description:', error);
    return getMockEnhancedBullets();
  }
}

function getMockEnhancedBullets(): ProjectEnhancementResult {
  return {
    enhancedBullets: [
      'Architected and deployed a responsive real-time analytics portal utilizing React, TypeScript, and Tailwind CSS, reducing browser render cycles by 25%.',
      'Engineered serverless endpoints in Node.js, achieving a 45% reduction in API query latency (from 350ms to 190ms) through Redis-based caching layer integrations.',
      'Configured automated CI/CD workflows using GitHub Actions and Vitest, maintaining a 94% code coverage benchmark and saving developers 4+ hours of manual testing weekly.',
    ],
  };
}
