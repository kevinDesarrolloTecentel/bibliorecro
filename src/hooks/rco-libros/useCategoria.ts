import { useState, useMemo, useCallback, useEffect } from 'react'
import Swal from 'sweetalert2'
import { Categoria } from '@/models/rco/categoria'
import { ActualizarCatLib, CatLibros, EliminarCatLib, NuevaCatLib } from '@/Service/rco/CatLib'


export type CategoriaItem = Categoria

export interface UseCategoriaProps {
  autoFetch?: boolean
  visible?: boolean
  setVisible?: (visible: boolean) => void
  onCategoriaCreada?: (categoriaNueva: Categoria) => void
  onCategoriaActualizada?: (categoriaActualizada: Categoria) => void
  onCategoriaEliminada?: (id: number | string) => void
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

export const useCategoria = ({
  autoFetch = true,
  visible: visibleProp,
  setVisible: setVisibleProp,
  onCategoriaCreada,
  onCategoriaActualizada,
  onCategoriaEliminada,
}: UseCategoriaProps = {}) => {
  const [internalVisible, setInternalVisible] = useState(false)
  const isControlled = typeof visibleProp === 'boolean'
  const isVisible = isControlled ? visibleProp : internalVisible

  const [listaCategorias, setListaCategorias] = useState<Categoria[]>([])
  const [loadingCategorias, setLoadingCategorias] = useState(false)
  const [busquedaCategoria, setBusquedaCategoria] = useState('')
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<Categoria | null>(null)
  const [categoriaEnEdicion, setCategoriaEnEdicion] = useState<Categoria | null>(null)

  const [codigoCategoria, setCodigoCategoria] = useState('')
  const [nombreCategoria, setNombreCategoria] = useState('')
  const [guardando, setGuardando] = useState(false)

  const fetchCategorias = useCallback(async () => {
    setLoadingCategorias(true)
    try {
      const response = await CatLibros()
      let rawList: any[] = []
      if (Array.isArray(response)) {
        rawList = response
      } else if (Array.isArray(response?.data)) {
        rawList = response.data
      } else if (Array.isArray(response?.data?.data)) {
        rawList = response.data.data
      } else if (Array.isArray(response?.categorias)) {
        rawList = response.categorias
      }

      const parsedList: Categoria[] = rawList.map((item: any, index: number) => ({
        id: item.ID_CATEGORIA ?? item.id ?? index + 1,
        ID_CATEGORIA: item.ID_CATEGORIA ?? item.id ?? index + 1,
        CODIGO_CATEGORIA: String(item.CODIGO_CATEGORIA ?? item.codigo ?? '').trim(),
        NOMBRE_CATEGORIA: String(item.NOMBRE_CATEGORIA ?? item.nombre ?? '').trim(),
        FECHAINGRESO_CATEGORIA: item.FECHAINGRESO_CATEGORIA ?? item.fecha_ingreso ?? null,
      }))

      setListaCategorias(parsedList)
      setCategoriaSeleccionada((prev) => {
        if (!prev) return null
        const prevId = String(prev.ID_CATEGORIA ?? prev.id)
        const matched = parsedList.find(
          (c) => String(c.ID_CATEGORIA ?? c.id) === prevId,
        )
        return matched || null
      })
    } catch (error: any) {
      console.error('Error al cargar categorías desde la API:', error)
      Toast.fire({
        icon: 'error',
        title: 'No se pudieron cargar las categorías del servidor',
      })
    } finally {
      setLoadingCategorias(false)
    }
  }, [])

  useEffect(() => {
    if (autoFetch) {
      fetchCategorias()
    }
  }, [autoFetch, fetchCategorias])

  const handleOpen = useCallback(
    (categoria?: Categoria) => {
      if (categoria) {
        setCategoriaEnEdicion(categoria)
        setCodigoCategoria(String(categoria.CODIGO_CATEGORIA || ''))
        setNombreCategoria(categoria.NOMBRE_CATEGORIA || '')
      } else {
        setCategoriaEnEdicion(null)
        setCodigoCategoria('')
        setNombreCategoria('')
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
    setCategoriaEnEdicion(null)
    setCodigoCategoria('')
    setNombreCategoria('')
  }, [setVisibleProp])

  const categoriasFiltradas = useMemo(() => {
    const sorted = [...listaCategorias].sort((a, b) => {
      const numA = Number(a.ID_CATEGORIA ?? a.id)
      const numB = Number(b.ID_CATEGORIA ?? b.id)
      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB
      }
      return String(a.NOMBRE_CATEGORIA).localeCompare(String(b.NOMBRE_CATEGORIA), undefined, {
        numeric: true,
      })
    })

    if (!busquedaCategoria.trim()) return sorted
    const q = busquedaCategoria.toLowerCase().trim()
    return sorted.filter((cat) => {
      const nombre = (cat.NOMBRE_CATEGORIA || '').toLowerCase()
      const codigo = String(cat.CODIGO_CATEGORIA || '').toLowerCase()
      const id = String(cat.ID_CATEGORIA ?? cat.id ?? '').toLowerCase()
      return nombre.includes(q) || codigo.includes(q) || id.includes(q)
    })
  }, [busquedaCategoria, listaCategorias])

  const handleGuardarCategoria = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault()

      if (!codigoCategoria.trim() || !nombreCategoria.trim()) {
        Swal.fire({
          icon: 'warning',
          title: 'Campos requeridos',
          text: 'Por favor ingrese el código y el nombre de la categoría.',
          confirmButtonColor: '#0d6efd',
        })
        return
      }

      setGuardando(true)
      try {
        const payload = {
          CODIGO_CATEGORIA: codigoCategoria.trim(),
          NOMBRE_CATEGORIA: nombreCategoria.trim(),
        }

        if (categoriaEnEdicion) {
          const id = categoriaEnEdicion.ID_CATEGORIA ?? categoriaEnEdicion.id
          await ActualizarCatLib(id, payload)

          Toast.fire({
            icon: 'success',
            title: 'Categoría actualizada con éxito',
          })

          await fetchCategorias()
          if (onCategoriaActualizada) {
            onCategoriaActualizada({
              ...categoriaEnEdicion,
              ...payload,
            })
          }
        } else {
          const res = await NuevaCatLib(payload)

          Toast.fire({
            icon: 'success',
            title: 'Categoría registrada con éxito',
          })

          await fetchCategorias()
          if (onCategoriaCreada) {
            onCategoriaCreada(
              res?.data ||
                res || {
                  id: Date.now(),
                  ID_CATEGORIA: Date.now(),
                  ...payload,
                },
            )
          }
        }

        handleClose()
      } catch (error: any) {
        console.error('Error al guardar categoría:', error)
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
      codigoCategoria,
      nombreCategoria,
      categoriaEnEdicion,
      fetchCategorias,
      handleClose,
      onCategoriaActualizada,
      onCategoriaCreada,
    ],
  )

  const handleEliminarCategoria = useCallback(
    async (catParam?: Categoria) => {
      const cat = catParam || categoriaSeleccionada
      if (!cat) return

      const id = cat.ID_CATEGORIA ?? cat.id
      if (!id) return

      const confirmResult = await Swal.fire({
        title: '¿Estás seguro?',
        text: `Se eliminará la categoría "${cat.NOMBRE_CATEGORIA}"`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
      })

      if (confirmResult.isConfirmed) {
        try {
          await EliminarCatLib(id)
          Toast.fire({
            icon: 'success',
            title: 'Categoría eliminada con éxito',
          })
          if (
            categoriaSeleccionada &&
            String(categoriaSeleccionada.ID_CATEGORIA ?? categoriaSeleccionada.id) === String(id)
          ) {
            setCategoriaSeleccionada(null)
          }
          await fetchCategorias()
          if (onCategoriaEliminada) {
            onCategoriaEliminada(id)
          }
        } catch (error: any) {
          console.error('Error al eliminar categoría:', error)
          const msg =
            error?.response?.data?.message ||
            error?.response?.data?.error ||
            'No se pudo eliminar la categoría del servidor'
          Swal.fire({
            icon: 'error',
            title: 'Error al eliminar',
            text: msg,
            confirmButtonColor: '#0d6efd',
          })
        }
      }
    },
    [categoriaSeleccionada, fetchCategorias, onCategoriaEliminada],
  )

  return {
    isVisible,
    isControlled,
    handleOpen,
    handleClose,
    listaCategorias,
    setListaCategorias,
    categoriasFiltradas,
    loadingCategorias,
    setLoadingCategorias,
    busquedaCategoria,
    setBusquedaCategoria,
    categoriaSeleccionada,
    setCategoriaSeleccionada,
    categoriaEnEdicion,
    codigoCategoria,
    setCodigoCategoria,
    nombreCategoria,
    setNombreCategoria,
    guardando,
    handleGuardarCategoria,
    handleEliminarCategoria,
    fetchCategorias,
  }
}

export default useCategoria
