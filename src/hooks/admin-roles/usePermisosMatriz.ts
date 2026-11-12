import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import Swal from 'sweetalert2'
import {
  obtenerCatalogo,
  obtenerPermisosRol,
  guardarPermisosRol,
  obtenerAcciones,
} from '@/Service/adm/Permisos'
import { ModuloCatalogo, Pantalla, Accion } from '@/models/adm/permiso.model'
import { usePermissions, marcarCambioPermisos } from '@/context/PermissionsContext'

export const usePermisosMatriz = (rolesList: any[] = [], fetchRoles?: () => Promise<void>) => {
  const { canDoAction, verificarAccionEnServidor } = usePermissions()

  const canVerAcciones = canDoAction('btn_ver_acciones')
  const canCheckboxPermisos = canDoAction('btn_checkbox_permisos')
  const canModificarAcciones = canVerAcciones && canDoAction('btn_modificar_acciones')

  const [catalogo, setCatalogo] = useState<ModuloCatalogo[]>([])
  const [matrix, setMatrix] = useState<Record<number, number[]>>({})
  const [accionesMatrix, setAccionesMatrix] = useState<Record<number, number[]>>({})
  const [allAcciones, setAllAcciones] = useState<Accion[]>([])
  const [loadingMatriz, setLoadingMatriz] = useState<boolean>(true)
  const [savingMatriz] = useState<boolean>(false)
  const [modifiedRoleIds, setModifiedRoleIds] = useState<Set<number>>(new Set())
  const [errorPermisos, setErrorPermisos] = useState<string | null>(null)
  const isFetchingPermisosRef = useRef<boolean>(false)

  // Filtros de búsqueda y módulo
  const [filtroModulo, setFiltroModulo] = useState<string>('TODOS')
  const [busqueda, setBusqueda] = useState<string>('')

  // Estado para el modal de acciones/botones de una pantalla
  const [pantallaSeleccionada, setPantallaSeleccionada] = useState<Pantalla | null>(null)
  const [modalAccionesVisible, setModalAccionesVisible] = useState<boolean>(false)

  const handleAbrirAcciones = useCallback((pantalla: Pantalla) => {
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
        err?.response?.data?.error
      setErrorPermisos(msg)
      setLoadingMatriz(false)
    }
  }, [])

  // Cargar permisos y acciones asignados a cada rol desde la base de datos
  const cargarPermisosRoles = useCallback(async (roles: any[]) => {
    if (!roles || roles.length === 0) return
    if (isFetchingPermisosRef.current) return
    isFetchingPermisosRef.current = true
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
      isFetchingPermisosRef.current = false
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
      const perms = matrix[rolId] || []
      return perms.includes(idPermiso)
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

      const currentList = matrix[rolId] || []
      const isCurrentlyChecked = currentList.includes(idPermiso)

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

      const tienePermiso = await verificarAccionEnServidor('btn_checkbox_permisos')
      if (!tienePermiso) {
        Swal.fire({
          icon: 'error',
          title: 'Acceso Denegado',
          text: 'No tienes permisos para modificar permisos de pantallas.',
          confirmButtonColor: '#dc3545',
          confirmButtonText: 'Entendido',
        })
        return
      }

      const nuevasPantallas = isCurrentlyChecked
        ? currentList.filter((id) => id !== idPermiso)
        : [...currentList, idPermiso]

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
          icon: 'error',
          title: 'Error al Guardar',
          text: msg,
          confirmButtonColor: '#dc3545',
          confirmButtonText: 'Entendido',
        })
      }
    },
    [matrix, accionesMatrix, allAcciones, checkIsAdminRol, canCheckboxPermisos, verificarAccionEnServidor],
  )

  // Confirmar y alternar acción/botón individual para un rol con SweetAlert
  const handleConfirmarCambioAccion = useCallback(
    async (
      rolId: number,
      nombreRol: string,
      accion: Accion,
      pantalla: Pantalla,
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
        confirmButtonColor: isCurrentlyActive ? '#dc3545' : '#044c8c',
        cancelButtonColor: '#6c757d',
        confirmButtonText: isCurrentlyActive ? 'Sí, deshabilitar' : 'Sí, habilitar',
        cancelButtonText: 'Cancelar',
      })

      if (!result.isConfirmed) {
        return
      }

      const tienePermiso = await verificarAccionEnServidor('btn_modificar_acciones')
      if (!tienePermiso) {
        Swal.fire({
          icon: 'error',
          title: 'Acceso Denegado',
          text: 'No tienes permisos para modificar acciones de roles.',
          confirmButtonColor: '#dc3545',
          confirmButtonText: 'Entendido',
        })
        return
      }

      // Si se activa una acción, la pantalla DEBE estar en PANTALLAS (regla backend)
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
      const nombreActual = String(accion.NOMBRE_ACCION || '').trim().toLowerCase()

      const esVerAcciones =
        codigoActual === 'btn_ver_acciones' ||
        nombreActual === 'ver acciones' ||
        nombreActual.includes('ver accion')

      const esModificarAcciones =
        codigoActual === 'btn_modificar_acciones' ||
        nombreActual === 'modificar acciones' ||
        nombreActual.includes('modificar accion')

      let mensajeExtra = ''

      // REGLA 1: Si se DESHABILITA "Ver Acciones", también se DESHABILITA automáticamente "Modificar Acciones"
      if (isCurrentlyActive && esVerAcciones) {
        const accionModObj = allAcciones.find((a: any) => {
          const c = String(a.CODIGO_ACCION || '').trim().toLowerCase()
          const n = String(a.NOMBRE_ACCION || '').trim().toLowerCase()
          return (
            c === 'btn_modificar_acciones' ||
            n === 'modificar acciones' ||
            n.includes('modificar accion')
          )
        })
        if (accionModObj) {
          const modId = Number(accionModObj.ID_ACCION ?? (accionModObj as any).id)
          updatedAcciones = updatedAcciones.filter((id) => id !== modId)
          mensajeExtra = ' (y se deshabilitó automáticamente "Modificar Acciones")'
        }
      }

      // REGLA 2: Si se HABILITA "Modificar Acciones", también se HABILITA automáticamente "Ver Acciones"
      if (!isCurrentlyActive && esModificarAcciones) {
        const accionVerObj = allAcciones.find((a: any) => {
          const c = String(a.CODIGO_ACCION || '').trim().toLowerCase()
          const n = String(a.NOMBRE_ACCION || '').trim().toLowerCase()
          return (
            c === 'btn_ver_acciones' ||
            n === 'ver acciones' ||
            n.includes('ver accion')
          )
        })
        if (accionVerObj) {
          const verId = Number(accionVerObj.ID_ACCION ?? (accionVerObj as any).id)
          updatedAcciones = Array.from(new Set([...updatedAcciones, verId]))
          mensajeExtra = ' (y se habilitó automáticamente "Ver Acciones")'
        }
      }

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
          icon: 'error',
          title: 'Error al Guardar',
          text: msg,
          confirmButtonColor: '#dc3545',
          confirmButtonText: 'Entendido',
        })
      }
    },
    [accionesMatrix, matrix, allAcciones, checkIsAdminRol, canModificarAcciones, verificarAccionEnServidor],
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
  }
}

export default usePermisosMatriz
