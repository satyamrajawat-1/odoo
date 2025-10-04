import Tesseract from 'tesseract.js';
import { OCRData } from '@/types';

export async function extractReceiptData(imageFile: File): Promise<OCRData> {
  try {
    const result = await Tesseract.recognize(imageFile, 'eng', {
      logger: (m) => console.log(m),
    });

    const text = result.data.text;
    
    // Extract amount (simple regex pattern for common formats)
    const amountMatch = text.match(/(?:total|amount|sum)?\s*[\$€£]?\s*(\d+[.,]\d{2})/i);
    const amount = amountMatch ? parseFloat(amountMatch[1].replace(',', '.')) : undefined;

    // Extract date (various formats)
    const dateMatch = text.match(/(\d{1,2}[-/]\d{1,2}[-/]\d{2,4}|\d{4}[-/]\d{1,2}[-/]\d{1,2})/);
    const date = dateMatch ? dateMatch[1] : undefined;

    // Extract vendor (usually first line or near top)
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    const vendor = lines[0]?.trim();

    // Extract description (try to find items)
    const description = lines.slice(1, 3).join(' ').trim();

    return {
      amount,
      date,
      vendor,
      description: description || undefined,
    };
  } catch (error) {
    console.error('OCR Error:', error);
    return {};
  }
}
