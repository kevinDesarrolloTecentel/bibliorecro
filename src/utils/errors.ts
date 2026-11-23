import Swal from 'sweetalert2'

const translateFieldName = (field: string): string => {
  const f = field.toLowerCase().replace(/[_-]/g, ' ').trim()
  if (f.includes('nick') || f.includes('usuario')) return 'Usuario'
  if (f.includes('pass') || f.includes('contrase')) return 'Contraseña'
  if (f.includes('nombre')) return 'Nombres Completos'
  if (f.includes('rol')) return 'Rol'
  if (f.includes('estado')) return 'Estado'
  return field
}

const translateErrorMessage = (msg: string, fieldName: string = ''): string => {
  if (typeof msg !== 'string') return String(msg || '')
  const lower = msg.toLowerCase().trim()

  if (
    lower.includes('already been taken') ||
    lower.includes('already exists') ||
    lower.includes('ya existe') ||
    lower.includes('ya ha sido tomado') ||
    lower.includes('duplicate')
  ) {
    if (fieldName.toLowerCase().includes('usuario') || lower.includes('nick')) {
      return 'El nombre de usuario ya está registrado en el sistema. Por favor elija otro.'
    }
    return `El ${fieldName || 'campo'} ya se encuentra registrado en el sistema.`
  }

  const minMatch = lower.match(/must be at least (\d+) characters/)
  if (minMatch) {
    const min = minMatch[1]
    if (fieldName.toLowerCase().includes('contrase') || lower.includes('password')) {
      return `La contraseña debe tener al menos ${min} caracteres.`
    }
    return `El campo ${fieldName || 'indicado'} debe tener al menos ${min} caracteres.`
  }

  const maxMatch = lower.match(/may not be greater than (\d+) characters/)
  if (maxMatch) {
    const max = maxMatch[1]
    return `El campo ${fieldName || 'indicado'} no puede tener más de ${max} caracteres.`
  }

  if (lower.includes('is required') || lower.includes('es requerido') || lower.includes('es obligatorio')) {
    if (fieldName.toLowerCase().includes('rol')) {
      return 'Debe seleccionar un Rol.'
    }
    return `El campo ${fieldName || 'indicado'} es obligatorio.`
  }

  if (lower.includes('invalid') || lower.includes('inválido')) {
    return `El valor ingresado para ${fieldName || 'el campo'} es inválido.`
  }

  if (lower.includes('unauthenticated')) {
    return 'Su sesión ha expirado. Por favor vuelva a iniciar sesión.'
  }

  return msg
}

export const parseApiErrors = (
  error: any,
  defaultMsg: string,
): { title: string; messages: string[]; isDuplicate: boolean } => {
  const data = error?.response?.data
  const status = error?.response?.status

  if (!data) {
    if (error?.message && error.message.toLowerCase().includes('network')) {
      return {
        title: 'Error de conexión',
        messages: ['No se pudo conectar con el servidor. Verifique su conexión de red.'],
        isDuplicate: false,
      }
    }
    return { title: 'Error', messages: [error?.message || defaultMsg], isDuplicate: false }
  }

  const rawErrors: string[] = []
  let isDuplicate = false

  if (data.errors && typeof data.errors === 'object') {
    Object.entries(data.errors).forEach(([field, msgList]: [string, any]) => {
      const fieldLabel = translateFieldName(field)
      const list = Array.isArray(msgList) ? msgList : [msgList]
      list.forEach((m: any) => {
        const text = String(m || '')
        if (
          text.toLowerCase().includes('already been taken') ||
          text.toLowerCase().includes('ya ha sido tomado') ||
          text.toLowerCase().includes('duplicate')
        ) {
          isDuplicate = true
        }
        rawErrors.push(translateErrorMessage(text, fieldLabel))
      })
    })
  }

  if (rawErrors.length === 0) {
    const singleMsg = data.message || data.error || data.msg
    if (typeof singleMsg === 'string' && singleMsg.trim()) {
      if (
        singleMsg.toLowerCase().includes('already been taken') ||
        singleMsg.toLowerCase().includes('duplicate') ||
        singleMsg.toLowerCase().includes('ya existe')
      ) {
        isDuplicate = true
      }
      if (singleMsg !== 'The given data was invalid.') {
        rawErrors.push(translateErrorMessage(singleMsg, 'Usuario'))
      }
    }
  }

  if (rawErrors.length === 0) {
    rawErrors.push(defaultMsg)
  }

  let title = 'Error'
  if (isDuplicate) {
    title = 'Usuario ya existente'
  } else if (status === 422) {
    title = 'Campos requeridos o inválidos'
  } else if (status === 401 || status === 419) {
    title = 'Sesión expirada'
  }

  return { title, messages: rawErrors, isDuplicate }
}

export const showErrorAlert = (title: string, messages: string[]) => {
  if (messages.length === 1) {
    Swal.fire({
      icon: 'warning',
      title,
      text: messages[0],
      confirmButtonColor: '#e55353',
      confirmButtonText: 'Entendido',
    })
  } else {
    Swal.fire({
      icon: 'warning',
      title,
      html: `
        <div style="text-align: left; font-size: 0.92rem; padding: 0.2rem 0.4rem;">
          <p style="margin-bottom: 0.6rem; color: #495057; font-weight: 500;">Por favor revise los siguientes datos:</p>
          <ul style="color: #dc3545; padding-left: 1.2rem; margin: 0; line-height: 1.7;">
            ${messages.map((m) => `<li>${m}</li>`).join('')}
          </ul>
        </div>
      `,
      confirmButtonColor: '#e55353',
      confirmButtonText: 'Entendido',
    })
  }
}

export const isBcryptHash = (str: unknown): boolean => {
  if (typeof str !== 'string') return false
  const s = str.trim()
  return (
    /^\$2[ayb]\$.{50,}/.test(s) ||
    /^[A-Za-z0-9+/]{40,}={0,2}$/.test(s) ||
    /^[a-f0-9]{32,64}$/i.test(s)
  )
}
