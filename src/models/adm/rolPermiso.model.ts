// Modelo de admin_rol_permiso
import { AdminRol } from './rol.model'
import { AdminPermiso } from './permiso.model'

export interface AdminRolPermiso {
  ID_ROL: number | string
  ID_PERMISO: number | string

  // Relaciones
  ROL?: AdminRol
  PERMISO?: AdminPermiso
}
