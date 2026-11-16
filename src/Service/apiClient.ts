import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { getStoredToken, clearAuthSession } from '../utils/auth'
import store from '../store'
import { sessionExpired } from '../authSlice'

// Determinar la URL base del backend
const getBackendApiBase = (): string => {
  const customBase = import.meta.env.VITE_API_BASE_URL
  if (customBase) return customBase

  if (import.meta.env.VITE_USE_PROXY === 'false') {
    const apiUrl = import.meta.env.VITE_API_URL
    const cleanUrl = String(apiUrl).replace(/\/+$/, '')
    return cleanUrl.includes('/server.php/api') ? cleanUrl : `${cleanUrl}/server.php/api`
  }

  return '/server.php/api'
}

export const BACKEND_API_BASE = getBackendApiBase()

export const apiClient = axios.create({
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json, text/plain, */*',
  },
})

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (config.params && 'token' in config.params) {
    delete config.params.token
  }

  const token = getStoredToken()

  const isUsingProxy =
    import.meta.env.VITE_USE_PROXY !== 'false' &&
    (Boolean(config.url && config.url.includes('server.php')) ||
      BACKEND_API_BASE.includes('server.php'))

  if (config.headers) {
    if (isUsingProxy) {
      delete config.headers['Authorization']
      delete config.headers['authorization']
      delete config.headers['X-Auth-Token']
      delete config.headers['x-auth-token']
    } else if (token) {
      const rawJwt = token.replace(/^Bearer\s+/i, '').trim()
      if (typeof config.headers.set === 'function') {
        config.headers.set('Authorization', `Bearer ${rawJwt}`)
      } else {
        config.headers['Authorization'] = `Bearer ${rawJwt}`
      }
    }
  }

  if (config.headers && config.data instanceof FormData) {
    delete config.headers['Content-Type']
    delete config.headers['content-type']
  }

  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined
    const url = originalRequest?.url || ''
    const isLoginEndpoint = url.includes('/login')

    if (
      error.response &&
      (error.response.status === 401 ||
       error.response.status === 419 ||
       error.response.status === 403) &&
      !isLoginEndpoint
    ) {
      clearAuthSession()
      store.dispatch(sessionExpired())

      const errorData = error.response?.data as any
      const errorMsg = String(
        (typeof errorData === 'string' ? errorData : errorData?.message || errorData?.error) || ''
      ).toLowerCase()

      const isInactive =
        error.response.status === 403 ||
        errorMsg.includes('inactiv') ||
        errorMsg.includes('bloquea') ||
        errorMsg.includes('desactiv')

      const redirectParam = isInactive ? 'user_inactive=true' : 'session_expired=true'

      if (typeof window !== 'undefined' && !window.location.hash.includes('#/login')) {
        window.location.replace(`/#/login?${redirectParam}`)
      }
      return Promise.reject(error)
    }

    return Promise.reject(error)
  },
)

export default apiClient
