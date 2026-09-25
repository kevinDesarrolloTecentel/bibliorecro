import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { getStoredUser, setAuthSession, clearAuthSession } from './utils/auth'
import { AuthState, UserData } from './models/auth'

const initialUser: UserData | null = typeof window !== 'undefined' ? getStoredUser() : null

const initialState: AuthState = {
  user: initialUser,
  isAuthenticated: !!initialUser,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<UserData>) => {
      state.user = action.payload
      state.isAuthenticated = true
      setAuthSession(action.payload, action.payload.token)
    },
    logoutSuccess: (state) => {
      state.user = null
      state.isAuthenticated = false
      clearAuthSession()
    },
    sessionExpired: (state) => {
      state.user = null
      state.isAuthenticated = false
      clearAuthSession()
    },
  },
})

export const { loginSuccess, logoutSuccess, sessionExpired } = authSlice.actions
export default authSlice.reducer