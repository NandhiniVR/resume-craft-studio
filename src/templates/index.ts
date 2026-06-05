import { ProfessionalPDF, ProfessionalPreview } from './ProfessionalATS';
import { ModernPDF, ModernPreview } from './ModernATS';
import { MinimalPDF, MinimalPreview } from './MinimalATS';
import { ExecutivePDF, ExecutivePreview } from './ExecutiveATS';
import { ResumeData, TemplateProps } from './types';

export * from './types';

export interface TemplateDefinition {
  name: string;
  description: string;
  Preview: React.FC<TemplateProps>;
  PDF: React.FC<TemplateProps>;
}

export const TEMPLATES: Record<ResumeData['template'], TemplateDefinition> = {
  professional: {
    name: 'Professional ATS',
    description: 'Clean, traditional, single-column design. Perfect for conservative industries.',
    Preview: ProfessionalPreview,
    PDF: ProfessionalPDF,
  },
  modern: {
    name: 'Modern ATS',
    description: 'Sleek geometric spacing and Indigo highlights. Best for tech and startups.',
    Preview: ModernPreview,
    PDF: ModernPDF,
  },
  minimal: {
    name: 'Minimal ATS',
    description: 'Elegant sans-serif headers, tight margins, and clean line layouts.',
    Preview: MinimalPreview,
    PDF: MinimalPDF,
  },
  executive: {
    name: 'Executive ATS',
    description: 'Classic serif typography, dual-lined headers, optimized for leadership metrics.',
    Preview: ExecutivePreview,
    PDF: ExecutivePDF,
  },
};
