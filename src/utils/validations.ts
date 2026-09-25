/**
 * Utilidades de validación para formularios del sistema
 */

export interface FormErrors {
  [key: string]: string | undefined
}

/**
 * Filtra un string permitiendo únicamente dígitos y limitando la longitud máxima.
 */
export const filterOnlyDigits = (value: string, maxLength: number = 10): string => {
  return value.replace(/\D/g, '').slice(0, maxLength)
}

/**
 * Filtra un string permitiendo únicamente letras (incluyendo tildes y ñ) y espacios.
 */
export const filterOnlyLetters = (value: string): string => {
  return value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, '')
}

/**
 * Verifica si un string contiene exactamente 10 dígitos numéricos.
 */
export const isExact10Digits = (value: string): boolean => {
  return /^\d{10}$/.test(value.trim())
}

/**
 * Verifica si un email tiene un formato válido.
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return emailRegex.test(email.trim())
}

/**
 * Valida un campo individual de Persona para el registro
 */
export const validatePersonaField = (
  name: string,
  value: any,
  extraContext?: { file?: File | null }
): string | undefined => {
  const strVal = typeof value === 'string' ? value.trim() : String(value ?? '').trim()

  switch (name) {
    case 'ID_TIPOIDENTIFICACION':
      if (!strVal) return 'Debe seleccionar el tipo de identificación.'
      return undefined

    case 'IDENTIFICACION_PERSONA':
      if (!strVal) return 'El número de identificación es requerido.'
      if (!/^\d+$/.test(strVal)) return 'Solo se permiten números.'
      if (strVal.length !== 10) {
        return `Debe contener exactamente 10 dígitos numéricos (tiene ${strVal.length}).`
      }
      return undefined

    case 'NOMBRE_PERSONA':
      if (!strVal) return 'Los nombres son requeridos.'
      if (strVal.length < 2) return 'El nombre debe tener al menos 2 caracteres.'
      if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(strVal)) {
        return 'Los nombres solo deben contener letras y espacios.'
      }
      return undefined

    case 'APELLIDO_PERSONA':
      if (!strVal) return 'Los apellidos son requeridos.'
      if (strVal.length < 2) return 'El apellido debe tener al menos 2 caracteres.'
      if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(strVal)) {
        return 'Los apellidos solo deben contener letras y espacios.'
      }
      return undefined

    case 'FECHA_PERSONA': {
      if (!strVal) return 'La fecha de nacimiento es requerida.'
      const birthDate = new Date(strVal)
      if (isNaN(birthDate.getTime())) return 'Fecha de nacimiento inválida.'
      const today = new Date()
      today.setHours(23, 59, 59, 999)
      if (birthDate > today) return 'La fecha de nacimiento no puede ser futura.'
      return undefined
    }

    case 'ID_NACIONALIDAD':
      if (!strVal) return 'Debe seleccionar una nacionalidad.'
      return undefined

    case 'ID_GENERO':
      if (!strVal) return 'Debe seleccionar un género.'
      return undefined

    case 'ID_ESTADOCIVIL':
      if (!strVal) return 'Debe seleccionar un estado civil.'
      return undefined

    case 'CORREO_PERSONA':
      if (!strVal) return 'El correo electrónico es requerido.'
      if (!isValidEmail(strVal)) {
        return 'Ingrese un formato de correo electrónico válido (ej: usuario@correo.com).'
      }
      return undefined

    case 'TELEFONO_PERSONA':
      if (!strVal) return 'El teléfono fijo es requerido.'
      if (!/^\d+$/.test(strVal)) return 'Solo se permiten números.'
      if (strVal.length !== 10) {
        return `Debe contener exactamente 10 dígitos numéricos (tiene ${strVal.length}).`
      }
      return undefined

    case 'CELULAR_PERSONA':
      if (!strVal) return 'El teléfono celular es requerido.'
      if (!/^\d+$/.test(strVal)) return 'Solo se permiten números.'
      if (strVal.length !== 10) {
        return `Debe contener exactamente 10 dígitos numéricos (tiene ${strVal.length}).`
      }
      return undefined

    case 'DIRECCION_PERSONA':
      if (!strVal) return 'La dirección domiciliaria es requerida.'
      if (strVal.length < 5) return 'La dirección debe tener al menos 5 caracteres.'
      return undefined

    case 'DETALLE_PERSONA':
      if (!strVal) return 'La descripción es requerida.'
      return undefined

    case 'FOTO_PERSONA':
      if (!value && !extraContext?.file) {
        return 'La foto del usuario es requerida.'
      }
      return undefined

    default:
      return undefined
  }
}

/**
 * Valida todos los campos del formulario de registro de usuario
 */
export const validateAllPersonaRegister = (
  formData: any,
  fotoFile?: File | null
): { isValid: boolean; errors: FormErrors } => {
  const errors: FormErrors = {}

  const fieldsToValidate = [
    'ID_TIPOIDENTIFICACION',
    'IDENTIFICACION_PERSONA',
    'FECHA_PERSONA',
    'NOMBRE_PERSONA',
    'APELLIDO_PERSONA',
    'ID_NACIONALIDAD',
    'ID_GENERO',
    'ID_ESTADOCIVIL',
    'CORREO_PERSONA',
    'TELEFONO_PERSONA',
    'CELULAR_PERSONA',
    'DIRECCION_PERSONA',
    'DETALLE_PERSONA',
  ]

  fieldsToValidate.forEach((field) => {
    const error = validatePersonaField(field, formData[field])
    if (error) {
      errors[field] = error
    }
  })

  // Validar foto
  const fotoError = validatePersonaField('FOTO_PERSONA', formData.FOTO_PERSONA, {
    file: fotoFile,
  })
  if (fotoError) {
    errors.FOTO_PERSONA = fotoError
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}
