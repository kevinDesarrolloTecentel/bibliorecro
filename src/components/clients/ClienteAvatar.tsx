import { useState, useEffect } from 'react'
import { DEFAULT_RECREO_IMAGE } from '@/utils/imageUtils'

interface ClienteAvatarProps {
  src?: string
  nombre?: string
  apellido?: string
  size?: number
  className?: string
}

export const ClienteAvatar = ({
  src,
  nombre,
  apellido,
  size = 140,
  className = '',
}: ClienteAvatarProps) => {
  const [imgSrc, setImgSrc] = useState(src || DEFAULT_RECREO_IMAGE)

  useEffect(() => {
    setImgSrc(src || DEFAULT_RECREO_IMAGE)
  }, [src])

  const fullName = `${nombre || ''} ${apellido || ''}`.trim()

  return (
    <img
      src={imgSrc}
      alt={fullName || 'Avatar de usuario'}
      className={`rounded-circle mb-2 shadow-sm border border-2 border-info bg-white ${className}`.trim()}
      style={{ width: `${size}px`, height: `${size}px`, objectFit: 'cover' }}
      onError={() => {
        if (imgSrc !== DEFAULT_RECREO_IMAGE) {
          setImgSrc(DEFAULT_RECREO_IMAGE)
        }
      }}
    />
  )
}

export default ClienteAvatar
