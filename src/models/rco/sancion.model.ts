export interface SancionItem {
  [key: string]: any
  id: number | string
  id_sancion?: number | string
  ID_SANCION?: number | string
  id_prestamo?: number | string
  ID_PRESTAMO?: number | string
  id_persona?: number | string
  ID_PERSONA?: number | string
  Cedula: string
  Nombres: string
  Apellidos: string
  Celular: string
  Telefono: string
  Libro?: string
  ISBN?: string
  Fecha_prestamo?: string
  Fecha_entrega?: string
  Fecha_inicio_sancion?: string
  Fecha_fin_sancion?: string
  Motivo_sancion?: string
  estado?: string
  estado_usuario?: string
  ESTADO_PERSONA?: number | string
  status: string
  vetado?: string
  estado_sancion?: number | string
  esVetado?: boolean
  esDePorVida?: boolean
  raw?: any
}

export interface QuitarSancionPayload {
  idSancion?: number | string
  id_persona?: number | string
  [key: string]: any
}

export interface SancionarDePorVidaPayload {
  id_persona?: number | string
  ID_PERSONA?: number | string
  id_sancion?: number | string
  ID_SANCION?: number | string
  motivo?: string
  detalle?: string
  [key: string]: any
}
