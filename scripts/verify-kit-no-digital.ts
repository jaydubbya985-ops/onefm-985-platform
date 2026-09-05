/**
 * Media kit leftover invented digital inventory.
 * /#/media-kit sold Website Banner / Newsletter Mention / Social Post as if
 * they were a published FM card. Instagram, newsletter, and website-banner
 * inventory is not a published station product — do not invent it here.
 *
 * Does not restamp #412 volume-discount leftover, #406 worldwide, #407
 * leftover podcasts, #229 CRP, #278 Q1 2026, #405 sponsor Instagram counts,
 * or #169 InventoryLadder digital mentions.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const kit = readFileSync(resolve('src/pages/MediaKit.tsx'), 'utf8');

const invented = ['Website Banner', 'Newsletter Mention', 'Social Post'];
for (const label of invented) {
  if (kit.includes(label)) {
    throw new Error(`MediaKit still sells invented digital inventory: ${label}`);
  }
}

if (!kit.includes('does not sell website banners')) {
  throw new Error('MediaKit lost the honest digital-inventory sentence');
}

if (!kit.includes('Live Read') || !kit.includes('Standard Spot')) {
  throw new Error('MediaKit lost FM inventory rows');
}

console.log('verify-kit-no-digital: media kit no longer sells invented digital inventory');
