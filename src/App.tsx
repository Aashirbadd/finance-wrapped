import { useState, useRef } from "react";
import Sidebar from "./components/Sidebar";

function App() {
  const [count, setCount] = useState(0);
  const [sidebarWidth, setSidebarWidth] = useState(20);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [prevWidth, setPrevWidth] = useState(20);
  const transitionTimeoutRef = useRef<number | null>(null);

  const handleToggleCollapse = () => {
    // Clear any existing timeout
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }

    if (isCollapsed) {
      // Expand - restore previous width with transition
      setIsTransitioning(true);
      setSidebarWidth(prevWidth);
      setIsCollapsed(false);
      // Turn off transition after animation completes
      transitionTimeoutRef.current = window.setTimeout(() => {
        setIsTransitioning(false);
      }, 300);
    } else {
      // Collapse - save current width first with transition
      setIsTransitioning(true);
      setPrevWidth(sidebarWidth);
      setSidebarWidth(0);
      setIsCollapsed(true);
      // Turn off transition after animation completes
      transitionTimeoutRef.current = window.setTimeout(() => {
        setIsTransitioning(false);
      }, 300);
    }
  };

  return (
  /* The Red Border is the Parent. It MUST be flex. */
  <div className="flex w-screen min-h-screen border-4 border-red-500"> 
    
    {/* The Blue Border is your Sidebar */}
    <div 
      className={`border-4 border-blue-500 shrink-0 overflow-hidden ${isTransitioning ? 'transition-all duration-300' : ''}`}
      style={{ width: `${sidebarWidth}%` }}
    >
      <Sidebar 
        currentWidth={sidebarWidth} 
        onResize={setSidebarWidth}
      />
    </div>

    {/* The Green Border is your Main content */}
    <main className="flex-1 border-4 border-green-500">
      <div className="p-8">
        {/* Title and Toggle Sidebar Button on same line */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={handleToggleCollapse}
            className="rounded hover:bg-[var(--color-surface-hover)] transition-colors"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <svg className="w-7 h-7" viewBox="0 0 24 24">
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
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </button>
          <h1 className="m-0 font-bold">Finance Visualizer</h1>
        </div>
        
        <button onClick={() => setCount((count) => count + 1)}>
          Count is {count}
        </button>
      </div>
    </main>
  </div>
);

}

export default App;
