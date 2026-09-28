export interface Renovacion {
  ID_RENOVACIONES: string | number
  ID_INSCRIPCION: string | number
  ID_PERSONA: string | number
  FECHAINICIO_RENOVACIONES: Date | string
  COSTO_RENOVACIONES: number | string
  DETALLE_RENOVACIONES: string
  ESTADO_RENOVACIONES: string | number
}

export type renovaciones = Renovacion
export type Renovaciones = Renovacion