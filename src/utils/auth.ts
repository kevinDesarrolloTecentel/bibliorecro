import Cookies from 'js-cookie'
import CryptoJS from 'crypto-js'
import { UserData } from '@/models/auth'

export const ENCRYPTION_KEY = 'clave_token'
export const AUTH_COOKIE_NAME = 'tk'
export const USER_STORAGE_KEY = 'userData'
export const TOKEN_STORAGE_KEY = 'kt'
let inMemoryToken: string | null = null

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

export const isTokenExpired = (
  expOrToken?: number | string,
  timestamp?: number,
  expiresInSeconds?: number,
): boolean => {
  const nowInSeconds = Math.floor(Date.now() / 1000)

  // 1. Si se pasa el token JWT en string, decodificar el claim 'exp' directamente
  if (typeof expOrToken === 'string' && expOrToken.trim()) {
    const decoded = decodeJWT<{ exp?: number }>(expOrToken)
    if (decoded && typeof decoded.exp === 'number') {
      return decoded.exp <= nowInSeconds
    }
  }

  // 2. Si se pasa directamente el timestamp numérico de expiración
  if (typeof expOrToken === 'number') {
    return expOrToken <= nowInSeconds
  }

  // 3. Fallback: validación basada en timestamp de login y duración en segundos
  if (timestamp && expiresInSeconds) {
    const sessionExpiresAt = Math.floor(timestamp / 1000) + expiresInSeconds
    return sessionExpiresAt <= nowInSeconds
  }

  return false
}

export const getStoredToken = (): string | null => {
  if (inMemoryToken) {
    if (!isTokenExpired(inMemoryToken)) {
      return inMemoryToken
    }
    inMemoryToken = null
  }

  // 1. Recuperar desde Cookie (almacenado cifrado con AES)
  try {
    const cookieToken = Cookies.get(AUTH_COOKIE_NAME)
    if (cookieToken) {
      const decrypted = cookieToken.startsWith('U2FsdGVkX1')
        ? decryptToken(cookieToken, ENCRYPTION_KEY)
        : cookieToken
      if (decrypted && !isTokenExpired(decrypted)) {
        inMemoryToken = decrypted
        return decrypted
      }
    }
  } catch { }

  // 2. Recuperar desde localStorage o sessionStorage (texto plano con soporte retrocompatible cifrado)
  try {
    const storageToken =
      window.localStorage.getItem(TOKEN_STORAGE_KEY) ||
      window.localStorage.getItem('authToken') ||
      window.sessionStorage.getItem(TOKEN_STORAGE_KEY)

    if (storageToken) {
      const token = storageToken.startsWith('U2FsdGVkX1')
        ? decryptToken(storageToken, ENCRYPTION_KEY)
        : storageToken

      if (token && !isTokenExpired(token)) {
        inMemoryToken = token
        return token
      }
    }
  } catch { }

  return null
}

export const getStoredUser = (): UserData | null => {
  try {
    let savedUser: string | null = null
    try {
      savedUser =
        window.localStorage.getItem(USER_STORAGE_KEY) ||
        window.sessionStorage.getItem(USER_STORAGE_KEY)
    } catch { }

    let parsed: any = null
    if (savedUser) {
      if (savedUser.startsWith('U2FsdGVkX1')) {
        const decrypted = decryptToken(savedUser, ENCRYPTION_KEY)
        if (decrypted) {
          try {
            parsed = JSON.parse(decrypted)
          } catch { }
        }
      } else {
        try {
          parsed = JSON.parse(savedUser)
        } catch { }
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

export const isSessionValid = (user?: UserData | null): boolean => {
  const token = getStoredToken()
  if (!token) {
    return false
  }

  // Comprobar expiración directa del JWT
  if (isTokenExpired(token)) {
    return false
  }

  let targetUser: any = user
  if (!targetUser) {
    try {
      const saved =
        window.localStorage.getItem(USER_STORAGE_KEY) ||
        window.sessionStorage.getItem(USER_STORAGE_KEY)

      if (saved) {
        if (saved.startsWith('U2FsdGVkX1')) {
          const decrypted = decryptToken(saved, ENCRYPTION_KEY)
          if (decrypted) targetUser = JSON.parse(decrypted)
        } else {
          targetUser = JSON.parse(saved)
        }
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

  // Fallback complementario por tiempo_expiracion si no hubo exp en el token
  const expSec = targetUser.tiempo_expiracion ?? targetUser.expires_in
  if (expSec && targetUser.timestamp) {
    const sec = expSec <= 120 ? expSec * 60 : expSec
    if (isTokenExpired(undefined, targetUser.timestamp, sec)) {
      return false
    }
  }

  return true
}

export const setAuthSession = (
  user: UserData,
  rawToken?: string,
  rememberMe?: boolean,
): void => {
  const existingToken = getStoredToken()
  const tokenToUse = rawToken || user.token || existingToken || encodeJWT(user, ENCRYPTION_KEY)

  if (tokenToUse) {
    inMemoryToken = tokenToUse
  }

  const isRemember =
    rememberMe !== undefined
      ? rememberMe
      : window.localStorage.getItem('rememberMe') === 'true'

  // 1. Guardar token ENCRIPTADO en Cookie (AES-256)
  if (tokenToUse) {
    try {
      const encryptedCookie = encryptToken(tokenToUse, ENCRYPTION_KEY)
      const cookieOptions: Cookies.CookieAttributes = {
        path: '/',
        sameSite: 'lax',
        secure: window.location.protocol === 'https:',
      }

      if (isRemember) {
        cookieOptions.expires = 7 // 7 días persistente si recordó la sesión
      } else {
        const decoded = decodeJWT<{ exp?: number }>(tokenToUse)
        if (decoded?.exp) {
          const diffSec = decoded.exp - Math.floor(Date.now() / 1000)
          if (diffSec > 0) {
            cookieOptions.expires = diffSec / 86400
          }
        } else {
          const expSec = user.tiempo_expiracion ?? user.expires_in ?? 3600
          cookieOptions.expires = expSec / 86400
        }
      }

      Cookies.set(AUTH_COOKIE_NAME, encryptedCookie, cookieOptions)
    } catch (e) {
      console.error('Error guardando token en cookie:', e)
    }
  }

  // 2. Guardar token en TEXTO PLANO en localStorage / sessionStorage
  if (tokenToUse) {
    try {
      window.localStorage.setItem(TOKEN_STORAGE_KEY, tokenToUse)
      window.sessionStorage.setItem(TOKEN_STORAGE_KEY, tokenToUse)
    } catch (e) {
      console.error('Error guardando token en storage:', e)
    }
  }

  // 3. Guardar datos de usuario en TEXTO PLANO en localStorage / sessionStorage
  try {
    window.localStorage.removeItem('authToken')
    if (user) {
      const serializedUser = JSON.stringify(user)
      window.localStorage.setItem(USER_STORAGE_KEY, serializedUser)
      window.sessionStorage.setItem(USER_STORAGE_KEY, serializedUser)

      if (isRemember) {
        window.localStorage.setItem('rememberMe', 'true')
      } else {
        window.localStorage.removeItem('rememberMe')
      }
    }
  } catch (e) {
    console.error('Error guardando usuario en storage:', e)
  }
}

export const clearAuthSession = (): void => {
  inMemoryToken = null
  try {
    Cookies.remove(AUTH_COOKIE_NAME, { path: '/' })
    Cookies.remove(AUTH_COOKIE_NAME)
  } catch { }

  try {
    window.sessionStorage.clear()
  } catch { }

  try {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY)
    window.localStorage.removeItem('authToken')
    window.localStorage.removeItem(USER_STORAGE_KEY)
    window.localStorage.removeItem('rememberMe')
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
