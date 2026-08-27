// Sponsorship tiers (general)
export const generalTiers = {
  communityPartner: { name: 'Community Partner', minPrice: 50, maxPrice: 100, weeklyPrice: 75, spots: 10, socialPosts: 2 },
  championPartner: { name: 'Champion Partner', minPrice: 120, maxPrice: 180, weeklyPrice: 150, spots: 20, socialPosts: 4 },
  premierPartner: { name: 'Premier Partner', minPrice: 250, maxPrice: 350, weeklyPrice: 300, spots: 30, socialPosts: 8 },
  signaturePartner: { name: 'Signature Partner', minPrice: 500, maxPrice: 600, weeklyPrice: 550, spots: 40, socialPosts: 12, exclusivity: true },
};

// Football tiers (9-tier from brief)
export const footballTiers = [
  { id: 1, name: 'Community Supporter', price: 25, features: ['Name read on match day', '1 social mention/month', 'Website logo listing'] },
  { id: 2, name: 'Community Partner', price: 50, features: ['5 radio spots', '2 social posts/month', 'Logo on website', 'Quarter-page ad'] },
  { id: 3, name: 'Local Champion', price: 100, features: ['10 radio spots', '4 social posts/month', 'Quarter-page ad', 'Newsletter mention'] },
  { id: 4, name: 'Champion Partner', price: 150, features: ['20 radio spots', '6 social posts/month', 'Half-page ad', 'Newsletter mention', 'Live read by commentators'], badge: 'MOST POPULAR' },
  { id: 5, name: 'Major Partner', price: 200, features: ['25 radio spots', '8 social posts/month', 'Full-page ad', 'Live read', 'Match report branding'] },
  { id: 6, name: 'Premier Partner', price: 300, features: ['30 radio spots', '10 social posts/month', 'Full-page ad', 'Branded match reports', 'Priority placement'], badge: 'BEST VALUE' },
  { id: 7, name: 'Elite Partner', price: 400, features: ['35 radio spots', '12 social posts/month', 'Branded segment', 'Player interview', 'Social video content'] },
  { id: 8, name: 'Signature Partner', price: 500, features: ['40 radio spots', '15 social posts/month', 'Category exclusivity', 'Naming rights for segment', 'Ground mention'], badge: 'ULTIMATE' },
  { id: 9, name: 'Naming Rights Partner', price: 600, features: ['Everything included', 'Ground naming mention', 'Jersey sponsor read', 'Exclusive category lock', 'VIP hospitality'] },
];

// Rate card (media kit)
export const rateCard = {
  standardSpot30s: 25,
  standardSpot60s: 45,
  premiumSpot: 75,
  sponsorshipMention: 50,
  liveRead: 100,
  socialPost: 40,
  websiteBanner: 150,
  newsletterMention: 30,
  eventActivation: 500,
  packageDiscount: 0.15, // 15% discount for annual
};

// Proposal templates
export const proposalTemplates = [
  { id: 'standard', name: 'Standard Sponsorship', description: 'Full media kit overview' },
  { id: 'event', name: 'Event Partnership', description: 'Game day and event activation' },
  { id: 'digital', name: 'Digital Package', description: 'Social, web, and podcast focus' },
  { id: 'premium', name: 'Premium Annual', description: 'Maximum visibility year-round' },
  { id: 'local', name: 'Local Business', description: 'Tailored for small businesses' },
  { id: 'football', name: 'Football Season', description: 'Complete football season coverage' },
];

// Donation tiers
export const donationTiers = [
  { id: 'bronze', name: 'Bronze Supporter', amount: 10, period: 'month', description: 'Monthly community supporter' },
  { id: 'silver', name: 'Silver Supporter', amount: 25, period: 'month', description: 'Regular supporter with perks' },
  { id: 'gold', name: 'Gold Supporter', amount: 50, period: 'month', description: 'Premium supporter recognition' },
  { id: 'patron', name: 'Community Patron', amount: 100, period: 'month', description: 'Major supporter + on-air thanks' },
  { id: 'once-off', name: 'One-off Donation', amount: 50, period: 'once', description: 'Single contribution' },
];

// Key stats
// broadcastPopulation must equal the sum of population2026 across src/data/townData.ts.
// `npx vite-node scripts/audit-town-data.ts` fails the build check if it drifts.
export const stationStats = {
  weeklyListeners: 39375,
  broadcastPopulation: 189680,
  totalTowns: 25,
  broadcastRadiusKm: 100,
  // Social followers, podcast downloads and the NFP count were unsourced round
  // numbers. Do not re-add a figure here without a source we can point a
  // regulator at — the platforms report their own counts.
  yearsBroadcasting: 37, // since 1989
};
