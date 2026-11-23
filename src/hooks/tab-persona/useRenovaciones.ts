import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Swal from 'sweetalert2'
import { RootState } from '@/store'
import { PersonasE, AceptarInscripcionNew } from '@/Service/tab/Persona'
import { TabPersona, PersonaRenovacion } from '@/models/tab/persona.model'
import {
  setSolicitudes,
  setTotalesSolicitudes,
  setSolicitudSeleccionada as setSolicitudSeleccionadaAction,
  removerSolicitud,
} from '@/slices/personaSlice'
import { usePermissions } from '@/hooks/auth/usePermissions'
import { parseApiErrors, showErrorAlert } from '@/utils/errors'

export type { PersonaRenovacion }

export const useRenovaciones = () => {
  const dispatch = useDispatch()
  const { canDoAction, verificarAccionEnServidor } = usePermissions()

  // Permisos centralizados para Renovaciones y Nuevos
  const canVerUsuario = canDoAction('btn_ver_usuario_renovaciones')
  const canAceptarSolicitud = canDoAction('btn_aceptar_solicitud')
  const canMostrarInfo = canDoAction('btn_mostrar_info_renovaciones')
  const canActivarUsuario = canDoAction('btn_activar_usuario')

  // Estado global desde Redux Toolkit
  const solicitudes = useSelector((state: RootState) => state.personas.solicitudes)
  const totalesSolicitudes = useSelector((state: RootState) => state.personas.totalesSolicitudes)

  // Estados locales de UI y envío
  const [loading, setLoading] = useState<boolean>(false)
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [paginaActual, setPaginaActual] = useState<number>(1)
  const [itemsPerPage, setItemsPerPage] = useState<number>(10)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [tipoFiltro, setTipoFiltro] = useState<string>('')
  const tipoFiltroRef = useRef<string>('')
  const isFetchingRef = useRef<boolean>(false)
  const [tableKey, setTableKey] = useState<number>(0)

  // Modales
  const [visibleEditar, setVisibleEditar] = useState<boolean>(false)
  const [visibleAceptar, setVisibleAceptar] = useState<boolean>(false)
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState<TabPersona | null>(null)
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

  // Petición al backend conectada directamente a Redux
  const fetchSolicitudes = useCallback(
    async (tipo?: string) => {
      if (isFetchingRef.current) return
      isFetchingRef.current = true
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

        const res = await PersonasE(params)
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []
        dispatch(setSolicitudes(list))

        if (res?.totales) {
          dispatch(setTotalesSolicitudes(res.totales))
        }
      } catch (error) {
        console.error('[useRenovaciones] Error al obtener solicitudes:', error)
        const { title, messages } = parseApiErrors(
          error,
          'Hubo un error al obtener la lista de solicitudes de renovación y nuevos usuarios.',
        )
        showErrorAlert(title, messages)
      } finally {
        isFetchingRef.current = false
        setLoading(false)
      }
    },
    [dispatch],
  )

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
    let list: TabPersona[] = solicitudes
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
  }, [solicitudes, searchTerm, tipoFiltro])

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

  const handleAbrirEditar = async (item: TabPersona) => {
    if (!canVerUsuario) {
      showErrorAlert('Acceso Denegado', ['No tienes permisos para ver los datos del usuario.'])
      return
    }

    const tienePermiso = await verificarAccionEnServidor('btn_ver_usuario_renovaciones')
    if (!tienePermiso) {
      showErrorAlert('Acceso Denegado', ['No tienes permisos para ver los datos del usuario.'])
      return
    }

    setSolicitudSeleccionada(item)
    dispatch(setSolicitudSeleccionadaAction(item))
    setVisibleEditar(true)
  }

  const handleAbrirAceptar = (item: TabPersona) => {
    if (!canAceptarSolicitud) {
      showErrorAlert('Acceso Denegado', ['No tienes permisos para aceptar solicitudes.'])
      return
    }
    setSolicitudSeleccionada(item)
    dispatch(setSolicitudSeleccionadaAction(item))
    setDetalleRenovacion('')
    setVisibleAceptar(true)
  }

  const handleAceptarSolicitud = async () => {
    if (!canActivarUsuario) {
      showErrorAlert('Acceso Denegado', ['No tienes permisos para activar la inscripción del usuario.'])
      return
    }

    const tienePermiso = await verificarAccionEnServidor('btn_activar_usuario')
    if (!tienePermiso) {
      showErrorAlert('Acceso Denegado', ['No tienes permisos para activar la inscripción del usuario.'])
      return
    }

    if (!solicitudSeleccionada || submitting) return

    if (!detalleRenovacion.trim()) {
      showErrorAlert('Campo obligatorio', [
        'El detalle u observaciones de la activación es obligatorio. Por favor ingrese las observaciones.',
      ])
      return
    }

    setSubmitting(true)
    try {
      await AceptarInscripcionNew({
        ID_PERSONA: solicitudSeleccionada.ID_PERSONA,
        tipo_usuario: solicitudSeleccionada.tipo_usuario,
        ID_INSCRIPCION: solicitudSeleccionada.ID_INSCRIPCION,
        FECHA_PERSONA: solicitudSeleccionada.FECHA_PERSONA,
        DETALLE_RENOVACIONES: detalleRenovacion.trim(),
      })

      setVisibleAceptar(false)
      setDetalleRenovacion('')

      if (solicitudSeleccionada.ID_PERSONA) {
        dispatch(removerSolicitud(solicitudSeleccionada.ID_PERSONA))
      }
      setSolicitudSeleccionada(null)
      dispatch(setSolicitudSeleccionadaAction(null))

      Swal.fire({
        icon: 'success',
        title: '¡Inscripción activada!',
        text: 'La inscripción se activó correctamente.',
        timer: 1800,
        showConfirmButton: false,
      })

      await fetchSolicitudes(tipoFiltroRef.current)
    } catch (err) {
      console.error('[useRenovaciones] Error al aceptar solicitud:', err)
      const { title, messages } = parseApiErrors(err, 'Hubo un error al renovar o activar la inscripción.')
      showErrorAlert(title, messages)
    } finally {
      setSubmitting(false)
    }
  }

  return {
    personas: solicitudes,
    solicitudes,
    totalesSolicitudes,
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
