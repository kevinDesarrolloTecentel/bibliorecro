// URL base del servidor de almacenamiento de imágenes
export const VITE_SERVER_URL = import.meta.env.VITE_SERVER_URL 

// URL base del servidor de reportes
export const VITE_SERVER_URL_REPORT = import.meta.env.VITE_SERVER_URL_REPORT

export const USER_IMAGES_URL = VITE_SERVER_URL
export const STORAGE_BASE_URL = VITE_SERVER_URL_REPORT
export const DEFAULT_RECREO_IMAGE = `${VITE_SERVER_URL}/elrecreo.png`

export { descargarArchivo } from './downloadUtils'

const safeEncodeURI = (str: string): string => {
  try {
    return encodeURI(decodeURI(str))
  } catch {
    return encodeURI(str)
  }
}

//Imagen por defecto
export const isRecreoPlaceholder = (foto?: string | null): boolean => {
  if (!foto || typeof foto !== 'string') return true
  const clean = foto.trim().toLowerCase()
  if (!clean || clean === 'null' || clean === 'undefined') return true

  // Si es un archivo PDF guardado en el campo foto
  if (clean.endsWith('.pdf') || clean.includes('.pdf')) return true

  // Extraer únicamente el nombre de archivo
  const filename = clean.split('?')[0].split('#')[0].split('/').pop() || ''
  const decodedFilename = decodeURIComponent(filename)

  if (
    decodedFilename === 'elrecreo.png' ||
    decodedFilename === 'elrecreo.jpg' ||
    decodedFilename === 'recreo.png' ||
    decodedFilename === 'recreo.jpg' ||
    decodedFilename.startsWith('el recreo') ||
    decodedFilename.startsWith('el_recreo') ||
    decodedFilename.startsWith('recreo_')
  ) {
    return true
  }

  return false
}

//Retorna la URL completa o base64 de la foto del usuario
export const getUserPhotoOrNull = (fotoRaw?: string | null): string | null => {
  if (!fotoRaw || typeof fotoRaw !== 'string') return null
  const cleanFoto = fotoRaw.trim()
  if (!cleanFoto || cleanFoto === 'null' || cleanFoto === 'undefined') return null

  // Si viene como imagen Base64 pura o data URI
  if (cleanFoto.startsWith('data:image/')) {
    return cleanFoto
  }
  if (cleanFoto.length > 100 && !cleanFoto.includes('/') && !cleanFoto.includes('.')) {
    return `data:image/jpeg;base64,${cleanFoto}`
  }

  // Si es el marcador de posición de El Recreo o PDF
  if (isRecreoPlaceholder(cleanFoto)) {
    return null
  }

  // Si ya es una URL completa (http:// o https://)
  if (cleanFoto.startsWith('http://') || cleanFoto.startsWith('https://')) {
    return safeEncodeURI(cleanFoto)
  }

  // Concatenar con la URL base del almacenamiento limpiando prefijos redundantes
  let path = cleanFoto.replace(/^\/+/, '')
  if (path.startsWith('storage/app/public/')) {
    path = path.slice('storage/app/public/'.length)
  } else if (path.startsWith('app/public/')) {
    path = path.slice('app/public/'.length)
  } else if (path.startsWith('storage/')) {
    path = path.slice('storage/'.length)
  }

  return `${VITE_SERVER_URL}/${safeEncodeURI(path)}`
}


//Retorna la URL de la foto del usuario o la imagen por defecto de El Recreo si no tiene.
export const getUserImageUrl = (fotoRaw?: string | null): string => {
  const customPhoto = getUserPhotoOrNull(fotoRaw)
  return customPhoto || DEFAULT_RECREO_IMAGE
}

export default {
  VITE_SERVER_URL,
  VITE_SERVER_URL_REPORT,
  USER_IMAGES_URL,
  STORAGE_BASE_URL,
  DEFAULT_RECREO_IMAGE,
  isRecreoPlaceholder,
  getUserPhotoOrNull,
  getUserImageUrl,
}
