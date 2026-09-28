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
  FECHA_PERSONA: string
  ESTADO_PERSONA: string
  ESTADOINSCRIPCION_PERSONA: boolean | string
  EDAD_PERSONA?: string | number
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
  FECHA_PERSONA: '',
  ESTADO_PERSONA: '1',
  ESTADOINSCRIPCION_PERSONA: true,
}

export interface ClienteItem {
  [key: string]: any
  id: string | number
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
