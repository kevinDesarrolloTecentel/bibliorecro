import { Persona } from '../tab/persona.model'


// Registro de mes de usuarios nuevos y renovaciones
export interface DashboardMonthlyData {
  MES: number | string
  USUARIOS_NUEVOS: number | string
  RENOVACIONES: number | string
}

// datos de usuarios nuevos y renovaciones
export interface DashboardPersonasNuevasResponse {
  success?: boolean
  data?: {
    anio?: string
    datos?: DashboardMonthlyData[]
    detalle?: {
      usuarios_nuevos?: Persona[] | any[]
      usuarios_renovaciones?: Persona[] | any[]
    }
  }
  datos?: DashboardMonthlyData[]
  detalle?: {
    usuarios_nuevos?: Persona[] | any[]
    usuarios_renovaciones?: Persona[] | any[]
  }
}

// totales consolidados para las tarjetas del Dashboard
export interface DashboardTotals {
  totalNuevos?: number
  totalRenovaciones?: number
  sumatoriaTotal?: number
}

// totales para el gráfico de préstamos activos y entregados
export interface DashboardPrestamosTotals {
  activos?: number[]
  entregados?: number[]
  totalPrestamos?: number
  totalEntregados?: number
}

export interface RawPrestamosTotals {
  totalPrestamos: number
  totalEntregados: number
  activos?: number[]
  entregados?: number[]
}


// rango de edad y genero
export interface RangoEdadItem {
  rango_edad: string
  hombres: number
  mujeres: number
}


//datos del usuario
export interface DashboardUsuarioItem {
  id: string
  cedula: string
  nombre: string
  apellido: string
  correo: string
  edad: number | string
  telefono: string
  tipo: 'Nuevo' | 'Renovación'
  tipoBadgeColor: 'success' | 'info'
  fecha: string
  raw: Record<string, any>
}

export type UsuarioItem = DashboardUsuarioItem


//lobros ingreso
export interface LibroIngresoItem {
  id?: number | string
  isbn: string
  titulo: string
  autor: string
  editorial: string
  proveedor: string
  categoria: string
  genero: string
  formato: string
  volumen: string
  pais: string
  fechaEdicion: string
  fechaIngreso: string
  estado: string
  precio?: string | number
  [key: string]: any
}


// datos del widget de libros
export interface UseLibrosIngReturn {
  fechaDesde: string
  fechaHasta: string
  libros: LibroIngresoItem[]
  loading: boolean
  exportando: boolean
  haBuscado: boolean
  totalLibros: number
  canBuscar?: boolean
  canExportar?: boolean
  setFechaDesde: (val: string | ((prev: string) => string)) => void
  setFechaHasta: (val: string | ((prev: string) => string)) => void
  handleDateChange: (val: Date | string | null, field: 'desde' | 'hasta') => void
  handleBuscarReporte: () => Promise<void>
  handleExportarExcel: () => Promise<void>
}
