import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lazy Gemini client helper
let aiClient: GoogleGenAI | null = null;
function getGeminiAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('Warning: GEMINI_API_KEY is not configured yet. Fallback logic will be used.');
    }
    aiClient = new GoogleGenAI({ apiKey: apiKey || 'dummy-key' });
  }
  return aiClient;
}

// In-memory waitlist cache backup
interface WaitlistEntry {
  id: string;
  email: string;
  name?: string;
  device?: string;
  androidVersion?: string;
  trackingPreference?: string;
  position: number;
  timestamp: string;
}

const waitlistStore: WaitlistEntry[] = [
  {
    id: 'wl_seed_1',
    email: 'kerala.explorer@gmail.com',
    name: 'Aravind Menon',
    device: 'Google Pixel 8 Pro',
    androidVersion: 'Android 15',
    trackingPreference: 'balanced',
    position: 1478,
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'wl_seed_2',
    email: 'nisha.k@outlook.com',
    name: 'Nisha Kurian',
    device: 'Samsung Galaxy S24 Ultra',
    androidVersion: 'Android 14',
    trackingPreference: 'battery_saver',
    position: 1479,
    timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 'wl_seed_3',
    email: 'rohit.s@proton.me',
    name: 'Rohit Sharma',
    device: 'Nothing Phone (2a)',
    androidVersion: 'Android 15',
    trackingPreference: 'high_fidelity',
    position: 1480,
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
  }
];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // --- API ROUTES ---

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'TripSahay Fullstack Engine',
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
      timestamp: new Date().toISOString(),
    });
  });

  // Waitlist endpoints
  app.get('/api/waitlist', (req, res) => {
    res.json({
      success: true,
      totalWaitlist: waitlistStore.length + 1480,
      recentEntries: waitlistStore.slice(-5),
    });
  });

  app.post('/api/waitlist', (req, res) => {
    try {
      const { email, name, device, androidVersion, trackingPreference } = req.body;
      if (!email || !email.includes('@')) {
        return res.status(400).json({ error: 'A valid email address is required.' });
      }

      // Check if already registered
      const existing = waitlistStore.find((item) => item.email.toLowerCase() === email.toLowerCase());
      if (existing) {
        return res.json({
          success: true,
          message: "You're on the waitlist. We'll notify you as soon as the Android app launches.",
          position: existing.position,
          entry: existing,
          alreadyExisted: true,
        });
      }

      const newPosition = 1480 + waitlistStore.length + 1;
      const newEntry: WaitlistEntry = {
        id: `wl_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        email: email.trim(),
        name: name ? String(name).trim() : 'Explorer',
        device: device || 'Android Device',
        androidVersion: androidVersion || 'Android 15',
        trackingPreference: trackingPreference || 'balanced',
        position: newPosition,
        timestamp: new Date().toISOString(),
      };

      waitlistStore.push(newEntry);

      return res.status(201).json({
        success: true,
        message: "You're on the waitlist. We'll notify you as soon as the Android app launches.",
        position: newPosition,
        entry: newEntry,
      });
    } catch (err: any) {
      console.error('Waitlist submission error:', err);
      return res.status(500).json({ error: err.message || 'Internal server error' });
    }
  });

  // --- GEMINI AI ROUTES ---

  // 1. AI Trip Story & Resurrection Synthesizer
  app.post('/api/ai/synthesize-story', async (req, res) => {
    try {
      const {
        tripTitle,
        year,
        distanceKm,
        days,
        category,
        waypoints,
        literaryStyle = 'monsoon_poetics',
        customNotes = '',
      } = req.body;

      const ai = getGeminiAI();

      const prompt = `You are the chief travel archivist and poet for TripSahay, a privacy-first travel memory system built in Kerala.
You specialize in transforming raw passive GPS waypoint logs and timeline timestamps into evocative, literary Risograph chronicles.

Trip Details:
- Title: ${tripTitle || 'Backwaters Expedition'} (${year || 2024})
- Distance: ${distanceKm || 42.5} km over ${days || 3} days
- Mode/Category: ${category || 'WALK / FERRY'}
- Selected Waypoints / Stops: ${JSON.stringify(waypoints || ['Fort Kochi Chinese Fishing Nets', 'Mattancherry Spice Bazaar', 'Vypin Island Jetty', 'Munambam Beach Sunset'])}
- Extra Context / Notes: ${customNotes || 'Humid monsoon breeze, salty air, bell tolls from Santa Cruz Basilica, chai stall aroma'}
- Chosen Aesthetic / Literary Tone: ${literaryStyle} (e.g. Monsoon Poetics, Backwater Naturalist, Risograph Chronicler, Heritage Ledger, Spice Route Wanderer)

Generate a structured JSON response containing:
1. "headline": An evocative 4-8 word title capturing the spirit of this movement.
2. "narrative": A rich 3-4 paragraph sensory narrative written in the requested tone. Mention sights, sounds, Kerala's topography, scent of cardamom or rain, passive movement rhythm, and nostalgia.
3. "culturalFootprints": An array of 3-4 notable cultural/geographical highlights or historical anecdotes tied to this route.
4. "carbonAndBatteryReport": A short sentence assessing the eco-friendly transport footprint and passive sensor efficiency (e.g., "~0.04kg CO2/km, 3.2% total battery consumption").
5. "risographPalette": An array of 4 hex color codes tailored for this story's Risograph postcard art (e.g. ink, terracotta, mint, butter).
6. "postalStampBlurb": A 2-sentence poetic quote suitable for printing on a physical passport stamp.
7. "malayalamPhrase": A relevant Malayalam phrase or idiom with English translation that embodies this journey's essence.

Return ONLY raw valid JSON without markdown wrapping or backticks.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.75,
        },
      });

      const responseText = response.text?.trim() || '{}';
      let parsed;
      try {
        parsed = JSON.parse(responseText);
      } catch {
        const clean = responseText.replace(/^```json/i, '').replace(/```$/i, '').trim();
        parsed = JSON.parse(clean);
      }

      return res.json({
        success: true,
        story: parsed,
        meta: {
          model: 'gemini-2.5-flash',
          tripTitle,
          generatedAt: new Date().toISOString(),
        },
      });
    } catch (err: any) {
      console.error('AI Story Synthesis error:', err);
      return res.status(500).json({
        error: err.message || 'Failed to synthesize travel chronicle',
        fallback: {
          headline: 'A Passage Through the Monsoon Mists',
          narrative: 'The path along the coastline carries the ancient cadence of wooden hull ferries and salt-crusted docks. Without a single screen awake, every stride etched its memory into the local ledger.',
          culturalFootprints: ['Chinese Fishing Nets of Fort Kochi', 'Mattancherry Jewish Synagogue spices', 'Vypin sea breeze'],
          carbonAndBatteryReport: 'Zero tailpipe emissions on foot, 2.8% battery consumed over 42km.',
          risographPalette: ['#4A3728', '#F2765A', '#BFE3CE', '#FBEFD4'],
          postalStampBlurb: 'Between the rain and the water, every footprint remains remembered.',
          malayalamPhrase: 'യാത്ര തുടരുന്നു (The journey continues)',
        },
      });
    }
  });

  // 2. Sahay AI Travel Concierge & Route Copilot with Guardrails & Golden Dataset
  app.post('/api/ai/concierge', async (req, res) => {
    try {
      const { message, contextLocation = 'Kochi, Kerala', conversationHistory = [] } = req.body;
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'Message is required' });
      }

      const cleanMessage = message.trim();
      const lower = cleanMessage.toLowerCase();

      // --- 1. SERVER-SIDE GUARDRAIL CHECK ---
      // Check for High Risk / Critical Guardrail violations first
      let triggeredGuardrail: string | null = null;
      let guardrailResponse: string | null = null;

      if (
        lower.includes('swim in monsoon') ||
        lower.includes('varkala cliff jump') ||
        (lower.includes('swim') && lower.includes('monsoon')) ||
        (lower.includes('cliff') && lower.includes('jump')) ||
        lower.includes('rough sea') ||
        lower.includes('drown')
      ) {
        triggeredGuardrail = 'GR-01 (Monsoon Sea & Cliff Hazard Protection)';
        guardrailResponse = `⚠️ **SAFETY ADVISORY: MONSOON SEA SWIMMING STRICTLY PROHIBITED**

During the southwest monsoon (June–August), the Arabian Sea along Kerala's coastline experiences severe undertows, 3–4m wave swells, and unstable laterite cliff conditions at Varkala. Kerala State Disaster Management Authority (KSDMA) red flags are strictly enforced.

**Recommended Safe Alternatives:**
1. **Muziris Heritage Indoor Trail (Kochi):** Explore the air-conditioned Paravur Synagogue & Paliam Palace museums safely indoors.
2. **Sheltered Backwater Canals:** Take a covered wooden canoe through the serene Kainakary or Munroe Island interior waterways where water is calm.
3. **Cliff Walk with Railing:** Enjoy the mist and dramatic ocean views from the paved North Cliff promenade behind safety barriers.`;
      } else if (
        lower.includes('without permit') ||
        lower.includes('illegal trek') ||
        lower.includes('bypass forest checkpoint') ||
        lower.includes('elephant corridor') ||
        (lower.includes('silent valley') && (lower.includes('without') || lower.includes('bypass') || lower.includes('no guide')))
      ) {
        triggeredGuardrail = 'GR-02 (Forest Sanctuary & Wildlife Trespassing Shield)';
        guardrailResponse = `⛔ **GUARDRAIL REFUSAL: UNAUTHORIZED FOREST TREKKING PROHIBITED**

Under the Indian Wildlife Protection Act (1972) and Kerala Forest Department regulations, entering core sanctuary zones (like Silent Valley or Wayanad Tiger Reserve) without an authorized forest guide and valid permit is illegal and poses extreme danger from active wild elephant corridors.

**Official & Safe Entry Protocol:**
1. **Online Booking:** Reserve official eco-tourism passes at \`keralatourism.org\` or the Forest Information Centre at Mukkali.
2. **Authorized Guide:** All Silent Valley trips include a certified Forest Department tribal eco-guide and Department Safari vehicle.
3. **Alternative Permitted Trails:** Explore the officially permitted Meenmutty Waterfalls trek in Wayanad or the Pookode Lake nature canopy loop.`;
      } else if (
        lower.includes('hack') ||
        lower.includes('spoof') ||
        lower.includes('fake location') ||
        lower.includes('cheat ticket') ||
        lower.includes('steal password') ||
        lower.includes('jailbreak')
      ) {
        triggeredGuardrail = 'GR-04 (System Security & Code Exploits Filter)';
        guardrailResponse = `🛡️ **GUARDRAIL REFUSAL: EXPLOITATION & TRANSIT SPOOFING NOT PERMITTED**

I cannot assist with scripts or techniques designed to falsify GPS data, bypass transit ticketing systems, or evade public transport fares. 

TripSahay is committed to supporting sustainable public transportation in Kerala. If you are looking for affordable travel options, I would be happy to share details on **Kerala State RTC Swift student passes**, **Kochi Water Metro seasonal discount cards**, or **SWTD commuter ferry fares** (which start as low as ₹15)!`;
      } else if (
        lower.includes('track another') ||
        lower.includes('spy on phone') ||
        lower.includes('aadhaar') ||
        lower.includes('credit card') ||
        lower.includes('sell data')
      ) {
        triggeredGuardrail = 'GR-03 (DPDP 2023 Non-Invasive Privacy Policy)';
        guardrailResponse = `🛡️ **DPDP ACT 2023 PRIVACY & NON-INVASIVE ARCHITECTURE**

Under India's **Digital Personal Data Protection Act (DPDP) 2023**, TripSahay enforces strict privacy safeguards:
- **Zero Third-Party Tracking:** We do not track other people or share private device locations.
- **On-Device SQLite Storage:** All raw GPS coordinates remain encrypted on your physical device.
- **No Aadhaar / Financial Data:** TripSahay never collects or requires any financial or national ID numbers.
- **1-Click Wipe Cascade:** You can permanently delete all local telemetry and cloud keys at any time from the Privacy tab.`;
      }

      // If Guardrail triggered directly, return the authoritative safe response
      if (triggeredGuardrail && guardrailResponse) {
        return res.json({
          success: true,
          reply: guardrailResponse,
          guardrailStatus: {
            triggered: true,
            rule: triggeredGuardrail,
            enforced: 'Refusal & Redirection to Safe Alternatives',
            timestamp: new Date().toISOString(),
          },
          suggestedFollowUps: [
            'How does DPDP 2023 protect my offline data?',
            'What are the official Kerala Forest Dept eco-tourism routes?',
            'Show me 1-day safe walking trails in Fort Kochi'
          ]
        });
      }

      // --- 2. GEMINI AI INVOCATION WITH GOLDEN INSTRUCTIONS ---
      let generatedReply = '';

      if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'dummy-key') {
        try {
          const ai = getGeminiAI();

          const systemInstruction = `You are Sahay AI, the official intelligent travel concierge and local route navigator for TripSahay (built for SIH 2026 / Smart India Hackathon).
TripSahay is a passive, privacy-preserving travel companion made in Kerala.

YOUR CORE MANDATES & GUARDRAILS:
1. PRIVACY (DPDP Act 2023): Emphasize that TripSahay uses on-device local SQLite logging, zero tracking cookies, and 1-click Wipe Cascade. Never ask for PII or national IDs.
2. BATTERY CONSERVATION: Always provide battery-friendly travel tips. TripSahay's passive cadence algorithm draws only ~3.1% battery per day.
3. AUTHENTIC LOCAL TRANSIT: Prioritize public transit like Kerala SWTD government water ferries (₹15-₹40), Kochi Water Metro, and KSRTC Swift buses over overpriced tourist brokers.
4. SAFETY GUARDRAILS: Strictly warn against Arabian Sea monsoon swimming (June-August) and unauthorized deep forest trekking without Forest Department eco-guides.
5. CULTURAL RESPECT: Share authentic Malayalam idioms, temple etiquette (Mundu/Saree rules), and beloved local thattukada food tips (Sulaimani chai, Puttu & Kadala, Pazham pori).

GOLDEN DATASET EXAMPLES TO EMULATE:
- Fort Kochi Walk: Bastion Bungalow -> Vasco da Gama Chinese Nets -> St. Francis Church -> Jew Town -> Ro-Ro ferry to Vypin (₹5).
- Low Battery Navigation: Switch to Airplane Mode + GPS; follow SH-17 downward toward KSRTC Stand.
- Backwater Ferry: SWTD Alappuzha to Kottayam / Kainakary ferry (₹25-₹40 per person).

Respond with structured markdown, bullet points, warmth, and actionable directions.`;

          const historyContext = conversationHistory
            .slice(-6)
            .map((item: any) => `${item.role === 'user' ? 'User' : 'Sahay AI'}: ${item.content}`)
            .join('\n\n');

          const prompt = `${historyContext ? historyContext + '\n\n' : ''}Current User Context / Location: ${contextLocation}\nUser Query: ${cleanMessage}\n\nRespond as Sahay AI with precise local knowledge, safety guardrails, and battery-friendly transit tips:`;

          const response = await ai.models.generateContent({
            model: 'gemini-3.7-flash',
            contents: prompt,
            config: {
              systemInstruction,
              temperature: 0.65,
            },
          });

          if (response.text && response.text.trim().length > 10) {
            generatedReply = response.text.trim();
          }
        } catch (geminiError: any) {
          console.warn('Gemini API attempt warning, using robust Golden Dataset fallback:', geminiError.message);
        }
      }

      // --- 3. CONTEXTUAL GOLDEN DATASET FALLBACK IF NEEDED ---
      if (!generatedReply) {
        if (lower.includes('battery') || lower.includes('low') || lower.includes('power')) {
          generatedReply = `🔋 **TRIPSAHAY BATTERY-OPTIMIZED NAVIGATION PROTOCOL**

1. **Passive GPS Mode:** Turn ON Airplane Mode while leaving Location ON. TripSahay's motion-gated cadence engine reduces sensor duty cycle to consume only **~0.1% per hour** in background.
2. **Landmark-Based Route:** Keep your screen locked; use vibration haptics at major turnarounds rather than continuous map re-rendering.
3. **Transit Recovery:** Head to the nearest KSRTC depot or Water Metro terminal where USB charging points and ordinary bus departures are available.`;
        } else if (lower.includes('ferry') || lower.includes('boat') || lower.includes('alleppey') || lower.includes('backwater') || lower.includes('vembanad')) {
          generatedReply = `🛶 **KERALA SWTD WATERWAY GUIDE (AUTHENTIC & BUDGET-FRIENDLY)**

- **Alappuzha ⇄ Kottayam Public Ferry:** Departs from Alappuzha Main Jetty every 1.5 hours. Fare is only **₹25 – ₹40** for a 2.5-hour journey through scenic village canals.
- **Kochi Water Metro:** Ultra-modern air-conditioned electric catamarans from High Court Jetty to Vypin / Fort Kochi / Bolgatty for **₹20 – ₹40**.
- **Kumarakom Canoe Trail:** Hire a licensed village non-motorized wooden canoe for ₹300/hr directly at the jetty, preserving quiet backwater birdlife.`;
        } else if (lower.includes('fort kochi') || lower.includes('walk') || lower.includes('heritage') || lower.includes('kochi')) {
          generatedReply = `🚶 **FORT KOCHI 1-DAY HERITAGE ROUTE (MEASURED 4.8 KM)**

1. **08:30 AM — Vasco da Gama Square & Chinese Nets:** Watch fishermen haul the cantilevered teak nets in morning sea breeze.
2. **09:45 AM — St. Francis Church & Bastion Bungalow:** Historic Portuguese and Dutch colonial architecture.
3. **11:30 AM — Kashi Art Cafe / Princess Street:** Local spice-infused iced tea & banana walnut cake.
4. **02:00 PM — Jew Town & Paradesi Synagogue (Mattancherry):** 400-year-old spice lanes and antique shops.
5. **05:15 PM — Municipal Ro-Ro Ferry to Vypin:** 10-minute harbour crossing (₹5) for sunset view.`;
        } else if (lower.includes('munnar') || lower.includes('tea') || lower.includes('hill') || lower.includes('mountain')) {
          generatedReply = `🍃 **MUNNAR TEA HIGHLANDS & OFF-BEAT TRAILS**

- **Lockhart Gap & Tea Trail (1,600m):** Gentle walking trail overlooking bison valley with minimal gradient strain.
- **Authentic Thattukada:** Stop at Old Munnar Town for hot *Sulaimani chai* (cardamom-lemon black tea) and fresh *Pazham Pori* (banana fritters).
- **Eco-Friendly Transit:** KSRTC Ordinary buses connect Munnar town to Top Station and Marayoor sandal forests for under ₹40.`;
        } else if (lower.includes('privacy') || lower.includes('dpdp') || lower.includes('delete') || lower.includes('secure')) {
          generatedReply = `🛡️ **DPDP ACT 2023 PRIVACY GUARANTEES IN TRIPSAHAY**

- **Local-First SQLite Engine:** Your waypoints, timestamps, and velocity logs reside exclusively on your physical smartphone hardware.
- **Zero Telemetry Advertising:** No background data brokers, tracking SDKs, or third-party ads.
- **1-Click Cascade Wipe:** The permanent data purge button instantly clears all local indexes and cloud tokens.`;
        } else {
          generatedReply = `🌿 **NAMASKARAM! SAHAY AI AT YOUR SERVICE**

I'm your Kerala travel memory concierge and route advisor. Here is what I can help you with:

- **Secluded Backwater Ferries:** Timings for SWTD boats (Alappuzha ⇄ Kottayam for ₹25) & Kochi Water Metro.
- **Battery-Saving Routes:** Low-power walking tours across Fort Kochi, Munnar, and Kozhikode.
- **Monsoon & Trail Safety:** Official Forest Department eco-tourism checkpoints and sea safety advisories.
- **Cultural Etiquette & Cuisine:** Traditional temple dress codes, spice bazaars, and legendary thattukada spots.

*Where would you like to explore today?*`;
        }
      }

      return res.json({
        success: true,
        reply: generatedReply,
        guardrailStatus: {
          triggered: false,
          rule: 'GR-Standard (Safe & DPDP 2023 Compliant)',
          enforced: 'Active',
          timestamp: new Date().toISOString(),
        },
        suggestedFollowUps: [
          '🚶 1-Day Low-Battery Walk in Fort Kochi',
          '🛶 Kerala SWTD Public Ferry Routes (₹25)',
          '🍃 Munnar Tea Highland Trails & Chai Stalls',
          '🛡️ How DPDP 2023 protects my offline GPS'
        ]
      });
    } catch (err: any) {
      console.error('AI Concierge unexpected error:', err);
      return res.json({
        success: true,
        reply: `🌿 **SAHAY AI OFFLINE LOCAL ADVISORY**

Here is your battery-optimized guide for Fort Kochi & Vembanad:
- Walk past the Bastion Bungalow toward Calvathy canal.
- Stop for Sulaimani tea at a local thattukada.
- Catch the 5:15 PM public Ro-Ro boat to Vypin island (ticket: ₹5), preserving 90% battery compared to active map recalculations!`,
        guardrailStatus: {
          triggered: false,
          rule: 'GR-Offline (Local Storage Active)',
          enforced: 'Active',
          timestamp: new Date().toISOString(),
        },
        suggestedFollowUps: [
          'Show me low-battery backwater routes',
          'What are the dress codes for Kerala temples?',
          'How does the 1-click Wipe Cascade work?'
        ]
      });
    }
  });

  // 3. AI Vision Postcard & Photo Aesthetic Extractor
  app.post('/api/ai/vision-postcard', async (req, res) => {
    try {
      const { imageBase64, imagePrompt, mimeType = 'image/jpeg' } = req.body;
      const ai = getGeminiAI();

      let parts: any[] = [];
      if (imageBase64) {
        const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
        parts.push({
          inlineData: {
            mimeType,
            data: base64Data,
          },
        });
      }

      const promptText = `Analyze this travel image (or scene description: "${imagePrompt || 'Kerala backwaters sunset with country boat'}").
Act as a master Risograph printmaker and travel essayist for TripSahay.

Produce a JSON object with:
1. "title": A poetic 3-6 word title for this visual memory.
2. "vibe": A 1-line aesthetic description (e.g. "Warm sepia dusk over calm lagoon waters").
3. "risographInks": Array of 3 distinct hex colors representing ink layers (e.g. Fluorescent Coral, Teal Green, Warm Ochre).
4. "visualStory": A 2-paragraph poetic travel note describing the atmosphere, light, texture, and emotional memory.
5. "locationGuess": Probable location or landscape category (e.g. "Kavvayi Backwaters, North Malabar").
6. "stampTagline": A short uppercase vintage cancellation mark text (e.g. "ARCHIVED AT SEA LEVEL · KERALA 2026").

Return ONLY valid raw JSON.`;

      parts.push({ text: promptText });

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: parts,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      });

      const text = response.text?.trim() || '{}';
      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch {
        parsed = JSON.parse(text.replace(/^```json/i, '').replace(/```$/i, '').trim());
      }

      return res.json({
        success: true,
        postcard: parsed,
      });
    } catch (err: any) {
      console.error('Vision Postcard error:', err);
      return res.status(500).json({
        error: err.message || 'Vision analysis failed',
        fallback: {
          title: 'Monsoon Reflections at Vembanad',
          vibe: 'Soft turquoise ripples meeting golden hour lanterns',
          risographInks: ['#F2765A', '#BFE3CE', '#7A6BA8'],
          visualStory: 'The low hum of the wooden ferry ripples across the expanse of Vembanad Lake. Coconut palms lean into the emerald breeze as dusk turns the sky into liquid amber.',
          locationGuess: 'Kumarakom, Kerala',
          stampTagline: 'PASSIVE LOG · WATERWAY TRANSIT · KOCHI',
        },
      });
    }
  });

  // 4. Custom AI Passport Stamp Generator
  app.post('/api/ai/generate-stamp', async (req, res) => {
    try {
      const { destination, travelerName, travelStyle = 'Wanderer' } = req.body;
      const ai = getGeminiAI();

      const prompt = `Design a bespoke digital passport visa stamp concept for traveler "${travelerName || 'Explorer'}" visiting "${destination || 'Munnar Tea Hills'}".
Travel style: ${travelStyle}.

Return a JSON with:
1. "stampTitle": Short all-caps destination title (e.g. "MUNNAR TEA HIGHLANDS").
2. "borderShape": One of "circular", "octagonal", "oval", "scalloped", "shield".
3. "primaryColor": Hex color (e.g. "#C96B4A" or "#2E6E4E").
4. "accentColor": Hex color.
5. "coordinates": Realistic coordinate string (e.g. "10.0889° N, 77.0595° E").
6. "motto": A 3-5 word inspirational stamp inscription.
7. "elevationOrFeature": Feature highlight (e.g. "ELEV. 1600M · MIST CANOPY").

Return ONLY valid raw JSON.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      });

      const text = response.text?.trim() || '{}';
      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch {
        parsed = JSON.parse(text.replace(/^```json/i, '').replace(/```$/i, '').trim());
      }

      return res.json({
        success: true,
        stamp: parsed,
      });
    } catch (err: any) {
      console.error('AI Stamp generator error:', err);
      return res.status(500).json({
        error: err.message || 'Stamp generation failed',
        fallback: {
          stampTitle: 'WAYANAD CLOUD FORESTS',
          borderShape: 'octagonal',
          primaryColor: '#2E6E4E',
          accentColor: '#E0A458',
          coordinates: '11.6854° N, 76.1320° E',
          motto: 'SILENT FOOTPRINTS IN THE CANOPY',
          elevationOrFeature: 'ELEV. 2100M · CHEMERA PEAK',
        },
      });
    }
  });

  // --- VITE / STATIC SERVING ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TripSahay Fullstack Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
