import { useMemo, useCallback, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState } from '@/store'
import {
  setAuthPermisos,
  MisPermisosData,
  MisPermisosModulo,
  MisPermisosPantalla,
} from '@/slices/authSlice'
import { obtenerMisPermisos } from '@/Service/adm/Permisos'

export const normalizePath = (p?: string): string => {
  if (!p) return '/'
  let clean = p.split('?')[0].trim().toLowerCase()
  if (!clean.startsWith('/')) clean = '/' + clean
  return clean.replace(/\/+$/, '') || '/'
}

// Promesa en vuelo compartida a nivel de módulo para evitar peticiones duplicadas simultáneas
let inFlightPermisosPromise: Promise<MisPermisosData | null> | null = null

// Disparador reactivo cuando se modifican roles o permisos en el sistema
export const marcarCambioPermisos = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('biblio:permisos_cambiados'))
  }
}

export const usePermissions = () => {
  const dispatch = useDispatch()
  const permisos = useSelector((state: RootState) => state.auth.permisos)
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated)

  // Módulos y Roles de la sesión del usuario logueado
  const modulos = useMemo(() => permisos?.MODULOS || [], [permisos])
  const roles = useMemo(() => permisos?.ROLES || [], [permisos])

  // Rutas y códigos de acciones autorizados para este usuario
  const { rutasPermitidas, accionesPermitidas } = useMemo(() => {
    const rutas = new Set<string>()
    const acciones = new Set<string>()

    if (modulos && Array.isArray(modulos)) {
      modulos.forEach((m: MisPermisosModulo) => {
        m.PANTALLAS?.forEach((p: MisPermisosPantalla) => {
          if (p.PATH_PERMISO) {
            rutas.add(normalizePath(p.PATH_PERMISO))
          }
          if (Array.isArray(p.ACCIONES)) {
            p.ACCIONES.forEach((acc: any) => {
              const codigo = typeof acc === 'string' ? acc : acc?.CODIGO_ACCION
              if (codigo && typeof codigo === 'string') {
                acciones.add(codigo.trim())
              }
            })
          }
        })
      })
    }

    return { rutasPermitidas: rutas, accionesPermitidas: acciones }
  }, [modulos])

  // Recargar los permisos del usuario activo desde el backend hacia Redux (con deduplicación)
  const recargarPermisos = useCallback(
    async (force: boolean = false): Promise<MisPermisosData | null> => {
      if (!isAuthenticated) return null

      // Si ya están cargados y no se fuerza recarga, reutilizar los de Redux
      if (!force && permisos !== null && Array.isArray(permisos.MODULOS)) {
        return permisos
      }

      // Si ya hay una petición en vuelo, unirse a esa misma promesa en lugar de crear otra
      if (inFlightPermisosPromise) {
        return inFlightPermisosPromise
      }

      inFlightPermisosPromise = (async (): Promise<MisPermisosData | null> => {
        try {
          const res = await obtenerMisPermisos()
          const raw = res?.data || res
          if (raw && (Array.isArray(raw.MODULOS) || Array.isArray(raw.ROLES))) {
            const cleanPermisos: MisPermisosData = {
              ID_USUARIO: raw.ID_USUARIO,
              ROLES: Array.isArray(raw.ROLES) ? raw.ROLES : [],
              MODULOS: Array.isArray(raw.MODULOS) ? raw.MODULOS : [],
            }
            dispatch(setAuthPermisos(cleanPermisos))
            return cleanPermisos
          }
          return null
        } catch (err) {
          console.error('[usePermissions] Error al recargar permisos del usuario:', err)
          return null
        } finally {
          inFlightPermisosPromise = null
        }
      })()

      return inFlightPermisosPromise
    },
    [isAuthenticated, permisos, dispatch],
  )

  // Escuchar eventos de cambio de permisos para recargar
  useEffect(() => {
    const handlePermisosCambiados = () => {
      recargarPermisos(true)
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('biblio:permisos_cambiados', handlePermisosCambiados)
      return () => {
        window.removeEventListener('biblio:permisos_cambiados', handlePermisosCambiados)
      }
    }
  }, [recargarPermisos])

  const canAccessPath = useCallback(
    (path?: string): boolean => {
      if (!path) return false
      return rutasPermitidas.has(normalizePath(path))
    },
    [rutasPermitidas],
  )

  const canDoAction = useCallback(
    (codigoAccion: string): boolean => {
      return accionesPermitidas.has(codigoAccion.trim())
    },
    [accionesPermitidas],
  )

  const hasRole = useCallback(
    (roleName?: string): boolean => {
      if (!roleName) return false
      const target = roleName.trim().toUpperCase()
      return roles.some((r: any) => {
        const name = typeof r === 'string' ? r : r?.NOMBRE_ROL
        return typeof name === 'string' && name.trim().toUpperCase() === target
      })
    },
    [roles],
  )

  const hasAnyRole = useCallback(
    (requiredRoles?: string[]): boolean => {
      if (!requiredRoles || requiredRoles.length === 0) return true
      return requiredRoles.some((role) => hasRole(role))
    },
    [hasRole],
  )

  const hasPermission = useCallback(
    (permission?: string): boolean => {
      if (!permission) return true
      const clean = permission.trim()
      if (clean.startsWith('/')) {
        return canAccessPath(clean)
      }
      return canDoAction(clean) || canAccessPath(clean)
    },
    [canAccessPath, canDoAction],
  )

  const verificarAccionEnServidor = useCallback(
    async (codigoAccion: string): Promise<boolean> => {
      return canDoAction(codigoAccion)
    },
    [canDoAction],
  )

  return {
    roles,
    modulos,
    rutasPermitidas,
    accionesPermitidas,
    loadingPermisos: inFlightPermisosPromise !== null,
    permisosCargados: Boolean(permisos !== null && Array.isArray(permisos.MODULOS)),
    canAccessPath,
    canDoAction,
    hasRole,
    hasAnyRole,
    hasPermission,
    recargarPermisos,
    verificarAccionEnServidor,
  }
}

export default usePermissions
