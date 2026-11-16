import { useCallback, useEffect, useRef, useState } from 'react'
import Swal from 'sweetalert2'
import { SancionItem } from '@/models/rco/sancion.model'
import { buscarSancionados, QuitarSancion, SancionarDePorVida } from '@/Service/rco/Sanciones'
import { formatFecha } from '@/utils/dateUtils'
import { usePermissions } from '@/context/PermissionsContext'
import { deduplicarPersonas } from '../tab-persona/usePersonas'
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
  const { canDoAction, verificarAccionEnServidor } = usePermissions()

  const canQuitarSancion = canDoAction('btn_quitar_sancion')
  const canSancionPermanente = canDoAction('btn_sancion_permanente')
  const canGuardarSancionPermanente = canDoAction('btn_guardar_sancion_permanente')
  const canVerInfoSancion = canDoAction('btn_ver_info_sancion')

  const [sancionados, setSancionados] = useState<SancionItem[]>([])
  const [loading, setLoading] = useState(false)
  const [procesandoId, setProcesandoId] = useState<number | string | null>(null)
  const [paginaActual, setPaginaActual] = useState(1)
  const [totalPaginas, setTotalPaginas] = useState(1)
  const [totalRegistros, setTotalRegistros] = useState(0)
  const [details, setDetails] = useState<(string | number)[]>([])
  const [tableKey, setTableKey] = useState(0)
  const [filtroVeto, setFiltroVeto] = useState<number | string | null>(null)
  const [filtroEstado, setFiltroEstado] = useState<string | null>(null)

  const paginaActualRef = useRef<number>(1)
  paginaActualRef.current = paginaActual

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

  const fetchSancionados = useCallback(
    async (
      pageToFetch?: number,
      queryToSearch?: string,
      vetoToFilter?: number | string | null,
      estadoToFilter?: string | null,
    ) => {
      setLoading(true)
      const targetPage = typeof pageToFetch === 'number' && pageToFetch > 0 ? pageToFetch : paginaActualRef.current
      const query = typeof queryToSearch === 'string' ? queryToSearch : currentSearchRef.current
      const targetVeto = vetoToFilter !== undefined ? vetoToFilter : filtroVetoRef.current
      const targetEstado = estadoToFilter !== undefined ? estadoToFilter : filtroEstadoRef.current

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
        const response = await buscarSancionados(query, targetPage, vetoParam, estadoParam)
        
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

        // Extraer metadatos de paginación
        let total = rawItems.length
        let lastPage = 1
        let currentPage = targetPage
        const meta = response?.meta || response?.data || response?.personas || response
        if (meta && typeof meta === 'object' && !Array.isArray(meta)) {
          if (meta.total !== undefined && meta.total !== null) total = Number(meta.total) || 0
          if (meta.last_page !== undefined && meta.last_page !== null) lastPage = Number(meta.last_page) || 1
          if (meta.current_page !== undefined && meta.current_page !== null) currentPage = Number(meta.current_page) || targetPage
        }

        // 1. Deduplicamos primero las filas recibidas
        const dedupedItems = deduplicarPersonas(rawItems)

        // 2. Filtramos para asegurar que SÓLO se muestren usuarios con sanción activa real o veto
        const listaAProcesar = dedupedItems.filter(esPersonaSancionada)

        const parsedList: SancionItem[] = listaAProcesar.map((item: any, index: number) => {
          const id = item.ID_PERSONA ?? item.id ?? item.ID_PRESTAMO ?? item.ID_SANCION ?? index + 1
          
          const rawListSanciones: any[] = []
          if (Array.isArray(item.vetos)) {
            rawListSanciones.push(...item.vetos)
          }
          if (Array.isArray(item.sanciones)) {
            rawListSanciones.push(...item.sanciones)
          }
          if (rawListSanciones.length === 0 && Array.isArray(item.historial_sanciones)) {
            rawListSanciones.push(...item.historial_sanciones)
          }

          const historialSanciones = sanitizarHistorialSanciones(rawListSanciones)

          // TIENE_VETO_PERMANENTE
          const vetoObj = Array.isArray(item.vetos)
            ? item.vetos.find((v: any) => Number(v.ESTADO_VETO) === 2) || item.vetos[0]
            : null

          const esVetado = Boolean(
            Number(item.TIENE_VETO_PERMANENTE) === 1 ||
            Number(item.ESTADO_VETO) === 2 ||
            (Array.isArray(item.vetos) && item.vetos.some((v: any) => Number(v.ESTADO_VETO) === 2))
          )

          // TIENE_SANCION
          const sancionActiva = Array.isArray(item.sanciones)
            ? item.sanciones.find((s: any) => Number(s.ESTADO_SANCION) === 1) || item.sanciones[0]
            : null

          const tieneSancion = !esVetado && Boolean(
            Number(item.TIENE_SANCION) === 1 ||
            Number(item.ESTADO_SANCION) === 1 ||
            (Array.isArray(item.sanciones) && item.sanciones.some((s: any) => Number(s.ESTADO_SANCION) === 1))
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

          const otrasSanciones = historialSanciones.slice(1)

          // Extracción prioritaria del ID real de la sanción o veto
          const idSancionReal = esVetado
            ? (vetoObj?.ID_VETO ?? item.ID_VETO ?? principal?.id)
            : (sancionActiva?.ID_SANCION ?? principal?.id ?? item.ID_SANCION)

          const idPersona = item.ID_PERSONA ?? item.id_persona ?? item.id
          const idPrestamo = item.ID_PRESTAMO ?? item.id_prestamo

          const status = esVetado ? 'Vetado' : 'Sancionado'
          const estadoUsuario: 'Activo' | 'Inactivo' = Number(item.ESTADO_PERSONA) === 1 ? 'Activo' : 'Inactivo'

          const libroTitulo = item.TITULO_LIBROS || item.Libro || item.libro || ''
          const libroIsbn = item.ISBN_LIBROS || item.ISBN || item.isbn || ''

          const Fecha_inicio_sancion = esVetado
            ? (formatFecha(vetoObj?.FECHA_VETO) || principal?.inicio || formatFecha(item.FECHA_VETO) || '')
            : (formatFecha(sancionActiva?.FECHAINICIO_SANCION) || principal?.inicio || formatFecha(item.FECHAINICIO_SANCION) || '')

          const Fecha_fin_sancion = esVetado
            ? 'Indefinido (De por vida)'
            : (formatFecha(sancionActiva?.FECHAFIN_SANCION) || principal?.fin || formatFecha(item.FECHAFIN_SANCION) || 'Indefinido')

          const Motivo_sancion = esVetado
            ? (vetoObj?.MOTIVO_VETO || item.MOTIVO_VETO || principal?.detalle || 'Veto permanente registrado en el sistema')
            : (sancionActiva?.DETALLE_SANCION || principal?.detalle || item.DETALLE_SANCION || item.ESTADO || 'Sanción registrada en el sistema')

          return {
            id,
            id_sancion: idSancionReal,
            ID_SANCION: idSancionReal,
            ID_INSCRIPCION: item.ID_INSCRIPCION ?? item.id_inscripcion ?? item.inscripciones?.[0]?.ID_INSCRIPCION,
            id_prestamo: idPrestamo,
            ID_PRESTAMO: idPrestamo,
            id_persona: idPersona,
            ID_PERSONA: idPersona,
            Cedula: item.IDENTIFICACION_PERSONA || item.identificacion || item.Cedula || '-',
            Nombres: item.NOMBRE_PERSONA || item.nombres || item.Nombres || '',
            Apellidos: item.APELLIDO_PERSONA || item.apellidos || item.Apellidos || '',
            Celular: item.CELULAR_PERSONA || item.celular || item.Celular || '-',
            Telefono: item.TELEFONO_PERSONA || item.telefono || item.Telefono || '-',
            Libro: libroTitulo,
            ISBN: libroIsbn,
            Fecha_prestamo: formatFecha(item.FECHAINICIO_PRESTAMO || item.Fecha_prestamo),
            Fecha_entrega: formatFecha(item.FECHAFIN_PRESTAMO || item.Fecha_entrega),
            Fecha_inicio_sancion,
            Fecha_fin_sancion,
            Motivo_sancion,
            historial_sanciones: historialSanciones,
            otras_sanciones: otrasSanciones,
            total_sanciones: Math.max(historialSanciones.length, 1),
            status,
            estado: estadoUsuario,
            estado_usuario: estadoUsuario,
            ESTADO_PERSONA: item.ESTADO_PERSONA,
            vetado: esVetado ? 'Sí' : 'No',
            estado_veto: esVetado ? 2 : 0,
            estado_sancion: tieneSancion ? 1 : 0,
            TIENE_VETO_PERMANENTE: esVetado ? 1 : 0,
            TIENE_SANCION: (esVetado || tieneSancion) ? 1 : 0,
            esVetado,
            esDePorVida: esVetado,
            raw: item,
          }
        })

        setSancionados(parsedList)
        setPaginaActual(currentPage)
        setTotalPaginas(Math.max(1, lastPage))
        setTotalRegistros(total > 0 ? total : parsedList.length)
      } catch (err) {
        console.error('Error al obtener lista de sancionados reales:', err)
        setSancionados([])
      } finally {
        setLoading(false)
      }
    },
    []
  )

  useEffect(() => {
    if (autoFetch) {
      fetchSancionados(1, '', null)
    }
  }, [autoFetch, fetchSancionados])

  const handlePageChange = (nuevaPagina: number) => {
    if (nuevaPagina === paginaActual || loading) return
    setPaginaActual(nuevaPagina)
    fetchSancionados(nuevaPagina, currentSearchRef.current, filtroVetoRef.current, filtroEstadoRef.current)
  }

  const handleBuscarGlobal = (valor: string) => {
    currentSearchRef.current = valor
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
    searchDebounceRef.current = setTimeout(() => {
      setPaginaActual(1)
      fetchSancionados(1, valor, filtroVetoRef.current, filtroEstadoRef.current)
    }, 450)
  }

  const handleColumnFilterChange = useCallback((filters: any) => {
    let nuevoVeto: number | string | null = null
    const val = filters?.vetado !== undefined ? filters.vetado : filters?.estado_veto

    if (val === '2' || val === 2 || String(val).toLowerCase() === 'si' || String(val).toLowerCase() === 'sí') {
      nuevoVeto = 2
    } else if (val === '0' || val === 0 || String(val).toLowerCase() === 'no') {
      nuevoVeto = 0
    } else {
      nuevoVeto = null
    }

    const valEstado = filters?.estado !== undefined ? filters.estado : filters?.estado_usuario
    const nuevoEstado = valEstado && String(valEstado).trim() !== '' ? String(valEstado).trim() : null

    filtroVetoRef.current = nuevoVeto
    filtroEstadoRef.current = nuevoEstado
    setFiltroVeto(nuevoVeto)
    setFiltroEstado(nuevoEstado)
    setPaginaActual(1)
    fetchSancionados(1, currentSearchRef.current, nuevoVeto, nuevoEstado)
  }, [fetchSancionados])

  const handleRecargar = () => {
    currentSearchRef.current = ''
    filtroVetoRef.current = null
    filtroEstadoRef.current = null
    setFiltroVeto(null)
    setFiltroEstado(null)
    setPaginaActual(1)
    setTableKey((prev) => prev + 1)
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

    console.log('[DEBUG] Intentando quitar sanción para item:', item)
    const idSancion = item.id_sancion ?? item.ID_SANCION ?? item.id_persona ?? item.id
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

    const result = await Swal.fire({
      title: '¿Quitar Sanción?',
      text: `¿Desea retirar la sanción al usuario ${item.Nombres} ${item.Apellidos}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#198754',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, quitar sanción',
      cancelButtonText: 'Cancelar',
    })

    if (!result.isConfirmed) return

    const tienePermiso = await verificarAccionEnServidor('btn_quitar_sancion')
    if (!tienePermiso) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para quitar sanciones.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    setProcesandoId(item.id)
    try {
      await QuitarSancion(idSancion, {
        id_persona: item.id_persona ?? item.ID_PERSONA,
        ID_PERSONA: item.id_persona ?? item.ID_PERSONA,
        id_sancion: idSancion,
        ID_SANCION: idSancion,
      })

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
    }
  }

  // Sancionar de por vida
  const handleSancionarDePorVida = async (item: SancionItem) => {
    if (!canSancionPermanente) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para sancionar permanentemente.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    const idPersona = item.id_persona ?? item.ID_PERSONA ?? item.raw?.ID_PERSONA

    const result = await Swal.fire({
      title: '¿Sancionar de por vida?',
      text: `Esta acción inhabilitará permanentemente a ${item.Nombres} ${item.Apellidos}. Ingrese el motivo de la sanción:`,
      input: 'textarea',
      inputValue: 'Sanción de por vida por falta grave',
      inputPlaceholder: 'Escriba aquí el motivo o justificación...',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, sancionar de por vida',
      cancelButtonText: 'Cancelar',
      inputValidator: (value) => {
        if (!value || !value.trim()) {
          return 'Debe ingresar un motivo para registrar la sanción de por vida.'
        }
        return null
      },
    })

    if (!result.isConfirmed) return

    if (!canGuardarSancionPermanente) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para guardar la sanción de forma permanente.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    const tienePermiso = await verificarAccionEnServidor('btn_guardar_sancion_permanente')
    if (!tienePermiso) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para guardar la sanción de forma permanente.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    setProcesandoId(item.id)
    try {
      await SancionarDePorVida({
        ID_INSCRIPCION: item.ID_INSCRIPCION ?? item.raw?.ID_INSCRIPCION,
        MOTIVO_VETO: result.value,
        id_persona: idPersona,
        ID_PERSONA: idPersona,
        motivo: result.value,
        detalle: result.value,
      })

      Swal.fire({
        icon: 'success',
        title: '¡Sanción permanente!',
        text: 'El usuario fue sancionado de por vida con éxito.',
        timer: 1800,
        showConfirmButton: false,
      })

      fetchSancionados(paginaActualRef.current, currentSearchRef.current)
    } catch (error: any) {
      console.error('Error al sancionar de por vida:', error)
      const data = error?.response?.data
      if (
        data?.message &&
        (data.message.toLowerCase().includes('veto permanente') ||
          data.message.toLowerCase().includes('ya tiene un veto'))
      ) {
        Swal.fire({
          icon: 'info',
          title: 'Usuario Ya Vetado',
          text: data.message,
          confirmButtonColor: '#0d6efd',
          confirmButtonText: 'Entendido',
        })
        fetchSancionados(paginaActualRef.current, currentSearchRef.current)
        return
      }
      const msg = data?.message || error?.message || 'Ocurrió un error al registrar la sanción de por vida.'
      Swal.fire({
        icon: 'error',
        title: 'Error al sancionar',
        text: msg,
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
    } finally {
      setProcesandoId(null)
    }
  }

  return {
    sancionados,
    loading,
    procesandoId,
    paginaActual,
    totalPaginas,
    totalRegistros,
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
    handleSancionarDePorVida,
    getBadgeColorSancion,
    getBadgeColorUsuario,
    verificarAccionEnServidor,
  }
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

export default useSanciones
