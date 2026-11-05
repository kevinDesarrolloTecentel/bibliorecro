export interface PrestamoReporteItem {
  ID_PERSONA?: number | string
  ID_PRESTAMO?: number | string
  TITULO_LIBROS?: string
  ISBN_LIBROS?: string
  NOMBRE_AUTOR?: string
  PRECIO_LIBROS?: number | string
  FECHAFIN_PRESTAMO?: string
  FECHAPRESTAMO_PRESTAMO?: string
  FECHAENTREGA_PRESTAMO?: string
  IDENTIFICACION_PERSONA?: string
  NOMBRE_PERSONA?: string
  APELLIDO_PERSONA?: string
  CORREO_PERSONA?: string
  CELULAR_PERSONA?: string
  TELEFONO_PERSONA?: string
  DETALLE_PERSONA?: string
  EDAD_PERSONA?: number
  ESTADOINSCRIPCION_PERSONA?: number
  ESTADO_PRESTAMO?: number | string
  [key: string]: any
}
