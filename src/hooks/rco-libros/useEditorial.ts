import { useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Swal from 'sweetalert2'
import { Editorial } from '@/models/rco/editorial.model'
import { ActualizarEditLib, EliminarEditLib, ListarEditLib, NuevaEditLib } from '@/Service/rco/EditLib'
import { usePermissions } from '@/hooks/auth/usePermissions'
import { RootState, AppDispatch } from '@/store'
import {
  setEditoriales,
  setEditorialSeleccionada,
  addEditorial,
  updateEditorial,
  removeEditorial,
} from '@/slices/detallesLibroSlice'

export type EditorialItem = Editorial

export interface UseEditorialProps {
  autoFetch?: boolean
  visible?: boolean
  setVisible?: (visible: boolean) => void
  onEditorialcreado?: (editorialNuevo: Editorial) => void
  onEditorialActualizado?: (editorialActualizado: Editorial) => void
  onEditorialEliminado?: (id: number | string) => void
}

export const useEditorial = ({
  autoFetch = true,
  visible: visibleProp,
  setVisible: setVisibleProp,
  onEditorialcreado,
  onEditorialActualizado,
  onEditorialEliminado,
}: UseEditorialProps = {}) => {
  const dispatch = useDispatch<AppDispatch>()
  const { editoriales: listaEditorial, editorialSeleccionada: editorialSeleccionado } = useSelector(
    (state: RootState) => state.detallesLibro,
  )

  const editorialSeleccionadoRef = useRef(editorialSeleccionado)
  useEffect(() => {
    editorialSeleccionadoRef.current = editorialSeleccionado
  }, [editorialSeleccionado])

  const { canDoAction, verificarAccionEnServidor } = usePermissions()

  const canCrearEditorial = canDoAction('btn_crear_editorial')
  const canGuardarEditorial = canDoAction('btn_guardar_editorial')
  const canEditarEditorial = canDoAction('btn_editar_editorial')
  const canActualizarEditorial = canDoAction('btn_actualizar_editorial')
  const canEliminarEditorial = canDoAction('btn_eliminar_editorial')
  const canVerInfoEditorial = canDoAction('btn_ver_info_editorial')

  const [internalVisible, setInternalVisible] = useState(false)
  const isControlled = typeof visibleProp === 'boolean'
  const isVisible = isControlled ? visibleProp : internalVisible

  const [loadingEditorial, setLoadingEditorial] = useState(false)
  const [busquedaEditorial, setBusquedaEditorial] = useState('')
  const [nombreEditorial, setNombreEditorial] = useState('')
  const [editorialEnEdicion, setEditorialEnEdicion] = useState<Editorial | null>(null)
  const [guardando, setGuardando] = useState(false)

  // Paginación 100% de servidor
  const [paginaActual, setPaginaActual] = useState(1)
  const [totalPaginas, setTotalPaginas] = useState(1)
  const [totalEditoriales, setTotalEditoriales] = useState(0)

  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null)
  const isFirstRender = useRef(true)

  const handleSetEditorialSeleccionado = useCallback(
    (edi: Editorial | null | ((prev: Editorial | null) => Editorial | null)) => {
      if (typeof edi === 'function') {
        dispatch(setEditorialSeleccionada(edi(editorialSeleccionadoRef.current)))
      } else {
        dispatch(setEditorialSeleccionada(edi))
      }
    },
    [dispatch],
  )

  const handleSetListaEditorial = useCallback(
    (list: Editorial[] | ((prev: Editorial[]) => Editorial[])) => {
      if (typeof list === 'function') {
        dispatch(setEditoriales(list(listaEditorial)))
      } else {
        dispatch(setEditoriales(list))
      }
    },
    [dispatch, listaEditorial],
  )

  const fetchEditoriales = useCallback(
    async (page: number = 1, searchQuery: string = '', preserveSelection: boolean = true) => {
      setLoadingEditorial(true)
      try {
        const q = searchQuery.trim()
        const response = await ListarEditLib({ page, search: q, per_page: 10 })
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
        } else if (Array.isArray(response?.editorials)) {
          rawList = response.editorials
          total = rawList.length
          lastPage = 1
        } else if (Array.isArray(response?.editoriales)) {
          rawList = response.editoriales
          total = rawList.length
          lastPage = 1
        }

        // Mapeo canónico exacto (sin adivinanzas ni parches)
        const parsedList: Editorial[] = rawList.map((item: any) => ({
          id: item.ID_EDITORIAL,
          ID_EDITORIAL: item.ID_EDITORIAL,
          NOMBRE_EDITORIAL: String(item.NOMBRE_EDITORIAL ?? '').trim(),
          FECHAINGRESO_EDITORIAL: item.FECHAINGRESO_EDITORIAL ?? null,
        }))

        dispatch(setEditoriales(parsedList))
        setTotalEditoriales(total)
        setTotalPaginas(Math.max(1, lastPage))
        setPaginaActual(page)

        if (preserveSelection && editorialSeleccionadoRef.current) {
          const prevId = String(
            editorialSeleccionadoRef.current.ID_EDITORIAL ??
            editorialSeleccionadoRef.current.id,
          )
          const matched = parsedList.find(
            (e) => String(e.ID_EDITORIAL ?? e.id) === prevId,
          )
          dispatch(setEditorialSeleccionada(matched || null))
        } else if (!preserveSelection) {
          dispatch(setEditorialSeleccionada(null))
        }
      } catch (error: any) {
        console.error('Error al cargar editoriales desde la API:', error)
      } finally {
        setLoadingEditorial(false)
      }
    },
    [dispatch],
  )

  // Carga inicial
  useEffect(() => {
    if (autoFetch) {
      fetchEditoriales(1, '')
    }
  }, [autoFetch, fetchEditoriales])

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
      fetchEditoriales(1, busquedaEditorial, true)
    }, 400)

    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current)
      }
    }
  }, [busquedaEditorial, fetchEditoriales])

  const handlePageChange = useCallback(
    (page: number) => {
      if (page >= 1 && page <= totalPaginas && page !== paginaActual) {
        fetchEditoriales(page, busquedaEditorial, true)
      }
    },
    [fetchEditoriales, busquedaEditorial, totalPaginas, paginaActual],
  )

  const handleRecargar = useCallback(async () => {
    setBusquedaEditorial('')
    dispatch(setEditorialSeleccionada(null))
    await fetchEditoriales(1, '', false)
  }, [fetchEditoriales, dispatch])

  const handleOpen = useCallback(
    (editorial?: Editorial) => {
      if (editorial) {
        if (!canEditarEditorial) {
          Swal.fire({
            icon: 'error',
            title: 'Acceso Denegado',
            text: 'No tienes permisos para editar la editorial.',
            confirmButtonColor: '#dc3545',
            confirmButtonText: 'Entendido',
          })
          return
        }
        setEditorialEnEdicion(editorial)
        setNombreEditorial(editorial.NOMBRE_EDITORIAL || '')
      } else {
        if (!canCrearEditorial) {
          Swal.fire({
            icon: 'error',
            title: 'Acceso Denegado',
            text: 'No tienes permisos para crear editoriales.',
            confirmButtonColor: '#dc3545',
            confirmButtonText: 'Entendido',
          })
          return
        }
        setEditorialEnEdicion(null)
        setNombreEditorial('')
      }

      if (setVisibleProp) {
        setVisibleProp(true)
      } else {
        setInternalVisible(true)
      }
    },
    [canCrearEditorial, canEditarEditorial, setVisibleProp],
  )

  const handleClose = useCallback(() => {
    if (setVisibleProp) {
      setVisibleProp(false)
    } else {
      setInternalVisible(false)
    }
    setEditorialEnEdicion(null)
    setNombreEditorial('')
  }, [setVisibleProp])

  const handleGuardarEditorial = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault()

      if (!nombreEditorial.trim()) {
        Swal.fire({
          icon: 'warning',
          title: 'Campo requerido',
          text: 'Por favor ingrese el nombre de la editorial.',
          confirmButtonColor: '#dc3545',
          confirmButtonText: 'Entendido',
        })
        return
      }

      if (editorialEnEdicion) {
        if (!canActualizarEditorial) {
          Swal.fire({
            icon: 'error',
            title: 'Acceso Denegado',
            text: 'No tienes permisos para actualizar la editorial.',
            confirmButtonColor: '#dc3545',
            confirmButtonText: 'Entendido',
          })
          return
        }
        const tienePermiso = await verificarAccionEnServidor('btn_actualizar_editorial')
        if (!tienePermiso) {
          Swal.fire({
            icon: 'error',
            title: 'Acceso Denegado',
            text: 'No tienes permisos para actualizar la editorial.',
            confirmButtonColor: '#dc3545',
            confirmButtonText: 'Entendido',
          })
          return
        }
      } else {
        if (!canGuardarEditorial) {
          Swal.fire({
            icon: 'error',
            title: 'Acceso Denegado',
            text: 'No tienes permisos para guardar nuevas editoriales.',
            confirmButtonColor: '#dc3545',
            confirmButtonText: 'Entendido',
          })
          return
        }
        const tienePermiso = await verificarAccionEnServidor('btn_guardar_editorial')
        if (!tienePermiso) {
          Swal.fire({
            icon: 'error',
            title: 'Acceso Denegado',
            text: 'No tienes permisos para guardar nuevas editoriales.',
            confirmButtonColor: '#dc3545',
            confirmButtonText: 'Entendido',
          })
          return
        }
      }

      setGuardando(true)
      try {
        const payload = {
          NOMBRE_EDITORIAL: nombreEditorial.trim(),
        }

        if (editorialEnEdicion) {
          const id = editorialEnEdicion.ID_EDITORIAL ?? editorialEnEdicion.id
          await ActualizarEditLib(id, payload)

          Swal.fire({
            icon: 'success',
            title: '¡Editorial actualizada!',
            text: 'La editorial fue actualizada con éxito.',
            timer: 1800,
            showConfirmButton: false,
          })

          const editorialActualizada: Editorial = {
            ...editorialEnEdicion,
            ...payload,
          }
          dispatch(updateEditorial(editorialActualizada))
          await fetchEditoriales(paginaActual, busquedaEditorial)
          if (onEditorialActualizado) {
            onEditorialActualizado(editorialActualizada)
          }
        } else {
          const res = await NuevaEditLib(payload)

          Swal.fire({
            icon: 'success',
            title: '¡Editorial registrada!',
            text: 'La editorial fue registrada con éxito.',
            timer: 1800,
            showConfirmButton: false,
          })

          const editorialNueva: Editorial = res?.data ||
            res || {
              id: Date.now(),
              ID_EDITORIAL: Date.now(),
              ...payload,
            }
          dispatch(addEditorial(editorialNueva))
          await fetchEditoriales(1, '')
          if (onEditorialcreado) {
            onEditorialcreado(editorialNueva)
          }
        }

        handleClose()
      } catch (error: any) {
        console.error('Error al guardar editorial:', error)
        const errorMsg =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          'Error al procesar la solicitud con el servidor'
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
      nombreEditorial,
      editorialEnEdicion,
      canActualizarEditorial,
      canGuardarEditorial,
      dispatch,
      fetchEditoriales,
      handleClose,
      onEditorialActualizado,
      onEditorialcreado,
      paginaActual,
      busquedaEditorial,
      verificarAccionEnServidor,
    ],
  )

  const handleEliminarEditorial = useCallback(
    async (ediParam?: Editorial) => {
      if (!canEliminarEditorial) {
        Swal.fire({
          icon: 'error',
          title: 'Acceso Denegado',
          text: 'No tienes permisos para eliminar editoriales.',
          confirmButtonColor: '#dc3545',
          confirmButtonText: 'Entendido',
        })
        return
      }

      const edi = ediParam || editorialSeleccionadoRef.current
      if (!edi) return

      const id = edi.ID_EDITORIAL ?? edi.id
      if (!id) return

      const confirmResult = await Swal.fire({
        title: '¿Estás seguro?',
        text: `Se eliminará la editorial "${edi.NOMBRE_EDITORIAL}"`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
      })

      if (confirmResult.isConfirmed) {
        const tienePermiso = await verificarAccionEnServidor('btn_eliminar_editorial')
        if (!tienePermiso) {
          Swal.fire({
            icon: 'error',
            title: 'Acceso Denegado',
            text: 'No tienes permisos para eliminar editoriales.',
            confirmButtonColor: '#dc3545',
            confirmButtonText: 'Entendido',
          })
          return
        }

        try {
          await EliminarEditLib(id)
          Swal.fire({
            icon: 'success',
            title: '¡Editorial eliminada!',
            text: 'La editorial fue eliminada con éxito.',
            timer: 1800,
            showConfirmButton: false,
          })
          dispatch(removeEditorial(id))
          if (
            editorialSeleccionadoRef.current &&
            String(
              editorialSeleccionadoRef.current.ID_EDITORIAL ??
              editorialSeleccionadoRef.current.id,
            ) === String(id)
          ) {
            dispatch(setEditorialSeleccionada(null))
          }
          await fetchEditoriales(paginaActual, busquedaEditorial)
          if (onEditorialEliminado) {
            onEditorialEliminado(id)
          }
        } catch (error: any) {
          console.error('Error al eliminar editorial:', error)
          const msg =
            error?.response?.data?.message ||
            error?.response?.data?.error ||
            'No se pudo eliminar la editorial del servidor'
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
      canEliminarEditorial,
      dispatch,
      fetchEditoriales,
      paginaActual,
      busquedaEditorial,
      onEditorialEliminado,
      verificarAccionEnServidor,
    ],
  )

  return {
    isVisible,
    isControlled,
    handleOpen,
    handleClose,
    listaEditorial,
    setListaEditorial: handleSetListaEditorial,
    loadingEditorial,
    setLoadingEditorial,
    busquedaEditorial,
    setBusquedaEditorial,
    guardando,
    editorialFiltrados: listaEditorial,
    editorialPaginados: listaEditorial,
    handleGuardarEditorial,
    handleEliminarEditorial,
    editorialEnEdicion,
    nombreEditorial,
    setNombreEditorial,
    editorialSeleccionado,
    setEditorialSeleccionado: handleSetEditorialSeleccionado,
    fetchEditoriales,
    handleRecargar,
    paginaActual,
    totalPaginas,
    totalEditoriales,
    totalFiltrados: totalEditoriales,
    handlePageChange,
    canCrearEditorial,
    canGuardarEditorial,
    canEditarEditorial,
    canActualizarEditorial,
    canEliminarEditorial,
    canVerInfoEditorial,
    verificarAccionEnServidor,
  }
}

export default useEditorial
