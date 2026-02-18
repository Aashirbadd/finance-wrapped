import * as pdfjsLib from 'pdfjs-dist';

// Configure the worker (local copy for privacy)
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

/**
 * Extracts text content from all pages of a PDF file using pdfjs-dist
 * @param file - The PDF file to extract text from
 * @returns Promise resolving to the extracted text from all pages
 */
export async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  
  const textContent: string[] = [];
  
  for (let i = 1; i <= pdfDoc.numPages; i++) {
    const page = await pdfDoc.getPage(i);
    const text = await page.getTextContent();
    const pageText = text.items
      .map((item: any) => item.str)
      .join(' ');
    textContent.push(pageText);
  }
  
  return textContent.join('\n\n');
}
