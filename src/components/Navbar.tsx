import React, { useState } from 'react';
import { Compass, Sparkles, Bot, User as UserIcon, LogIn, Camera } from 'lucide-react';
import { User } from '../lib/firebase';

interface NavbarProps {
  onNavigate: (id: string) => void;
  onOpenWaitlist: () => void;
  onOpenAuth: () => void;
  onOpenConcierge: () => void;
  onOpenAiStudio: () => void;
  onOpenVisionPostcard: () => void;
  currentUser: User | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNavigate,
  onOpenWaitlist,
  onOpenAuth,
  onOpenConcierge,
  onOpenAiStudio,
  onOpenVisionPostcard,
  currentUser,
}) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-40 flex justify-between items-center px-4 sm:px-8 md:px-12 py-3.5 bg-[#FFF9F0]/90 backdrop-blur-md border-b-2 border-[#4A3728]/15 shadow-xs">
      {/* Brand & SIH Badge */}
      <div
        onClick={() => onNavigate('home')}
        className="cursor-pointer flex items-center gap-2"
      >
        <span className="font-serif-custom text-2xl font-bold tracking-tight text-[#4A3728]">
          Trip<em className="text-[#F2765A] not-italic">sahay</em>
        </span>
        <span className="hidden sm:inline-block bg-[#FBEFD4] text-[#C96B4A] font-mono text-[10px] px-2 py-0.5 rounded border border-[#4A3728]/20 font-bold">
          SIH 2026
        </span>
      </div>

      {/* Navigation links */}
      <div className="hidden lg:flex items-center gap-7 text-xs font-semibold text-[#7a6a58] tracking-wide">
        <button
          onClick={() => onNavigate('resurrection')}
          className="hover:text-[#F2765A] transition-colors cursor-pointer"
        >
          Resurrection
        </button>
        <button
          onClick={() => onNavigate('capture')}
          className="hover:text-[#F2765A] transition-colors cursor-pointer"
        >
          Capture Engine
        </button>
        <button
          onClick={() => onNavigate('passport')}
          className="hover:text-[#F2765A] transition-colors cursor-pointer"
        >
          Passports
        </button>
        <button
          onClick={() => onNavigate('gallery')}
          className="hover:text-[#1D3FBF] transition-colors cursor-pointer flex items-center gap-1"
        >
          <span>Sauna Gallery</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#1D3FBF] animate-pulse" />
        </button>
        <button
          onClick={() => onNavigate('oil')}
          className="hover:text-[#F2765A] transition-colors cursor-pointer flex items-center gap-1"
        >
          <span>Spectral Oil</span>
          <Sparkles className="w-3 h-3 text-[#F2765A]" />
        </button>
        <button
          onClick={() => onNavigate('privacy')}
          className="hover:text-[#7A6BA8] transition-colors cursor-pointer"
        >
          DPDP Privacy
        </button>
      </div>

      {/* Action CTA & Modals */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Gemini AI Storyteller CTA */}
        <button
          onClick={onOpenAiStudio}
          title="Synthesize AI Travel Chronicle"
          className="btn btn-magnetic hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#FBEFD4] border border-[#4A3728] text-xs font-bold text-[#4A3728] hover:bg-[#FAD9C1] transition-all cursor-pointer shadow-[2px_2px_0px_rgba(74,55,40,0.85)]"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#F2765A]" />
          <span>AI Story</span>
        </button>

        {/* Gemini AI Vision Postcard CTA */}
        <button
          onClick={onOpenVisionPostcard}
          title="Extract Risograph Vision Postcard"
          className="btn btn-magnetic hidden md:flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#EFE8FA] border border-[#4A3728] text-xs font-bold text-[#7A6BA8] hover:bg-[#D9C7EE] transition-all cursor-pointer shadow-[2px_2px_0px_rgba(122,107,168,0.7)]"
        >
          <Camera className="w-3.5 h-3.5 text-[#7A6BA8]" />
          <span>Vision Postcard</span>
        </button>

        {/* Live Concierge Assistant Button */}
        <button
          onClick={onOpenConcierge}
          className="btn btn-magnetic flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#DFF3E4] border border-[#2E6E4E] text-xs font-bold text-[#2E6E4E] hover:bg-[#c9ebd2] transition-all cursor-pointer shadow-[2px_2px_0px_#2E6E4E]"
          title="Sahay AI Travel Concierge"
        >
          <Bot className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">AI Concierge</span>
        </button>

        {/* Firebase User Auth Trigger */}
        <button
          onClick={onOpenAuth}
          className="btn btn-magnetic p-1.5 sm:px-3 sm:py-1.5 rounded-full bg-white border-2 border-[#4A3728] text-[#4A3728] text-xs font-semibold hover:bg-[#FBEFD4] shadow-[2px_2px_0px_rgba(74,55,40,0.85)] flex items-center gap-1.5 cursor-pointer"
          title={currentUser ? `Logged in: ${currentUser.displayName || currentUser.email || 'Guest'}` : 'Sign In'}
        >
          {currentUser ? (
            <>
              <div className="w-5 h-5 rounded-full bg-[#F2765A] text-white flex items-center justify-center font-bold text-[10px]">
                {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : 'U'}
              </div>
              <span className="hidden md:inline text-[11px] font-mono font-bold max-w-[90px] truncate">
                {currentUser.displayName || 'Explorer'}
              </span>
            </>
          ) : (
            <>
              <LogIn className="w-3.5 h-3.5 text-[#4A3728]" />
              <span className="hidden sm:inline">Sign In</span>
            </>
          )}
        </button>

        {/* "Get the Android App" Waitlist Trigger */}
        <button
          onClick={onOpenWaitlist}
          className="btn btn-magnetic inline-flex items-center gap-1.5 px-3.5 sm:px-5 py-2 rounded-full border-2 border-[#4A3728] bg-[#F2765A] text-white text-xs sm:text-sm font-semibold hover:bg-[#e06548] shadow-[3px_3px_0px_rgba(74,55,40,0.95)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer"
        >
          <Compass className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
          <span>Get the App</span>
        </button>
      </div>
    </nav>
  );
};
