interface SidebarButtonProps {
  isCollapsed: boolean;
  onClick: () => void;
}

export default function SidebarButton({ isCollapsed, onClick }: SidebarButtonProps) {
  return (
    <button
      onClick={onClick}
      className="rounded hover:bg-[var(--color-surface-hover)] transition-colors"
      title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
    >
      {isCollapsed ? (
        <svg className="w-10 h-10" viewBox="0 0 24 24">
          <text 
            x="12" 
            y="16" 
            textAnchor="middle" 
            fill="currentColor"
            fontSize="14" 
            fontWeight="bold"
          >
            +$
          </text>
        </svg>
      ) : (
        <svg className="w-10 h-10" viewBox="0 0 24 24">
          <text 
            x="12" 
            y="16" 
            textAnchor="middle" 
            fill="currentColor"
            fontSize="14" 
            fontWeight="bold"
          >
            -$
          </text>
        </svg>
      )}
    </button>
  );
}
