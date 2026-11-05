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
  if (s.includes('vida') || s.includes('permanente') || s.includes('vet')) {
    return 'danger'
  }
  if (s.includes('sancion') || s.includes('sancionado') || s === '2') {
    return 'warning'
  }
  if (s.includes('activo') || s.includes('sin sancion') || s === '0' || s === 'disponible') {
    return 'success'
  }
  return 'warning'
}

export const esPersonaSancionada = (item: any): boolean => {
  if (!item) return false
  return Boolean(
    item.ESTADO_SANCION === 1 ||
    item.ESTADO_SANCION === '1' ||
    item.ESTADO_SANCION === 2 ||
    item.ESTADO_SANCION === '2' ||
    item.ESTADO_PERSONA === 2 ||
    item.ESTADO_PERSONA === '2' ||
    (Array.isArray(item.vetos) && item.vetos.some((v: any) => v.ESTADO_VETO === 2 || v.ESTADO_VETO === '2' || v.estado_veto === 2 || v.estado_veto === '2')) ||
    (Array.isArray(item.raw?.vetos) && item.raw.vetos.some((v: any) => v.ESTADO_VETO === 2 || v.ESTADO_VETO === '2' || v.estado_veto === 2 || v.estado_veto === '2')) ||
    item.ESTADO_VETO === 2 ||
    item.ESTADO_VETO === '2' ||
    item.estado_veto === 2 ||
    item.estado_veto === '2' ||
    item.TIENE_VETO_PERMANENTE === 1 ||
    item.TIENE_VETO_PERMANENTE === '1' ||
    item.TIENE_SANCION === 1 ||
    item.TIENE_SANCION === '1' ||
    (Array.isArray(item.historial_sanciones) &&
      item.historial_sanciones.some(
        (s: any) =>
          s.estado === 1 ||
          s.estado === '1' ||
          s.estado === 2 ||
          s.estado === '2' ||
          s.ESTADO_SANCION === 1 ||
          s.ESTADO_SANCION === '1' ||
          s.ESTADO_VETO === 2 ||
          s.ESTADO_VETO === '2'
      )) ||
    String(item.sancionado || '').toLowerCase().includes('con sancion') ||
    String(item.ESTADO_PRESTAMO || '').toLowerCase().includes('sancion') ||
    (String(item.ESTADO || '').toLowerCase().includes('sancion') &&
      !String(item.ESTADO || '').toLowerCase().includes('sin sancion')) ||
    String(item.ESTADO || '').toLowerCase().includes('vet') ||
    String(item.estado || '').toLowerCase().includes('vet')
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

      let estadoParam: string | undefined = undefined
      if (targetEstado === 'Activo' || targetEstado === '1') {
        estadoParam = '1'
      } else if (targetEstado === 'Inactivo' || targetEstado === '0') {
        estadoParam = '0'
      }

      try {
        const response = await buscarSancionados(query, targetPage, targetVeto, estadoParam)
        
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

        // 1. Deduplicamos primero TODAS las filas recibidas para recopilar el historial completo de sanciones
        // (tanto las activas como las históricas previas) y unificar los datos de la persona
        const dedupedItems = deduplicarPersonas(rawItems)

        // 2. Filtramos para asegurar que SÓLO se muestren usuarios con sanción activa real
        const listaAProcesar = dedupedItems.filter(esPersonaSancionada)

        if (listaAProcesar.length > 0) {
          console.log('[DEBUG] Datos crudos del primer sancionado:', listaAProcesar[0])
        }

        const parsedList: SancionItem[] = listaAProcesar.map((item: any, index: number) => {
          const id = item.ID_PERSONA ?? item.id ?? item.ID_PRESTAMO ?? item.ID_SANCION ?? index + 1
          
          const rawListSanciones = [
            ...(Array.isArray(item.vetos) ? item.vetos : []),
            ...(Array.isArray(item.raw?.vetos) ? item.raw.vetos : []),
            ...(Array.isArray(item.historial_sanciones) ? item.historial_sanciones : []),
            ...(Array.isArray(item.sanciones) ? item.sanciones : []),
            ...(Array.isArray(item.raw?.sanciones) ? item.raw.sanciones : []),
            ...(item.FECHAINICIO_SANCION || item.FECHAFIN_SANCION || item.DETALLE_SANCION ? [{
              id: item.ID_SANCION ?? item.id_sancion,
              inicio: item.FECHAINICIO_SANCION,
              fin: item.FECHAFIN_SANCION,
              detalle: item.DETALLE_SANCION,
              estado: item.ESTADO_SANCION,
            }] : [])
          ]

          const historialSanciones = sanitizarHistorialSanciones(rawListSanciones)

          const principal = historialSanciones[0] || {
            id: item.ID_SANCION,
            inicio: formatFecha(item.FECHAINICIO_SANCION),
            fin: formatFecha(item.FECHAFIN_SANCION),
            detalle: item.DETALLE_SANCION || 'Sanción registrada en el sistema',
          }

          // Otras sanciones adicionales (todas las demás que tenga el usuario)
          const otrasSanciones = historialSanciones.slice(1)

          const vetoObj =
            (Array.isArray(item.vetos) && item.vetos.find((v: any) => v.ESTADO_VETO === 2 || v.ESTADO_VETO === '2' || v.estado_veto === 2 || v.estado_veto === '2')) ||
            (Array.isArray(item.raw?.vetos) && item.raw.vetos.find((v: any) => v.ESTADO_VETO === 2 || v.ESTADO_VETO === '2' || v.estado_veto === 2 || v.estado_veto === '2')) ||
            null

          const tieneVetoEnArray = Boolean(vetoObj)

          const esVetado = Boolean(
            tieneVetoEnArray ||
            item.ESTADO_VETO === 2 ||
            item.ESTADO_VETO === '2' ||
            item.estado_veto === 2 ||
            item.estado_veto === '2' ||
            item.TIENE_VETO_PERMANENTE === 1 ||
            item.TIENE_VETO_PERMANENTE === '1' ||
            item.esVetado ||
            item.esDePorVida ||
            item.vetado === 'Sí' ||
            item.status === 'Vetado' ||
            (Array.isArray(historialSanciones) &&
              historialSanciones.some(
                (s: any) =>
                  s.estado === 2 ||
                  s.estado === '2' ||
                  s.ESTADO_VETO === 2 ||
                  s.ESTADO_VETO === '2' ||
                  s.fin === 'Indefinido'
              ))
          )

          // Extracción prioritaria del ID real de la sanción/veto
          const idSancionReal = 
            (esVetado ? (vetoObj?.ID_VETO ?? vetoObj?.id_veto) : undefined) ??
            principal.id ??
            item.ID_SANCION ?? 
            item.id_sancion ?? 
            item.historial_sanciones?.[0]?.id ?? 
            item.historial_sanciones?.[0]?.ID_SANCION ?? 
            item.sancion?.ID_SANCION ?? 
            item.sancion?.id ??
            item.ID_PRESTAMO ??
            item.id_prestamo ??
            id

          const idPersona = item.ID_PERSONA ?? item.id_persona ?? item.id
          const idPrestamo = item.ID_PRESTAMO ?? item.id_prestamo

          const status = esVetado ? 'Vetado' : 'Sancionado'

          const estadoRaw = String(
            item.ESTADO_PERSONA ??
            item.estado_persona ??
            item.raw?.ESTADO_PERSONA ??
            item.raw?.estado_persona ??
            item.ESTADO ??
            item.estado ??
            'Activo'
          )
          let estadoUsuario: 'Activo' | 'Inactivo' = 'Activo'
          if (
            estadoRaw.toLowerCase().includes('inactiv') ||
            estadoRaw === '0' ||
            item.ESTADO_PERSONA === 0 ||
            item.ESTADO_PERSONA === '0' ||
            item.raw?.ESTADO_PERSONA === 0 ||
            item.raw?.ESTADO_PERSONA === '0'
          ) {
            estadoUsuario = 'Inactivo'
          }

          const libroTitulo = item.TITULO_LIBROS || item.Libro || item.libro || ''
          const libroIsbn = item.ISBN_LIBROS || item.ISBN || item.isbn || ''

          return {
            id,
            id_sancion: idSancionReal,
            ID_SANCION: idSancionReal,
            ID_INSCRIPCION: item.ID_INSCRIPCION ?? item.id_inscripcion ?? item.inscripciones?.[0]?.ID_INSCRIPCION ?? item.raw?.ID_INSCRIPCION ?? item.raw?.inscripciones?.[0]?.ID_INSCRIPCION,
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
            Fecha_inicio_sancion:
              (esVetado ? (formatFecha(vetoObj?.FECHA_VETO || vetoObj?.fecha_veto) || principal.inicio) : principal.inicio) ||
              formatFecha(item.FECHAINICIO_SANCION || item.FECHA_VETO || item.fecha_veto),
            Fecha_fin_sancion: esVetado
              ? 'Indefinido (De por vida)'
              : (principal.fin || formatFecha(item.FECHAFIN_SANCION) || 'Indefinido'),
            Motivo_sancion: esVetado
              ? (vetoObj?.MOTIVO_VETO || vetoObj?.motivo_veto || item.MOTIVO_VETO || item.motivo_veto || principal.detalle || 'Veto permanente registrado en el sistema')
              : (principal.detalle || item.DETALLE_SANCION || 'Sanción registrada en el sistema'),
            historial_sanciones: historialSanciones,
            otras_sanciones: otrasSanciones,
            total_sanciones: Math.max(historialSanciones.length, 1),
            status,
            estado: estadoUsuario,
            estado_usuario: estadoUsuario,
            ESTADO_PERSONA: item.ESTADO_PERSONA ?? item.raw?.ESTADO_PERSONA,
            vetado: esVetado ? 'Sí' : 'No',
            estado_sancion: esVetado ? 2 : item.ESTADO_SANCION,
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
