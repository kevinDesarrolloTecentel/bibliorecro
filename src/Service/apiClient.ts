import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { clearAuthSession } from '../utils/auth'
import store from '../store'
import { sessionExpired } from '../authSlice'

export const BACKEND_API_BASE = '/api'

export const apiClient = axios.create({
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json, text/plain, */*',
  },
})

// Request interceptor: sanitiza la URL y asegura que el token NO viaje expuesto en cabeceras HTTP del navegador
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  // Prevenir que el token viaje expuesto en los parámetros de la URL
  if (config.params && 'token' in config.params) {
    delete config.params.token
  }
  if (config.headers) {
    delete config.headers['Authorization']
    delete config.headers['authorization']
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined
    const url = originalRequest?.url || ''
    const isLoginEndpoint = url.includes('/login')

    // Si recibimos 401 o 419 en una petición protegida normal (token vencido o no autorizado)
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 419) &&
      !isLoginEndpoint
    ) {
      clearAuthSession()
      store.dispatch(sessionExpired())
      if (typeof window !== 'undefined' && !window.location.hash.includes('#/login')) {
        window.location.replace('/#/login?session_expired=true')
      }
      return Promise.reject(error)
    }

    return Promise.reject(error)
  },
)

export default apiClient
