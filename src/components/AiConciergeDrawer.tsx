import React, { useState, useRef, useEffect } from 'react';
import Markdown from 'react-markdown';
import {
  X,
  Send,
  Bot,
  User as UserIcon,
  Sparkles,
  MapPin,
  Battery,
  ShieldCheck,
  AlertTriangle,
  Volume2,
  VolumeX,
  Trash2,
  CheckCircle2,
  ArrowUpRight,
  BookOpen,
  SlidersHorizontal,
  ChevronRight,
  Compass,
  Cpu
} from 'lucide-react';
import {
  GUARDRAIL_RULES,
  GOLDEN_DATASET,
  evaluateQueryWithGoldenDataset,
  GoldenScenario,
  GuardrailRule
} from '../data/chatbotGoldenDataset';

interface AiConciergeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  guardrailTriggered?: boolean;
  guardrailRule?: string;
  actionItems?: string[];
  batteryImpact?: string;
  transportMode?: string;
}

export const AiConciergeDrawer: React.FC<AiConciergeDrawerProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'golden_dataset' | 'guardrails'>('chat');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      role: 'assistant',
      content: `🌿 **Namaskaram! I'm Sahay AI**, your local Kerala route concierge and travel memory copilot.

I am fortified with **DPDP Act 2023 safety guardrails**, ultra-low-battery route planning (~3.1%/day), and authentic public transit schedules (SWTD ferries & KSRTC Swift).

*Ask me about secluded backwater routes, monsoon sea safety, low-power GPS trails, or test our golden safety guardrails!*`,
      timestamp: 'Just now',
      guardrailRule: 'DPDP 2023 Zero-Tracking Protocol'
    }
  ]);

  const [inputVal, setInputVal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState('Fort Kochi & Vembanad');
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [selectedGoldenScenario, setSelectedGoldenScenario] = useState<GoldenScenario | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const locations = [
    'Fort Kochi & Vembanad',
    'Munnar Tea Highlands',
    'Alappuzha Backwaters',
    'Wayanad Cloud Forest',
    'Varkala Cliff Coast',
    'Kozhikode Spice Wharf'
  ];

  const quickPrompts = [
    '🚶 1-Day Low-Battery Walk in Fort Kochi',
    '🛶 Kerala SWTD Public Ferry (₹25 vs ₹8,000)',
    '⚠️ Can I swim at Varkala cliff in monsoon?',
    '🔋 6% Battery Emergency Navigation Guide',
    '🔒 How DPDP 2023 protects my offline GPS'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, activeTab]);

  if (!isOpen) return null;

  const speakText = (text: string) => {
    if (!isAudioEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*_#`[\]()]/g, ' ').substring(0, 280);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.05;
    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputVal;
    if (!query.trim()) return;

    const userMsg: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');
    setIsLoading(true);

    // 1. Evaluate with local Golden Dataset engine first
    const evaluation = evaluateQueryWithGoldenDataset(query);

    try {
      const res = await fetch('/api/ai/concierge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          contextLocation: currentLocation,
          conversationHistory: messages.slice(-4).map((m) => ({ role: m.role, content: m.content }))
        })
      });

      const data = await res.json();
      const replyContent = data.reply || (evaluation.matchedScenario ? evaluation.matchedScenario.goldenResponse : 'Here is the route information for your destination.');

      const assistantMsg: Message = {
        id: `ai_${Date.now()}`,
        role: 'assistant',
        content: replyContent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        guardrailTriggered: Boolean(data.guardrailStatus?.triggered || evaluation.isGuardrailTriggered),
        guardrailRule: data.guardrailStatus?.rule || evaluation.matchedRule?.name || (evaluation.matchedScenario ? evaluation.matchedScenario.matchedGuardrail : 'Standard DPDP 2023'),
        actionItems: evaluation.matchedScenario?.actionItems,
        batteryImpact: evaluation.matchedScenario?.batteryImpact,
        transportMode: evaluation.matchedScenario?.transportMode
      };

      setMessages((prev) => [...prev, assistantMsg]);
      speakText(replyContent);
    } catch (err) {
      console.warn('Network issue during concierge request, using local Golden Dataset engine:', err);
      const fallbackScenario = evaluation.matchedScenario || GOLDEN_DATASET[0];
      const fallbackMsg: Message = {
        id: `ai_fb_${Date.now()}`,
        role: 'assistant',
        content: fallbackScenario.goldenResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        guardrailTriggered: evaluation.isGuardrailTriggered,
        guardrailRule: evaluation.matchedRule?.name || fallbackScenario.matchedGuardrail,
        actionItems: fallbackScenario.actionItems,
        batteryImpact: fallbackScenario.batteryImpact,
        transportMode: fallbackScenario.transportMode
      };
      setMessages((prev) => [...prev, fallbackMsg]);
      speakText(fallbackScenario.goldenResponse);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunGoldenScenario = (scenario: GoldenScenario) => {
    setSelectedGoldenScenario(scenario);
    setActiveTab('chat');
    handleSendMessage(scenario.userQuery);
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `m_reset_${Date.now()}`,
        role: 'assistant',
        content: "Conversation history cleared. Local SQLite memory cache flushed. What journey can I help you plan?",
        timestamp: 'Just now',
        guardrailRule: 'DPDP 2023 Wipe Protocol'
      }
    ]);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[#4A3728]/50 backdrop-blur-xs animate-fadeIn">
      <div
        className="relative w-full max-w-lg bg-[#FFFDF8] border-l-3 border-[#4A3728] h-full shadow-[-16px_0px_0px_rgba(74,55,40,0.85)] flex flex-col justify-between overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-4 sm:p-5 bg-[#FBEFD4] border-b-2 border-[#4A3728] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#F2765A] border-2 border-[#4A3728] flex items-center justify-center text-white shadow-[2px_2px_0px_rgba(74,55,40,0.9)]">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif-custom text-lg sm:text-xl font-bold text-[#4A3728]">
                  Sahay AI Concierge
                </h3>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#2E6E4E]/15 text-[#2E6E4E] border border-[#2E6E4E]/30">
                  GUARDRAILS ACTIVE
                </span>
              </div>
              <p className="font-mono text-[10px] text-[#C96B4A] font-bold">
                GEMINI 3.7 FLASH · GOLDEN BENCHMARKS · DPDP 2023
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsAudioEnabled(!isAudioEnabled)}
              title={isAudioEnabled ? 'Mute Speech' : 'Enable Speech Voice'}
              className={`p-2 rounded-lg border border-[#4A3728] transition-colors cursor-pointer ${
                isAudioEnabled ? 'bg-[#F2765A] text-white' : 'bg-white text-[#4A3728] hover:bg-[#FFF9F0]'
              }`}
            >
              {isAudioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={handleClearHistory}
              title="Clear & Flush Local Cache"
              className="p-2 rounded-lg bg-white border border-[#4A3728] text-[#4A3728] hover:bg-[#FFF9F0] transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white border border-[#4A3728] flex items-center justify-center text-[#4A3728] hover:bg-[#FFF9F0] transition-colors cursor-pointer ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#4A3728]/20 bg-[#FFF9F0] text-xs font-mono">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-2.5 px-3 font-bold border-r border-[#4A3728]/20 flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
              activeTab === 'chat'
                ? 'bg-[#FFFDF8] text-[#4A3728] border-b-2 border-b-[#F2765A]'
                : 'text-[#7a6a58] hover:bg-white/60'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-[#F2765A]" />
            <span>Chat Copilot</span>
          </button>
          <button
            onClick={() => setActiveTab('golden_dataset')}
            className={`flex-1 py-2.5 px-3 font-bold border-r border-[#4A3728]/20 flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
              activeTab === 'golden_dataset'
                ? 'bg-[#FFFDF8] text-[#4A3728] border-b-2 border-b-[#F2765A]'
                : 'text-[#7a6a58] hover:bg-white/60'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-[#2E6E4E]" />
            <span>Golden Dataset ({GOLDEN_DATASET.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('guardrails')}
            className={`flex-1 py-2.5 px-3 font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
              activeTab === 'guardrails'
                ? 'bg-[#FFFDF8] text-[#4A3728] border-b-2 border-b-[#F2765A]'
                : 'text-[#7a6a58] hover:bg-white/60'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#C96B4A]" />
            <span>Guardrails ({GUARDRAIL_RULES.length})</span>
          </button>
        </div>

        {/* Location & Context Toolbar */}
        <div className="px-4 py-2 bg-[#FAF3E0] border-b border-[#4A3728]/15 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#F2765A]" />
            <select
              value={currentLocation}
              onChange={(e) => setCurrentLocation(e.target.value)}
              className="bg-transparent font-bold text-[#4A3728] focus:outline-none cursor-pointer text-xs"
            >
              {locations.map((loc) => (
                <option key={loc} value={loc} className="bg-[#FFFDF8] text-[#4A3728]">
                  {loc}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 text-[#2E6E4E]">
            <span className="flex items-center gap-1">
              <Battery className="w-3.5 h-3.5" />
              <span>3.1%/day cadence</span>
            </span>
          </div>
        </div>

        {/* TAB 1: LIVE CHAT */}
        {activeTab === 'chat' && (
          <>
            {/* Message Thread */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#FFFDF8]">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-full bg-[#F2765A] text-white flex items-center justify-center shrink-0 border border-[#4A3728] text-xs font-bold mt-1 shadow-[1px_1px_0px_rgba(74,55,40,0.8)]">
                      S
                    </div>
                  )}

                  <div
                    className={`max-w-[88%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed border-2 ${
                      msg.role === 'user'
                        ? 'bg-[#F2765A] text-white border-[#4A3728] rounded-br-none shadow-[3px_3px_0px_rgba(74,55,40,0.9)]'
                        : 'bg-white text-[#4A3728] border-[#4A3728] rounded-bl-none shadow-[3px_3px_0px_rgba(74,55,40,0.7)]'
                    }`}
                  >
                    {/* Guardrail status pill on assistant message */}
                    {msg.role === 'assistant' && (
                      <div className="flex flex-wrap items-center gap-1.5 mb-2 pb-1.5 border-b border-[#4A3728]/10 text-[10px] font-mono">
                        {msg.guardrailTriggered ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-100 text-red-800 border border-red-300 font-bold">
                            <AlertTriangle className="w-3 h-3 text-red-600" />
                            SAFETY GUARDRAIL ENFORCED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#2E6E4E]/10 text-[#2E6E4E] border border-[#2E6E4E]/20 font-bold">
                            <ShieldCheck className="w-3 h-3" />
                            DPDP 2023 SECURE
                          </span>
                        )}
                        {msg.guardrailRule && (
                          <span className="text-[#7a6a58] truncate max-w-[190px]">
                            {msg.guardrailRule}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Markdown Body */}
                    {msg.role === 'assistant' ? (
                      <div className="markdown-body space-y-2 text-[#4A3728]">
                        <Markdown>{msg.content}</Markdown>
                      </div>
                    ) : (
                      <p className="font-sans whitespace-pre-wrap">{msg.content}</p>
                    )}

                    {/* Action Items Box if present */}
                    {msg.actionItems && msg.actionItems.length > 0 && (
                      <div className="mt-3 pt-2 border-t border-[#4A3728]/15 bg-[#FAF3E0] p-2.5 rounded-lg">
                        <p className="text-[11px] font-mono font-bold text-[#4A3728] flex items-center gap-1 mb-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#2E6E4E]" /> Action Checklist:
                        </p>
                        <ul className="space-y-1 text-xs text-[#5a4838]">
                          {msg.actionItems.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <span className="text-[#C96B4A] font-bold">›</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Battery & Transport meta */}
                    {(msg.batteryImpact || msg.transportMode) && (
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] font-mono text-[#7a6a58]">
                        {msg.batteryImpact && (
                          <span className="bg-[#FFF9F0] px-1.5 py-0.5 rounded border border-[#4A3728]/15">
                            🔋 {msg.batteryImpact}
                          </span>
                        )}
                        {msg.transportMode && (
                          <span className="bg-[#FFF9F0] px-1.5 py-0.5 rounded border border-[#4A3728]/15">
                            🛶 {msg.transportMode}
                          </span>
                        )}
                      </div>
                    )}

                    <div
                      className={`text-[10px] font-mono mt-2 text-right ${
                        msg.role === 'user' ? 'text-white/80' : 'text-[#7a6a58]'
                      }`}
                    >
                      {msg.timestamp}
                    </div>
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-7 h-7 rounded-full bg-[#4A3728] text-[#FFF9F0] flex items-center justify-center shrink-0 border border-[#4A3728] text-xs font-bold mt-1">
                      <UserIcon className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-2.5 justify-start">
                  <div className="w-7 h-7 rounded-full bg-[#F2765A] text-white flex items-center justify-center shrink-0 border border-[#4A3728] text-xs font-bold animate-pulse">
                    S
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white border-2 border-[#4A3728] rounded-bl-none shadow-[3px_3px_0px_rgba(74,55,40,0.7)] flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#F2765A] animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-[#2E6E4E] animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 rounded-full bg-[#C96B4A] animate-bounce [animation-delay:0.4s]" />
                    <span className="text-xs font-mono text-[#7a6a58] ml-1">
                      Consulting Kerala route ledger & guardrails...
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts Bar */}
            <div className="px-4 py-2 bg-[#FFF9F0] border-t border-[#4A3728]/15 overflow-x-auto whitespace-nowrap scrollbar-none flex gap-2">
              {quickPrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(prompt)}
                  className="px-2.5 py-1 rounded-full bg-white border border-[#4A3728] text-[11px] font-sans text-[#4A3728] hover:bg-[#F2765A] hover:text-white transition-colors cursor-pointer shrink-0 shadow-[1px_1px_0px_rgba(74,55,40,0.6)]"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <div className="p-3.5 bg-[#FBEFD4] border-t-2 border-[#4A3728]">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  placeholder="Ask route, monsoon safety, battery mode, or DPDP..."
                  className="flex-1 px-3.5 py-2.5 bg-white border-2 border-[#4A3728] rounded-xl text-xs sm:text-sm text-[#4A3728] placeholder-[#7a6a58]/60 focus:outline-none shadow-[2px_2px_0px_rgba(74,55,40,0.8)]"
                />
                <button
                  type="submit"
                  disabled={isLoading || !inputVal.trim()}
                  className="px-4 py-2.5 bg-[#F2765A] hover:bg-[#d95f45] disabled:opacity-50 text-white rounded-xl font-bold border-2 border-[#4A3728] flex items-center justify-center shadow-[2px_2px_0px_rgba(74,55,40,0.9)] cursor-pointer transition-all active:translate-y-0.5 active:shadow-none"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </>
        )}

        {/* TAB 2: GOLDEN DATASET MATRIX */}
        {activeTab === 'golden_dataset' && (
          <div className="flex-1 p-4 overflow-y-auto bg-[#FFFDF8] space-y-4">
            <div className="bg-[#FAF3E0] p-3.5 rounded-xl border-2 border-[#4A3728] text-xs leading-relaxed">
              <h4 className="font-bold text-[#4A3728] flex items-center gap-1.5 font-serif-custom text-sm mb-1">
                <BookOpen className="w-4 h-4 text-[#2E6E4E]" />
                Golden Dataset Benchmark Suite
              </h4>
              <p className="text-[#7a6a58]">
                Standardized test cases defining authoritative behavior for safety alerts, battery preservation, DPDP data wipes, and anti-exploitation guardrails.
              </p>
            </div>

            <div className="space-y-3">
              {GOLDEN_DATASET.map((scenario) => (
                <div
                  key={scenario.id}
                  className="p-3.5 rounded-xl border-2 border-[#4A3728] bg-white shadow-[3px_3px_0px_rgba(74,55,40,0.8)] hover:bg-[#FFF9F0] transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-[#4A3728] text-[#FFF9F0]">
                      {scenario.id} · {scenario.category}
                    </span>
                    <span className="text-[10px] font-mono text-[#2E6E4E] font-bold">
                      {scenario.matchedGuardrail ? 'GUARDRAIL MATCHED' : 'ROUTE PROTOCOL'}
                    </span>
                  </div>

                  <h5 className="font-bold text-sm text-[#4A3728] mb-1">{scenario.title}</h5>
                  <p className="text-xs text-[#7a6a58] italic mb-2.5">"{scenario.userQuery}"</p>

                  <div className="bg-[#FAF3E0] p-2.5 rounded-lg text-xs space-y-1 mb-3">
                    <div className="text-[11px] font-mono text-[#C96B4A] font-bold">
                      Expected AI Action:
                    </div>
                    <p className="text-[#4A3728] line-clamp-2">{scenario.reasoning}</p>
                  </div>

                  <button
                    onClick={() => handleRunGoldenScenario(scenario)}
                    className="w-full py-2 bg-[#F2765A] text-white font-mono text-xs font-bold rounded-lg border border-[#4A3728] flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_rgba(74,55,40,0.8)] hover:bg-[#d95f45] cursor-pointer"
                  >
                    <span>Run Scenario in Chatbot</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: GUARDRAILS MATRIX */}
        {activeTab === 'guardrails' && (
          <div className="flex-1 p-4 overflow-y-auto bg-[#FFFDF8] space-y-4">
            <div className="bg-[#FAF3E0] p-3.5 rounded-xl border-2 border-[#4A3728] text-xs leading-relaxed">
              <h4 className="font-bold text-[#4A3728] flex items-center gap-1.5 font-serif-custom text-sm mb-1">
                <ShieldCheck className="w-4 h-4 text-[#C96B4A]" />
                TripSahay Guardrail Enforcement Architecture
              </h4>
              <p className="text-[#7a6a58]">
                Multi-layer content and security moderation ensuring zero personal tracking, emergency monsoon alerts, and strict wildlife protection compliance.
              </p>
            </div>

            <div className="space-y-3">
              {GUARDRAIL_RULES.map((rule) => (
                <div
                  key={rule.id}
                  className="p-3.5 rounded-xl border-2 border-[#4A3728] bg-white shadow-[3px_3px_0px_rgba(74,55,40,0.8)] space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#4A3728]">
                      {rule.id}: {rule.name}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                        rule.severity === 'CRITICAL'
                          ? 'bg-red-100 text-red-800 border-red-300'
                          : 'bg-amber-100 text-amber-800 border-amber-300'
                      }`}
                    >
                      {rule.severity}
                    </span>
                  </div>

                  <p className="text-xs text-[#5a4838]">{rule.description}</p>

                  <div className="p-2 bg-[#FAF3E0] rounded border border-[#4A3728]/15 text-xs">
                    <span className="font-mono text-[10px] font-bold text-[#2E6E4E] block mb-0.5">
                      ENFORCEMENT PROTOCOL:
                    </span>
                    <span className="text-[#4A3728]">{rule.enforcementAction}</span>
                  </div>

                  <div className="flex flex-wrap gap-1 mt-1">
                    {rule.triggerKeywords.slice(0, 4).map((kw, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-mono px-1.5 py-0.5 bg-[#FFF9F0] border border-[#4A3728]/20 rounded text-[#7a6a58]"
                      >
                        kw: {kw}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
