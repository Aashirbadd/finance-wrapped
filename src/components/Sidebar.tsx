import React from 'react'

interface SidebarProps {
  currentWidth: number;
  onResize: (newWidth: number) => void;
}

export default function Sidebar({ currentWidth, onResize }: SidebarProps) {
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    
    const startX = e.clientX;
    const startWidth = currentWidth;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const diff = moveEvent.clientX - startX;
      // Convert pixel difference to percentage based on current viewport width
      const percentageDiff = (diff / window.innerWidth) * 100;
      const newWidth = Math.max(15, Math.min(60, startWidth + percentageDiff));
      onResize(newWidth);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className="relative h-full py-8 px-4 bg-[var(--color-surface)]">
      <h1 className="font-bold text-lg mb-4">Expense List</h1>
      
      {/* Resize Handle */}
      <div
        className="absolute top-0 right-0 bottom-0 w-1 bg-[var(--color-border)] hover:[var(--color-surface-hover)] cursor-col-resize transition-colors z-50"
        onMouseDown={handleMouseDown}
        title="Drag to resize"
      />
    </div>
  )
}
