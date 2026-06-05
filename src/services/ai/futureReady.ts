/**
 * Future-Ready AI Service Architecture.
 * Pre-defines schemas, prompt templates, and types for planned features:
 * 1. Interview Question Generator
 * 2. Mock Interview Assistant
 * 3. Resume Rewriter
 * 4. Cover Letter Generator
 */

// ==========================================
// 1. Interview Question Generator
// ==========================================
export interface GeneratedQuestion {
  question: string;
  type: 'Technical' | 'Behavioral' | 'System Design' | 'General';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  expectedAnswerPoints: string[];
  suggestedAnswerTemplate: string;
}

export interface QuestionGeneratorRequest {
  jobTitle: string;
  jobDescription: string;
  userResumeText?: string;
  count?: number;
}

export const INTERVIEW_QUESTION_PROMPT = (req: QuestionGeneratorRequest) => `
You are a lead technical interviewer for a ${req.jobTitle} position.
Generate ${req.count || 5} realistic interview questions targeting this Job Description:
"${req.jobDescription}"
${req.userResumeText ? `Cross-reference with the applicant's resume: "${req.userResumeText}" to tailor questions.` : ''}

Output JSON following GeneratedQuestion[] shape.
`;

// ==========================================
// 2. Mock Interview Assistant
// ==========================================
export interface MockInterviewTurn {
  role: 'interviewer' | 'candidate';
  text: string;
  timestamp: string;
}

export interface MockInterviewAssessment {
  overallScore: number; // 0 - 100
  communicationScore: number; // 0 - 100
  technicalScore: number; // 0 - 100
  keyStrengths: string[];
  grammarAndToneFixes: string[];
  suggestedRephrasings: Array<{
    originalText: string;
    enhancedText: string;
    rationale: string;
  }>;
}

export const MOCK_INTERVIEW_SYSTEM_INSTRUCTION = `
You are an active mock interviewer. Talk as a friendly but rigorous tech manager.
Assess each turn of communication, keep history, and generate the next natural follow-up question.
`;

// ==========================================
// 3. Resume Rewriter
// ==========================================
export interface RewriteSectionRequest {
  sectionType: 'summary' | 'experience' | 'project' | 'skills';
  originalText: string;
  toneStyle: 'Active/Metric-focused' | 'Executive/Strategic' | 'Academic/Research' | 'Concise/Short';
  targetRole?: string;
}

export interface RewriteSectionResponse {
  rewrittenText: string;
  keywordsInjected: string[];
  majorImprovementsMade: string[];
}

// ==========================================
// 4. Cover Letter Generator
// ==========================================
export interface CoverLetterGenerateRequest {
  jobTitle: string;
  companyName: string;
  jobDescription: string;
  userResumeJson: any;
  tone: 'Professional' | 'Enthusiastic' | 'Creative' | 'Short';
}

export interface CoverLetterGenerateResponse {
  title: string;
  salutation: string;
  bodyParagraphs: string[];
  signOff: string;
}
