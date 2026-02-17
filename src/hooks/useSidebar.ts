import { useState, useRef } from 'react';

export function useSidebar(initialWidth: number = 20) {
  const [sidebarWidth, setSidebarWidth] = useState(initialWidth);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [prevWidth, setPrevWidth] = useState(initialWidth);
  const transitionTimeoutRef = useRef<number | null>(null);

  const toggleCollapse = () => {
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

  return {
    sidebarWidth,
    setSidebarWidth,
    isCollapsed,
    isTransitioning,
    toggleCollapse,
  };
}
