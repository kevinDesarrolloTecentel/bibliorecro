import { useState, useCallback, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Swal from 'sweetalert2'
import { Categoria } from '@/models/rco/categoria.model'
import { ActualizarCatLib, CatLibros, EliminarCatLib, NuevaCatLib } from '@/Service/rco/CatLib'
import { usePermissions } from '@/hooks/auth/usePermissions'
import { RootState, AppDispatch } from '@/store'
import {
  setCategorias,
  setCategoriaSeleccionada,
  addCategoria,
  updateCategoria,
  removeCategoria,
} from '@/slices/detallesLibroSlice'

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
  const dispatch = useDispatch<AppDispatch>()
  const { categorias: listaCategorias, categoriaSeleccionada } = useSelector(
    (state: RootState) => state.detallesLibro,
  )

  const categoriaSeleccionadaRef = useRef(categoriaSeleccionada)
  useEffect(() => {
    categoriaSeleccionadaRef.current = categoriaSeleccionada
  }, [categoriaSeleccionada])

  const { canDoAction, verificarAccionEnServidor } = usePermissions()

  const canCrearCategoria = canDoAction('btn_crear_categoria')
  const canGuardarCategoria = canDoAction('btn_guardar_categoria')
  const canEditarCategoria = canDoAction('btn_editar_categoria')
  const canActualizarCategoria = canDoAction('btn_actualizar_categoria')
  const canEliminarCategoria = canDoAction('btn_eliminar_categoria')
  const canVerInfoCategoria = canDoAction('btn_ver_info_categoria')

  const [internalVisible, setInternalVisible] = useState(false)
  const isControlled = typeof visibleProp === 'boolean'
  const isVisible = isControlled ? visibleProp : internalVisible

  const [loadingCategorias, setLoadingCategorias] = useState(false)
  const [busquedaCategoria, setBusquedaCategoria] = useState('')
  const [categoriaEnEdicion, setCategoriaEnEdicion] = useState<Categoria | null>(null)

  const [codigoCategoria, setCodigoCategoria] = useState('')
  const [nombreCategoria, setNombreCategoria] = useState('')
  const [guardando, setGuardando] = useState(false)

  // Paginación 100% de servidor
  const [paginaActual, setPaginaActual] = useState(1)
  const [totalPaginas, setTotalPaginas] = useState(1)
  const [totalCategorias, setTotalCategorias] = useState(0)

  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null)
  const isFirstRender = useRef(true)

  const handleSetCategoriaSeleccionada = useCallback(
    (cat: Categoria | null | ((prev: Categoria | null) => Categoria | null)) => {
      if (typeof cat === 'function') {
        dispatch(setCategoriaSeleccionada(cat(categoriaSeleccionadaRef.current)))
      } else {
        dispatch(setCategoriaSeleccionada(cat))
      }
    },
    [dispatch],
  )

  const handleSetListaCategorias = useCallback(
    (list: Categoria[] | ((prev: Categoria[]) => Categoria[])) => {
      if (typeof list === 'function') {
        dispatch(setCategorias(list(listaCategorias)))
      } else {
        dispatch(setCategorias(list))
      }
    },
    [dispatch, listaCategorias],
  )

  const fetchCategorias = useCallback(
    async (page: number = 1, searchQuery: string = '', preserveSelection: boolean = true) => {
      setLoadingCategorias(true)
      try {
        const q = searchQuery.trim()
        const response = await CatLibros({ page, search: q, per_page: 10 })
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
        }

        const parsedList: Categoria[] = rawList.map((item: any) => ({
          id: item.ID_CATEGORIA,
          ID_CATEGORIA: item.ID_CATEGORIA,
          CODIGO_CATEGORIA: String(item.CODIGO_CATEGORIA ?? '').trim(),
          NOMBRE_CATEGORIA: String(item.NOMBRE_CATEGORIA ?? '').trim(),
          FECHAINGRESO_CATEGORIA: item.FECHAINGRESO_CATEGORIA ?? null,
        }))

        dispatch(setCategorias(parsedList))
        setTotalCategorias(total)
        setTotalPaginas(Math.max(1, lastPage))
        setPaginaActual(page)

        if (preserveSelection && categoriaSeleccionadaRef.current) {
          const prevId = String(
            categoriaSeleccionadaRef.current.ID_CATEGORIA ??
            categoriaSeleccionadaRef.current.id,
          )
          const matched = parsedList.find(
            (c) => String(c.ID_CATEGORIA ?? c.id) === prevId,
          )
          dispatch(setCategoriaSeleccionada(matched || null))
        } else if (!preserveSelection) {
          dispatch(setCategoriaSeleccionada(null))
        }
      } catch (error: any) {
        console.error('Error al cargar categorías desde la API:', error)
      } finally {
        setLoadingCategorias(false)
      }
    },
    [dispatch],
  )

  // Carga inicial
  useEffect(() => {
    if (autoFetch) {
      fetchCategorias(1, '')
    }
  }, [autoFetch, fetchCategorias])

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
      fetchCategorias(1, busquedaCategoria, true)
    }, 400)

    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current)
      }
    }
  }, [busquedaCategoria, fetchCategorias])

  const handlePageChange = useCallback(
    (page: number) => {
      if (page >= 1 && page <= totalPaginas && page !== paginaActual) {
        fetchCategorias(page, busquedaCategoria, true)
      }
    },
    [fetchCategorias, busquedaCategoria, totalPaginas, paginaActual],
  )

  const handleRecargar = useCallback(async () => {
    setBusquedaCategoria('')
    dispatch(setCategoriaSeleccionada(null))
    await fetchCategorias(1, '', false)
  }, [fetchCategorias, dispatch])

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

          const categoriaActualizada: Categoria = {
            ...categoriaEnEdicion,
            ...payload,
          }
          dispatch(updateCategoria(categoriaActualizada))
          await fetchCategorias(paginaActual, busquedaCategoria)
          if (onCategoriaActualizada) {
            onCategoriaActualizada(categoriaActualizada)
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

          const categoriaNueva: Categoria = res?.data ||
            res || {
              id: Date.now(),
              ID_CATEGORIA: Date.now(),
              ...payload,
            }
          dispatch(addCategoria(categoriaNueva))
          await fetchCategorias(1, '')
          if (onCategoriaCreada) {
            onCategoriaCreada(categoriaNueva)
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
      dispatch,
      fetchCategorias,
      handleClose,
      onCategoriaActualizada,
      onCategoriaCreada,
      paginaActual,
      busquedaCategoria,
      verificarAccionEnServidor,
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

      const cat = catParam || categoriaSeleccionadaRef.current
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
          dispatch(removeCategoria(id))
          if (
            categoriaSeleccionadaRef.current &&
            String(
              categoriaSeleccionadaRef.current.ID_CATEGORIA ??
              categoriaSeleccionadaRef.current.id,
            ) === String(id)
          ) {
            dispatch(setCategoriaSeleccionada(null))
          }
          await fetchCategorias(paginaActual, busquedaCategoria)
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
    [
      canEliminarCategoria,
      dispatch,
      fetchCategorias,
      paginaActual,
      busquedaCategoria,
      onCategoriaEliminada,
      verificarAccionEnServidor,
    ],
  )

  return {
    isVisible,
    isControlled,
    handleOpen,
    handleClose,
    listaCategorias,
    setListaCategorias: handleSetListaCategorias,
    categoriasFiltradas: listaCategorias,
    categoriasPaginadas: listaCategorias,
    loadingCategorias,
    setLoadingCategorias,
    busquedaCategoria,
    setBusquedaCategoria,
    categoriaSeleccionada,
    setCategoriaSeleccionada: handleSetCategoriaSeleccionada,
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
    totalCategorias,
    totalFiltradas: totalCategorias,
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
