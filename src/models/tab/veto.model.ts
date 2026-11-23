// Modelo de tab_veto_permanente
import { TabInscripcion } from './inscripcion.model'

export interface TabVetoPermanente {
  // Llave primaria
  ID_VETO?: number | string

  // Llaves foráneas
  ID_PERSONA?: number | string | null
  ID_INSCRIPCION?: number | string | null

  // Campos propios
  FECHA_VETO?: string | null
  MOTIVO_VETO?: string | null
  ESTADO_VETO?: number | string | null

  // Relaciones
  INSCRIPCION?: TabInscripcion
}

export type VetoPermanente = TabVetoPermanente
