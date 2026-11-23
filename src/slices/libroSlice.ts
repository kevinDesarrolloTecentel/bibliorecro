import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RcoLibros } from '@/models/rco/libros.model'

// Interfaz de datos para la lista de inventario (incluye campos aplanados de la BD)
export interface LibroItem extends RcoLibros {
  [key: string]: any
  NOMBRE_AUTOR?: string
  NOMBRE_CATEGORIA?: string
  NOMBRE_EDITORIAL?: string
  NOMBRE_PROVEEDOR?: string
  NOMBRE_FORMATOS?: string
  NOMBRE_TIPO?: string
  NOMBRE_RCOGENERO?: string
  ESTADOS_PRESTAMO?: string
  ESTADO?: string
  EN_PRESTAMO?: number | string
}

// Estructura de Paginación para Inventario de Libros (/librosNew)
export interface PaginacionLibros {
  current_page: number
  total: number
  per_page: number
  last_page: number
}

// Opciones para selectores / comboboxes
export interface CatalogoOption {
  value: string | number
  label: string
}

// Estado Global del Módulo de Libros (Inventario)
export interface LibroState {
  libros: LibroItem[]
  libroSeleccionado: RcoLibros | null
  paginacionLibros: PaginacionLibros
}

const initialState: LibroState = {
  libros: [],
  libroSeleccionado: null,
  paginacionLibros: {
    current_page: 1,
    total: 0,
    per_page: 10,
    last_page: 1,
  },
}

export const libroSlice = createSlice({
  name: 'libros',
  initialState,
  reducers: {
    // ----------------------------------------------------
    // Libros (Inventario)
    // ----------------------------------------------------
    setLibros: (state, action: PayloadAction<any>) => {
      const payload = action.payload
      if (!payload) return

      if (Array.isArray(payload)) {
        state.libros = payload
        state.paginacionLibros.total = payload.length
      } else if (typeof payload === 'object') {
        const source = payload.data || payload.libros || payload
        if (Array.isArray(source)) {
          state.libros = source
        }

        if (payload.pagination) {
          state.paginacionLibros = {
            ...state.paginacionLibros,
            current_page: Number(payload.pagination.current_page) || 1,
            total: Number(payload.pagination.total) || state.libros.length,
            per_page: Number(payload.pagination.per_page) || 10,
            last_page: Number(payload.pagination.last_page) || 1,
          }
        } else {
          if (payload.current_page !== undefined) {
            state.paginacionLibros.current_page = Number(payload.current_page)
          }
          if (payload.total !== undefined) {
            state.paginacionLibros.total = Number(payload.total)
          }
          if (payload.per_page !== undefined) {
            state.paginacionLibros.per_page = Number(payload.per_page)
          }
          if (payload.last_page !== undefined) {
            state.paginacionLibros.last_page = Number(payload.last_page)
          }
        }
      }
    },

    setPaginacionLibros: (state, action: PayloadAction<Partial<PaginacionLibros>>) => {
      state.paginacionLibros = {
        ...state.paginacionLibros,
        ...action.payload,
      }
    },

    setLibroSeleccionado: (state, action: PayloadAction<RcoLibros | null>) => {
      state.libroSeleccionado = action.payload
    },

    agregarLibro: (state, action: PayloadAction<LibroItem>) => {
      state.libros.unshift(action.payload)
      state.paginacionLibros.total += 1
    },

    actualizarLibroEnLista: (state, action: PayloadAction<LibroItem>) => {
      const id = action.payload.ID_LIBROS
      const idx = state.libros.findIndex((l) => String(l.ID_LIBROS) === String(id))
      if (idx !== -1) {
        state.libros[idx] = { ...state.libros[idx], ...action.payload }
      }
      if (state.libroSeleccionado && String(state.libroSeleccionado.ID_LIBROS) === String(id)) {
        state.libroSeleccionado = { ...state.libroSeleccionado, ...action.payload }
      }
    },

    eliminarLibroDeLista: (state, action: PayloadAction<number | string>) => {
      state.libros = state.libros.filter((l) => String(l.ID_LIBROS) !== String(action.payload))
      state.paginacionLibros.total = Math.max(0, state.paginacionLibros.total - 1)
      if (state.libroSeleccionado && String(state.libroSeleccionado.ID_LIBROS) === String(action.payload)) {
        state.libroSeleccionado = null
      }
    },
  },
})

export const {
  setLibros,
  setPaginacionLibros,
  setLibroSeleccionado,
  agregarLibro,
  actualizarLibroEnLista,
  eliminarLibroDeLista,
} = libroSlice.actions

export default libroSlice.reducer
