// accion
export interface Accion {
  ID_ACCION?: number | string
  ID_PERMISO: number | string
  CODIGO_ACCION: string
  NOMBRE_ACCION: string
  DESCRIPCION_ACCION?: string
  ESTADO_ACCION?: number | string
}

// pantalla
export interface Pantalla {
  ID_PERMISO: number
  CLUSTER_PERMISO?: string
  NOMBRE_PERMISO: string
  PATH_PERMISO: string
  ACCIONES?: Accion[]
}

//modulo catalogo
export interface ModuloCatalogo {
  MODULO: string
  PANTALLAS: Pantalla[]
}

// mis permisos data
export interface MisPermisosData {
  ID_USUARIO: number
  ID_ROL?: number
  NOMBRE_ROL?: string
  NIVEL_ROL?: number | string
  nivel?: number | string
  ROLES?: {
    ID_ROL: number
    NOMBRE_ROL: string
    NIVEL_ROL: number
  }[]
  IDS_ROLES?: number[]
  ES_ADMINISTRADOR?: boolean
  MODULOS: ModuloCatalogo[]
}

// permisos rol
export interface PermisosRolData {
  ROL: {
    ID_ROL: number
    NOMBRE_ROL: string
    NIVEL_ROL: number
  }
  ES_ADMINISTRADOR: boolean
  PANTALLAS: (number | Pantalla)[]
  ACCIONES: (number | Accion)[]
}

// guardar permisos rol
export interface GuardarPermisosRolPayload {
  PANTALLAS: number[]
  ACCIONES: number[]
}
