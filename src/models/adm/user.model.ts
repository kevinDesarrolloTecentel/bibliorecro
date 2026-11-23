// Modelo de admin_usuario
import { AdminRol } from './rol.model'

export interface AdminUsuario {
  ID_USUARIO?: number | string
  NICK_USUARIO?: string | null
  NOMBRES_USUARIO?: string | null
  PASSWORD_USUARIO?: string | null
  ESTADO_USUARIO?: number | string | null
  FECHA_REGISTRO?: string | null

  // Relaciones
  ID_ROL?: number | string | null
  ROL?: AdminRol
  ROLES?: AdminRol[]
}
