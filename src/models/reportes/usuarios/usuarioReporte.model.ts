export interface PersonaReporteItem {
  ID_PERSONA?: number | string
  IDENTIFICACION_PERSONA?: string
  NOMBRE_PERSONA?: string
  APELLIDO_PERSONA?: string
  FECHA_PERSONA?: string
  EDAD_PERSONA?: any
  CORREO_PERSONA?: string
  NOMBRE_GENERO?: string
  FECHAINICIO_INSCRIPCION?: string
  FECHAFIN_INSCRIPCION?: string
  COSTO_INSCRIPCION?: string | number
  ESTADO_INSCRIPCION?: number | string
  ESTADOINSCRIPCION_PERSONA?: number
  TELEFONO_PERSONA?: string
  CELULAR_PERSONA?: string
  TIPO_PERSONA?: string
  ESTADO_RENOVACIONES?: number
  cantidad_prestamos?: number
  PERSONA?: any
  RENOVACIONES?: any[]
  cedula?: string
  nombre?: string
  apellido?: string
  correo?: string
  fechaNacimiento?: string
  tipo_usuario?: string
  [key: string]: any
}

export interface GeneroOption {
  label: string
  value: number | string
}
