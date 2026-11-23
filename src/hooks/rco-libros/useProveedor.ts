import { useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Swal from 'sweetalert2'
import { Proveedor } from '@/models/rco/proveedor.model'
import { ActualizarProvLib, EliminarProvLib, ListarProveedorLib, NuevoProvLib } from '@/Service/rco/ProveedorLib'
import { usePermissions } from '@/hooks/auth/usePermissions'
import { RootState, AppDispatch } from '@/store'
import {
  setProveedores,
  setProveedorSeleccionado,
  addProveedor,
  updateProveedor,
  removeProveedor,
} from '@/slices/detallesLibroSlice'

export type ProveedorItem = Proveedor

export interface UseProveedorProps {
  autoFetch?: boolean
  visible?: boolean
  setVisible?: (visible?: boolean) => void
  onProveedorCreado?: (proveedorNuevo: Proveedor) => void
  onProveedorActualizado?: (proveedorActualizado: Proveedor) => void
  onProveedorEliminado?: (id: number | string) => void
}

export const useProveedor = ({
  autoFetch = true,
  visible: visibleProp,
  setVisible: setVisibleProp,
  onProveedorCreado,
  onProveedorActualizado,
  onProveedorEliminado,
}: UseProveedorProps = {}) => {
  const dispatch = useDispatch<AppDispatch>()
  const { proveedores: listaProveedores, proveedorSeleccionado } = useSelector(
    (state: RootState) => state.detallesLibro,
  )

  const proveedorSeleccionadoRef = useRef(proveedorSeleccionado)
  useEffect(() => {
    proveedorSeleccionadoRef.current = proveedorSeleccionado
  }, [proveedorSeleccionado])

  const { canDoAction, verificarAccionEnServidor } = usePermissions()

  const canCrearProveedor = canDoAction('btn_crear_proveedor')
  const canGuardarProveedor = canDoAction('btn_guardar_proveedor')
  const canEditarProveedor = canDoAction('btn_editar_proveedor')
  const canActualizarProveedor = canDoAction('btn_actualizar_proveedor')
  const canEliminarProveedor = canDoAction('btn_eliminar_proveedor')
  const canVerInfoProveedor = canDoAction('btn_ver_info_proveedor')

  const [internalVisible, setInternalVisible] = useState(false)
  const isControlled = typeof visibleProp === 'boolean'
  const isVisible = isControlled ? visibleProp : internalVisible

  const [loadingProveedor, setLoadingProveedor] = useState(false)
  const [busquedaProveedor, setBusquedaProveedor] = useState('')
  const [proveedorEnEdicion, setProveedorEnEdicion] = useState<Proveedor | null>(null)
  const [nombreProveedor, setNombreProveedor] = useState('')
  const [guardando, setGuardando] = useState(false)

  // Paginación 100% de servidor
  const [paginaActual, setPaginaActual] = useState(1)
  const [totalPaginas, setTotalPaginas] = useState(1)
  const [totalProveedores, setTotalProveedores] = useState(0)

  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null)
  const isFirstRender = useRef(true)

  const handleSetProveedorSeleccionado = useCallback(
    (prov: Proveedor | null | ((prev: Proveedor | null) => Proveedor | null)) => {
      if (typeof prov === 'function') {
        dispatch(setProveedorSeleccionado(prov(proveedorSeleccionadoRef.current)))
      } else {
        dispatch(setProveedorSeleccionado(prov))
      }
    },
    [dispatch],
  )

  const handleSetListaProveedores = useCallback(
    (list: Proveedor[] | ((prev: Proveedor[]) => Proveedor[])) => {
      if (typeof list === 'function') {
        dispatch(setProveedores(list(listaProveedores)))
      } else {
        dispatch(setProveedores(list))
      }
    },
    [dispatch, listaProveedores],
  )

  const fetchProveedores = useCallback(
    async (page: number = 1, searchQuery: string = '', preserveSelection: boolean = true) => {
      setLoadingProveedor(true)
      try {
        const q = searchQuery.trim()
        const response = await ListarProveedorLib({ page, search: q, per_page: 10 })
        let rawList: any[] = []
        let total = 0
        let lastPage = 1

        if (response && response.data) {
          rawList = Array.isArray(response.data) ? response.data : []
          total = Number(response.total ?? rawList.length)
          lastPage = Number(response.last_page ?? 1)
        } else if (Array.isArray(response)) {
          rawList = response
          total = response.length
          lastPage = 1
        } else if (Array.isArray(response?.proveedor)) {
          rawList = response.proveedor
          total = rawList.length
          lastPage = 1
        }

        // Mapeo canónico exacto de BD (sin parches ni alias)
        const parsedList: Proveedor[] = rawList.map((item: any) => ({
          id: item.ID_PROVEEDOR,
          ID_PROVEEDOR: item.ID_PROVEEDOR,
          NOMBRE_PROVEEDOR: String(item.NOMBRE_PROVEEDOR ?? '').trim(),
          FECHAINGRESO_PROVEEDOR: item.FECHAINGRESO_PROVEEDOR ?? null,
        }))

        dispatch(setProveedores(parsedList))
        setTotalProveedores(total)
        setTotalPaginas(Math.max(1, lastPage))
        setPaginaActual(page)

        if (preserveSelection && proveedorSeleccionadoRef.current) {
          const prevId = String(
            proveedorSeleccionadoRef.current.ID_PROVEEDOR ??
            proveedorSeleccionadoRef.current.id,
          )
          const matched = parsedList.find(
            (c) => String(c.ID_PROVEEDOR ?? c.id) === prevId,
          )
          dispatch(setProveedorSeleccionado(matched || null))
        } else if (!preserveSelection) {
          dispatch(setProveedorSeleccionado(null))
        }
      } catch (error: any) {
        console.error('Error al cargar proveedores desde la API:', error)
      } finally {
        setLoadingProveedor(false)
      }
    },
    [dispatch],
  )

  // Carga inicial
  useEffect(() => {
    if (autoFetch) {
      fetchProveedores(1, '')
    }
  }, [autoFetch, fetchProveedores])

  // Búsqueda con debounce en servidor
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current)
    }
    searchDebounceRef.current = setTimeout(() => {
      fetchProveedores(1, busquedaProveedor, true)
    }, 400)

    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current)
      }
    }
  }, [busquedaProveedor, fetchProveedores])

  const handlePageChange = useCallback(
    (page: number) => {
      if (page >= 1 && page <= totalPaginas && page !== paginaActual) {
        fetchProveedores(page, busquedaProveedor, true)
      }
    },
    [fetchProveedores, busquedaProveedor, totalPaginas, paginaActual],
  )

  const handleRecargar = useCallback(async () => {
    setBusquedaProveedor('')
    dispatch(setProveedorSeleccionado(null))
    await fetchProveedores(1, '', false)
  }, [fetchProveedores, dispatch])

  const handleOpen = useCallback(
    (proveedor?: Proveedor) => {
      if (proveedor) {
        if (!canEditarProveedor) {
          Swal.fire({
            icon: 'error',
            title: 'Acceso Denegado',
            text: 'No tienes permisos para editar proveedores.',
            confirmButtonColor: '#dc3545',
            confirmButtonText: 'Entendido',
          })
          return
        }
        setProveedorEnEdicion(proveedor)
        setNombreProveedor(proveedor.NOMBRE_PROVEEDOR || '')
      } else {
        if (!canCrearProveedor) {
          Swal.fire({
            icon: 'error',
            title: 'Acceso Denegado',
            text: 'No tienes permisos para crear proveedores.',
            confirmButtonColor: '#dc3545',
            confirmButtonText: 'Entendido',
          })
          return
        }
        setProveedorEnEdicion(null)
        setNombreProveedor('')
      }

      if (setVisibleProp) {
        setVisibleProp(true)
      } else {
        setInternalVisible(true)
      }
    },
    [canCrearProveedor, canEditarProveedor, setVisibleProp],
  )

  const handleClose = useCallback(() => {
    if (setVisibleProp) {
      setVisibleProp(false)
    } else {
      setInternalVisible(false)
    }
    setProveedorEnEdicion(null)
    setNombreProveedor('')
  }, [setVisibleProp])

  const handleGuardarProveedor = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault()

      if (!nombreProveedor.trim()) {
        Swal.fire({
          icon: 'warning',
          title: 'Campo requerido',
          text: 'Por favor ingrese el nombre del proveedor.',
          confirmButtonColor: '#dc3545',
          confirmButtonText: 'Entendido',
        })
        return
      }

      if (proveedorEnEdicion) {
        if (!canActualizarProveedor) {
          Swal.fire({
            icon: 'error',
            title: 'Acceso Denegado',
            text: 'No tienes permisos para actualizar el proveedor.',
            confirmButtonColor: '#dc3545',
            confirmButtonText: 'Entendido',
          })
          return
        }
        const tienePermiso = await verificarAccionEnServidor('btn_actualizar_proveedor')
        if (!tienePermiso) {
          Swal.fire({
            icon: 'error',
            title: 'Acceso Denegado',
            text: 'No tienes permisos para actualizar el proveedor.',
            confirmButtonColor: '#dc3545',
            confirmButtonText: 'Entendido',
          })
          return
        }
      } else {
        if (!canGuardarProveedor) {
          Swal.fire({
            icon: 'error',
            title: 'Acceso Denegado',
            text: 'No tienes permisos para guardar nuevos proveedores.',
            confirmButtonColor: '#dc3545',
            confirmButtonText: 'Entendido',
          })
          return
        }
        const tienePermiso = await verificarAccionEnServidor('btn_guardar_proveedor')
        if (!tienePermiso) {
          Swal.fire({
            icon: 'error',
            title: 'Acceso Denegado',
            text: 'No tienes permisos para guardar nuevos proveedores.',
            confirmButtonColor: '#dc3545',
            confirmButtonText: 'Entendido',
          })
          return
        }
      }

      setGuardando(true)
      try {
        const payload = {
          NOMBRE_PROVEEDOR: nombreProveedor.trim(),
        }

        if (proveedorEnEdicion) {
          const id = proveedorEnEdicion.ID_PROVEEDOR ?? proveedorEnEdicion.id
          await ActualizarProvLib(id, payload)

          Swal.fire({
            icon: 'success',
            title: '¡Proveedor actualizado!',
            text: 'El proveedor fue actualizado correctamente.',
            timer: 1800,
            showConfirmButton: false,
          })

          const proveedorActualizado: Proveedor = {
            ...proveedorEnEdicion,
            ...payload,
          }
          dispatch(updateProveedor(proveedorActualizado))
          await fetchProveedores(paginaActual, busquedaProveedor)
          if (onProveedorActualizado) {
            onProveedorActualizado(proveedorActualizado)
          }
        } else {
          const res = await NuevoProvLib(payload)

          Swal.fire({
            icon: 'success',
            title: '¡Proveedor registrado!',
            text: 'El proveedor fue registrado con éxito.',
            timer: 1800,
            showConfirmButton: false,
          })

          const proveedorNuevo: Proveedor = res?.data ||
            res || {
              id: Date.now(),
              ID_PROVEEDOR: Date.now(),
              ...payload,
            }
          dispatch(addProveedor(proveedorNuevo))
          await fetchProveedores(1, '')
          if (onProveedorCreado) {
            onProveedorCreado(proveedorNuevo)
          }
        }

        handleClose()
      } catch (error: any) {
        const errorMsg =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          'Error al procesar la solicitud'

        Swal.fire({
          icon: 'error',
          title: 'Error al guardar',
          text: errorMsg,
          confirmButtonColor: '#dc3545',
          confirmButtonText: 'Entendido',
        })
      } finally {
        setGuardando(false)
      }
    },
    [
      nombreProveedor,
      proveedorEnEdicion,
      canActualizarProveedor,
      canGuardarProveedor,
      dispatch,
      fetchProveedores,
      handleClose,
      onProveedorActualizado,
      onProveedorCreado,
      paginaActual,
      busquedaProveedor,
      verificarAccionEnServidor,
    ],
  )

  const handleEliminarProveedor = useCallback(
    async (provParam?: Proveedor) => {
      if (!canEliminarProveedor) {
        Swal.fire({
          icon: 'error',
          title: 'Acceso Denegado',
          text: 'No tienes permisos para eliminar proveedores.',
          confirmButtonColor: '#dc3545',
          confirmButtonText: 'Entendido',
        })
        return
      }

      const prov = provParam || proveedorSeleccionadoRef.current
      if (!prov) return

      const id = prov.ID_PROVEEDOR ?? prov.id
      if (!id) return

      const confirmResult = await Swal.fire({
        icon: 'warning',
        title: '¿Estás seguro de eliminar el proveedor?',
        text: `Se eliminará el proveedor "${prov.NOMBRE_PROVEEDOR}"`,
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
      })

      if (confirmResult.isConfirmed) {
        const tienePermiso = await verificarAccionEnServidor('btn_eliminar_proveedor')
        if (!tienePermiso) {
          Swal.fire({
            icon: 'error',
            title: 'Acceso Denegado',
            text: 'No tienes permisos para eliminar proveedores.',
            confirmButtonColor: '#dc3545',
            confirmButtonText: 'Entendido',
          })
          return
        }

        try {
          await EliminarProvLib(id)
          Swal.fire({
            icon: 'success',
            title: '¡Proveedor eliminado!',
            text: 'El proveedor fue eliminado correctamente.',
            timer: 1800,
            showConfirmButton: false,
          })
          dispatch(removeProveedor(id))
          if (
            proveedorSeleccionadoRef.current &&
            String(
              proveedorSeleccionadoRef.current.ID_PROVEEDOR ??
              proveedorSeleccionadoRef.current.id,
            ) === String(id)
          ) {
            dispatch(setProveedorSeleccionado(null))
          }
          await fetchProveedores(paginaActual, busquedaProveedor)
          if (onProveedorEliminado) {
            onProveedorEliminado(id)
          }
        } catch (error: any) {
          const msg =
            error?.response?.data?.message ||
            'Error al intentar eliminar el proveedor'
          Swal.fire({
            icon: 'error',
            title: 'Error al eliminar',
            text: msg,
            confirmButtonColor: '#dc3545',
            confirmButtonText: 'Entendido',
          })
        }
      }
    },
    [
      canEliminarProveedor,
      dispatch,
      fetchProveedores,
      paginaActual,
      busquedaProveedor,
      onProveedorEliminado,
      verificarAccionEnServidor,
    ],
  )

  return {
    isVisible,
    isControlled,
    handleOpen,
    handleClose,
    onProveedorCreado,
    onProveedorActualizado,
    onProveedorEliminado,
    listaProveedores,
    setListaProveedores: handleSetListaProveedores,
    loadingProveedor,
    setLoadingProveedor,
    busquedaProveedor,
    setBusquedaProveedor,
    proveedorSeleccionado,
    setProveedorSeleccionado: handleSetProveedorSeleccionado,
    proveedorEnEdicion,
    setProveedorEnEdicion,
    nombreProveedor,
    setNombreProveedor,
    proveedoresFiltrados: listaProveedores,
    proveedoresPaginados: listaProveedores,
    handleGuardarProveedor,
    handleEliminarProveedor,
    guardando,
    fetchProveedores,
    handleRecargar,
    paginaActual,
    totalPaginas,
    totalProveedores,
    totalFiltrados: totalProveedores,
    handlePageChange,
    canCrearProveedor,
    canGuardarProveedor,
    canEditarProveedor,
    canActualizarProveedor,
    canEliminarProveedor,
    canVerInfoProveedor,
    verificarAccionEnServidor,
  }
}

export default useProveedor
