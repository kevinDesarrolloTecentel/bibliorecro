import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { getStoredUser, getRawAuthCookie } from '@/utils/auth'
import { AdminUsuario } from '@/models/adm/user.model'
import { AdminRol } from '@/models/adm/rol.model'
import { ModuloGrupo, ModuloPantalla } from '@/models/adm/catalogo.model'

// Estructura limpia de usuario autenticado
export interface AuthUser {
  ID_USUARIO?: number | string
  NICK_USUARIO?: string | null
  NOMBRES_USUARIO?: string | null
  ESTADO_USUARIO?: number | string | null
  FECHA_REGISTRO?: string | null
  expires_in?: number
}
export type UserData = AuthUser

// Estructura de permisos del usuario logueado
export type MisPermisosPantalla = ModuloPantalla<string>
export type MisPermisosModulo = ModuloGrupo<MisPermisosPantalla>

export interface MisPermisosData {
  ID_USUARIO?: number | string
  ROLES: AdminRol[]
  MODULOS: MisPermisosModulo[]
}

// Estructura de respuesta de la petición de perfil
export interface PerfilResponse {
  success: boolean
  data: AdminUsuario
}

// Credenciales directas para inicio de sesión
export interface LoginCredentials {
  NICK_USUARIO: string
  PASSWORD_USUARIO: string
}

// Payload estricto para loginSuccess
export interface LoginPayload {
  user: AuthUser
  token: string
  permisos: MisPermisosData
}

// El Estado Global de Autenticación
export interface AuthState {
  user: AuthUser | null
  token: string | null
  permisos: MisPermisosData | null
  isAuthenticated: boolean
}

// Recupera la sesión activa al recargar
const initialUser: AuthUser | null = typeof window !== 'undefined' ? getStoredUser() : null
const initialToken: string | null = typeof window !== 'undefined' ? getRawAuthCookie() : null

const initialState: AuthState = {
  user: initialUser,
  token: initialToken,
  permisos: null,
  isAuthenticated: Boolean(initialUser && initialToken),
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Asigna el payload limpio directamente al estado en memoria
    loginSuccess: (state, action: PayloadAction<LoginPayload>) => {
      state.user = action.payload.user
      state.token = action.payload.token
      state.permisos = action.payload.permisos
      state.isAuthenticated = true
    },

    // Sincronizar permisos en Redux
    setAuthPermisos: (state, action: PayloadAction<MisPermisosData>) => {
      state.permisos = action.payload
    },

    // Actualizar datos del perfil del usuario en memoria
    updateUserProfile: (state, action: PayloadAction<Partial<AuthUser>>) => {
      if (state.user) {
        state.user = {
          ...state.user,
          ...action.payload,
        }
      }
    },

    // Al cerrar sesión manualmente
    logoutSuccess: (state) => {
      state.user = null
      state.token = null
      state.permisos = null
      state.isAuthenticated = false
    },

    // Cuando caduca la sesión o se recibe 401 del servidor
    sessionExpired: (state) => {
      state.user = null
      state.token = null
      state.permisos = null
      state.isAuthenticated = false
    },
  },
})

export const {
  loginSuccess,
  setAuthPermisos,
  updateUserProfile,
  logoutSuccess,
  sessionExpired,
} = authSlice.actions

export default authSlice.reducer
