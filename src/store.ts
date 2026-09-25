import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice'

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
  },
})

export type RootState = ReturnType<typeof store.getState>

export default store
