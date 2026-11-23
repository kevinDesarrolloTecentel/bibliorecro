// Modelo de rco_editorial
export interface RcoEditorial {
  id?: number | string
  ID_EDITORIAL?: number | string
  NOMBRE_EDITORIAL: string
  FECHAINGRESO_EDITORIAL?: string | null
}

export type Editorial = RcoEditorial
