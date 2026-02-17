import React, { useState, useEffect } from 'react'
import type { Transaction, Ledger } from '../types'
import { DUMMY_LEDGER } from './Sidebar/dummyData'

interface SidebarProps {
  currentWidth: number;
  onResize: (newWidth: number) => void;
}

// Helper to generate a simple unique ID
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export default function Sidebar({ currentWidth, onResize }: SidebarProps) {
  // Load from localStorage or use dummy data for testing
  const [ledger, setLedger] = useState<Ledger>(() => {
    const saved = localStorage.getItem('ledger');
    if (saved) {
      return JSON.parse(saved);
    }
    // Use dummy data if no saved data exists
    return DUMMY_LEDGER;
  });
  const [newDate, setNewDate] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newAmount, setNewAmount] = useState('');

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    
    const startX = e.clientX;
    const startWidth = currentWidth;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const diff = moveEvent.clientX - startX;
      // Convert pixel difference to percentage based on current viewport width
      const percentageDiff = (diff / window.innerWidth) * 100;
      const newWidth = Math.max(30, Math.min(60, startWidth + percentageDiff));
      onResize(newWidth);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleAddTransaction = () => {
    if (!newDate || !newDescription || !newAmount) {
      return; // Basic validation - require all fields
    }

    const newTransaction: Transaction = {
      id: generateId(),
      date: newDate,
      description: newDescription,
      amount: parseFloat(newAmount),
    };

    // Add new transaction to the list (will be sorted by date)
    setLedger([...ledger, newTransaction]);

    // Clear form fields
    setNewDate('');
    setNewDescription('');
    setNewAmount('');
  };

  const handleRemoveTransaction = (id: string) => {
    setLedger(ledger.filter(t => t.id !== id));
  };

  // Save to localStorage whenever ledger changes
  useEffect(() => {
    localStorage.setItem('ledger', JSON.stringify(ledger));
  }, [ledger]);

  // Sort ledger by date (newest first)
  const sortedLedger = [...ledger].sort((a, b) => 
    b.date.localeCompare(a.date)
  );

  const formatAmount = (amount: number): string => {
    const prefix = amount >= 0 ? '+' : '';
    return `${prefix}${amount.toFixed(2)}`;
  };

  return (
    <div className="relative h-screen py-8 px-4 bg-[var(--color-surface)] flex flex-col overflow-hidden">
      <h1 className="font-bold text-lg mb-4 shrink-0">Expense List</h1>

      {/* Header Row */}
      <div className="grid grid-cols-[135px_1.1fr_80px_40px] gap-2 mb-2 px-2 text-xs text-slate-400 font-medium uppercase shrink-0">
        <span>Date</span>
        <span>Description</span>
        <span>Amount</span>
        <span></span>
      </div>

      {/* Add New Transaction Row - at the TOP */}
      <form 
        onSubmit={(e) => { e.preventDefault(); handleAddTransaction(); }}
        className="grid grid-cols-[130px_1fr_80px_40px] gap-2 mb-4 p-2 bg-[var(--color-surface-hover)] rounded-lg shrink-0"
      >
        <input
          type="date"
          value={newDate}
          onChange={(e) => setNewDate(e.target.value)}
          className="bg-transparent border border-[var(--color-border)] rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-[var(--color-accent)]"
        />
        <input
          type="text"
          placeholder="Description"
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
          className="bg-transparent border border-[var(--color-border)] rounded px-2 py-1 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[var(--color-accent)]"
        />
        <input
          type="number"
          placeholder="0.00"
          value={newAmount}
          onChange={(e) => setNewAmount(e.target.value)}
          className="bg-transparent border border-[var(--color-border)] rounded px-2 py-1 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[var(--color-accent)]"
        />
        <button
          type="submit"
          className="flex items-center justify-center w-8 h-8 bg-[var(--color-accent)] text-white rounded hover:opacity-90 transition-opacity"
          title="Add transaction"
        >
          +
        </button>
      </form>

      {/* Transaction List */}
      <div className="flex-1 overflow-y-auto space-y-1 min-h-0">
        {sortedLedger.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-4">No transactions yet</p>
        ) : (
          sortedLedger.map((transaction) => (
            <div
              key={transaction.id}
              className="grid grid-cols-[1fr_1.5fr_80px_40px] gap-2 p-2 rounded hover:bg-[var(--color-surface-hover)] transition-colors items-center"
            >
              <span className="text-sm text-slate-300 truncate">{transaction.date}</span>
              <span className="text-sm text-slate-300 truncate">{transaction.description}</span>
              <span className={`text-sm font-medium ${transaction.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatAmount(transaction.amount)}
              </span>
              <button
                onClick={() => handleRemoveTransaction(transaction.id)}
                className="flex items-center justify-center w-6 h-6 text-slate-500 hover:text-red-400 transition-colors"
                title="Remove transaction"
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>
      
      {/* Resize Handle */}
      <div
        className="absolute top-0 right-0 bottom-0 w-1 bg-[var(--color-border)] hover:[var(--color-surface-hover)] cursor-col-resize transition-colors z-50"
        onMouseDown={handleMouseDown}
        title="Drag to resize"
      />
    </div>
  )
}
