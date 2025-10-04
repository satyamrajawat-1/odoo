// Fraud Detection Utilities
// Detects duplicate receipts and potential fraud attempts

interface ExpenseData {
  amount: number;
  date: string;
  description?: string;
  receiptHash?: string;
  ocrData?: {
    vendor?: string;
    amount?: number;
    date?: string;
  };
}

// Simple hash function for images using file metadata and first bytes
export async function calculateImageHash(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    
    // Sample bytes from different parts of the file for fingerprinting
    const samples = [
      bytes.slice(0, 100),
      bytes.slice(Math.floor(bytes.length / 2), Math.floor(bytes.length / 2) + 100),
      bytes.slice(Math.max(0, bytes.length - 100)),
    ];
    
    let hash = file.size.toString(36);
    
    for (const sample of samples) {
      let sampleHash = 0;
      for (let i = 0; i < sample.length; i++) {
        sampleHash = ((sampleHash << 5) - sampleHash) + sample[i];
        sampleHash = sampleHash & sampleHash;
      }
      hash += sampleHash.toString(36);
    }
    
    return hash;
  } catch (error) {
    console.error('Error calculating image hash:', error);
    return '';
  }
}

// Check if two expenses are likely duplicates based on various criteria
export function isDuplicateExpense(
  newExpense: ExpenseData,
  existingExpense: ExpenseData,
  threshold: { amount: number; days: number } = { amount: 0.01, days: 3 }
): { isDuplicate: boolean; reason: string; confidence: number } {
  let confidence = 0;
  const reasons: string[] = [];

  // Check for exact receipt image match (strongest indicator)
  if (newExpense.receiptHash && existingExpense.receiptHash && 
      newExpense.receiptHash === existingExpense.receiptHash) {
    return {
      isDuplicate: true,
      reason: 'Identical receipt image detected',
      confidence: 100,
    };
  }

  // Check for matching amounts
  const amountDiff = Math.abs(newExpense.amount - existingExpense.amount);
  if (amountDiff <= threshold.amount) {
    confidence += 40;
    reasons.push('Same amount');
  }

  // Check for matching or very close dates
  const newDate = new Date(newExpense.date);
  const existingDate = new Date(existingExpense.date);
  const daysDiff = Math.abs((newDate.getTime() - existingDate.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysDiff === 0) {
    confidence += 30;
    reasons.push('Same date');
  } else if (daysDiff <= threshold.days) {
    confidence += 15;
    reasons.push('Similar date');
  }

  // Check OCR data similarity
  if (newExpense.ocrData && existingExpense.ocrData) {
    // Check vendor name similarity
    if (newExpense.ocrData.vendor && existingExpense.ocrData.vendor) {
      const similarity = calculateStringSimilarity(
        newExpense.ocrData.vendor.toLowerCase(),
        existingExpense.ocrData.vendor.toLowerCase()
      );
      if (similarity > 0.8) {
        confidence += 20;
        reasons.push('Same vendor');
      }
    }

    // Check OCR amount match
    if (newExpense.ocrData.amount && existingExpense.ocrData.amount) {
      const ocrAmountDiff = Math.abs(newExpense.ocrData.amount - existingExpense.ocrData.amount);
      if (ocrAmountDiff <= threshold.amount) {
        confidence += 10;
        reasons.push('Matching OCR amount');
      }
    }
  }

  // Check description similarity
  if (newExpense.description && existingExpense.description) {
    const similarity = calculateStringSimilarity(
      newExpense.description.toLowerCase(),
      existingExpense.description.toLowerCase()
    );
    if (similarity > 0.7) {
      confidence += 15;
      reasons.push('Similar description');
    }
  }

  // Consider it a duplicate if confidence is high enough
  const isDuplicate = confidence >= 70;

  return {
    isDuplicate,
    reason: isDuplicate ? reasons.join(', ') : '',
    confidence,
  };
}

// Calculate string similarity using Levenshtein distance
function calculateStringSimilarity(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  
  if (len1 === 0) return len2 === 0 ? 1 : 0;
  if (len2 === 0) return 0;
  
  const matrix: number[][] = [];
  
  for (let i = 0; i <= len2; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= len1; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= len2; i++) {
    for (let j = 1; j <= len1; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  const maxLen = Math.max(len1, len2);
  return 1 - matrix[len2][len1] / maxLen;
}

// Find all potential duplicate expenses
export function findDuplicates(
  newExpense: ExpenseData,
  existingExpenses: ExpenseData[]
): Array<{ expense: ExpenseData; match: ReturnType<typeof isDuplicateExpense> }> {
  const duplicates: Array<{ expense: ExpenseData; match: ReturnType<typeof isDuplicateExpense> }> = [];

  for (const existing of existingExpenses) {
    const match = isDuplicateExpense(newExpense, existing);
    if (match.isDuplicate || match.confidence >= 50) {
      duplicates.push({ expense: existing, match });
    }
  }

  return duplicates.sort((a, b) => b.match.confidence - a.match.confidence);
}
