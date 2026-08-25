import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { Marquee } from './components/Marquee';
import { ResurrectionSection } from './components/ResurrectionSection';
import { StatsSection } from './components/StatsSection';
import { CaptureSection } from './components/CaptureSection';
import { PassportSection } from './components/PassportSection';
import { SaunaMistGallery } from './components/SaunaMistGallery';
import { OilSurfaceSection } from './components/OilSurfaceSection';
import { PrivacySection } from './components/PrivacySection';
import { ManifestSection } from './components/ManifestSection';

// Global Animation Components
import { Preloader } from './components/Preloader';
import { CustomCursor } from './components/CustomCursor';
import { ProgressRail } from './components/ProgressRail';

// Interactive Modals & Drawers
import { WaitlistModal } from './components/WaitlistModal';
import { AuthModal } from './components/AuthModal';
import { AiChroniclerModal } from './components/AiChroniclerModal';
import { AiConciergeDrawer } from './components/AiConciergeDrawer';
import { AiVisionPostcardModal } from './components/AiVisionPostcardModal';

// Firebase Auth & Motion
import { auth, onAuthStateChanged, User } from './lib/firebase';
import { initSmoothScroll, initScrollAnimations, destroySmoothScroll, scrollTo } from './utils/motion';
import { Bot, Sparkles, Smartphone, Compass } from 'lucide-react';
import { Trip } from './types';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isPreloaded, setIsPreloaded] = useState<boolean>(false);
  
  // Modals state
  const [isWaitlistOpen, setIsWaitlistOpen] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isConciergeOpen, setIsConciergeOpen] = useState<boolean>(false);
  const [isAiStudioOpen, setIsAiStudioOpen] = useState<boolean>(false);
  const [isVisionPostcardOpen, setIsVisionPostcardOpen] = useState<boolean>(false);
  const [selectedTripForAi, setSelectedTripForAi] = useState<Trip | null>(null);

  // Initialize Firebase Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Initialize Lenis Smooth Scroll & GSAP ScrollTrigger
  useEffect(() => {
    const lenis = initSmoothScroll();
    const timer = setTimeout(() => {
      initScrollAnimations();
    }, 100);

    return () => {
      clearTimeout(timer);
      destroySmoothScroll();
    };
  }, []);

  const handlePreloaderComplete = () => {
    setIsPreloaded(true);
    // Trigger scroll animation passes
    setTimeout(() => {
      initScrollAnimations();
    }, 150);
  };

  const scrollToSection = (id: string) => {
    scrollTo(`#${id}`, -40);
  };

  const handleOpenAiForTrip = (trip: Trip) => {
    setSelectedTripForAi(trip);
    setIsAiStudioOpen(true);
  };

  return (
    <div className="relative min-h-screen bg-[#FFF9F0] text-[#4A3728] font-ui-custom selection:bg-[#F2765A] selection:text-white">
      {/* 1. Global Preloader Curtain */}
      <Preloader onComplete={handlePreloaderComplete} />

      {/* 2. Custom Contextual Cursor (Spice Dot + Ring) */}
      <CustomCursor />

      {/* 3. Global Section Progress Rail */}
      <ProgressRail />

      {/* 4. Texture grain overlay */}
      <div className="grain-overlay" />

      {/* Main Navbar with AI & Waitlist & Auth triggers */}
      <Navbar
        onNavigate={scrollToSection}
        onOpenWaitlist={() => setIsWaitlistOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenConcierge={() => setIsConciergeOpen(true)}
        onOpenAiStudio={() => {
          setSelectedTripForAi(null);
          setIsAiStudioOpen(true);
        }}
        onOpenVisionPostcard={() => setIsVisionPostcardOpen(true)}
        currentUser={currentUser}
      />

      <main className="w-full">
        {/* 1. Hero Section (Monsoon Postcard) */}
        <HeroSection
          onExplore={() => scrollToSection('capture')}
          onResurrect={() => scrollToSection('resurrection')}
          onOpenWaitlist={() => setIsWaitlistOpen(true)}
          onOpenAiStudio={() => {
            setSelectedTripForAi(null);
            setIsAiStudioOpen(true);
          }}
        />

        {/* Dynamic Running Tape Marquee */}
        <Marquee />

        {/* 2. Resurrection Section (Google Timeline Parser + Gemini AI story hooks) */}
        <ResurrectionSection onOpenAiForTrip={handleOpenAiForTrip} />

        {/* Stats Band */}
        <StatsSection />

        {/* 3. Capture Section ("Engineered, not magic" with Live Studio Feixen Kinetic Poster Animation) */}
        <CaptureSection />

        {/* 4. Passport Section (Dusty Rose Edition) */}
        <PassportSection />

        {/* Interlude — Oil Surface ("The Surface of Your Data" WebGL Film) */}
        <OilSurfaceSection />

        {/* 5. Sauna Mist Gallery ("Four nights, remembered" with Falling Mist Wipe Engine) */}
        <SaunaMistGallery />

        {/* 7. Privacy & Consent Section (Lilac Light Architecture) */}
        <PrivacySection />

        {/* 8. Manifest Section (Aurora, FAQ, Countdown & Mega Footer) */}
        <ManifestSection
          onOpenWaitlist={() => setIsWaitlistOpen(true)}
          onOpenAiStudio={() => {
            setSelectedTripForAi(null);
            setIsAiStudioOpen(true);
          }}
        />
      </main>

      {/* Floating Action Badge & AI Copilot Launcher */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3 pointer-events-auto">
        {/* Floating AI Concierge Button */}
        <button
          onClick={() => setIsConciergeOpen(true)}
          className="btn btn-magnetic group flex items-center gap-2 px-4 py-3 bg-[#F2765A] text-white rounded-full border-2 border-[#4A3728] shadow-[4px_5px_0px_rgba(74,55,40,0.95)] hover:scale-105 hover:-translate-y-1 transition-all cursor-pointer"
          title="Open Sahay AI Concierge"
        >
          <div className="relative">
            <Bot className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#BFE3CE] rounded-full border border-[#4A3728] animate-ping" />
          </div>
          <span className="font-serif-custom text-sm font-bold tracking-wide">
            Sahay AI Concierge
          </span>
        </button>

        {/* Floating Waitlist Quick Pill */}
        <button
          onClick={() => setIsWaitlistOpen(true)}
          className="btn btn-magnetic hidden sm:flex items-center gap-2 px-3.5 py-1.5 bg-[#FFFDF8] text-[#4A3728] rounded-full border-2 border-[#4A3728] shadow-[3px_3px_0px_rgba(74,55,40,0.85)] text-xs font-mono font-bold hover:bg-[#FBEFD4] transition-all cursor-pointer"
        >
          <Smartphone className="w-3.5 h-3.5 text-[#2E6E4E]" />
          <span>Android App Waitlist · 1,482 joined</span>
        </button>
      </div>

      {/* Modals & Drawers */}
      <WaitlistModal
        isOpen={isWaitlistOpen}
        onClose={() => setIsWaitlistOpen(false)}
        defaultEmail={currentUser?.email || ''}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
      />

      <AiChroniclerModal
        isOpen={isAiStudioOpen}
        onClose={() => setIsAiStudioOpen(false)}
        selectedTrip={selectedTripForAi}
        currentUser={currentUser}
      />

      <AiConciergeDrawer
        isOpen={isConciergeOpen}
        onClose={() => setIsConciergeOpen(false)}
      />

      <AiVisionPostcardModal
        isOpen={isVisionPostcardOpen}
        onClose={() => setIsVisionPostcardOpen(false)}
      />
    </div>
  );
}
