import { BRAND, LOGO } from '@/lib/brand'
import { STATION_PHOTOS } from '@/lib/stationPhotos'
import {
  BREAKFAST_DAYS,
  CIVIC,
  COUNTRY_AND_GOLD,
  DIGITAL,
  GVL_FINALS_2026,
  MULTICULTURAL,
  NIRS_AFL,
  REACH,
  SUPER_SATURDAY,
} from '@/data/proposalTruth'
import { CENSUS_SOURCE, GROWTH_SOURCE, fastestGrowingTowns, townsWithForecast, largestTowns } from '@/data/townForecast'

export interface ProposalDeckView {
  companyName: string
  contactName?: string
  packageName?: string
  term?: string
  number?: string
  investmentLabel?: string
  clientLogoDataUrl?: string | null
  preparedOn?: string
}

function Page({
  children,
  photo,
  dark,
}: {
  children: React.ReactNode
  photo?: string
  dark?: boolean
}) {
  return (
    <section
      data-proposal-page
      className={`relative w-full overflow-hidden ${dark ? 'bg-[#071D3A] text-white' : 'bg-white text-[#101010]'}`}
      style={{ aspectRatio: '210 / 297' }}
    >
      {photo ? (
        <>
          <img src={photo} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#071D3A] via-[#071D3A]/50 to-[#071D3A]/20" />
        </>
      ) : null}
      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#E51636]" />
      <div className="relative h-full p-[7%] flex flex-col">{children}</div>
    </section>
  )
}

function Source({ children }: { children: string }) {
  return <p className="text-[8px] uppercase tracking-[0.16em] text-current/45 mt-auto pt-4">{children}</p>
}

function LogoPlate({ src, alt, empty }: { src?: string | null; alt: string; empty?: string }) {
  return (
    <div className="h-14 w-36 bg-white rounded-md flex items-center justify-center p-2 shrink-0 shadow-sm">
      {src ? (
        <img src={src} alt={alt} className="max-h-12 max-w-full object-contain" />
      ) : (
        <p className="text-[8px] text-center text-[#1B458F]/70 leading-tight px-1">{empty}</p>
      )}
    </div>
  )
}

/** Screen preview of the six-page designed proposal. Station photos only. Real client file or an empty plate. */
export function ProposalDeck({ view }: { view: ProposalDeckView }) {
  const company = view.companyName.trim() || 'Your business'
  const fastest = fastestGrowingTowns(5)
  const largest = townsWithForecast(largestTowns(8))
  const date =
    view.preparedOn ??
    new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="bg-[#E8E4DC] space-y-4">
      <Page photo={STATION_PHOTOS.gvlNightPanorama} dark>
        <div className="flex items-start justify-between gap-4">
          <img src={LOGO.reversed} alt={`${BRAND.fullName} logo`} className="h-12 w-auto object-contain object-left" />
          <LogoPlate
            src={view.clientLogoDataUrl}
            alt={`${company} logo`}
            empty="Client logo — drop their real file"
          />
        </div>
        <div className="mt-auto">
          <p className="text-[10px] uppercase tracking-[0.28em] text-[#E51636] font-semibold">
            Partnership proposal · {view.number ?? date}
          </p>
          <h1 className="font-poster uppercase text-[clamp(28px,5vw,44px)] leading-[0.95] mt-3 text-white">
            Prepared for
            <br />
            {company}
          </h1>
          <p className="mt-4 text-white/80 text-sm max-w-md">
            {REACH.org}. Live local radio across {REACH.towns} towns.
            It is GVL finals time now.
          </p>
          <p className="mt-6 text-3xl font-bold tabular-nums">{REACH.weeklyListeners.toLocaleString()}</p>
          <p className="text-[11px] text-white/60">Est. weekly listeners · ABS 2021 via townData</p>
        </div>
      </Page>

      <Page>
        <p className="text-[10px] uppercase tracking-[0.22em] text-[#E51636] font-semibold">The coverage</p>
        <h2 className="font-poster uppercase text-3xl mt-2 leading-tight">A regional voice, not a national stream.</h2>
        <div className="grid grid-cols-3 gap-3 mt-6">
          {[
            { n: REACH.weeklyListeners.toLocaleString(), l: 'Weekly listeners' },
            { n: String(REACH.towns), l: 'Towns' },
            { n: `${REACH.radiusKm} km`, l: 'Radius' },
          ].map((stat) => (
            <div key={stat.l} className="border-t-2 border-[#E51636] pt-3">
              <p className="text-3xl font-bold tabular-nums text-[#1B458F]">{stat.n}</p>
              <p className="text-[11px] text-gray-600 mt-1">{stat.l}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 text-[11px]">
          <div className="grid grid-cols-[1fr_70px_52px_70px] gap-1 text-[9px] uppercase tracking-wider text-gray-400 pb-1 border-b border-[#E51636]">
            <span>Town</span>
            <span>ABS 2021</span>
            <span>Growth</span>
            <span>2026 fcast</span>
          </div>
          {largest.map((town) => (
            <div key={town.name} className="grid grid-cols-[1fr_70px_52px_70px] gap-1 border-b border-gray-100 py-1.5">
              <span>{town.name}</span>
              <span className="tabular-nums text-gray-600">{town.population2021.toLocaleString()}</span>
              <span className="tabular-nums">+{town.growthRate}%</span>
              <span className="tabular-nums font-semibold">{town.forecast2026.toLocaleString()}</span>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-gray-500 mt-3">
          Fastest stored growth: {fastest.map((t) => `${t.name} +${t.growthRate}%`).join(' · ')}
        </p>
        <Source>{`${CENSUS_SOURCE}. ${GROWTH_SOURCE}.`}</Source>
      </Page>

      <Page photo={STATION_PHOTOS.gvlCrowdStands} dark>
        <p className="text-[10px] uppercase tracking-[0.22em] text-[#E51636] font-semibold">Finals time now</p>
        <h2 className="font-poster uppercase text-3xl mt-2 leading-tight">GVL and KDL on the local air.</h2>
        <p className="text-sm text-white/80 mt-4 max-w-md leading-relaxed">
          Home-and-away closed {GVL_FINALS_2026.homeAndAwayLast}. First finals weekend{' '}
          {GVL_FINALS_2026.firstFinalsWeekend}. Preliminary {GVL_FINALS_2026.preliminaryFinal}. Grand
          final {GVL_FINALS_2026.grandFinal}.
        </p>
        <ul className="mt-5 space-y-1.5 text-sm text-white/90">
          <li>Super Saturday · {SUPER_SATURDAY.presenters}</li>
          <li>{SUPER_SATURDAY.lineup.join(' · ')}</li>
          <li>{NIRS_AFL.friday}</li>
          <li>{NIRS_AFL.sunday}</li>
        </ul>
        <p className="text-xs text-white/60 mt-4 leading-relaxed">{NIRS_AFL.aflwNote}</p>
        <Source>{`${GVL_FINALS_2026.source}. ${NIRS_AFL.source}.`}</Source>
      </Page>

      <Page>
        <p className="text-[10px] uppercase tracking-[0.22em] text-[#E51636] font-semibold">The sound</p>
        <h2 className="font-poster uppercase text-3xl mt-2 leading-tight">Country, gold, niche. News that prefers truth.</h2>
        <div className="grid grid-cols-5 gap-1.5 mt-5">
          {BREAKFAST_DAYS.map((slot) => (
            <div key={slot.day} className="bg-[#F4F7FB] rounded-md p-2 border-t-2 border-[#E51636]">
              <p className="text-[9px] uppercase tracking-wider text-[#E51636]">{slot.day}</p>
              <p className="text-[11px] font-semibold mt-1 leading-tight">{slot.host}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-6 mt-6">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-gray-500">Country</p>
            <ul className="mt-2 text-sm space-y-1">
              {COUNTRY_AND_GOLD.country.map((show) => (
                <li key={show}>{show}</li>
              ))}
            </ul>
            <p className="text-sm mt-3">{COUNTRY_AND_GOLD.decades}</p>
            <p className="text-sm">{COUNTRY_AND_GOLD.windingBack}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-gray-500">Diverse programming</p>
            <ul className="mt-2 text-sm space-y-1">
              {MULTICULTURAL.shows.map((show) => (
                <li key={show}>{show}</li>
              ))}
            </ul>
          </div>
        </div>
        <p className="text-sm text-gray-700 mt-5 leading-relaxed">
          News on this station is local and accountable. We do not sell sensationalism as reach.
        </p>
        <Source>{COUNTRY_AND_GOLD.source}</Source>
      </Page>

      <Page photo={STATION_PHOTOS.studioExteriorRainbow} dark>
        <p className="text-[10px] uppercase tracking-[0.22em] text-[#E51636] font-semibold">Civic value</p>
        <h2 className="font-poster uppercase text-3xl mt-2 leading-tight">Emergency voice. Council. Road safety.</h2>
        <p className="text-sm text-white/85 mt-4 leading-relaxed max-w-lg">{CIVIC.emergencyLead}</p>
        <p className="text-sm text-white/75 mt-3 leading-relaxed max-w-lg">{CIVIC.emergencyFlood}</p>
        <div className="mt-5 border border-white/20 rounded-lg p-4 max-w-lg">
          <p className="text-[10px] uppercase tracking-wider text-[#E51636]">Community service announcements</p>
          <p className="text-sm mt-2">{CIVIC.csa.text}</p>
          <p className="text-xs text-white/60 mt-2">
            Annual initiative count: {CIVIC.csa.countLabel}. {CIVIC.csa.jayClaim}
          </p>
        </div>
        <p className="text-sm text-white/80 mt-4">{CIVIC.roadSafety}</p>
        <Source>{CIVIC.source}</Source>
      </Page>

      <Page>
        <p className="text-[10px] uppercase tracking-[0.22em] text-[#E51636] font-semibold">Where else they hear you</p>
        <h2 className="font-poster uppercase text-3xl mt-2 leading-tight">Facebook and SoundCloud are live.</h2>
        <p className="text-sm mt-4 text-[#1B458F]">{DIGITAL.facebook.replace('https://www.', '')}</p>
        <p className="text-sm mt-1 text-[#1B458F]">{DIGITAL.soundcloud.replace('https://', '')}</p>
        <p className="text-xs text-gray-500 mt-2">{DIGITAL.note}</p>
        <div className="mt-8 border-t-2 border-[#E51636] pt-6">
          <p className="text-[10px] uppercase tracking-wider text-gray-500">Investment</p>
          <p className="text-2xl font-bold mt-1">{view.packageName || 'Package confirmed in writing'}</p>
          {view.term ? <p className="text-sm text-gray-600 mt-1">{view.term}</p> : null}
          {view.investmentLabel ? (
            <p className="text-4xl font-bold text-[#1B458F] mt-2 tabular-nums">{view.investmentLabel}</p>
          ) : (
            <p className="text-sm text-gray-600 mt-2">Amount confirmed with Jay before this leaves the building.</p>
          )}
          {view.contactName ? <p className="text-sm text-gray-600 mt-3">Attention: {view.contactName}</p> : null}
        </div>
        <div className="flex items-end justify-between mt-8 gap-4">
          <img src={LOGO.primary} alt="" className="h-10 w-auto object-contain" />
          <LogoPlate src={view.clientLogoDataUrl} alt={`${company} logo`} empty="Lockup waits for their file" />
        </div>
        <p className="text-[11px] text-gray-500 mt-6 leading-relaxed">
          {REACH.org} · ABN {BRAND.abn} · {BRAND.address} · {BRAND.phone} · {BRAND.email}
        </p>
        <Source>No stock photography. Station images from /public/assets/images/. Client mark only if a real file was dropped.</Source>
      </Page>
    </div>
  )
}

/** Public-site sample: empty client plate, never a fake sponsor. */
export function ProposalLockupSample() {
  return (
    <div className="relative overflow-hidden rounded-2xl min-h-[420px] border border-white/12">
      <img
        src={STATION_PHOTOS.gvlNightPanorama}
        alt="GVL night panorama — ONE FM station photography"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#071D3A] via-[#071D3A]/55 to-black/20" />
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#E51636]" />
      <div className="relative p-6 md:p-10 flex flex-col min-h-[420px]">
        <div className="flex items-start justify-between gap-4">
          <img src={LOGO.reversed} alt="ONE FM 98.5" className="h-12 w-auto" />
          <div className="h-14 w-36 bg-white rounded-md flex items-center justify-center p-2">
            <p className="text-[9px] text-center text-[#1B458F]/80 leading-tight">
              Your logo
              <br />
              send the real file
            </p>
          </div>
        </div>
        <div className="mt-auto">
          <p className="text-[11px] uppercase tracking-[0.28em] text-[#E51636] font-semibold">
            Partnership proposal · finals time now
          </p>
          <h3 className="font-poster uppercase text-white text-[clamp(28px,5vw,48px)] leading-[0.95] mt-3">
            Prepared for
            <br />
            your business
          </h3>
          <p className="text-white/70 text-sm mt-4 max-w-md">
            Est. {REACH.weeklyListeners.toLocaleString()} weekly listeners · {REACH.towns} towns ·{' '}
            {REACH.radiusKm} km. Sourced from ABS 2021. Staff set your mark on the cover — we do not
            invent one.
          </p>
        </div>
      </div>
    </div>
  )
}