import { useState, useEffect, useMemo, useCallback } from 'react'
import Swal from 'sweetalert2'
import {
  obtenerCatalogo,
  obtenerPermisosRol,
  guardarPermisosRol,
  obtenerAcciones,
} from '@/Service/amd/permisosService'
import { ModuloCatalogo, Pantalla, Accion } from '@/models/adm/permiso.model'
import { notificarCambioPermisos } from '@/context/PermissionsContext'

export const usePermisosMatriz = (rolesList: any[] = [], fetchRoles?: () => Promise<void>) => {
  const [catalogo, setCatalogo] = useState<ModuloCatalogo[]>([])
  const [matrix, setMatrix] = useState<Record<number, number[]>>({})
  const [accionesMatrix, setAccionesMatrix] = useState<Record<number, number[]>>({})
  const [allAcciones, setAllAcciones] = useState<Accion[]>([])
  const [loadingMatriz, setLoadingMatriz] = useState<boolean>(true)
  const [savingMatriz] = useState<boolean>(false)
  const [modifiedRoleIds, setModifiedRoleIds] = useState<Set<number>>(new Set())
  const [errorPermisos, setErrorPermisos] = useState<string | null>(null)

  // Filtros de búsqueda y módulo
  const [filtroModulo, setFiltroModulo] = useState<string>('TODOS')
  const [busqueda, setBusqueda] = useState<string>('')

  // Lista plana de todas las pantallas
  const allPantallas = useMemo<Pantalla[]>(() => {
    return catalogo.flatMap((m) => m.PANTALLAS)
  }, [catalogo])

  // Lista plana de todos los IDs de pantallas
  const allPantallasIds = useMemo<number[]>(() => {
    return allPantallas.map((p) => p.ID_PERMISO)
  }, [allPantallas])

  // Métricas generales
  const totalPantallas = allPantallasIds.length
  const totalClusters = catalogo.length
  const modulosNombres = useMemo<string[]>(() => {
    return catalogo.map((m) => m.MODULO)
  }, [catalogo])

  // Catálogo filtrado según búsqueda y módulo seleccionado
  const catalogoFiltrado = useMemo<ModuloCatalogo[]>(() => {
    const query = busqueda.trim().toLowerCase()

    return catalogo
      .filter((modulo) => {
        if (filtroModulo !== 'TODOS' && modulo.MODULO !== filtroModulo) {
          return false
        }
        return true
      })
      .map((modulo) => {
        if (!query) return modulo
        const pantallasFiltradas = modulo.PANTALLAS.filter((p) => {
          const matchNombre = (p.NOMBRE_PERMISO || '').toLowerCase().includes(query)
          const matchPath = (p.PATH_PERMISO || '').toLowerCase().includes(query)
          const matchCluster = (p.CLUSTER_PERMISO || '').toLowerCase().includes(query)
          return matchNombre || matchPath || matchCluster
        })
        return {
          ...modulo,
          PANTALLAS: pantallasFiltradas,
        }
      })
      .filter((modulo) => modulo.PANTALLAS.length > 0)
  }, [catalogo, filtroModulo, busqueda])

  // Cantidad de pantallas visibles tras aplicar filtros
  const totalPantallasVisibles = useMemo<number>(() => {
    return catalogoFiltrado.flatMap((m) => m.PANTALLAS).length
  }, [catalogoFiltrado])

  // Cargar catálogo de pantallas y módulos desde la base de datos
  const cargarCatalogo = useCallback(async () => {
    try {
      const [resCat, resAcc] = await Promise.all([
        obtenerCatalogo(),
        obtenerAcciones().catch(() => ({ data: [] })),
      ])

      if (resCat && (resCat as any).success === false) {
        setErrorPermisos((resCat as any).message || 'Solo el administrador principal puede gestionar roles y permisos.')
        setLoadingMatriz(false)
        return
      }

      const catalogoData = Array.isArray(resCat)
        ? resCat
        : Array.isArray(resCat?.data)
        ? resCat.data
        : []

      if (catalogoData.length > 0) {
        // Ordenar módulos y pantallas tal como en la base de datos (Dashboard primero, seguido por sus IDs)
        const ordenado = [...catalogoData]
          .map((modulo: ModuloCatalogo) => ({
            ...modulo,
            PANTALLAS: [...modulo.PANTALLAS].sort(
              (a, b) => Number(a.ID_PERMISO) - Number(b.ID_PERMISO),
            ),
          }))
          .sort((a: ModuloCatalogo, b: ModuloCatalogo) => {
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

        setCatalogo(ordenado)
      }

      const accionesData = Array.isArray(resAcc)
        ? resAcc
        : Array.isArray(resAcc?.data)
        ? resAcc.data
        : []
      setAllAcciones(accionesData)
    } catch (err: any) {
      console.error('[usePermisosMatriz] Error al cargar catálogo de permisos:', err)
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Solo el administrador principal puede gestionar roles y permisos.'
      setErrorPermisos(msg)
      setLoadingMatriz(false)
    }
  }, [])

  // Cargar permisos y acciones asignados a cada rol desde la base de datos
  const cargarPermisosRoles = useCallback(async (roles: any[]) => {
    if (!roles || roles.length === 0) return
    setLoadingMatriz(true)
    try {
      const newMatrix: Record<number, number[]> = {}
      const newAccionesMatrix: Record<number, number[]> = {}

      await Promise.all(
        roles.map(async (rol: any) => {
          const rolId = Number(rol.ID_ROL ?? rol.id)
          try {
            const res = await obtenerPermisosRol(rolId)
            if (res?.data) {
              const rawPantallas = res.data.PANTALLAS || []
              const pantallasIds = rawPantallas.map((p: any) =>
                typeof p === 'object' && p !== null ? Number(p.ID_PERMISO ?? p.id) : Number(p),
              )
              newMatrix[rolId] = pantallasIds

              const rawAcciones = res.data.ACCIONES || []
              const accionesIds = rawAcciones.map((a: any) =>
                typeof a === 'object' && a !== null ? Number(a.ID_ACCION ?? a.id) : Number(a),
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
    } catch (err) {
      console.error('[usePermisosMatriz] Error al cargar permisos de roles:', err)
    } finally {
      setLoadingMatriz(false)
    }
  }, [])

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

  // Helper para verificar si un rol es el super administrador principal
  // REGLA BACKEND: Solo el ID 1 o ES_ADMINISTRADOR === true es el super admin intocable.
  // Cualquier otro rol creado (incluso con NIVEL_ROL = 1) tiene ES_ADMINISTRADOR === false y es 100% configurable.
  const checkIsAdminRol = useCallback(
    (rolId: number): boolean => {
      if (rolId === 1) return true
      const found = rolesList.find((r: any) => Number(r.ID_ROL ?? r.id) === Number(rolId))
      return Boolean(found?.ES_ADMINISTRADOR)
    },
    [rolesList],
  )

  // Helper para verificar si una pantalla está asignada a un rol
  const isPermisoAsignado = useCallback(
    (rolId: number, idPermiso: number): boolean => {
      if (checkIsAdminRol(rolId)) {
        return true
      }
      const perms = matrix[rolId] || []
      return perms.includes(idPermiso)
    },
    [matrix, checkIsAdminRol],
  )

  // Helper para verificar si una acción está asignada a un rol
  const isAccionAsignada = useCallback(
    (rolId: number, idAccion: number): boolean => {
      if (checkIsAdminRol(rolId)) {
        return true
      }
      const list = accionesMatrix[rolId] || []
      return list.includes(idAccion)
    },
    [accionesMatrix, checkIsAdminRol],
  )

  // Helper para obtener las acciones de una pantalla específica
  const getAccionesDePantalla = useCallback(
    (idPermiso: number): Accion[] => {
      return allAcciones.filter((a: any) => Number(a.ID_PERMISO) === Number(idPermiso))
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
    (rolId: number, modulo: ModuloCatalogo): boolean => {
      if (!modulo.PANTALLAS || modulo.PANTALLAS.length === 0) return false
      const perms = matrix[rolId] || []
      return modulo.PANTALLAS.every((p) => perms.includes(p.ID_PERMISO))
    },
    [matrix],
  )

  // Verifica si un módulo está parcialmente seleccionado
  const isModuloParcial = useCallback(
    (rolId: number, modulo: ModuloCatalogo): boolean => {
      if (!modulo.PANTALLAS || modulo.PANTALLAS.length === 0) return false
      const perms = matrix[rolId] || []
      const seleccionadas = modulo.PANTALLAS.filter((p) => perms.includes(p.ID_PERMISO)).length
      return seleccionadas > 0 && seleccionadas < modulo.PANTALLAS.length
    },
    [matrix],
  )

  // Confirmar y alternar pantalla individual en la tabla principal con SweetAlert inmediata
  const handleConfirmarCambioPermiso = useCallback(
    async (
      rolId: number,
      nombreRol: string,
      idPermiso: number,
      nombrePermiso: string,
    ) => {
      if (checkIsAdminRol(rolId)) {
        Swal.fire({
          title: 'Acceso Completo',
          text: 'El administrador principal tiene acceso completo.',
          icon: 'info',
          confirmButtonColor: '#321fdb',
        })
        return
      }

      const currentList = matrix[rolId] || []
      const isCurrentlyChecked = currentList.includes(idPermiso)

      const result = await Swal.fire({
        title: isCurrentlyChecked ? '¿Revocar permiso?' : '¿Otorgar permiso?',
        text: isCurrentlyChecked
          ? `¿Estás seguro de quitar el permiso "${nombrePermiso}" al rol "${nombreRol}"?`
          : `¿Estás seguro de dar el permiso "${nombrePermiso}" al rol "${nombreRol}"?`,
        icon: isCurrentlyChecked ? 'warning' : 'question',
        showCancelButton: true,
        confirmButtonColor: isCurrentlyChecked ? '#e55353' : '#321fdb',
        cancelButtonColor: '#6c757d',
        confirmButtonText: isCurrentlyChecked ? 'Sí, quitar' : 'Sí, otorgar',
        cancelButtonText: 'Cancelar',
      })

      if (!result.isConfirmed) {
        return
      }

      const nuevasPantallas = isCurrentlyChecked
        ? currentList.filter((id) => id !== idPermiso)
        : [...currentList, idPermiso]

      if (nuevasPantallas.length === 0) {
        Swal.fire({
          title: 'Acción no permitida',
          text: `El rol "${nombreRol}" debe tener al menos una pantalla asignada en el sistema. No es posible revocar todas las pantallas a la vez. Si deseas cambiarla, primero activa otra antes de quitar esta.`,
          icon: 'warning',
          confirmButtonColor: '#321fdb',
        })
        return
      }

      // Actualizar acciones:
      // Si se otorga la pantalla, añadir sus acciones disponibles por defecto
      // Si se revoca la pantalla, remover sus acciones
      const currentAcciones = accionesMatrix[rolId] || []
      let nuevasAcciones: number[]
      if (isCurrentlyChecked) {
        nuevasAcciones = currentAcciones.filter((accId) => {
          const accObj = allAcciones.find((a: any) => Number(a.ID_ACCION ?? a.id) === accId)
          return accObj && Number(accObj.ID_PERMISO) !== idPermiso
        })
      } else {
        const accionesDeEstaPantalla = allAcciones
          .filter((a: any) => Number(a.ID_PERMISO) === idPermiso)
          .map((a: any) => Number(a.ID_ACCION ?? a.id))
        nuevasAcciones = Array.from(new Set([...currentAcciones, ...accionesDeEstaPantalla]))
      }

      // Regla estricta backend: Solo enviar IDs de acciones cuyas pantallas estén en nuevasPantallas
      let accionesValidas = nuevasAcciones.filter((accId) => {
        const accObj = allAcciones.find((a: any) => Number(a.ID_ACCION ?? a.id) === accId)
        return accObj && nuevasPantallas.includes(Number(accObj.ID_PERMISO))
      })

      // Si por quitar la pantalla el rol se queda sin acciones pero le quedan pantallas,
      // asegurar incluir las acciones disponibles de las pantallas restantes para satisfacer 'required|array' de Laravel
      if (accionesValidas.length === 0 && nuevasPantallas.length > 0) {
        accionesValidas = allAcciones
          .filter((a: any) => nuevasPantallas.includes(Number(a.ID_PERMISO)))
          .map((a: any) => Number(a.ID_ACCION ?? a.id))
      }

      try {
        await guardarPermisosRol(rolId, {
          PANTALLAS: nuevasPantallas,
          ACCIONES: accionesValidas,
        })

        // Sincronizar en tiempo real para que menú y permisos se actualicen de inmediato sin F5
        notificarCambioPermisos()

        // Actualizar estados locales
        setMatrix((prev) => ({
          ...prev,
          [rolId]: nuevasPantallas,
        }))
        setAccionesMatrix((prev) => ({
          ...prev,
          [rolId]: accionesValidas,
        }))

        Swal.fire({
          icon: 'success',
          title: isCurrentlyChecked ? 'Permiso retirado' : 'Permiso asignado',
          text: `Se actualizó el acceso de "${nombrePermiso}" para ${nombreRol}.`,
          timer: 1600,
          showConfirmButton: false,
        })
      } catch (error: any) {
        console.error('[usePermisosMatriz] Error al actualizar permiso:', error)
        const data = error?.response?.data
        let msg =
          data?.message ||
          data?.error ||
          'Ocurrió un error al persistir el cambio en el servidor.'
        if (data?.errors && typeof data.errors === 'object') {
          const detalles = Object.entries(data.errors)
            .map(([campo, errores]: [string, any]) => {
              const txt = Array.isArray(errores) ? errores.join(', ') : String(errores)
              return `• ${campo}: ${txt}`
            })
            .join('\n')
          msg = `${msg}\n\n${detalles}`
        }
        Swal.fire({
          title: 'Error al Guardar',
          text: msg,
          icon: 'error',
          confirmButtonColor: '#e55353',
        })
      }
    },
    [matrix, accionesMatrix, allAcciones, checkIsAdminRol],
  )

  // Confirmar y alternar acción/botón individual para un rol con SweetAlert
  const handleConfirmarCambioAccion = useCallback(
    async (
      rolId: number,
      nombreRol: string,
      accion: Accion,
      pantalla: Pantalla,
    ) => {
      if (checkIsAdminRol(rolId)) {
        Swal.fire({
          title: 'Acceso Completo',
          text: 'El administrador principal tiene acceso completo.',
          icon: 'info',
          confirmButtonColor: '#321fdb',
        })
        return
      }

      const accionIdNum = Number(accion.ID_ACCION ?? (accion as any).id)
      const pantallaIdNum = Number(pantalla.ID_PERMISO)
      const currentAcciones = accionesMatrix[rolId] || []
      const isCurrentlyActive = currentAcciones.includes(accionIdNum)

      const result = await Swal.fire({
        title: isCurrentlyActive ? '¿Deshabilitar botón/acción?' : '¿Habilitar botón/acción?',
        html: isCurrentlyActive
          ? `¿Estás seguro de deshabilitar la acción <b>"${accion.NOMBRE_ACCION}"</b> para el rol <b>"${nombreRol}"</b>?`
          : `¿Estás seguro de habilitar la acción <b>"${accion.NOMBRE_ACCION}"</b> para el rol <b>"${nombreRol}"</b>?`,
        icon: isCurrentlyActive ? 'warning' : 'question',
        showCancelButton: true,
        confirmButtonColor: isCurrentlyActive ? '#e55353' : '#321fdb',
        cancelButtonColor: '#6c757d',
        confirmButtonText: isCurrentlyActive ? 'Sí, deshabilitar' : 'Sí, habilitar',
        cancelButtonText: 'Cancelar',
      })

      if (!result.isConfirmed) {
        return
      }

      // Si se activa una acción, la pantalla DEBE estar en PANTALLAS (regla backend)
      const currentPantallas = matrix[rolId] || []
      const nuevasPantallas = isCurrentlyActive
        ? currentPantallas
        : currentPantallas.includes(pantallaIdNum)
        ? currentPantallas
        : [...currentPantallas, pantallaIdNum]

      const updatedAcciones = isCurrentlyActive
        ? currentAcciones.filter((id) => id !== accionIdNum)
        : Array.from(new Set([...currentAcciones, accionIdNum]))

      // Regla backend: Solo enviar IDs de acciones cuyas pantallas estén en nuevasPantallas
      const accionesValidas = updatedAcciones.filter((accId) => {
        const accObj = allAcciones.find((a: any) => Number(a.ID_ACCION ?? a.id) === accId)
        return accObj && nuevasPantallas.includes(Number(accObj.ID_PERMISO))
      })

      try {
        await guardarPermisosRol(rolId, {
          PANTALLAS: nuevasPantallas,
          ACCIONES: accionesValidas,
        })

        // Sincronizar en tiempo real para que menú y permisos se actualicen de inmediato sin F5
        notificarCambioPermisos()

        // Actualizar estados locales
        setAccionesMatrix((prev) => ({
          ...prev,
          [rolId]: accionesValidas,
        }))
        setMatrix((prev) => ({
          ...prev,
          [rolId]: nuevasPantallas,
        }))

        Swal.fire({
          icon: 'success',
          title: isCurrentlyActive ? 'Acción deshabilitada' : 'Acción habilitada',
          text: `La acción "${accion.NOMBRE_ACCION}" fue actualizada para ${nombreRol}.`,
          timer: 1600,
          showConfirmButton: false,
        })
      } catch (error: any) {
        console.error('[usePermisosMatriz] Error al actualizar acción:', error)
        const data = error?.response?.data
        let msg =
          data?.message ||
          data?.error ||
          'Ocurrió un error al persistir el cambio en el servidor.'
        if (data?.errors && typeof data.errors === 'object') {
          const detalles = Object.entries(data.errors)
            .map(([campo, errores]: [string, any]) => {
              const txt = Array.isArray(errores) ? errores.join(', ') : String(errores)
              return `• ${campo}: ${txt}`
            })
            .join('\n')
          msg = `${msg}\n\n${detalles}`
        }
        Swal.fire({
          title: 'Error al Guardar',
          text: msg,
          icon: 'error',
          confirmButtonColor: '#e55353',
        })
      }
    },
    [accionesMatrix, matrix, allAcciones, checkIsAdminRol],
  )

  // Habilitar o deshabilitar en bloque todas las acciones de una pantalla para un rol
  const handleConfirmarToggleTodasAcciones = useCallback(
    async (
      rolId: number,
      nombreRol: string,
      pantalla: Pantalla,
      habilitarTodas: boolean,
    ) => {
      if (checkIsAdminRol(rolId)) {
        Swal.fire({
          title: 'Acceso Completo',
          text: 'El administrador principal tiene acceso completo.',
          icon: 'info',
          confirmButtonColor: '#321fdb',
        })
        return
      }

      const pantallaIdNum = Number(pantalla.ID_PERMISO)
      const accionesDeEstaPantalla = allAcciones
        .filter((a: any) => Number(a.ID_PERMISO) === pantallaIdNum)
        .map((a: any) => Number(a.ID_ACCION ?? a.id))

      if (accionesDeEstaPantalla.length === 0) return

      const result = await Swal.fire({
        title: habilitarTodas
          ? '¿Habilitar todas las acciones?'
          : '¿Deshabilitar todas las acciones?',
        html: habilitarTodas
          ? `¿Estás seguro de habilitar todos los botones de <b>"${pantalla.NOMBRE_PERMISO}"</b> para el rol <b>"${nombreRol}"</b>?`
          : `¿Estás seguro de quitar todos los botones de <b>"${pantalla.NOMBRE_PERMISO}"</b> al rol <b>"${nombreRol}"</b>?`,
        icon: habilitarTodas ? 'question' : 'warning',
        showCancelButton: true,
        confirmButtonColor: habilitarTodas ? '#321fdb' : '#e55353',
        cancelButtonColor: '#6c757d',
        confirmButtonText: habilitarTodas ? 'Sí, habilitar todas' : 'Sí, deshabilitar todas',
        cancelButtonText: 'Cancelar',
      })

      if (!result.isConfirmed) return

      const currentPantallas = matrix[rolId] || []
      const nuevasPantallas = habilitarTodas
        ? currentPantallas.includes(pantallaIdNum)
          ? currentPantallas
          : [...currentPantallas, pantallaIdNum]
        : currentPantallas

      const currentAcciones = accionesMatrix[rolId] || []
      let updatedAcciones: number[]
      if (habilitarTodas) {
        updatedAcciones = Array.from(new Set([...currentAcciones, ...accionesDeEstaPantalla]))
      } else {
        updatedAcciones = currentAcciones.filter((id) => !accionesDeEstaPantalla.includes(id))
      }

      const accionesValidas = updatedAcciones.filter((accId) => {
        const accObj = allAcciones.find((a: any) => Number(a.ID_ACCION ?? a.id) === accId)
        return accObj && nuevasPantallas.includes(Number(accObj.ID_PERMISO))
      })

      try {
        await guardarPermisosRol(rolId, {
          PANTALLAS: nuevasPantallas,
          ACCIONES: accionesValidas,
        })

        // Sincronizar en tiempo real para que menú y permisos se actualicen de inmediato sin F5
        notificarCambioPermisos()

        setAccionesMatrix((prev) => ({
          ...prev,
          [rolId]: accionesValidas,
        }))
        setMatrix((prev) => ({
          ...prev,
          [rolId]: nuevasPantallas,
        }))

        Swal.fire({
          icon: 'success',
          title: habilitarTodas ? 'Acciones habilitadas' : 'Acciones deshabilitadas',
          text: `Se actualizaron las acciones de "${pantalla.NOMBRE_PERMISO}" para ${nombreRol}.`,
          timer: 1600,
          showConfirmButton: false,
        })
      } catch (error: any) {
        console.error('[usePermisosMatriz] Error al actualizar todas las acciones:', error)
        Swal.fire({
          title: 'Error al Guardar',
          text: error?.response?.data?.message || 'Error en el servidor',
          icon: 'error',
          confirmButtonColor: '#e55353',
        })
      }
    },
    [accionesMatrix, matrix, allAcciones, checkIsAdminRol],
  )

  // Refrescar todos los datos desde el backend
  const handleRefrescarTodo = useCallback(async () => {
    if (fetchRoles) {
      await fetchRoles()
    }
    await cargarCatalogo()
    if (rolesList && rolesList.length > 0) {
      await cargarPermisosRoles(rolesList)
    }
  }, [fetchRoles, cargarCatalogo, cargarPermisosRoles, rolesList])

  return {
    catalogo,
    catalogoFiltrado,
    matrix,
    accionesMatrix,
    allAcciones,
    allPantallas,
    allPantallasIds,
    totalPantallas,
    totalClusters,
    totalPantallasVisibles,
    modulosNombres,
    loadingMatriz,
    errorPermisos,
    savingMatriz,
    modifiedRoleIds,
    hasUnsavedChanges: modifiedRoleIds.size > 0,
    filtroModulo,
    setFiltroModulo,
    busqueda,
    setBusqueda,
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
    handleConfirmarToggleTodasAcciones,
    handleRefrescarTodo,
  }
}

export default usePermisosMatriz
