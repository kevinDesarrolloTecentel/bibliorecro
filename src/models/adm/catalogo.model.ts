import { AdminPermiso } from './permiso.model'
import { AdminPermisoAccion } from './permisoAccion.model'

// Estructura modular del árbol de catálogo de permisos
export interface ModuloPantalla<TAccion = AdminPermisoAccion> extends Omit<AdminPermiso, 'ACCIONES'> {
  ACCIONES?: TAccion[]
}

export interface ModuloGrupo<TPantalla = ModuloPantalla<AdminPermisoAccion>> {
  MODULO: string
  PANTALLAS: TPantalla[]
}

export type CatalogoModulo = ModuloGrupo<ModuloPantalla<AdminPermisoAccion>>
