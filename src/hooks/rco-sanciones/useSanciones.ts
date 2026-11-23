import { useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Swal from 'sweetalert2'
import { RootState, AppDispatch } from '@/store'
import {
  setSancionados as setSancionadosSlice,
  setPaginacionSanciones,
  setSancionadoSeleccionado as setSancionadoSeleccionadoSlice,
  removerSancionDeLista,
  SancionItem,
} from '@/slices/sancionSlice'
import { QuitarSancion } from '@/Service/rco/Sanciones'
import { listarPersonas } from '@/Service/tab/Persona'
import { formatFecha } from '@/utils/dateUtils'
import { usePermissions } from '@/hooks/auth/usePermissions'
import { deduplicarPersonas, extraerInscripcion } from '../tab-persona/usePersonas'
import { sanitizarHistorialSanciones } from '@/utils/sancionUtils'

export const getBadgeColorSancion = (status: string | number): string => {
  const s = String(status || '').toLowerCase().trim()
  if (s.includes('vida') || s.includes('permanente') || s.includes('vet') || s === '2') {
    return 'danger'
  }
  if (s.includes('sancion') || s.includes('sancionado') || s === '1') {
    return 'warning'
  }
  if (s.includes('sin sancion') || s.includes('activo') || s === '0') {
    return 'secondary'
  }
  return 'warning'
}

export const getBadgeColorUsuario = (estado: string) => {
  switch (estado) {
    case 'Activo':
      return 'success'
    case 'Inactivo':
      return 'danger'
    default:
      return 'secondary'
  }
}

export const esPersonaSancionada = (item: any): boolean => {
  if (!item) return false
  return Boolean(
    Number(item.TIENE_VETO_PERMANENTE) === 1 ||
      Number(item.ESTADO_VETO) === 2 ||
      (Array.isArray(item.vetos) && item.vetos.some((v: any) => Number(v.ESTADO_VETO) === 2)) ||
      Number(item.TIENE_SANCION) === 1 ||
      Number(item.ESTADO_SANCION) === 1 ||
      (Array.isArray(item.sanciones) && item.sanciones.some((s: any) => Number(s.ESTADO_SANCION) === 1))
  )
}

export const useSanciones = (autoFetch: boolean = true) => {
  const dispatch = useDispatch<AppDispatch>()
  const { canDoAction, verificarAccionEnServidor } = usePermissions()

  // Permisos
  const canQuitarSancion = canDoAction('btn_quitar_sancion')
  const canSancionPermanente = canDoAction('btn_sancion_permanente')
  const canGuardarSancionPermanente = canDoAction('btn_guardar_sancion_permanente')
  const canVerInfoSancion = canDoAction('btn_ver_info_sancion')

  // Estado Redux
  const sancionados = useSelector((state: RootState) => state.sanciones.sancionados)
  const sancionadoSeleccionado = useSelector(
    (state: RootState) => state.sanciones.sancionadoSeleccionado,
  )
  const paginacionSanciones = useSelector(
    (state: RootState) => state.sanciones.paginacionSanciones,
  )

  // Estado efímero de UI
  const [loading, setLoading] = useState(false)
  const [procesandoId, setProcesandoId] = useState<number | string | null>(null)
  const [details, setDetails] = useState<(string | number)[]>([])
  const [tableKey, setTableKey] = useState(0)
  const [filtroVeto, setFiltroVeto] = useState<number | string | null>(null)
  const [filtroEstado, setFiltroEstado] = useState<string | null>(null)

  const paginaActualRef = useRef<number>(paginacionSanciones.current_page || 1)
  paginaActualRef.current = paginacionSanciones.current_page || 1

  const currentSearchRef = useRef<string>('')
  const filtroVetoRef = useRef<number | string | null>(null)
  const filtroEstadoRef = useRef<string | null>(null)
  const searchDebounceRef = useRef<any>(null)

  const toggleDetails = (id: string | number) => {
    if (!canVerInfoSancion) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para ver los detalles de los usuarios sancionados.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }
    setDetails((prev) => (prev.includes(id) ? [] : [id]))
  }

  // Parseo canónico sin parches
  const parseSancionado = (item: any): SancionItem => {
    const rawListSanciones: any[] = []
    if (Array.isArray(item.vetos)) rawListSanciones.push(...item.vetos)
    if (Array.isArray(item.sanciones)) rawListSanciones.push(...item.sanciones)
    if (rawListSanciones.length === 0 && Array.isArray(item.historial_sanciones)) {
      rawListSanciones.push(...item.historial_sanciones)
    }

    const historialSanciones = sanitizarHistorialSanciones(rawListSanciones)
    const vetoObj = Array.isArray(item.vetos)
      ? item.vetos.find((v: any) => Number(v.ESTADO_VETO) === 2) || item.vetos[0]
      : null

    const esVetado = Boolean(
      Number(item.TIENE_VETO_PERMANENTE) === 1 ||
        Number(item.ESTADO_VETO) === 2 ||
        (Array.isArray(item.vetos) && item.vetos.some((v: any) => Number(v.ESTADO_VETO) === 2)),
    )

    const sancionActiva = Array.isArray(item.sanciones)
      ? item.sanciones.find((s: any) => Number(s.ESTADO_SANCION) === 1) || item.sanciones[0]
      : null

    const tieneSancion = !esVetado && Boolean(
      Number(item.TIENE_SANCION) === 1 ||
        Number(item.ESTADO_SANCION) === 1 ||
        (Array.isArray(item.sanciones) && item.sanciones.some((s: any) => Number(s.ESTADO_SANCION) === 1)),
    )

    const principal = historialSanciones[0] || (esVetado ? {
      id: vetoObj?.ID_VETO ?? item.ID_VETO,
      inicio: formatFecha(vetoObj?.FECHA_VETO || item.FECHA_VETO),
      fin: 'Indefinido',
      detalle: vetoObj?.MOTIVO_VETO || item.MOTIVO_VETO || 'Veto permanente registrado en el sistema',
      estado: 2,
    } : {
      id: sancionActiva?.ID_SANCION ?? item.ID_SANCION,
      inicio: formatFecha(sancionActiva?.FECHAINICIO_SANCION || item.FECHAINICIO_SANCION),
      fin: formatFecha(sancionActiva?.FECHAFIN_SANCION || item.FECHAFIN_SANCION),
      detalle: sancionActiva?.DETALLE_SANCION || item.DETALLE_SANCION || 'Sanción registrada en el sistema',
      estado: 1,
    })

    const idSancionReal = esVetado
      ? (vetoObj?.ID_VETO ?? item.ID_VETO ?? principal?.id)
      : (sancionActiva?.ID_SANCION ?? principal?.id ?? item.ID_SANCION)

    const idPersona = item.ID_PERSONA
    const insc = extraerInscripcion(item)
    const idInscripcion = insc?.ID_INSCRIPCION ?? item.ID_INSCRIPCION

    const statusTexto = esVetado ? 'Vetado' : 'Sancionado'
    const estadoUsuarioTexto: 'Activo' | 'Inactivo' =
      Number(item.ESTADO_PERSONA ?? 1) === 1 ? 'Activo' : 'Inactivo'

    const fechaInicioSancion = esVetado
      ? (formatFecha(vetoObj?.FECHA_VETO) || principal?.inicio || formatFecha(item.FECHA_VETO) || '')
      : (formatFecha(sancionActiva?.FECHAINICIO_SANCION) || principal?.inicio || formatFecha(item.FECHAINICIO_SANCION) || '')

    const fechaFinSancion = esVetado
      ? 'Indefinido (De por vida)'
      : (formatFecha(sancionActiva?.FECHAFIN_SANCION) || principal?.fin || formatFecha(item.FECHAFIN_SANCION) || 'Indefinido')

    const motivoSancion = esVetado
      ? (vetoObj?.MOTIVO_VETO || item.MOTIVO_VETO || principal?.detalle || 'Veto permanente registrado en el sistema')
      : (sancionActiva?.DETALLE_SANCION || principal?.detalle || item.DETALLE_SANCION || 'Sanción registrada en el sistema')

    return {
      ID_PERSONA: idPersona,
      ID_SANCION: idSancionReal,
      ID_INSCRIPCION: idInscripcion,
      ID_PRESTAMO: item.ID_PRESTAMO ?? null,
      IDENTIFICACION_PERSONA: item.IDENTIFICACION_PERSONA || '-',
      NOMBRE_PERSONA: item.NOMBRE_PERSONA || '',
      APELLIDO_PERSONA: item.APELLIDO_PERSONA || '',
      CELULAR_PERSONA: item.CELULAR_PERSONA || '-',
      TELEFONO_PERSONA: item.TELEFONO_PERSONA || '-',
      ESTADO_PERSONA: Number(item.ESTADO_PERSONA ?? 1),
      ESTADO_TEXTO: estadoUsuarioTexto,
      STATUS_SANCION_TEXTO: statusTexto,
      FECHA_INICIO_SANCION: fechaInicioSancion,
      FECHA_FIN_SANCION: fechaFinSancion,
      MOTIVO_SANCION: motivoSancion,
      ES_VETADO: esVetado,
      TIENE_VETO_PERMANENTE: esVetado ? 1 : 0,
      TIENE_SANCION: (esVetado || tieneSancion) ? 1 : 0,
      TITULO_LIBROS: item.TITULO_LIBROS || '',
      ISBN_LIBROS: item.ISBN_LIBROS || '',
      HISTORIAL_SANCIONES: historialSanciones,
      OTRAS_SANCIONES: historialSanciones.slice(1),
    }
  }

  const fetchSancionados = useCallback(
    async (
      pageToFetch?: number,
      queryToSearch?: string,
      vetoToFilter?: number | string | null,
      estadoToFilter?: string | null,
    ) => {
      setLoading(true)
      const targetPage =
        typeof pageToFetch === 'number' && pageToFetch > 0
          ? pageToFetch
          : paginaActualRef.current
      const query =
        typeof queryToSearch === 'string' ? queryToSearch : currentSearchRef.current
      const targetVeto =
        vetoToFilter !== undefined ? vetoToFilter : filtroVetoRef.current
      const targetEstado =
        estadoToFilter !== undefined ? estadoToFilter : filtroEstadoRef.current

      let estadoParam: number | null = null
      if (targetEstado === 'Activo' || targetEstado === '1') {
        estadoParam = 1
      } else if (targetEstado === 'Inactivo' || targetEstado === '0') {
        estadoParam = 0
      }

      let vetoParam: number | null = null
      if (targetVeto === 2 || targetVeto === '2') {
        vetoParam = 2
      } else if (targetVeto === 0 || targetVeto === '0') {
        vetoParam = 0
      }

      try {
        const payloadSancionados = {
          nombre: query,
          estado: estadoParam ?? null,
          sancion: 1,
          estado_veto: vetoParam ?? null,
          per_page: 10,
          page: targetPage,
          filtros: {
            nombre: query,
            estado: estadoParam ?? null,
            sancion: 1,
            estado_veto: vetoParam ?? null,
            per_page: 10,
          },
        }
        const response = await listarPersonas(payloadSancionados, { page: targetPage })

        let rawItems: any[] = []
        if (Array.isArray(response)) {
          rawItems = response
        } else if (Array.isArray(response?.data?.data)) {
          rawItems = response.data.data
        } else if (Array.isArray(response?.data)) {
          rawItems = response.data
        } else if (Array.isArray(response?.personas?.data)) {
          rawItems = response.personas.data
        } else if (Array.isArray(response?.personas)) {
          rawItems = response.personas
        }

        // Paginación
        let total = rawItems.length
        let lastPage = 1
        let currentPage = targetPage
        const meta = response?.meta || response?.data || response?.personas || response
        if (meta && typeof meta === 'object' && !Array.isArray(meta)) {
          if (meta.total !== undefined && meta.total !== null) total = Number(meta.total) || 0
          if (meta.last_page !== undefined && meta.last_page !== null)
            lastPage = Number(meta.last_page) || 1
          if (meta.current_page !== undefined && meta.current_page !== null)
            currentPage = Number(meta.current_page) || targetPage
        }

        // Deduplicar y filtrar solo sancionados
        const dedupedItems = deduplicarPersonas(rawItems)
        const listaAProcesar = dedupedItems.filter(esPersonaSancionada)
        const parsedList: SancionItem[] = listaAProcesar.map(parseSancionado)

        dispatch(
          setSancionadosSlice({
            data: parsedList,
            current_page: currentPage,
            total: total > 0 ? total : parsedList.length,
            per_page: 10,
            last_page: Math.max(1, lastPage),
          }),
        )
      } catch (err) {
        console.error('Error al obtener lista de sancionados reales:', err)
        dispatch(
          setSancionadosSlice({
            data: [],
            current_page: 1,
            total: 0,
            per_page: 10,
            last_page: 1,
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
      fetchSancionados(1, '', null)
    }
  }, [autoFetch, fetchSancionados])

  const handlePageChange = (nuevaPagina: number) => {
    if (nuevaPagina === paginacionSanciones.current_page || loading) return
    dispatch(setPaginacionSanciones({ current_page: nuevaPagina }))
    fetchSancionados(
      nuevaPagina,
      currentSearchRef.current,
      filtroVetoRef.current,
      filtroEstadoRef.current,
    )
  }

  const handleBuscarGlobal = (valor: string) => {
    currentSearchRef.current = valor
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
    searchDebounceRef.current = setTimeout(() => {
      dispatch(setPaginacionSanciones({ current_page: 1 }))
      fetchSancionados(1, valor, filtroVetoRef.current, filtroEstadoRef.current)
    }, 450)
  }

  const handleColumnFilterChange = useCallback(
    (filters: any) => {
      let nuevoVeto: number | string | null = null
      const val = filters?.ES_VETADO

      if (
        val === '2' ||
        val === 2 ||
        String(val).toLowerCase() === 'si' ||
        String(val).toLowerCase() === 'sí' ||
        val === true
      ) {
        nuevoVeto = 2
      } else if (
        val === '0' ||
        val === 0 ||
        String(val).toLowerCase() === 'no' ||
        val === false
      ) {
        nuevoVeto = 0
      } else {
        nuevoVeto = null
      }

      const valEstado = filters?.ESTADO_TEXTO
      const nuevoEstado =
        valEstado && String(valEstado).trim() !== '' ? String(valEstado).trim() : null

      filtroVetoRef.current = nuevoVeto
      filtroEstadoRef.current = nuevoEstado
      setFiltroVeto(nuevoVeto)
      setFiltroEstado(nuevoEstado)
      dispatch(setPaginacionSanciones({ current_page: 1 }))
      fetchSancionados(1, currentSearchRef.current, nuevoVeto, nuevoEstado)
    },
    [dispatch, fetchSancionados],
  )

  const handleRecargar = () => {
    currentSearchRef.current = ''
    filtroVetoRef.current = null
    filtroEstadoRef.current = null
    setFiltroVeto(null)
    setFiltroEstado(null)
    setTableKey((prev) => prev + 1)
    dispatch(setPaginacionSanciones({ current_page: 1 }))
    fetchSancionados(1, '', null, null)
  }

  // Quitar Sanción
  const handleQuitarSancion = async (item: SancionItem) => {
    if (!canQuitarSancion) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para quitar sanciones.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    const idSancion = item.ID_SANCION ?? item.ID_PERSONA
    if (!idSancion) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo identificar el registro de sanción.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    dispatch(setSancionadoSeleccionadoSlice(item))

    const result = await Swal.fire({
      title: '¿Quitar Sanción?',
      text: `¿Desea retirar la sanción al usuario ${item.NOMBRE_PERSONA} ${item.APELLIDO_PERSONA}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#198754',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, quitar sanción',
      cancelButtonText: 'Cancelar',
    })

    if (!result.isConfirmed) {
      dispatch(setSancionadoSeleccionadoSlice(null))
      return
    }

    const tienePermiso = await verificarAccionEnServidor('btn_quitar_sancion')
    if (!tienePermiso) {
      dispatch(setSancionadoSeleccionadoSlice(null))
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para quitar sanciones.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    const idProceso = item.ID_PERSONA ?? idSancion
    setProcesandoId(idProceso)
    try {
      await QuitarSancion(idSancion, {
        ID_PERSONA: item.ID_PERSONA,
        ID_SANCION: idSancion,
      })

      dispatch(removerSancionDeLista(idProceso))

      Swal.fire({
        icon: 'success',
        title: '¡Sanción retirada!',
        text: 'La sanción fue retirada con éxito.',
        timer: 1800,
        showConfirmButton: false,
      })

      fetchSancionados(paginaActualRef.current, currentSearchRef.current)
    } catch (error: any) {
      console.error('Error al quitar sanción:', error)
      const msg = error?.response?.data?.message || 'Ocurrió un error al quitar la sanción.'
      Swal.fire({
        icon: 'error',
        title: 'Error al retirar sanción',
        text: msg,
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
    } finally {
      setProcesandoId(null)
      dispatch(setSancionadoSeleccionadoSlice(null))
    }
  }

  return {
    sancionados,
    sancionadoSeleccionado,
    setSancionadoSeleccionado: (s: SancionItem | null) =>
      dispatch(setSancionadoSeleccionadoSlice(s)),
    loading,
    procesandoId,
    paginaActual: paginacionSanciones.current_page,
    totalPaginas: paginacionSanciones.last_page,
    totalRegistros: paginacionSanciones.total,
    details,
    tableKey,
    canQuitarSancion,
    canSancionPermanente,
    canSancionarDePorVida: canSancionPermanente,
    canGuardarSancionPermanente,
    canGuardarSancion: canGuardarSancionPermanente,
    canVerInfoSancion,
    toggleDetails,
    fetchSancionados,
    handlePageChange,
    handleBuscarGlobal,
    handleRecargar,
    filtroVeto,
    filtroEstado,
    handleColumnFilterChange,
    handleQuitarSancion,
    getBadgeColorSancion,
    getBadgeColorUsuario,
    verificarAccionEnServidor,
  }
}

export default useSanciones
