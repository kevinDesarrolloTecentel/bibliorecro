import { useState, useCallback, useEffect } from 'react'
import axios from 'axios'
import Swal from 'sweetalert2'

export const API_BASE_URL = 'https://bibliobackend.ccelrecreo.com:1500/server.php/api'
export const STORAGE_BASE_URL = 'https://bibliobackend.ccelrecreo.com:1500/storage/app/public'

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

export interface CatalogOption {
  label: string
  value: number | string
}

export const useRenovaciones = () => {
  const [personas, setPersonas] = useState<PersonaRenovacion[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [submitting, setSubmitting] = useState<boolean>(false)

  const [generos, setGeneros] = useState<CatalogOption[]>([])
  const [tiposIdentificacion, setTiposIdentificacion] = useState<CatalogOption[]>([])
  const [nacionalidades, setNacionalidades] = useState<CatalogOption[]>([])
  const [estadosCiviles, setEstadosCiviles] = useState<CatalogOption[]>([])

  const [visibleEditar, setVisibleEditar] = useState<boolean>(false)
  const [visibleAceptar, setVisibleAceptar] = useState<boolean>(false)

  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState<PersonaRenovacion | null>(null)
  const [detalleRenovacion, setDetalleRenovacion] = useState<string>('')

  const fetchSolicitudes = useCallback(async () => {
    setLoading(true)
    try {
      const endpoint = `${API_BASE_URL}/personasE`
      const { data } = await axios.get(endpoint)
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

    axios
      .get(`${API_BASE_URL}/generos`)
      .then(({ data }) => {
        const raw = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
        setGeneros(
          raw
            .filter((g: any) => g.ID_GENERO)
            .map((g: any) => ({
              label: g.NOMBRE_GENERO,
              value: g.ID_GENERO,
            })),
        )
      })
      .catch((err) => console.error('Error al cargar géneros', err))

    axios
      .get(`${API_BASE_URL}/tipoIdentificacions`)
      .then(({ data }) => {
        const raw = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
        setTiposIdentificacion(
          raw
            .filter((t: any) => t.ID_TIPOIDENTIFICACION)
            .map((t: any) => ({
              label: t.NOMBRE_TIPOIDENTIFICACION,
              value: t.ID_TIPOIDENTIFICACION,
            })),
        )
      })
      .catch((err) => console.error('Error al cargar tipos de identificación', err))

    axios
      .get(`${API_BASE_URL}/nacionalidads`)
      .then(({ data }) => {
        const raw = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
        setNacionalidades(
          raw
            .filter((n: any) => n.ID_NACIONALIDAD)
            .map((n: any) => ({
              label: n.NOMBRE_NACIONALIDAD,
              value: n.ID_NACIONALIDAD,
            })),
        )
      })
      .catch((err) => console.error('Error al cargar nacionalidades', err))

    axios
      .get(`${API_BASE_URL}/estadoCivils`)
      .then(({ data }) => {
        const raw = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
        setEstadosCiviles(
          raw
            .filter((e: any) => e.ID_ESTADOCIVIL)
            .map((e: any) => ({
              label: e.NOMBRE_ESTADOCIVIL,
              value: e.ID_ESTADOCIVIL,
            })),
        )
      })
      .catch((err) => console.error('Error al cargar estados civiles', err))
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
      const endpoint = `${API_BASE_URL}/aceptarNew`
      await axios.post(endpoint, {
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

  const handleActualizarPersona = async (formData: FormData, idPersona: number | string) => {
    setSubmitting(true)
    formData.append('_method', 'PUT')
    const endpoint = `${API_BASE_URL}/persona/${idPersona}`
    try {
      await axios.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      setVisibleEditar(false)
      setSolicitudSeleccionada(null)
      fetchSolicitudes()

      Swal.fire({
        icon: 'success',
        title: 'ÉXITO!',
        text: 'Usuario actualizado con éxito.',
        confirmButtonColor: '#04833c',
      })
    } catch (err) {
      console.error('Error al actualizar persona', err)
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Hubo un error al guardar los datos del usuario.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return {
    personas,
    loading,
    submitting,
    generos,
    tiposIdentificacion,
    nacionalidades,
    estadosCiviles,
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
    handleActualizarPersona,
  }
}
