import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { TabPersona } from '@/models/tab/persona.model'
import { TabTipoIdentificacion } from '@/models/tab/tipoIdentificacion.model'
import { TabNacionalidad } from '@/models/tab/nacionalidad.model'
import { TabGenero } from '@/models/tab/genero.model'
import { TabEstadoCivil } from '@/models/tab/estadoCivil.model'

// Estructura de Paginación de Personas Registradas (/personasRegistradas)
export interface PaginacionRegistrados {
  current_page: number
  total: number
  per_page: number
  last_page?: number
}

// Estructura de Solicitudes (/personasE)
export interface TotalesSolicitudes {
  total_nuevos: number
  total_renovaciones: number
  total_general: number
}

// Catálogos auxiliares
export interface CatalogosPersona {
  tiposIdentificacion: TabTipoIdentificacion[]
  nacionalidades: TabNacionalidad[]
  generos: TabGenero[]
  estadosCiviles: TabEstadoCivil[]
}

// Estado global del módulo de Gestión de Usuarios
export interface PersonaState {
  // PERSONAS REGISTRADAS (/personasRegistradas) ---
  registrados: TabPersona[]
  paginacionRegistrados: PaginacionRegistrados
  personaSeleccionada: TabPersona | null

  // SOLICITUDES DE NUEVOS Y RENOVACIONES (/personasE) ---
  solicitudes: TabPersona[]
  totalesSolicitudes: TotalesSolicitudes
  solicitudSeleccionada: TabPersona | null

  // -CATÁLOGOS AUXILIARES
  catalogos: CatalogosPersona
}

const initialState: PersonaState = {
  // Registrados
  registrados: [],
  paginacionRegistrados: {
    current_page: 1,
    total: 0,
    per_page: 10,
    last_page: 1,
  },
  personaSeleccionada: null,

  // Solicitudes
  solicitudes: [],
  totalesSolicitudes: {
    total_nuevos: 0,
    total_renovaciones: 0,
    total_general: 0,
  },
  solicitudSeleccionada: null,

  // Catálogos
  catalogos: {
    tiposIdentificacion: [],
    nacionalidades: [],
    generos: [],
    estadosCiviles: [],
  },
}

export const personaSlice = createSlice({
  name: 'personas',
  initialState,
  reducers: {
    // ----------------------------------------------------
    // PERSONAS REGISTRADAS (/personasRegistradas)
    // ----------------------------------------------------
    setRegistrados: (state, action: PayloadAction<any>) => {
      const payload = action.payload
      if (!payload) return

      let items: TabPersona[] = []
      let meta: Partial<PaginacionRegistrados> = {}

      if (Array.isArray(payload)) {
        items = payload
        meta = {
          current_page: 1,
          total: payload.length,
          per_page: payload.length || 10,
          last_page: 1,
        }
      } else if (typeof payload === 'object') {
        // Extraer el objeto paginador o lista
        const source = payload.personas || payload.data || payload

        if (Array.isArray(source)) {
          items = source
          meta = {
            current_page: Number(payload.current_page) || state.paginacionRegistrados.current_page || 1,
            total: Number(payload.total) || source.length,
            per_page: Number(payload.per_page) || state.paginacionRegistrados.per_page || 10,
            last_page:
              Number(payload.last_page) ||
              Math.max(
                1,
                Math.ceil(
                  (Number(payload.total) || source.length) /
                    (Number(payload.per_page) || state.paginacionRegistrados.per_page || 10),
                ),
              ),
          }
        } else if (source && typeof source === 'object') {
          const innerList = Array.isArray(source.data) ? source.data : []
          items = innerList
          const totalVal = Number(source.total ?? payload.total ?? innerList.length)
          const perPageVal = Number(
            source.per_page ?? payload.per_page ?? state.paginacionRegistrados.per_page ?? 10,
          )
          const currentPageVal = Number(
            source.current_page ?? payload.current_page ?? state.paginacionRegistrados.current_page ?? 1,
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

      state.registrados = items
      state.paginacionRegistrados = {
        ...state.paginacionRegistrados,
        ...meta,
      }
    },

    setPaginacionRegistrados: (state, action: PayloadAction<Partial<PaginacionRegistrados>>) => {
      state.paginacionRegistrados = {
        ...state.paginacionRegistrados,
        ...action.payload,
      }
    },

    setPersonaSeleccionada: (state, action: PayloadAction<TabPersona | null>) => {
      state.personaSeleccionada = action.payload
    },

    agregarRegistrado: (state, action: PayloadAction<TabPersona>) => {
      state.registrados.unshift(action.payload)
      state.paginacionRegistrados.total += 1
    },

    actualizarRegistrado: (state, action: PayloadAction<TabPersona>) => {
      const id = action.payload.ID_PERSONA
      const idx = state.registrados.findIndex((p) => p.ID_PERSONA === id)
      if (idx !== -1) {
        state.registrados[idx] = { ...state.registrados[idx], ...action.payload }
      }
      if (state.personaSeleccionada?.ID_PERSONA === id) {
        state.personaSeleccionada = { ...state.personaSeleccionada, ...action.payload }
      }
    },

    eliminarRegistrado: (state, action: PayloadAction<number | string>) => {
      state.registrados = state.registrados.filter((p) => p.ID_PERSONA !== action.payload)
      state.paginacionRegistrados.total = Math.max(0, state.paginacionRegistrados.total - 1)
      if (state.personaSeleccionada?.ID_PERSONA === action.payload) {
        state.personaSeleccionada = null
      }
    },

    // ----------------------------------------------------
    // SOLICITUDES DE NUEVOS Y RENOVACIONES (/personasE)
    // ----------------------------------------------------
    setSolicitudes: (
      state,
      action: PayloadAction<
        | {
            totales?: TotalesSolicitudes
            data: TabPersona[]
          }
        | TabPersona[]
      >,
    ) => {
      if (Array.isArray(action.payload)) {
        state.solicitudes = action.payload
      } else {
        state.solicitudes = action.payload.data || []
        if (action.payload.totales) {
          state.totalesSolicitudes = action.payload.totales
        }
      }
    },

    setTotalesSolicitudes: (state, action: PayloadAction<TotalesSolicitudes>) => {
      state.totalesSolicitudes = action.payload
    },

    setSolicitudSeleccionada: (state, action: PayloadAction<TabPersona | null>) => {
      state.solicitudSeleccionada = action.payload
    },

    removerSolicitud: (state, action: PayloadAction<number | string>) => {
      state.solicitudes = state.solicitudes.filter((s) => s.ID_PERSONA !== action.payload)
      state.totalesSolicitudes.total_general = Math.max(
        0,
        state.totalesSolicitudes.total_general - 1,
      )
      if (state.solicitudSeleccionada?.ID_PERSONA === action.payload) {
        state.solicitudSeleccionada = null
      }
    },

    // ----------------------------------------------------
    // CATÁLOGOS AUXILIARES
    // ----------------------------------------------------
    setCatalogos: (state, action: PayloadAction<Partial<CatalogosPersona>>) => {
      state.catalogos = {
        ...state.catalogos,
        ...action.payload,
      }
    },
  },
})

export const {
  setRegistrados,
  setPaginacionRegistrados,
  setPersonaSeleccionada,
  agregarRegistrado,
  actualizarRegistrado,
  eliminarRegistrado,

  setSolicitudes,
  setTotalesSolicitudes,
  setSolicitudSeleccionada,
  removerSolicitud,

  setCatalogos,
} = personaSlice.actions

export default personaSlice.reducer
