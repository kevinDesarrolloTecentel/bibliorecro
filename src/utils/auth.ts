import Cookies from 'js-cookie'
import CryptoJS from 'crypto-js'
import { UserData } from '@/slices/authSlice'

export const ENCRYPTION_KEY: string = import.meta.env.VITE_ENCRYPTION_KEY as string
export const AUTH_COOKIE_NAME = 'tk'
export const USER_STORAGE_KEY = 'userData'

/**
 * Encriptación AES de texto mediante CryptoJS
 */
export const encryptData = (text: string): string => {
  return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString()
}

/**
 * Desencriptación AES de texto cifrado mediante CryptoJS
 */
export const decryptData = (ciphertext: string): string | null => {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY)
    const decrypted = bytes.toString(CryptoJS.enc.Utf8)
    return decrypted || null
  } catch {
    return null
  }
}

/**
 * Opciones de seguridad para la cookie del token
 */
const getCookieOptions = (expSeconds: number = 3600): Cookies.CookieAttributes => {
  const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:'
  const isRecreoDomain = typeof window !== 'undefined' && window.location.hostname.endsWith('ccelrecreo.com')

  return {
    path: '/',
    sameSite: isHttps ? 'none' : 'lax',
    secure: isHttps,
    domain: isRecreoDomain ? '.ccelrecreo.com' : undefined,
    expires: new Date(Date.now() + expSeconds * 1000),
  }
}

/**
 * Guarda el token de sesión en la cookie 'tk' de forma encriptada
 */
export const saveAuthCookie = (rawToken: string, expSeconds: number = 3600): void => {
  try {
    const encrypted = rawToken.startsWith('U2FsdGVkX1') ? rawToken : encryptData(rawToken)
    Cookies.set(AUTH_COOKIE_NAME, encrypted, getCookieOptions(expSeconds))
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('tk')
    }
  } catch (e) {
    console.error('[auth] Error guardando token en cookie:', e)
  }
}

/**
 * Obtiene el token de autenticación desencriptado para su consumo en llamadas API
 */
export const getStoredToken = (): string | null => {
  try {
    const cookie = Cookies.get(AUTH_COOKIE_NAME)
    if (!cookie) return null
    if (cookie.startsWith('U2FsdGVkX1')) {
      return decryptData(cookie)
    }
    return cookie
  } catch {
    return null
  }
}

/**
 * Elimina las cookies de autenticación locales de forma segura
 */
export const removeAuthCookie = (): void => {
  try {
    Cookies.remove(AUTH_COOKIE_NAME, { path: '/' })
    Cookies.remove(AUTH_COOKIE_NAME)
    Cookies.remove('__Host-biblio_access_token', { path: '/' })
    Cookies.remove('__Host-biblio_access_token')
    if (typeof document !== 'undefined') {
      document.cookie = `${AUTH_COOKIE_NAME}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; Max-Age=0;`
      document.cookie = `__Host-biblio_access_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; Max-Age=0;`
    }
  } catch {}
}

/**
 * Guarda los datos esenciales del usuario en storage
 */
export const saveUserStorage = (user: UserData): void => {
  if (!user || typeof window === 'undefined') return
  try {
    const safeUser: UserData = {
      ID_USUARIO: user.ID_USUARIO,
      NICK_USUARIO: user.NICK_USUARIO,
      NOMBRES_USUARIO: user.NOMBRES_USUARIO,
      ESTADO_USUARIO: user.ESTADO_USUARIO,
      FECHA_REGISTRO: user.FECHA_REGISTRO,
      expires_in: user.expires_in,
    }
    const serialized = JSON.stringify(safeUser)
    window.localStorage.setItem(USER_STORAGE_KEY, serialized)
    window.sessionStorage.setItem(USER_STORAGE_KEY, serialized)
  } catch (e) {
    console.error('[auth] Error guardando usuario en storage:', e)
  }
}

/**
 * Recupera los datos del usuario almacenados en storage
 */
export const getUserStorage = (): UserData | null => {
  if (typeof window === 'undefined') return null
  try {
    const raw =
      window.sessionStorage.getItem(USER_STORAGE_KEY) ||
      window.localStorage.getItem(USER_STORAGE_KEY)

    if (!raw) return null

    let parsed: any = null
    if (raw.startsWith('U2FsdGVkX1')) {
      const dec = decryptData(raw)
      if (dec) parsed = JSON.parse(dec)
    } else {
      parsed = JSON.parse(raw)
    }

    return parsed && typeof parsed === 'object' ? (parsed as UserData) : null
  } catch {
    return null
  }
}

/**
 * Decodifica un payload JWT en base64 de forma segura en el cliente.
 */
export const decodeJWT = <T = unknown>(token: string): T | null => {
  try {
    let cleanToken = token
    if (cleanToken && cleanToken.startsWith('U2FsdGVkX1')) {
      const decrypted = decryptData(cleanToken)
      if (decrypted) cleanToken = decrypted
    }
    const parts = cleanToken.split('.')
    if (parts.length < 2) return null
    const base64Url = parts[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(decodeURIComponent(escape(atob(base64)))) as T
  } catch {
    return null
  }
}

/**
 * Verifica si un usuario se encuentra en estado activo en el sistema.
 */
export const isUserActive = (user?: UserData | null): boolean => {
  const targetUser: any = user || getUserStorage()
  if (!targetUser) return true

  const rawEstado = targetUser.ESTADO_USUARIO
  if (
    rawEstado !== undefined &&
    rawEstado !== null &&
    (String(rawEstado) === '0' || String(rawEstado).toLowerCase() === 'inactivo' || rawEstado === false)
  ) {
    return false
  }
  return true
}

/**
 * Valida si la sesión actual del usuario es válida localmente.
 * Cuando el backend opera con cookie HttpOnly (__Host-biblio_access_token),
 * JavaScript no puede leer el token directamente por protección de seguridad del navegador.
 * La validez y vigencia de la sesión la garantiza el servidor en cada llamada API (devolviendo 401 si expiró).
 * Localmente se verifica que exista el usuario y que su estado no sea inactivo.
 */
export const isSessionValid = (user?: UserData | null): boolean => {
  const targetUser = user || getUserStorage()
  if (!targetUser) return false

  if (!isUserActive(targetUser)) return false

  // Si existe un token accesible por JS (modo de compatibilidad/fallback), verificar si expiró en cliente
  const token = getStoredToken()
  if (token) {
    const payload = decodeJWT<any>(token)
    if (payload && typeof payload.exp === 'number') {
      const nowInSeconds = Math.floor(Date.now() / 1000)
      if (payload.exp < nowInSeconds) {
        return false
      }
    }
  }

  return true
}

/**
 * Recupera los datos básicos del usuario autenticado desde el almacenamiento local.
 */
export const getStoredUser = (): UserData | null => {
  try {
    const parsed = getUserStorage()
    const token = getStoredToken()
    const tokenData = token ? decodeJWT<any>(token) : null

    if (!parsed && !tokenData) return null

    const user: UserData = {
      ID_USUARIO: parsed?.ID_USUARIO || tokenData?.ID_USUARIO,
      NICK_USUARIO: parsed?.NICK_USUARIO || '',
      NOMBRES_USUARIO: parsed?.NOMBRES_USUARIO || '',
      ESTADO_USUARIO: parsed?.ESTADO_USUARIO ?? 1,
      FECHA_REGISTRO: parsed?.FECHA_REGISTRO || '',
      expires_in: Number(parsed?.expires_in || 3600),
    }

    if (isSessionValid(user)) {
      return user
    }

    clearAuthSession()
    return null
  } catch (e) {
    console.error('[auth] Error recuperando usuario almacenado:', e)
    return null
  }
}

/**
 * Cierra la sesión activa y elimina todos los datos y cookies del usuario.
 */
export const clearAuthSession = (): void => {
  removeAuthCookie()
  if (typeof window !== 'undefined') {
    try {
      window.sessionStorage.clear()
    } catch {}

    try {
      window.localStorage.removeItem(USER_STORAGE_KEY)
    } catch {}
  }
}

/**
 * Encripta la contraseña del usuario antes de enviarla al backend mediante AES.
 */
export const encryptCredentials = <T extends Record<string, any>>(credentials: T): T => {
  if (!credentials) return credentials
  const copy: any = { ...credentials }
  if (copy.PASSWORD_USUARIO) {
    copy.PASSWORD_USUARIO = encryptData(copy.PASSWORD_USUARIO)
  }
  return copy
}
