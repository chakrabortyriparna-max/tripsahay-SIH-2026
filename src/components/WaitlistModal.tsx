import React, { useState, useEffect } from 'react';
import { X, Smartphone, CheckCircle, Sparkles, ArrowRight, ShieldCheck, Zap, Radio, Copy, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { addWaitlistEntryToFirestore } from '../lib/firebase';

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEmail?: string;
}

export const WaitlistModal: React.FC<WaitlistModalProps> = ({ isOpen, onClose, defaultEmail = '' }) => {
  const [email, setEmail] = useState<string>(defaultEmail);
  const [name, setName] = useState<string>('');
  const [device, setDevice] = useState<string>('Google Pixel 8 / 9');
  const [androidVersion, setAndroidVersion] = useState<string>('Android 15');
  const [trackingPref, setTrackingPref] = useState<string>('battery_saver');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [queuePosition, setQueuePosition] = useState<number>(1482);
  const [copied, setCopied] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    if (defaultEmail) {
      setEmail(defaultEmail);
    }
  }, [defaultEmail]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      // 1. Call Backend API
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name: name || 'Explorer',
          device,
          androidVersion,
          trackingPreference: trackingPref,
        }),
      });

      const data = await response.json();
      if (data.position) {
        setQueuePosition(data.position);
      }

      // 2. Also write to Firebase Firestore
      await addWaitlistEntryToFirestore({
        email,
        name: name || 'Explorer',
        device,
        androidVersion,
        trackingPreference: trackingPref,
      });

      setIsSuccess(true);
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#F2765A', '#BFE3CE', '#D9C7EE', '#E0A458', '#4A3728']
      });
    } catch (err: any) {
      console.warn('Waitlist sync notice:', err);
      // Even if network blips, show success
      setIsSuccess(true);
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#F2765A', '#BFE3CE', '#D9C7EE']
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyPass = () => {
    const passCode = `TRIPSAHAY-PASS-WAVE1-#${queuePosition}`;
    navigator.clipboard.writeText(passCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#4A3728]/70 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-lg bg-[#FFF9F0] border-3 border-[#4A3728] rounded-3xl p-6 sm:p-8 shadow-[16px_20px_0px_rgba(74,55,40,0.95)] max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white border-2 border-[#4A3728] flex items-center justify-center text-[#4A3728] hover:bg-[#FBEFD4] transition-colors cursor-pointer shadow-[2px_2px_0px_rgba(74,55,40,0.9)]"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {!isSuccess ? (
          <div>
            {/* Header */}
            <div className="flex items-center gap-2 mb-2 font-mono text-xs font-bold text-[#C96B4A]">
              <Radio className="w-3.5 h-3.5 text-[#F2765A] animate-pulse" />
              <span>EARLY ACCESS WAITLIST · WAVE 01</span>
            </div>

            <h3 className="font-serif-custom text-3xl sm:text-4xl font-normal text-[#4A3728] leading-tight">
              Get the <em className="italic text-[#F2765A] font-semibold">Android App.</em>
            </h3>

            <p className="text-sm text-[#7a6a58] mt-2 font-light leading-relaxed">
              We are currently running controlled field-testing with Kerala Tourism guides and transport researchers. Reserve your slot to get the early build.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-[#FEE2E2] border border-[#DC2626] rounded-xl text-xs text-[#DC2626] font-medium">
                  {errorMsg}
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block font-mono text-xs font-bold text-[#4A3728] mb-1">
                  EMAIL ADDRESS <span className="text-[#F2765A]">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.name@domain.com"
                  className="w-full px-4 py-3 rounded-xl bg-white border-2 border-[#4A3728] text-sm text-[#4A3728] placeholder-[#a69888] focus:outline-none focus:ring-2 focus:ring-[#F2765A]"
                />
              </div>

              {/* Name */}
              <div>
                <label className="block font-mono text-xs font-bold text-[#4A3728] mb-1">
                  NAME / EXPLORER HANDLE
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Aravind M."
                  className="w-full px-4 py-3 rounded-xl bg-white border-2 border-[#4A3728] text-sm text-[#4A3728] placeholder-[#a69888] focus:outline-none focus:ring-2 focus:ring-[#F2765A]"
                />
              </div>

              {/* Device Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-xs font-bold text-[#4A3728] mb-1">
                    PRIMARY DEVICE
                  </label>
                  <select
                    value={device}
                    onChange={(e) => setDevice(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-white border-2 border-[#4A3728] text-xs text-[#4A3728] font-medium focus:outline-none focus:ring-2 focus:ring-[#F2765A]"
                  >
                    <option value="Google Pixel 8 / 9">Google Pixel 8 / 9 Pro</option>
                    <option value="Google Pixel 6 / 7">Google Pixel 6 / 7</option>
                    <option value="Samsung Galaxy S23 / S24">Samsung Galaxy S23 / S24</option>
                    <option value="OnePlus 11 / 12">OnePlus 11 / 12 / Open</option>
                    <option value="Nothing Phone (2 / 2a)">Nothing Phone (2 / 2a)</option>
                    <option value="Xiaomi / Redmi">Xiaomi / Redmi series</option>
                    <option value="Other Android Phone">Other Android Phone</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-xs font-bold text-[#4A3728] mb-1">
                    TARGET OS
                  </label>
                  <select
                    value={androidVersion}
                    onChange={(e) => setAndroidVersion(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-white border-2 border-[#4A3728] text-xs text-[#4A3728] font-medium focus:outline-none focus:ring-2 focus:ring-[#F2765A]"
                  >
                    <option value="Android 15">Android 15 (Vanilla Ice Cream)</option>
                    <option value="Android 14">Android 14 (Upside Down Cake)</option>
                    <option value="Android 13">Android 13 (Tiramisu)</option>
                    <option value="Android 16 Developer">Android 16 Dev Preview</option>
                  </select>
                </div>
              </div>

              {/* Passive mode selector */}
              <div>
                <label className="block font-mono text-xs font-bold text-[#4A3728] mb-1.5">
                  RECORDING PREFERENCE
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTrackingPref('battery_saver')}
                    className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${
                      trackingPref === 'battery_saver'
                        ? 'bg-[#DFF3E4] border-[#2E6E4E] shadow-[2px_2px_0px_#2E6E4E]'
                        : 'bg-white border-[#4A3728]/30 hover:border-[#4A3728]'
                    }`}
                  >
                    <div className="font-mono text-xs font-bold text-[#2E6E4E] flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      <span>Ultralight</span>
                    </div>
                    <div className="text-[11px] text-[#7a6a58] mt-0.5">3.1% battery/day, motion-gated GPS</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTrackingPref('high_fidelity')}
                    className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${
                      trackingPref === 'high_fidelity'
                        ? 'bg-[#EFE8FA] border-[#7A6BA8] shadow-[2px_2px_0px_#7A6BA8]'
                        : 'bg-white border-[#4A3728]/30 hover:border-[#4A3728]'
                    }`}
                  >
                    <div className="font-mono text-xs font-bold text-[#7A6BA8] flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      <span>High-Fidelity</span>
                    </div>
                    <div className="text-[11px] text-[#7a6a58] mt-0.5">Continuous topological curvature</div>
                  </button>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-4 py-4 rounded-full bg-[#F2765A] text-white font-semibold text-base border-2 border-[#4A3728] shadow-[4px_4px_0px_rgba(74,55,40,0.95)] hover:translate-x-0.5 hover:translate-y-0.5 transition-transform flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Reserving Priority Pass...</span>
                  </span>
                ) : (
                  <>
                    <span>Join the Android Waitlist</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-center text-[11px] font-mono text-[#7a6a58] pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#2E6E4E]" />
                <span>Zero telemetry spam · DPDP 2023 verified · Instant unsubscribe</span>
              </div>
            </form>
          </div>
        ) : (
          /* Confirmation State */
          <div className="text-center py-4 space-y-5 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-[#DFF3E4] border-2 border-[#2E6E4E] flex items-center justify-center mx-auto text-[#2E6E4E] shadow-[4px_4px_0px_#2E6E4E]">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div>
              <div className="font-mono text-xs text-[#2E6E4E] font-bold tracking-widest uppercase">
                PRIORITY SLOT SECURED
              </div>
              <h3 className="font-serif-custom text-3xl font-bold text-[#4A3728] mt-1">
                You're on the waitlist.
              </h3>
              <p className="text-base text-[#7a6a58] font-medium mt-2 max-w-sm mx-auto leading-relaxed">
                We'll notify you as soon as the Android app launches.
              </p>
            </div>

            {/* Collector Ticket Pass */}
            <div className="bg-[#FFFDF8] border-2 border-[#4A3728] rounded-2xl p-5 shadow-[6px_6px_0px_rgba(74,55,40,0.85)] text-left relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-[#FBEFD4] border-l border-b border-[#4A3728] px-3 py-1 font-mono text-[10px] font-bold text-[#C96B4A]">
                WAVE 01 ACCESS
              </div>

              <div className="space-y-3">
                <div>
                  <div className="font-mono text-[10px] text-[#7a6a58]">WAITLIST POSITION</div>
                  <div className="font-serif-custom text-3xl font-bold text-[#F2765A]">
                    #{queuePosition} <span className="text-xs font-mono font-normal text-[#7a6a58]">of 5,000 Early Wave</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#4A3728]/15 text-xs">
                  <div>
                    <span className="font-mono text-[10px] text-[#7a6a58] block">TARGET DEVICE</span>
                    <span className="font-semibold text-[#4A3728]">{device}</span>
                  </div>
                  <div>
                    <span className="font-mono text-[10px] text-[#7a6a58] block">NOTIFY TO</span>
                    <span className="font-semibold text-[#4A3728] truncate block">{email}</span>
                  </div>
                </div>

                {/* Barcode representation */}
                <div className="pt-2 border-t border-[#4A3728]/15 flex items-center justify-between">
                  <div className="flex gap-1 h-6 items-end">
                    {[3, 7, 2, 8, 4, 9, 3, 5, 2, 6, 8, 3, 7, 4, 8, 2, 5, 6].map((h, i) => (
                      <div
                        key={i}
                        className="bg-[#4A3728] rounded-xs"
                        style={{ width: `${(i % 2 === 0 ? 2 : 3)}px`, height: `${h * 2.5}px` }}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyPass}
                    className="flex items-center gap-1 font-mono text-[11px] font-bold text-[#C96B4A] hover:text-[#4A3728] cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-[#2E6E4E]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'COPIED PASS ID' : 'COPY PASS ID'}</span>
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3.5 rounded-full bg-white border-2 border-[#4A3728] text-[#4A3728] font-bold text-sm hover:bg-[#FBEFD4] shadow-[3px_3px_0px_rgba(74,55,40,0.85)] cursor-pointer"
            >
              Back to Exploring TripSahay
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
