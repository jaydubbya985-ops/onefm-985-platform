import { BREAKFAST_SHOW, BREAKFAST_TIME } from '@/data/programGuide';
import {
  formatBroadcastPopulation,
  formatCoverageShort,
  formatRadius,
  formatTowns,
  weeklyListenersValue,
} from '@/lib/coverageCopy';
import { STANDARD_SPOT_PLUS_GST } from '@/lib/inventoryCopy';
import { FACEBOOK_PAGE_URL, SOUNDCLOUD_PROFILE_URL } from '@/lib/socialLinks';

export function hasApiKey(): boolean {
  // Browser bundles must never carry provider secret keys. Use a server proxy
  // before enabling live generation.
  return false;
}

export interface GenerateOptions {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
  onChunk?: (chunk: string) => void;
}

/* ── Proposal content pools ── */
const demoProposalPool: Record<string, string[]> = {
  'Executive Summary': [
    `ONE FM 98.5 is excited to partner with you to achieve your campaign goals. As the Goulburn Murray's community broadcaster (callsign 3ONE, operated by Goulburn Valley Community Radio Inc.), we reach an estimated ${weeklyListenersValue()} weekly listeners across ${formatTowns()} within our ${formatRadius()} broadcast area. This proposal outlines a genuine regional partnership.`,
    'We are proud to present this sponsorship opportunity. ONE FM 98.5 has served the Goulburn Murray since 1980 — a trusted community voice across Shepparton, Mooroopna, Cobram, Echuca, Kyabram and surrounding communities.',
    'This proposal introduces a partnership between your brand and ONE FM 98.5. As a licensed community broadcaster since 1989, we combine deep local trust with a genuine connection to the Goulburn Murray community.',
  ],
  'About ONE FM': [
    'ONE FM 98.5 has been broadcasting across the Goulburn Murray since 1980. Licensed as a community broadcaster since 1989, we are operated by Goulburn Valley Community Radio Inc. — a not-for-profit organisation dedicated to live, local content.',
    `ONE FM 98.5 (callsign 3ONE) is the Goulburn Murray's community radio station. We broadcast from Shepparton across ${formatTowns()}, delivering local news, community announcements, sport, multicultural programming, and music.`,
    'Our mission is to inform, entertain, and connect the Goulburn Murray community. ONE FM is volunteer-supported and community-owned, making your sponsorship a genuine investment in local broadcasting.',
  ],
  'Audience Overview': [
    `ONE FM reaches an estimated ${weeklyListenersValue()} weekly listeners across ${formatTowns()} in the Goulburn Murray region (source: population-based estimate from ABS 2021 census data). Our audience is local, community-focused, and connected to the station that reflects their region.`,
    `Our listeners are the Goulburn Murray community — families, farmers, business owners, workers, and volunteers across ${formatTowns()}. They trust ONE FM because we are genuinely local and community-owned.`,
    `The Goulburn Murray broadcast area is home to ${formatBroadcastPopulation()} people across ${formatTowns()} (townData 2026 est.). ONE FM is their community radio station — the one that covers their local sport, their local news, and their local events.`,
  ],
  'Platform Reach': [
    `ONE FM 98.5 delivers reach through FM broadcast (98.5 FM, ${formatCoverageShort()}), live streaming at fm985.com.au, community Facebook (${FACEBOOK_PAGE_URL.replace('https://www.', '')}), and SoundCloud interviews (${SOUNDCLOUD_PROFILE_URL.replace('https://', '')}). Confirmed social: Facebook and SoundCloud only.`,
    'Your message reaches the Goulburn Murray community through our FM broadcast signal, the fm985.com.au stream, and the confirmed Facebook page. ONE FM is genuinely local — no national Community Radio Plus aggregates, no metro assumptions.',
    'We broadcast on 98.5 FM across the Goulburn Murray, stream live at fm985.com.au, and publish local interviews on SoundCloud. Instagram, Twitter, and TikTok handles are not confirmed.',
  ],
  'Proposed Package': [
    `We recommend on-air placement drawn from the published rate card (${STANDARD_SPOT_PLUS_GST}). Companion options are the fm985.com.au stream and Facebook community posts. GVL match-day inventory is premium — never priced from the standard $25 spot.`,
    'This proposal combines broadcast spots with Facebook mentions and SoundCloud interview adjacency where it fits the brief. There is no separate podcast inventory, app store listing, or unconfirmed social channel in the package.',
    'Start with foundational on-air presence, then add Facebook posts and SoundCloud interview mentions if useful. Each line is quoted from the rate card — we do not sell podcast host reads or invented digital modules.',
  ],
  'Pricing & Rates': [
    `${STANDARD_SPOT_PLUS_GST}. GVL / breakfast / live-call inventory is premium and quoted separately. Ask admin@fm985.com.au for a written quote — demo pools do not invent volume discounts or deposit terms.`,
    'Monthly, quarterly, and annual bookings are quoted from the published rate card. We do not advertise unsourced percentage savings or exclusive-category bonuses in this demo copy.',
    `Entry packages start with ${STANDARD_SPOT_PLUS_GST} and optional Facebook mentions. Mid and premium tiers add live reads and GVL season inventory — not podcast host reads or streaming pre-roll products we do not sell.`,
  ],
  'Case Studies': [
    'Contact us at admin@fm985.com.au for case studies and references from current and past sponsors in the Goulburn Murray region.',
    'ONE FM has supported local businesses across the Goulburn Murray for decades. Ask us for references from sponsors in your industry.',
    'We are proud of our sponsor relationships. Contact our team at (03) 5831 3131 to speak with current sponsors about their experience with ONE FM.',
  ],
  'Timeline & Next Steps': [
    'We propose a streamlined timeline: Week 1 for contract and creative briefing, Weeks 2-3 for production and approvals, and Week 4 for launch. Our dedicated account team provides weekly performance reports and mid-campaign optimization recommendations. Ready to move forward? Let\'s schedule a kickoff call.',
    'Speed matters. Our typical campaign launch cycle is 21 days from signed contract to first air date. Rush production is available for time-sensitive launches. We assign a dedicated account strategist who remains your single point of contact throughout.',
    'Next steps are simple: review this proposal, ask any questions, and let us know your preferred start date. We\'ll then schedule a creative briefing, produce sample assets for your approval, and confirm the media schedule. Most campaigns are live within three weeks.',
  ],
  'Terms & Conditions': [
    'Standard terms: 50% deposit on contract signing, balance due 30 days from campaign start, 14-day cancellation notice. All creative assets must be approved 5 business days before air date. ONE FM retains the right to refuse content that does not meet broadcast standards.',
    'Our terms are designed to protect both parties and ensure campaign quality. Deposits secure inventory in competitive dayparts. Cancellation windows allow us to reallocate slots while giving clients flexibility. Creative deadlines ensure proper review and technical compliance.',
  ],
  'Regional Map & Coverage': [
    `ONE FM 98.5 covers the Goulburn Murray region from Shepparton — ${formatCoverageShort()}. Key communities include Shepparton, Mooroopna, Cobram, Echuca, Kyabram, Benalla, and surrounds. Listen on 98.5 FM or stream at fm985.com.au — stream totals are not claimed as extra reach.`,
  ],
  'Social Media Strategy': [
    `Confirmed channels are Facebook (${FACEBOOK_PAGE_URL.replace('https://www.', '')}) and SoundCloud (${SOUNDCLOUD_PROFILE_URL.replace('https://', '')}). Instagram, Twitter, and TikTok are not confirmed — do not book those platforms.`,
  ],
  'Podcast Integration': [
    `ONE FM does not sell a podcast product. Local interviews live on SoundCloud (${SOUNDCLOUD_PROFILE_URL.replace('https://', '')}). Contact admin@fm985.com.au if an interview adjacency is relevant — there are no podcast download counts or host-read inventory.`,
  ],
  'Event Activation Plan': [
    'ONE FM regularly broadcasts live from community events across the Goulburn Murray including GVL football, local festivals, and community days. Contact us to discuss outside broadcast and event sponsorship packages.',
  ],
  'Competitive Analysis': [
    'ONE FM 98.5 is the only locally-owned community radio station serving the Goulburn Murray region, operated by Goulburn Valley Community Radio Inc. under an ACMA community broadcasting licence.',
  ],
  'ROI Projection': [
    'Return on investment varies by campaign, business type, and execution. Our sponsorship team can provide honest guidance based on your objectives. Contact admin@fm985.com.au or (03) 5831 3131.',
  ],
};

// Confirmed-channel captions only. Instagram / TikTok / Twitter handles are not confirmed.
const demoCaptionPool: Record<string, string[]> = {
  Facebook: [
    `${BREAKFAST_SHOW} is ${BREAKFAST_TIME} weekdays on ONE FM 98.5. Tune in on 98.5 FM or stream at fm985.com.au.`,
    'GVL Match of the Day is Saturday 1pm–3pm on ONE FM 98.5 (source: fm985.com.au/guide/). Listen on 98.5 FM or stream at fm985.com.au.',
    'Multicultural programs sit on the weeknight guide — check times at fm985.com.au/guide/. Facebook and SoundCloud are the confirmed station channels.',
  ],
  SoundCloud: [
    `Local interviews live on SoundCloud (${SOUNDCLOUD_PROFILE_URL.replace('https://', '')}) — not a separate podcast product and not download-count inventory.`,
  ],
  Instagram: [
    'ONE FM does not have a confirmed Instagram handle. Use Facebook (facebook.com/onefmshepparton) or SoundCloud interviews.',
  ],
  TikTok: [
    'ONE FM does not have a confirmed TikTok handle. Confirmed channels: Facebook and SoundCloud only.',
  ],
  'Twitter/X': [
    'ONE FM does not have a confirmed Twitter/X handle. Do not use @onefm985 or live-now counts.',
  ],
  LinkedIn: [
    `Goulburn Valley Community Radio Inc. has been serving the Goulburn Murray region since 1980. ONE FM 98.5 (callsign 3ONE) delivers live local content across ${formatTowns()} within our broadcast area.`,
    'ONE FM 98.5 is a licensed community broadcaster under Goulburn Valley Community Radio Inc. We are a not-for-profit organisation committed to live, local content for the Goulburn Murray region.',
  ],
};

// Forecast reasoning — real streaming analytics not yet connected; placeholder note
const demoForecastReasonings = [
  'Real-time streaming analytics require Radio.co API connection. Once connected, this will show live listening trends for ONE FM 98.5.',
  `Historical listenership data will display here when Radio.co analytics are integrated. Current estimate: ~${weeklyListenersValue()} weekly listeners (ABS 2021 population base).`,
  'Connect Radio.co analytics (station: sae3372059) to enable real forecast modelling for the Goulburn Murray broadcast area.',
];

/* ── Helper: streaming text simulation for demo mode ── */
function simulateStreaming(text: string, onChunk: (chunk: string) => void): Promise<string> {
  return new Promise((resolve) => {
    let index = 0;
    const chunkSize = Math.max(1, Math.floor(text.length / 40));
    const interval = setInterval(() => {
      const end = Math.min(index + chunkSize, text.length);
      onChunk(text.slice(index, end));
      index = end;
      if (index >= text.length) {
        clearInterval(interval);
        resolve(text);
      }
    }, 45);
  });
}

/* ── Token & cost estimation ── */
export function estimateTokens(text: string): number {
  // Very rough estimate: ~4 chars per token for English
  return Math.ceil(text.length / 4);
}

export function estimateCost(tokens: number, model = 'gpt-4o-mini'): string {
  const rate = model === 'gpt-4o-mini' ? 0.00015 : 0.03; // per 1K tokens
  const cost = (tokens / 1000) * rate;
  if (cost < 0.001) return '<$0.001';
  return `~$${cost.toFixed(3)}`;
}

/* ────────────────────────────────────────────── */
export async function generateContent(options: GenerateOptions): Promise<string> {
  const { onChunk } = options;
  const fallback = 'AI generation is disabled in the browser until a server-side proxy is connected.';
  if (onChunk) {
    await simulateStreaming(fallback, onChunk);
  }
  return fallback;
}

let captionCycleIndex = 0;
export async function generateCaption(
  platform: string,
  topic: string,
  tone: string,
  onChunk?: (chunk: string) => void
): Promise<string> {
  if (!hasApiKey()) {
    const pool = demoCaptionPool[platform] || demoCaptionPool.Facebook;
    const text = pool[captionCycleIndex % pool.length];
    captionCycleIndex++;
    if (onChunk) await simulateStreaming(text, onChunk);
    return text;
  }

  const prompt = `Write a ${tone.toLowerCase()} social media caption for ${platform} about "${topic}" for a radio station called ONE FM. Include relevant hashtags and emojis. Keep it platform-appropriate.`;
  return generateContent({ prompt, maxTokens: 300, temperature: 0.8, onChunk });
}

let proposalCycleIndex = 0;
export async function generateProposalSection(
  sectionType: string,
  customerInfo: Record<string, unknown>,
  onChunk?: (chunk: string) => void
): Promise<string> {
  if (!hasApiKey()) {
    const pool = demoProposalPool[sectionType] || demoProposalPool['Executive Summary'];
    const text = pool[proposalCycleIndex % pool.length];
    proposalCycleIndex++;
    if (onChunk) await simulateStreaming(text, onChunk);
    return text;
  }

  const prompt = `Write a ${sectionType} section for a sponsorship proposal from ONE FM (a regional radio station) to ${customerInfo.companyName || 'a prospective partner'}. Industry: ${customerInfo.industry || 'general'}. Campaign goal: ${customerInfo.campaignGoal || 'brand awareness'}. Duration: ${customerInfo.campaignDuration || 'ongoing'}. Tone: professional and persuasive. Length: 2-3 paragraphs.`;
  return generateContent({ prompt, maxTokens: 600, temperature: 0.7, onChunk });
}

let forecastCycleIndex = 0;
export async function generateForecast(
  data: number[],
  onChunk?: (chunk: string) => void
): Promise<{ forecast: number[]; confidence: number; reasoning: string }> {
  if (!hasApiKey()) {
    // Simulate realistic forecast based on input trend
    const last = data[data.length - 1] || 1000;
    const trend = data.length > 1 ? (last - data[0]) / (data.length - 1) : 0;
    const forecast = Array.from({ length: 4 }, (_, i) => {
      const noise = (Math.random() - 0.5) * last * 0.05;
      return Math.round(last + trend * (i + 1) + noise);
    });
    const confidence = 78 + Math.floor(Math.random() * 15);
    const reasoning = demoForecastReasonings[forecastCycleIndex % demoForecastReasonings.length];
    forecastCycleIndex++;
    if (onChunk) await simulateStreaming(reasoning, onChunk);
    return { forecast, confidence, reasoning };
  }

  const prompt = `Given the following weekly listenership data for a radio station: ${JSON.stringify(data)}, predict the next 4 weeks. Respond ONLY with a JSON object in this exact format: {"forecast": [number, number, number, number], "confidence": number, "reasoning": "string"}. The confidence should be 70-95. The reasoning should be one sentence explaining the prediction.`;

  const result = await generateContent({ prompt, maxTokens: 400, temperature: 0.3, onChunk });
  try {
    const parsed = JSON.parse(result);
    return {
      forecast: Array.isArray(parsed.forecast) ? parsed.forecast : [data[data.length - 1] || 1000, data[data.length - 1] || 1000, data[data.length - 1] || 1000, data[data.length - 1] || 1000],
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 80,
      reasoning: parsed.reasoning || 'Based on historical trends.',
    };
  } catch {
    const lastVal = data[data.length - 1] || 1000;
    return {
      forecast: [lastVal, lastVal * 1.02, lastVal * 1.04, lastVal * 1.05],
      confidence: 75,
      reasoning: 'Based on recent listenership patterns.',
    };
  }
}
