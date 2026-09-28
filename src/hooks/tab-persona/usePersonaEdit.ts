import React, { useState, useEffect } from 'react'
import Swal from 'sweetalert2'
import { useCatalogos } from '../tab-catalogos/useCatalogos'
import { getUserImageUrl } from '@/.env'
import { filterOnlyDigits, filterOnlyLetters } from '@/utils/validations'
import usePersonas from './usePersonas'
import { initialPersona, Persona } from '@/models/tab/persona.model'
import { ActualizarPersonaNueva } from '@/Service/tab/Persona'


export const initialEditFormData: Persona = initialPersona

export interface UsePersonaEditProps {
  personaState?: ReturnType<typeof usePersonas>
  visible?: boolean
  setVisible?: (visible: boolean) => void
  user?: Persona | any
  onSuccess?: () => void
}

export const usePersonaEdit = ({
  personaState,
  visible,
  setVisible,
  user,
  onSuccess,
}: UsePersonaEditProps = {}) => {
  const isVisible =
    visible !== undefined
      ? visible
      : personaState
        ? personaState.modalEdit
        : false

  const currentUser =
    user !== undefined
      ? user
      : personaState
        ? personaState.selectedUser
        : null

  const [formData, setFormData] = useState<Persona>(initialPersona)
  const [loading, setLoading] = useState(false)
  const [previewFoto, setPreviewFoto] = useState<string | null>(null)
  const [fotoActual, setFotoActual] = useState<string>('')
  const {
    tiposId,
    nacionalidades,
    generos,
    estadosCiviles,
    loading: loadingCatalogos,
  } = useCatalogos(isVisible)

  const handleClose = () => {
    setPreviewFoto(null)
    if (setVisible) {
      setVisible(false)
    } else if (personaState) {
      personaState.setModalEdit(false)
    }
  }

  useEffect(() => {
    if (currentUser && isVisible) {
      const raw = currentUser.raw || currentUser || {}
      const fotoRaw =
        currentUser.fotografia ||
        raw.FOTO_PERSONA ||
        ''
      setFotoActual(getUserImageUrl(fotoRaw))
      setPreviewFoto(null)

      const tipoId = raw.ID_TIPOIDENTIFICACION ?? currentUser.id_tipo_identificacion ?? ''
      const nacId = raw.ID_NACIONALIDAD ?? currentUser.id_nacionalidad ?? ''
      const genId = raw.ID_GENERO ?? currentUser.id_genero ?? ''
      const estCivId = raw.ID_ESTADOCIVIL ?? currentUser.id_estado_civil ?? ''

      const fechaRaw =
        raw.FECHA_PERSONA ??
        currentUser.fecha_nacimiento ??
        ''
      const fechaNac =
        fechaRaw && fechaRaw !== 'No registrada'
          ? fechaRaw.includes('T')
            ? fechaRaw.split('T')[0]
            : fechaRaw
          : ''

      let initialEstado = '1'
      const rawEstado = String(
        raw.ESTADO_PERSONA ?? currentUser.estado ?? '1',
      ).trim()
      if (rawEstado === '0' || rawEstado.toLowerCase().includes('inactiv')) {
        initialEstado = '0'
      } else if (rawEstado === '2' || rawEstado.toLowerCase().includes('sancion')) {
        initialEstado = '2'
      } else {
        initialEstado = '1'
      }

      setFormData({
        ID_PERSONA: String(raw.ID_PERSONA ?? currentUser.id ?? ''),
        ID_TIPOIDENTIFICACION: String(tipoId || ''),
        ID_NACIONALIDAD: String(nacId || ''),
        ID_GENERO: String(genId || ''),
        ID_ESTADOCIVIL: String(estCivId || ''),
        IDENTIFICACION_PERSONA: String(
          raw.IDENTIFICACION_PERSONA ?? currentUser.identificacion ?? '',
        ),
        NOMBRE_PERSONA: String(
          raw.NOMBRE_PERSONA ?? currentUser.nombre ?? '',
        ),
        APELLIDO_PERSONA: String(
          raw.APELLIDO_PERSONA ?? currentUser.apellido ?? '',
        ),
        TELEFONO_PERSONA: String(
          raw.TELEFONO_PERSONA ?? currentUser.telefono ?? '',
        ),
        CELULAR_PERSONA: String(
          raw.CELULAR_PERSONA ?? currentUser.celular ?? '',
        ),
        CORREO_PERSONA: String(
          raw.CORREO_PERSONA ?? currentUser.email ?? '',
        ),
        DIRECCION_PERSONA: String(
          raw.DIRECCION_PERSONA ?? currentUser.direccion ?? '',
        ),
        DETALLE_PERSONA: String(
          raw.DETALLE_PERSONA ?? currentUser.detalles ?? '',
        ),
        FECHAREGISTRO_PERSONA: raw.FECHAREGISTRO_PERSONA ?? '',
        FOTO_PERSONA: '',
        FECHA_PERSONA: String(fechaNac || ''),
        ESTADO_PERSONA: initialEstado,
        ESTADOINSCRIPCION_PERSONA: String(raw.ESTADOINSCRIPCION_PERSONA ?? ''),
        EDAD_PERSONA: String(raw.EDAD_PERSONA ?? currentUser.edad ?? ''),
      })
    }
  }, [currentUser, isVisible])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target
    let finalValue = value

    if (name === 'IDENTIFICACION_PERSONA' || name === 'TELEFONO_PERSONA' || name === 'CELULAR_PERSONA') {
      finalValue = filterOnlyDigits(value, 10)
    } else if (name === 'NOMBRE_PERSONA' || name === 'APELLIDO_PERSONA') {
      finalValue = filterOnlyLetters(value)
    }

    setFormData((prev) => ({ ...prev, [name]: finalValue }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (
      !formData.IDENTIFICACION_PERSONA?.toString().trim() ||
      !formData.NOMBRE_PERSONA?.trim() ||
      !formData.APELLIDO_PERSONA?.trim()
    ) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos requeridos',
        text: 'Por favor complete la identificación, nombres y apellidos del usuario.',
      })
      return
    }

    if (formData.IDENTIFICACION_PERSONA?.toString().trim().length !== 10) {
      Swal.fire({
        icon: 'warning',
        title: 'Identificación inválida',
        text: 'La identificación debe contener exactamente 10 dígitos numéricos.',
      })
      return
    }

    if (formData.CELULAR_PERSONA?.toString().trim() && formData.CELULAR_PERSONA.toString().trim().length !== 10) {
      Swal.fire({
        icon: 'warning',
        title: 'Celular inválido',
        text: 'El número de celular debe contener exactamente 10 dígitos numéricos.',
      })
      return
    }

    if (formData.TELEFONO_PERSONA?.toString().trim() && formData.TELEFONO_PERSONA.toString().trim().length !== 10) {
      Swal.fire({
        icon: 'warning',
        title: 'Teléfono fijo inválido',
        text: 'El teléfono fijo debe contener exactamente 10 dígitos numéricos.',
      })
      return
    }

    const idPersona = formData.ID_PERSONA || currentUser?.id || currentUser?.raw?.ID_PERSONA
    if (!idPersona) {
      Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.onmouseenter = Swal.stopTimer;
          toast.onmouseleave = Swal.resumeTimer;
        }
      }).fire({
        icon: "error",
        title: "No se encontró el ID del usuario a editar."
      });
      return
    }

    setLoading(true)
    try {
      const fechaPersona =
        formData.FECHA_PERSONA &&
          formData.FECHA_PERSONA.trim() &&
          formData.FECHA_PERSONA !== 'No registrada'
          ? formData.FECHA_PERSONA.trim().split('T')[0]
          : ''

      let estadoPersona = '1'
      const rawEstadoSubmit = String(formData.ESTADO_PERSONA || '1').trim()
      if (rawEstadoSubmit === '0' || rawEstadoSubmit.toLowerCase().includes('inactiv')) {
        estadoPersona = '0'
      } else if (rawEstadoSubmit === '2' || rawEstadoSubmit.toLowerCase().includes('sancion')) {
        estadoPersona = '2'
      } else {
        estadoPersona = '1'
      }

      const isActivo =
        typeof formData.ESTADOINSCRIPCION_PERSONA === 'boolean'
          ? formData.ESTADOINSCRIPCION_PERSONA
          : !String(formData.ESTADOINSCRIPCION_PERSONA ?? '').toLowerCase().includes('inactiv') &&
          String(formData.ESTADOINSCRIPCION_PERSONA ?? '').trim() !== '0'

      const estadoInscripcion = isActivo ? '1' : '0'
      const estadoInscrip = '0'

      const formDataToSend = new FormData()
      formDataToSend.append('ID_GENERO', String(formData.ID_GENERO || ''))
      formDataToSend.append('ID_TIPOIDENTIFICACION', String(formData.ID_TIPOIDENTIFICACION || ''))
      formDataToSend.append('ID_NACIONALIDAD', String(formData.ID_NACIONALIDAD || ''))
      formDataToSend.append('ID_ESTADOCIVIL', String(formData.ID_ESTADOCIVIL || ''))
      formDataToSend.append('IDENTIFICACION_PERSONA', formData.IDENTIFICACION_PERSONA.trim())
      formDataToSend.append('NOMBRE_PERSONA', formData.NOMBRE_PERSONA.trim())
      formDataToSend.append('APELLIDO_PERSONA', formData.APELLIDO_PERSONA.trim())
      formDataToSend.append('TELEFONO_PERSONA', formData.TELEFONO_PERSONA?.trim() || '')
      formDataToSend.append('CELULAR_PERSONA', formData.CELULAR_PERSONA?.trim() || '')
      formDataToSend.append('CORREO_PERSONA', formData.CORREO_PERSONA?.trim() || '')
      formDataToSend.append('DIRECCION_PERSONA', formData.DIRECCION_PERSONA?.trim() || '')
      formDataToSend.append('DETALLE_INSCRIPCION', formData.DETALLE_PERSONA?.trim() || 'Inscripción de usuario')
      formDataToSend.append('DETALLE_PERSONA', formData.DETALLE_PERSONA?.trim() || '')
      formDataToSend.append('FECHA_PERSONA', fechaPersona)

      const today = new Date()
      const fechaHoy = today.toISOString().split('T')[0]
      const nextYear = new Date(today)
      nextYear.setFullYear(today.getFullYear() + 1)
      const fechaFinDefault = nextYear.toISOString().split('T')[0]

      const fechaReg =
        formData.FECHAREGISTRO_PERSONA ||
        currentUser?.raw?.FECHAREGISTRO_PERSONA ||
        fechaHoy

      const fechaIniInsc =
        currentUser?.raw?.FECHAINICIO_INSCRIPCION ||
        fechaReg

      const fechaFinInsc =
        currentUser?.raw?.FECHAFIN_INSCRIPCION ||
        fechaFinDefault

      const cleanDate = (d: any) => {
        if (!d) return ''
        const s = String(d)
        if (s.includes('1969-12-31') || s.includes('0000-00-00') || s.includes('No registrada')) return ''
        return s.includes('T') ? s.split('T')[0] : s.includes(' ') ? s.split(' ')[0] : s
      }

      formDataToSend.append('FECHAREGISTRO_PERSONA', cleanDate(fechaReg) || fechaHoy)
      formDataToSend.append('FECHAINICIO_INSCRIPCION', cleanDate(fechaIniInsc) || fechaHoy)
      formDataToSend.append('FECHAFIN_INSCRIPCION', cleanDate(fechaFinInsc) || fechaFinDefault)
      formDataToSend.append('FECHA_INICIO_INSCRIPCION', cleanDate(fechaIniInsc) || fechaHoy)
      formDataToSend.append('FECHA_FIN_INSCRIPCION', cleanDate(fechaFinInsc) || fechaFinDefault)
      formDataToSend.append('COSTO_INSCRIPCION', String(currentUser?.costo || currentUser?.raw?.COSTO_INSCRIPCION || '5'))
      formDataToSend.append('ESTADO_PERSONA', estadoPersona)
      formDataToSend.append('ESTADO_INSCRIPCION', estadoInscripcion)
      formDataToSend.append('ESTADOINSCRIPCION_PERSONA', estadoInscrip)

      if (formData.FOTO_PERSONA instanceof File) {
        formDataToSend.append('FOTO_PERSONA', formData.FOTO_PERSONA)
      }

      formDataToSend.append('_method', 'PUT')

      console.log('[DEBUG EDIT NEW] actualizando usuario')

      let ok = false
      if (personaState?.handleActualizarPersona) {
        ok = await personaState.handleActualizarPersona(idPersona, formDataToSend)
      } else {
        await ActualizarPersonaNueva(idPersona, formDataToSend)
        ok = true
      }

      if (ok) {
        Swal.mixin({
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.onmouseenter = Swal.stopTimer;
            toast.onmouseleave = Swal.resumeTimer;
          }
        }).fire({
          icon: "success",
          title: "Datos actualizados correctamente"
        });
        handleClose()
        if (onSuccess) {
          onSuccess()
        } else if (personaState) {
          personaState.fetchPersonas()
        }
      }
    } catch (error: any) {
      console.error('Error al actualizar usuario:', error)
      const errorMsg =
        error?.response?.data?.message ||
        'No se pudo actualizar los datos del usuario.'
      Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.onmouseenter = Swal.stopTimer;
          toast.onmouseleave = Swal.resumeTimer;
        }
      }).fire({
        icon: "error",
        title: errorMsg
      });
    } finally {
      setLoading(false)
    }
  }

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setPreviewFoto(url)
      setFormData((prev) => ({ ...prev, FOTO_PERSONA: file }))
    } else {
      setPreviewFoto(null)
    }
  }

  return {
    isVisible,
    currentUser,
    formData,
    loading: loading || loadingCatalogos,
    tiposId,
    nacionalidades,
    generos,
    estadosCiviles,
    previewFoto,
    fotoActual,
    handleChange,
    handleClose,
    handleSubmit,
    handleFotoChange,
    setFormData,
  }
}

export default usePersonaEdit
