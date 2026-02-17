import { useEffect, useRef } from 'react'
import type { Ledger } from '../../types'

interface TransactionListProps {
  ledger: Ledger
  onRemove: (id: string) => void
  selectedDate: string | null
}

const formatAmount = (amount: number): string => {
  const prefix = amount >= 0 ? '+' : ''
  return `${prefix}${amount.toFixed(2)}`
}

export function TransactionList({ ledger, onRemove, selectedDate }: TransactionListProps) {
  // Sort ledger by date (newest first)
  const sortedLedger = [...ledger].sort((a, b) => 
    b.date.localeCompare(a.date)
  )

  // Ref for auto-scrolling
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map())

  // Auto-scroll to first matching transaction when selectedDate changes
  useEffect(() => {
    if (selectedDate) {
      // Find the first transaction matching the selected date
      const firstMatch = sortedLedger.find(t => t.date === selectedDate)
      if (firstMatch) {
        const element = itemRefs.current.get(firstMatch.id)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }
    }
  }, [selectedDate, sortedLedger])

  return (
    <div className="flex-1 overflow-y-auto space-y-1 min-h-0">
      {sortedLedger.length === 0 ? (
        <p className="text-slate-500 text-sm text-center py-4">No transactions yet</p>
      ) : (
        sortedLedger.map((transaction) => {
          const isSelected = selectedDate === transaction.date
          return (
            <div
              key={transaction.id}
              ref={(el) => {
                if (el) itemRefs.current.set(transaction.id, el)
              }}
              className={`grid grid-cols-[1fr_1.5fr_80px_40px] gap-2 p-2 rounded hover:bg-[var(--color-surface-hover)] transition-colors items-center ${
                isSelected ? 'bg-blue-500/20 border border-blue-500/50' : ''
              }`}
            >
              <span className="text-sm text-slate-300 truncate">{transaction.date}</span>
              <span className="text-sm text-slate-300 truncate">{transaction.description}</span>
              <span className={`text-sm font-medium ${transaction.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatAmount(transaction.amount)}
              </span>
              <button
                onClick={() => onRemove(transaction.id)}
                className="flex items-center justify-center w-6 h-6 text-slate-500 hover:text-red-400 transition-colors"
                title="Remove transaction"
              >
                ×
              </button>
            </div>
          )
        })
      )}
    </div>
  )
}
