import React from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { TEMPLATES } from '@/templates';
import { ResumeData } from '@/templates/types';
import { Button } from './ui/Button';
import { Download, Loader2 } from 'lucide-react';

interface ResumePDFViewProps {
  data: ResumeData;
  fileName?: string;
  className?: string;
}

/**
 * Renders the export panel with PDFDownloadLink.
 * Selects the target template document model dynamically.
 */
export const ResumePDFView: React.FC<ResumePDFViewProps> = ({
  data,
  fileName = 'Resume.pdf',
  className,
}) => {
  const selectedTemplate = TEMPLATES[data.template] || TEMPLATES.professional;
  const PDFComponent = selectedTemplate.PDF;

  return (
    <div className={className}>
      <PDFDownloadLink
        document={<PDFComponent data={data} />}
        fileName={fileName}
      >
        {((params: any) => {
          const { loading, error } = params;
          if (error) {
            console.error('PDF document compile error:', error);
          }
          return (
            <Button
              variant="default"
              className="w-full flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/10"
              loading={loading}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Download PDF
                </>
              )}
            </Button>
          );
        }) as any}
      </PDFDownloadLink>
    </div>
  );
};
export default ResumePDFView;
