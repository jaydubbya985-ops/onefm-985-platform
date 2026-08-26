import { useRef, type ChangeEvent, type DragEvent } from 'react'
import { ImagePlus, X } from 'lucide-react'
import { CLIENT_LOGO_ACCEPT, readClientLogoFile } from '@/lib/clientLogos'

export interface ClientLogoValue {
  dataUrl: string
  width: number
  height: number
}

interface ClientLogoSlotProps {
  value: ClientLogoValue | null
  companyName?: string
  onChange: (logo: ClientLogoValue | null) => void
  onError?: (message: string) => void
  tone?: 'light' | 'dark'
}

export function ClientLogoSlot({
  value,
  companyName,
  onChange,
  onError,
  tone = 'light',
}: ClientLogoSlotProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const dark = tone === 'dark'

  const applyFile = async (file: File | undefined) => {
    if (!file) return
    try {
      const logo = await readClientLogoFile(file)
      onChange({ dataUrl: logo.dataUrl, width: logo.width, height: logo.height })
    } catch (err) {
      onError?.(err instanceof Error ? err.message : 'Could not use that file')
    }
  }

  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    await applyFile(file)
  }

  const handleDrop = async (e: DragEvent) => {
    e.preventDefault()
    await applyFile(e.dataTransfer.files?.[0])
  }

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      className={
        dark
          ? 'rounded-xl border border-dashed border-white/25 bg-[#101010] p-4'
          : 'rounded-xl border border-dashed border-[#1B458F]/35 bg-[#F4F7FB] p-4'
      }
    >
      <input
        ref={inputRef}
        type="file"
        accept={CLIENT_LOGO_ACCEPT}
        className="hidden"
        onChange={handleFile}
      />
      {value ? (
        <div className="flex items-center gap-4">
          <div className="h-16 w-40 bg-white rounded-md border border-black/10 flex items-center justify-center p-2">
            <img
              src={value.dataUrl}
              alt={companyName ? `${companyName} logo` : 'Client logo'}
              className="max-h-14 max-w-full object-contain"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className={dark ? 'text-xs text-white/70' : 'text-xs text-gray-600'}>
              Real client mark — not generated. PNG or JPG prints on the PDF.
            </p>
            <button
              type="button"
              onClick={() => onChange(null)}
              className={
                dark
                  ? 'mt-1 text-xs text-red-300 inline-flex items-center gap-1'
                  : 'mt-1 text-xs text-red-700 inline-flex items-center gap-1'
              }
            >
              <X className="w-3 h-3" /> Remove
            </button>
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => inputRef.current?.click()} className="w-full flex items-center gap-3 text-left">
          <span
            className={
              dark
                ? 'h-16 w-16 rounded-md border border-white/20 flex items-center justify-center text-[#E51636]'
                : 'h-16 w-16 rounded-md border border-[#1B458F]/30 flex items-center justify-center text-[#1B458F]'
            }
          >
            <ImagePlus className="w-6 h-6" />
          </span>
          <span>
            <span className={dark ? 'block text-sm font-semibold text-white' : 'block text-sm font-semibold text-[#101010]'}>
              Drop their real logo
            </span>
            <span className={dark ? 'block text-xs text-white/55 mt-0.5' : 'block text-xs text-gray-500 mt-0.5'}>
              PNG or JPG from their brand file. We never invent a mark.
            </span>
          </span>
        </button>
      )}
    </div>
  )
}