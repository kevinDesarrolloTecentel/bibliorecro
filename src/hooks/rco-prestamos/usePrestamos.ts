import { useCallback, useEffect, useRef, useState } from 'react'
import Swal from 'sweetalert2'
import { PrestamoItem } from '@/models/rco/prestamos'
import { CambioEstado, ExtenderFecha, buscarPrestamos } from '@/Service/rco/Prestamos'


export const getBadgeColor = (status: string | number): string => {
  const s = String(status || '').toLowerCase().trim()
  if (
    s === 'en prestamo' ||
    s === 'en préstamo' ||
    s === '1' ||
    s === 'activo'
  ) {
    return 'success'
  }
  if (s === 'devuelto' || s === 'disponible' || s === '0') {
    return 'info'
  }
  if (
    s === 'no devuelto' ||
    s === 'no_devuelto' ||
    s === '2' ||
    s === 'dañado' ||
    s === 'sancionado' ||
    s === 'caducado'
  ) {
    return 'danger'
  }
  return 'primary'
}

const formatDate = (val: any): string => {
  if (!val) return '-'
  try {
    const d = new Date(val)
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString()
    }
  } catch {
    return String(val)
  }
  return String(val)
}

export const usePrestamos = (autoFetch: boolean = true) => {
  const [prestamos, setPrestamos] = useState<PrestamoItem[]>([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeQuery, setActiveQuery] = useState('')
  const [tableKey, setTableKey] = useState(0)

  const currentSearchRef = useRef<string>('')
  const searchDebounceRef = useRef<any>(null)

  const [modalRegister, setModalRegister] = useState(false)
  const [details, setDetails] = useState<(string | number)[]>([])

  const toggleDetails = (id: string | number) => {
    setDetails((prev) => (prev.includes(id) ? [] : [id]))
  }

  const fetchPrestamos = useCallback(
    async (pageToFetch?: number, queryToSearch?: string) => {
      setLoading(true)
      const targetPage = typeof pageToFetch === 'number' && pageToFetch > 0 ? pageToFetch : currentPage
      const query = typeof queryToSearch === 'string' ? queryToSearch : currentSearchRef.current
      try {
        const response = await buscarPrestamos(query, targetPage)
        const rawData = response?.data || []

        const parsedList: PrestamoItem[] = rawData.map((item: any, index: number) => {
          const id = item.ID_PRESTAMO ?? item.id ?? index + 1
          const estadoPrestamo = item.ESTADO_PRESTAMO ?? 1
          const status = Number(estadoPrestamo) === 1 ? 'En préstamo' : 'Disponible'

          return {
            id,
            ID_PRESTAMO: id,
            ID_LIBROS: item.ID_LIBROS,
            ID_INSCRIPCION: item.ID_INSCRIPCION,
            Libro: item.TITULO_LIBROS || 'Sin título',
            ISBN: item.ISBN_LIBROS || 'S/N',
            Nombres: item.NOMBRE_PERSONA || '',
            Apellidos: item.APELLIDO_PERSONA || '',
            Cedula: item.IDENTIFICACION_PERSONA || '-',
            Telefono: item.TELEFONO_PERSONA || '-',
            Celular: item.CELULAR_PERSONA || '-',
            Fecha_prestamo: formatDate(item.FECHAINICIO_PRESTAMO),
            Fecha_entrega: formatDate(item.FECHAFIN_PRESTAMO),
            status,
            ESTADO_PRESTAMO: item.ESTADO_PRESTAMO,
            EXTENDER_PRESTAMO: item.EXTENDER_PRESTAMO,
            Detalle: item.DETALLE_PRESTAMO || '',
            raw: item,
          }
        })

        setPrestamos(parsedList)
        setCurrentPage(response?.current_page || targetPage)
        setTotalPages(response?.last_page || 1)
        setTotalItems(response?.total || rawData.length)
      } catch (err) {
        console.error('Error al obtener préstamos:', err)
        setPrestamos([])
      } finally {
        setLoading(false)
      }
    },
    [currentPage],
  )

  useEffect(() => {
    if (autoFetch) {
      fetchPrestamos(1, '')
    }
  }, [autoFetch])

  const handleBuscarGlobal = useCallback(
    (busqueda: string) => {
      const q = busqueda.trim()
      currentSearchRef.current = q
      setSearchTerm(q)

      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current)
      }

      searchDebounceRef.current = setTimeout(() => {
        fetchPrestamos(1, q)
      }, 350)
    },
    [fetchPrestamos],
  )

  const handleRecargar = useCallback(async () => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current)
    }
    currentSearchRef.current = ''
    setSearchTerm('')
    setTableKey((k) => k + 1)
    setDetails([])
    await fetchPrestamos(1, '')
  }, [fetchPrestamos])

  const handleBuscar = () => {
    const q = searchTerm.trim()
    setActiveQuery(q)
    fetchPrestamos(1, q)
  }

  const handleLimpiarBusqueda = () => {
    handleRecargar()
  }

  const handlePageChange = (page: number) => {
    fetchPrestamos(page, currentSearchRef.current)
  }

  const handlePrestamoCreado = () => {
    fetchPrestamos(1, currentSearchRef.current)
  }

  const handleExtenderPrestamo = async (item: PrestamoItem) => {
    const id = item.ID_PRESTAMO ?? item.id
    if (!id) return

    const confirmResult = await Swal.fire({
      title: 'Confirmar',
      text: `¿Estás seguro de extender la fecha de préstamo para "${item.Libro}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#044c8c',
      cancelButtonColor: '#e4342c',
      confirmButtonText: 'Sí, extender',
      cancelButtonText: 'Cancelar',
    })

    if (!confirmResult.isConfirmed) return

    try {
      await ExtenderFecha(id)
      Swal.fire({
        icon: 'success',
        title: '¡Éxito!',
        text: 'Fecha de préstamo extendida con éxito.',
        confirmButtonColor: '#04833c',
      })
      fetchPrestamos()
    } catch (err: any) {
      console.error(err)
      if (
        err?.response?.data?.error === 'El libro ya está en préstamo'
      ) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'El libro ya está en préstamo.',
        })
      } else if (err?.response?.data?.message) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.response.data.message,
        })
      } else {
        Swal.fire({
          icon: 'info',
          title: 'Fecha de préstamo ya está extendida',
          confirmButtonColor: '#044c8c',
          text: err?.response?.data?.error || 'No se pudo extender el préstamo.',
        })
      }
    }
  }

  const handleMarcarNoDevuelto = async (item: PrestamoItem) => {
    const idPrestamo = item.ID_PRESTAMO ?? item.id
    const idLibro = item.ID_LIBROS ?? item.raw?.ID_LIBROS
    if (!idPrestamo) return

    const confirmResult = await Swal.fire({
      title: 'Confirmar',
      text: `¿Estás seguro de que deseas marcar este libro ("${item.Libro}") como dado de baja?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#044c8c',
      cancelButtonColor: '#e4342c',
      confirmButtonText: 'Sí, marcar como dado de baja',
      cancelButtonText: 'Cancelar',
    })

    if (!confirmResult.isConfirmed) return

    try {
      await CambioEstado(idPrestamo, idLibro)
      Swal.fire({
        icon: 'success',
        title: '¡Éxito!',
        text: 'El libro ha sido marcado como dado de baja exitosamente.',
        confirmButtonColor: '#04833c',
      })
      fetchPrestamos()
    } catch (err: any) {
      console.error(err)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err?.response?.data?.message || 'Hubo un error al guardar los datos.',
      })
    }
  }

  return {
    prestamos,
    loading,
    currentPage,
    totalPages,
    totalItems,
    searchTerm,
    setSearchTerm,
    activeQuery,
    handleBuscar,
    handleLimpiarBusqueda,
    handlePageChange,
    fetchPrestamos,
    modalRegister,
    setModalRegister,
    details,
    toggleDetails,
    handlePrestamoCreado,
    handleExtenderPrestamo,
    handleMarcarNoDevuelto,
    getBadgeColor,
    tableKey,
    handleBuscarGlobal,
    handleRecargar,

    paginaActual: currentPage,
    totalPaginas: totalPages,
    totalRegistros: totalItems,
    porPagina: 10,
  }
}

export default usePrestamos
