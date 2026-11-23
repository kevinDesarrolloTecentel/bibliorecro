// Modelo de admin_rol
import { AdminPermiso } from './permiso.model'
import { AdminPermisoAccion } from './permisoAccion.model'

export interface AdminRol {
  ID_ROL?: number | string
  NOMBRE_ROL?: string | null
  NIVEL_ROL?: number | string | null

  // Relaciones
  PERMISOS?: AdminPermiso[]
  ACCIONES?: AdminPermisoAccion[]
}
