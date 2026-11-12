import React, { useState } from 'react'
import { useCatalogos } from '../tab-catalogos/useCatalogos'
import Swal from 'sweetalert2'
import {
  filterOnlyDigits,
  filterOnlyLetters,
  validatePersonaField,
  validateAllPersonaRegister,
  FormErrors,
} from '@/utils/validations'
import usePersonas from './usePersonas'
import { initialPersona, Persona } from '@/models/tab/persona.model'
import { PersonasNueva } from '@/Service/tab/Persona'
import { parseDatePickerValue, formatFecha, calcularEdad } from '@/utils/dateUtils'

export const initialRegisterFormData: Persona = initialPersona

export interface UsePersonaRegisterProps {
  personaState?: ReturnType<typeof usePersonas>
  visible?: boolean
  setVisible?: (visible: boolean) => void
  onSuccess?: () => void
}

export const usePersonaRegister = ({
  personaState,
  visible,
  setVisible,
  onSuccess,
}: UsePersonaRegisterProps = {}) => {
  const isVisible =
    visible !== undefined
      ? visible
      : personaState
        ? personaState.modalRegister
        : false

  // Permiso heredado del hook orquestador usePersonas
  const canGuardar = personaState ? personaState.canGuardarUsuario : true

  const [formData, setFormData] = useState<Persona>(initialPersona)
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({})
  const [loading, setLoading] = useState(false)
  const [previewFoto, setPreviewFoto] = useState<string | null>(null)
  const [datePickerKey, setDatePickerKey] = useState<number>(0)

  const { tiposId, nacionalidades, generos, estadosCiviles, loading: loadingCatalogos } = useCatalogos(true)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
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

    setFormData((prev) => ({ ...prev, FECHA_PERSONA: finalValue, EDAD_PERSONA: String(age) }))

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

  const handleClose = () => {
    setPreviewFoto(null)
    setFormData(initialPersona)
    setErrors({})
    setTouched({})
    setDatePickerKey(0)
    if (setVisible) {
      setVisible(false)
    } else if (personaState) {
      personaState.setModalRegister(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!canGuardar) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para registrar usuarios.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    const { isValid, errors: validationErrors } = validateAllPersonaRegister(
      formData,
      formData.FOTO_PERSONA instanceof File ? formData.FOTO_PERSONA : null
    )

    if (!isValid) {
      setErrors(validationErrors)
      const allTouched: { [key: string]: boolean } = {}
      Object.keys(validationErrors).forEach((key) => {
        allTouched[key] = true
      })
      setTouched((prev) => ({ ...prev, ...allTouched }))

      const errorMessages = Object.values(validationErrors)
        .map((msg) => `<li>${msg}</li>`)
        .join('')

      Swal.fire({
        icon: 'warning',
        title: 'Campos requeridos o inválidos',
        html: `
          <div style="text-align: left; font-size: 0.9rem;">
            <p>Por favor revise los siguientes datos antes de guardar:</p>
            <ul style="color: #dc3545; padding-left: 1.2rem; line-height: 1.6;">
              ${errorMessages}
            </ul>
          </div>
        `,
        confirmButtonColor: '#0d6efd',
        confirmButtonText: 'Entendido',
      })
      return
    }

    setLoading(true)
    try {
      const fechaPersona =
        formData.FECHA_PERSONA && formData.FECHA_PERSONA.trim() && formData.FECHA_PERSONA !== 'No registrada'
          ? formData.FECHA_PERSONA.trim().split('T')[0]
          : ''

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
      formDataToSend.append('DETALLE_PERSONA', formData.DETALLE_PERSONA?.trim() || '')
      formDataToSend.append('DETALLE_INSCRIPCION', formData.DETALLE_PERSONA?.trim() || 'Inscripción de usuario')
      const today = new Date()
      const fechaHoy = today.toISOString().split('T')[0]
      const nextYear = new Date(today)
      nextYear.setFullYear(today.getFullYear() + 1)
      const fechaFin = nextYear.toISOString().split('T')[0]

      formDataToSend.append('FECHA_PERSONA', fechaPersona)
      formDataToSend.append('FECHAREGISTRO_PERSONA', fechaHoy)
      formDataToSend.append('FECHAINICIO_INSCRIPCION', fechaHoy)
      formDataToSend.append('FECHAFIN_INSCRIPCION', fechaFin)
      formDataToSend.append('FECHA_INICIO_INSCRIPCION', fechaHoy)
      formDataToSend.append('FECHA_FIN_INSCRIPCION', fechaFin)
      formDataToSend.append('COSTO_INSCRIPCION', '')
      formDataToSend.append('ESTADO_PERSONA', '1')
      formDataToSend.append('ESTADO_INSCRIPCION', '1')
      formDataToSend.append('ESTADOINSCRIPCION_PERSONA', '0')

      if (formData.FOTO_PERSONA instanceof File) {
        formDataToSend.append('FOTO_PERSONA', formData.FOTO_PERSONA)
      }
      let ok = false
      if (personaState?.handleCrearPersonaNew) {
        ok = await personaState.handleCrearPersonaNew(formDataToSend)
      } else {
        await PersonasNueva(formDataToSend)
        ok = true
      }

      if (ok) {
        Swal.fire({
          icon: 'success',
          title: '¡Usuario registrado!',
          text: 'El usuario se registró exitosamente en el sistema.',
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
      console.error('Error al registrar usuario:', error)
      const errorMsg =
        error?.response?.data?.message || 'Ocurrió un error al intentar registrar el usuario.'
      Swal.fire({
        icon: 'error',
        title: 'Error de Registro',
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
        setErrors((prev) => ({ ...prev, FOTO_PERSONA: 'Solo se permiten archivos de imagen (.jpg, .jpeg, .png, .webp).' }))
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
        setErrors((prev) => ({ ...prev, FOTO_PERSONA: 'El tamaño de la imagen no debe superar los 5MB.' }))
        return
      }

      const url = URL.createObjectURL(file)
      setPreviewFoto(url)
      setFormData((prev) => ({ ...prev, FOTO_PERSONA: file }))
      setErrors((prev) => {
        const next = { ...prev }
        delete next.FOTO_PERSONA
        return next
      })
    } else {
      setPreviewFoto(null)
      setFormData((prev) => ({ ...prev, FOTO_PERSONA: '' }))
    }
  }

  return {
    isVisible,
    formData,
    setFormData,
    errors,
    setErrors,
    touched,
    loading: loading || loadingCatalogos,
    tiposId,
    nacionalidades,
    generos,
    estadosCiviles,
    handleChange,
    handleDateChange,
    handleBlur,
    handleClose,
    handleSubmit,
    previewFoto,
    setPreviewFoto,
    handleFotoChange,
    canGuardar,
    datePickerKey,
  }
}

export default usePersonaRegister
