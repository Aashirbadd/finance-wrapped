import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import type { Transaction } from '../types';

// Extend plugin once at the top level
dayjs.extend(customParseFormat);

const formats = [
  'YYYY-MM-DD',
  'MM/DD/YYYY',
  'DD-MM-YYYY',
  'YYYY/MM/DD',
  'MM-DD-YYYY',
  'DD/MM/YYYY',
  'YYMMDD',
  'YYYYMMDD'
];

/**
 * Removes quotes, invisible BOM characters, and extra whitespace
 */
function cleanCell(val: string | undefined): string {
  if (!val) return '';
  // Removes: double quotes, single quotes, and the Byte Order Mark (\uFEFF)
  return val.replace(/["'\uFEFF]/g, '').trim();
}

function detectDelimiter(line: string): string {
  return line.includes(',') ? ',' : '\t';
}

function isHeaderLine(line: string): boolean {
  const headerKeywords = ['date', 'description', 'withdrawal', 'debit', 'credit', 'deposit', 'balance'];
  const lowerLine = line.toLowerCase();
  return headerKeywords.some(keyword => lowerLine.includes(keyword));
}

export function parseCSV(content: string): Transaction[] {
  // Split by newline, handling both Windows (\r\n) and Unix (\n)
  const lines = content.split(/\r?\n/).filter(line => line.trim() !== '');
  if (lines.length === 0) return [];

  const transactions: Transaction[] = [];
  const delimiter = detectDelimiter(lines[0]);

  let startIndex = 0;
  if (isHeaderLine(lines[0])) {
    startIndex = 1;
  }

  for (let i = startIndex; i < lines.length; i++) {
    const columns = lines[i].split(delimiter);

    // 1. Clean data immediately to remove the "Quote Trap"
    const dateStr = cleanCell(columns[0]);
    const description = cleanCell(columns[1]);
    const debit = cleanCell(columns[2]);
    const credit = cleanCell(columns[3]);

    if (!dateStr || !description) continue;

    // 2. Multi-stage Date Parsing
    // First: Try strict array matching
    let parsedDate = dayjs(dateStr, formats, true);

    // Second: Fallback to native parsing (this is where YYYY-MM-DD usually wins)
    if (!parsedDate.isValid()) {
      parsedDate = dayjs(dateStr);
    }

    if (!parsedDate.isValid()) {
      console.warn(`Row ${i + 1}: Invalid date ignored ->`, dateStr);
      continue;
    }

    const formattedDate = parsedDate.format('YYYY-MM-DD');

    // 3. Amount Logic (Clean currency symbols and commas)
    const cleanNum = (s: string) => parseFloat(s.replace(/[$,\s]/g, ''));
    
    let amount = 0;
    const debitVal = cleanNum(debit);
    const creditVal = cleanNum(credit);

    if (!isNaN(debitVal) && debit !== '') {
      amount = -Math.abs(debitVal);
    } else if (!isNaN(creditVal) && credit !== '') {
      amount = Math.abs(creditVal);
    }

    if (amount === 0 || isNaN(amount)) continue;

    transactions.push({
      id: generateId(),
      date: formattedDate,
      description,
      amount,
      source: 'csv-import',
    });
  }

  return transactions;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}