import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { TabPersona } from '@/models/tab/persona.model'

// --- Interfaces de Entidades y Datos del Dashboard ---

export interface DashboardTotals {
  totalNuevos?: number
  totalRenovaciones?: number
  sumatoriaTotal?: number
}

export interface DashboardPrestamosTotals {
  activos?: number[]
  entregados?: number[]
  totalPrestamos?: number
  totalEntregados?: number
  totalGeneral?: number
}

export interface RangoEdadItem {
  rango_edad: string
  hombres: number | string
  mujeres: number | string
}

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
  raw: Partial<TabPersona> & Record<string, any>
}

export type UsuarioItem = DashboardUsuarioItem

// --- Estado Global del Dashboard (Redux) ---

export interface DashboardState {
  selectedYear: string
  selectedMonth: string
  totalesUsuarios: DashboardTotals
  totalesPrestamos: {
    totalPrestamos: number
    totalEntregados: number
    totalGeneral?: number
  }
}

const getCurrentCalendarYear = (): string => new Date().getFullYear().toString()

const initialState: DashboardState = {
  selectedYear: getCurrentCalendarYear(),
  selectedMonth: 'todos',
  totalesUsuarios: { totalNuevos: 0, totalRenovaciones: 0, sumatoriaTotal: 0 },
  totalesPrestamos: { totalPrestamos: 0, totalEntregados: 0, totalGeneral: 0 },
}

export const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setSelectedYear: (state, action: PayloadAction<string>) => {
      state.selectedYear = action.payload
    },
    setSelectedMonth: (state, action: PayloadAction<string>) => {
      state.selectedMonth = action.payload
    },
    setTotalesUsuarios: (state, action: PayloadAction<DashboardTotals>) => {
      state.totalesUsuarios = action.payload
    },
    setTotalesPrestamos: (
      state,
      action: PayloadAction<{ totalPrestamos: number; totalEntregados: number; totalGeneral?: number }>,
    ) => {
      state.totalesPrestamos = action.payload
    },
    resetDashboardFiltros: (state) => {
      state.selectedYear = getCurrentCalendarYear()
      state.selectedMonth = 'todos'
    },
  },
})

export const {
  setSelectedYear,
  setSelectedMonth,
  setTotalesUsuarios,
  setTotalesPrestamos,
  resetDashboardFiltros,
} = dashboardSlice.actions

export default dashboardSlice.reducer
