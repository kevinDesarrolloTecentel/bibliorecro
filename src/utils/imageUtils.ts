/// <reference types="vite/client" />

// URL base del servidor de almacenamiento de imágenes
export const VITE_SERVER_URL: string = (
  (import.meta as any).env?.VITE_SERVER_URL ||
  'https://bibliobackend.ccelrecreo.com:1500/storage/app/public'
).replace(/\/+$/, '')

export const USER_IMAGES_URL = VITE_SERVER_URL
export const STORAGE_BASE_URL = VITE_SERVER_URL
export const DEFAULT_RECREO_IMAGE = `${VITE_SERVER_URL}/elrecreo.png`

const safeEncodeURI = (str: string): string => {
  try {
    return encodeURI(decodeURI(str))
  } catch {
    return encodeURI(str)
  }
}

export const getUserImageUrl = (fotoRaw?: string | null): string => {
  if (!fotoRaw || typeof fotoRaw !== 'string') {
    return DEFAULT_RECREO_IMAGE
  }
  const cleanFoto = fotoRaw.trim()
  if (!cleanFoto || cleanFoto === 'null' || cleanFoto === 'undefined') {
    return DEFAULT_RECREO_IMAGE
  }

  // 1. Si el archivo es un PDF guardado en el campo foto, mostrar la foto por defecto elrecreo.png
  if (cleanFoto.toLowerCase().endsWith('.pdf') || cleanFoto.toLowerCase().includes('.pdf')) {
    return DEFAULT_RECREO_IMAGE
  }

  // 2. Si es cualquier variación de el recreo (ej. "EL RECREO.jpg", "el recreo.jpg", etc.), mapear a la foto real elrecreo.png
  if (cleanFoto.toLowerCase().includes('recreo')) {
    return DEFAULT_RECREO_IMAGE
  }

  // 3. Si viene como imagen Base64 pura o data URI
  if (cleanFoto.startsWith('data:image/')) {
    return cleanFoto
  }

  if (cleanFoto.length > 100 && !cleanFoto.includes('/') && !cleanFoto.includes('.')) {
    return `data:image/jpeg;base64,${cleanFoto}`
  }

  // 4. Si ya es una URL completa
  if (cleanFoto.startsWith('http://') || cleanFoto.startsWith('https://')) {
    return safeEncodeURI(cleanFoto)
  }

  // 5. Concatenar con la URL base del almacenamiento
  const normalized = cleanFoto.replace(/^\/+/, '')
  return `${VITE_SERVER_URL}/${safeEncodeURI(normalized)}`
}

export default {
  VITE_SERVER_URL,
  USER_IMAGES_URL,
  STORAGE_BASE_URL,
  DEFAULT_RECREO_IMAGE,
  getUserImageUrl,
}
