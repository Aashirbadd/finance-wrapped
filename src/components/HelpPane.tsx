import { useState, useEffect, useCallback } from 'react';
import testGif from '../assets/testGif.gif';

interface HelpSlide {
  title: string;
  gifUrl: string;
  feature: string;
}

const helpSlides: HelpSlide[] = [
  {
    title: 'Welcome to Finance Wrapped',
    gifUrl: testGif,
    feature: 'Track your expenses, visualize your spending, and gain insights into your financial health. Use the sidebar to manage transactions and the main area to view charts.'
  },
  {
    title: 'Adding Transactions',
    gifUrl: testGif,
    feature: 'Add income or expenses manually using the form in the sidebar. Enter the date, description, and amount. Positive amounts are income, negative amounts are expenses.'
  },
  {
    title: 'CSV Import',
    gifUrl: testGif,
    feature: 'Import your bank statements by dragging and dropping CSV files. The app automatically detects date formats and parses your transactions.'
  },
  {
    title: 'Viewing the Chart',
    gifUrl: testGif,
    feature: 'Click on any bar in the chart to filter transactions for that month. Use the toggle buttons (Total/Monthly/Yearly) to switch between different views.'
  },
  {
    title: 'Resizing the Sidebar',
    gifUrl: testGif,
    feature: 'Drag the right edge of the sidebar to resize it. The sidebar can be collapsed completely by clicking the toggle button in the header.'
  }
];

interface HelpPaneProps {
  isOpen: boolean;
  onClose: () => void;
  onDontShowAgain: () => void;
}

export default function HelpPane({ isOpen, onClose, onDontShowAgain }: HelpPaneProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(() => {
    return localStorage.getItem('showHelpOnStartup') === 'false';
  });

  const handleDontShowChange = () => {
    const newValue = !dontShowAgain;
    setDontShowAgain(newValue);
    if (newValue) {
      localStorage.setItem('showHelpOnStartup', 'false');
      onDontShowAgain();
    } else {
      localStorage.removeItem('showHelpOnStartup');
    }
  };

  const goToNext = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % helpSlides.length);
  }, []);

  const goToPrev = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + helpSlides.length) % helpSlides.length);
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        goToNext();
      } else if (e.key === 'ArrowLeft') {
        goToPrev();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, goToNext, goToPrev, onClose]);

  // Reset to first slide when opening
  useEffect(() => {
    if (isOpen) {
      setCurrentSlide(0);
    }
  }, [isOpen]);

  const isLastSlide = currentSlide === helpSlides.length - 1;

  const handleGetStarted = () => {
    onClose();
  };

  if (!isOpen) return null;

  const slide = helpSlides[currentSlide];

  return (
    <div className="fixed inset-0 z-[100] bg-[var(--color-bg)] flex flex-col">
      {/* Top Bar - Close + Don't show again */}
      <div className="flex items-center justify-end gap-2 p-4 shrink-0">
        <button
          onClick={handleDontShowChange}
          className={`flex items-center justify-center px-3 py-1.5 rounded transition-all font-sans text-sm font-medium ${
            dontShowAgain
              ? 'bg-blue-500/20 text-blue-400 shadow-sm'
              : 'bg-[var(--color-surface)] text-slate-400 hover:bg-[var(--color-surface-hover)]'
          }`}
          title="Don't show again"
        >
          Don't show again
        </button>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] transition-colors"
          aria-label="Close help"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 pb-2 overflow-hidden">
        <div className="max-w-3xl w-full text-center">
          {/* Title - Smaller */}
          <h1 className="text-3xl font-bold mb-6">{slide.title}</h1>

          {/* GIF - Bigger image, less padding */}
          <div className="bg-[var(--color-surface)] rounded-xl mb-6 aspect-video flex items-center justify-center border border-[var(--color-border)] overflow-hidden">
            <img 
              src={slide.gifUrl} 
              alt={slide.title}
              className="w-full h-full object-contain"
            />
          </div>

          {/* Feature Text */}
          <p className="text-base text-slate-300 leading-relaxed">
            {slide.feature}
          </p>
        </div>
      </div>

      {/* Bottom Bar - Navigation */}
      <div className="shrink-0 pb-4">
        <div className="flex items-center justify-center gap-4">
          {/* Previous Button */}
          <button
            onClick={goToPrev}
            className="px-4 py-1.5 bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] rounded-lg font-medium transition-colors text-sm"
          >
            Previous
          </button>

          {/* Navigation Dots */}
          <div className="flex items-center gap-2">
            {helpSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentSlide
                    ? 'bg-blue-500 w-6'
                    : 'bg-slate-600 hover:bg-slate-500'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Next / Get Started Button */}
          {isLastSlide ? (
            <button
              onClick={handleGetStarted}
              className="px-6 py-1.5 bg-green-500 hover:bg-green-600 rounded-lg font-medium transition-colors text-sm"
            >
              Get Started
            </button>
          ) : (
            <button
              onClick={goToNext}
              className="px-4 py-1.5 bg-blue-500 hover:bg-blue-600 rounded-lg font-medium transition-colors text-sm"
            >
              Next
            </button>
          )}
        </div>

        {/* Slide Counter */}
        <div className="text-center mt-2 text-xs text-slate-500">
          {currentSlide + 1} of {helpSlides.length}
        </div>
      </div>
    </div>
  );
}
