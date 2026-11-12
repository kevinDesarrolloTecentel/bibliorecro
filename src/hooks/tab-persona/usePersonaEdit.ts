import React, { useState, useEffect } from 'react'
import Swal from 'sweetalert2'
import { useCatalogos } from '../tab-catalogos/useCatalogos'
import { getUserImageUrl } from '@/utils/imageUtils'
import { filterOnlyDigits, filterOnlyLetters } from '@/utils/validations'
import usePersonas from './usePersonas'
import { initialPersona, Persona } from '@/models/tab/persona.model'
import { ActualizarPersonaNueva } from '@/Service/tab/Persona'
import { parseDatePickerValue, formatFecha, calcularEdad } from '@/utils/dateUtils'

export const initialEditFormData: Persona = initialPersona

export interface UsePersonaEditProps {
  personaState?: ReturnType<typeof usePersonas>
  visible?: boolean
  setVisible?: (visible: boolean) => void
  user?: Persona | any
  onSuccess?: () => void
  readOnly?: boolean
}

export const usePersonaEdit = ({
  personaState,
  visible,
  setVisible,
  user,
  onSuccess,
  readOnly = false,
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

  // Permiso heredado del hook orquestador usePersonas 
  const canActualizar = readOnly
    ? false
    : personaState
      ? personaState.canActualizarUsuario
      : true

  const [formData, setFormData] = useState<Persona>(initialPersona)
  const [loading, setLoading] = useState(false)
  const [previewFoto, setPreviewFoto] = useState<string | null>(null)
  const [fotoActual, setFotoActual] = useState<string>('')
  const [datePickerKey, setDatePickerKey] = useState<number>(0)
  const {
    tiposId,
    nacionalidades,
    generos,
    estadosCiviles,
    loading: loadingCatalogos,
  } = useCatalogos(true)

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
        raw.FOTO_PERSONA ||
        currentUser.fotografia ||
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
        ).toUpperCase(),
        APELLIDO_PERSONA: String(
          raw.APELLIDO_PERSONA ?? currentUser.apellido ?? '',
        ).toUpperCase(),
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
        DETALLE_INSCRIPCION: String(
          raw.DETALLE_INSCRIPCION ?? raw.inscripcion?.DETALLE_INSCRIPCION ?? '',
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
      finalValue = filterOnlyLetters(value).toUpperCase()
    }

    setFormData((prev) => ({ ...prev, [name]: finalValue }))
  }

  const handleDateChange = async (date: Date | string | null) => {
    const finalValue = parseDatePickerValue(date)
    if (!finalValue) {
      setFormData((prev) => ({ ...prev, FECHA_PERSONA: '', EDAD_PERSONA: '' }))
      return
    }

    if (finalValue === formData.FECHA_PERSONA) return

    const age = calcularEdad(finalValue)
    const fechaDisplay = formatFecha(finalValue)
    const isPresentYear = age === 0 || finalValue.startsWith(String(new Date().getFullYear()))

    const result = await Swal.fire({
      title: '¿Está seguro de la fecha ingresada?',
      html: isPresentYear
        ? `<div style="text-align: center; font-size: 0.95rem;">
             <p class="mb-2">Ha seleccionado la fecha: <strong>${fechaDisplay}</strong></p>
             <div style="background-color: #fff3cd; color: #856404; padding: 12px; border-radius: 6px; border: 1px solid #ffeeba; margin: 12px 0; text-align: left;">
               <strong>¡Atención!</strong> Con esta fecha el usuario tendrá <strong>0 años</strong>.
             </div>
           </div>`
        : `<div style="text-align: center; font-size: 0.95rem;">
             <p class="mb-2">Ha seleccionado la fecha: <strong>${fechaDisplay}</strong></p>
             <p class="mb-2" style="font-size: 1.1rem;">Edad: <strong style="color: #044c8c;">${age} ${age === 1 ? 'año' : 'años'}</strong></p>
           </div>`,
      icon: isPresentYear ? 'warning' : 'question',
      showCancelButton: true,
      confirmButtonColor: '#044c8c',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, aceptar',
      cancelButtonText: 'Cancelar',
      allowOutsideClick: false,
      focusConfirm: true,
    })

    if (!result.isConfirmed) {
      setDatePickerKey((k) => k + 1)
      return
    }

    setFormData((prev) => ({
      ...prev,
      FECHA_PERSONA: finalValue,
      EDAD_PERSONA: String(age),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!canActualizar) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para actualizar usuarios.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

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

    const telFijo = formData.TELEFONO_PERSONA?.toString().trim()
    if (telFijo && (telFijo.length < 7 || telFijo.length > 10)) {
      Swal.fire({
        icon: 'warning',
        title: 'Teléfono fijo inválido',
        text: 'El teléfono fijo debe contener entre 7 y 10 dígitos numéricos (ej: 7 dígitos para número de casa local).',
      })
      return
    }

    if (formData.FOTO_PERSONA instanceof File) {
      const validExtensions = ['jpg', 'jpeg', 'png', 'webp', 'bmp', 'gif']
      const ext = (formData.FOTO_PERSONA.name.split('.').pop() || '').toLowerCase()
      if (!formData.FOTO_PERSONA.type.startsWith('image/') || !validExtensions.includes(ext)) {
        Swal.fire({
          icon: 'warning',
          title: 'Formato de fotografía inválido',
          text: 'Por favor seleccione un archivo de imagen válido (.jpg, .jpeg, .png, .webp).',
        })
        return
      }
      if (formData.FOTO_PERSONA.size > 5 * 1024 * 1024) {
        Swal.fire({
          icon: 'warning',
          title: 'Imagen demasiado grande',
          text: 'El tamaño de la imagen no debe superar los 5MB.',
        })
        return
      }
    }

    const idPersona = formData.ID_PERSONA || currentUser?.id || currentUser?.raw?.ID_PERSONA
    if (!idPersona) {
      Swal.fire({
        icon: 'error',
        title: 'Error de identificación',
        text: 'No se encontró el ID del usuario a editar.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
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

      // Preservar el estado del usuario existente (no forzar inactivo/activo si ya tenía un valor)
      const rawOriginalPersona = currentUser?.raw?.ESTADO_PERSONA ?? formData.ESTADO_PERSONA
      let estadoPersona = '1'
      if (rawOriginalPersona !== undefined && rawOriginalPersona !== null) {
        estadoPersona = String(rawOriginalPersona)
      } else {
        const rawEstadoSubmit = String(formData.ESTADO_PERSONA || '1').trim()
        if (rawEstadoSubmit === '0' || rawEstadoSubmit.toLowerCase().includes('inactiv')) {
          estadoPersona = '0'
        } else if (rawEstadoSubmit === '2' || rawEstadoSubmit.toLowerCase().includes('sancion')) {
          estadoPersona = '2'
        } else {
          estadoPersona = '1'
        }
      }

      // Preservar el ESTADOINSCRIPCION_PERSONA original (crucial para no sacarlo de Renovaciones y Nuevos)
      const rawOriginalInscrip =
        currentUser?.raw?.ESTADOINSCRIPCION_PERSONA ?? formData.ESTADOINSCRIPCION_PERSONA
      const estadoInscrip =
        rawOriginalInscrip !== undefined && rawOriginalInscrip !== null
          ? String(rawOriginalInscrip)
          : '0'

      const isActivo =
        typeof formData.ESTADOINSCRIPCION_PERSONA === 'boolean'
          ? formData.ESTADOINSCRIPCION_PERSONA
          : !String(formData.ESTADOINSCRIPCION_PERSONA ?? '').toLowerCase().includes('inactiv') &&
          String(formData.ESTADOINSCRIPCION_PERSONA ?? '').trim() !== '0'

      const estadoInscripcion = isActivo ? '1' : '0'

      const formDataToSend = new FormData()
      formDataToSend.append('ID_GENERO', String(formData.ID_GENERO || ''))
      formDataToSend.append('ID_TIPOIDENTIFICACION', String(formData.ID_TIPOIDENTIFICACION || ''))
      formDataToSend.append('ID_NACIONALIDAD', String(formData.ID_NACIONALIDAD || ''))
      formDataToSend.append('ID_ESTADOCIVIL', String(formData.ID_ESTADOCIVIL || ''))
      formDataToSend.append('IDENTIFICACION_PERSONA', formData.IDENTIFICACION_PERSONA.trim())
      formDataToSend.append('NOMBRE_PERSONA', formData.NOMBRE_PERSONA.trim().toUpperCase())
      formDataToSend.append('APELLIDO_PERSONA', formData.APELLIDO_PERSONA.trim().toUpperCase())
      formDataToSend.append('TELEFONO_PERSONA', formData.TELEFONO_PERSONA?.trim() || '')
      formDataToSend.append('CELULAR_PERSONA', formData.CELULAR_PERSONA?.trim() || '')
      formDataToSend.append('CORREO_PERSONA', formData.CORREO_PERSONA?.trim() || '')
      formDataToSend.append('DIRECCION_PERSONA', formData.DIRECCION_PERSONA?.trim() || '')
      formDataToSend.append('DETALLE_INSCRIPCION', formData.DETALLE_PERSONA?.trim() || '')
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
        Swal.fire({
          icon: 'success',
          title: '¡Usuario actualizado!',
          text: 'Los datos del usuario se guardaron correctamente.',
          timer: 1800,
          showConfirmButton: false,
        })
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
      Swal.fire({
        icon: 'error',
        title: 'Error al actualizar',
        text: errorMsg,
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const validExtensions = ['jpg', 'jpeg', 'png', 'webp', 'bmp', 'gif']
      const ext = (file.name.split('.').pop() || '').toLowerCase()

      if (!file.type.startsWith('image/') || !validExtensions.includes(ext)) {
        Swal.fire({
          icon: 'warning',
          title: 'Formato no permitido',
          text: 'Por favor seleccione un archivo de imagen válido (.jpg, .jpeg, .png, .webp).',
          confirmButtonColor: '#3085d6',
        })
        e.target.value = ''
        setPreviewFoto(null)
        setFormData((prev) => ({ ...prev, FOTO_PERSONA: '' }))
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({
          icon: 'warning',
          title: 'Imagen demasiado grande',
          text: 'El tamaño de la imagen no debe superar los 5MB.',
          confirmButtonColor: '#3085d6',
        })
        e.target.value = ''
        setPreviewFoto(null)
        setFormData((prev) => ({ ...prev, FOTO_PERSONA: '' }))
        return
      }

      const url = URL.createObjectURL(file)
      setPreviewFoto(url)
      setFormData((prev) => ({ ...prev, FOTO_PERSONA: file }))
    } else {
      setPreviewFoto(null)
      setFormData((prev) => ({ ...prev, FOTO_PERSONA: '' }))
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
    handleDateChange,
    handleClose,
    handleSubmit,
    handleFotoChange,
    setFormData,
    canActualizar,
    readOnly,
    datePickerKey,
  }
}

export default usePersonaEdit
