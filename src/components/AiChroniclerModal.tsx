import React, { useState } from 'react';
import { X, Sparkles, BookOpen, Share2, Copy, Check, Feather, CloudRain, Compass, Leaf, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { saveAIStoryToFirestore, User } from '../lib/firebase';
import { Trip } from '../types';

interface AiChroniclerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTrip?: Trip | null;
  currentUser?: User | null;
}

export const AiChroniclerModal: React.FC<AiChroniclerModalProps> = ({
  isOpen,
  onClose,
  selectedTrip,
  currentUser
}) => {
  const [tripTitle, setTripTitle] = useState(selectedTrip?.title || 'Backwaters Ferry & Fort Kochi Walk');
  const [year, setYear] = useState(selectedTrip?.year || 2024);
  const [distanceKm, setDistanceKm] = useState(selectedTrip?.distanceKm || 38.4);
  const [days, setDays] = useState(selectedTrip?.days || 2);
  const [category, setCategory] = useState(selectedTrip?.category || 'FERRY');
  const [style, setStyle] = useState('monsoon_poetics');
  const [customNotes, setCustomNotes] = useState('Evening rain over Vembanad Lake, fragrance of roasted tea leaves and cardamoms, quiet temple bell chiming');
  
  const [isLoading, setIsLoading] = useState(false);
  const [storyResult, setStoryResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [savedToCloud, setSavedToCloud] = useState(false);

  if (!isOpen) return null;

  const handleSynthesize = async () => {
    setIsLoading(true);
    setSavedToCloud(false);

    try {
      const res = await fetch('/api/ai/synthesize-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tripTitle,
          year,
          distanceKm,
          days,
          category,
          literaryStyle: style,
          customNotes,
          waypoints: [
            'Mattancherry Jew Town',
            'David Hall Art Gallery',
            'Vembanad Waterway Lock 3',
            'Kavvayi Backwater Channel',
            'Fort Kochi Beach Sunset'
          ]
        })
      });

      const data = await res.json();
      if (data.story) {
        setStoryResult(data.story);
        confetti({
          particleCount: 75,
          spread: 70,
          origin: { y: 0.6 },
          colors: data.story.risographPalette || ['#F2765A', '#BFE3CE', '#D9C7EE']
        });
      }
    } catch (err) {
      console.error('Synthesis error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToCloud = async () => {
    if (!storyResult) return;
    try {
      await saveAIStoryToFirestore(currentUser?.uid || 'guest', {
        tripTitle,
        year,
        distanceKm,
        story: storyResult,
        style,
      });
      setSavedToCloud(true);
      setTimeout(() => setSavedToCloud(false), 3000);
    } catch (err) {
      console.error('Error saving to cloud:', err);
    }
  };

  const handleCopyStory = () => {
    if (!storyResult) return;
    const text = `${storyResult.headline}\n\n${storyResult.narrative}\n\n${storyResult.postalStampBlurb}\n\n${storyResult.malayalamPhrase}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#4A3728]/70 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-3xl bg-[#FFF9F0] border-3 border-[#4A3728] rounded-3xl p-6 sm:p-8 shadow-[18px_22px_0px_rgba(74,55,40,0.95)] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white border-2 border-[#4A3728] flex items-center justify-center text-[#4A3728] hover:bg-[#FBEFD4] transition-colors cursor-pointer shadow-[2px_2px_0px_rgba(74,55,40,0.9)]"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-2 mb-2 font-mono text-xs font-bold text-[#C96B4A]">
          <Sparkles className="w-3.5 h-3.5 text-[#F2765A]" />
          <span>GEMINI 2.5 FLASH · AI TRAVEL CHRONICLER</span>
        </div>

        <h3 className="font-serif-custom text-3xl sm:text-4xl text-[#4A3728] font-normal leading-tight">
          Synthesize <em className="italic text-[#F2765A] font-semibold">Travel Chronicle.</em>
        </h3>

        <p className="text-xs sm:text-sm text-[#7a6a58] mt-1 font-light max-w-xl leading-relaxed">
          Transform raw passive GPS waypoint sequences into poetic, cultural Risograph journal logs with local folklore connections.
        </p>

        {/* Form Inputs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mt-6">
          {/* Controls Column */}
          <div className="md:col-span-5 space-y-3.5 bg-white/70 p-4 rounded-2xl border-2 border-[#4A3728]/20">
            <div>
              <label className="block font-mono text-[11px] font-bold text-[#4A3728] mb-1">
                JOURNEY TITLE
              </label>
              <input
                type="text"
                value={tripTitle}
                onChange={(e) => setTripTitle(e.target.value)}
                className="w-full px-3 py-2 bg-white border-2 border-[#4A3728] rounded-xl text-xs text-[#4A3728] font-medium focus:outline-none focus:ring-2 focus:ring-[#F2765A]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-mono text-[10px] font-bold text-[#4A3728] mb-1">
                  DISTANCE (KM)
                </label>
                <input
                  type="number"
                  value={distanceKm}
                  onChange={(e) => setDistanceKm(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-white border-2 border-[#4A3728] rounded-xl text-xs text-[#4A3728] font-medium focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-mono text-[10px] font-bold text-[#4A3728] mb-1">
                  YEAR
                </label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-white border-2 border-[#4A3728] rounded-xl text-xs text-[#4A3728] font-medium focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-mono text-[10px] font-bold text-[#4A3728] mb-1">
                LITERARY AESTHETIC
              </label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full px-3 py-2 bg-white border-2 border-[#4A3728] rounded-xl text-xs text-[#4A3728] font-medium focus:outline-none"
              >
                <option value="monsoon_poetics">Monsoon Poetics &amp; Rain Nostalgia</option>
                <option value="risograph_chronicler">Risograph Printmaker &amp; Colorist</option>
                <option value="backwater_naturalist">Vembanad Naturalist &amp; Waterways</option>
                <option value="heritage_ledger">Heritage Ledger &amp; Spice Port History</option>
                <option value="minimalist_wanderer">Minimalist Stride &amp; Low-Carbon</option>
              </select>
            </div>

            <div>
              <label className="block font-mono text-[10px] font-bold text-[#4A3728] mb-1">
                SENSORY CUES / NOTES
              </label>
              <textarea
                rows={2}
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                placeholder="Monsoon petrichor, wood smoke, bell tolls..."
                className="w-full px-3 py-2 bg-white border-2 border-[#4A3728] rounded-xl text-xs text-[#4A3728] focus:outline-none resize-none"
              />
            </div>

            <button
              onClick={handleSynthesize}
              disabled={isLoading}
              className="w-full py-3 rounded-full bg-[#F2765A] text-white font-semibold text-xs border-2 border-[#4A3728] shadow-[3px_3px_0px_rgba(74,55,40,0.95)] hover:translate-x-0.5 hover:translate-y-0.5 transition-transform flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
            >
              {isLoading ? (
                <span className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Gemini Composing...</span>
                </span>
              ) : (
                <>
                  <Feather className="w-3.5 h-3.5" />
                  <span>Synthesize with Gemini</span>
                </>
              )}
            </button>
          </div>

          {/* Results Output Column */}
          <div className="md:col-span-7">
            {storyResult ? (
              <div className="bg-[#FFFDF8] border-2 border-[#4A3728] rounded-2xl p-6 shadow-[6px_6px_0px_rgba(74,55,40,0.85)] space-y-4 animate-fadeIn">
                {/* Header with Palette */}
                <div className="flex items-start justify-between border-b border-[#4A3728]/15 pb-3">
                  <div>
                    <span className="font-mono text-[10px] text-[#C96B4A] font-bold uppercase tracking-wider">
                      SYNTHESIZED CHRONICLE
                    </span>
                    <h4 className="font-serif-custom text-2xl font-bold text-[#4A3728] leading-tight mt-0.5">
                      {storyResult.headline}
                    </h4>
                  </div>
                  {/* Risograph Palette Swatch */}
                  {storyResult.risographPalette && (
                    <div className="flex gap-1">
                      {storyResult.risographPalette.map((col: string, i: number) => (
                        <div
                          key={i}
                          className="w-4 h-7 rounded-md border border-[#4A3728]/30 shadow-xs"
                          style={{ backgroundColor: col }}
                          title={`Risograph Ink #${i + 1}: ${col}`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Narrative Body */}
                <div className="text-xs sm:text-sm text-[#7a6a58] font-light leading-relaxed whitespace-pre-line space-y-2">
                  {storyResult.narrative}
                </div>

                {/* Malayalam Proverb & Cultural Footprints */}
                <div className="bg-[#FBEFD4] p-3.5 rounded-xl border border-[#4A3728]/20 space-y-2">
                  {storyResult.malayalamPhrase && (
                    <div className="font-serif-custom text-sm font-semibold text-[#4A3728] italic">
                      "{storyResult.malayalamPhrase}"
                    </div>
                  )}
                  {storyResult.culturalFootprints && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {storyResult.culturalFootprints.map((footprint: string, i: number) => (
                        <span
                          key={i}
                          className="bg-white/90 text-[#4A3728] font-mono text-[10px] px-2 py-0.5 rounded-md border border-[#4A3728]/20"
                        >
                          ✦ {footprint}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Carbon and Stamp Inscription */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono text-[#7a6a58] pt-1">
                  <div className="bg-[#DFF3E4] p-2 rounded-lg border border-[#2E6E4E]/30 text-[#2E6E4E]">
                    <Leaf className="w-3 h-3 inline mr-1" />
                    <span>{storyResult.carbonAndBatteryReport || 'Passive GPS · 2.8% Battery/day'}</span>
                  </div>
                  <div className="bg-[#EFE8FA] p-2 rounded-lg border border-[#7A6BA8]/30 text-[#7A6BA8]">
                    <Compass className="w-3 h-3 inline mr-1" />
                    <span className="italic">{storyResult.postalStampBlurb || 'Every footprint remembered.'}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-[#4A3728]/15">
                  <button
                    onClick={handleSaveToCloud}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#4A3728] rounded-lg font-mono text-xs font-bold text-[#4A3728] hover:bg-[#FBEFD4] cursor-pointer"
                  >
                    {savedToCloud ? <Check className="w-3.5 h-3.5 text-[#2E6E4E]" /> : <BookOpen className="w-3.5 h-3.5 text-[#F2765A]" />}
                    <span>{savedToCloud ? 'SAVED TO FIRESTORE' : 'SAVE TO FIRESTORE'}</span>
                  </button>

                  <button
                    onClick={handleCopyStory}
                    className="flex items-center gap-1.5 font-mono text-xs font-bold text-[#C96B4A] hover:text-[#4A3728] cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-[#2E6E4E]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'COPIED TO CLIPBOARD' : 'COPY TEXT'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[300px] border-2 border-dashed border-[#4A3728]/30 rounded-2xl p-8 flex flex-col items-center justify-center text-center text-[#7a6a58] space-y-3 bg-[#FFFDF8]/50">
                <div className="w-12 h-12 rounded-full bg-[#FBEFD4] border border-[#4A3728]/20 flex items-center justify-center text-[#F2765A]">
                  <Feather className="w-6 h-6" />
                </div>
                <div className="font-serif-custom text-xl text-[#4A3728]">
                  Ready to weave your memories
                </div>
                <p className="text-xs max-w-xs font-light">
                  Click <b>"Synthesize with Gemini"</b> to craft a custom Risograph travel essay from your waypoints.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
