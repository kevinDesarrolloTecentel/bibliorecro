// Modelo de admin_rol_permiso_accion
import { AdminRol } from './rol.model'
import { AdminPermisoAccion } from './permisoAccion.model'

export interface AdminRolPermisoAccion {
  ID_ROL: number | string
  ID_ACCION: number | string

  // Relaciones
  ROL?: AdminRol
  ACCION?: AdminPermisoAccion
}
