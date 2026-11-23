// Modelo de rco_categoria
export interface RcoCategoria {
  id?: number | string
  ID_CATEGORIA?: number | string
  CODIGO_CATEGORIA?: string | null
  NOMBRE_CATEGORIA: string
  FECHAINGRESO_CATEGORIA?: string | null
}

export type Categoria = RcoCategoria
