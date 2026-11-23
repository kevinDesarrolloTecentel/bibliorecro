import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import Swal from 'sweetalert2'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/store'
import {
  setCatalogo as setCatalogoSlice,
  setRolSeleccionado,
} from '@/slices/adminSlice'
import { AdminRol } from '@/models/adm/rol.model'
import {
  obtenerCatalogo,
  obtenerPermisosRol,
  guardarPermisosRol,
} from '@/Service/adm/Permisos'
import { AdminPermiso } from '@/models/adm/permiso.model'
import { AdminPermisoAccion } from '@/models/adm/permisoAccion.model'
import { CatalogoModulo } from '@/models/adm/catalogo.model'
import { usePermissions, marcarCambioPermisos } from '@/hooks/auth/usePermissions'
import { parseApiErrors, showErrorAlert } from '@/utils/errors'

export const usePermisosMatriz = (rolesList: AdminRol[] = [], fetchRoles?: () => Promise<void>) => {
  const dispatch = useDispatch()
  const { canDoAction } = usePermissions()

  const canVerAcciones = canDoAction('btn_ver_acciones')
  const canCheckboxPermisos = canDoAction('btn_checkbox_permisos')
  const canModificarAcciones = canVerAcciones && canDoAction('btn_modificar_acciones')
  const canVerAccionesPorRol = canDoAction('btn_ver_acciones_por_rol')

  const catalogo = useSelector((state: RootState) => state.admin.catalogo)
  const rolSeleccionado = useSelector((state: RootState) => state.admin.rolSeleccionado)

  // Las acciones se extraen directamente del catálogo completo sin requerir una petición adicional
  const allAcciones = useMemo<AdminPermisoAccion[]>(() => {
    return catalogo.flatMap((m) => m.PANTALLAS).flatMap((p) => p.ACCIONES || [])
  }, [catalogo])

  const [matrix, setMatrix] = useState<Record<number, number[]>>({})
  const [accionesMatrix, setAccionesMatrix] = useState<Record<number, number[]>>({})
  const [loadingMatriz, setLoadingMatriz] = useState<boolean>(true)
  const [modifiedRoleIds, setModifiedRoleIds] = useState<Set<number>>(new Set())
  const [errorPermisos, setErrorPermisos] = useState<string | null>(null)
  const isFetchingPermisosRef = useRef<boolean>(false)

  // Seleccionar un rol en Redux
  const seleccionarRol = useCallback(
    (rol: AdminRol | null) => {
      dispatch(setRolSeleccionado(rol))
    },
    [dispatch],
  )

  // Estado para el modal de acciones/botones de una pantalla
  const [pantallaSeleccionada, setPantallaSeleccionada] = useState<AdminPermiso | null>(null)
  const [modalAccionesVisible, setModalAccionesVisible] = useState<boolean>(false)

  const handleAbrirAcciones = useCallback((pantalla: AdminPermiso) => {
    if (!canVerAcciones) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para ver y configurar las acciones de los permisos.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    setPantallaSeleccionada(pantalla)
    setModalAccionesVisible(true)
  }, [canVerAcciones])

  const handleCerrarAcciones = useCallback(() => {
    setModalAccionesVisible(false)
    setPantallaSeleccionada(null)
  }, [])

  // Lista plana de todas las pantallas
  const allPantallas = useMemo<AdminPermiso[]>(() => {
    return catalogo.flatMap((m) => m.PANTALLAS)
  }, [catalogo])

  // Lista plana de todos los IDs de pantallas
  const allPantallasIds = useMemo<number[]>(() => {
    return allPantallas.map((p) => Number(p.ID_PERMISO))
  }, [allPantallas])

  // Métricas generales
  const totalPantallas = allPantallasIds.length
  const totalClusters = catalogo.length
  const modulosNombres = useMemo<string[]>(() => {
    return catalogo.map((m) => m.MODULO)
  }, [catalogo])

  // Cargar catálogo de pantallas y módulos desde la base de datos
  const cargarCatalogo = useCallback(async () => {
    try {
      const resCat = await obtenerCatalogo()

      if (resCat && (resCat as any).success === false) {
        setErrorPermisos((resCat as any).message)
        setLoadingMatriz(false)
        return
      }

      const catalogoData = Array.isArray(resCat)
        ? resCat
        : Array.isArray(resCat?.data)
          ? resCat.data
          : []

      if (catalogoData.length > 0) {
        // Ordenar módulos y pantallas
        const ordenado = [...catalogoData]
          .map((modulo: CatalogoModulo) => ({
            ...modulo,
            PANTALLAS: [...modulo.PANTALLAS].sort(
              (a, b) => Number(a.ID_PERMISO) - Number(b.ID_PERMISO),
            ),
          }))
          .sort((a: CatalogoModulo, b: CatalogoModulo) => {
            const minA =
              a.PANTALLAS.length > 0
                ? Math.min(...a.PANTALLAS.map((p) => Number(p.ID_PERMISO)))
                : 999
            const minB =
              b.PANTALLAS.length > 0
                ? Math.min(...b.PANTALLAS.map((p) => Number(p.ID_PERMISO)))
                : 999
            return minA - minB
          })

        dispatch(setCatalogoSlice(ordenado))
      }
    } catch (err: any) {
      console.error('[usePermisosMatriz] Error al cargar catálogo de permisos:', err)
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error
      setErrorPermisos(msg)
      setLoadingMatriz(false)
    }
  }, [dispatch])

  // Cargar permisos y acciones asignados a cada rol desde la base de datos
  const cargarPermisosRoles = useCallback(async (roles: AdminRol[]) => {
    if (!roles || roles.length === 0) return
    if (isFetchingPermisosRef.current) return
    isFetchingPermisosRef.current = true
    setLoadingMatriz(true)
    try {
      const newMatrix: Record<number, number[]> = {}
      const newAccionesMatrix: Record<number, number[]> = {}

      await Promise.all(
        roles.map(async (rol: AdminRol) => {
          const rolId = Number(rol.ID_ROL)
          if (!rolId) return
          try {
            const res = await obtenerPermisosRol(rolId)
            if (res?.data) {
              const rawPantallas: (AdminPermiso | number)[] = res.data.PANTALLAS || []
              const pantallasIds = rawPantallas.map((p) =>
                typeof p === 'object' && p !== null ? Number(p.ID_PERMISO) : Number(p),
              )
              newMatrix[rolId] = pantallasIds

              const rawAcciones: (AdminPermisoAccion | number)[] = res.data.ACCIONES || []
              const accionesIds = rawAcciones.map((a) =>
                typeof a === 'object' && a !== null ? Number(a.ID_ACCION) : Number(a),
              )
              newAccionesMatrix[rolId] = accionesIds
            } else {
              newMatrix[rolId] = []
              newAccionesMatrix[rolId] = []
            }
          } catch (e) {
            console.warn(`[usePermisosMatriz] Error consultando permisos de rol ${rolId}:`, e)
            newMatrix[rolId] = []
            newAccionesMatrix[rolId] = []
          }
        }),
      )

      setMatrix(newMatrix)
      setAccionesMatrix(newAccionesMatrix)
      setModifiedRoleIds(new Set())

      if (roles && roles.length > 0) {
        dispatch(setRolSeleccionado(roles[0]))
      }
    } catch (err) {
      console.error('[usePermisosMatriz] Error al cargar permisos de roles:', err)
    } finally {
      isFetchingPermisosRef.current = false
      setLoadingMatriz(false)
    }
  }, [dispatch])

  // Cargar catálogo al montar
  useEffect(() => {
    cargarCatalogo()
  }, [cargarCatalogo])

  // Cargar permisos cuando la lista de roles esté disponible
  useEffect(() => {
    if (rolesList && rolesList.length > 0) {
      cargarPermisosRoles(rolesList)
    } else {
      setLoadingMatriz(false)
    }
  }, [rolesList, cargarPermisosRoles])

  const checkIsAdminRol = useCallback(
    (rolId: number): boolean => {
      const found = rolesList.find((r: AdminRol) => Number(r.ID_ROL) === Number(rolId))
      return Number(found?.NIVEL_ROL ?? 0) === 1
    },
    [rolesList],
  )

  // Helper para verificar si una pantalla está asignada a un rol
  const isPermisoAsignado = useCallback(
    (rolId: number, idPermiso: number | string): boolean => {
      const perms = matrix[rolId] || []
      return perms.includes(Number(idPermiso))
    },
    [matrix],
  )

  // Helper para verificar si una acción está asignada a un rol
  const isAccionAsignada = useCallback(
    (rolId: number, idAccion: number): boolean => {
      const list = accionesMatrix[rolId] || []
      return list.includes(idAccion)
    },
    [accionesMatrix],
  )

  // Helper para obtener las acciones de una pantalla específica
  const getAccionesDePantalla = useCallback(
    (idPermiso: number): AdminPermisoAccion[] => {
      return allAcciones.filter((a) => Number(a.ID_PERMISO) === Number(idPermiso))
    },
    [allAcciones],
  )

  // Cantidad de permisos asignados a un rol
  const getRolPermisosCount = useCallback(
    (rolId: number): number => {
      return (matrix[rolId] || []).length
    },
    [matrix],
  )

  // Verifica si el rol tiene todas las pantallas del sistema
  const isRolCompleto = useCallback(
    (rolId: number): boolean => {
      if (allPantallasIds.length === 0) return false
      const perms = matrix[rolId] || []
      return allPantallasIds.every((id) => perms.includes(id))
    },
    [matrix, allPantallasIds],
  )

  // Verifica si todas las pantallas de un módulo están asignadas al rol
  const isModuloCompleto = useCallback(
    (rolId: number, modulo: CatalogoModulo): boolean => {
      if (!modulo.PANTALLAS || modulo.PANTALLAS.length === 0) return false
      const perms = matrix[rolId] || []
      return modulo.PANTALLAS.every((p) => perms.includes(Number(p.ID_PERMISO)))
    },
    [matrix],
  )

  // Verifica si un módulo está parcialmente seleccionado
  const isModuloParcial = useCallback(
    (rolId: number, modulo: CatalogoModulo): boolean => {
      if (!modulo.PANTALLAS || modulo.PANTALLAS.length === 0) return false
      const perms = matrix[rolId] || []
      const seleccionadas = modulo.PANTALLAS.filter((p) => perms.includes(Number(p.ID_PERMISO))).length
      return seleccionadas > 0 && seleccionadas < modulo.PANTALLAS.length
    },
    [matrix],
  )

  // Confirmar y alternar pantalla individual en la tabla principal con SweetAlert inmediata
  const handleConfirmarCambioPermiso = useCallback(
    async (
      rolId: number,
      nombreRol: string,
      idPermiso: number | string,
      nombrePermiso: string,
    ) => {
      if (!canCheckboxPermisos) {
        Swal.fire({
          icon: 'error',
          title: 'Acceso Denegado',
          text: 'No tienes permisos para modificar permisos de pantallas.',
          confirmButtonColor: '#dc3545',
          confirmButtonText: 'Entendido',
        })
        return
      }

      const idPermisoNum = Number(idPermiso)
      const currentList = matrix[rolId] || []
      const isCurrentlyChecked = currentList.includes(idPermisoNum)

      if (isCurrentlyChecked && checkIsAdminRol(rolId)) {
        Swal.fire({
          icon: 'warning',
          title: 'Permiso protegido',
          text: `No se pueden revocar permisos al rol de Nivel 1 (${nombreRol}).`,
          confirmButtonColor: '#044c8c',
          confirmButtonText: 'Entendido',
        })
        return
      }

      const result = await Swal.fire({
        title: isCurrentlyChecked ? '¿Revocar permiso?' : '¿Otorgar permiso?',
        text: isCurrentlyChecked
          ? `¿Estás seguro de quitar el permiso "${nombrePermiso}" al rol "${nombreRol}"?`
          : `¿Estás seguro de dar el permiso "${nombrePermiso}" al rol "${nombreRol}"?`,
        icon: isCurrentlyChecked ? 'warning' : 'question',
        showCancelButton: true,
        confirmButtonColor: isCurrentlyChecked ? '#dc3545' : '#044c8c',
        cancelButtonColor: '#6c757d',
        confirmButtonText: isCurrentlyChecked ? 'Sí, quitar' : 'Sí, otorgar',
        cancelButtonText: 'Cancelar',
      })

      if (!result.isConfirmed) {
        return
      }

      const nuevasPantallas: number[] = isCurrentlyChecked
        ? currentList.filter((id) => id !== idPermisoNum)
        : [...currentList, idPermisoNum]

      // Actualizar acciones:
      // Si se otorga la pantalla, añadir sus acciones disponibles por defecto
      // Si se revoca la pantalla, remover sus acciones
      const currentAcciones = accionesMatrix[rolId] || []
      let nuevasAcciones: number[]
      if (isCurrentlyChecked) {
        nuevasAcciones = currentAcciones.filter((accId) => {
          const accObj = allAcciones.find((a) => Number(a.ID_ACCION) === accId)
          return accObj && Number(accObj.ID_PERMISO) !== idPermisoNum
        })
      } else {
        const accionesDeEstaPantalla = allAcciones
          .filter((a) => Number(a.ID_PERMISO) === idPermisoNum)
          .map((a) => Number(a.ID_ACCION))
        nuevasAcciones = Array.from(new Set([...currentAcciones, ...accionesDeEstaPantalla]))
      }

      // Regla estricta backend: Solo enviar IDs de acciones cuyas pantallas estén en nuevasPantallas
      let accionesValidas = nuevasAcciones.filter((accId) => {
        const accObj = allAcciones.find((a) => Number(a.ID_ACCION) === accId)
        return accObj && nuevasPantallas.includes(Number(accObj.ID_PERMISO))
      })

      // Si por quitar la pantalla el rol se queda sin acciones pero le quedan pantallas,
      // asegurar incluir las acciones disponibles de las pantallas restantes para satisfacer 'required|array' de Laravel
      if (accionesValidas.length === 0 && nuevasPantallas.length > 0) {
        accionesValidas = allAcciones
          .filter((a) => nuevasPantallas.includes(Number(a.ID_PERMISO)))
          .map((a) => Number(a.ID_ACCION))
      }

      try {
        await guardarPermisosRol(rolId, {
          PANTALLAS: nuevasPantallas,
          ACCIONES: accionesValidas,
        })
        // Actualizar estados locales
        setMatrix((prev) => ({
          ...prev,
          [rolId]: nuevasPantallas,
        }))
        setAccionesMatrix((prev) => ({
          ...prev,
          [rolId]: accionesValidas,
        }))

        marcarCambioPermisos()

        Swal.fire({
          icon: 'success',
          title: isCurrentlyChecked ? 'Permiso retirado' : 'Permiso asignado',
          text: `Se actualizó el acceso de "${nombrePermiso}" para ${nombreRol}.`,
          timer: 1600,
          showConfirmButton: false,
        })
      } catch (error: any) {
        console.error('[usePermisosMatriz] Error al actualizar permiso:', error)
        const { title, messages } = parseApiErrors(
          error,
          'Ocurrió un error al persistir el cambio en el servidor.',
        )
        showErrorAlert(title, messages)
      }
    },
    [matrix, accionesMatrix, allAcciones, checkIsAdminRol, canCheckboxPermisos],
  )

  // Confirmar y alternar acción/botón individual para un rol con SweetAlert
  const handleConfirmarCambioAccion = useCallback(
    async (
      rolId: number,
      nombreRol: string,
      accion: AdminPermisoAccion,
      pantalla: AdminPermiso,
    ) => {
      if (!canModificarAcciones) {
        Swal.fire({
          icon: 'error',
          title: 'Acceso Denegado',
          text: 'No tienes permisos para modificar acciones de roles.',
          confirmButtonColor: '#dc3545',
          confirmButtonText: 'Entendido',
        })
        return
      }

      const accionIdNum = Number(accion.ID_ACCION)
      const pantallaIdNum = Number(pantalla.ID_PERMISO)
      const currentAcciones = accionesMatrix[rolId] || []
      const isCurrentlyActive = currentAcciones.includes(accionIdNum)

      if (isCurrentlyActive && checkIsAdminRol(rolId)) {
        Swal.fire({
          icon: 'warning',
          title: 'Acción protegida',
          text: `No se pueden deshabilitar acciones para el rol de Nivel 1 (${nombreRol}).`,
          confirmButtonColor: '#044c8c',
          confirmButtonText: 'Entendido',
        })
        return
      }

      const result = await Swal.fire({
        title: isCurrentlyActive ? '¿Deshabilitar botón/acción?' : '¿Habilitar botón/acción?',
        html: isCurrentlyActive
          ? `¿Estás seguro de deshabilitar la acción <b>"${accion.NOMBRE_ACCION}"</b> para el rol <b>"${nombreRol}"</b>?`
          : `¿Estás seguro de habilitar la acción <b>"${accion.NOMBRE_ACCION}"</b> para el rol <b>"${nombreRol}"</b>?`,
        icon: isCurrentlyActive ? 'warning' : 'question',
        showCancelButton: true,
        confirmButtonColor: isCurrentlyActive ? '#dc3545' : '#044c8c',
        cancelButtonColor: '#6c757d',
        confirmButtonText: isCurrentlyActive ? 'Sí, deshabilitar' : 'Sí, habilitar',
        cancelButtonText: 'Cancelar',
      })

      if (!result.isConfirmed) {
        return
      }

      const currentPantallas = matrix[rolId] || []
      const nuevasPantallas = isCurrentlyActive
        ? currentPantallas
        : currentPantallas.includes(pantallaIdNum)
          ? currentPantallas
          : [...currentPantallas, pantallaIdNum]

      let updatedAcciones = isCurrentlyActive
        ? currentAcciones.filter((id) => id !== accionIdNum)
        : Array.from(new Set([...currentAcciones, accionIdNum]))

      // Identificar si la acción actual es "Ver Acciones" o "Modificar Acciones"
      const codigoActual = String(accion.CODIGO_ACCION || '').trim().toLowerCase()

      const esVerAcciones =
        codigoActual === 'btn_ver_acciones'

      const esModificarAcciones =
        codigoActual === 'btn_modificar_acciones'

      let mensajeExtra = ''

      // REGLA 1: Si se DESHABILITA "Ver Acciones", también se DESHABILITA automáticamente "Modificar Acciones"
      if (isCurrentlyActive && esVerAcciones) {
        const accionModObj = allAcciones.find((a) => {
          const c = String(a.CODIGO_ACCION || '').trim().toLowerCase()
          return c === 'btn_modificar_acciones'
        })
        if (accionModObj) {
          const modId = Number(accionModObj.ID_ACCION)
          updatedAcciones = updatedAcciones.filter((id) => id !== modId)
          mensajeExtra = ' (y se deshabilitó automáticamente "Modificar Acciones")'
        }
      }

      // REGLA 2: Si se HABILITA "Modificar Acciones", también se HABILITA automáticamente "Ver Acciones"
      if (!isCurrentlyActive && esModificarAcciones) {
        const accionVerObj = allAcciones.find((a) => {
          const c = String(a.CODIGO_ACCION || '').trim().toLowerCase()
          return c === 'btn_ver_acciones'
        })
        if (accionVerObj) {
          const verId = Number(accionVerObj.ID_ACCION)
          updatedAcciones = Array.from(new Set([...updatedAcciones, verId]))
          mensajeExtra = ' (y se habilitó automáticamente "Ver Acciones")'
        }
      }

      // Regla backend: Solo enviar IDs de acciones cuyas pantallas estén en nuevasPantallas
      const accionesValidas = updatedAcciones.filter((accId) => {
        const accObj = allAcciones.find((a) => Number(a.ID_ACCION) === accId)
        return accObj && nuevasPantallas.includes(Number(accObj.ID_PERMISO))
      })

      try {
        await guardarPermisosRol(rolId, {
          PANTALLAS: nuevasPantallas,
          ACCIONES: accionesValidas,
        })

        // Actualizar estados locales
        setAccionesMatrix((prev) => ({
          ...prev,
          [rolId]: accionesValidas,
        }))
        setMatrix((prev) => ({
          ...prev,
          [rolId]: nuevasPantallas,
        }))

        marcarCambioPermisos()

        Swal.fire({
          icon: 'success',
          title: isCurrentlyActive ? 'Acción deshabilitada' : 'Acción habilitada',
          text: `La acción "${accion.NOMBRE_ACCION}" fue actualizada para ${nombreRol}${mensajeExtra}.`,
          timer: 2000,
          showConfirmButton: false,
        })
      } catch (error: any) {
        console.error('[usePermisosMatriz] Error al actualizar acción:', error)
        const { title, messages } = parseApiErrors(
          error,
          'Ocurrió un error al persistir el cambio en el servidor.',
        )
        showErrorAlert(title, messages)
      }
    },
    [accionesMatrix, matrix, allAcciones, checkIsAdminRol, canModificarAcciones],
  )

  // Refrescar todos los datos desde el backend
  const handleRefrescarTodo = useCallback(async () => {
    try {
      setLoadingMatriz(true)
      await cargarCatalogo()
      if (fetchRoles) {
        await fetchRoles()
      }
    } catch (err) {
      console.error('[usePermisosMatriz] Error al refrescar todo:', err)
      setLoadingMatriz(false)
    }
  }, [fetchRoles, cargarCatalogo])

  return {
    catalogo,
    matrix,
    accionesMatrix,
    allAcciones,
    allPantallas,
    allPantallasIds,
    totalPantallas,
    totalClusters,
    modulosNombres,
    loadingMatriz,
    errorPermisos,
    modifiedRoleIds,
    hasUnsavedChanges: modifiedRoleIds.size > 0,
    checkIsAdminRol,
    isPermisoAsignado,
    isAccionAsignada,
    getAccionesDePantalla,
    isRolCompleto,
    isModuloCompleto,
    isModuloParcial,
    getRolPermisosCount,
    handleConfirmarCambioPermiso,
    handleConfirmarCambioAccion,
    handleRefrescarTodo,
    pantallaSeleccionada,
    setPantallaSeleccionada,
    modalAccionesVisible,
    setModalAccionesVisible,
    handleAbrirAcciones,
    handleCerrarAcciones,
    canVerAcciones,
    canCheckboxPermisos,
    canModificarAcciones,
    canVerAccionesPorRol,
    rolSeleccionado,
    seleccionarRol,
  }
}

export default usePermisosMatriz
