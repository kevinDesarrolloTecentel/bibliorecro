import CryptoJS from 'crypto-js'
import { UserData } from '@/models/auth'
import {
  ENCRYPTION_KEY,
  AUTH_COOKIE_NAME,
  USER_STORAGE_KEY,
  encryptData,
  decryptData,
  encryptToken,
  decryptToken,
  saveTokenStorage,
  getTokenStorage,
  saveAuthCookie,
  getAuthCookie,
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
  encryptToken,
  decryptToken,
  saveTokenStorage,
  getTokenStorage,
  saveAuthCookie,
  getAuthCookie,
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
    const parts = token.split('.')
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

export const getStoredUser = (): UserData | null => {
  try {
    let parsed: any = getUserStorage()

    if (!parsed) {
      const token = getStoredToken()
      if (token) {
        parsed = decodeJWT<any>(token)
      }
    }

    if (!parsed) return null

    const {
      iss: _iss,
      iat: _iat,
      exp: _jwtExp,
      nbf: _nbf,
      jti: _jti,
      sub: _sub,
      prv: _prv,
      token: _storedToken,
      PASSWORD_USUARIO: _pass1,
      password: _pass2,
      contrasena: _pass3,
      ...cleanPayload
    } = parsed

    const id = parsed.id_usuario ?? parsed.ID_USUARIO ?? parsed.id ?? parsed.sub
    let rol = parsed.rol ?? parsed.ID_ROL ?? parsed.rol_id
    if (typeof rol === 'object' && rol !== null) {
      rol = rol.ID_ROL ?? rol.id ?? rol.id_rol ?? rol.NOMBRE_ROL ?? rol.nombre
    }
    const nick = parsed.nick_usuario ?? parsed.NICK_USUARIO ?? parsed.usuario ?? parsed.name ?? parsed.email
    const exp = parsed.tiempo_expiracion ?? parsed.expires_in ?? 3600

    const normalizedUser: UserData = {
      ...cleanPayload,
      ID_USUARIO: id,
      ID_ROL: rol,
      NICK_USUARIO: nick,
      NOMBRES_USUARIO: parsed.nombres_usuario ?? parsed.NOMBRES_USUARIO ?? parsed.nombres ?? parsed.name,
      tiempo_expiracion: exp,
      expires_in: exp,
      timestamp: parsed.timestamp || Date.now(),
    }

    if (isSessionValid(normalizedUser)) {
      return normalizedUser
    }
    clearAuthSession()
    return null
  } catch (e) {
    console.error('Error recuperando usuario almacenado:', e)
  }
  return null
}

export const isSessionValid = (user?: UserData | null): boolean => {
  const token = getStoredToken()
  if (!token) {
    return false
  }

  let targetUser: any = user
  if (!targetUser) {
    try {
      const saved = getUserStorage()
      if (saved) {
        targetUser = saved
      } else {
        targetUser = decodeJWT<any>(token)
      }
    } catch {
      return false
    }
  }

  if (!targetUser) {
    return false
  }

  // Validar por timestamp de inicio de sesión + tiempo de expiración del backend (3600 segundos)
  const expSeconds = Number(targetUser.expires_in || targetUser.tiempo_expiracion || 3600)
  const loginTime = Number(targetUser.timestamp || 0)
  if (loginTime > 0 && Date.now() >= loginTime + expSeconds * 1000) {
    return false
  }

  return true
}

export const setAuthSession = (
  user: UserData,
  rawToken?: string,
  rememberMe: boolean = false,
  expSeconds?: number,
): void => {
  const existingToken = getStoredToken()
  const tokenToUse = rawToken || user.token || existingToken || encodeJWT(user, ENCRYPTION_KEY)
  const effectiveExp = expSeconds || user.expires_in || user.tiempo_expiracion || 3600

  if (tokenToUse) {
    saveAuthCookie(tokenToUse, rememberMe, effectiveExp)
  }

  if (user) {
    const userToSave = {
      ...user,
      expires_in: effectiveExp,
      timestamp: user.timestamp || Date.now(),
    }
    saveUserStorage(userToSave, rememberMe)
  }
}

export const renovarTokenSilencioso = async (): Promise<string | null> => {
  // Renovación deshabilitada para respetar estrictamente los 3600 segundos del backend
  return null
}

export const clearAuthSession = (): void => {
  clearAllAuthStorage()
}

export type RoleIdentifier = string | number

export const hasRequiredRole = (
  userRole: any,
  requiredRoles: RoleIdentifier[],
): boolean => {
  if (userRole === null || userRole === undefined || userRole === '') return false

  let effectiveRole = userRole
  if (typeof userRole === 'object' && userRole !== null) {
    effectiveRole = userRole.ID_ROL ?? userRole.id ?? userRole.rol ?? userRole.NOMBRE_ROL ?? userRole.nombre
  }

  const raw = String(effectiveRole).toLowerCase().trim()

  return requiredRoles.some((role) => {
    const target = String(role).toLowerCase().trim()
    return raw === target
  })
}
