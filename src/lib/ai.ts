import OpenAI from 'openai';

const apiKey = import.meta.env.VITE_OPENAI_API_KEY || '';

export const openai = new OpenAI({
  apiKey,
  dangerouslyAllowBrowser: true, // For demo only — use backend proxy in production
});

export function hasApiKey(): boolean {
  return !!apiKey && apiKey.startsWith('sk-');
}

export interface GenerateOptions {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
  onChunk?: (chunk: string) => void;
}

/* ── Demo content pools ── */
const demoProposalPool: Record<string, string[]> = {
  'Executive Summary': [
    'ONE FM is excited to partner with you to achieve your campaign goals. With 847,000 daily listeners and a multi-platform ecosystem spanning FM broadcast, digital streaming, and social media, we offer unmatched regional reach. This proposal outlines a strategic partnership designed to deliver measurable brand lift and ROI over the campaign period.',
    'We are thrilled to present this tailored sponsorship opportunity. ONE FM reaches 2.4M listeners weekly across broadcast, streaming, and podcast channels. Our engaged audience trusts our recommendations, making us the ideal partner to amplify your message and drive meaningful results.',
    'This executive summary introduces a powerful collaboration between your brand and ONE FM. Leveraging our heritage as the region\'s premier broadcaster since 1985, we combine community trust with cutting-edge digital reach to create campaigns that resonate and convert.',
  ],
  'About ONE FM': [
    'Since 1985, ONE FM has been the heartbeat of the region. Our state-of-the-art studios, award-winning programming, and passionate team of broadcasters create content that communities truly engage with. We are more than a radio station — we are a trusted companion for commuters, families, and professionals alike.',
    'ONE FM stands at the intersection of heritage and innovation. For nearly four decades, we have connected communities through classic hits, local news, and compelling storytelling. Today, we extend that connection through digital streaming, podcasts, and social platforms.',
    'Our mission is simple: inform, entertain, and unite. ONE FM operates from world-class broadcast facilities with a team committed to editorial excellence. Our audience doesn\'t just listen — they participate, engage, and trust our voice.',
  ],
  'Audience Overview': [
    'Our audience mirrors the vibrant diversity of the region. The core demographic of 25-44 represents the decision-makers and trend-setters of our community. With an average daily listening time of 2.3 hours, our audience is deeply engaged, particularly during morning drive-time and afternoon commute.',
    'ONE FM reaches a balanced, multi-generational audience. Millennials (25-34) make up 38% of listeners, followed by established professionals (35-44) at 29%, and Gen Z (18-24) at 22%. This diversity allows precise targeting for brands across virtually every sector.',
    'Engagement is our superpower. Listeners tune in for an average of 2.3 hours daily, with peak loyalty during weekday commutes. Weekend programming attracts family audiences, while our night shows capture younger demographics. Wherever your target lives, we reach them.',
  ],
  'Platform Reach': [
    'Your message travels far and wide through our multi-platform ecosystem. FM broadcast reaches 847,000 daily listeners. Digital streaming captures 320,000 monthly active users. Our podcast network engages 150,000 subscribers. Social media extends reach to 450,000 followers, and our website drives 180,000 monthly visits.',
    'ONE FM delivers true omni-channel presence. From traditional FM radio to streaming apps, podcasts to social feeds, we maintain consistent brand voice and audience trust across every touchpoint. This integrated approach maximizes frequency and recall for your message.',
    'Reach isn\'t just about numbers — it\'s about presence where it matters. Our broadcast signal covers 95% of the regional population. Our streaming app ranks #1 in the regional news & music category. Our podcasts average 4.8-star ratings. Your brand benefits from every channel.',
  ],
  'Proposed Package': [
    'We recommend a comprehensive package aligning with your objectives. This includes prime on-air placement during high-engagement dayparts, digital companion assets for streaming and web, and social media amplification. Optional add-ons include podcast integration, event activation, and regional coverage mapping.',
    'This tailored proposal combines broadcast prominence with digital depth. Core deliverables include sponsored segments, host endorsements, banner and audio ads on streaming, plus coordinated social posts. Every element is designed to reinforce your message across the customer journey.',
    'Our package architecture is flexible by design. Start with foundational on-air presence, then layer digital streaming ads, social amplification, and podcast sponsorships. Each module is independently priced so you build exactly the right mix for your goals and budget.',
  ],
  'Pricing & Rates': [
    'Our pricing is transparent and value-driven. The base investment includes all core deliverables with volume discounts for extended campaigns. Additional sections such as ROI projections, competitive analysis, and social strategy can be added à la carte. Payment terms: 50% deposit, balance due 30 days from campaign start.',
    'We structure pricing to reward commitment. Monthly campaigns receive standard rates; quarterly bookings unlock 10% savings; annual partnerships include exclusive category protection and bonus digital inventory. All rates exclude applicable taxes.',
    'Investment levels scale with ambition. Entry packages start with targeted on-air mentions and social posts. Mid-tier adds streaming pre-roll and podcast host reads. Premium tiers include full editorial integration, event presence, and dedicated account management.',
  ],
  'Case Studies': [
    'A regional retail chain achieved a 45% increase in brand recall after a 3-month ONE FM sponsorship combining on-air mentions with social amplification. A technology brand saw 3x ROI on a product launch campaign that leveraged podcast integration. These results demonstrate the power of trusted messaging delivered through a channel audiences actively choose.',
    'Our automotive partner drove 28% more test drive bookings during a 6-week campaign using morning drive sponsorships and targeted streaming ads. A hospitality client filled 92% of event seats through a coordinated broadcast, podcast, and influencer strategy.',
    'Measurable outcomes are our standard. Recent campaigns have delivered average brand recall lifts of 38%, click-through rates 2.4x industry benchmarks on digital placements, and social engagement rates exceeding platform averages by 60%. We track, report, and optimize.',
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
    'ONE FM covers the entire regional area including Central CBD, North Hills, East Valley, South Coast, and West Plains. Our signal reaches 95% of the regional population, with digital streaming extending coverage to out-of-region listeners and expatriates.',
  ],
  'Social Media Strategy': [
    'Our social integration package includes branded content across Instagram, TikTok, Facebook, and Twitter/X. We provide content calendar planning, asset creation, and performance reporting. Average engagement rates exceed platform benchmarks by 35%.',
  ],
  'Podcast Integration': [
    'ONE FM\'s podcast network includes 5 original shows with 150,000 combined monthly downloads. Integration options include host reads, sponsored segments, dedicated episodes, and cross-promotional packages. Podcast listeners show 42% higher purchase intent than general audiences.',
  ],
  'Event Activation Plan': [
    'Event sponsorship includes on-site broadcast, branded activations, social coverage, and post-event content packages. Previous activations have reached 50,000+ attendees with 85% brand recall rates. We handle logistics, permits, and talent coordination.',
  ],
  'Competitive Analysis': [
    'ONE FM leads the regional market with a 42% audience share, compared to 28% for Station B and 18% for Station C. Our engagement rates are 35% above industry average, and our digital growth rate of 24% YoY outpaces all competitors.',
  ],
  'ROI Projection': [
    'Based on industry benchmarks and our audience data, projected ROI for this campaign is 3.2x over the campaign period, with brand awareness lift estimated at 28%. Digital components typically deliver 2.4x the click-through rate of industry averages.',
  ],
};

const demoCaptionPool: Record<string, string[]> = {
  Instagram: [
    'The beats are dropping and the vibes are rising! Tune into ONE FM now for your daily dose of energy. 🎧🔥 #MorningDrive #LiveRadio #OneFM',
    'Your favorite hosts are LIVE and ready to make your morning unforgettable. Join the conversation! 📻✨ #OneFM #RadioLife #CommunityFirst',
    'Catch the wave — ONE FM is where the region comes to life. New music, local news, and the voices you trust. 🌊📻 #OneFM #LocalRadio #TuneIn',
  ],
  TikTok: [
    'POV: you just found the best radio station ever 🔥 #OneFM #RadioTok #Viral #FYP',
    'When the DJ drops THAT track and the whole studio loses it 🎧💥 #OneFM #MusicTok #DJLife',
    'Tell me you listen to ONE FM without telling me you listen to ONE FM 👇 #OneFM #RadioTok #Trending',
  ],
  'Twitter/X': [
    '🎵 LIVE NOW: Morning Drive with Sarah & Mike. News, music, and your calls. Tune in → ONE FM 98.5 #MorningDrive #OneFM',
    'The Night Shift is about to get started. Indie, electronica, and zero sleep required 🌙 #TheNightShift #OneFM #NowPlaying',
    'Weekend Warmup is ON. Two hours of feel-good anthems to kick off your Saturday right 🎉 #WeekendVibes #OneFM',
  ],
  Facebook: [
    'Join thousands of listeners who start their day with ONE FM. Morning Drive is live from 6AM — news, music, and community. 🎙️📻 #OneFM',
    'Weekend Warmup is here! Two hours of feel-good anthems to kick off your Saturday right. Tune in now! 🎉🎶 #OneFM #WeekendRadio',
    'Thank you to everyone who tunes in daily. ONE FM is powered by listeners like you. Share your favorite show in the comments! 👇',
  ],
  LinkedIn: [
    'ONE FM continues to lead regional broadcasting with cutting-edge programming and community-focused content. Learn more about our latest initiatives and partnership opportunities.',
    'As media consumption evolves, ONE FM remains committed to delivering trusted, local content across broadcast, streaming, and podcast channels. Our audience engagement metrics continue to outperform industry benchmarks.',
  ],
};

const demoForecastReasonings = [
  'Based on seasonal patterns and historical growth, listenership is projected to rise 8-12% over the next quarter. Key drivers include upcoming festival coverage and the autumn programming refresh.',
  'Historical data suggests steady growth with moderate seasonality. The forecast model factors in recent digital streaming acceleration and social media cross-promotion effects.',
  'Analyzing the last 12 weeks reveals a consistent upward trend with a 6.4% compound weekly growth rate. Seasonal adjustments indicate peak periods during holiday programming windows.',
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
  const { prompt, maxTokens = 800, temperature = 0.7, onChunk } = options;

  if (!hasApiKey()) {
    const fallback = 'AI features require an OpenAI API key. Add VITE_OPENAI_API_KEY to your .env file.';
    if (onChunk) {
      await simulateStreaming(fallback, onChunk);
    }
    return fallback;
  }

  const stream = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: maxTokens,
    temperature,
    stream: true,
  });

  let fullText = '';
  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || '';
    fullText += content;
    if (onChunk) onChunk(content);
  }
  return fullText;
}

let captionCycleIndex = 0;
export async function generateCaption(
  platform: string,
  topic: string,
  tone: string,
  onChunk?: (chunk: string) => void
): Promise<string> {
  if (!hasApiKey()) {
    const pool = demoCaptionPool[platform] || demoCaptionPool.Instagram;
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
