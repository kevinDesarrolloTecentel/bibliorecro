import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import Swal from 'sweetalert2'
import { PersonasE, AceptarInscripcionNew } from '@/Service/tab/Persona'
import { PersonaRenovacion } from '@/models/tab/persona.model'
import { usePermissions } from '@/context/PermissionsContext'

// Re-exportamos para compatibilidad si algún componente lo requiere
export type { PersonaRenovacion }

export const useRenovaciones = () => {
  const { canDoAction, verificarAccionEnServidor } = usePermissions()

  // Permisos centralizados para Renovaciones y Nuevos
  const canVerUsuario = canDoAction('btn_ver_usuario_renovaciones')
  const canAceptarSolicitud = canDoAction('btn_aceptar_solicitud')
  const canMostrarInfo = canDoAction('btn_mostrar_info_renovaciones')
  const canActivarUsuario = canDoAction('btn_activar_usuario')

  const [personas, setPersonas] = useState<PersonaRenovacion[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [submitting, setSubmitting] = useState<boolean>(false)

  // Estados de paginación y búsqueda
  const [paginaActual, setPaginaActual] = useState<number>(1)
  const [itemsPerPage, setItemsPerPage] = useState<number>(10)
  const [searchTerm, setSearchTerm] = useState<string>('')

  // Filtro por tipo (Nuevo / Renovación)
  const [tipoFiltro, setTipoFiltro] = useState<string>('')
  const tipoFiltroRef = useRef<string>('')
  const [tableKey, setTableKey] = useState<number>(0)

  // Modales
  const [visibleEditar, setVisibleEditar] = useState<boolean>(false)
  const [visibleAceptar, setVisibleAceptar] = useState<boolean>(false)

  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState<PersonaRenovacion | null>(null)
  const [detalleRenovacion, setDetalleRenovacion] = useState<string>('')

  // Filas colapsables de detalles
  const [details, setDetails] = useState<(number | string)[]>([])

  const toggleDetails = (id: number | string) => {
    if (!canMostrarInfo) return
    setDetails((prev) => (prev.includes(id) ? [] : [id]))
  }

  const handleSearchChange = (term: string) => {
    setSearchTerm(term || '')
    setPaginaActual(1)
  }

  const fetchSolicitudes = useCallback(async (tipo?: string) => {
    setLoading(true)
    try {
      const tipoVal = tipo !== undefined ? tipo : tipoFiltroRef.current
      const params: Record<string, any> = {}
      if (tipoVal && tipoVal.trim() !== '') {
        const t = tipoVal.trim().toLowerCase()
        if (t.includes('renov')) {
          params.tipo = 'renovacion'
        } else if (t.includes('nuev')) {
          params.tipo = 'nuevo'
        } else {
          params.tipo = t
        }
      }
      const data = await PersonasE(params)
      const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
      setPersonas(list)
    } catch (error) {
      console.error('Error al obtener solicitudes de renovación', error)
      Swal.fire({
        icon: 'error',
        title: 'Error al consultar',
        text: 'Hubo un error al obtener la lista de solicitudes.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSolicitudes()
  }, [fetchSolicitudes])

  const handleColumnFilterChange = useCallback(
    (filters: Record<string, any>) => {
      const rawTipo = filters?.tipo !== undefined && filters?.tipo !== null ? String(filters.tipo).trim() : ''
      tipoFiltroRef.current = rawTipo
      setTipoFiltro(rawTipo)
      setPaginaActual(1)
      fetchSolicitudes(rawTipo)
    },
    [fetchSolicitudes],
  )

  const handleRecargar = useCallback(async () => {
    tipoFiltroRef.current = ''
    setTipoFiltro('')
    setSearchTerm('')
    setPaginaActual(1)
    setTableKey((k) => k + 1)
    await fetchSolicitudes('')
  }, [fetchSolicitudes])

  // Filtrado reactivo en cliente (por búsqueda y tipo)
  const filteredPersonas = useMemo(() => {
    let list = personas
    if (tipoFiltro) {
      const tf = tipoFiltro.toLowerCase().trim()
      list = list.filter((p) => {
        const t = String(p.tipo_usuario || '').toLowerCase().trim()
        if (tf.includes('renov')) return t.includes('renov')
        if (tf.includes('nuev')) return t.includes('nuev')
        return t === tf
      })
    }
    if (!searchTerm.trim()) return list
    const term = searchTerm.toLowerCase().trim()
    return list.filter((p) => {
      const ced = String(p.IDENTIFICACION_PERSONA || '').toLowerCase()
      const nom = String(p.NOMBRE_PERSONA || '').toLowerCase()
      const ape = String(p.APELLIDO_PERSONA || '').toLowerCase()
      const email = String(p.CORREO_PERSONA || '').toLowerCase()
      return ced.includes(term) || nom.includes(term) || ape.includes(term) || email.includes(term)
    })
  }, [personas, searchTerm, tipoFiltro])

  const totalRegistros = filteredPersonas.length
  const totalPaginas = Math.max(1, Math.ceil(totalRegistros / itemsPerPage))
  const validActivePage = Math.min(paginaActual, totalPaginas)

  const paginatedItems = useMemo(() => {
    const start = (validActivePage - 1) * itemsPerPage
    return filteredPersonas.slice(start, start + itemsPerPage)
  }, [filteredPersonas, validActivePage, itemsPerPage])

  const getBadgeColor = (tipo?: string) => {
    switch (tipo) {
      case 'Renovacion':
      case 'Renovación':
        return 'danger'
      case 'Nuevo':
        return 'success'
      default:
        return 'info'
    }
  }

  const handleAbrirEditar = async (item: PersonaRenovacion) => {
    if (!canVerUsuario) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para ver los datos del usuario.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    const tienePermiso = await verificarAccionEnServidor('btn_ver_usuario_renovaciones')
    if (!tienePermiso) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para ver los datos del usuario.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    setSolicitudSeleccionada(item)
    setVisibleEditar(true)
  }

  const handleAbrirAceptar = (item: PersonaRenovacion) => {
    if (!canAceptarSolicitud) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para aceptar solicitudes.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }
    setSolicitudSeleccionada(item)
    setDetalleRenovacion('')
    setVisibleAceptar(true)
  }

  const handleAceptarSolicitud = async () => {
    if (!canActivarUsuario) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para activar la inscripción del usuario.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    const tienePermiso = await verificarAccionEnServidor('btn_activar_usuario')
    if (!tienePermiso) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para activar la inscripción del usuario.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    if (!solicitudSeleccionada || submitting) return
    setSubmitting(true)
    try {
      await AceptarInscripcionNew({
        ID_PERSONA: solicitudSeleccionada.ID_PERSONA,
        tipo_usuario: solicitudSeleccionada.tipo_usuario,
        ID_INSCRIPCION: solicitudSeleccionada.ID_INSCRIPCION,
        FECHA_PERSONA: solicitudSeleccionada.FECHA_PERSONA,
        DETALLE_RENOVACIONES: detalleRenovacion,
      })

      setVisibleAceptar(false)
      setSolicitudSeleccionada(null)
      setDetalleRenovacion('')
      fetchSolicitudes(tipoFiltroRef.current)

      Swal.fire({
        icon: 'success',
        title: '¡Inscripción activada!',
        text: 'La inscripción se activó correctamente.',
        timer: 1800,
        showConfirmButton: false,
      })
    } catch (err) {
      console.error('Error al aceptar solicitud', err)
      Swal.fire({
        icon: 'error',
        title: 'Error al activar',
        text: 'Hubo un error al renovar o activar la inscripción.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return {
    personas,
    loading,
    submitting,
    // Paginación y búsqueda
    searchTerm,
    setSearchTerm: handleSearchChange,
    paginaActual: validActivePage,
    setPaginaActual,
    itemsPerPage,
    setItemsPerPage,
    totalRegistros,
    totalPaginas,
    validActivePage,
    paginatedItems,
    getBadgeColor,
    // Filtros de columna
    tipoFiltro,
    setTipoFiltro,
    handleColumnFilterChange,
    handleRecargar,
    tableKey,
    // Modales y acciones
    visibleEditar,
    setVisibleEditar,
    visibleAceptar,
    setVisibleAceptar,
    solicitudSeleccionada,
    detalleRenovacion,
    setDetalleRenovacion,
    fetchSolicitudes,
    handleAbrirEditar,
    handleAbrirAceptar,
    handleAceptarSolicitud,
    details,
    toggleDetails,
    // Permisos
    canVerUsuario,
    canAceptarSolicitud,
    canMostrarInfo,
    canActivarUsuario,
    verificarAccionEnServidor,
  }
}

export default useRenovaciones
