import CryptoJS from 'crypto-js'
import { UserData } from '@/models/auth'
import {
  ENCRYPTION_KEY,
  AUTH_COOKIE_NAME,
  USER_STORAGE_KEY,
  encryptData,
  decryptData,
  saveAuthCookie,
  getAuthCookie,
  getRawAuthCookie,
  removeAuthCookie,
  saveUserStorage,
  getUserStorage,
  clearAllAuthStorage,
} from './storage'

export {
  ENCRYPTION_KEY,
  AUTH_COOKIE_NAME,
  USER_STORAGE_KEY,
  encryptData,
  decryptData,
  saveAuthCookie,
  getAuthCookie,
  getRawAuthCookie,
  removeAuthCookie,
  saveUserStorage,
  getUserStorage,
  clearAllAuthStorage,
}

export const base64url = (source: unknown): string => {
  try {
    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(source))))
    return encoded.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  } catch {
    return ''
  }
}

export const encodeJWT = (payload: unknown, secret: string = ENCRYPTION_KEY): string => {
  const header = { alg: 'HS256', typ: 'JWT', nonce: 'a8f3b9c1-42e1-4c7b' }
  const stringifiedHeader = base64url(header)
  const stringifiedPayload = base64url(payload)

  const tokenInput = `${stringifiedHeader}.${stringifiedPayload}`
  const signatureHash = CryptoJS.HmacSHA256(tokenInput, secret)

  const signature = CryptoJS.enc.Base64.stringify(signatureHash)
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')

  return `${tokenInput}.${signature}`
}

export const decodeJWT = <T = unknown>(token: string): T | null => {
  try {
    let cleanToken = token
    if (cleanToken && cleanToken.startsWith('U2FsdGVkX1')) {
      const decrypted = decryptData(cleanToken, ENCRYPTION_KEY)
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

export const getStoredToken = (): string | null => {
  return getAuthCookie()
}

export const isUserActive = (user?: UserData | null): boolean => {
  const targetUser: any = user || getUserStorage()
  if (!targetUser) return true

  const rawEstado = targetUser.ESTADO_USUARIO ?? targetUser.estado ?? targetUser.Estado
  if (
    rawEstado !== undefined &&
    rawEstado !== null &&
    (String(rawEstado) === '0' || String(rawEstado).toLowerCase() === 'inactivo' || rawEstado === false)
  ) {
    return false
  }
  return true
}

export const isSessionValid = (user?: UserData | null): boolean => {
  const token = getStoredToken()
  if (!token) return false

  const targetUser: any = user || getUserStorage()
  if (!targetUser) return true

  if (!isUserActive(targetUser)) {
    return false
  }

  const expSeconds = Number(targetUser.expires_in || 3600)
  const loginTime = Number(targetUser.timestamp || 0)
  if (loginTime > 0 && Date.now() >= loginTime + expSeconds * 1000) {
    return false
  }

  return true
}

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
      ID_ROL: parsed?.ID_ROL,
      NOMBRE_ROL: parsed?.NOMBRE_ROL,
      NIVEL_ROL: parsed?.NIVEL_ROL,
      ESTADO_USUARIO: parsed?.ESTADO_USUARIO ?? 1,
      expires_in: Number(parsed?.expires_in || 3600),
      timestamp: Number(parsed?.timestamp || 0),
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

export const setAuthSession = (
  user: UserData,
  rawToken?: string,
  rememberMe: boolean = false,
  expSeconds: number = 3600,
): void => {
  const tokenToUse = rawToken || user.token || getStoredToken()

  if (tokenToUse) {
    saveAuthCookie(tokenToUse, rememberMe, expSeconds)
  }

  if (user) {
    saveUserStorage(
      {
        ID_USUARIO: user.ID_USUARIO,
        NICK_USUARIO: user.NICK_USUARIO,
        NOMBRES_USUARIO: user.NOMBRES_USUARIO,
        ID_ROL: user.ID_ROL,
        NOMBRE_ROL: user.NOMBRE_ROL,
        NIVEL_ROL: user.NIVEL_ROL,
        ESTADO_USUARIO: user.ESTADO_USUARIO,
        expires_in: expSeconds,
        timestamp: user.timestamp || Date.now(),
      },
      rememberMe,
    )
  }
}

export const clearAuthSession = (): void => {
  clearAllAuthStorage()
}

export default {
  base64url,
  encodeJWT,
  decodeJWT,
  getStoredToken,
  getStoredUser,
  isSessionValid,
  setAuthSession,
  clearAuthSession,
}
