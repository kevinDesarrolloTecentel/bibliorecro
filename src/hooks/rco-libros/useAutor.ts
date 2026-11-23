import { useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Swal from 'sweetalert2'
import { Autor } from '@/models/rco/autor.model'
import { ActualizarAutorLib, EliminarAutorLib, Autores, NuevoAutorLib } from '@/Service/rco/AutorLib'
import { usePermissions } from '@/hooks/auth/usePermissions'
import { RootState, AppDispatch } from '@/store'
import {
  setAutores,
  setAutorSeleccionado,
  addAutor,
  updateAutor,
  removeAutor,
} from '@/slices/detallesLibroSlice'

export type AutorItem = Autor

export interface UseAutorProps {
  autoFetch?: boolean
  visible?: boolean
  setVisible?: (visible: boolean) => void
  onAutorCreado?: (autorNuevo: Autor) => void
  onAutorActualizado?: (autorActualizado: Autor) => void
  onAutorEliminado?: (id: number | string) => void
}

export const useAutor = ({
  autoFetch = true,
  visible: visibleProp,
  setVisible: setVisibleProp,
  onAutorCreado,
  onAutorActualizado,
  onAutorEliminado,
}: UseAutorProps = {}) => {
  const dispatch = useDispatch<AppDispatch>()
  const { autores: listaAutores, autorSeleccionado } = useSelector(
    (state: RootState) => state.detallesLibro,
  )

  const autorSeleccionadoRef = useRef(autorSeleccionado)
  useEffect(() => {
    autorSeleccionadoRef.current = autorSeleccionado
  }, [autorSeleccionado])

  const { canDoAction, verificarAccionEnServidor } = usePermissions()

  const canCrearAutor = canDoAction('btn_crear_autor')
  const canGuardarAutor = canDoAction('btn_guardar_autor')
  const canEditarAutor = canDoAction('btn_editar_autor')
  const canActualizarAutor = canDoAction('btn_actualizar_autor')
  const canEliminarAutor = canDoAction('btn_eliminar_autor')
  const canVerInfoAutor = canDoAction('btn_ver_info_autor')

  const [internalVisible, setInternalVisible] = useState(false)
  const isControlled = typeof visibleProp === 'boolean'
  const isVisible = isControlled ? visibleProp : internalVisible

  const [loadingAutores, setLoadingAutores] = useState(false)
  const [busquedaAutor, setBusquedaAutor] = useState('')
  const [autorEnEdicion, setAutorEnEdicion] = useState<Autor | null>(null)

  const [paginaActual, setPaginaActual] = useState(1)
  const [totalPaginas, setTotalPaginas] = useState(1)
  const [totalAutores, setTotalAutores] = useState(0)

  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null)
  const isFirstRender = useRef(true)

  const [nombreAutor, setNombreAutor] = useState('')
  const [guardando, setGuardando] = useState(false)

  const handleSetAutorSeleccionado = useCallback(
    (aut: Autor | null | ((prev: Autor | null) => Autor | null)) => {
      if (typeof aut === 'function') {
        dispatch(setAutorSeleccionado(aut(autorSeleccionadoRef.current)))
      } else {
        dispatch(setAutorSeleccionado(aut))
      }
    },
    [dispatch],
  )

  const handleSetListaAutores = useCallback(
    (list: Autor[] | ((prev: Autor[]) => Autor[])) => {
      if (typeof list === 'function') {
        dispatch(setAutores(list(listaAutores)))
      } else {
        dispatch(setAutores(list))
      }
    },
    [dispatch, listaAutores],
  )

  const fetchAutores = useCallback(
    async (page: number = 1, searchQuery: string = '', preserveSelection: boolean = true) => {
      setLoadingAutores(true)
      try {
        const q = searchQuery.trim()
        const response = await Autores({ page, search: q, per_page: 10 })
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

        const parsedList: Autor[] = rawList.map((item: any) => ({
          id: item.ID_AUTOR,
          ID_AUTOR: item.ID_AUTOR,
          NOMBRE_AUTOR: String(item.NOMBRE_AUTOR ?? '').trim(),
          FECHAINGRESO_AUTOR: item.FECHAINGRESO_AUTOR ?? null,
        }))

        dispatch(setAutores(parsedList))
        setTotalAutores(total)
        setTotalPaginas(Math.max(1, lastPage))
        setPaginaActual(page)

        if (preserveSelection && autorSeleccionadoRef.current) {
          const prevId = String(
            autorSeleccionadoRef.current.ID_AUTOR ?? autorSeleccionadoRef.current.id,
          )
          const matched = parsedList.find(
            (a) => String(a.ID_AUTOR ?? a.id) === prevId,
          )
          dispatch(setAutorSeleccionado(matched || autorSeleccionadoRef.current))
        } else if (!preserveSelection) {
          dispatch(setAutorSeleccionado(null))
        }
      } catch (error: any) {
        console.error('Error al cargar autores desde la API:', error)
      } finally {
        setLoadingAutores(false)
      }
    },
    [dispatch],
  )

  // Carga inicial (solo 1 vez si autoFetch está activo)
  useEffect(() => {
    if (autoFetch) {
      fetchAutores(1, '')
    }
  }, [autoFetch, fetchAutores])

  // Búsqueda con debounce (omite el primer render para no duplicar la petición)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current)
    }
    searchDebounceRef.current = setTimeout(() => {
      fetchAutores(1, busquedaAutor, true)
    }, 400)

    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current)
      }
    }
  }, [busquedaAutor, fetchAutores])

  const handlePageChange = useCallback(
    (page: number) => {
      if (page >= 1 && page <= totalPaginas && page !== paginaActual) {
        fetchAutores(page, busquedaAutor, true)
      }
    },
    [fetchAutores, busquedaAutor, totalPaginas, paginaActual],
  )

  const handleRecargar = useCallback(async () => {
    setBusquedaAutor('')
    dispatch(setAutorSeleccionado(null))
    await fetchAutores(1, '', false)
  }, [fetchAutores, dispatch])

  const handleOpen = useCallback(
    (autor?: Autor) => {
      if (autor) {
        if (!canEditarAutor) {
          Swal.fire({
            icon: 'error',
            title: 'Acceso Denegado',
            text: 'No tienes permisos para editar el autor.',
            confirmButtonColor: '#dc3545',
            confirmButtonText: 'Entendido',
          })
          return
        }
        setAutorEnEdicion(autor)
        setNombreAutor(autor.NOMBRE_AUTOR || '')
      } else {
        if (!canCrearAutor) {
          Swal.fire({
            icon: 'error',
            title: 'Acceso Denegado',
            text: 'No tienes permisos para crear autores.',
            confirmButtonColor: '#dc3545',
            confirmButtonText: 'Entendido',
          })
          return
        }
        setAutorEnEdicion(null)
        setNombreAutor('')
      }

      if (setVisibleProp) {
        setVisibleProp(true)
      } else {
        setInternalVisible(true)
      }
    },
    [setVisibleProp, canEditarAutor, canCrearAutor],
  )

  const handleClose = useCallback(() => {
    if (setVisibleProp) {
      setVisibleProp(false)
    } else {
      setInternalVisible(false)
    }
    setAutorEnEdicion(null)
    setNombreAutor('')
  }, [setVisibleProp])

  const handleGuardarAutor = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault()

      if (!nombreAutor.trim()) {
        Swal.fire({
          icon: 'warning',
          title: 'Campos requeridos',
          text: 'Por favor ingrese el nombre del autor.',
          confirmButtonColor: '#dc3545',
          confirmButtonText: 'Entendido',
        })
        return
      }

      if (autorEnEdicion) {
        if (!canActualizarAutor) {
          Swal.fire({
            icon: 'error',
            title: 'Acceso Denegado',
            text: 'No tienes permisos para actualizar el autor.',
            confirmButtonColor: '#dc3545',
            confirmButtonText: 'Entendido',
          })
          return
        }
        const tienePermiso = await verificarAccionEnServidor('btn_actualizar_autor')
        if (!tienePermiso) {
          Swal.fire({
            icon: 'error',
            title: 'Acceso Denegado',
            text: 'No tienes permisos para actualizar el autor.',
            confirmButtonColor: '#dc3545',
            confirmButtonText: 'Entendido',
          })
          return
        }
      } else {
        if (!canGuardarAutor) {
          Swal.fire({
            icon: 'error',
            title: 'Acceso Denegado',
            text: 'No tienes permisos para guardar nuevos autores.',
            confirmButtonColor: '#dc3545',
            confirmButtonText: 'Entendido',
          })
          return
        }
        const tienePermiso = await verificarAccionEnServidor('btn_guardar_autor')
        if (!tienePermiso) {
          Swal.fire({
            icon: 'error',
            title: 'Acceso Denegado',
            text: 'No tienes permisos para guardar nuevos autores.',
            confirmButtonColor: '#dc3545',
            confirmButtonText: 'Entendido',
          })
          return
        }
      }

      setGuardando(true)
      try {
        const payload = {
          NOMBRE_AUTOR: nombreAutor.trim(),
        }

        if (autorEnEdicion) {
          const id = autorEnEdicion.ID_AUTOR ?? autorEnEdicion.id
          await ActualizarAutorLib(id, payload)

          Swal.fire({
            icon: 'success',
            title: '¡Autor actualizado!',
            text: 'El autor fue actualizado correctamente.',
            timer: 1800,
            showConfirmButton: false,
          })
          const autorActualizado: Autor = {
            ...autorEnEdicion,
            ...payload,
          }
          dispatch(updateAutor(autorActualizado))
          await fetchAutores(paginaActual, busquedaAutor)
          if (onAutorActualizado) {
            onAutorActualizado(autorActualizado)
          }
        } else {
          const res = await NuevoAutorLib(payload)

          Swal.fire({
            icon: 'success',
            title: '¡Autor registrado!',
            text: 'El autor fue registrado correctamente.',
            timer: 1800,
            showConfirmButton: false,
          })

          const autorNuevo: Autor = res?.data ||
            res || {
              id: Date.now(),
              ID_AUTOR: Date.now(),
              ...payload,
            }
          dispatch(addAutor(autorNuevo))
          await fetchAutores(1, '')
          if (onAutorCreado) {
            onAutorCreado(autorNuevo)
          }
        }

        handleClose()
      } catch (error: any) {
        console.error('Error al guardar autor:', error)
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
      nombreAutor,
      autorEnEdicion,
      canActualizarAutor,
      canGuardarAutor,
      dispatch,
      fetchAutores,
      handleClose,
      onAutorActualizado,
      onAutorCreado,
      paginaActual,
      busquedaAutor,
      verificarAccionEnServidor,
    ],
  )

  const handleEliminarAutor = useCallback(
    async (autParam?: Autor) => {
      if (!canEliminarAutor) {
        Swal.fire({
          icon: 'error',
          title: 'Acceso Denegado',
          text: 'No tienes permisos para eliminar autores.',
          confirmButtonColor: '#dc3545',
          confirmButtonText: 'Entendido',
        })
        return
      }

      const aut = autParam || autorSeleccionadoRef.current
      if (!aut) return

      const id = aut.ID_AUTOR ?? aut.id
      if (!id) return

      const confirmResult = await Swal.fire({
        title: 'Eliminar autor',
        text: `¿Estás seguro de eliminar el autor "${aut.NOMBRE_AUTOR}"?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
      })

      if (confirmResult.isConfirmed) {
        const tienePermiso = await verificarAccionEnServidor('btn_eliminar_autor')
        if (!tienePermiso) {
          Swal.fire({
            icon: 'error',
            title: 'Acceso Denegado',
            text: 'No tienes permisos para eliminar autores.',
            confirmButtonColor: '#dc3545',
            confirmButtonText: 'Entendido',
          })
          return
        }

        try {
          await EliminarAutorLib(id)
          Swal.fire({
            icon: 'success',
            title: '¡Autor eliminado!',
            text: 'El autor fue eliminado con éxito.',
            timer: 1800,
            showConfirmButton: false,
          })
          dispatch(removeAutor(id))
          if (
            autorSeleccionadoRef.current &&
            String(
              autorSeleccionadoRef.current.ID_AUTOR ?? autorSeleccionadoRef.current.id,
            ) === String(id)
          ) {
            dispatch(setAutorSeleccionado(null))
          }
          await fetchAutores(paginaActual, busquedaAutor)
          if (onAutorEliminado) {
            onAutorEliminado(id)
          }
        } catch (error: any) {
          const msg = 'No se pudo eliminar al autor seleccionado.'
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
      canEliminarAutor,
      dispatch,
      fetchAutores,
      paginaActual,
      busquedaAutor,
      onAutorEliminado,
      verificarAccionEnServidor,
    ],
  )

  return {
    isVisible,
    isControlled,
    handleOpen,
    handleClose,
    listaAutores,
    setListaAutores: handleSetListaAutores,
    autoresFiltrados: listaAutores,
    loadingAutores,
    setLoadingAutores,
    busquedaAutor,
    setBusquedaAutor,
    autorSeleccionado,
    setAutorSeleccionado: handleSetAutorSeleccionado,
    autorEnEdicion,
    setAutorEnEdicion,
    nombreAutor,
    setNombreAutor,
    guardando,
    handleGuardarAutor,
    handleEliminarAutor,
    handleElminiarAutor: handleEliminarAutor, // Alias de compatibilidad
    fetchAutores,
    handleRecargar,
    paginaActual,
    totalPaginas,
    totalAutores,
    totalFiltrados: totalAutores,
    handlePageChange,
    canCrearAutor,
    canGuardarAutor,
    canEditarAutor,
    canActualizarAutor,
    canEliminarAutor,
    canVerInfoAutor,
    verificarAccionEnServidor,
  }
}

export default useAutor
