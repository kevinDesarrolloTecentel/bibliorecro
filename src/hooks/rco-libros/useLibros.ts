import { useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Swal from 'sweetalert2'
import { RootState, AppDispatch } from '@/store'
import {
  setLibros as setLibrosSlice,
  setLibroSeleccionado as setLibroSeleccionadoSlice,
  setPaginacionLibros,
  LibroItem,
} from '@/slices/libroSlice'
import type { RcoLibros } from '@/models/rco/libros.model'
import { formatFecha } from '@/utils/dateUtils'
import {
  ActivarLibro,
  BuscarLibros,
  EliminarLibro,
} from '@/Service/rco/Libros'
import { usePermissions } from '@/hooks/auth/usePermissions'

export interface BuscarLibrosFiltros {
  estado_prestamo?: string | null
  estado_libro?: string | null
}

export const getBadgeEstado = (status: any): string => {
  const s = String(status || '').toLowerCase().trim()
  if (s === 'activo' || s === '1') return 'success'
  if (s === 'inactivo' || s === '0') return 'secondary'
  return 'secondary'
}

export const getBadgeDisponibilidad = (status: any): string => {
  const s = String(status || '').toLowerCase().trim()
  if (s === 'disponible' || s === '0') return 'success'
  if (s === 'en préstamo' || s === 'en prestamo' || s === '1') return 'danger'
  return 'primary'
}

export const isLibroEnPrestamo = (libro: any): boolean => {
  if (!libro) return false
  return (
    Number(libro.EN_PRESTAMO) === 1 ||
    String(libro.ESTADOS_PRESTAMO || '').toLowerCase().includes('préstamo') ||
    String(libro.ESTADOS_PRESTAMO || '').toLowerCase().includes('prestamo')
  )
}

export const useLibro = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { canDoAction, verificarAccionEnServidor } = usePermissions()

  // Permisos
  const canCrearLibro = canDoAction('btn_crear_libro')
  const canEditarLibro = canDoAction('btn_editar_libro')
  const canInactivarLibro = canDoAction('btn_inactivar_libro')
  const canActivarLibro = canDoAction('btn_activar_libro')
  const canEliminarLibro = canDoAction('btn_eliminar_libro')
  const canMostrarInfoLibro = canDoAction('btn_mostrar_info_libro')
  const canGuardarLibro = canDoAction('btn_guardar_libro')
  const canActualizarLibro = canDoAction('btn_actualizar_libro')
  const canConfirmarInactivarLibro = canDoAction('btn_confirmar_inactivar')

  // Redux Domain State
  const libros = useSelector((state: RootState) => state.libros.libros)
  const libroSeleccionado = useSelector((state: RootState) => state.libros.libroSeleccionado)
  const paginacion = useSelector((state: RootState) => state.libros.paginacionLibros)
  const currentPage = paginacion.current_page
  const totalPages = paginacion.last_page
  const totalItems = paginacion.total

  // UI Ephemeral State
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [tableKey, setTableKey] = useState(0)
  const [columnFilters, setColumnFilters] = useState<BuscarLibrosFiltros>({
    estado_prestamo: '',
    estado_libro: '',
  })
  const columnFiltersRef = useRef<BuscarLibrosFiltros>({
    estado_prestamo: '',
    estado_libro: '',
  })

  const currentPageRef = useRef<number>(1)
  currentPageRef.current = currentPage

  const currentSearchRef = useRef<string>('')
  const searchDebounceRef = useRef<any>(null)

  const [modalRegister, setModalRegister] = useState(false)
  const [modalEdit, setModalEdit] = useState(false)
  const [modalInactivar, setModalInactivar] = useState(false)
  const [libroAInactivar, setLibroAInactivar] = useState<RcoLibros | null>(null)

  const [details, setDetails] = useState<(string | number)[]>([])

  const toggleDetails = (id: string | number) => {
    setDetails((prev) => (prev.includes(id) ? [] : [id]))
  }

  // Parseo canónico sin parches: exclusivamente campos oficiales de la base de datos
  const parseLibro = (item: any): LibroItem => {
    const enPrestamo = Number(item.EN_PRESTAMO ?? 0)
    const estadoLibro = Number(item.ESTADO_LIBROS ?? 1)

    return {
      ID_LIBROS: item.ID_LIBROS,
      ISBN_LIBROS: item.ISBN_LIBROS || 'S/N',
      TITULO_LIBROS: item.TITULO_LIBROS || '-',
      PRECIO_LIBROS: Number(item.PRECIO_LIBROS ?? 0),
      CODIGODEBARRAS_LIBROS: item.CODIGODEBARRAS_LIBROS || 'S/C',
      VOLUMEN_LIBROS: item.VOLUMEN_LIBROS || 'S/V',
      FECHAEDICION_LIBROS: item.FECHAEDICION_LIBROS ? formatFecha(item.FECHAEDICION_LIBROS) : '-',
      PAIS_LIBROS: item.PAIS_LIBROS || 'No indicado',
      DESCRIPCION_LIBROS: item.DESCRIPCION_LIBROS || '',
      FECHAREGISTRO_LIBROS: item.FECHAREGISTRO_LIBROS ? formatFecha(item.FECHAREGISTRO_LIBROS) : '-',
      TITULOTEJUELO_LIBROS: item.TITULOTEJUELO_LIBROS || '-',
      AUTORTEJUELO_LIBROS: item.AUTORTEJUELO_LIBROS || '-',
      ESTADO_LIBROS: estadoLibro,
      MOTIVO_BAJA_LIBRO: item.MOTIVO_BAJA_LIBRO ?? null,
      ID_CATEGORIA: item.ID_CATEGORIA ?? null,
      ID_EDITORIAL: item.ID_EDITORIAL ?? null,
      ID_PROVEEDOR: item.ID_PROVEEDOR ?? null,
      ID_RCOGENERO: item.ID_RCOGENERO ?? null,
      ID_FORMATOS: item.ID_FORMATOS ?? null,
      ID_TIPO: item.ID_TIPO ?? null,
      ID_AUTOR: item.ID_AUTOR ?? null,
      EN_PRESTAMO: enPrestamo,
      NOMBRE_AUTOR: item.NOMBRE_AUTOR || 'Sin autor',
      NOMBRE_CATEGORIA: item.NOMBRE_CATEGORIA || 'Sin categoría',
      NOMBRE_EDITORIAL: item.NOMBRE_EDITORIAL || 'Sin editorial',
      NOMBRE_PROVEEDOR: item.NOMBRE_PROVEEDOR || 'Sin proveedor',
      NOMBRE_FORMATOS: item.NOMBRE_FORMATOS || 'Libros',
      NOMBRE_TIPO: item.NOMBRE_TIPO || 'General',
      NOMBRE_RCOGENERO: item.NOMBRE_RCOGENERO || 'Sin género',
      ESTADOS_PRESTAMO: enPrestamo === 0 ? 'Disponible' : 'En préstamo',
      ESTADO: estadoLibro === 1 ? 'Activo' : 'Inactivo',
    }
  }

  const fetchLibros = useCallback(
    async (
      pageToFetch?: number,
      queryToSearch?: string,
      filtersToApply?: BuscarLibrosFiltros,
    ) => {
      setLoading(true)
      const targetPage =
        typeof pageToFetch === 'number' && pageToFetch > 0 ? pageToFetch : currentPageRef.current
      const query =
        typeof queryToSearch === 'string' ? queryToSearch : currentSearchRef.current
      const filters = filtersToApply || columnFiltersRef.current

      try {
        const payload = {
          busqueda: query,
          estado_prestamo: filters?.estado_prestamo,
          estado_libro: filters?.estado_libro,
        }
        const response = await BuscarLibros(payload, { page: targetPage })
        const rawData = response?.data || []
        const pagination = response?.pagination

        const parsedList = rawData.map(parseLibro)
        dispatch(
          setLibrosSlice({
            data: parsedList,
            pagination,
          }),
        )

        currentPageRef.current = pagination?.current_page || targetPage
      } catch (error) {
        console.error('Error al obtener libros:', error)
        dispatch(setLibrosSlice({ data: [], pagination: { current_page: 1, total: 0, last_page: 1 } }))
      } finally {
        setLoading(false)
      }
    },
    [dispatch],
  )

  useEffect(() => {
    fetchLibros(1, '')
  }, [fetchLibros])

  const handleBuscarGlobal = useCallback(
    (busqueda: string) => {
      const q = busqueda.trim()
      if (q === currentSearchRef.current) return
      currentSearchRef.current = q
      setSearchTerm(q)

      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current)
      }

      searchDebounceRef.current = setTimeout(() => {
        fetchLibros(1, q, columnFiltersRef.current)
      }, 350)
    },
    [fetchLibros],
  )

  const handleColumnFilterChange = useCallback(
    (filters: Record<string, any>) => {
      const rawDisponibilidad =
        filters?.ESTADOS_PRESTAMO !== undefined && filters?.ESTADOS_PRESTAMO !== null
          ? String(filters.ESTADOS_PRESTAMO).trim().toLowerCase()
          : ''
      const rawEstado =
        filters?.ESTADO !== undefined && filters?.ESTADO !== null
          ? String(filters.ESTADO).trim().toLowerCase()
          : ''

      const newFilters: BuscarLibrosFiltros = {
        estado_prestamo: rawDisponibilidad || undefined,
        estado_libro: rawEstado || undefined,
      }

      columnFiltersRef.current = newFilters
      setColumnFilters(newFilters)
      currentPageRef.current = 1

      fetchLibros(1, undefined, newFilters)
    },
    [fetchLibros],
  )

  const handleRecargar = useCallback(async () => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current)
    }
    currentSearchRef.current = ''
    currentPageRef.current = 1
    columnFiltersRef.current = { estado_prestamo: '', estado_libro: '' }
    setColumnFilters({ estado_prestamo: '', estado_libro: '' })
    setSearchTerm('')
    setTableKey((k) => k + 1)
    setDetails([])
    await fetchLibros(1, '', { estado_prestamo: undefined, estado_libro: undefined })
  }, [fetchLibros])

  const handlePageChange = (page: number) => {
    currentPageRef.current = page
    setDetails([])
    dispatch(setPaginacionLibros({ current_page: page }))
    fetchLibros(page, currentSearchRef.current, columnFiltersRef.current)
  }

  const handleAbrirCrear = () => {
    if (!canCrearLibro) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para registrar nuevos libros.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }
    setModalRegister(true)
  }

  const handleAbrirEditar = (libro: RcoLibros) => {
    if (!canEditarLibro) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para editar libros.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }
    dispatch(setLibroSeleccionadoSlice(libro))
    setModalEdit(true)
  }

  const handleAbrirInactivar = (libro: RcoLibros) => {
    if (!canInactivarLibro) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para inactivar libros.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    if (isLibroEnPrestamo(libro)) {
      Swal.fire({
        icon: 'warning',
        title: 'Acción no permitida',
        text: `No se puede inactivar el libro "${libro.TITULO_LIBROS || 'este libro'}" porque actualmente se encuentra en préstamo. Debe registrarse su devolución primero.`,
        confirmButtonColor: '#044c8c',
      })
      return
    }

    setLibroAInactivar(libro)
    setModalInactivar(true)
  }

  const handleInactivarLibro = handleAbrirInactivar

  const handleActivarLibro = async (libro: RcoLibros) => {
    if (!canActivarLibro) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para activar libros.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    if (isLibroEnPrestamo(libro)) {
      Swal.fire({
        icon: 'warning',
        title: 'Acción no permitida',
        text: `No se puede cambiar el estado del libro "${libro.TITULO_LIBROS || 'este libro'}" porque actualmente se encuentra en préstamo.`,
        confirmButtonColor: '#044c8c',
      })
      return
    }

    const id = libro.ID_LIBROS
    if (!id) return

    const confirmResult = await Swal.fire({
      title: 'Confirmar Activar',
      text: `¿Estás seguro de que deseas activar el libro "${libro.TITULO_LIBROS || 'este libro'}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#04833c',
      cancelButtonColor: '#e4342c',
      confirmButtonText: 'Sí, activar',
      cancelButtonText: 'Cancelar',
    })

    if (!confirmResult.isConfirmed) return

    const tienePermiso = await verificarAccionEnServidor('btn_activar_libro')
    if (!tienePermiso) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para activar libros.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    try {
      await ActivarLibro(id)
      Swal.fire({
        icon: 'success',
        title: '¡Libro activado!',
        text: 'El libro ha sido activado correctamente.',
        timer: 1800,
        showConfirmButton: false,
      })
      fetchLibros(currentPageRef.current, currentSearchRef.current)
    } catch (err: any) {
      console.error(err)
      Swal.fire({
        icon: 'error',
        title: 'Error al activar',
        text: err?.response?.data?.message || 'Hubo un error al activar el libro.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
    }
  }

  const handleEliminarLibro = async (libro?: RcoLibros) => {
    if (!canEliminarLibro) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para eliminar libros.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    const target = libro || libroSeleccionado
    if (!target) return

    if (isLibroEnPrestamo(target)) {
      Swal.fire({
        icon: 'warning',
        title: 'Acción no permitida',
        text: `No se puede eliminar el libro "${target.TITULO_LIBROS || 'este libro'}" porque actualmente se encuentra en préstamo. Debe registrarse su devolución primero.`,
        confirmButtonColor: '#044c8c',
      })
      return
    }

    const id = target.ID_LIBROS
    if (!id) return

    const confirmResult = await Swal.fire({
      title: '¿Está Seguro?',
      text: `¡No podrás revertir esto! Se eliminará el libro "${target.TITULO_LIBROS || 'este libro'}".`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#044c8c',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, ¡bórralo!',
      cancelButtonText: 'Cancelar',
    })

    if (!confirmResult.isConfirmed) return

    const tienePermiso = await verificarAccionEnServidor('btn_eliminar_libro')
    if (!tienePermiso) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para eliminar libros.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    try {
      await EliminarLibro(id)
      Swal.fire({
        icon: 'success',
        title: '¡Libro eliminado!',
        text: 'El libro fue eliminado correctamente.',
        timer: 1800,
        showConfirmButton: false,
      })
      fetchLibros(currentPageRef.current, currentSearchRef.current)
    } catch (err: any) {
      console.error(err)
      Swal.fire({
        icon: 'error',
        title: 'Error al eliminar',
        text: err?.response?.data?.message || 'No se pudo eliminar el libro.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
    }
  }

  return {
    libros,
    loading,
    currentPage,
    totalPages,
    totalItems,
    searchTerm,
    setSearchTerm,
    tableKey,
    columnFilters,
    handleColumnFilterChange,
    handleBuscarGlobal,
    handleRecargar,
    handlePageChange,
    fetchLibros,
    modalRegister,
    setModalRegister,
    modalEdit,
    setModalEdit,
    libroSeleccionado,
    setLibroSeleccionado: (l: RcoLibros | null) => dispatch(setLibroSeleccionadoSlice(l)),
    details,
    setDetails,
    toggleDetails,
    handleAbrirCrear,
    handleAbrirEditar,
    modalInactivar,
    setModalInactivar,
    libroAInactivar,
    setLibroAInactivar,
    handleAbrirInactivar,
    handleInactivarLibro,
    handleActivarLibro,
    handleEliminarLibro,
    getBadgeEstado,
    getBadgeDisponibilidad,
    isLibroEnPrestamo,
    canCrearLibro,
    canEditarLibro,
    canInactivarLibro,
    canActivarLibro,
    canEliminarLibro,
    canMostrarInfoLibro,
    canGuardarLibro,
    canActualizarLibro,
    canConfirmarInactivarLibro,
    verificarAccionEnServidor,
  }
}

export default useLibro
