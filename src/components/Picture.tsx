import type { ImgHTMLAttributes } from 'react'

interface PictureProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string
  webp?: boolean
}

export function Picture({ src, webp = true, alt = '', className, loading = 'lazy', decoding = 'async', ...props }: PictureProps) {
  const base = src.replace(/\.(png|jpe?g)$/i, '')

  return (
    <picture>
      {webp && <source srcSet={`${base}.webp`} type="image/webp" />}
      <img src={src} alt={alt} className={className} loading={loading} decoding={decoding} {...props} />
    </picture>
  )
}
