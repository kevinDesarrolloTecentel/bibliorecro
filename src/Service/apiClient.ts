import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { getStoredToken, clearAuthSession } from '../utils/auth'
import store from '../store'
import { sessionExpired } from '../authSlice'

export const BACKEND_API_BASE = '/api'

export const apiClient = axios.create({
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getStoredToken()
  if (token && config.headers) {
    const rawJwt = token.replace(/^Bearer\s+/i, '').trim()
    config.headers.Authorization = `Bearer ${rawJwt}`
  }
  if (config.params && 'token' in config.params) {
    delete config.params.token
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const isLoginEndpoint = error.config?.url?.includes('/login')
    if (!isLoginEndpoint && error.response && (error.response.status === 401 || error.response.status === 419)) {
      clearAuthSession()
      store.dispatch(sessionExpired())
      if (!window.location.hash.includes('#/login')) {
        window.location.hash = '#/login?session_expired=true'
      }
    }
    return Promise.reject(error)
  },
)

export default apiClient
