import React from 'react'
import type { Ledger, Transaction, DataMode } from '../../types'
import { AddTransaction } from './AddTransaction'
import { TransactionList } from './TransactionList'
import { CsvDropZone } from './CsvDropZone'

interface SidebarProps {
  currentWidth: number
  onResize: (newWidth: number) => void
  ledger: Ledger
  onAdd: (transaction: Transaction | Transaction[]) => void
  onRemove: (id: string) => void
  onCsvSelect: (contents: string[]) => void
  selectedDate: string | null
  dataMode: DataMode
  onDataModeChange: (mode: DataMode) => void
  showToast: (message: string, type?: 'info' | 'warning' | 'success') => void
}

export default function Sidebar({ currentWidth, onResize, ledger, onAdd, onRemove, onCsvSelect, selectedDate, dataMode, onDataModeChange, showToast }: SidebarProps) {
  const handleCsvSelect = async (files: File[]) => {
    try {
      const contents = await Promise.all(files.map(file => file.text()))
      onCsvSelect(contents)
    } catch (error) {
      console.error('Error reading CSV:', error)
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    
    const startX = e.clientX
    const startWidth = currentWidth

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const diff = moveEvent.clientX - startX
      const percentageDiff = (diff / window.innerWidth) * 100
      const newWidth = Math.max(30, Math.min(60, startWidth + percentageDiff))
      onResize(newWidth)
    }

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  // Handle add with demo mode warning
  const handleAdd = (transaction: Transaction | Transaction[]) => {
    if (dataMode === 'demo') {
      showToast('Changes to demo data won\'t be saved', 'warning');
    }
    onAdd(transaction);
  };

  // Handle remove with demo mode warning
  const handleRemove = (id: string) => {
    if (dataMode === 'demo') {
      showToast('Changes to demo data won\'t be saved', 'warning');
    }
    onRemove(id);
  };

  return (
    <div className="relative h-screen py-8 px-4 bg-[var(--color-surface)] flex flex-col overflow-hidden">
      {/* Header with title and data mode toggle */}
      <div className="flex items-center gap-2 mb-4 shrink-0">
        <h1 className="font-bold text-lg">Expense List</h1>
        <div className="ml-auto flex items-center gap-1 bg-slate-800/50 rounded-lg p-1">
          {(['demo', 'user', 'clear'] as DataMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => onDataModeChange(mode)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all capitalize ${
                dataMode === mode
                  ? 'bg-blue-500/20 text-blue-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              {mode === 'user' ? 'Your Data' : mode}
            </button>
          ))}
        </div>
      </div>

      {/* Add New Transaction */}
      <AddTransaction onAdd={handleAdd} />

      {/* CSV Drop Zone */}
      <CsvDropZone onFileSelect={handleCsvSelect} />

      {/* Transaction List */}
      <TransactionList ledger={ledger} onRemove={handleRemove} selectedDate={selectedDate} />
      
      {/* Resize Handle */}
      <div
        className="absolute top-0 right-0 bottom-0 w-1 bg-[var(--color-border)] hover:[var(--color-surface-hover)] cursor-col-resize transition-colors z-50"
        onMouseDown={handleMouseDown}
        title="Drag to resize"
      />
    </div>
  )
}
