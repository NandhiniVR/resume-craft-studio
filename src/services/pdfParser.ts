import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

console.log('PDFJS VERSION =', pdfjsLib.version);
console.log('PDFJS WORKER =', pdfWorker);

/**
 * Extracts raw textual data from an uploaded PDF file on the client side.
 * Supports resumes, job descriptions, and letters.
 * 
 * @param file The PDF File object
 * @returns The normalized text content as a promise
 */
export async function extractTextFromPdf(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    let textBuilder = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      
      textBuilder += pageText + '\n';
    }
    console.log('EXTRACTED TEXT LENGTH =', textBuilder.length);
    console.log('FIRST 500 CHARS =', textBuilder.slice(0, 500));

return textBuilder.trim();
    return textBuilder.trim();
  } catch (error) {
    console.error('PDF parsing failed:', error);
    throw new Error('Could not parse the PDF file. Please ensure it is a valid document.');
  }
}
