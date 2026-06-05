export interface ResumePersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedIn: string;
  gitHub: string;
  portfolio: string;
  professionalTitle: string;
}

export interface ResumeExperience {
  id: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string[];
}

export interface ResumeEducation {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  gpa: string;
}

export interface ResumeProject {
  id: string;
  name: string;
  role: string;
  url: string;
  startDate: string;
  endDate: string;
  description: string[];
}

export interface ResumeCertification {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate: string;
  url: string;
  showInResume: boolean;
}

export interface ResumeLanguage {
  language: string;
  proficiency: 'Native' | 'Fluent' | 'Professional' | 'Conversational' | 'Basic';
}

export interface ResumeData {
  title: string;
  template: 'professional' | 'modern' | 'minimal' | 'executive';
  personalInfo: ResumePersonalInfo;
  professionalSummary: string;
  skills: string[];
  experience: ResumeExperience[];
  education: ResumeEducation[];
  projects: ResumeProject[];
  certifications: ResumeCertification[];
  achievements: string[];
  languages: ResumeLanguage[];
  interests: string[];
  sectionOrder: string[];
}

export interface TemplateProps {
  data: ResumeData;
}
