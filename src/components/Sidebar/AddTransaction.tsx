import { useState } from 'react'
import type { Transaction } from '../../types'

interface AddTransactionProps {
  onAdd: (transaction: Transaction) => void
}

export function AddTransaction({ onAdd }: AddTransactionProps) {
  const [date, setDate] = useState('')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!date || !description || !amount) {
      return
    }

    const newTransaction: Transaction = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      date,
      description,
      amount: parseFloat(amount),
    }

    onAdd(newTransaction)

    setDate('')
    setDescription('')
    setAmount('')
  }

  return (
    <form 
      onSubmit={handleSubmit}
      className="grid grid-cols-[130px_1fr_80px_40px] gap-2 mb-4 p-2 bg-[var(--color-surface-hover)] rounded-lg shrink-0"
    >
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
  )
}
