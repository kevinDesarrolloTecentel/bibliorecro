// Modelo de admin_usuario_rol
import { AdminUsuario } from './user.model'
import { AdminRol } from './rol.model'

export interface AdminUsuarioRol {
  ID_USUARIO: number | string
  ID_ROL: number | string

  // Relaciones
  USUARIO?: AdminUsuario
  ROL?: AdminRol
}
