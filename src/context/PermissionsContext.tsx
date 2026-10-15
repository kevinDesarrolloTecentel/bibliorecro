import React, { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import { obtenerMisPermisos } from '@/Service/amd/permisosService'
import { MisPermisosData } from '@/models/adm/permiso.model'

interface PermissionsContextType {
  esAdmin: boolean
  rutasPermitidas: Set<string>
  accionesPermitidas: Set<string>
  loadingPermisos: boolean
  permisosCargados: boolean
  canAccessPath: (path?: string) => boolean
  canDoAction: (codigoAccion: string) => boolean
  recargarPermisos: (silent?: boolean) => Promise<void>
}

const PermissionsContext = createContext<PermissionsContextType>({
  esAdmin: false,
  rutasPermitidas: new Set(),
  accionesPermitidas: new Set(),
  loadingPermisos: false,
  permisosCargados: false,
  canAccessPath: () => false,
  canDoAction: () => false,
  recargarPermisos: async () => {},
})

interface CachedPermissions {
  esAdmin: boolean
  rutas: string[]
  acciones: string[]
  timestamp: number
}

const PERMISOS_CACHE_KEY = 'biblio_permisos_cache'

const getCachedPermissions = (): CachedPermissions | null => {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(PERMISOS_CACHE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

const saveCachedPermissions = (esAdmin: boolean, rutas: Set<string>, acciones: Set<string>) => {
  if (typeof window === 'undefined') return
  try {
    const payload: CachedPermissions = {
      esAdmin,
      rutas: Array.from(rutas),
      acciones: Array.from(acciones),
      timestamp: Date.now(),
    }
    localStorage.setItem(PERMISOS_CACHE_KEY, JSON.stringify(payload))
  } catch (e) {
    console.warn('[PermissionsContext] No se pudo guardar caché en localStorage:', e)
  }
}

const clearCachedPermissions = () => {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(PERMISOS_CACHE_KEY)
  } catch {}
}

export const PermissionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation()
  const prevPathRef = useRef<string>(location.pathname)
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated)
  const user = useSelector((state: RootState) => state.auth.user) as any
  const isUserAdmin = Boolean(
    user && (
      Boolean(user.ES_ADMINISTRADOR) ||
      Number(user.ID_ROL ?? user.id_rol) === 1
    )
  )

  // 1. Inicializar inmediatamente con el caché de localStorage si existe (intermediario instantáneo)
  const cached = useMemo(() => (isAuthenticated ? getCachedPermissions() : null), [isAuthenticated])

  const [esAdmin, setEsAdmin] = useState<boolean>(cached?.esAdmin || isUserAdmin || false)
  const [rutasPermitidas, setRutasPermitidas] = useState<Set<string>>(
    cached ? new Set(cached.rutas) : new Set(),
  )
  const [accionesPermitidas, setAccionesPermitidas] = useState<Set<string>>(
    cached ? new Set(cached.acciones) : new Set(),
  )
  // Si ya tenemos permisos en localStorage o es admin, no mostramos spinner en absoluto
  const [loadingPermisos, setLoadingPermisos] = useState<boolean>(!cached && !isUserAdmin && isAuthenticated)
  const [permisosCargados, setPermisosCargados] = useState<boolean>(Boolean(cached) || isUserAdmin)

  const isFetchingRef = useRef(false)

  const cargarPermisos = useCallback(
    async (silent: boolean = false) => {
      if (!isAuthenticated) {
        setRutasPermitidas(new Set())
        setAccionesPermitidas(new Set())
        setEsAdmin(false)
        setLoadingPermisos(false)
        setPermisosCargados(false)
        clearCachedPermissions()
        return
      }

      // Evitar múltiples llamadas simultáneas
      if (isFetchingRef.current) return
      isFetchingRef.current = true

      // Solo mostrar spinner en la primerísima carga si NO tenemos caché previo ni somos admin
      if (!silent && !getCachedPermissions() && !isUserAdmin) {
        setLoadingPermisos(true)
      }

      try {
        const res = await obtenerMisPermisos()
        const data: MisPermisosData = res?.data

        const admin = Boolean(data?.ES_ADMINISTRADOR || Number(data?.ID_ROL) === 1)
        setEsAdmin(admin)

        const rutas = new Set<string>()
        const acciones = new Set<string>()

        if (data?.MODULOS && Array.isArray(data.MODULOS)) {
          data.MODULOS.forEach((modulo) => {
            modulo.PANTALLAS?.forEach((pantalla) => {
              if (pantalla.PATH_PERMISO) {
                const pathClean = pantalla.PATH_PERMISO.trim().toLowerCase().replace(/\/+$/, '') || '/'
                rutas.add(pathClean)
              }
              pantalla.ACCIONES?.forEach((acc: any) => {
                const codigo = typeof acc === 'string' ? acc : acc?.CODIGO_ACCION
                if (codigo) acciones.add(codigo)
              })
            })
          })
        }

        setRutasPermitidas(rutas)
        setAccionesPermitidas(acciones)

        // Guardar en localStorage para que actúe como intermediario instantáneo
        saveCachedPermissions(admin, rutas, acciones)
      } catch (error) {
        console.error('[PermissionsContext] Error cargando permisos del usuario:', error)
      } finally {
        isFetchingRef.current = false
        setLoadingPermisos(false)
        setPermisosCargados(true)
      }
    },
    [isAuthenticated, isUserAdmin],
  )

  const rutasRef = useRef<Set<string>>(rutasPermitidas)
  const accionesRef = useRef<Set<string>>(accionesPermitidas)
  const esAdminRef = useRef<boolean>(esAdmin)
  const permisosCargadosRef = useRef<boolean>(permisosCargados)
  const isVerifyingRef = useRef<boolean>(false)

  useEffect(() => {
    rutasRef.current = rutasPermitidas
    accionesRef.current = accionesPermitidas
    esAdminRef.current = esAdmin
    permisosCargadosRef.current = permisosCargados
  }, [rutasPermitidas, accionesPermitidas, esAdmin, permisosCargados])

  // Verifica con el servidor si los permisos del rol actual cambiaron.
  // Si cambiaron las rutas, acciones o nivel de admin, recarga la pestaña automáticamente.
  const verificarCambiosYRecargar = useCallback(async () => {
    if (!isAuthenticated || esAdminRef.current || !permisosCargadosRef.current) return
    if (isVerifyingRef.current) return

    isVerifyingRef.current = true
    try {
      const res = await obtenerMisPermisos()
      const data: MisPermisosData = res?.data
      if (!data) return

      const admin = Boolean(data?.ES_ADMINISTRADOR || Number(data?.ID_ROL) === 1)
      const rutas = new Set<string>()
      const acciones = new Set<string>()

      if (data?.MODULOS && Array.isArray(data.MODULOS)) {
        data.MODULOS.forEach((modulo) => {
          modulo.PANTALLAS?.forEach((pantalla) => {
            if (pantalla.PATH_PERMISO) {
              const pathClean = pantalla.PATH_PERMISO.trim().toLowerCase().replace(/\/+$/, '') || '/'
              rutas.add(pathClean)
            }
            pantalla.ACCIONES?.forEach((acc: any) => {
              const codigo = typeof acc === 'string' ? acc : acc?.CODIGO_ACCION
              if (codigo) acciones.add(codigo)
            })
          })
        })
      }

      // Comparar con el estado actual
      const rutasIguales =
        rutas.size === rutasRef.current.size &&
        [...rutas].every((r) => rutasRef.current.has(r))

      const accionesIguales =
        acciones.size === accionesRef.current.size &&
        [...acciones].every((a) => accionesRef.current.has(a))

      const cambioDetectado = !rutasIguales || !accionesIguales || admin !== esAdminRef.current

      if (cambioDetectado) {
        saveCachedPermissions(admin, rutas, acciones)
        window.location.reload()
      }
    } catch (e) {
    } finally {
      isVerifyingRef.current = false
    }
  }, [isAuthenticated])

  useEffect(() => {
    const fromPath = prevPathRef.current
    if (fromPath !== location.pathname) {
      prevPathRef.current = location.pathname
      // No re-verificar permisos en la navegación hacia o desde el login
      if (fromPath.includes('login') || location.pathname.includes('login')) {
        return
      }
      if (isAuthenticated && !esAdminRef.current && permisosCargadosRef.current) {
        verificarCambiosYRecargar()
      }
    }
  }, [location.pathname, isAuthenticated, verificarCambiosYRecargar])

  useEffect(() => {
    if (isAuthenticated) {
      cargarPermisos(true)
    }

    const handleSync = () => {
      if (esAdminRef.current) {
        cargarPermisos(true)
      } else {
        verificarCambiosYRecargar()
      }
    }
    window.addEventListener('biblio:permisos-actualizados', handleSync)

    // BroadcastChannel para sincronizar entre pestañas del navegador instantáneamente
    const channel = getSyncChannel()
    const handleChannelMessage = (event: MessageEvent) => {
      if (event.data === 'sync' || event.data === 'reload') {
        if (!esAdminRef.current) {
          verificarCambiosYRecargar()
        } else {
          cargarPermisos(true)
        }
      }
    }
    if (channel) {
      channel.addEventListener('message', handleChannelMessage)
    }

    // Storage event (sincronización entre ventanas y pestañas respaldada por localStorage)
    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'biblio_permisos_sync_event') {
        if (!esAdminRef.current) {
          verificarCambiosYRecargar()
        } else {
          cargarPermisos(true)
        }
      }
    }
    window.addEventListener('storage', handleStorage)

    return () => {
      window.removeEventListener('biblio:permisos-actualizados', handleSync)
      if (channel) {
        channel.removeEventListener('message', handleChannelMessage)
      }
      window.removeEventListener('storage', handleStorage)
    }
  }, [isAuthenticated, cargarPermisos, verificarCambiosYRecargar])

  const canAccessPath = useCallback(
    (path?: string): boolean => {
      if (!path) return true
      if (esAdmin) return true

      const clean = path.split('?')[0].trim().toLowerCase().replace(/\/+$/, '') || '/'
      return rutasPermitidas.has(clean)
    },
    [esAdmin, rutasPermitidas],
  )

  const canDoAction = useCallback(
    (codigoAccion: string): boolean => {
      if (esAdmin) return true
      return accionesPermitidas.has(codigoAccion)
    },
    [esAdmin, accionesPermitidas],
  )

  const value = useMemo(
    () => ({
      esAdmin,
      rutasPermitidas,
      accionesPermitidas,
      loadingPermisos,
      permisosCargados,
      canAccessPath,
      canDoAction,
      recargarPermisos: (silent: boolean = true) => cargarPermisos(silent),
    }),
    [esAdmin, rutasPermitidas, accionesPermitidas, loadingPermisos, permisosCargados, canAccessPath, canDoAction, cargarPermisos],
  )

  return <PermissionsContext.Provider value={value}>{children}</PermissionsContext.Provider>
}

export const usePermissions = () => useContext(PermissionsContext)

// Canal compartido persistente para que postMessage no sea cancelado antes de enviarse
let syncChannel: BroadcastChannel | null = null
const getSyncChannel = () => {
  if (typeof window === 'undefined') return null
  if (!syncChannel) {
    try {
      syncChannel = new BroadcastChannel('biblio_permisos_sync')
    } catch {
      syncChannel = null
    }
  }
  return syncChannel
}

/**
 * Dispara una notificación global (en la misma pestaña y entre pestañas)
 * para que todos los componentes (Sidebar, ProtectedRoute, etc.) recarguen
 * sus permisos en tiempo real sin requerir F5.
 */
export const notificarCambioPermisos = () => {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent('biblio:permisos-actualizados'))
  try {
    const ch = getSyncChannel()
    ch?.postMessage('sync')
  } catch (e) {}
  try {
    localStorage.setItem('biblio_permisos_sync_event', Date.now().toString())
  } catch (e) {}
}
