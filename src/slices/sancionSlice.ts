import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { TabPersona } from '@/models/tab/persona.model'

// Estructura de presentación de cada usuario sancionado
export interface SancionItem extends Partial<TabPersona> {
  // Llaves principales
  ID_PERSONA?: number | string
  ID_SANCION?: number | string | null
  ID_INSCRIPCION?: number | string | null
  ID_PRESTAMO?: number | string | null

  // Información personal canónica
  IDENTIFICACION_PERSONA?: string | null
  NOMBRE_PERSONA?: string | null
  APELLIDO_PERSONA?: string | null
  CELULAR_PERSONA?: string | null
  TELEFONO_PERSONA?: string | null

  // Información de la sanción canónica
  FECHA_INICIO_SANCION?: string
  FECHA_FIN_SANCION?: string
  MOTIVO_SANCION?: string
  STATUS_SANCION_TEXTO?: string // 'Vetado' | 'Sancionado'
  ESTADO_TEXTO?: 'Activo' | 'Inactivo'
  ES_VETADO?: boolean
  TIENE_VETO_PERMANENTE?: number
  TIENE_SANCION?: number

  // Información del libro si proviene de préstamo
  TITULO_LIBROS?: string
  ISBN_LIBROS?: string

  // Historial y detalles
  HISTORIAL_SANCIONES?: any[]
  OTRAS_SANCIONES?: any[]

  // Firma de índice para compatibilidad con CSmartTable
  [key: string]: any
}

// Estructura de paginación
export interface PaginacionSanciones {
  current_page: number
  total: number
  per_page: number
  last_page: number
}

// Estado de Redux para Sanciones
export interface SancionState {
  sancionados: SancionItem[]
  sancionadoSeleccionado: SancionItem | null
  paginacionSanciones: PaginacionSanciones
}

const initialState: SancionState = {
  sancionados: [],
  sancionadoSeleccionado: null,
  paginacionSanciones: {
    current_page: 1,
    total: 0,
    per_page: 10,
    last_page: 1,
  },
}

export const sancionSlice = createSlice({
  name: 'sanciones',
  initialState,
  reducers: {
    setSancionados: (state, action: PayloadAction<any>) => {
      const payload = action.payload
      if (!payload) return

      let items: SancionItem[] = []
      let meta: Partial<PaginacionSanciones> = {}

      if (Array.isArray(payload)) {
        items = payload
        meta = {
          current_page: 1,
          total: payload.length,
          per_page: payload.length || 10,
          last_page: 1,
        }
      } else if (typeof payload === 'object') {
        const source = payload.personas || payload.data || payload

        if (Array.isArray(source)) {
          items = source
          meta = {
            current_page: Number(payload.current_page) || state.paginacionSanciones.current_page || 1,
            total: Number(payload.total) || source.length,
            per_page: Number(payload.per_page) || state.paginacionSanciones.per_page || 10,
            last_page:
              Number(payload.last_page) ||
              Math.max(
                1,
                Math.ceil(
                  (Number(payload.total) || source.length) /
                    (Number(payload.per_page) || state.paginacionSanciones.per_page || 10),
                ),
              ),
          }
        } else if (source && typeof source === 'object') {
          const innerList = Array.isArray(source.data) ? source.data : []
          items = innerList
          const totalVal = Number(source.total ?? payload.total ?? innerList.length)
          const perPageVal = Number(
            source.per_page ?? payload.per_page ?? state.paginacionSanciones.per_page ?? 10,
          )
          const currentPageVal = Number(
            source.current_page ?? payload.current_page ?? state.paginacionSanciones.current_page ?? 1,
          )
          const lastPageVal = Number(
            source.last_page ??
              payload.last_page ??
              Math.max(1, Math.ceil(totalVal / (perPageVal || 10))),
          )

          meta = {
            current_page: currentPageVal,
            total: totalVal,
            per_page: perPageVal,
            last_page: lastPageVal,
          }
        }
      }

      state.sancionados = items
      state.paginacionSanciones = {
        ...state.paginacionSanciones,
        ...meta,
      }
    },

    setPaginacionSanciones: (state, action: PayloadAction<Partial<PaginacionSanciones>>) => {
      state.paginacionSanciones = {
        ...state.paginacionSanciones,
        ...action.payload,
      }
    },

    setSancionadoSeleccionado: (state, action: PayloadAction<SancionItem | null>) => {
      state.sancionadoSeleccionado = action.payload
    },

    removerSancionDeLista: (state, action: PayloadAction<number | string>) => {
      state.sancionados = state.sancionados.filter(
        (s) => s.ID_PERSONA !== action.payload && s.ID_SANCION !== action.payload,
      )
      state.paginacionSanciones.total = Math.max(0, state.paginacionSanciones.total - 1)
      if (
        state.sancionadoSeleccionado?.ID_PERSONA === action.payload ||
        state.sancionadoSeleccionado?.ID_SANCION === action.payload
      ) {
        state.sancionadoSeleccionado = null
      }
    },

    actualizarSancionadoEnLista: (state, action: PayloadAction<SancionItem>) => {
      const id = action.payload.ID_PERSONA ?? action.payload.ID_SANCION
      const idx = state.sancionados.findIndex(
        (s) => s.ID_PERSONA === id || s.ID_SANCION === id,
      )
      if (idx !== -1) {
        state.sancionados[idx] = { ...state.sancionados[idx], ...action.payload }
      }
      if (
        state.sancionadoSeleccionado?.ID_PERSONA === id ||
        state.sancionadoSeleccionado?.ID_SANCION === id
      ) {
        state.sancionadoSeleccionado = { ...state.sancionadoSeleccionado, ...action.payload }
      }
    },
  },
})

export const {
  setSancionados,
  setPaginacionSanciones,
  setSancionadoSeleccionado,
  removerSancionDeLista,
  actualizarSancionadoEnLista,
} = sancionSlice.actions

export default sancionSlice.reducer
