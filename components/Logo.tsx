import React from 'react';

interface LogoProps {
  className?: string;
  withText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = "w-32 h-auto", withText = true }) => {
  // Using the direct download link for the Google Drive file
  const logoUrl = "https://drive.google.com/uc?export=view&id=1tNewgMV1nsQavfN0Pvm8HTWQysNizXS4";

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <img 
        src={logoUrl} 
        alt="Syan Logo" 
        className="w-full h-full object-contain drop-shadow-sm"
      />
      
      {withText && (
          <div className="flex gap-1 mt-2 font-black tracking-widest text-4xl leading-none" style={{ fontFamily: 'Verdana, sans-serif' }}>
              <span className="text-[#F49E4C]">S</span>
              <span className="text-[#EF5D66]">Y</span>
              <span className="text-[#49A7C3]">A</span>
              <span className="text-[#1F7A78]">N</span>
          </div>
      )}
    </div>
  );
};