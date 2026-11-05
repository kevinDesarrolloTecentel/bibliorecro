
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from 'react'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState } from '@/store'
import { loginSuccess } from '@/authSlice'
import { obtenerMisPermisos } from '@/Service/adm/Permisos'
import type { MisPermisosData } from '@/models/adm/permiso.model'

interface PermissionsContextType {
  esAdmin: boolean
  roles: any[]
  rutasPermitidas: Set<string>
  accionesPermitidas: Set<string>
  loadingPermisos: boolean
  permisosCargados: boolean
  canAccessPath: (path?: string) => boolean
  canDoAction: (codigoAccion: string) => boolean
  recargarPermisos: (silent?: boolean) => Promise<void>
  verificarAccionEnServidor: (codigoAccion: string) => Promise<boolean>
}

const PermissionsContext = createContext<PermissionsContextType>({
  esAdmin: false,
  roles: [],
  rutasPermitidas: new Set(),
  accionesPermitidas: new Set(),
  loadingPermisos: false,
  permisosCargados: false,
  canAccessPath: () => false,
  canDoAction: () => false,
  recargarPermisos: async () => {},
  verificarAccionEnServidor: async () => false,
})

interface CachedPermissions {
  esAdmin: boolean
  roles: any[]
  rutas: string[]
  acciones: string[]
  timestamp: number
}

const PERMISOS_CACHE_KEY = 'biblio_permisos_cache'
export const PERMISOS_EVENTO_LOCAL = 'biblio_permisos_actualizados_local'

export const marcarCambioPermisos = () => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('biblio_permisos_modificados')
      clearCachedPermissions()
      window.dispatchEvent(new Event(PERMISOS_EVENTO_LOCAL))
    } catch { }
  }
}

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

const saveCachedPermissions = (
  esAdmin: boolean,
  roles: any[],
  rutas: Set<string>,
  acciones: Set<string>,
) => {
  if (typeof window === 'undefined') return

  try {
    const payload: CachedPermissions = {
      esAdmin,
      roles: roles || [],
      rutas: Array.from(rutas),
      acciones: Array.from(acciones),
      timestamp: Date.now(),
    }

    localStorage.setItem(
      PERMISOS_CACHE_KEY,
      JSON.stringify(payload),
    )
  } catch (error) {
    console.warn(
      '[PermissionsContext] No se pudo guardar caché:',
      error,
    )
  }
}

const clearCachedPermissions = () => {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem(PERMISOS_CACHE_KEY)
    localStorage.removeItem('biblio_permisos_modificados')
  } catch {}
}

export const PermissionsProvider: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  const dispatch = useDispatch()

  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  )

  const user = useSelector(
    (state: RootState) => state.auth.user,
  ) as any

  const userRef = useRef<any>(user)

  useEffect(() => {
    userRef.current = user
  }, [user])

  const isUserAdmin = Boolean(
    user &&
      (Boolean(user.ES_ADMINISTRADOR) ||
        Number(user.ID_ROL) === 1 ||
        user.ROLES?.some(
          (r: any) =>
            Number(r.ID_ROL) === 1 ||
            String(r.NOMBRE_ROL).toUpperCase() === 'ADMINISTRADOR',
        ) ||
        user.IDS_ROLES?.includes(1)),
  )

  // Inicializar permisos desde caché
  const cached = useMemo(
    () => (isAuthenticated ? getCachedPermissions() : null),
    [isAuthenticated],
  )

  const [esAdmin, setEsAdmin] = useState<boolean>(
    cached?.esAdmin ?? isUserAdmin ?? false,
  )

  const [roles, setRoles] = useState<any[]>(
    cached?.roles ?? (user?.ROLES || []),
  )

  const [rutasPermitidas, setRutasPermitidas] = useState<
    Set<string>
  >(cached ? new Set(cached.rutas) : new Set())

  const [accionesPermitidas, setAccionesPermitidas] = useState<
    Set<string>
  >(cached ? new Set(cached.acciones) : new Set())

  const [loadingPermisos, setLoadingPermisos] = useState<boolean>(
    !cached && isAuthenticated,
  )

  const [permisosCargados, setPermisosCargados] = useState<boolean>(
    Boolean(cached),
  )

  // Evita consultas simultáneas
  const isFetchingRef = useRef(false)

  // Obtener y actualizar permisos
  const cargarPermisos = useCallback(
    async (silent: boolean = false) => {
      if (!isAuthenticated) {
        setRutasPermitidas(new Set())
        setAccionesPermitidas(new Set())
        setRoles([])
        setEsAdmin(false)
        setLoadingPermisos(false)
        setPermisosCargados(false)
        clearCachedPermissions()
        return
      }

      if (isFetchingRef.current) return

      isFetchingRef.current = true

      if (!silent && !getCachedPermissions()) {
        setLoadingPermisos(true)
      }

      try {
        const res = await obtenerMisPermisos()
        const data: MisPermisosData = res?.data

        const userRoles = data?.ROLES || []

        const admin = Boolean(
          data?.ES_ADMINISTRADOR ||
            Number(data?.ID_ROL) === 1 ||
            data?.IDS_ROLES?.includes(1) ||
            userRoles.some(
              (r: any) =>
                Number(r.ID_ROL) === 1 ||
                String(r.NOMBRE_ROL).toUpperCase() ===
                  'ADMINISTRADOR',
            ),
        )

        const rutas = new Set<string>()
        const acciones = new Set<string>()

        if (data?.MODULOS && Array.isArray(data.MODULOS)) {
          data.MODULOS.forEach((modulo) => {
            modulo.PANTALLAS?.forEach((pantalla) => {
              if (pantalla.PATH_PERMISO) {
                const pathClean =
                  pantalla.PATH_PERMISO
                    .trim()
                    .toLowerCase()
                    .replace(/\/+$/, '') || '/'

                rutas.add(pathClean)
              }

              pantalla.ACCIONES?.forEach((acc: any) => {
                const codigo =
                  typeof acc === 'string'
                    ? acc
                    : acc?.CODIGO_ACCION

                if (codigo) {
                  acciones.add(codigo)
                }
              })
            })
          })
        }

        // Actualizar estado global de permisos (solo si cambiaron para evitar re-renderizados innecesarios)
        setEsAdmin((prev) => (prev === admin ? prev : admin))
        setRoles(userRoles)
        setRutasPermitidas((prev) => {
          if (prev.size === rutas.size && Array.from(rutas).every((r) => prev.has(r))) {
            return prev
          }
          return rutas
        })
        setAccionesPermitidas((prev) => {
          if (prev.size === acciones.size && Array.from(acciones).every((a) => prev.has(a))) {
            return prev
          }
          return acciones
        })

        // Actualizar caché
        saveCachedPermissions(
          admin,
          userRoles,
          rutas,
          acciones,
        )

        // Sincronizar estado de administrador con Redux
        const currentUser = userRef.current

        if (
          currentUser &&
          admin !== Boolean(currentUser.ES_ADMINISTRADOR)
        ) {
          dispatch(
            loginSuccess({
              ...currentUser,
              ES_ADMINISTRADOR: admin,
            }),
          )
        }
      } catch (error) {
        console.error(
          '[PermissionsContext] Error cargando permisos:',
          error,
        )
      } finally {
        isFetchingRef.current = false
        setLoadingPermisos(false)
        setPermisosCargados(true)
      }
    },
    [isAuthenticated, dispatch],
  )

  // Función estable para recargar desde App.tsx
  const recargarPermisos = useCallback(
    (silent: boolean = true) => cargarPermisos(silent),
    [cargarPermisos],
  )

  // Carga inicial al autenticar o cerrar sesión
  useEffect(() => {
    if (isAuthenticated) {
      void cargarPermisos(true)
    } else {
      void cargarPermisos()
    }
  }, [isAuthenticated, cargarPermisos])

  // Escuchar cuando se actualizan permisos en la misma pestaña o desde otra pestaña
  useEffect(() => {
    if (!isAuthenticated) return

    const alDetectarCambio = () => {
      void cargarPermisos(true)
    }

    const alCambiarStorage = (e: StorageEvent) => {
      if (e.key === PERMISOS_CACHE_KEY) {
        alDetectarCambio()
      }
    }

    window.addEventListener(PERMISOS_EVENTO_LOCAL, alDetectarCambio)
    window.addEventListener('storage', alCambiarStorage)

    return () => {
      window.removeEventListener(PERMISOS_EVENTO_LOCAL, alDetectarCambio)
      window.removeEventListener('storage', alCambiarStorage)
    }
  }, [isAuthenticated, cargarPermisos])

  const canAccessPath = useCallback(
    (path?: string): boolean => {
      if (!path) return true

      const clean =
        path
          .split('?')[0]
          .trim()
          .toLowerCase()
          .replace(/\/+$/, '') || '/'

      return rutasPermitidas.has(clean)
    },
    [rutasPermitidas],
  )

  const canDoAction = useCallback(
    (codigoAccion: string): boolean => {
      return accionesPermitidas.has(codigoAccion)
    },
    [accionesPermitidas],
  )

  const verificarAccionEnServidor = useCallback(
    async (codigoAccion: string): Promise<boolean> => {
      if (!isAuthenticated) return false

      try {
        const res = await obtenerMisPermisos()
        const data: MisPermisosData = res?.data

        const userRoles = data?.ROLES || []
        const admin = Boolean(
          data?.ES_ADMINISTRADOR ||
            Number(data?.ID_ROL) === 1 ||
            data?.IDS_ROLES?.includes(1) ||
            userRoles.some(
              (r: any) =>
                Number(r.ID_ROL) === 1 ||
                String(r.NOMBRE_ROL).toUpperCase() === 'ADMINISTRADOR',
            ),
        )

        const rutas = new Set<string>()
        const acciones = new Set<string>()

        if (data?.MODULOS && Array.isArray(data.MODULOS)) {
          data.MODULOS.forEach((modulo) => {
            modulo.PANTALLAS?.forEach((pantalla) => {
              if (pantalla.PATH_PERMISO) {
                const pathClean =
                  pantalla.PATH_PERMISO
                    .trim()
                    .toLowerCase()
                    .replace(/\/+$/, '') || '/'
                rutas.add(pathClean)
              }

              pantalla.ACCIONES?.forEach((acc: any) => {
                const codigo =
                  typeof acc === 'string' ? acc : acc?.CODIGO_ACCION
                if (codigo) {
                  acciones.add(codigo)
                }
              })
            })
          })
        }

        // Actualizar estados reactivos globales y caché
        setEsAdmin(admin)
        setRoles(userRoles)
        setRutasPermitidas(rutas)
        setAccionesPermitidas(acciones)
        saveCachedPermissions(admin, userRoles, rutas, acciones)

        return acciones.has(codigoAccion)
      } catch (error) {
        console.warn('[PermissionsContext] Error verificando acción en servidor:', error)
        return accionesPermitidas.has(codigoAccion)
      }
    },
    [isAuthenticated, accionesPermitidas],
  )

  const value = useMemo(
    () => ({
      esAdmin,
      roles,
      rutasPermitidas,
      accionesPermitidas,
      loadingPermisos,
      permisosCargados,
      canAccessPath,
      canDoAction,
      recargarPermisos,
      verificarAccionEnServidor,
    }),
    [
      esAdmin,
      roles,
      rutasPermitidas,
      accionesPermitidas,
      loadingPermisos,
      permisosCargados,
      canAccessPath,
      canDoAction,
      recargarPermisos,
      verificarAccionEnServidor,
    ],
  )

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  )
}

export const usePermissions = () => useContext(PermissionsContext)
