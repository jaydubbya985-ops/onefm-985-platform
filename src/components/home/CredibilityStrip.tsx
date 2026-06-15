import { BRAND } from '@/lib/brand'

const FACTS = [
  { label: 'Organisation', value: 'Goulburn Valley Community Radio Inc.' },
  { label: 'Callsign', value: BRAND.callsign },
  { label: 'Frequency', value: `${BRAND.frequency} FM` },
  { label: 'Licensed', value: String(BRAND.licensed) },
  { label: 'Region', value: 'Goulburn Murray / Goulburn Valley' },
  { label: 'Contact', value: 'admin@fm985.com.au' },
] as const

export function CredibilityStrip() {
  return (
    <section className="border-y border-one-border bg-[#080F1C]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {FACTS.map((f) => (
            <div key={f.label}>
              <p className="font-label text-[10px] text-one-gold uppercase tracking-wider mb-1">{f.label}</p>
              <p className="font-body-small text-one-white text-sm leading-snug">{f.value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
