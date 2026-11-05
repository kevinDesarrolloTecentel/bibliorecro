// credenciales del usuario para iniciar sesión
export interface LoginCredentials {
  NICK_USUARIO: string
  PASSWORD_USUARIO: string
}


// datos del formulario de inicio de sesión
export interface LoginFormData {
  email: string
  password: string
  rememberMe?: boolean
}


// datos del usuario logueado
export interface UserData {
  ID_USUARIO?: string | number
  ID_ROL?: string | number
  NOMBRE_ROL?: string
  NICK_USUARIO?: string
  NOMBRES_USUARIO?: string
  FECHA_REGISTRO?: string
  ESTADO_USUARIO?: string | number
  PASSWORD_USUARIO?: string
  expires_in?: number
  tiempo_expiracion?: number
  token?: string
  timestamp?: number
  [key: string]: any
}


// estado de la autenticación
export interface AuthState {
  user: UserData | null
  isAuthenticated: boolean
  isLoading?: boolean
}
