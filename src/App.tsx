import { useState } from "react";
import Sidebar from "./components/Sidebar";
import SidebarButton from "./components/SidebarButton";
import { useSidebar } from "./hooks/useSidebar";

function App() {
  const [count, setCount] = useState(0);
  const { 
    sidebarWidth, 
    setSidebarWidth, 
    isCollapsed, 
    isTransitioning, 
    toggleCollapse 
  } = useSidebar(20);

  return (
  <div className="flex w-screen min-h-screen"> 
    
    <div 
      className={`shrink-0 overflow-hidden ${isTransitioning ? 'transition-all duration-300' : ''}`}
      style={{ width: `${sidebarWidth}%`, minWidth: isCollapsed ? 0 : 498 }}
    >
      <Sidebar 
        currentWidth={sidebarWidth} 
        onResize={setSidebarWidth}
      />
    </div>

    <main className="flex-1">
      <div className="p-8">
        {/* Title and Toggle Sidebar Button on same line */}
        <div className="flex items-center gap-2 mb-4">
          <SidebarButton 
            isCollapsed={isCollapsed} 
            onClick={toggleCollapse} 
          />
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
