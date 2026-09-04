/**
 * Footer leftover Rate Card path.
 * FOOTER_RESOURCES labelled “Rate Card” opened leftover /sponsorship
 * packages. The published card lives on /#/media-kit.
 *
 * Does not restamp #402 Program Guide → /listen, #273 tailored PDF,
 * #229 CRP, or HashRouter #rate-card (#322).
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const nav = readFileSync(resolve('src/lib/siteNav.ts'), 'utf8');

if (!nav.includes("{ label: 'Rate Card', path: '/media-kit' }")) {
  throw new Error('Footer Rate Card no longer opens the media kit');
}

if (nav.includes("{ label: 'Rate Card', path: '/sponsorship' }")) {
  throw new Error('Footer Rate Card still opens leftover sponsorship packages');
}

console.log('verify-rate-card-path: footer Rate Card opens /media-kit');
