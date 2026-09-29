import { useState, useCallback, useEffect } from 'react'
import Swal from 'sweetalert2'
import apiClient, { BACKEND_API_BASE } from '@/Service/apiClient'
import { STORAGE_BASE_URL } from '@/.env'
import { ListarGenero } from '@/Service/tab/Genero'
import { listarTipoIdentificacion } from '@/Service/tab/TipoIdentificacion'
import { ListarNacionalidad } from '@/Service/tab/Nacionalidad'
import { ListarEstadoCivil } from '@/Service/tab/EstadoCivil'
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

    const cargarCatalogos = async () => {
      try {
        const [resGen, resTipos, resNac, resEst] = await Promise.allSettled([
          ListarGenero(),
          listarTipoIdentificacion(),
          ListarNacionalidad(),
          ListarEstadoCivil(),
        ])

        if (resGen.status === 'fulfilled') {
          const raw = Array.isArray(resGen.value?.data) ? resGen.value.data : Array.isArray(resGen.value) ? resGen.value : []
          setGeneros(
            raw
              .filter((g: any) => g.ID_GENERO)
              .map((g: any) => ({
                label: g.NOMBRE_GENERO,
                value: g.ID_GENERO,
              })),
          )
        }

        if (resTipos.status === 'fulfilled') {
          const raw = Array.isArray(resTipos.value?.data) ? resTipos.value.data : Array.isArray(resTipos.value) ? resTipos.value : []
          setTiposIdentificacion(
            raw
              .filter((t: any) => t.ID_TIPOIDENTIFICACION)
              .map((t: any) => ({
                label: t.NOMBRE_TIPOIDENTIFICACION,
                value: t.ID_TIPOIDENTIFICACION,
              })),
          )
        }

        if (resNac.status === 'fulfilled') {
          const raw = Array.isArray(resNac.value?.data) ? resNac.value.data : Array.isArray(resNac.value) ? resNac.value : []
          setNacionalidades(
            raw
              .filter((n: any) => n.ID_NACIONALIDAD)
              .map((n: any) => ({
                label: n.NOMBRE_NACIONALIDAD,
                value: n.ID_NACIONALIDAD,
              })),
          )
        }

        if (resEst.status === 'fulfilled') {
          const raw = Array.isArray(resEst.value?.data) ? resEst.value.data : Array.isArray(resEst.value) ? resEst.value : []
          setEstadosCiviles(
            raw
              .filter((e: any) => e.ID_ESTADOCIVIL)
              .map((e: any) => ({
                label: e.NOMBRE_ESTADOCIVIL,
                value: e.ID_ESTADOCIVIL,
              })),
          )
        }
      } catch (err) {
        console.error('Error al cargar catálogos en renovaciones', err)
      }
    }

    cargarCatalogos()
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

  const handleActualizarPersona = async (formData: FormData, idPersona: number | string) => {
    setSubmitting(true)
    formData.append('_method', 'PUT')
    try {
      await apiClient.post(`${BACKEND_API_BASE}/tab-persona/persona/${idPersona}`, formData, {
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
