import React from 'react';

interface ResizerProps {
  onMouseDown: (e: React.MouseEvent) => void;
  className?: string;
}

const Resizer = ({ onMouseDown, className = "" }: ResizerProps) => {
  return (
    <div
      onMouseDown={onMouseDown}
      className={`group w-1.5 h-full cursor-col-resize relative z-20 flex-shrink-0 transition-colors duration-200 hover:bg-[#003752]/10 active:bg-[#003752]/20 ${className}`}
    >
      {/* Visual Indicator (Only shows on hover) */}
      <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[2px] bg-[#003752] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  );
};

export default Resizer;
