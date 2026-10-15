export interface Accion {
  ID_ACCION?: number | string
  ID_PERMISO: number | string
  CODIGO_ACCION: string
  NOMBRE_ACCION: string
  DESCRIPCION_ACCION?: string
  ESTADO_ACCION?: number | string
}

export interface Pantalla {
  ID_PERMISO: number
  CLUSTER_PERMISO?: string
  NOMBRE_PERMISO: string
  PATH_PERMISO: string
  ACCIONES?: Accion[]
}

export interface ModuloCatalogo {
  MODULO: string
  PANTALLAS: Pantalla[]
}

export interface MisPermisosData {
  ID_USUARIO: number
  ID_ROL: number
  NOMBRE_ROL: string
  ES_ADMINISTRADOR: boolean
  MODULOS: ModuloCatalogo[]
}

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

export interface GuardarPermisosRolPayload {
  PANTALLAS: number[]
  ACCIONES: number[]
}
