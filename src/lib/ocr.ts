import Tesseract from 'tesseract.js';
import { OCRData } from '@/types';

const MAX_IMAGE_DIMENSION = 3000;

async function preprocessImage(file: File): Promise<string | File> {
  try {
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          try {
            if (img.width > MAX_IMAGE_DIMENSION || img.height > MAX_IMAGE_DIMENSION) {
              console.warn('Image too large, using original file');
              resolve(file);
              return;
            }

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              resolve(file);
              return;
            }

            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            for (let i = 0; i < data.length; i += 4) {
              const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
              const threshold = avg > 128 ? 255 : 0;
              data[i] = threshold;
              data[i + 1] = threshold;
              data[i + 2] = threshold;
            }

            ctx.putImageData(imageData, 0, 0);
            resolve(canvas.toDataURL());
          } catch (error) {
            console.warn('Preprocessing failed, using original file:', error);
            resolve(file);
          }
        };
        img.onerror = () => {
          console.warn('Image load failed, using original file');
          resolve(file);
        };
        img.src = e.target?.result as string;
      };
      reader.onerror = () => {
        console.warn('File read failed, using original file');
        resolve(file);
      };
      reader.readAsDataURL(file);
    });
  } catch (error) {
    console.warn('Preprocessing error, using original file:', error);
    return file;
  }
}

export async function extractReceiptData(imageFile: File): Promise<OCRData> {
  try {
    const processedImage = await preprocessImage(imageFile);
    
    const result = await Tesseract.recognize(processedImage, 'eng', {
      logger: (m) => console.log(m),
    } as any);

    const text = result.data.text;
    console.log('OCR Extracted Text:', text);
    
    const amountPatterns = [
      /(?:total|amount|sum|subtotal|grand\s*total)?\s*[\$€£]?\s*(\d+[.,]\d{2})/i,
      /[\$€£]\s*(\d+[.,]\d{2})/,
      /(\d+[.,]\d{2})\s*[\$€£]/,
      /total[\s:]*(\d+[.,]\d{2})/i,
    ];
    
    let amount: number | undefined;
    for (const pattern of amountPatterns) {
      const match = text.match(pattern);
      if (match) {
        amount = parseFloat(match[1].replace(',', '.'));
        break;
      }
    }

    const datePatterns = [
      /(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/,
      /(\d{4}[-/]\d{1,2}[-/]\d{1,2})/,
      /(\d{1,2}\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{2,4})/i,
    ];
    
    let date: string | undefined;
    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        date = match[1];
        break;
      }
    }

    const lines = text.split('\n').filter(line => line.trim().length > 2);
    const vendor = lines[0]?.trim();

    const descLines = lines.slice(1, 4).filter(line => {
      return !line.match(/^[\d\s.,\-\/]+$/) && line.length > 3;
    });
    const description = descLines.join(' ').trim();

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
