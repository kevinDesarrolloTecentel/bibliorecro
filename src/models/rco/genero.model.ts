// Modelo de rco_genero (Género literario)
export interface RcoGenero {
  id?: number | string
  ID_RCOGENERO?: number | string
  NOMBRE_RCOGENERO: string
  FECHAINGRESO_RCOGENERO?: string | null
}

export type GeneroLib = RcoGenero
export type GeneroLibro = RcoGenero
