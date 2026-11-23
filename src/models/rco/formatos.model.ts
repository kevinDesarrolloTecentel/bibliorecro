// Modelo de rco_formatos
export interface RcoFormatos {
  ID_FORMATOS?: number | string
  NOMBRE_FORMATOS: string
  CODIGO_FORMATOS?: string | null
  FECHAINGRESO_FORMATOS?: string | null
}

export type Formatos = RcoFormatos
export type FormatoLibro = RcoFormatos

