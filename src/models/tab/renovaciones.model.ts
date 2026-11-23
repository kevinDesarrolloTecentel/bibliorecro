// Modelo de tab_renovaciones
import { TabInscripcion } from './inscripcion.model'
import { TabPersona } from './persona.model'

export interface TabRenovaciones {
  // Llave primaria
  ID_RENOVACIONES?: number | string

  // Llaves foráneas
  ID_INSCRIPCION?: number | string | null
  ID_PERSONA?: number | string | null

  // Campos propios
  FECHAINICIO_RENOVACIONES?: string | null
  FECHAFIN_RENOVACIONES?: string | null
  COSTO_RENOVACIONES?: number | string | null
  DETALLE_RENOVACIONES?: string | null
  ESTADO_RENOVACIONES?: number | string | null

  // Relaciones
  INSCRIPCION?: TabInscripcion
  PERSONA?: TabPersona
}

export type Renovaciones = TabRenovaciones
export type PersonaRenovacion = TabRenovaciones

