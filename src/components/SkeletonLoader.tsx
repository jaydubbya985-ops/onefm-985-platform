import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

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

export function SkeletonLoader({ variant = 'card', count = 1, className }: SkeletonLoaderProps) {
  return (
    <div role="status" aria-label="Loading content" className={cn('space-y-4', className)}>
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
        <Skeleton className="h-5 w-32 mx-auto bg-one-border" />
        <Skeleton className="h-12 w-full max-w-[400px] mx-auto bg-one-border" />
        <Skeleton className="h-4 w-full max-w-[300px] mx-auto bg-one-border" />
        <div className="pt-4">{renderVariant(variant)}</div>
      </div>
    </div>
  )
}
