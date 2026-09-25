export interface Libros {
  id?: number | string
  ID_LIBROS?: number | string
  ID_CATEGORIA?: number | string | null
  ID_EDITORIAL?: number | string | null
  ID_PROVEEDOR?: number | string | null
  ID_FORMATOS?: number | string | null
  ID_TIPO?: number | string | null
  ID_AUTOR?: number | string | null
  ID_RCOGENERO?: number | string | null
  ISBN_LIBROS?: string | number | null
  TITULO_LIBROS: string
  PRECIO_LIBROS?: number | string | null
  CODIGODEBARRAS_LIBROS?: string | number | null
  VOLUMEN_LIBROS?: string | number | null
  FECHAEDICION_LIBROS?: Date | string | null
  PAIS_LIBROS?: string | null
  DESCRIPCION_LIBROS?: string | null
  FECHAREGISTRO_LIBROS?: Date | string | null
  TITULOTEJUELO_LIBROS?: string | null
  AUTORTEJUELO_LIBROS?: string | null
  ESTADO_LIBROS?: number | string | null

  NOMBRE_AUTOR?: string | null
  NOMBRE_CATEGORIA?: string | null
  NOMBRE_EDITORIAL?: string | null
  NOMBRE_RCOGENERO?: string | null
  NOMBRE_PROVEEDOR?: string | null
  NOMBRE_FORMATOS?: string | null
  NOMBRE_TIPO?: string | null
  EN_PRESTAMO?: number | null
  ESTADO_PRESTAMO?: string | null
  ESTADO_LIBRO?: string | null
  FECHA_REGISTRO_FORMAT?: string | null
  FECHA_EDICION_FORMAT?: string | null

  ISBN?: string
  Titulo?: string
  Autor?: string
  Categoria?: string
  Editorial?: string
  Proveedor?: string
  Formatos?: string
  Tipo?: string
  Genero?: string
  FechaEdicion?: string
  Disponibilidad?: string
  FechaRegistro?: string
  Estado?: string
  Pais?: string
  Precio?: number | string
  Volumen?: string
  CodigoBarras?: string
  TituloTejuelo?: string
  AutorTejuelo?: string
  Descripcion?: string
  raw?: any
}

export type LibroItem = Libros

export interface LibroFormData {
  ID_CATEGORIA: string | number
  ID_EDITORIAL: string | number
  ID_PROVEEDOR: string | number
  ID_RCOGENERO: string | number
  ID_FORMATOS: string | number
  ID_TIPO: string | number
  ID_AUTOR: string | number
  ISBN_LIBROS: string
  TITULO_LIBROS: string
  PRECIO_LIBROS: string | number
  CODIGODEBARRAS_LIBROS: string
  VOLUMEN_LIBROS: string
  FECHAEDICION_LIBROS: string
  PAIS_LIBROS: string
  DESCRIPCION_LIBROS: string
  TITULOTEJUELO_LIBROS: string
  AUTORTEJUELO_LIBROS: string
  ESTADO_LIBROS: string | number
}

export const initialLibroFormData: LibroFormData = {
  ID_CATEGORIA: '',
  ID_EDITORIAL: '',
  ID_PROVEEDOR: '',
  ID_RCOGENERO: '',
  ID_FORMATOS: '',
  ID_TIPO: '',
  ID_AUTOR: '',
  ISBN_LIBROS: '',
  TITULO_LIBROS: '',
  PRECIO_LIBROS: '',
  CODIGODEBARRAS_LIBROS: '',
  VOLUMEN_LIBROS: '',
  FECHAEDICION_LIBROS: '',
  PAIS_LIBROS: '',
  DESCRIPCION_LIBROS: '',
  TITULOTEJUELO_LIBROS: '',
  AUTORTEJUELO_LIBROS: '',
  ESTADO_LIBROS: '1',
}

export interface CatalogoOption {
  value: number | string
  label: string
}

export interface LibrosPaginadosResponse {
  data: Libros[]
  pagination?: {
    current_page: number
    per_page: number
    total: number
    last_page: number
    from?: number
    to?: number
  }
  current_page?: number
  last_page?: number
  total?: number
  per_page?: number
  message?: string
}
