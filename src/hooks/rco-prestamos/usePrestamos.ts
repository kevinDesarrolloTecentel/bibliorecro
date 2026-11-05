import { useCallback, useEffect, useRef, useState } from 'react'
import Swal from 'sweetalert2'
import { PrestamoItem } from '@/models/rco/prestamos'
import { CambioEstadoLibro, ExtenderFecha, buscarPrestamos } from '@/Service/rco/Prestamos'
import { ActualizarEstado } from '@/Service/rco/Libros'
import { formatFecha } from '@/utils/dateUtils'
import { usePermissions } from '@/context/PermissionsContext'

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
    s.includes('sancion') ||
    s.includes('sanción') ||
    s === 'caducado'
  ) {
    return 'danger'
  }
  return 'primary'
}

export const usePrestamos = (autoFetch: boolean = true) => {
  const { canDoAction, verificarAccionEnServidor } = usePermissions()

  const canCrearPrestamo = canDoAction('btn_crear_prestamo')
  const canExtenderPrestamo = canDoAction('btn_extender_prestamo')
  const canNoDevuelto = canDoAction('btn_no_devuelto')
  const canRegistrarDevolucion = canDoAction('btn_registrar_devolucion')
  const canDevolverSancion = canDoAction('btn_devolver_sancion')
  const canGuardarPrestamo = canDoAction('btn_guardar_prestamo')
  const canGuardarDevolverSancion = canDoAction('btn_guardar_devolver_sancion')
  const canMostrarInfoPrestamo = canDoAction('btn_mostrar_info_prestamo')
  const canConfirmarDarBaja = canDoAction('btn_confirmar_dar_baja')

  const [prestamos, setPrestamos] = useState<PrestamoItem[]>([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeQuery, setActiveQuery] = useState('')
  const [tableKey, setTableKey] = useState(0)

  const currentPageRef = useRef<number>(1)
  currentPageRef.current = currentPage

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
      const targetPage = typeof pageToFetch === 'number' && pageToFetch > 0 ? pageToFetch : currentPageRef.current
      const query = typeof queryToSearch === 'string' ? queryToSearch : currentSearchRef.current
      try {
        const response = await buscarPrestamos(query, targetPage)
        const rawData = response?.data || []

        const parsedList: PrestamoItem[] = rawData.map((item: any, index: number) => {
          const id = item.ID_PRESTAMO ?? item.id ?? index + 1
          const estadoPrestamo = item.ESTADO_PRESTAMO ?? item.estado_prestamo ?? item.estado ?? 1

          const tieneSancion = Boolean(
            item.ESTADO_SANCION === 1 ||
            item.ESTADO_SANCION === '1' ||
            item.estado_sancion === 1 ||
            item.estado_sancion === '1' ||
            item.TIENE_SANCION === 1 ||
            item.TIENE_SANCION === '1' ||
            item.sancion === 1 ||
            item.sancion === '1' ||
            item.FECHAFIN_SANCION ||
            item.FECHAINICIO_SANCION ||
            item.DETALLE_SANCION ||
            item.detalle_sancion ||
            String(item.DETALLE_PRESTAMO || '').toLowerCase().includes('sancion') ||
            String(item.DETALLE_PRESTAMO || '').toLowerCase().includes('sanción') ||
            String(item.ESTADO_PRESTAMO || '').toLowerCase().includes('sancion') ||
            String(item.ESTADO_PRESTAMO || '').toLowerCase().includes('sanción') ||
            Number(estadoPrestamo) === 3
          )

          let status = 'En préstamo'
          if (tieneSancion) {
            status = 'Sancionado'
          } else if (
            Number(estadoPrestamo) === 2 ||
            String(estadoPrestamo).toLowerCase().includes('no devuelto') ||
            String(estadoPrestamo).toLowerCase().includes('baja')
          ) {
            status = 'No devuelto'
          } else if (
            Number(estadoPrestamo) === 0 ||
            String(estadoPrestamo) === '0' ||
            String(estadoPrestamo).toLowerCase().includes('devuelto') ||
            String(estadoPrestamo).toLowerCase().includes('disponible')
          ) {
            status = 'Devuelto'
          } else if (
            Number(estadoPrestamo) === 1 ||
            String(estadoPrestamo) === '1' ||
            String(estadoPrestamo).toLowerCase().includes('prestamo') ||
            String(estadoPrestamo).toLowerCase().includes('préstamo')
          ) {
            status = 'En préstamo'
          } else {
            status = String(estadoPrestamo || 'En préstamo')
          }

          return {
            id,
            ID_PRESTAMO: id,
            ID_LIBROS: item.ID_LIBROS ?? item.id_libros,
            ID_INSCRIPCION: item.ID_INSCRIPCION ?? item.id_inscripcion,
            ID_PERSONA: item.ID_PERSONA ?? item.id_persona,
            id_persona: item.ID_PERSONA ?? item.id_persona,
            id_inscripcion: item.ID_INSCRIPCION ?? item.id_inscripcion,
            Libro: item.TITULO_LIBROS || 'Sin título',
            ISBN: item.ISBN_LIBROS || 'S/N',
            Nombres: item.NOMBRE_PERSONA || '',
            Apellidos: item.APELLIDO_PERSONA || '',
            Cedula: item.IDENTIFICACION_PERSONA || '-',
            Telefono: item.TELEFONO_PERSONA || '-',
            Celular: item.CELULAR_PERSONA || '-',
            Fecha_prestamo: formatFecha(item.FECHAINICIO_PRESTAMO),
            Fecha_entrega: formatFecha(item.FECHAFIN_PRESTAMO),
            status,
            ESTADO_PRESTAMO: item.ESTADO_PRESTAMO,
            EXTENDER_PRESTAMO: item.EXTENDER_PRESTAMO ?? item.extender_prestamo ?? item.raw?.EXTENDER_PRESTAMO ?? item.raw?.extender_prestamo,
            ESTADO_SANCION: item.ESTADO_SANCION,
            TIENE_SANCION: item.TIENE_SANCION,
            sancion: item.sancion,
            FECHAINICIO_SANCION: item.FECHAINICIO_SANCION,
            FECHAFIN_SANCION: item.FECHAFIN_SANCION,
            DETALLE_SANCION: item.DETALLE_SANCION,
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
    [],
  )

  useEffect(() => {
    if (autoFetch) {
      fetchPrestamos(1, '')
    }
  }, [autoFetch, fetchPrestamos])

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
    if (!canExtenderPrestamo) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para extender la fecha de préstamo.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    const id = item.ID_PRESTAMO ?? item.id
    if (!id) return

    // 1. Verificar si ya alcanzó el límite de extensiones
    const yaExtendido = Boolean(
      Number(item.EXTENDER_PRESTAMO) === 1 ||
      String(item.EXTENDER_PRESTAMO) === '1' ||
      Number((item as any).extender_prestamo) === 1 ||
      String((item as any).extender_prestamo) === '1' ||
      Number(item.raw?.EXTENDER_PRESTAMO) === 1 ||
      String(item.raw?.EXTENDER_PRESTAMO) === '1' ||
      Number((item.raw as any)?.extender_prestamo) === 1 ||
      String((item.raw as any)?.extender_prestamo) === '1'
    )

    if (yaExtendido) {
      await Swal.fire({
        icon: 'info',
        title: 'Préstamo ya extendido',
        text: `El préstamo del libro "${item.Libro}" ya fue extendido previamente y no permite más extensiones.`,
        confirmButtonColor: '#044c8c',
      })
      return
    }

    // 2. Verificar si aún se encuentra dentro de la fecha límite
    const rawEntrega = item.raw?.FECHAFIN_PRESTAMO || item.Fecha_entrega
    let fechaEntregaDate: Date | null = null
    if (rawEntrega) {
      const clean = String(rawEntrega).trim()
      const parts = clean.split(/[-/]/)
      if (parts.length === 3) {
        if (parts[0].length === 4) {
          fechaEntregaDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2].slice(0, 2)))
        } else {
          fechaEntregaDate = new Date(Number(parts[2].slice(0, 4)), Number(parts[1]) - 1, Number(parts[0]))
        }
      }
    }

    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    const aunEnFecha = fechaEntregaDate ? fechaEntregaDate >= hoy : false

    let confirmTitle = '¿Confirmar extensión?'
    let confirmText = `¿Estás seguro de extender la fecha de préstamo para "${item.Libro}"?`
    let iconAlert: 'question' | 'warning' = 'question'

    if (aunEnFecha) {
      confirmTitle = 'Aún dentro de la fecha'
      iconAlert = 'warning'
      confirmText = `Este préstamo aún se encuentra dentro de la fecha límite (vence el ${item.Fecha_entrega || 'plazo acordado'}). ¿Deseas extender la fecha de entrega antes de su vencimiento?`
    }

    const confirmResult = await Swal.fire({
      title: confirmTitle,
      text: confirmText,
      icon: iconAlert,
      showCancelButton: true,
      confirmButtonColor: '#044c8c',
      cancelButtonColor: '#e4342c',
      confirmButtonText: 'Sí, extender fecha',
      cancelButtonText: 'Cancelar',
    })

    if (!confirmResult.isConfirmed) return

    const tienePermiso = await verificarAccionEnServidor('btn_extender_prestamo')
    if (!tienePermiso) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para extender la fecha de préstamo.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    try {
      await ExtenderFecha(id, {
        ID_PRESTAMO: id,
        ID_LIBROS: item.ID_LIBROS ?? item.raw?.ID_LIBROS,
      })
      item.EXTENDER_PRESTAMO = 1
      if (item.raw) item.raw.EXTENDER_PRESTAMO = 1
      Swal.fire({
        icon: 'success',
        title: '¡Fecha extendida!',
        text: 'La fecha de préstamo se extendió con éxito.',
        timer: 1800,
        showConfirmButton: false,
      })
      fetchPrestamos(currentPage, currentSearchRef.current)
    } catch (err: any) {
      console.error('Error al extender préstamo:', err)
      const errData = err?.response?.data
      if (
        errData?.error === 'El libro ya está en préstamo' ||
        errData?.message === 'El libro ya está en préstamo'
      ) {
        Swal.fire({
          icon: 'error',
          title: 'Libro en préstamo',
          text: 'El libro ya está en préstamo.',
          confirmButtonColor: '#dc3545',
          confirmButtonText: 'Entendido',
        })
      } else if (errData?.error && String(errData.error).toLowerCase().includes('extend')) {
        Swal.fire({
          icon: 'info',
          title: 'Extensión no permitida',
          text: errData.error,
          confirmButtonColor: '#044c8c',
          confirmButtonText: 'Entendido',
        })
      } else {
        Swal.fire({
          icon: 'error',
          title: 'No se pudo extender',
          text: errData?.message || errData?.error || 'Ocurrió un error al intentar extender la fecha del préstamo.',
          confirmButtonColor: '#dc3545',
          confirmButtonText: 'Entendido',
        })
      }
    }
  }

  const handleMarcarNoDevuelto = async (item: PrestamoItem) => {
    const idPrestamo = item.ID_PRESTAMO ?? item.id
    const idLibro = item.ID_LIBROS ?? item.raw?.ID_LIBROS
    if (!idPrestamo) return

    const confirmResult = await Swal.fire({
      title: '¿Marcar como No Devuelto?',
      text: `¿Estás seguro de que deseas marcar el libro "${item.Libro}" prestado a ${item.Nombres} ${item.Apellidos} como No Devuelto / Dado de baja?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, marcar como No Devuelto',
      cancelButtonText: 'Cancelar',
    })

    if (!confirmResult.isConfirmed) return

    const tienePermiso = await verificarAccionEnServidor('btn_confirmar_dar_baja')
    if (!tienePermiso) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para confirmar la baja del libro.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    try {
      const payload = {
        nuevo_estado: 2,
        ID_PRESTAMO: idPrestamo,
        ID_LIBROS: idLibro,
        DETALLE_PRESTAMO: 'Marcado como No Devuelto / Baja',
      }
      await CambioEstadoLibro(idPrestamo, payload)

      // Inactivar directamente el ejemplar en el inventario de libros
      if (idLibro) {
        try {
          await ActualizarEstado(idLibro, {
            ESTADO_LIBROS: 0,
            MOTIVO_BAJA_LIBRO: 'Marcado como No Devuelto en módulo de préstamos',
          })
        } catch (e) {
          console.warn('No se pudo inactivar el libro en inventario:', e)
        }
      }

      Swal.fire({
        icon: 'success',
        title: '¡Estado actualizado!',
        text: 'El libro ha sido marcado como No Devuelto y su estado en inventario pasó a Inactivo.',
        timer: 1800,
        showConfirmButton: false,
      })
      fetchPrestamos()
    } catch (err: any) {
      console.error('Error al marcar no devuelto:', err)
      Swal.fire({
        icon: 'error',
        title: 'Error al actualizar',
        text: err?.response?.data?.message || err?.response?.data?.error || 'Hubo un error al registrar el estado.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
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
    setDetails,
    toggleDetails,
    handlePrestamoCreado,
    handleExtenderPrestamo,
    handleMarcarNoDevuelto,
    getBadgeColor,
    tableKey,
    setTableKey,
    handleBuscarGlobal,
    handleRecargar,

    paginaActual: currentPage,
    totalPaginas: totalPages,
    totalRegistros: totalItems,
    porPagina: 10,

    canCrearPrestamo,
    canExtenderPrestamo,
    canNoDevuelto,
    canRegistrarDevolucion,
    canDevolverSancion,
    canGuardarPrestamo,
    canGuardarDevolverSancion,
    canMostrarInfoPrestamo,
    canConfirmarDarBaja,
    verificarAccionEnServidor,
  }
}

export default usePrestamos
