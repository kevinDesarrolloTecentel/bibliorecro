import { useState, useCallback, useEffect } from 'react'
import Swal from 'sweetalert2'
import apiClient, { BACKEND_API_BASE } from '@/Service/apiClient'
import { STORAGE_BASE_URL } from '@/utils/imageUtils'
import { PersonasE } from '@/Service/tab/Persona'

export { STORAGE_BASE_URL }
export const API_BASE_URL = BACKEND_API_BASE

export interface PersonaRenovacion {
  ID_PERSONA?: number | string
  ID_GENERO?: number | string
  ID_TIPOIDENTIFICACION?: number | string
  ID_NACIONALIDAD?: number | string
  ID_ESTADOCIVIL?: number | string
  IDENTIFICACION_PERSONA?: string
  NOMBRE_PERSONA?: string
  APELLIDO_PERSONA?: string
  TELEFONO_PERSONA?: string
  CELULAR_PERSONA?: string
  CORREO_PERSONA?: string
  DIRECCION_PERSONA?: string
  DETALLE_PERSONA?: string
  EDAD_PERSONA?: number | string
  DETALLE_INSCRIPCION?: string
  FOTO_PERSONA?: string
  ESTADO_INSCRIPCION?: number | string
  ID_INSCRIPCION?: number | string
  FECHA_PERSONA?: string
  ESTADOINSCRIPCION_PERSONA?: number
  tipo_usuario?: string
  FECHAINICIO_INSCRIPCION?: string
  FECHAREGISTRO_PERSONA?: string
  COSTO_INSCRIPCION?: number | string
  ESTADO_PERSONA?: number
  [key: string]: any
}

export const useRenovaciones = () => {
  const [personas, setPersonas] = useState<PersonaRenovacion[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [submitting, setSubmitting] = useState<boolean>(false)

  const [visibleEditar, setVisibleEditar] = useState<boolean>(false)
  const [visibleAceptar, setVisibleAceptar] = useState<boolean>(false)

  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState<PersonaRenovacion | null>(null)
  const [detalleRenovacion, setDetalleRenovacion] = useState<string>('')

  const [details, setDetails] = useState<(number | string)[]>([])

  const toggleDetails = (id: number | string) => {
    setDetails((prev) => (prev.includes(id) ? [] : [id]))
  }

  const fetchSolicitudes = useCallback(async () => {
    setLoading(true)
    try {
      const data = await PersonasE()
      const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
      setPersonas(list)
    } catch (error) {
      console.error('Error al obtener solicitudes de renovación', error)
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Hubo un error al obtener la lista de solicitudes.',
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSolicitudes()
  }, [fetchSolicitudes])

  const handleAbrirEditar = (item: PersonaRenovacion) => {
    setSolicitudSeleccionada(item)
    setVisibleEditar(true)
  }

  const handleAbrirAceptar = (item: PersonaRenovacion) => {
    setSolicitudSeleccionada(item)
    setDetalleRenovacion('')
    setVisibleAceptar(true)
  }

  const handleAceptarSolicitud = async () => {
    if (!solicitudSeleccionada || submitting) return
    setSubmitting(true)
    try {
      await apiClient.post(`${BACKEND_API_BASE}/tab-persona/aceptarNew`, {
        ID_PERSONA: solicitudSeleccionada.ID_PERSONA,
        tipo_usuario: solicitudSeleccionada.tipo_usuario,
        ID_INSCRIPCION: solicitudSeleccionada.ID_INSCRIPCION,
        FECHA_PERSONA: solicitudSeleccionada.FECHA_PERSONA,
        DETALLE_RENOVACIONES: detalleRenovacion,
      })

      setVisibleAceptar(false)
      setSolicitudSeleccionada(null)
      setDetalleRenovacion('')
      fetchSolicitudes()

      Swal.fire({
        icon: 'success',
        title: 'Éxito!',
        text: 'Inscripción activada con éxito.',
        confirmButtonColor: '#04833c',
      })
    } catch (err) {
      console.error('Error al aceptar solicitud', err)
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Hubo un error al renovar o activar la inscripción.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return {
    personas,
    loading,
    submitting,
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
  }
}
