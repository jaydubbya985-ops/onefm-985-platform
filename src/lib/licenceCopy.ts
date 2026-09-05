/**
 * Public licence chrome.
 *
 * Sourced ACMA facts (stationHistory ACMA_FACTS / fm985.com.au/about / Wikipedia 3ONE):
 * callsign 3ONE, community FM from Shepparton, licensed 1 April 1989.
 *
 * Do not publish 1385226/1 as an ACMA transmitter number. That figure appears on
 * the station's own podcast boilerplate as the APRA AMCOS simulcast / online
 * licence (Ivy.fm / Apple Podcasts ONE FM listings), not the broadcast licence.
 */
import { BRAND } from '@/lib/brand'

/** Footer / legal bar — callsign + licensed year. No leftover APRA-as-ACMA number. */
export function formatLicenceChrome(): string {
  return `${BRAND.callsign} · licensed ${BRAND.licensed}`
}

/** True when copy dresses leftover APRA 1385226/1 as an ACMA licence. */
export function isLeftoverApraAsAcma(text: string): boolean {
  return /ACMA[\s\S]{0,48}1385226/i.test(text)
}
