import React, { useState } from 'react';
import { X, Upload, Camera, Sparkles, Image as ImageIcon, Check, Copy, Palette, Stamp } from 'lucide-react';
import confetti from 'canvas-confetti';

interface AiVisionPostcardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AiVisionPostcardModal: React.FC<AiVisionPostcardModalProps> = ({ isOpen, onClose }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState<string>('Sunset over Alleppey backwaters with traditional wooden kettuvallam');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const sampleScenes = [
    {
      title: 'Alleppey Backwaters',
      desc: 'Twilight over Vembanad lake with traditional wooden boat and coconut palms',
      preview: '🌅'
    },
    {
      title: 'Munnar Tea Highlands',
      desc: 'Rolling emerald mist canopy over 1600m tea plantations in Western Ghats',
      preview: '🍃'
    },
    {
      title: 'Fort Kochi Chinese Nets',
      desc: 'Giant cantilevered teak fishing nets silhouetted against crimson monsoon sky',
      preview: '⚓'
    }
  ];

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async (promptOverride?: string) => {
    setIsLoading(true);
    const activePrompt = promptOverride || customPrompt;

    try {
      const res = await fetch('/api/ai/vision-postcard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: selectedImage,
          imagePrompt: activePrompt,
          mimeType: 'image/jpeg'
        })
      });

      const data = await res.json();
      if (data.postcard) {
        setResult(data.postcard);
        confetti({
          particleCount: 65,
          spread: 70,
          origin: { y: 0.6 },
          colors: data.postcard.risographInks || ['#F2765A', '#BFE3CE', '#7A6BA8']
        });
      }
    } catch (err) {
      console.error('Vision analysis error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#4A3728]/70 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-3xl bg-[#FFF9F0] border-3 border-[#4A3728] rounded-3xl p-6 sm:p-8 shadow-[18px_22px_0px_rgba(74,55,40,0.95)] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white border-2 border-[#4A3728] flex items-center justify-center text-[#4A3728] hover:bg-[#FBEFD4] transition-colors cursor-pointer shadow-[2px_2px_0px_rgba(74,55,40,0.9)]"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-2 font-mono text-xs font-bold text-[#C96B4A]">
          <Camera className="w-3.5 h-3.5 text-[#F2765A]" />
          <span>GEMINI 2.5 FLASH VISION · RISOGRAPH MEMORY MAKER</span>
        </div>

        <h3 className="font-serif-custom text-3xl sm:text-4xl text-[#4A3728] font-normal leading-tight">
          Visual Postcard <em className="italic text-[#F2765A] font-semibold">Extractor.</em>
        </h3>

        <p className="text-xs sm:text-sm text-[#7a6a58] mt-1 font-light leading-relaxed max-w-xl">
          Upload any journey photo or select an iconic landscape. Gemini extracts chromatic ink separations, atmospheric notes, and authentic postal cancellation marks.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-6">
          {/* Left Column: Image or Sample Selector */}
          <div className="md:col-span-5 space-y-4">
            {/* Upload Area */}
            <div className="bg-white/80 p-4 rounded-2xl border-2 border-dashed border-[#4A3728] text-center relative hover:bg-[#FFFDF8] transition-colors">
              {selectedImage ? (
                <div className="relative">
                  <img
                    src={selectedImage}
                    alt="Travel Memory"
                    className="w-full h-36 object-cover rounded-xl border border-[#4A3728]"
                  />
                  <button
                    type="button"
                    onClick={() => setSelectedImage(null)}
                    className="absolute top-2 right-2 bg-[#4A3728] text-white p-1 rounded-full text-xs"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer block py-4">
                  <Upload className="w-8 h-8 mx-auto text-[#F2765A] mb-2" />
                  <span className="font-serif-custom text-base font-bold text-[#4A3728] block">
                    Upload Travel Photo
                  </span>
                  <span className="font-mono text-[10px] text-[#7a6a58] block mt-1">
                    JPEG, PNG up to 10MB
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Quick Sample Scenes */}
            <div className="space-y-2">
              <span className="font-mono text-[10px] font-bold text-[#7a6a58] block">
                OR CHOOSE A SCENIC REFERENCE
              </span>
              <div className="space-y-1.5">
                {sampleScenes.map((scene, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setCustomPrompt(scene.desc);
                      handleAnalyze(scene.desc);
                    }}
                    className="w-full p-2.5 bg-white border border-[#4A3728]/30 rounded-xl text-left hover:border-[#4A3728] hover:bg-[#FFFDF8] transition-all flex items-center gap-2.5 cursor-pointer"
                  >
                    <span className="text-xl">{scene.preview}</span>
                    <div className="overflow-hidden">
                      <div className="font-serif-custom text-xs font-bold text-[#4A3728] truncate">
                        {scene.title}
                      </div>
                      <div className="text-[10px] text-[#7a6a58] truncate">{scene.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => handleAnalyze()}
              disabled={isLoading}
              className="w-full py-3.5 rounded-full bg-[#F2765A] text-white font-semibold text-xs border-2 border-[#4A3728] shadow-[3px_3px_0px_rgba(74,55,40,0.95)] hover:translate-x-0.5 hover:translate-y-0.5 transition-transform flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
            >
              {isLoading ? (
                <span className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Extracting Risograph Inks...</span>
                </span>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Synthesize Risograph Postcard</span>
                </>
              )}
            </button>
          </div>

          {/* Right Column: Output Risograph Card */}
          <div className="md:col-span-7">
            {result ? (
              <div className="bg-[#FFFDF8] border-2 border-[#4A3728] rounded-2xl p-6 shadow-[8px_8px_0px_rgba(74,55,40,0.85)] space-y-4 animate-fadeIn">
                <div className="flex items-start justify-between border-b border-[#4A3728]/15 pb-3">
                  <div>
                    <span className="font-mono text-[10px] text-[#2E6E4E] font-bold uppercase bg-[#DFF3E4] px-2 py-0.5 rounded border border-[#2E6E4E]/30">
                      {result.locationGuess || 'KERALA COAST'}
                    </span>
                    <h4 className="font-serif-custom text-2xl font-bold text-[#4A3728] mt-1">
                      {result.title}
                    </h4>
                    <p className="text-xs text-[#7a6a58] italic mt-0.5">{result.vibe}</p>
                  </div>

                  {/* Stamp */}
                  <div className="w-14 h-14 border-2 border-dashed border-[#F2765A] rounded-full flex flex-col items-center justify-center text-center p-1 transform rotate-6">
                    <Stamp className="w-4 h-4 text-[#F2765A]" />
                    <span className="font-mono text-[6px] font-bold text-[#4A3728] leading-tight mt-0.5">
                      PASSIVE LOG
                    </span>
                  </div>
                </div>

                {/* Inks Swatch */}
                {result.risographInks && (
                  <div className="flex items-center gap-2 p-2 bg-[#FBEFD4]/60 rounded-xl border border-[#4A3728]/20">
                    <Palette className="w-4 h-4 text-[#C96B4A]" />
                    <span className="font-mono text-[10px] font-bold text-[#4A3728]">
                      SEPARATION INKS:
                    </span>
                    <div className="flex gap-1.5">
                      {result.risographInks.map((ink: string, i: number) => (
                        <div key={i} className="flex items-center gap-1">
                          <div
                            className="w-4 h-4 rounded-full border border-[#4A3728]"
                            style={{ backgroundColor: ink }}
                          />
                          <span className="font-mono text-[9px] text-[#7a6a58]">{ink}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Story Note */}
                <div className="text-xs sm:text-sm text-[#7a6a58] font-light leading-relaxed whitespace-pre-line bg-white/70 p-4 rounded-xl border border-[#4A3728]/15">
                  {result.visualStory}
                </div>

                {/* Postal Mark */}
                <div className="font-mono text-[11px] text-[#4A3728] font-bold text-center tracking-widest border-t-2 border-b-2 border-[#4A3728]/20 py-1.5 uppercase">
                  {result.stampTagline || 'ARCHIVED AT SEA LEVEL · KERALA 2026'}
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${result.title}\n\n${result.visualStory}\n\n${result.stampTagline}`);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="flex items-center gap-1 font-mono text-xs font-bold text-[#C96B4A] hover:text-[#4A3728] cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-[#2E6E4E]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'COPIED POSTCARD' : 'COPY POSTCARD NOTE'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[260px] border-2 border-dashed border-[#4A3728]/30 rounded-2xl p-8 flex flex-col items-center justify-center text-center text-[#7a6a58] space-y-3 bg-[#FFFDF8]/50">
                <div className="w-12 h-12 rounded-full bg-[#EFE8FA] border border-[#4A3728]/20 flex items-center justify-center text-[#7A6BA8]">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <div className="font-serif-custom text-xl text-[#4A3728]">
                  No postcard extracted yet
                </div>
                <p className="text-xs max-w-xs font-light">
                  Pick a sample scene or upload your own photo to generate a 3-color Risograph memory card.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
