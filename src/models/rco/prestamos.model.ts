// Modelo canónico de rco_prestamo
import { RcoLibros } from './libros.model'
import { TabInscripcion } from '../tab/inscripcion.model'

export interface RcoPrestamo {
  // Llave primaria
  ID_PRESTAMO?: number | string

  // Llaves foráneas
  ID_INSCRIPCION?: number | string | null
  ID_LIBROS?: number | string | null

  // Campos propios
  FECHAINICIO_PRESTAMO?: string | null
  FECHAFIN_PRESTAMO?: string | null
  DETALLE_PRESTAMO?: string | null
  FECHAENTREGA_PRESTAMO?: string | null
  ESTADO_PRESTAMO?: number | string | null
  EXTENDER_PRESTAMO?: number | string | null

  // Relaciones
  LIBRO?: RcoLibros
  INSCRIPCION?: TabInscripcion
}

export type Prestamos = RcoPrestamo
export type { PrestamoItem, PaginacionPrestamos, LibroOption, UsuarioOption } from '@/slices/prestamoSlice'
