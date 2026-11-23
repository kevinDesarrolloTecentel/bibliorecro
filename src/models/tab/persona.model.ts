// Modelo de tab_personas
import { TabGenero } from './genero.model'
import { TabTipoIdentificacion } from './tipoIdentificacion.model'
import { TabNacionalidad } from './nacionalidad.model'
import { TabEstadoCivil } from './estadoCivil.model'
import { TabInscripcion } from './inscripcion.model'
import { TabSancion } from './sancion.model'
import { TabVetoPermanente } from './veto.model'

export interface TabPersona {
  [key: string]: any

  // Llave primaria
  ID_PERSONA?: number | string

  // Llaves foráneas
  ID_GENERO?: number | string | null
  ID_TIPOIDENTIFICACION?: number | string | null
  ID_NACIONALIDAD?: number | string | null
  ID_ESTADOCIVIL?: number | string | null
  ID_INSCRIPCION?: number | string | null

  // Campos propios de la tabla tab_persona
  IDENTIFICACION_PERSONA?: string | null
  NOMBRE_PERSONA?: string | null
  APELLIDO_PERSONA?: string | null
  TELEFONO_PERSONA?: string | null
  CELULAR_PERSONA?: string | null
  CORREO_PERSONA?: string | null
  DIRECCION_PERSONA?: string | null
  FECHAREGISTRO_PERSONA?: string | null
  FOTO_PERSONA?: string | File | null
  DETALLE_PERSONA?: string | null
  DETALLE_INSCRIPCION?: string | null
  FECHA_PERSONA?: string | null
  EDAD_PERSONA?: string | null
  ESTADO_PERSONA?: number | string | null
  ESTADOINSCRIPCION_PERSONA?: number | string | boolean | null

  // Relaciones directas
  GENERO?: TabGenero
  TIPOIDENTIFICACION?: TabTipoIdentificacion
  NACIONALIDAD?: TabNacionalidad
  ESTADOCIVIL?: TabEstadoCivil

  inscripciones?: TabInscripcion[]
  sanciones?: TabSancion[]
  vetos?: TabVetoPermanente[]
  TIENE_SANCION?: number | null
  TIENE_VETO_PERMANENTE?: number | null
  ESTADO?: string | null

  tipo_usuario?: 'Nuevo' | 'Renovación' | string | null
}

export type Persona = TabPersona
export type PersonaRenovacion = TabPersona
export type ClienteItem = TabPersona
