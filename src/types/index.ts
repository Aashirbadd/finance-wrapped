export interface Transaction {
  /** Unique identifier (UUID or Hash) */
  id: string;
  
  /** Transaction date in YYYY-MM-DD format */
  date: string;
  
  /** Name of the merchant or sender (e.g., "Starbucks") */
  description: string;
  
  /** Monetary value (Negative for expenses, Positive for income) */
  amount: number;
  
  /** Optional: Classification (e.g., "Food", "Bills") */
  category?: string;
  
  /** Optional: 3-letter currency code (e.g., "USD") */
  currency?: string;
  
  /** Optional: Origin file name (e.g., "bank_statement_jan.pdf") */
  source?: string;
}

export type Ledger = Transaction[];

export type SummationMode = 'yearly' | 'monthly' | 'total';

export type RecurringFrequency = 'weekly' | 'bi-weekly' | 'monthly';

export interface RecurringConfig {
  frequency: RecurringFrequency;
  periods: number; // Number of periods to generate
}
