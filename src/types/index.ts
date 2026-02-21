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
  
  /** Optional: Group ID for recurring transactions - all transactions in a series share the same ID */
  recurringGroupId?: string;
}

export type Ledger = Transaction[];

export type SummationMode = 'yearly' | 'monthly' | 'total';

export const DATA_MODE = {
  DEMO: 'demo',
  USER: 'user',
  CLEAR: 'clear',
} as const;

export type DataModeKey = keyof typeof DATA_MODE;

export type DataMode = typeof DATA_MODE[keyof typeof DATA_MODE];

export const LOCAL_STORAGE_KEYS = {
  DATA_MODE: 'dataMode',
  LEDGER: 'ledger',
  SHOW_HELP_ON_STARTUP: 'showHelpOnStartup',
} as const;

export type LocalStorageKey = typeof LOCAL_STORAGE_KEYS[keyof typeof LOCAL_STORAGE_KEYS];

export type RecurringFrequency = 'weekly' | 'bi-weekly' | 'monthly';

export interface RecurringConfig {
  frequency: RecurringFrequency;
  periods: number; // Number of periods to generate
}
