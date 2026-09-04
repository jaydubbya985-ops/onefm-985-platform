/**
 * Football leftover invented sponsorship team.
 * /#/football GVL enquiry success said “Our sponsorship team will be in touch”
 * and dressed a stored row as “Enquiry received”. There is no leftover
 * sponsorship team desk. The toast already split stored vs emailed.
 *
 * Does not restamp #384 thousands, #391 ROI, #403 ACMA, #389 rank badges,
 * #266 PlayHQ, #408 SponsorshipKit call centre, or #253 pipeline copy.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const page = readFileSync(resolve('src/pages/Football.tsx'), 'utf8');

if (page.includes('Our sponsorship team will be in touch')) {
  throw new Error('Football still invents a sponsorship team');
}

if (page.includes('Enquiry received')) {
  throw new Error('Football still dresses a stored enquiry as received');
}

if (!page.includes('Enquiry stored at the station') || !page.includes('Enquiry emailed to the station')) {
  throw new Error('Football lost the stored-vs-emailed GVL receipt');
}

if (!page.includes('does not invent a sponsorship team')) {
  throw new Error('Football lost the honest GVL receipt sentence');
}

console.log('verify-footy-no-team: GVL enquiry no longer invents a sponsorship team');
