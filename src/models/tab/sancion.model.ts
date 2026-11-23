// Modelo puro de la entidad tab_sancion en Base de Datos
import { TabInscripcion } from './inscripcion.model'

export interface TabSancion {
  // Llave primaria
  ID_SANCION?: number | string

  // Llaves foráneas
  ID_PERSONA?: number | string | null
  ID_INSCRIPCION?: number | string | null

  // Campos propios
  FECHAINICIO_SANCION?: string | null
  FECHAFIN_SANCION?: string | null
  DETALLE_SANCION?: string | null
  ESTADO_SANCION?: number | string | null

  // Relaciones
  INSCRIPCION?: TabInscripcion
}

export type Sancion = TabSancion

export type {
  SancionItem,
  PaginacionSanciones,
  SancionState,
} from '@/slices/sancionSlice'
