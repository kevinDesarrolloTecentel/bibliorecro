/// <reference types="vite/client" />

// URL base del servidor de almacenamiento de imágenes
export const VITE_SERVER_URL: string = (
  (import.meta as any).env?.VITE_SERVER_URL ||
  'https://bibliobackend.ccelrecreo.com:1500/storage/app/public'
).replace(/\/+$/, '')

export const USER_IMAGES_URL = VITE_SERVER_URL
export const STORAGE_BASE_URL = VITE_SERVER_URL
export const getUserImageUrl = (fotoRaw?: string | null): string => {
  if (!fotoRaw || typeof fotoRaw !== 'string') return ''
  const cleanFoto = fotoRaw.trim()
  if (!cleanFoto) return ''

  if (
    cleanFoto.startsWith('http://') ||
    cleanFoto.startsWith('https://') ||
    cleanFoto.startsWith('data:image/')
  ) {
    return cleanFoto
  }

  if (cleanFoto.startsWith('/')) {
    return `${VITE_SERVER_URL}${cleanFoto}`
  }

  if (cleanFoto.length > 100 && !cleanFoto.includes('/') && !cleanFoto.includes('.')) {
    return `data:image/jpeg;base64,${cleanFoto}`
  }

  return `${VITE_SERVER_URL}/${cleanFoto}`
}

export default {
  VITE_SERVER_URL,
  USER_IMAGES_URL,
  getUserImageUrl,
}
