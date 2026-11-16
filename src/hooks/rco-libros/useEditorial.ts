import { useCallback, useMemo, useState, useEffect } from 'react'
import Swal from 'sweetalert2'
import { Editorial } from '@/models/rco/editorial'
import { ActualizarEditLib, EliminarEditLib, ListarEditLib, NuevaEditLib } from '@/Service/rco/EditLib'
import { usePermissions } from '@/context/PermissionsContext'


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
  const { canDoAction, verificarAccionEnServidor } = usePermissions()

  const canCrearEditorial = canDoAction('btn_crear_editorial')
  const canGuardarEditorial = canDoAction('btn_guardar_editorial')
  const canEditarEditorial = canDoAction('btn_editar_editorial')
  const canActualizarEditorial = canDoAction('btn_actualizar_editorial')
  const canEliminarEditorial = canDoAction('btn_eliminar_editorial')
  const canVerInfoEditorial =canDoAction('btn_ver_info_editorial')

  const [internalVisible, setInternalVisible] = useState(false)
  const isControlled = typeof visibleProp === 'boolean'
  const isVisible = isControlled ? visibleProp : internalVisible

  const [listaEditorial, setListaEditorial] = useState<Editorial[]>([])
  const [loadingEditorial, setLoadingEditorial] = useState(false)
  const [busquedaEditorial, setBusquedaEditorial] = useState('')
  const [editorialSeleccionado, setEditorialSeleccionado] = useState<Editorial | null>(null)
  const [nombreEditorial, setNombreEditorial] = useState('')
  const [editorialEnEdicion, setEditorialEnEdicion] = useState<Editorial | null>(null)
  const [guardando, setGuardando] = useState(false)

  const fetchEditoriales = useCallback(async (preserveSelection = true) => {
    setLoadingEditorial(true)
    try {
      const response = await ListarEditLib()
      let rawList: any[] = []
      if (Array.isArray(response)) {
        rawList = response
      } else if (Array.isArray(response?.data)) {
        rawList = response.data
      } else if (Array.isArray(response?.data?.data)) {
        rawList = response.data.data
      } else if (Array.isArray(response?.editorials)) {
        rawList = response.editorials
      } else if (Array.isArray(response?.editoriales)) {
        rawList = response.editoriales
      }

      const parsedList: Editorial[] = rawList.map((item: any, index: number) => ({
        id: item.ID_EDITORIAL ?? item.id ?? index + 1,
        ID_EDITORIAL: item.ID_EDITORIAL ?? item.id ?? index + 1,
        NOMBRE_EDITORIAL: String(item.NOMBRE_EDITORIAL ?? item.nombre ?? '').trim(),
        FECHAINGRESO_EDITORIAL: item.FECHAINGRESO_EDITORIAL ?? item.fecha_ingreso ?? null,
      }))

      setListaEditorial(parsedList)
      if (preserveSelection) {
        setEditorialSeleccionado((prev) => {
          if (!prev) return null
          const prevId = String(prev.ID_EDITORIAL ?? prev.id)
          const matched = parsedList.find(
            (e) => String(e.ID_EDITORIAL ?? e.id) === prevId,
          )
          return matched || null
        })
      } else {
        setEditorialSeleccionado(null)
      }
    } catch (error: any) {
      console.error('Error al cargar editoriales desde la API:', error)
    } finally {
      setLoadingEditorial(false)
    }
  }, [])

  useEffect(() => {
    if(autoFetch){
      fetchEditoriales()
    }
  }, [autoFetch, fetchEditoriales])

  const handleRecargar = useCallback(async () => {
    setBusquedaEditorial('')
    setPaginaActual(1)
    setEditorialSeleccionado(null)
    await fetchEditoriales(false)
  }, [fetchEditoriales])

  const handleOpen = useCallback(
    (editorial?: Editorial) => {
      if (editorial) {
        if (!canEditarEditorial) {
          Swal.fire({
            icon: 'error',
            title: 'Acceso Denegado',
            text: 'No tienes permisos para editar editoriales.',
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

  const editorialFiltrados = useMemo(() => {
    const sorted = [...listaEditorial].sort((a, b) => {
      const numA = Number(a.ID_EDITORIAL ?? a.id)
      const numB = Number(b.ID_EDITORIAL ?? b.id)

      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB
      }
      return String(a.NOMBRE_EDITORIAL).localeCompare(String(b.NOMBRE_EDITORIAL), undefined, {
        numeric: true,
      })
    })

    if (!busquedaEditorial.trim()) return sorted
    const q = busquedaEditorial.toLowerCase().trim()
    return sorted.filter((editorial) => {
      const nombre = (editorial.NOMBRE_EDITORIAL || '').toLowerCase()
      const id = String(editorial.ID_EDITORIAL ?? editorial.id ?? '').toLowerCase()
      return nombre.includes(q) || id.includes(q)
    })
  }, [busquedaEditorial, listaEditorial])

  const [paginaActual, setPaginaActual] = useState(1)
  const itemsPorPagina = 10

  useEffect(() => {
    setPaginaActual(1)
  }, [busquedaEditorial])

  const totalPaginas = Math.max(1, Math.ceil(editorialFiltrados.length / itemsPorPagina))

  useEffect(() => {
    if (paginaActual > totalPaginas) {
      setPaginaActual(totalPaginas)
    }
  }, [totalPaginas, paginaActual])

  const editorialPaginados = useMemo(() => {
    const start = (paginaActual - 1) * itemsPorPagina
    return editorialFiltrados.slice(start, start + itemsPorPagina)
  }, [editorialFiltrados, paginaActual, itemsPorPagina])

  const handlePageChange = useCallback((page: number) => {
    setPaginaActual(page)
  }, [])

  const handleGuardarEditorial = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault()

      if (!nombreEditorial.trim()) {
        Swal.fire({
          icon: 'warning',
          title: 'Campo Requerido',
          text: 'Ingrese el nombre de la Editorial.',
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

          await fetchEditoriales()
          if (onEditorialActualizado) {
            onEditorialActualizado({
              ...editorialEnEdicion,
              ...payload,
            })
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

          await fetchEditoriales()
          if (onEditorialcreado) {
            onEditorialcreado(
              res?.data ||
                res || {
                  id: Date.now(),
                  ID_EDITORIAL: Date.now(),
                  ...payload,
                },
            )
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
      fetchEditoriales,
      handleClose,
      onEditorialActualizado,
      onEditorialcreado,
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

      const edi = ediParam || editorialSeleccionado
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
          if (
            editorialSeleccionado &&
            String(editorialSeleccionado.ID_EDITORIAL ?? editorialSeleccionado.id) === String(id)
          ) {
            setEditorialSeleccionado(null)
          }
          await fetchEditoriales()
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
    [canEliminarEditorial, editorialSeleccionado, fetchEditoriales, onEditorialEliminado],
  )

  return {
    isVisible,
    isControlled,
    handleOpen,
    handleClose,
    listaEditorial,
    setListaEditorial,
    loadingEditorial,
    setLoadingEditorial,
    busquedaEditorial,
    setBusquedaEditorial,
    guardando,
    editorialFiltrados,
    editorialPaginados,
    handleGuardarEditorial,
    handleEliminarEditorial,
    editorialEnEdicion,
    nombreEditorial,
    setNombreEditorial,
    editorialSeleccionado,
    setEditorialSeleccionado,
    fetchEditoriales,
    handleRecargar,
    paginaActual,
    totalPaginas,
    totalEditoriales: listaEditorial.length,
    totalFiltrados: editorialFiltrados.length,
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
