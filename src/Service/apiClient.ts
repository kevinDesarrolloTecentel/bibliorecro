import axios, { AxiosError } from 'axios'
import { getStoredToken, clearAuthSession } from '../utils/auth'
import store from '../store'
import { sessionExpired } from '@/slices/authSlice'

// URL base de la API del backend
export const BACKEND_API_BASE = import.meta.env.VITE_API_URL


export const apiClient = axios.create({
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

// Interceptor de Petición: Inyecta el Token Bearer automáticamente si existe en cliente (fallback)
apiClient.interceptors.request.use((config) => {
  const token = getStoredToken()

  if (token && config.headers) {
    const rawJwt = token.replace(/^Bearer\s+/i, '').trim()
    config.headers.Authorization = `Bearer ${rawJwt}`
  }

  // Permite que el navegador asigne el boundary automáticamente en FormData
  if (config.data instanceof FormData && config.headers) {
    if (typeof (config.headers as any).delete === 'function') {
      ;(config.headers as any).delete('Content-Type')
    } else {
      delete config.headers['Content-Type']
    }
  }

  return config
})

// Interceptor de Respuesta: Control de Sesión Expirada (401 / 419 / 403)
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status
    const isLoginEndpoint = error.config?.url?.includes('/login')

    if ((status === 401 || status === 419 || status === 403) && !isLoginEndpoint) {
      clearAuthSession()
      store.dispatch(sessionExpired())

      const errorData = error.response?.data as any
      const errorMsg = String(
        (typeof errorData === 'string' ? errorData : errorData?.message || errorData?.error) || ''
      ).toLowerCase()

      const isInactive =
        status === 403 ||
        errorMsg.includes('inactiv') ||
        errorMsg.includes('bloquea') ||
        errorMsg.includes('desactiv')

      const redirectParam = isInactive ? 'user_inactive=true' : 'session_expired=true'

      if (typeof window !== 'undefined' && !window.location.hash.includes('#/login')) {
        window.location.replace(`/#/login?${redirectParam}`)
      }
    }

    return Promise.reject(error)
  },
)

export default apiClient
