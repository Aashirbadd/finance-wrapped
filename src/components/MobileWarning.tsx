export default function MobileWarning() {
  return (
    <div className="fixed inset-0 z-100 bg-[var(--color-bg)] flex flex-col items-center justify-center p-8 text-center">
      {/* Title */}
      <h1 className="text-3xl font-bold text-white m-4">
        Welcome to Finance Wrapped
      </h1>
      
      {/* Video container */}
      <div className="w-full px-[0px]">
        <video
          src="/IntroVideo.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-auto rounded-2xl shadow-xl border border-slate-700"
        />
      </div>

      {/* Message */}
      <p className="text-lg text-slate-300 max-w-md leading-relaxed m-4">
        We noticed you're on a small screen. This app is designed for desktop. Please open it on your laptop or maximize your browser window to continue.
      </p>

      {/* Animated Arrows */}
      <div className="mt-8 flex justify-between w-full px-4">
        {/* Left Arrow */}
        <div className="animate-[bounce-left_1s_ease-in-out_infinite]">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="40" 
            height="40" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="text-slate-400"
          >
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </div>
        
        {/* Right Arrow */}
        <div className="animate-[bounce-right_1s_ease-in-out_infinite]">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="40" 
            height="40" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="text-slate-400"
          >
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </div>
      </div>
    </div>
  );
}
