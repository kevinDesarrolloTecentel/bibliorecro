export interface UserData {
  ID_USUARIO?: string | number
  ID_ROL?: string | number
  NICK_USUARIO?: string
  expires_in?: number
  ESTADO_USUARIO?: string
  NOMBRES_USUARIO?: string
  FECHA_REGISTRO?: string
  PASSWORD_USUARIO?: string
  timestamp?: number
  [key: string]: any
}

export interface AuthState {
  user: UserData | null
  isAuthenticated: boolean
  isLoading?: boolean
}