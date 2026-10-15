import Cookies from 'js-cookie'
import CryptoJS from 'crypto-js'


export const ENCRYPTION_KEY =
  ((import.meta as any).env?.VITE_ENCRYPTION_KEY as string) || 'clave_token'

export const AUTH_COOKIE_NAME = 'tk'
export const USER_STORAGE_KEY = 'userData'

//Encriptacion Aes
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

export const encryptToken = encryptData
export const decryptToken = decryptData


//Gestion de cookies
export const getCookieOptions = (_isRemember: boolean = false, expSeconds: number = 3600): Cookies.CookieAttributes => {
  return {
    path: '/',
    sameSite: 'lax',
    secure: typeof window !== 'undefined' && window.location.protocol === 'https:',
    expires: new Date(Date.now() + (expSeconds || 3600) * 1000),
  }
}

// El token ya NO se almacena en localStorage por seguridad y para que resida únicamente en Cookies
export const saveTokenStorage = (_rawToken?: string): void => {
  if (typeof window === 'undefined') return
  try {
    ;['kt', 'token', 'authToken'].forEach((k) => window.localStorage.removeItem(k))
  } catch {}
}

// Obtener token (obsoleto, retorna null para forzar uso exclusivo de Cookies)
export const getTokenStorage = (): string | null => {
  return null
}

// Guardar el token exclusivamente en Cookie ('tk') con la expiración del backend
export const saveAuthCookie = (rawToken: string, isRemember: boolean = false, expSeconds: number = 3600): void => {
  try {
    const encrypted = encryptData(rawToken, ENCRYPTION_KEY)
    Cookies.set(AUTH_COOKIE_NAME, encrypted, getCookieOptions(isRemember, expSeconds))
    // Limpieza de cualquier copia previa en localStorage
    saveTokenStorage()
  } catch (e) {
    console.error('[storage] Error guardando token en cookie:', e)
  }
}

export const getAuthCookie = (): string | null => {
  try {
    const cookie =
      Cookies.get(AUTH_COOKIE_NAME) ||
      Cookies.get('tk') ||
      Cookies.get('token')

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
    const cookieNames = [AUTH_COOKIE_NAME, 'token']
    cookieNames.forEach((name) => {
      Cookies.remove(name, { path: '/' })
      Cookies.remove(name)
      if (typeof document !== 'undefined') {
        document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; Max-Age=0;`
      }
    })
  } catch { }
}

//Gestion de localstorage
export const saveUserStorage = (user: any, _isRemember: boolean = true): void => {
  if (!user || typeof window === 'undefined') return
  try {
    const {
      token: _t,
      access_token: _at,
      accessToken: _at2,
      jwt: _jwt,
      api_token: _apt,
      authorization: _auth,
      authorisation: _auth2,
      PASSWORD_USUARIO: _p1,
      password: _p2,
      contrasena: _p3,
      clave: _p4,
      ...safeUser
    } = user

    const serialized = JSON.stringify(safeUser)

    // Guardar en ambos storages la información legible del usuario
    window.localStorage.setItem(USER_STORAGE_KEY, serialized)
    window.sessionStorage.setItem(USER_STORAGE_KEY, serialized)
  } catch (e) {
    console.error('[storage] Error guardando usuario en storage:', e)
  }
}

//Obtener los datos del usuario desde localstorage
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

    if (parsed && typeof parsed === 'object') {
      delete parsed.token
      delete parsed.PASSWORD_USUARIO
      delete parsed.password
      delete parsed.contrasena
      delete parsed.clave
    }

    return parsed
  } catch {
    return null
  }
}

export const clearAllAuthStorage = (): void => {
  removeAuthCookie()
  if (typeof window !== 'undefined') {
    try {
      window.sessionStorage.clear()
    } catch { }

    try {
      window.localStorage.removeItem(USER_STORAGE_KEY)
      window.localStorage.removeItem('biblio_permisos_cache')
      window.localStorage.removeItem('biblio_permisos_sync_time')
      ;['kt', 'token', 'authToken'].forEach((k) => window.localStorage.removeItem(k))
    } catch { }
  }
}

export default {
  ENCRYPTION_KEY,
  AUTH_COOKIE_NAME,
  USER_STORAGE_KEY,
  encryptData,
  decryptData,
  saveTokenStorage,
  getTokenStorage,
  saveAuthCookie,
  getAuthCookie,
  removeAuthCookie,
  saveUserStorage,
  getUserStorage,
  clearAllAuthStorage,
}
