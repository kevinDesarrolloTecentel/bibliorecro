import { useState, useMemo, useCallback, useEffect } from 'react'
import Swal from 'sweetalert2'
import { Categoria } from '@/models/rco/categoria'
import { ActualizarCatLib, CatLibros, EliminarCatLib, NuevaCatLib } from '@/Service/rco/CatLib'
import { usePermissions } from '@/context/PermissionsContext'


export type CategoriaItem = Categoria

export interface UseCategoriaProps {
  autoFetch?: boolean
  visible?: boolean
  setVisible?: (visible: boolean) => void
  onCategoriaCreada?: (categoriaNueva: Categoria) => void
  onCategoriaActualizada?: (categoriaActualizada: Categoria) => void
  onCategoriaEliminada?: (id: number | string) => void
}

export const useCategoria = ({
  autoFetch = true,
  visible: visibleProp,
  setVisible: setVisibleProp,
  onCategoriaCreada,
  onCategoriaActualizada,
  onCategoriaEliminada,
}: UseCategoriaProps = {}) => {
  const { canDoAction, verificarAccionEnServidor } = usePermissions()

  const canCrearCategoria = canDoAction('btn_crear_categoria')
  const canGuardarCategoria = canDoAction('btn_guardar_categoria')
  const canEditarCategoria = canDoAction('btn_editar_categoria')
  const canActualizarCategoria = canDoAction('btn_actualizar_categoria')
  const canEliminarCategoria = canDoAction('btn_eliminar_categoria')
  const canVerInfoCategoria =canDoAction('btn_ver_info_categoria')

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
  


  const fetchCategorias = useCallback(async (preserveSelection = true) => {
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
      if (preserveSelection) {
        setCategoriaSeleccionada((prev) => {
          if (!prev) return null
          const prevId = String(prev.ID_CATEGORIA ?? prev.id)
          const matched = parsedList.find(
            (c) => String(c.ID_CATEGORIA ?? c.id) === prevId,
          )
          return matched || null
        })
      } else {
        setCategoriaSeleccionada(null)
      }
    } catch (error: any) {
      console.error('Error al cargar categorías desde la API:', error)
    } finally {
      setLoadingCategorias(false)
    }
  }, [])

  useEffect(() => {
    if (autoFetch) {
      fetchCategorias()
    }
  }, [autoFetch, fetchCategorias])

  const handleRecargar = useCallback(async () => {
    setBusquedaCategoria('')
    setPaginaActual(1)
    setCategoriaSeleccionada(null)
    await fetchCategorias(false)
  }, [fetchCategorias])

  const handleOpen = useCallback(
    (categoria?: Categoria) => {
      if (categoria) {
        if (!canEditarCategoria) {
          Swal.fire({
            icon: 'error',
            title: 'Acceso Denegado',
            text: 'No tienes permisos para editar categorías.',
            confirmButtonColor: '#dc3545',
            confirmButtonText: 'Entendido',
          })
          return
        }
        setCategoriaEnEdicion(categoria)
        setCodigoCategoria(String(categoria.CODIGO_CATEGORIA || ''))
        setNombreCategoria(categoria.NOMBRE_CATEGORIA || '')
      } else {
        if (!canCrearCategoria) {
          Swal.fire({
            icon: 'error',
            title: 'Acceso Denegado',
            text: 'No tienes permisos para crear categorías.',
            confirmButtonColor: '#dc3545',
            confirmButtonText: 'Entendido',
          })
          return
        }
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
    [canCrearCategoria, canEditarCategoria, setVisibleProp],
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

  const [paginaActual, setPaginaActual] = useState(1)
  const itemsPorPagina = 20

  useEffect(() => {
    setPaginaActual(1)
  }, [busquedaCategoria])

  const totalPaginas = Math.max(1, Math.ceil(categoriasFiltradas.length / itemsPorPagina))

  useEffect(() => {
    if (paginaActual > totalPaginas) {
      setPaginaActual(totalPaginas)
    }
  }, [totalPaginas, paginaActual])

  const categoriasPaginadas = useMemo(() => {
    const start = (paginaActual - 1) * itemsPorPagina
    return categoriasFiltradas.slice(start, start + itemsPorPagina)
  }, [categoriasFiltradas, paginaActual, itemsPorPagina])

  const handlePageChange = useCallback((page: number) => {
    setPaginaActual(page)
  }, [])

  const handleGuardarCategoria = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault()

      if (!codigoCategoria.trim() || !nombreCategoria.trim()) {
        Swal.fire({
          icon: 'warning',
          title: 'Campos requeridos',
          text: 'Por favor ingrese el código y el nombre de la categoría.',
          confirmButtonColor: '#dc3545',
          confirmButtonText: 'Entendido',
        })
        return
      }

      if (categoriaEnEdicion) {
        if (!canActualizarCategoria) {
          Swal.fire({
            icon: 'error',
            title: 'Acceso Denegado',
            text: 'No tienes permisos para actualizar la categoría.',
            confirmButtonColor: '#dc3545',
            confirmButtonText: 'Entendido',
          })
          return
        }
        const tienePermiso = await verificarAccionEnServidor('btn_actualizar_categoria')
        if (!tienePermiso) {
          Swal.fire({
            icon: 'error',
            title: 'Acceso Denegado',
            text: 'No tienes permisos para actualizar la categoría.',
            confirmButtonColor: '#dc3545',
            confirmButtonText: 'Entendido',
          })
          return
        }
      } else {
        if (!canGuardarCategoria) {
          Swal.fire({
            icon: 'error',
            title: 'Acceso Denegado',
            text: 'No tienes permisos para guardar nuevas categorías.',
            confirmButtonColor: '#dc3545',
            confirmButtonText: 'Entendido',
          })
          return
        }
        const tienePermiso = await verificarAccionEnServidor('btn_guardar_categoria')
        if (!tienePermiso) {
          Swal.fire({
            icon: 'error',
            title: 'Acceso Denegado',
            text: 'No tienes permisos para guardar nuevas categorías.',
            confirmButtonColor: '#dc3545',
            confirmButtonText: 'Entendido',
          })
          return
        }
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

          Swal.fire({
            icon: 'success',
            title: '¡Categoría actualizada!',
            text: 'La categoría fue actualizada con éxito.',
            timer: 1800,
            showConfirmButton: false,
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

          Swal.fire({
            icon: 'success',
            title: '¡Categoría registrada!',
            text: 'La categoría fue registrada con éxito.',
            timer: 1800,
            showConfirmButton: false,
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
          confirmButtonColor: '#dc3545',
          confirmButtonText: 'Entendido',
        })
      } finally {
        setGuardando(false)
      }
    },
    [
      codigoCategoria,
      nombreCategoria,
      categoriaEnEdicion,
      canActualizarCategoria,
      canGuardarCategoria,
      fetchCategorias,
      handleClose,
      onCategoriaActualizada,
      onCategoriaCreada,
    ],
  )

  const handleEliminarCategoria = useCallback(
    async (catParam?: Categoria) => {
      if (!canEliminarCategoria) {
        Swal.fire({
          icon: 'error',
          title: 'Acceso Denegado',
          text: 'No tienes permisos para eliminar categorías.',
          confirmButtonColor: '#dc3545',
          confirmButtonText: 'Entendido',
        })
        return
      }

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
        const tienePermiso = await verificarAccionEnServidor('btn_eliminar_categoria')
        if (!tienePermiso) {
          Swal.fire({
            icon: 'error',
            title: 'Acceso Denegado',
            text: 'No tienes permisos para eliminar categorías.',
            confirmButtonColor: '#dc3545',
            confirmButtonText: 'Entendido',
          })
          return
        }

        try {
          await EliminarCatLib(id)
          Swal.fire({
            icon: 'success',
            title: '¡Categoría eliminada!',
            text: 'La categoría fue eliminada con éxito.',
            timer: 1800,
            showConfirmButton: false,
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
            confirmButtonColor: '#dc3545',
            confirmButtonText: 'Entendido',
          })
        }
      }
    },
    [canEliminarCategoria, categoriaSeleccionada, fetchCategorias, onCategoriaEliminada],
  )

  return {
    isVisible,
    isControlled,
    handleOpen,
    handleClose,
    listaCategorias,
    setListaCategorias,
    categoriasFiltradas,
    categoriasPaginadas,
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
    handleRecargar,
    paginaActual,
    totalPaginas,
    totalCategorias: listaCategorias.length,
    totalFiltradas: categoriasFiltradas.length,
    handlePageChange,
    canCrearCategoria,
    canGuardarCategoria,
    canEditarCategoria,
    canActualizarCategoria,
    canEliminarCategoria,
    canVerInfoCategoria,
    verificarAccionEnServidor,
  }
}

export default useCategoria
