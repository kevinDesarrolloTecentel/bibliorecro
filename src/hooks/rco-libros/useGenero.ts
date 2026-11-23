import { useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Swal from 'sweetalert2'
import { GeneroLib } from '@/models/rco/genero.model'
import { ActualizarGenLib, EliminarGenLib, ListarGeneroLib, NuevoGenLib } from '@/Service/rco/GenLib'
import { usePermissions } from '@/hooks/auth/usePermissions'
import { RootState, AppDispatch } from '@/store'
import {
  setGeneros,
  setGeneroSeleccionado,
  addGenero,
  updateGenero,
  removeGenero,
} from '@/slices/detallesLibroSlice'

export type GeneroLItem = GeneroLib
export type GeneroItem = GeneroLib

export interface UseGeneroLProps {
  autoFetch?: boolean
  visible?: boolean
  setVisible?: (visible?: boolean) => void
  onGenerolCreado?: (generolNuevo: GeneroLib) => void
  onGenerolActualizado?: (generolActualizado: GeneroLib) => void
  onGenerolEliminado?: (id: number | string) => void
  onGeneroCreado?: (generolNuevo: GeneroLib) => void
  onGeneroActualizado?: (generolActualizado: GeneroLib) => void
  onGeneroEliminado?: (id: number | string) => void
}

export type UseGeneroProps = UseGeneroLProps

export const useGeneroL = ({
  autoFetch = true,
  visible: visibleProp,
  setVisible: setVisibleProp,
  onGenerolCreado,
  onGenerolActualizado,
  onGenerolEliminado,
  onGeneroCreado,
  onGeneroActualizado,
  onGeneroEliminado,
}: UseGeneroLProps = {}) => {
  const dispatch = useDispatch<AppDispatch>()
  const { generos: listaGenerol, generoSeleccionado } = useSelector(
    (state: RootState) => state.detallesLibro,
  )

  const generoSeleccionadoRef = useRef(generoSeleccionado)
  useEffect(() => {
    generoSeleccionadoRef.current = generoSeleccionado
  }, [generoSeleccionado])

  const { canDoAction, verificarAccionEnServidor } = usePermissions()

  const canCrearGenero = canDoAction('btn_crear_genero')
  const canGuardarGenero = canDoAction('btn_guardar_genero')
  const canEditarGenero = canDoAction('btn_editar_genero')
  const canActualizarGenero = canDoAction('btn_actualizar_genero')
  const canEliminarGenero = canDoAction('btn_eliminar_genero')
  const canVerInfoGenero = canDoAction('btn_ver_info_genero')

  const notifyCreado = onGenerolCreado || onGeneroCreado
  const notifyActualizado = onGenerolActualizado || onGeneroActualizado
  const notifyEliminado = onGenerolEliminado || onGeneroEliminado

  const [internalVisible, setInternalVisible] = useState(false)
  const isControlled = typeof visibleProp === 'boolean'
  const isVisible = isControlled ? visibleProp : internalVisible

  const [loadingGenerol, setLoadingGenerol] = useState(false)
  const [busquedaGenerol, setBusquedaGenerol] = useState('')
  const [generoEnEdicion, setGeneroEnEdicion] = useState<GeneroLib | null>(null)

  const [nombreGenerol, setNombreGenerol] = useState('')
  const [guardando, setGuardando] = useState(false)

  // Paginación 100% de servidor
  const [paginaActual, setPaginaActual] = useState(1)
  const [totalPaginas, setTotalPaginas] = useState(1)
  const [totalGeneros, setTotalGeneros] = useState(0)

  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null)
  const isFirstRender = useRef(true)

  const handleSetGeneroSeleccionado = useCallback(
    (gen: GeneroLib | null | ((prev: GeneroLib | null) => GeneroLib | null)) => {
      if (typeof gen === 'function') {
        dispatch(setGeneroSeleccionado(gen(generoSeleccionadoRef.current)))
      } else {
        dispatch(setGeneroSeleccionado(gen))
      }
    },
    [dispatch],
  )

  const handleSetListaGenerol = useCallback(
    (list: GeneroLib[] | ((prev: GeneroLib[]) => GeneroLib[])) => {
      if (typeof list === 'function') {
        dispatch(setGeneros(list(listaGenerol)))
      } else {
        dispatch(setGeneros(list))
      }
    },
    [dispatch, listaGenerol],
  )

  const fetchGenerol = useCallback(
    async (page: number = 1, searchQuery: string = '', preserveSelection: boolean = true) => {
      setLoadingGenerol(true)
      try {
        const q = searchQuery.trim()
        const response = await ListarGeneroLib({ page, search: q, per_page: 10 })
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
        } else if (Array.isArray(response?.generol)) {
          rawList = response.generol
          total = rawList.length
          lastPage = 1
        }

        // Mapeo canónico exacto de BD (sin parches ni alias)
        const parsedList: GeneroLib[] = rawList.map((item: any) => ({
          id: item.ID_RCOGENERO,
          ID_RCOGENERO: item.ID_RCOGENERO,
          NOMBRE_RCOGENERO: String(item.NOMBRE_RCOGENERO ?? '').trim(),
          FECHAINGRESO_RCOGENERO: item.FECHAINGRESO_RCOGENERO ?? null,
        }))

        dispatch(setGeneros(parsedList))
        setTotalGeneros(total)
        setTotalPaginas(Math.max(1, lastPage))
        setPaginaActual(page)

        if (preserveSelection && generoSeleccionadoRef.current) {
          const prevId = String(
            generoSeleccionadoRef.current.ID_RCOGENERO ??
            generoSeleccionadoRef.current.id,
          )
          const matched = parsedList.find(
            (g) => String(g.ID_RCOGENERO ?? g.id) === prevId,
          )
          dispatch(setGeneroSeleccionado(matched || null))
        } else if (!preserveSelection) {
          dispatch(setGeneroSeleccionado(null))
        }
      } catch (error: any) {
        console.error('Error al cargar géneros desde la API:', error)
      } finally {
        setLoadingGenerol(false)
      }
    },
    [dispatch],
  )

  // Carga inicial
  useEffect(() => {
    if (autoFetch) {
      fetchGenerol(1, '')
    }
  }, [autoFetch, fetchGenerol])

  // Búsqueda con debounce en servidor (400ms) evitando doble fetch en primer render
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current)
    }
    searchDebounceRef.current = setTimeout(() => {
      fetchGenerol(1, busquedaGenerol, true)
    }, 400)

    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current)
      }
    }
  }, [busquedaGenerol, fetchGenerol])

  const handlePageChange = useCallback(
    (page: number) => {
      if (page >= 1 && page <= totalPaginas && page !== paginaActual) {
        fetchGenerol(page, busquedaGenerol, true)
      }
    },
    [fetchGenerol, busquedaGenerol, totalPaginas, paginaActual],
  )

  const handleRecargar = useCallback(async () => {
    setBusquedaGenerol('')
    dispatch(setGeneroSeleccionado(null))
    await fetchGenerol(1, '', false)
  }, [fetchGenerol, dispatch])

  const handleOpen = useCallback(
    (genero?: GeneroLib) => {
      if (genero) {
        if (!canEditarGenero) {
          Swal.fire({
            icon: 'error',
            title: 'Acceso Denegado',
            text: 'No tienes permisos para editar el género.',
            confirmButtonColor: '#dc3545',
            confirmButtonText: 'Entendido',
          })
          return
        }
        setGeneroEnEdicion(genero)
        setNombreGenerol(genero.NOMBRE_RCOGENERO || '')
      } else {
        if (!canCrearGenero) {
          Swal.fire({
            icon: 'error',
            title: 'Acceso Denegado',
            text: 'No tienes permisos para crear géneros.',
            confirmButtonColor: '#dc3545',
            confirmButtonText: 'Entendido',
          })
          return
        }
        setGeneroEnEdicion(null)
        setNombreGenerol('')
      }

      if (setVisibleProp) {
        setVisibleProp(true)
      } else {
        setInternalVisible(true)
      }
    },
    [canCrearGenero, canEditarGenero, setVisibleProp],
  )

  const handleClose = useCallback(() => {
    if (setVisibleProp) {
      setVisibleProp(false)
    } else {
      setInternalVisible(false)
    }
    setGeneroEnEdicion(null)
    setNombreGenerol('')
  }, [setVisibleProp])

  const handleGuardarGenero = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault()

      if (!nombreGenerol.trim()) {
        Swal.fire({
          icon: 'warning',
          title: 'Campo requerido',
          text: 'Por favor ingrese el nombre del género.',
          confirmButtonColor: '#dc3545',
          confirmButtonText: 'Entendido',
        })
        return
      }

      if (generoEnEdicion) {
        if (!canActualizarGenero) {
          Swal.fire({
            icon: 'error',
            title: 'Acceso Denegado',
            text: 'No tienes permisos para actualizar el género.',
            confirmButtonColor: '#dc3545',
            confirmButtonText: 'Entendido',
          })
          return
        }
        const tienePermiso = await verificarAccionEnServidor('btn_actualizar_genero')
        if (!tienePermiso) {
          Swal.fire({
            icon: 'error',
            title: 'Acceso Denegado',
            text: 'No tienes permisos para actualizar el género.',
            confirmButtonColor: '#dc3545',
            confirmButtonText: 'Entendido',
          })
          return
        }
      } else {
        if (!canGuardarGenero) {
          Swal.fire({
            icon: 'error',
            title: 'Acceso Denegado',
            text: 'No tienes permisos para guardar nuevos géneros.',
            confirmButtonColor: '#dc3545',
            confirmButtonText: 'Entendido',
          })
          return
        }
        const tienePermiso = await verificarAccionEnServidor('btn_guardar_genero')
        if (!tienePermiso) {
          Swal.fire({
            icon: 'error',
            title: 'Acceso Denegado',
            text: 'No tienes permisos para guardar nuevos géneros.',
            confirmButtonColor: '#dc3545',
            confirmButtonText: 'Entendido',
          })
          return
        }
      }

      setGuardando(true)
      try {
        const payload = {
          NOMBRE_RCOGENERO: nombreGenerol.trim(),
        }

        if (generoEnEdicion) {
          const id = generoEnEdicion.ID_RCOGENERO ?? generoEnEdicion.id ?? ''
          await ActualizarGenLib(id, payload)

          Swal.fire({
            icon: 'success',
            title: '¡Género actualizado!',
            text: 'El género fue actualizado correctamente.',
            timer: 1800,
            showConfirmButton: false,
          })

          const generoActualizado: GeneroLib = {
            ...generoEnEdicion,
            ...payload,
          }
          dispatch(updateGenero(generoActualizado))
          await fetchGenerol(paginaActual, busquedaGenerol)
          if (notifyActualizado) {
            notifyActualizado(generoActualizado)
          }
        } else {
          const res = await NuevoGenLib(payload)

          Swal.fire({
            icon: 'success',
            title: '¡Género registrado!',
            text: 'El género fue registrado con éxito.',
            timer: 1800,
            showConfirmButton: false,
          })

          const generoNuevo: GeneroLib = res?.data || res
          if (generoNuevo) {
            dispatch(addGenero(generoNuevo))
          }
          await fetchGenerol(1, '')
          if (notifyCreado && generoNuevo) {
            notifyCreado(generoNuevo)
          }
        }

        handleClose()
      } catch (error: any) {
        const errorMsg =
          error?.response?.data?.message ||
          'Error al procesar la solicitud con el servidor.'
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
      nombreGenerol,
      generoEnEdicion,
      canActualizarGenero,
      canGuardarGenero,
      dispatch,
      fetchGenerol,
      paginaActual,
      busquedaGenerol,
      notifyActualizado,
      notifyCreado,
      handleClose,
      verificarAccionEnServidor,
    ],
  )

  const handleEliminarGenero = useCallback(
    async (genParam?: GeneroLib) => {
      if (!canEliminarGenero) {
        Swal.fire({
          icon: 'error',
          title: 'Acceso Denegado',
          text: 'No tienes permisos para eliminar géneros.',
          confirmButtonColor: '#dc3545',
          confirmButtonText: 'Entendido',
        })
        return
      }

      const gen = genParam || generoSeleccionadoRef.current
      if (!gen) return

      const id = gen.ID_RCOGENERO ?? gen.id
      if (!id) return

      const confirmResult = await Swal.fire({
        title: '¿Eliminar género?',
        text: `¿Estás seguro de que deseas eliminar el género "${gen.NOMBRE_RCOGENERO}"?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
      })

      if (confirmResult.isConfirmed) {
        const tienePermiso = await verificarAccionEnServidor('btn_eliminar_genero')
        if (!tienePermiso) {
          Swal.fire({
            icon: 'error',
            title: 'Acceso Denegado',
            text: 'No tienes permisos para eliminar géneros.',
            confirmButtonColor: '#dc3545',
            confirmButtonText: 'Entendido',
          })
          return
        }

        try {
          await EliminarGenLib(id)
          Swal.fire({
            icon: 'success',
            title: '¡Género eliminado!',
            text: 'El género fue eliminado con éxito.',
            timer: 1800,
            showConfirmButton: false,
          })
          dispatch(removeGenero(id))
          if (
            generoSeleccionadoRef.current &&
            String(
              generoSeleccionadoRef.current.ID_RCOGENERO ??
              generoSeleccionadoRef.current.id,
            ) === String(id)
          ) {
            dispatch(setGeneroSeleccionado(null))
          }
          await fetchGenerol(paginaActual, busquedaGenerol)
          if (notifyEliminado) {
            notifyEliminado(id)
          }
        } catch (error: any) {
          const msg =
            error?.response?.data?.message ||
            error?.response?.message ||
            error?.message ||
            'Error al intentar eliminar el género.'

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
      canEliminarGenero,
      dispatch,
      fetchGenerol,
      paginaActual,
      busquedaGenerol,
      notifyEliminado,
      verificarAccionEnServidor,
    ],
  )

  return {
    isVisible,
    isControlled,
    loadingGenerol,
    loadingGeneros: loadingGenerol,
    setLoadingGenerol,
    setLoadingGeneros: setLoadingGenerol,
    busquedaGenerol,
    busquedagenero: busquedaGenerol,
    busquedaGenero: busquedaGenerol,
    setBusquedaGenerol,
    setBusquedaGenero: setBusquedaGenerol,
    listaGenerol,
    listaGeneros: listaGenerol,
    setListaGenerol: handleSetListaGenerol,
    setListaGeneros: handleSetListaGenerol,
    generoSeleccionado,
    setGeneroSeleccionado: handleSetGeneroSeleccionado,
    generoEnEdicion,
    setGeneroEnEdicion,
    nombreGenerol,
    nombreGenero: nombreGenerol,
    setNombreGenerol,
    setNombreGenero: setNombreGenerol,
    guardando,
    handleOpen,
    handleClose,
    generolFiltrado: listaGenerol,
    generoFiltrados: listaGenerol,
    generoPaginados: listaGenerol,
    handleGuardarGenero,
    handleEliminarGnerol: handleEliminarGenero,
    handleEliminarGenero,
    fetchGenerol,
    fetchGeneros: fetchGenerol,
    handleRecargar,
    paginaActual,
    totalPaginas,
    totalGeneros,
    totalFiltrados: totalGeneros,
    handlePageChange,
    canCrearGenero,
    canGuardarGenero,
    canEditarGenero,
    canActualizarGenero,
    canEliminarGenero,
    canVerInfoGenero,
    verificarAccionEnServidor,
    onGenerolCreado,
    onGenerolActualizado,
    onGenerolEliminado,
    onGeneroCreado,
    onGeneroActualizado,
    onGeneroEliminado,
  }
}

export const useGenero = useGeneroL
export default useGeneroL
