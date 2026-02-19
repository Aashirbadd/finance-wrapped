import dayjs from 'dayjs';
import type { Transaction } from '../types';

/**
 * Detects the delimiter used in a CSV file (comma or tab)
 */
function detectDelimiter(line: string): string {
  return line.includes(',') ? ',' : '\t';
}

/**
 * Checks if a line appears to be a header row
 */
function isHeaderLine(line: string): boolean {
  const headerKeywords = [
    'date', 
    'description', 
    'withdrawal', 
    'withdrawals',
    'debit', 
    'debits',
    'credit', 
    'credits',
    'deposit', 
    'deposits', 
    'balance', 
    'transaction'
  ];
  const lowerLine = line.toLowerCase();
  return headerKeywords.some(keyword => lowerLine.includes(keyword));
}

/**
 * Parses CSV content from a bank statement into Transaction objects
 * Expected format: Date | Transaction Description | Debit/Credit | Deposits | Balance
 * @param content - Raw CSV content as a string
 * @returns Array of parsed Transaction objects
 */
export function parseCSV(content: string): Transaction[] {
  const lines = content.trim().split('\n');
  if (lines.length === 0) return [];
  
  const transactions: Transaction[] = [];
  
  // Detect delimiter from first line
  const delimiter = detectDelimiter(lines[0]);

  // Find the first data row (skip header if present)
  let startIndex = 0;
  if (lines.length > 0 && isHeaderLine(lines[0])) {
    startIndex = 1;
  }

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    try {
      // Split by detected delimiter
      const columns = line.split(delimiter);

      // Expected columns based on your format:
      // 0: Date (01/21/2026)
      // 1: Transaction Description
      // 2: Debit/Withdrawals (can be empty)
      // 3: Credit/Deposits (can be empty)
      // 4: Balance

      const dateStr = columns[0]?.trim();
      const description = columns[1]?.trim() || '';
      const debit = columns[2]?.trim();
      const credit = columns[3]?.trim();

      // Skip if no date or description
      if (!dateStr || !description) continue;

      // Parse date using dayjs (auto-detects format)
      const date = dayjs(dateStr).format('YYYY-MM-DD');
      
      // Skip if invalid date
      if (date === 'Invalid Date') continue;

      // Determine amount (negative for debits/withdrawals, positive for credits/deposits)
      let amount = 0;
      if (debit && debit !== '') {
        amount = -Math.abs(parseFloat(debit));
      } else if (credit && credit !== '') {
        amount = Math.abs(parseFloat(credit));
      }

      // Skip if no valid amount
      if (amount === 0 || isNaN(amount)) continue;

      const transaction: Transaction = {
        id: generateId(),
        date,
        description,
        amount,
        source: 'csv-import',
      };

      transactions.push(transaction);
    } catch (error) {
      // Skip malformed lines and continue
      console.warn(`Skipping line ${i + 1}:`, error);
      continue;
    }
  }

  return transactions;
}

/**
 * Generates a simple unique ID
 */
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
