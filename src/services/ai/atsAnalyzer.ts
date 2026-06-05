import { queryGemini } from './geminiClient';
import type { ResumeData } from '../../templates/types';

export interface AtsAnalysisResult {
  analysisMode: 'resume-only' | 'ats-compare';
  atsComparisonAvailable: boolean;
  score: number;
  strengths: string[];
  weaknesses: string[];
  missingKeywords: string[];
  formattingIssues: string[];
  atsRisks: string[];
  recommendations: string[];
  evidence: {
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
  };
}

const ATS_ANALYSIS_SYSTEM_INSTRUCTION = `
You are an expert Applicant Tracking System (ATS) auditor and career counselor.
Analyze the candidate's resume content and, if provided, the job description.

IMPORTANT:
- You MUST analyze only the information provided.
- Never assume technologies, skills, certifications, experience, dates, projects, keywords, or achievements.
- Return ONLY evidence-based findings.
- Every recommendation must reference resume content and have explicit evidence.
  * Good recommendation example: "Your resume mentions machine learning projects but does not list any ML frameworks. Consider adding frameworks only if you have experience with them."
  * Bad recommendation example: "Add TensorFlow skills."

CRITICAL DATE VALIDATION:
- Detect and check for future employment dates, invalid date ranges, or cases where the end date is before the start date.
- Only flag date issues actually present. Do not fabricate or invent date problems.

CRITICAL SECTION VALIDATION:
- Check for missing contact information, missing LinkedIn, missing GitHub, missing projects, missing experience descriptions, or missing measurable achievements.
- Only flag these if they are actually missing from the resume.

CRITICAL ATS FORMAT ANALYSIS:
- Analyze the layout structure of the template.
- Identify issues like tables, complex multi-column layouts, graphics, icons, text readability, non-standard section naming, and general parseability risks.
- Do not generate generic ATS advice. Base this strictly on the template layout structure and JSON sections provided.

CRITICAL KEYWORD MATCHING AND JOB DESCRIPTION COMPARISON ALGORITHM:
1. If NO job description is provided:
   - Set analysisMode to "resume-only" and atsComparisonAvailable to false.
   - DO NOT perform keyword-gap analysis. DO NOT compare against any job description.
   - DO NOT generate: Missing Keywords, ATS Match Percentage, JD Comparison, or Keyword Gap Analysis.
   - Set missingKeywords to an empty array [].
   - Provide only: Resume strengths, Resume weaknesses, Formatting issues, ATS formatting risks, Section completeness review, and Writing quality review.
   
2. If a Job Description is provided:
   - Set analysisMode to "ats-compare" and atsComparisonAvailable to true.
   - Extract keywords from the Job Description.
   - Extract keywords from the Resume.
   - Compare them: Missing Keywords = keywords in Job Description NOT found in the Resume.
   - Never invent or hallucinate keywords. Never add technologies (such as TensorFlow, Docker, AWS, PyTorch, GCP, etc.) as missing keywords unless they are explicitly present in the Job Description.

EVIDENCE INTEGRATION RULE:
- Each element in the "evidence.strengths" list must correspond directly to the same index in the "strengths" list, proving it with specific references to the resume's text.
- Each element in the "evidence.weaknesses" list must correspond directly to the same index in the "weaknesses" list.
- Each element in the "evidence.recommendations" list must correspond directly to the same index in the "recommendations" list.

Output MUST strictly follow this JSON schema:
{
  "analysisMode": "resume-only" | "ats-compare",
  "atsComparisonAvailable": boolean,
  "score": number, // Overall rating out of 100 (a match score if comparing to JD, or a general quality score if resume-only)
  "strengths": ["string"],
  "weaknesses": ["string"],
  "missingKeywords": ["string"],
  "formattingIssues": ["string"],
  "atsRisks": ["string"],
  "recommendations": ["string"],
  "evidence": {
    "strengths": ["string"],
    "weaknesses": ["string"],
    "recommendations": ["string"]
  }
}

Return ONLY valid JSON matching this schema. No markdown formatting wrap except JSON itself.
`;

/**
 * Analyzes resume content against ATS compliance criteria using Gemini.
 */
export async function analyzeResumeAts(
  resumeData: ResumeData | string,
  jobDescription?: string
): Promise<AtsAnalysisResult> {
  const hasJd = !!jobDescription?.trim();
  
  let resumeStr: string;
  if (typeof resumeData === 'string') {
    resumeStr = `Resume Text Content:\n${resumeData}`;
  } else {
    resumeStr = `Resume JSON:\n${JSON.stringify(resumeData, null, 2)}\nTemplate Style Used: ${resumeData.template || 'professional'}`;
  }

  // Log resume text length for validation check
  console.log("Resume text length:", resumeStr.length);

  const prompt = `
Resume Content:
${resumeStr}

Job Description:
${hasJd ? jobDescription : 'No Job Description Provided.'}
  `;

  console.log("Gemini request sent");
  const jsonString = await queryGemini(prompt, ATS_ANALYSIS_SYSTEM_INSTRUCTION, true);
  console.log("Gemini response received");
  
  if (!jsonString) {
    throw new Error("No Gemini analysis available. Do not use fallback analysis.");
  }
  
  const result = JSON.parse(jsonString) as AtsAnalysisResult;
  console.log("Parsed ATS analysis", result);

  // Strict output validation
  if (!result || typeof result !== 'object') {
    throw new Error("Invalid response received from Gemini API. Do not use fallback analysis.");
  }
  
  if (
    !Array.isArray(result.strengths) || 
    !Array.isArray(result.weaknesses) || 
    !Array.isArray(result.recommendations)
  ) {
    throw new Error(
      "Gemini response is missing required fields (strengths, weaknesses, or recommendations). Do not use fallback analysis."
    );
  }

  return result;
}
