import { useState } from 'react'
import dayjs from 'dayjs'
import type { Transaction, RecurringFrequency } from '../../types'

interface AddTransactionProps {
  onAdd: (transaction: Transaction | Transaction[]) => void
}

export function AddTransaction({ onAdd }: AddTransactionProps) {
  const [date, setDate] = useState('')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [isRecurring, setIsRecurring] = useState(false)
  const [frequency, setFrequency] = useState<RecurringFrequency>('monthly')
  const [periods, setPeriods] = useState('')

  const isSubmitable = date && description && amount && (!isRecurring || (isRecurring && periods))

  const resetForm = () => {
    setDate('')
    setDescription('')
    setAmount('')
    setIsRecurring(false)
    setFrequency('monthly')
    setPeriods('')
  }

  const createTransaction = (transactionDate: dayjs.Dayjs): Transaction => ({
    id: Date.now().toString(36) + Math.random().toString(36).substr(2),
    date: transactionDate.format('YYYY-MM-DD'),
    description,
    amount: parseFloat(amount),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!date || !description || !amount || (isRecurring && !periods)) {
      return
    }

    const baseDate = dayjs(date)
    
    if (isRecurring) {
      const numPeriods = parseInt(periods)
      const transactions: Transaction[] = []
      let currentDate = baseDate

      for (let i = 0; i < numPeriods; i++) {
        transactions.push(createTransaction(currentDate))
        
        if (frequency === 'weekly') {
          currentDate = currentDate.add(1, 'week')
        } else if (frequency === 'bi-weekly') {
          currentDate = currentDate.add(2, 'week')
        } else {
          currentDate = currentDate.add(1, 'month')
        }
      }
      
      onAdd(transactions)
    } else {
      onAdd(createTransaction(baseDate))
    }

    resetForm()
  }

  const getFrequencyLabel = () => {
    if (!periods) return ''
    const p = parseInt(periods)
    const suffix = p > 1 ? 's' : ''
    if (frequency === 'weekly') return `${p} week${suffix}`
    if (frequency === 'bi-weekly') return `${p} bi-week${suffix}`
    return `${p} month${suffix}`
  }

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      {/* Header Row */}
      <div className="grid grid-cols-[135px_1.1fr_80px_40px] gap-2 mb-2 px-2 text-xs text-slate-400 font-medium uppercase shrink-0">
        <span>Date</span>
        <span>Description</span>
        <span>Amount</span>
        <button
          type="button"
          onClick={() => setIsRecurring(!isRecurring)}
          className={`flex items-center justify-center p-1 rounded transition-all bg-[var(--color-surface-hover)] ${
            isRecurring 
              ? 'bg-blue-500/20 text-blue-400 shadow-sm'
              : 'text-slate-400 hover:text-slate-300'
          }`}
          title="Recurring transaction"
        >
          ↻
        </button>
      </div>
      <div className="grid grid-cols-[130px_1fr_80px_40px] gap-2 p-2 bg-[var(--color-surface-hover)] rounded-lg">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="bg-transparent border border-[var(--color-border)] rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-[var(--color-accent)]"
        />
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="bg-transparent border border-[var(--color-border)] rounded px-2 py-1 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[var(--color-accent)]"
        />
        <input
          type="number"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="bg-transparent border border-[var(--color-border)] rounded px-2 py-1 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[var(--color-accent)] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <button
          type="submit"
          disabled={!isSubmitable}
          className={`flex items-center justify-center w-8 h-8 rounded transition-opacity ${
            isSubmitable 
              ? 'bg-[var(--color-accent)] text-white hover:opacity-90 cursor-pointer' 
              : 'bg-slate-600 text-slate-400 cursor-not-allowed opacity-50'
          }`}
          title="Add transaction"
        >
          +
        </button>
      </div>

      {isRecurring && (
        <div className="grid grid-cols-[130px_1fr_130px] mt-1 gap-2 p-2 bg-[var(--color-surface-hover)] rounded-lg">
          
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as RecurringFrequency)}
            className="bg-transparent border border-[var(--color-border)] rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-[var(--color-accent)]"
          >
            <option value="weekly" className="bg-[var(--color-surface)]">Weekly</option>
            <option value="bi-weekly" className="bg-[var(--color-surface)]">Bi-weekly</option>
            <option value="monthly" className="bg-[var(--color-surface)]">Monthly</option>
          </select>

          <input
            type="number"
            min="1"
            max="52"
            value={periods}
            onChange={(e) => setPeriods(e.target.value)}
            className="bg-transparent border border-[var(--color-border)] rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-[var(--color-accent)] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            placeholder="# of periods"
          />
          
          <div className="text-xs text-slate-400 flex items-center">
            {getFrequencyLabel()}
          </div>

        </div>
      )}
    </form>
  )
}
