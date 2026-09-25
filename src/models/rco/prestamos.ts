export interface Prestamo {
  id?: number | string
  ID_PRESTAMO: number | string
  ID_INSCRIPCION: number | string
  ID_LIBROS: number | string
  FECHAINICIO_PRESTAMO: Date | string
  FECHAFIN_PRESTAMO: Date | string
  FECHAENTREGA_PRESTAMO?: Date | string | null
  ESTADO_PRESTAMO: number | string
  DETALLE_PRESTAMO?: string | null
  EXTENDER_PRESTAMO?: number | string | null
  IDENTIFICACION_PERSONA?: string | null
  NOMBRE_PERSONA?: string | null
  APELLIDO_PERSONA?: string | null
  TELEFONO_PERSONA?: string | null
  CELULAR_PERSONA?: string | null
  TITULO_LIBROS?: string | null
  ISBN_LIBROS?: string | null
  [key: string]: any
}

export type Prestamos = Prestamo

export interface PrestamoItem {
  id: number | string
  ID_PRESTAMO: number | string
  ID_LIBROS?: number | string
  ID_INSCRIPCION?: number | string
  Libro: string
  ISBN: string
  Nombres: string
  Apellidos: string
  Cedula: string
  Telefono: string
  Celular: string
  Fecha_prestamo: string
  Fecha_entrega: string
  status: string
  ESTADO_PRESTAMO?: number | string
  EXTENDER_PRESTAMO?: number | string
  Detalle?: string
  raw?: any
  [key: string]: any
}

export interface PrestamoFormData {
  ID_INSCRIPCION: string | number
  ID_LIBROS: string | number
  ESTADO_PRESTAMO: string | number
}

export interface LibroOption {
  value: number | string
  label: string
  isbn?: string
  titulo?: string
  autor?: string
}

export interface UsuarioOption {
  value: number | string
  label: string
  cedula?: string
  nombre?: string
  apellido?: string
}

export interface PrestamosPaginadosResponse {
  current_page: number
  data: Prestamo[]
  last_page: number
  per_page: number
  total: number
  from?: number
  to?: number
}