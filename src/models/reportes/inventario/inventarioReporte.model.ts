export interface LibroInventarioItem {
  ID_LIBROS?: number | string
  ISBN_LIBROS?: string
  TITULO_LIBROS?: string
  TITULO_LIBRO?: string
  CODIGO_LIBRO?: string
  CODIGODEBARRAS_LIBROS?: string
  EDICION_LIBRO?: string
  DESCRIPCION_LIBRO?: string
  PRECIO_LIBROS?: number | string
  TITULOTEJUELO_LIBROS?: string
  AUTORTEJUELO_LIBROS?: string
  NOMBRE_AUTOR?: string
  NOMBRE_CATEGORIA?: string
  NOMBRE_EDITORIAL?: string
  ESTADO_LIBRO?: number | string
  ESTADOINSCRIPCION_PERSONA?: number
  [key: string]: any
}

export interface CategoriaOption {
  label: string
  value: number | string
}
