import Cookies from 'js-cookie'
import CryptoJS from 'crypto-js'

export const ENCRYPTION_KEY =
  import.meta.env.VITE_ENCRYPTION_KEY || 'clave_token'

export const AUTH_COOKIE_NAME = 'tk'
export const USER_STORAGE_KEY = 'userData'

// Encriptacion AES
export const encryptData = (text: string, secret: string = ENCRYPTION_KEY): string => {
  return CryptoJS.AES.encrypt(text, secret).toString()
}

export const decryptData = (ciphertext: string, secret: string = ENCRYPTION_KEY): string | null => {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, secret)
    const decrypted = bytes.toString(CryptoJS.enc.Utf8)
    return decrypted || null
  } catch {
    return null
  }
}

// Gestion de cookies
export const getCookieOptions = (_isRemember: boolean = false, expSeconds: number = 3600): Cookies.CookieAttributes => {
  const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:'
  const isRecreoDomain = typeof window !== 'undefined' && window.location.hostname.endsWith('ccelrecreo.com')

  return {
    path: '/',
    sameSite: isHttps ? 'none' : 'lax',
    secure: isHttps,
    domain: isRecreoDomain ? '.ccelrecreo.com' : undefined,
    expires: new Date(Date.now() + (expSeconds || 3600) * 1000),
  }
}

// Guardar el token en la cookie
export const saveAuthCookie = (rawToken: string, isRemember: boolean = false, expSeconds: number = 3600): void => {
  try {
    const encrypted = rawToken.startsWith('U2FsdGVkX1') ? rawToken : encryptData(rawToken, ENCRYPTION_KEY)
    Cookies.set(AUTH_COOKIE_NAME, encrypted, getCookieOptions(isRemember, expSeconds))
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('tk')
    }
  } catch (e) {
    console.error('[storage] Error guardando token en cookie:', e)
  }
}

export const getRawAuthCookie = (): string | null => {
  try {
    return Cookies.get(AUTH_COOKIE_NAME) || null
  } catch {
    return null
  }
}

export const getAuthCookie = (): string | null => {
  try {
    const cookie = Cookies.get(AUTH_COOKIE_NAME)

    if (cookie) {
      if (cookie.startsWith('U2FsdGVkX1')) {
        return decryptData(cookie, ENCRYPTION_KEY)
      }
      return cookie
    }
    return null
  } catch {
    return null
  }
}

export const removeAuthCookie = (): void => {
  try {
    const cookieNames = [AUTH_COOKIE_NAME]
    cookieNames.forEach((name) => {
      Cookies.remove(name, { path: '/' })
      Cookies.remove(name)
      if (typeof document !== 'undefined') {
        document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; Max-Age=0;`
      }
    })
  } catch { }
}

// Gestion de localstorage
export const saveUserStorage = (user: any, _isRemember: boolean = true): void => {
  if (!user || typeof window === 'undefined') return
  try {
    const safeUser = {
      NICK_USUARIO: user.NICK_USUARIO ?? '',
      NOMBRES_USUARIO: user.NOMBRES_USUARIO ?? '',
      expires_in: user.expires_in ?? 3600,
    }

    const serialized = JSON.stringify(safeUser)

    window.localStorage.setItem(USER_STORAGE_KEY, serialized)
    window.sessionStorage.setItem(USER_STORAGE_KEY, serialized)
  } catch (e) {
    console.error('[storage] Error guardando usuario en storage:', e)
  }
}

// Obtener los datos del usuario desde localstorage
export const getUserStorage = (): any | null => {
  if (typeof window === 'undefined') return null
  try {
    const raw =
      window.sessionStorage.getItem(USER_STORAGE_KEY) ||
      window.localStorage.getItem(USER_STORAGE_KEY)

    if (!raw) return null

    let parsed: any = null
    if (raw.startsWith('U2FsdGVkX1')) {
      const dec = decryptData(raw, ENCRYPTION_KEY)
      if (dec) parsed = JSON.parse(dec)
    } else {
      parsed = JSON.parse(raw)
    }

    return parsed && typeof parsed === 'object' ? parsed : null
  } catch {
    return null
  }
}

// Limpiar toda la información de auth
export const clearAllAuthStorage = (): void => {
  removeAuthCookie()
  if (typeof window !== 'undefined') {
    try {
      window.sessionStorage.clear()
    } catch { }

    try {
      window.localStorage.removeItem(USER_STORAGE_KEY)
      window.localStorage.removeItem('biblio_permisos_cache')
      window.localStorage.removeItem('biblio_permisos_modificados')
      window.localStorage.removeItem('tk')
    } catch { }
  }
}

export default {
  ENCRYPTION_KEY,
  AUTH_COOKIE_NAME,
  USER_STORAGE_KEY,
  encryptData,
  decryptData,
  saveAuthCookie,
  getAuthCookie,
  removeAuthCookie,
  saveUserStorage,
  getUserStorage,
  clearAllAuthStorage,
}
