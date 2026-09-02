import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { BRAND } from '@/lib/brand'
import { formatCoverageShort, formatWeeklyListeners } from '@/lib/coverageCopy'
import { formatGuideHours } from '@/lib/guideHours'
import { FACEBOOK_PAGE_URL, SOUNDCLOUD_PROFILE_URL } from '@/lib/socialLinks'
import { STATION_PHOTOS } from '@/lib/stationPhotos'

const COVERAGE = formatCoverageShort()
const GVL_HOURS = formatGuideHours('GVL Match of the Day')
export const CANOLA_ROAD_ALT = `Cyclists on a Goulburn Valley canola road — ${BRAND.fullName} station archive · ${COVERAGE}`

export type SkeletonVariant = 'card' | 'chart' | 'map' | 'table' | 'form' | 'text' | 'list'

interface SkeletonLoaderProps {
  variant?: SkeletonVariant
  count?: number
  className?: string
}

function CardSkeleton() {
  return (
    <div className="rounded-xl border border-one-border p-6 space-y-4 bg-[#0D1E36]/40">
      <Skeleton className="h-4 w-1/3 bg-one-border" />
      <Skeleton className="h-8 w-1/2 bg-one-border" />
      <Skeleton className="h-3 w-full bg-one-border" />
    </div>
  )
}

function TableSkeleton() {
  return (
    <div className="rounded-xl border border-one-border overflow-hidden">
      <div className="p-4 border-b border-one-border space-y-2">
        <Skeleton className="h-4 w-full bg-one-border" />
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="p-4 border-b border-one-border last:border-0 flex gap-4">
          <Skeleton className="h-4 w-24 bg-one-border" />
          <Skeleton className="h-4 flex-1 bg-one-border" />
          <Skeleton className="h-4 w-20 bg-one-border" />
        </div>
      ))}
    </div>
  )
}

function ChartSkeleton() {
  return (
    <div className="rounded-xl border border-one-border p-6 h-64 flex items-end gap-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="flex-1 bg-one-border" style={{ height: `${30 + i * 8}%` }} />
      ))}
    </div>
  )
}

function FormSkeleton() {
  return (
    <div className="space-y-4 max-w-lg">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-3 w-24 bg-one-border" />
          <Skeleton className="h-10 w-full bg-one-border" />
        </div>
      ))}
    </div>
  )
}

function ListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full bg-one-border rounded-lg" />
      ))}
    </div>
  )
}

function TextSkeleton() {
  return (
    <div className="space-y-3 max-w-2xl">
      <Skeleton className="h-8 w-2/3 bg-one-border" />
      <Skeleton className="h-4 w-full bg-one-border" />
      <Skeleton className="h-4 w-full bg-one-border" />
      <Skeleton className="h-4 w-3/4 bg-one-border" />
    </div>
  )
}

function MapSkeleton() {
  return <Skeleton className="h-96 w-full bg-one-border rounded-xl" />
}

function renderVariant(variant: SkeletonVariant) {
  switch (variant) {
    case 'card':
      return <CardSkeleton />
    case 'chart':
      return <ChartSkeleton />
    case 'map':
      return <MapSkeleton />
    case 'table':
      return <TableSkeleton />
    case 'form':
      return <FormSkeleton />
    case 'text':
      return <TextSkeleton />
    case 'list':
      return <ListSkeleton />
    default:
      return <CardSkeleton />
  }
}

/** Unused Goulburn Valley canola-road still — not a presenter portrait. */
export function SkeletonRouteStill() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-one-border aspect-[16/7] min-h-[140px]">
      <img
        src={STATION_PHOTOS.geoCyclistsCanola}
        alt={CANOLA_ROAD_ALT}
        title={CANOLA_ROAD_ALT}
        loading="eager"
        className="absolute inset-0 w-full h-full object-cover object-center"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-[#071D3A] via-[#071D3A]/55 to-[#071D3A]/15"
      />
      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
        <p className="font-label text-[10px] tracking-[0.18em] uppercase text-one-gold/80">
          {BRAND.fullName} · loading
        </p>
        <p className="mt-1 text-one-white text-sm font-medium">
          {COVERAGE}
        </p>
        <p className="text-one-muted text-xs mt-0.5">
          {formatWeeklyListeners()} — ABS 2021 via townData
        </p>
        {GVL_HOURS && (
          <p className="font-label text-[10px] tracking-[0.12em] uppercase text-one-white/50 mt-1">
            GVL Match of the Day · {GVL_HOURS}
          </p>
        )}
        <p className="mt-2 flex flex-wrap gap-3 text-[11px]">
          <a
            href={FACEBOOK_PAGE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-one-gold hover:text-one-white transition-colors"
          >
            Facebook
          </a>
          <a
            href={SOUNDCLOUD_PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-one-gold hover:text-one-white transition-colors"
          >
            SoundCloud
          </a>
        </p>
      </div>
    </div>
  )
}

export function SkeletonLoader({ variant = 'card', count = 1, className }: SkeletonLoaderProps) {
  return (
    <div role="status" aria-label="Loading content" className={cn('space-y-4 p-4 sm:p-6', className)}>
      <SkeletonRouteStill />
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} aria-hidden>{renderVariant(variant)}</div>
      ))}
    </div>
  )
}

export function PageSkeleton({ variant = 'card' }: { variant?: SkeletonVariant }) {
  return (
    <div className="w-full min-h-[50vh] bg-one-navy flex items-center justify-center px-4">
      <div className="max-w-[600px] w-full text-center space-y-6">
        <SkeletonRouteStill />
        <div className="pt-2">{renderVariant(variant)}</div>
      </div>
    </div>
  )
}
