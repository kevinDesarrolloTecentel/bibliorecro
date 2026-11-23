// Modelo canónico de rco_libros
import { RcoCategoria } from './categoria.model'
import { RcoEditorial } from './editorial.model'
import { RcoProveedor } from './proveedor.model'
import { RcoFormatos } from './formatos.model'
import { RcoTipo } from './tipo.model'
import { RcoAutor } from './autor.model'
import { RcoGenero } from './genero.model'

export interface RcoLibros {
  // Llave primaria
  ID_LIBROS?: number | string

  // Llaves foráneas
  ID_CATEGORIA?: number | string | null
  ID_EDITORIAL?: number | string | null
  ID_PROVEEDOR?: number | string | null
  ID_FORMATOS?: number | string | null
  ID_TIPO?: number | string | null
  ID_AUTOR?: number | string | null
  ID_RCOGENERO?: number | string | null

  // Campos propios
  ISBN_LIBROS?: string | number | null
  TITULO_LIBROS: string
  PRECIO_LIBROS?: number | string | null
  CODIGODEBARRAS_LIBROS?: string | number | null
  VOLUMEN_LIBROS?: string | number | null
  FECHAEDICION_LIBROS?: string | null
  PAIS_LIBROS?: string | null
  DESCRIPCION_LIBROS?: string | null
  FECHAREGISTRO_LIBROS?: string | null
  TITULOTEJUELO_LIBROS?: string | null
  AUTORTEJUELO_LIBROS?: string | null
  ESTADO_LIBROS?: number | string | null
  MOTIVO_BAJA_LIBRO?: string | null

  // Relaciones con otras tablas
  CATEGORIA?: RcoCategoria
  EDITORIAL?: RcoEditorial
  PROVEEDOR?: RcoProveedor
  FORMATO?: RcoFormatos
  TIPO?: RcoTipo
  AUTOR?: RcoAutor
  GENERO?: RcoGenero
}


export type Libros = RcoLibros
export type { CatalogoOption } from '@/slices/libroSlice'
export type LibroFormData = RcoLibros
export const initialLibroFormData: LibroFormData = { TITULO_LIBROS: '' }
