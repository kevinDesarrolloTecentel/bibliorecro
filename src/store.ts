import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import adminReducer from './slices/adminSlice'
import libroReducer from './slices/libroSlice'
import prestamoReducer from './slices/prestamoSlice'
import personaReducer from './slices/personaSlice'
import sancionReducer from './slices/sancionSlice'
import reporteReducer from './slices/reporteSlice'
import dashboardReducer from './slices/dashboardSlice'
import detallesLibroReducer from './slices/detallesLibroSlice'

export type UiState = {
  sidebarShow: boolean
  theme: string
  sidebarUnfoldable: boolean
}

export type State = UiState

const initialUiState: UiState = {
  sidebarShow: true,
  theme: 'light',
  sidebarUnfoldable: false,
}

const uiReducer = (state = initialUiState, { type, ...rest }: any) => {
  switch (type) {
    case 'set':
      return { ...state, ...rest }
    default:
      return state
  }
}

const store = configureStore({
  reducer: {
    ui: uiReducer,
    auth: authReducer,
    admin: adminReducer,
    libros: libroReducer,
    detallesLibro: detallesLibroReducer,
    prestamos: prestamoReducer,
    personas: personaReducer,
    sanciones: sancionReducer,
    reportes: reporteReducer,
    dashboard: dashboardReducer,
  },

    devTools: import.meta.env.VITE_REDUX_DEVTOOLS === 'true',

})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store
