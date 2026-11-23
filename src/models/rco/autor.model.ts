// Modelo de rco_autor
export interface RcoAutor {
  id?: number | string
  ID_AUTOR?: number | string
  NOMBRE_AUTOR: string
  FECHAINGRESO_AUTOR?: string | null
}

export type Autor = RcoAutor
