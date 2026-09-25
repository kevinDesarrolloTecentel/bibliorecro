import Cookies from 'js-cookie'
import CryptoJS from 'crypto-js'
import { UserData } from '@/models/auth'

export const ENCRYPTION_KEY = 'clave_token'
export const AUTH_COOKIE_NAME = 'tk'
export const USER_STORAGE_KEY = 'userData'
export const TOKEN_STORAGE_KEY = 'kt'
let inMemoryToken: string | null = null

// Recuperar token de localStorage inmediatamente si existe
export const base64url = (source: unknown): string => {
  try {
    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(source))))
    return encoded.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  } catch {
    return ''
  }
}

export const encodeJWT = (payload: unknown, secret: string = ENCRYPTION_KEY): string => {
  const header = { alg: 'HS256', typ: 'JWT', nonce:'a8f3b9c1-42e1-4c7b'}
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

export const encryptToken = (text: string, secret: string = ENCRYPTION_KEY): string => {
  return CryptoJS.AES.encrypt(text, secret).toString()
}

export const decryptToken = (ciphertext: string, secret: string = ENCRYPTION_KEY): string | null => {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, secret)
    const decrypted = bytes.toString(CryptoJS.enc.Utf8)
    return decrypted || null
  } catch {
    return null
  }
}

export const getStoredToken = (): string | null => {
  if (inMemoryToken) return inMemoryToken

  // 1. Recuperar directamente de localStorage (descifrándolo si está encriptado)
  try {
    const directStorageToken =
      window.localStorage.getItem(TOKEN_STORAGE_KEY) ||
      window.localStorage.getItem('authToken')
    if (directStorageToken) {
      if (directStorageToken.startsWith('U2FsdGVkX1')) {
        const decrypted = decryptToken(directStorageToken)
        if (decrypted) {
          inMemoryToken = decrypted
          return decrypted
        }
      }
      inMemoryToken = directStorageToken
      return inMemoryToken
    }
  } catch { }

  return null
}

export const getStoredUser = (): UserData | null => {
  try {
    let savedUser: string | null = null
    try {
      savedUser = window.localStorage.getItem(USER_STORAGE_KEY)
    } catch { }

    let parsed: any = null
    if (savedUser) {
      try {
        parsed = JSON.parse(savedUser)
      } catch {
        const decrypted = decryptToken(savedUser, ENCRYPTION_KEY)
        if (decrypted) {
          parsed = JSON.parse(decrypted)
        }
      }
    }

    // Si no está el JSON en storage, decodificar los datos desde el token JWT
    if (!parsed) {
      const token = getStoredToken()
      if (token) {
        parsed = decodeJWT<any>(token)
      }
    }

    if (!parsed) return null

    // Filtrar claims técnicos del token JWT para mantener limpio el estado en Redux
    const {
      iss: _iss,
      iat: _iat,
      exp: _jwtExp,
      nbf: _nbf,
      jti: _jti,
      sub: _sub,
      prv: _prv,
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
      PASSWORD_USUARIO: parsed.password_usuario ?? parsed.PASSWORD_USUARIO ?? parsed.password,
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

export const isTokenExpired = (
  expOrToken?: number | string,
  timestamp?: number,
  expiresInSeconds?: number,
): boolean => {
  const nowInSeconds = Math.floor(Date.now() / 1000)

  if (typeof expOrToken === 'number') {
    return expOrToken <= nowInSeconds
  }

  if (typeof expOrToken === 'string') {
    const decoded = decodeJWT<{ exp?: number }>(expOrToken)
    if (decoded?.exp) {
      return decoded.exp <= nowInSeconds
    }
  }

  if (timestamp && expiresInSeconds) {
    const sessionExpiresAt = Math.floor(timestamp / 1000) + expiresInSeconds
    return sessionExpiresAt <= nowInSeconds
  }

  return false
}

export const isSessionValid = (user?: UserData | null): boolean => {
  let targetUser: any = user
  if (!targetUser) {
    try {
      const saved = window.localStorage.getItem(USER_STORAGE_KEY)
      if (saved) {
        try {
          targetUser = JSON.parse(saved)
        } catch {
          const decrypted = decryptToken(saved, ENCRYPTION_KEY)
          if (decrypted) {
            targetUser = JSON.parse(decrypted)
          }
        }
      } else {
        const token = getStoredToken()
        if (token) {
          targetUser = decodeJWT<any>(token)
        }
      }
    } catch {
      return false
    }
  }

  if (!targetUser) {
    return false
  }

  const expSec = targetUser.tiempo_expiracion ?? targetUser.expires_in
  if (expSec && targetUser.timestamp) {
    const sec = expSec <= 120 ? expSec * 60 : expSec
    if (isTokenExpired(undefined, targetUser.timestamp, sec)) {
      return false
    }
  }

  const token = getStoredToken()
  if (token && isTokenExpired(token)) {
    return false
  }

  return true
}

export const setAuthSession = (
  user: UserData,
  rawToken?: string,
  _rememberMe: boolean = false,
): void => {
  const existingToken = getStoredToken()
  const tokenToUse = rawToken || user.token || existingToken || encodeJWT(user, ENCRYPTION_KEY)

  if (tokenToUse) {
    inMemoryToken = tokenToUse
  }

  // 1. Guardar token encriptado en localStorage (AES-256)
  if (tokenToUse) {
    const encrypted = encryptToken(tokenToUse, ENCRYPTION_KEY)
    try {
      window.localStorage.setItem(TOKEN_STORAGE_KEY, encrypted)
    } catch (e) {
      console.error('Error guardando token en localStorage:', e)
    }
  }

  // 2. Eliminar cookie para no almacenar tokens largos en cookies
  try {
    Cookies.remove(AUTH_COOKIE_NAME)
  } catch { }

  // 3. Asegurar que en localStorage solo quede el token (eliminando authToken y userData)
  try {
    window.localStorage.removeItem('authToken')
    window.localStorage.removeItem(USER_STORAGE_KEY)
  } catch { }

  // 4. Eliminar cualquier residuo de sessionStorage
  try {
    window.sessionStorage.clear()
  } catch { }
}

export const clearAuthSession = (): void => {
  inMemoryToken = null
  try {
    Cookies.remove(AUTH_COOKIE_NAME)
  } catch { }

  try {
    window.sessionStorage.clear()
  } catch { }

  try {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY)
    window.localStorage.removeItem('authToken')
    window.localStorage.removeItem(USER_STORAGE_KEY)
  } catch { }
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
  const aliases: string[] = [raw]

  if (raw === '1' || raw === 'admin' || raw === 'administrador') {
    aliases.push('1', 'admin', 'administrador')
  } else if (raw === '2' || raw === 'bibliotecario') {
    aliases.push('2', 'bibliotecario')
  }

  return requiredRoles.some((role) => {
    const target = String(role).toLowerCase().trim()
    return aliases.includes(target)
  })
}


