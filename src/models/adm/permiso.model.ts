// Modelo de admin_permiso
import { AdminPermisoAccion } from './permisoAccion.model'

export interface AdminPermiso {
  ID_PERMISO: number | string
  CLUSTER_PERMISO?: string | null
  NOMBRE_PERMISO: string
  PATH_PERMISO: string

  // Relaciones
  ACCIONES?: AdminPermisoAccion[]
}
