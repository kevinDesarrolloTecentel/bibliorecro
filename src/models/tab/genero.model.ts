// Modelo de tab_genero (Género de Persona)
export interface TabGenero {
  ID_GENERO?: number | string
  NOMBRE_GENERO: string
  CODIGO_GENERO?: string | null
  ESTADO_GENERO?: number | string | null
}

export type Genero = TabGenero
export type GeneroPersona = TabGenero

