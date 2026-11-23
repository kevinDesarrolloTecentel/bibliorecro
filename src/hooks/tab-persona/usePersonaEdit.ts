import React, { useState, useEffect } from 'react'
import Swal from 'sweetalert2'
import { useCatalogos } from '../tab-catalogos/useCatalogos'
import { getUserImageUrl } from '@/utils/imageUtils'
import {
  filterOnlyDigits,
  filterOnlyLetters,
  validatePersonaField,
  validateAllPersonaEdit,
  FormErrors,
} from '@/utils/validations'
import usePersonas from './usePersonas'
import { TabPersona, Persona } from '@/models/tab/persona.model'
import { ActualizarPersonaNueva } from '@/Service/tab/Persona'
import { parseDatePickerValue, formatFecha, calcularEdad } from '@/utils/dateUtils'
import { parseApiErrors, showErrorAlert } from '@/utils/errors'

export const initialPersona: TabPersona = {
  IDENTIFICACION_PERSONA: '',
  NOMBRE_PERSONA: '',
  APELLIDO_PERSONA: '',
  TELEFONO_PERSONA: '',
  CELULAR_PERSONA: '',
  CORREO_PERSONA: '',
  DIRECCION_PERSONA: '',
  DETALLE_PERSONA: '',
  FECHA_PERSONA: '',
  EDAD_PERSONA: '',
  ID_GENERO: '',
  ID_TIPOIDENTIFICACION: '',
  ID_NACIONALIDAD: '',
  ID_ESTADOCIVIL: '',
  ESTADO_PERSONA: 1,
}

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
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({})
  const [loading, setLoading] = useState(false)
  const [previewFoto, setPreviewFoto] = useState<string | null>(null)
  const [fotoActual, setFotoActual] = useState<string>('')
  const [datePickerKey, setDatePickerKey] = useState<number>(0)
  const {
    tiposIdentificacion,
    nacionalidades,
    generos,
    estadosCiviles,
    loading: loadingCatalogos,
  } = useCatalogos(true)

  const handleClose = () => {
    setPreviewFoto(null)
    setErrors({})
    setTouched({})
    if (setVisible) {
      setVisible(false)
    } else if (personaState) {
      personaState.setModalEdit(false)
    }
  }

  useEffect(() => {
    if (currentUser && isVisible) {
      setErrors({})
      setTouched({})
      const fotoRaw = currentUser.FOTO_PERSONA || ''
      setFotoActual(getUserImageUrl(fotoRaw))
      setPreviewFoto(null)

      const tipoId = currentUser.ID_TIPOIDENTIFICACION ?? ''
      const nacId = currentUser.ID_NACIONALIDAD ?? ''
      const genId = currentUser.ID_GENERO ?? ''
      const estCivId = currentUser.ID_ESTADOCIVIL ?? ''

      const fechaRaw = currentUser.FECHA_PERSONA ?? ''
      const fechaNac =
        fechaRaw && fechaRaw !== 'No registrada'
          ? fechaRaw.includes('T')
            ? fechaRaw.split('T')[0]
            : fechaRaw
          : ''

      const rawEstado = String(currentUser.ESTADO_PERSONA ?? '1').trim()
      const initialEstado =
        rawEstado === '0' || rawEstado.toLowerCase().includes('inactiv') ? '0' : '1'

      const inscripcionActual = currentUser.inscripciones?.[0]

      setFormData({
        ID_PERSONA: String(currentUser.ID_PERSONA ?? ''),
        ID_TIPOIDENTIFICACION: String(tipoId || ''),
        ID_NACIONALIDAD: String(nacId || ''),
        ID_GENERO: String(genId || ''),
        ID_ESTADOCIVIL: String(estCivId || ''),
        IDENTIFICACION_PERSONA: String(currentUser.IDENTIFICACION_PERSONA ?? ''),
        NOMBRE_PERSONA: String(currentUser.NOMBRE_PERSONA ?? '').toUpperCase(),
        APELLIDO_PERSONA: String(currentUser.APELLIDO_PERSONA ?? '').toUpperCase(),
        TELEFONO_PERSONA: String(currentUser.TELEFONO_PERSONA ?? ''),
        CELULAR_PERSONA: String(currentUser.CELULAR_PERSONA ?? ''),
        CORREO_PERSONA: String(currentUser.CORREO_PERSONA ?? ''),
        DIRECCION_PERSONA: String(currentUser.DIRECCION_PERSONA ?? ''),
        DETALLE_PERSONA: String(currentUser.DETALLE_PERSONA ?? ''),
        DETALLE_INSCRIPCION: String(
          currentUser.DETALLE_INSCRIPCION ?? inscripcionActual?.DETALLE_INSCRIPCION ?? '',
        ),
        FECHAREGISTRO_PERSONA: currentUser.FECHAREGISTRO_PERSONA ?? '',
        FOTO_PERSONA: '',
        FECHA_PERSONA: String(fechaNac || ''),
        ESTADO_PERSONA: initialEstado,
        ESTADOINSCRIPCION_PERSONA: String(currentUser.ESTADOINSCRIPCION_PERSONA ?? ''),
        EDAD_PERSONA: String(currentUser.EDAD_PERSONA ?? ''),
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

    if (errors[name] || touched[name]) {
      const fieldError = validatePersonaField(name, finalValue)
      setErrors((prev) => {
        const updated = { ...prev }
        if (fieldError) {
          updated[name] = fieldError
        } else {
          delete updated[name]
        }
        return updated
      })
    }
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

    if (errors.FECHA_PERSONA || touched.FECHA_PERSONA) {
      const fieldError = validatePersonaField('FECHA_PERSONA', finalValue)
      setErrors((prev) => {
        const updated = { ...prev }
        if (fieldError) {
          updated.FECHA_PERSONA = fieldError
        } else {
          delete updated.FECHA_PERSONA
        }
        return updated
      })
    }
  }

  const handleBlur = (name: string) => {
    setTouched((prev) => ({ ...prev, [name]: true }))
    const fieldError = validatePersonaField(name, (formData as any)[name], {
      file: formData.FOTO_PERSONA instanceof File ? formData.FOTO_PERSONA : null,
    })
    setErrors((prev) => {
      const updated = { ...prev }
      if (fieldError) {
        updated[name] = fieldError
      } else {
        delete updated[name]
      }
      return updated
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!canActualizar) {
      showErrorAlert('Acceso Denegado', ['No tienes permisos para actualizar usuarios.'])
      return
    }

    const { isValid, errors: validationErrors } = validateAllPersonaEdit(
      formData,
      formData.FOTO_PERSONA instanceof File ? formData.FOTO_PERSONA : null,
      Boolean(fotoActual),
    )

    if (!isValid) {
      setErrors(validationErrors)
      const allTouched: { [key: string]: boolean } = {}
      Object.keys(validationErrors).forEach((key) => {
        allTouched[key] = true
      })
      setTouched((prev) => ({ ...prev, ...allTouched }))

      const errorMessages = Object.values(validationErrors).filter((msg): msg is string => Boolean(msg))
      showErrorAlert('Campos requeridos o inválidos', errorMessages)
      return
    }

    const idPersona = formData.ID_PERSONA || currentUser?.ID_PERSONA
    if (!idPersona) {
      showErrorAlert('Error de identificación', ['No se encontró el ID del usuario a editar.'])
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

      // Preservar el estado del usuario existente
      const rawOriginalPersona = currentUser?.ESTADO_PERSONA ?? formData.ESTADO_PERSONA
      let estadoPersona = '1'
      if (rawOriginalPersona !== undefined && rawOriginalPersona !== null) {
        estadoPersona = (Number(rawOriginalPersona) === 0 || String(rawOriginalPersona).toLowerCase().includes('inactiv')) ? '0' : '1'
      } else {
        const rawEstadoSubmit = String(formData.ESTADO_PERSONA || '1').trim()
        estadoPersona = (rawEstadoSubmit === '0' || rawEstadoSubmit.toLowerCase().includes('inactiv')) ? '0' : '1'
      }

      // Preservar el ESTADOINSCRIPCION_PERSONA original
      const rawOriginalInscrip =
        currentUser?.ESTADOINSCRIPCION_PERSONA ?? formData.ESTADOINSCRIPCION_PERSONA
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
      formDataToSend.append('IDENTIFICACION_PERSONA', (formData.IDENTIFICACION_PERSONA || '').trim())
      formDataToSend.append('NOMBRE_PERSONA', (formData.NOMBRE_PERSONA || '').trim().toUpperCase())
      formDataToSend.append('APELLIDO_PERSONA', (formData.APELLIDO_PERSONA || '').trim().toUpperCase())
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

      const inscripcionActual = currentUser?.inscripciones?.[0]
      const fechaReg =
        formData.FECHAREGISTRO_PERSONA ||
        currentUser?.FECHAREGISTRO_PERSONA ||
        fechaHoy

      const fechaIniInsc =
        inscripcionActual?.FECHAINICIO_INSCRIPCION ||
        currentUser?.FECHAINICIO_INSCRIPCION ||
        fechaReg

      const fechaFinInsc =
        inscripcionActual?.FECHAFIN_INSCRIPCION ||
        currentUser?.FECHAFIN_INSCRIPCION ||
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
      formDataToSend.append(
        'COSTO_INSCRIPCION',
        String(inscripcionActual?.COSTO_INSCRIPCION || currentUser?.COSTO_INSCRIPCION || '5'),
      )
      formDataToSend.append('ESTADO_PERSONA', estadoPersona)
      formDataToSend.append('ESTADO_INSCRIPCION', estadoInscripcion)
      formDataToSend.append('ESTADOINSCRIPCION_PERSONA', estadoInscrip)

      if (formData.FOTO_PERSONA instanceof File) {
        formDataToSend.append('FOTO_PERSONA', formData.FOTO_PERSONA)
      }

      formDataToSend.append('_method', 'PUT')

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
      console.error('[usePersonaEdit] Error al actualizar usuario:', error)
      const { title, messages } = parseApiErrors(error, 'No se pudo actualizar los datos del usuario.')
      showErrorAlert(title, messages)
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
    errors,
    loading: loading || loadingCatalogos,
    tiposIdentificacion,
    nacionalidades,
    generos,
    estadosCiviles,
    previewFoto,
    fotoActual,
    handleChange,
    handleDateChange,
    handleBlur,
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
