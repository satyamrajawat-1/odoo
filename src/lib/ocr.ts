import { OCRData } from '@/types';

async function convertFileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function extractReceiptData(imageFile: File): Promise<OCRData> {
  try {
    const base64Image = await convertFileToBase64(imageFile);
    
    const response = await fetch('https://ydeuxgctyndynxdbxnhn.supabase.co/functions/v1/process-receipt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        image: base64Image
      })
    });

    if (!response.ok) {
      throw new Error(`OCR API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('OCR API Response:', data);
    
    return {
      amount: data.amount ? parseFloat(data.amount) : undefined,
      date: data.date || undefined,
      vendor: data.merchant || undefined,
      description: data.description || undefined,
    };
  } catch (error) {
    console.error('OCR Error:', error);
    return {};
  }
}
