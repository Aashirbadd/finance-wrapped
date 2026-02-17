import React from 'react'
import type { Ledger, Transaction } from '../../types'
import { AddTransaction } from './AddTransaction'
import { TransactionList } from './TransactionList'
import { PdfDropZone } from './PdfDropZone'

interface SidebarProps {
  currentWidth: number
  onResize: (newWidth: number) => void
  ledger: Ledger
  onAdd: (transaction: Transaction) => void
  onRemove: (id: string) => void
  onPdfSelect: (file: File) => void
}

export default function Sidebar({ currentWidth, onResize, ledger, onAdd, onRemove, onPdfSelect }: SidebarProps) {
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    
    const startX = e.clientX
    const startWidth = currentWidth

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const diff = moveEvent.clientX - startX
      const percentageDiff = (diff / window.innerWidth) * 100
      const newWidth = Math.max(35, Math.min(60, startWidth + percentageDiff))
      onResize(newWidth)
    }

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

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

      {/* Add New Transaction */}
      <AddTransaction onAdd={onAdd} />

      {/* PDF Drop Zone */}
      <PdfDropZone onFileSelect={onPdfSelect} />

      {/* Transaction List */}
      <TransactionList ledger={ledger} onRemove={onRemove} />
      
      {/* Resize Handle */}
      <div
        className="absolute top-0 right-0 bottom-0 w-1 bg-[var(--color-border)] hover:[var(--color-surface-hover)] cursor-col-resize transition-colors z-50"
        onMouseDown={handleMouseDown}
        title="Drag to resize"
      />
    </div>
  )
}
