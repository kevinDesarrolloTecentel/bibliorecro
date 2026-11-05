import { Genero } from './genero.model'
import { EstadoCivil } from './estadoCivil.model'
import { Nacionalidad } from './nacionalidad.model'
import { TipoIdentificacion } from './tipoIdentificacion.model'

export interface Persona {
  ID_PERSONA?: string
  ID_GENERO: Genero | string | number
  ID_TIPOIDENTIFICACION: TipoIdentificacion | string | number
  ID_NACIONALIDAD: Nacionalidad | string | number
  ID_ESTADOCIVIL: EstadoCivil | string | number
  IDENTIFICACION_PERSONA: string
  NOMBRE_PERSONA: string
  APELLIDO_PERSONA: string
  TELEFONO_PERSONA: string
  CELULAR_PERSONA: string
  CORREO_PERSONA: string
  DIRECCION_PERSONA: string
  FECHAREGISTRO_PERSONA?: Date | string
  FOTO_PERSONA?: string | File | any 
  DETALLE_PERSONA: string
  DETALLE_INSCRIPCION?: string
  FECHA_PERSONA: string
  ESTADO_PERSONA: string | number
  ESTADOINSCRIPCION_PERSONA: boolean | string | number
  EDAD_PERSONA?: string | number
  inscripciones?: any[]
  sanciones?: any[]
  vetos?: any[]
  TIENE_SANCION?: number
  TIENE_VETO_PERMANENTE?: number
  ESTADO?: string
}

export const initialPersona: Persona = {
  ID_PERSONA: '',
  ID_GENERO: '',
  ID_TIPOIDENTIFICACION: '',
  ID_NACIONALIDAD: '',
  ID_ESTADOCIVIL: '',
  IDENTIFICACION_PERSONA: '',
  NOMBRE_PERSONA: '',
  APELLIDO_PERSONA: '',
  TELEFONO_PERSONA: '',
  CELULAR_PERSONA: '',
  CORREO_PERSONA: '',
  DIRECCION_PERSONA: '',
  FECHAREGISTRO_PERSONA: '',
  FOTO_PERSONA: '',
  DETALLE_PERSONA: '',
  DETALLE_INSCRIPCION: '',
  FECHA_PERSONA: '',
  ESTADO_PERSONA: '1',
  ESTADOINSCRIPCION_PERSONA: false,
}

export interface SancionRegistroItem {
  id?: string | number
  inicio: string
  fin: string
  detalle: string
  estado?: string | number
}

export interface ClienteItem {
  [key: string]: any
  id: string | number
  id_inscripcion?: string | number
  identificacion: string
  nombre: string
  apellido: string
  fotografia: string
  email: string
  inicio_inscripcion: string
  fin_inscripcion: string
  costo: string
  sancion: string
  estado: string
  sancionado?: string
  tiene_sancion?: boolean
  tiene_sancion_previa?: boolean
  es_vetado?: boolean
  inicio_sancion?: string
  fin_sancion?: string
  total_sanciones?: number
  historial_sanciones?: SancionRegistroItem[]
  inscripciones?: any[]
  sanciones?: any[]
  vetos?: any[]
  id_tipo_identificacion: string
  id_nacionalidad: string
  id_genero: string
  id_estado_civil: string
  edad: string
  detalles: string
  telefono: string
  celular: string
  direccion: string
  fecha_nacimiento: string
  raw: Persona
}

export interface PersonaRenovacion {
  ID_PERSONA?: number | string
  ID_GENERO?: number | string
  ID_TIPOIDENTIFICACION?: number | string
  ID_NACIONALIDAD?: number | string
  ID_ESTADOCIVIL?: number | string
  IDENTIFICACION_PERSONA?: string
  NOMBRE_PERSONA?: string
  APELLIDO_PERSONA?: string
  TELEFONO_PERSONA?: string
  CELULAR_PERSONA?: string
  CORREO_PERSONA?: string
  DIRECCION_PERSONA?: string
  DETALLE_PERSONA?: string
  EDAD_PERSONA?: number | string
  DETALLE_INSCRIPCION?: string
  FOTO_PERSONA?: string
  ESTADO_INSCRIPCION?: number | string
  ID_INSCRIPCION?: number | string
  FECHA_PERSONA?: string
  ESTADOINSCRIPCION_PERSONA?: number
  tipo_usuario?: string
  FECHAINICIO_INSCRIPCION?: string
  FECHAREGISTRO_PERSONA?: string
  COSTO_INSCRIPCION?: number | string
  ESTADO_PERSONA?: number
  [key: string]: any
}
