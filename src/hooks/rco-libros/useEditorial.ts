import { useCallback, useMemo, useState, useEffect } from 'react'
import Swal from 'sweetalert2'
import { Editorial } from '@/models/rco/editorial'
import { ActualizarEditLib, EliminarEditLib, ListarEditLib, NuevaEditLib } from '@/Service/rco/EditLib'


export type EditorialItem = Editorial

export interface UseEditorialProps {
  visible?: boolean
  setVisible?: (visible: boolean) => void
  onEditorialcreado?: (editorialNuevo: Editorial) => void
  onEditorialActualizado?: (editorialActualizado: Editorial) => void
  onEditorialEliminado?: (id: number | string) => void
}

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer
    toast.onmouseleave = Swal.resumeTimer
  },
})

export const useEditorial = ({
  visible: visibleProp,
  setVisible: setVisibleProp,
  onEditorialcreado,
  onEditorialActualizado,
  onEditorialEliminado,
}: UseEditorialProps = {}) => {
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

  const fetchEditoriales = useCallback(async () => {
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
      setEditorialSeleccionado((prev) => {
        if (!prev) return null
        const prevId = String(prev.ID_EDITORIAL ?? prev.id)
        const matched = parsedList.find(
          (e) => String(e.ID_EDITORIAL ?? e.id) === prevId,
        )
        return matched || null
      })
    } catch (error: any) {
      console.error('Error al cargar editoriales desde la API:', error)
      Toast.fire({
        icon: 'error',
        title: 'No se pudieron cargar las editoriales del servidor',
      })
    } finally {
      setLoadingEditorial(false)
    }
  }, [])

  useEffect(() => {
    fetchEditoriales()
  }, [fetchEditoriales])

  const handleOpen = useCallback(
    (editorial?: Editorial) => {
      if (editorial) {
        setEditorialEnEdicion(editorial)
        setNombreEditorial(editorial.NOMBRE_EDITORIAL || '')
      } else {
        setEditorialEnEdicion(null)
        setNombreEditorial('')
      }
      if (setVisibleProp) {
        setVisibleProp(true)
      } else {
        setInternalVisible(true)
      }
    },
    [setVisibleProp],
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

  const handleGuardarEditorial = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault()

      if (!nombreEditorial.trim()) {
        Swal.fire({
          icon: 'warning',
          title: 'Campo Requerido',
          text: 'Ingrese el nombre de la Editorial',
          confirmButtonColor: '#0d6efd',
        })
        return
      }

      setGuardando(true)
      try {
        const payload = {
          NOMBRE_EDITORIAL: nombreEditorial.trim(),
        }

        if (editorialEnEdicion) {
          const id = editorialEnEdicion.ID_EDITORIAL ?? editorialEnEdicion.id
          await ActualizarEditLib(id, payload)

          Toast.fire({
            icon: 'success',
            title: 'Editorial actualizada con éxito',
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

          Toast.fire({
            icon: 'success',
            title: 'Editorial creada con éxito',
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
          confirmButtonColor: '#0d6efd',
        })
      } finally {
        setGuardando(false)
      }
    },
    [
      nombreEditorial,
      editorialEnEdicion,
      fetchEditoriales,
      handleClose,
      onEditorialActualizado,
      onEditorialcreado,
    ],
  )

  const handleEliminarEditorial = useCallback(
    async (ediParam?: Editorial) => {
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
        try {
          await EliminarEditLib(id)
          Toast.fire({
            icon: 'success',
            title: 'Editorial eliminada con éxito',
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
            confirmButtonColor: '#0d6efd',
          })
        }
      }
    },
    [editorialSeleccionado, fetchEditoriales, onEditorialEliminado],
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
    handleGuardarEditorial,
    handleEliminarEditorial,
    editorialEnEdicion,
    nombreEditorial,
    setNombreEditorial,
    editorialSeleccionado,
    setEditorialSeleccionado,
    fetchEditoriales,
  }
}

export default useEditorial
