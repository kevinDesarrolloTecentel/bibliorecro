import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RcoLibros } from '@/models/rco/libros.model'
import { RcoPrestamo } from '@/models/rco/prestamos.model'
import { TabPersona } from '@/models/tab/persona.model'

// Reporte de Libros: hereda campos base de RcoLibros y añade agregaciones/JOINs
export interface ReporteItemLibro extends Omit<Partial<RcoLibros>, 'ISBN_LIBROS' | 'CODIGODEBARRAS_LIBROS'> {
  ISBN_LIBROS?: string
  CODIGODEBARRAS_LIBROS?: string
  NOMBRE_AUTOR?: string
  NOMBRE_CATEGORIA?: string
  NOMBRE_EDITORIAL?: string
  FECHAINGRESO_LIBROS?: string
  FECHABAJA_LIBROS?: string
  MOTIVO_BAJA?: string
  FECHA_BAJA?: string
  MOTIVO_LIBRO_BAJA?: string
  DETALLE_BAJA?: string
  [key: string]: any
}

// Reporte de Préstamos: hereda campos base de RcoPrestamo y añade datos del usuario y libro asociado
export interface ReporteItemPrestamo extends Partial<RcoPrestamo> {
  ID_PERSONA?: number | string
  TITULO_LIBROS?: string
  ISBN_LIBROS?: string
  CODIGODEBARRAS_LIBROS?: string
  NOMBRE_PERSONA?: string
  APELLIDO_PERSONA?: string
  IDENTIFICACION_PERSONA?: string
  CEDULA_PERSONA?: string
  CELULAR_PERSONA?: string
  CORREO_PERSONA?: string
  FECHAPRESTAMO_PRESTAMO?: string
  FECHADEVOLUCION_PRESTAMO?: string
  ESTADOINSCRIPCION_PERSONA?: number
  CANTIDAD_PRESTAMOS?: number
  TOTAL_PRESTAMOS?: number
  MES?: string | number
  ANIO?: string | number
  MES_NUMERO?: number
  NOMBRE_MES?: string
  CANTIDAD?: number
  TOTAL?: number
  [key: string]: any
}

// Reporte de Usuarios: hereda campos base de TabPersona y añade métricas de préstamos/inscripción
export interface ReporteItemUsuario extends Omit<Partial<TabPersona>, 'EDAD_PERSONA'> {
  EDAD_PERSONA?: number
  CEDULA_PERSONA?: string
  GENERO_PERSONA?: string
  OCUPACION_PERSONA?: string
  INSTITUCION_PERSONA?: string
  FECHAINSCRIPCION_INSCRIPCION?: string
  FECHAFIN_INSCRIPCION?: string
  FECHA_INSCRIPCION?: string
  FECHA_RENOVACION?: string
  ESTADO_RENOVACIONES?: number
  tipo_usuario?: string
  TOTAL_PRESTAMOS?: number
  CANTIDAD_LIBROS?: number
  CANTIDAD_PRESTAMOS?: number
  TITULO_LIBROS?: string
  FECHAPRESTAMO_PRESTAMO?: string
  FECHADEVOLUCION_PRESTAMO?: string
  ESTADO_PRESTAMO?: number | string
  [key: string]: any
}

// Reporte de Tejuelos: hereda campos base de RcoLibros
export interface ReporteItemTejuelo extends Omit<Partial<RcoLibros>, 'ISBN_LIBROS' | 'CODIGODEBARRAS_LIBROS'> {
  ISBN_LIBROS?: string
  CODIGODEBARRAS_LIBROS?: string
  NOMBRE_AUTOR?: string
  NOMBRE_CATEGORIA?: string
  CODIGO_CATEGORIA?: string
  [key: string]: any
}

export interface ReporteOption {
  label: string
  value: string | number
}

// Aliases para compatibilidad canónica
export type LibroInventarioItem = ReporteItemLibro
export type PrestamoReporteItem = ReporteItemPrestamo
export type PersonaReporteItem = ReporteItemUsuario
export type LibroTejueloItem = ReporteItemTejuelo
export type GeneroOption = ReporteOption
export type CategoriaOption = ReporteOption

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

export interface UseReportTejReturn {
  startDate: string
  setStartDate: (val: string) => void
  endDate: string
  setEndDate: (val: string) => void
  pdfPath: string | null
  totalTejuelos: number
  totalPaginas: number
  haBuscado: boolean
  libros: LibroTejueloItem[]
  isLoading: boolean
  activeTab: 'etiquetas' | 'tabla' | 'pdf'
  setActiveTab: (tab: 'etiquetas' | 'tabla' | 'pdf') => void
  handleGeneratePdf: () => Promise<void>
  handleReset: () => void
  handleDescargarPdf: () => Promise<void>
  handleDownloadPdf: () => Promise<void>
  handlePrint: () => void
  canGenerarReporteTejuelos: boolean
  canDescargarPdfTejuelos: boolean
}

export interface SetReportePayload {
  tipoReporte: string
  archivoDescarga?: string | null
  total: number
  filtros?: Record<string, any>
}

export interface ReporteState {
  tipoReporte: string | null
  archivoDescarga: string | null
  total: number
  filtros: Record<string, any>
}

const initialState: ReporteState = {
  tipoReporte: null,
  archivoDescarga: null,
  total: 0,
  filtros: {},
}

export const reporteSlice = createSlice({
  name: 'reporte',
  initialState,
  reducers: {
    setReporteActivo: (state, action: PayloadAction<SetReportePayload>) => {
      state.tipoReporte = action.payload.tipoReporte
      state.archivoDescarga = action.payload.archivoDescarga ?? null
      state.total = action.payload.total
      state.filtros = action.payload.filtros || {}
    },
    limpiarReporte: (state) => {
      state.tipoReporte = null
      state.archivoDescarga = null
      state.total = 0
      state.filtros = {}
    },
  },
})

export const { setReporteActivo, limpiarReporte } = reporteSlice.actions
export default reporteSlice.reducer
