// Modelo de tab_inscripcion
import { TabPersona } from './persona.model'
import { AdminUsuario } from '../adm/user.model'

export interface TabInscripcion {
  // Llave primaria
  ID_INSCRIPCION?: number | string

  // Llaves foráneas
  ID_PERSONA?: number | string | null
  ID_USUARIO?: number | string | null

  // Campos propios
  FECHAINICIO_INSCRIPCION?: string | null
  FECHAFIN_INSCRIPCION?: string | null
  COSTO_INSCRIPCION?: number | string | null
  DETALLE_INSCRIPCION?: string | null
  ESTADO_INSCRIPCION?: number | string | null

  // Relaciones
  PERSONA?: TabPersona
  USUARIO?: AdminUsuario
}

export type Inscripcion = TabInscripcion


