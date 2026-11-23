import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RcoPrestamo } from '@/models/rco/prestamos.model'

export interface PrestamoItem extends RcoPrestamo {
  [key: string]: any
  TITULO_LIBROS?: string
  ISBN_LIBROS?: string
  NOMBRE_PERSONA?: string
  APELLIDO_PERSONA?: string
  IDENTIFICACION_PERSONA?: string
  TELEFONO_PERSONA?: string
  CELULAR_PERSONA?: string
  ESTADO_TEXTO?: string
  ESTADO_SANCION?: number | string | null
  FECHAINICIO_SANCION?: string | null
  FECHAFIN_SANCION?: string | null
  DETALLE_SANCION?: string | null
  TIENE_SANCION?: boolean
}

// Estructura de Paginación para Préstamos
export interface PaginacionPrestamos {
  current_page: number
  total: number
  per_page: number
  last_page: number
}

// Opciones para selectores en creación de préstamos
export interface LibroOption {
  value: string | number
  label: string
  isbn?: string
  titulo?: string
  autor?: string
}

export interface UsuarioOption {
  value: string | number
  label: string
  cedula?: string
  nombre?: string
  apellido?: string
  estado?: string
  tieneSancion?: boolean
  sancion?: any
  raw?: any
}

// Estado Global del Módulo de Préstamos
export interface PrestamoState {
  prestamos: PrestamoItem[]
  prestamoSeleccionado: PrestamoItem | null
  paginacionPrestamos: PaginacionPrestamos
}

const initialState: PrestamoState = {
  prestamos: [],
  prestamoSeleccionado: null,
  paginacionPrestamos: {
    current_page: 1,
    total: 0,
    per_page: 10,
    last_page: 1,
  },
}

export const prestamoSlice = createSlice({
  name: 'prestamos',
  initialState,
  reducers: {
    setPrestamos: (state, action: PayloadAction<any>) => {
      const payload = action.payload
      if (!payload) return

      if (Array.isArray(payload)) {
        state.prestamos = payload
        state.paginacionPrestamos.total = payload.length
      } else if (typeof payload === 'object') {
        const source = payload.data || payload.prestamos || payload
        if (Array.isArray(source)) {
          state.prestamos = source
        }

        if (payload.pagination) {
          state.paginacionPrestamos = {
            ...state.paginacionPrestamos,
            current_page: Number(payload.pagination.current_page) || 1,
            total: Number(payload.pagination.total) || state.prestamos.length,
            per_page: Number(payload.pagination.per_page) || 10,
            last_page: Number(payload.pagination.last_page) || 1,
          }
        } else {
          if (payload.current_page !== undefined) {
            state.paginacionPrestamos.current_page = Number(payload.current_page)
          }
          if (payload.total !== undefined) {
            state.paginacionPrestamos.total = Number(payload.total)
          }
          if (payload.per_page !== undefined) {
            state.paginacionPrestamos.per_page = Number(payload.per_page)
          }
          if (payload.last_page !== undefined) {
            state.paginacionPrestamos.last_page = Number(payload.last_page)
          }
        }
      }
    },

    setPaginacionPrestamos: (state, action: PayloadAction<Partial<PaginacionPrestamos>>) => {
      state.paginacionPrestamos = {
        ...state.paginacionPrestamos,
        ...action.payload,
      }
    },

    setPrestamoSeleccionado: (state, action: PayloadAction<PrestamoItem | null>) => {
      state.prestamoSeleccionado = action.payload
    },

    agregarPrestamo: (state, action: PayloadAction<PrestamoItem>) => {
      state.prestamos.unshift(action.payload)
      state.paginacionPrestamos.total += 1
    },

    actualizarPrestamoEnLista: (state, action: PayloadAction<PrestamoItem>) => {
      const id = action.payload.ID_PRESTAMO
      const idx = state.prestamos.findIndex(
        (p) => String(p.ID_PRESTAMO) === String(id),
      )
      if (idx !== -1) {
        state.prestamos[idx] = { ...state.prestamos[idx], ...action.payload }
      }
      if (
        state.prestamoSeleccionado &&
        String(state.prestamoSeleccionado.ID_PRESTAMO) === String(id)
      ) {
        state.prestamoSeleccionado = {
          ...state.prestamoSeleccionado,
          ...action.payload,
        }
      }
    },

    eliminarPrestamoDeLista: (state, action: PayloadAction<number | string>) => {
      state.prestamos = state.prestamos.filter(
        (p) => String(p.ID_PRESTAMO) !== String(action.payload),
      )
      state.paginacionPrestamos.total = Math.max(0, state.paginacionPrestamos.total - 1)
      if (
        state.prestamoSeleccionado &&
        String(state.prestamoSeleccionado.ID_PRESTAMO) === String(action.payload)
      ) {
        state.prestamoSeleccionado = null
      }
    },
  },
})

export const {
  setPrestamos,
  setPaginacionPrestamos,
  setPrestamoSeleccionado,
  agregarPrestamo,
  actualizarPrestamoEnLista,
  eliminarPrestamoDeLista,
} = prestamoSlice.actions

export default prestamoSlice.reducer
