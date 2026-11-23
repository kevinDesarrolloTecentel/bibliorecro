import { useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Swal from 'sweetalert2'
import { RootState, AppDispatch } from '@/store'
import {
  setPrestamos as setPrestamosSlice,
  setPrestamoSeleccionado as setPrestamoSeleccionadoSlice,
  setPaginacionPrestamos,
  PrestamoItem,
} from '@/slices/prestamoSlice'
import { CambioEstadoLibro, ExtenderFecha, buscarPrestamos } from '@/Service/rco/Prestamos'
import { ActualizarEstado } from '@/Service/rco/Libros'
import { formatFecha } from '@/utils/dateUtils'
import { usePermissions } from '@/hooks/auth/usePermissions'

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
  const dispatch = useDispatch<AppDispatch>()
  const { canDoAction, verificarAccionEnServidor } = usePermissions()

  // Permisos
  const canCrearPrestamo = canDoAction('btn_crear_prestamo')
  const canExtenderPrestamo = canDoAction('btn_extender_prestamo')
  const canNoDevuelto = canDoAction('btn_no_devuelto')
  const canRegistrarDevolucion = canDoAction('btn_registrar_devolucion')
  const canDevolverSancion = canDoAction('btn_devolver_sancion')
  const canGuardarPrestamo = canDoAction('btn_guardar_prestamo')
  const canGuardarDevolverSancion = canDoAction('btn_guardar_devolver_sancion')
  const canMostrarInfoPrestamo = canDoAction('btn_mostrar_info_prestamo')
  const canConfirmarDarBaja = canDoAction('btn_confirmar_dar_baja')

  // Redux Domain State
  const prestamos = useSelector((state: RootState) => state.prestamos.prestamos)
  const prestamoSeleccionado = useSelector((state: RootState) => state.prestamos.prestamoSeleccionado)
  const paginacion = useSelector((state: RootState) => state.prestamos.paginacionPrestamos)
  const currentPage = paginacion.current_page
  const totalPages = paginacion.last_page
  const totalItems = paginacion.total

  // UI Ephemeral State
  const [loading, setLoading] = useState(false)
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

  // Parseo canónico sin parches: exclusivamente nombres oficiales de la base de datos
  const parsePrestamo = (item: any): PrestamoItem => {
    const estadoPrestamo = item.ESTADO_PRESTAMO ?? 1

    const tieneSancion = Boolean(
      Number(item.ESTADO_SANCION) === 1 ||
      Number(item.TIENE_SANCION) === 1 ||
      item.FECHAFIN_SANCION ||
      item.FECHAINICIO_SANCION ||
      item.DETALLE_SANCION ||
      String(item.DETALLE_PRESTAMO || '').toLowerCase().includes('sancion') ||
      String(item.DETALLE_PRESTAMO || '').toLowerCase().includes('sanción')
    )

    let status = 'En préstamo'
    const numEstado = Number(estadoPrestamo)

    if (
      numEstado === 2 ||
      String(estadoPrestamo).toLowerCase().includes('dañado') ||
      String(estadoPrestamo).toLowerCase().includes('danado') ||
      String(estadoPrestamo).toLowerCase().includes('no devuelto') ||
      String(estadoPrestamo).toLowerCase().includes('baja')
    ) {
      status = 'Devuelto pero dañado'
    } else if (
      numEstado === 0 ||
      String(estadoPrestamo) === '0' ||
      String(estadoPrestamo).toLowerCase().includes('devuelto') ||
      String(estadoPrestamo).toLowerCase().includes('disponible')
    ) {
      status = 'Devuelto'
    } else if (
      numEstado === 1 ||
      String(estadoPrestamo) === '1' ||
      String(estadoPrestamo).toLowerCase().includes('prestamo') ||
      String(estadoPrestamo).toLowerCase().includes('préstamo')
    ) {
      status = 'En préstamo'
    } else if (tieneSancion) {
      status = 'Sancionado'
    } else {
      status = String(estadoPrestamo || 'En préstamo')
    }

    return {
      ID_PRESTAMO: item.ID_PRESTAMO,
      ID_LIBROS: item.ID_LIBROS,
      ID_INSCRIPCION: item.ID_INSCRIPCION,
      ID_PERSONA: item.ID_PERSONA,
      TITULO_LIBROS: item.TITULO_LIBROS || 'Sin título',
      ISBN_LIBROS: item.ISBN_LIBROS || 'S/N',
      NOMBRE_PERSONA: item.NOMBRE_PERSONA || '',
      APELLIDO_PERSONA: item.APELLIDO_PERSONA || '',
      IDENTIFICACION_PERSONA: item.IDENTIFICACION_PERSONA || '-',
      TELEFONO_PERSONA: item.TELEFONO_PERSONA || '-',
      CELULAR_PERSONA: item.CELULAR_PERSONA || '-',
      FECHAINICIO_PRESTAMO: item.FECHAINICIO_PRESTAMO ? formatFecha(item.FECHAINICIO_PRESTAMO) : '-',
      FECHAFIN_PRESTAMO: item.FECHAFIN_PRESTAMO ? formatFecha(item.FECHAFIN_PRESTAMO) : '-',
      FECHAENTREGA_PRESTAMO: item.FECHAENTREGA_PRESTAMO ? formatFecha(item.FECHAENTREGA_PRESTAMO) : null,
      DETALLE_PRESTAMO: item.DETALLE_PRESTAMO || '',
      ESTADO_PRESTAMO: numEstado,
      EXTENDER_PRESTAMO: Number(item.EXTENDER_PRESTAMO ?? 0),
      ESTADO_SANCION: item.ESTADO_SANCION ?? null,
      FECHAINICIO_SANCION: item.FECHAINICIO_SANCION ?? null,
      FECHAFIN_SANCION: item.FECHAFIN_SANCION ?? null,
      DETALLE_SANCION: item.DETALLE_SANCION ?? null,
      TIENE_SANCION: tieneSancion,
      ESTADO_TEXTO: status,
    }
  }

  const fetchPrestamos = useCallback(
    async (pageToFetch?: number, queryToSearch?: string) => {
      setLoading(true)
      const targetPage =
        typeof pageToFetch === 'number' && pageToFetch > 0 ? pageToFetch : currentPageRef.current
      const query =
        typeof queryToSearch === 'string' ? queryToSearch : currentSearchRef.current

      try {
        const response = await buscarPrestamos(query, targetPage)
        const rawData = response?.data || []
        const parsedList = rawData.map(parsePrestamo)

        dispatch(
          setPrestamosSlice({
            data: parsedList,
            pagination: response?.pagination || {
              current_page: response?.current_page || targetPage,
              total: response?.total || rawData.length,
              per_page: response?.per_page || 10,
              last_page: response?.last_page || 1,
            },
          }),
        )

        currentPageRef.current = response?.current_page || targetPage
      } catch (err) {
        console.error('Error al obtener préstamos:', err)
        dispatch(
          setPrestamosSlice({
            data: [],
            pagination: { current_page: 1, total: 0, per_page: 10, last_page: 1 },
          }),
        )
      } finally {
        setLoading(false)
      }
    },
    [dispatch],
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
    currentPageRef.current = 1
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
    currentPageRef.current = page
    setDetails([])
    dispatch(setPaginacionPrestamos({ current_page: page }))
    fetchPrestamos(page, currentSearchRef.current)
  }

  const handlePrestamoCreado = () => {
    fetchPrestamos(1, currentSearchRef.current)
  }

  const handleExtenderPrestamo = async (item: PrestamoItem) => {
    dispatch(setPrestamoSeleccionadoSlice(item))
    if (!canExtenderPrestamo) {
      dispatch(setPrestamoSeleccionadoSlice(null))
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para extender la fecha de préstamo.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    const id = item.ID_PRESTAMO
    if (!id) return

    // 1. Verificar si ya alcanzó el límite de extensiones
    const yaExtendido = Number(item.EXTENDER_PRESTAMO) === 1

    if (yaExtendido) {
      await Swal.fire({
        icon: 'info',
        title: 'Préstamo ya extendido',
        text: `El préstamo del libro "${item.TITULO_LIBROS || 'este libro'}" ya fue extendido previamente y no permite más extensiones.`,
        confirmButtonColor: '#044c8c',
      })
      return
    }

    // 2. Verificar si aún se encuentra dentro de la fecha límite
    const rawEntrega = item.FECHAFIN_PRESTAMO
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
    let confirmText = `¿Estás seguro de extender la fecha de préstamo para "${item.TITULO_LIBROS || 'este libro'}"?`
    let iconAlert: 'question' | 'warning' = 'question'

    if (aunEnFecha) {
      confirmTitle = 'Aún dentro de la fecha'
      iconAlert = 'warning'
      confirmText = `Este préstamo aún se encuentra dentro de la fecha límite (vence el ${item.FECHAFIN_PRESTAMO || 'plazo acordado'}). ¿Deseas extender la fecha de entrega antes de su vencimiento?`
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
        ID_LIBROS: item.ID_LIBROS,
      })
      Swal.fire({
        icon: 'success',
        title: '¡Fecha extendida!',
        text: 'La fecha de préstamo se extendió con éxito.',
        timer: 1800,
        showConfirmButton: false,
      })
      fetchPrestamos(currentPageRef.current, currentSearchRef.current)
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
    } finally {
      dispatch(setPrestamoSeleccionadoSlice(null))
    }
  }

  const handleMarcarNoDevuelto = async (item: PrestamoItem) => {
    const idPrestamo = item.ID_PRESTAMO
    const idLibro = item.ID_LIBROS
    if (!idPrestamo) return

    const confirmResult = await Swal.fire({
      title: '¿Registrar como Devuelto pero Dañado?',
      text: `¿Estás seguro de que deseas registrar el libro "${item.TITULO_LIBROS || 'este libro'}" prestado a ${item.NOMBRE_PERSONA || ''} ${item.APELLIDO_PERSONA || ''} como Devuelto pero Dañado / Dado de baja?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, marcar como Dañado',
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
        DETALLE_PRESTAMO: 'Devuelto pero dañado / Baja',
      }
      await CambioEstadoLibro(idPrestamo, payload)

      // Inactivar directamente el ejemplar en el inventario de libros
      if (idLibro) {
        try {
          await ActualizarEstado(idLibro, {
            ESTADO_LIBROS: 0,
            MOTIVO_BAJA_LIBRO: 'Marcado como Devuelto pero Dañado en módulo de préstamos',
          })
        } catch (e) {
          console.warn('No se pudo inactivar el libro en inventario:', e)
        }
      }

      Swal.fire({
        icon: 'success',
        title: '¡Estado actualizado!',
        text: 'El préstamo fue registrado como Devuelto pero Dañado y su estado en inventario pasó a Inactivo.',
        timer: 1800,
        showConfirmButton: false,
      })
      fetchPrestamos(currentPageRef.current, currentSearchRef.current)
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
    prestamoSeleccionado,
    setPrestamoSeleccionado: (p: PrestamoItem | null) => dispatch(setPrestamoSeleccionadoSlice(p)),
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
