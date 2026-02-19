import { useState, useRef } from 'react'

interface CsvDropZoneProps {
  onFileSelect: (files: File[]) => void
}

export function CsvDropZone({ onFileSelect }: CsvDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [fileCount, setFileCount] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileProcess = (files: File[]) => {
    setIsProcessing(true)
    setFileCount(files.length)
    onFileSelect(files)
    
    // After a short delay to allow processing, show success then reset
    setTimeout(() => {
      setIsProcessing(false)
      setShowSuccess(true)
      
      // After success indicator, reset to original state
      setTimeout(() => {
        setShowSuccess(false)
        setFileCount(0)
        if (inputRef.current) {
          inputRef.current.value = ''
        }
      }, 1000)
    }, 300)
  }

  const getCsvFiles = (fileList: FileList): File[] => {
    const csvFiles: File[] = []
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i]
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        csvFiles.push(file)
      }
    }
    return csvFiles
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = getCsvFiles(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileProcess(files)
    }
  }

  const handleClick = () => {
    inputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const csvFiles = getCsvFiles(files)
      if (csvFiles.length > 0) {
        handleFileProcess(csvFiles)
      }
    }
  }

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        border-2 border-dashed rounded-lg p-2 text-center cursor-pointer transition-colors mb-4
        ${isDragging 
          ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10' 
          : 'border-[var(--color-border)] hover:border-[var(--color-accent)]'
        }
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />
      
      {isProcessing ? (
        <div className="flex items-center justify-center gap-2">
          <svg className="w-4 h-4 text-blue-400 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-sm text-slate-300">
            {fileCount > 1 ? `Processing ${fileCount} files...` : 'Processing...'}
          </span>
        </div>
      ) : showSuccess ? (
        <div className="flex items-center justify-center gap-2">
          <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-sm text-green-400">
            {fileCount > 1 ? `Success! (${fileCount} files)` : 'Success!'}
          </span>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-2">
          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="text-sm text-slate-400">
            Drop CSV here or <span className="text-[var(--color-accent)]">click to browse</span>
          </p>
        </div>
      )}
    </div>
  )
}
