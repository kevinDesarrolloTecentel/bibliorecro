// Modelo de admin_permiso_accion
import { AdminPermiso } from './permiso.model'

export interface AdminPermisoAccion {
  ID_ACCION?: number | string
  ID_PERMISO: number | string
  CODIGO_ACCION: string
  NOMBRE_ACCION: string
  DESCRIPCION_ACCION?: string | null
  ESTADO_ACCION?: number | string | null

  // Relaciones
  PERMISO?: AdminPermiso
}
