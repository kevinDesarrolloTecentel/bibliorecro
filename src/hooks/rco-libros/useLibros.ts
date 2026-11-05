import { useCallback, useEffect, useRef, useState } from 'react'
import Swal from 'sweetalert2'
import { Libros } from '@/models/rco/libros'
import { formatFecha } from '@/utils/dateUtils'
import {
  ActivarLibro,
  BuscarLibros,
  BuscarLibrosFiltros,
  EliminarLibro,
} from '@/Service/rco/Libros'
import { usePermissions } from '@/context/PermissionsContext'

export type LibroItem = Libros

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
  const enPrestamoRaw = libro.EN_PRESTAMO ?? libro.prestamo ?? 0
  const estadoPrestamoStr = String(
    libro.ESTADOS_PRESTAMO || libro.ESTADO_PRESTAMO || libro.Disponibilidad || '',
  )
    .toLowerCase()
    .trim()
  return (
    Number(enPrestamoRaw) === 1 ||
    estadoPrestamoStr === 'prestamo' ||
    estadoPrestamoStr === 'en prestamo' ||
    estadoPrestamoStr === 'en préstamo' ||
    estadoPrestamoStr.includes('préstamo') ||
    estadoPrestamoStr.includes('prestamo')
  )
}

export const useLibro = () => {
  const { canDoAction, verificarAccionEnServidor } = usePermissions()
  const canCrearLibro = canDoAction('btn_crear_libro')
  const canEditarLibro = canDoAction('btn_editar_libro')
  const canInactivarLibro = canDoAction('btn_inactivar_libro')
  const canActivarLibro = canDoAction('btn_activar_libro')
  const canEliminarLibro = canDoAction('btn_eliminar_libro')
  const canMostrarInfoLibro = canDoAction('btn_mostrar_info_libro')
  const canGuardarLibro = canDoAction('btn_guardar_libro')
  const canActualizarLibro = canDoAction('btn_actualizar_libro')
  const canConfirmarInactivarLibro = canDoAction('btn_confirmar_inactivar')

  const [libros, setLibros] = useState<Libros[]>([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
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
  const [libroSeleccionado, setLibroSeleccionado] = useState<Libros | null>(null)
  const [modalInactivar, setModalInactivar] = useState(false)
  const [libroAInactivar, setLibroAInactivar] = useState<Libros | null>(null)

  const [details, setDetails] = useState<(string | number)[]>([])

  const toggleDetails = (id: string | number) => {
    setDetails((prev) => (prev.includes(id) ? [] : [id]))
  }

  const parseLibro = (item: any, index: number): Libros => {
    const id = item.ID_LIBROS ?? item.id ?? index + 1
    const estadoLibroRaw = item.ESTADO_LIBROS ?? item.estado ?? 1
    const enPrestamoRaw = item.EN_PRESTAMO ?? item.prestamo ?? 0

    const isbn = item.ISBN_LIBROS || item.isbn || 'S/N'
    const titulo = item.TITULO_LIBROS || item.titulo || '-'
    const autor = item.NOMBRE_AUTOR || item.autor || 'Sin autor'
    const categoria = item.NOMBRE_CATEGORIA || item.categoria || 'Sin categoría'
    const editorial = item.NOMBRE_EDITORIAL || item.editorial || 'Sin editorial'
    const proveedor = item.NOMBRE_PROVEEDOR || item.proveedor || 'Sin proveedor'
    const formatos = item.NOMBRE_FORMATOS || item.formato || 'Libros'
    const tipo = item.NOMBRE_TIPO || item.tipo || 'General'
    const genero = item.NOMBRE_RCOGENERO || item.genero || 'Sin género'
    const disponibilidad = Number(enPrestamoRaw) === 0 ? 'Disponible' : 'En préstamo'
    const estado = Number(estadoLibroRaw) === 1 ? 'Activo' : 'Inactivo'
    const fechaEdicion = item.FECHA_EDICION_FORMAT || (item.FECHAEDICION_LIBROS ? formatFecha(item.FECHAEDICION_LIBROS) : '-')
    const fechaRegistro = item.FECHA_REGISTRO_FORMAT || (item.FECHAREGISTRO_LIBROS ? formatFecha(item.FECHAREGISTRO_LIBROS) : '-')

    return {
      ...item,
      id,
      ID_LIBROS: id,
      ISBN_LIBROS: isbn,
      TITULO_LIBROS: titulo,
      NOMBRE_AUTOR: autor,
      NOMBRE_CATEGORIA: categoria,
      NOMBRE_EDITORIAL: editorial,
      NOMBRE_PROVEEDOR: proveedor,
      NOMBRE_FORMATOS: formatos,
      NOMBRE_TIPO: tipo,
      NOMBRE_RCOGENERO: genero,
      ESTADOS_PRESTAMO: disponibilidad,
      ESTADO: estado,
      ESTADO_LIBROS: Number(estadoLibroRaw),
      ID_CATEGORIA: item.ID_CATEGORIA ?? item.id_categoria,
      ID_EDITORIAL: item.ID_EDITORIAL ?? item.id_editorial,
      ID_PROVEEDOR: item.ID_PROVEEDOR ?? item.id_proveedor,
      ID_RCOGENERO: item.ID_RCOGENERO ?? item.id_rcogenero ?? item.ID_GENERO,
      ID_FORMATOS: item.ID_FORMATOS ?? item.id_formatos,
      ID_TIPO: item.ID_TIPO ?? item.id_tipo,
      ID_AUTOR: item.ID_AUTOR ?? item.id_autor,
      FECHAEDICION_LIBROS_RAW: item.FECHAEDICION_LIBROS,
      FECHAREGISTRO_LIBROS_RAW: item.FECHAREGISTRO_LIBROS,
      FECHAEDICION_LIBROS: fechaEdicion,
      FECHAREGISTRO_LIBROS: fechaRegistro,
      MOTIVO_BAJA_LIBRO: item.MOTIVO_BAJA_LIBRO ?? item.motivo_baja_libro ?? null,
      MotivoBaja: item.MOTIVO_BAJA_LIBRO ?? item.motivo_baja_libro ?? null,
      // Compatibilidad con accesores tradicionales
      ISBN: isbn,
      Titulo: titulo,
      Autor: autor,
      Categoria: categoria,
      Editorial: editorial,
      Proveedor: proveedor,
      Formatos: formatos,
      Tipo: tipo,
      Genero: genero,
      Disponibilidad: disponibilidad,
      Estado: estado,
      FechaEdicion: fechaEdicion,
      FechaRegistro: fechaRegistro,
      Pais: item.PAIS_LIBROS || item.pais || '-',
      Precio: item.PRECIO_LIBROS ?? item.precio ?? 0,
      Volumen: item.VOLUMEN_LIBROS || item.volumen || '-',
      CodigoBarras: item.CODIGODEBARRAS_LIBROS || item.codigo || 'S/C',
      TituloTejuelo: item.TITULOTEJUELO_LIBROS || item.titulo_tejuelo || '-',
      AutorTejuelo: item.AUTORTEJUELO_LIBROS || item.autor_tejuelo || '-',
      Descripcion: item.DESCRIPCION_LIBROS || item.descripcion || 'Sin descripción',
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
        const response = await BuscarLibros(query, targetPage, undefined, filters)
        const rawData = response?.data || []
        const pagination = response?.pagination

        const parsedList = rawData.map(parseLibro)
        setLibros(parsedList)

        setCurrentPage(pagination?.current_page || targetPage)
        currentPageRef.current = pagination?.current_page || targetPage
        setTotalPages(pagination?.last_page || 1)
        setTotalItems(pagination?.total || parsedList.length)
      } catch (error) {
        console.error('Error al obtener libros:', error)
        setLibros([])
      } finally {
        setLoading(false)
      }
    },
    [],
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
      setCurrentPage(1)
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
    setCurrentPage(1)
    setTableKey((k) => k + 1)
    setDetails([])
    await fetchLibros(1, '', { estado_prestamo: undefined, estado_libro: undefined })
  }, [fetchLibros])

  const handlePageChange = (page: number) => {
    currentPageRef.current = page
    setCurrentPage(page)
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

  const handleAbrirEditar = (libro: Libros) => {
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
    setLibroSeleccionado(libro)
    setModalEdit(true)
  }

  const handleAbrirInactivar = (libro: Libros) => {
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

  const handleActivarLibro = async (libro: Libros) => {
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

    const id = libro.ID_LIBROS ?? libro.id
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

  const handleEliminarLibro = async (libro?: Libros) => {
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

    const id = target.ID_LIBROS ?? target.id
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
    setLibroSeleccionado,
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

export const useLibroReg = useLibro
export default useLibro