import { useState, useEffect, useCallback, useMemo } from 'react'
import Swal from 'sweetalert2'
import { getStoredUser, setAuthSession, clearAuthSession } from '@/utils/auth'
import { useDispatch } from 'react-redux'
import { loginSuccess, sessionExpired } from '@/authSlice'
import { actualizar, crear, eliminar } from '@/Service/adm/AdminUser'
import { asignarRolesUsuario, listarUsuariosConRoles } from '@/Service/adm/Rol'
import { UserData } from '@/models/auth'
import { AdminUser, UserFormData, UserEditFormData, CreateUserPayload, UpdateUserPayload, UserTableItem } from '@/models/adm/user.model'
import { Rol } from '@/models/adm/rol.model'
import useAuth from '@/hooks/auth/useAuth'
import { usePermissions, marcarCambioPermisos } from '@/context/PermissionsContext'


const translateFieldName = (field: string): string => {
  const f = field.toLowerCase().replace(/[_-]/g, ' ').trim()
  if (f.includes('nick') || f.includes('usuario') || f === 'user' || f === 'username') return 'Usuario'
  if (f.includes('pass') || f.includes('contrase')) return 'Contraseña'
  if (f.includes('nombre') || f.includes('name')) return 'Nombres Completos'
  if (f.includes('rol') || f.includes('role')) return 'Rol'
  if (f.includes('estado') || f.includes('status')) return 'Estado'
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

  // Longitud máxima
  const maxMatch = lower.match(/may not be greater than (\d+) characters/)
  if (maxMatch) {
    const max = maxMatch[1]
    return `El campo ${fieldName || 'indicado'} no puede tener más de ${max} caracteres.`
  }

  // Campo obligatorio
  if (lower.includes('is required') || lower.includes('es requerido') || lower.includes('es obligatorio')) {
    if (fieldName.toLowerCase().includes('rol')) {
      return 'Debe seleccionar un Rol.'
    }
    return `El campo ${fieldName || 'indicado'} es obligatorio.`
  }

  // Valores inválidos
  if (lower.includes('invalid') || lower.includes('inválido')) {
    return `El valor ingresado para ${fieldName || 'el campo'} es inválido.`
  }

  // Sesión vencida
  if (lower.includes('unauthenticated')) {
    return 'Su sesión ha expirado. Por favor vuelva a iniciar sesión.'
  }

  return msg
}

/**
 * Procesa la respuesta de error de la API y extrae una lista estructurada de errores en español
 */
export const parseApiErrors = (error: any, defaultMsg: string): { title: string; messages: string[]; isDuplicate: boolean } => {
  const data = error?.response?.data
  const status = error?.response?.status

  if (!data) {
    if (error?.message && error.message.toLowerCase().includes('network')) {
      return { title: 'Error de conexión', messages: ['No se pudo conectar con el servidor. Verifique su conexión de red.'], isDuplicate: false }
    }
    return { title: 'Error', messages: [error?.message || defaultMsg], isDuplicate: false }
  }

  const rawErrors: string[] = []
  let isDuplicate = false

  // 1. Si vienen errores por campos (formato Laravel standard 422: data.errors = { field: [msg1, msg2] })
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

  // 2. Si viene un mensaje simple de error
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
  } else {
    title = 'Error en la operación'
  }

  return { title, messages: rawErrors, isDuplicate }
}

//Alerta
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

export const formatApiError = (error: any, defaultMsg: string): string => {
  const { messages } = parseApiErrors(error, defaultMsg)
  return messages.join(' | ')
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

export const useUsers = (options: { fetchAll?: boolean } = { fetchAll: true }) => {
  const [usuarios, setUsuarios] = useState<AdminUser[]>([])
  const [rolesList] = useState<Rol[]>([])
  const [loadingRoles] = useState(false)
  const [loading, setLoading] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showTablePassword, setShowTablePassword] = useState(false)
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string | number, boolean>>({})
  const [modalVisible, setModalVisible] = useState(false)
  const [modalEdit, setModalEdit] = useState(false)
  const [filtroRol, setFiltroRol] = useState<string>('todos')
  const [formData, setFormData] = useState<UserFormData>({
    nombres: '',
    password: '',
    usuario: '',
    rol: '',
    estado: 'Activo'
  })
  const [editFormData, setEditFormData] = useState<UserEditFormData>({
    id: '',
    nombres: '',
    password: '',
    usuario: '',
    rol: '',
    estado: 'Activo'
  })
  const dispatch = useDispatch()
  const { user } = useAuth()
  const { canDoAction, verificarAccionEnServidor } = usePermissions()
  const activeUser = user || getStoredUser()

  const canCrearUsuario = canDoAction('btn_crear_usuario')
  const canGuardarUsuario = canDoAction('btn_guardar_usuario')
  const canEditarUsuario = canDoAction('btn_editar_usuario')
  const canActualizarUsuario = canDoAction('btn_actualizar_usuario')
  const canEliminarUsuario = canDoAction('btn_eliminar_usuario')
  const canInactivarUsuario = canDoAction('btn_inactivar_usuario_adm')
  const canActivarUsuario = canDoAction('btn_activar_usuario_adm')
  const verContraseñaUsuario = canDoAction('btn_ver_contraseña_usuario')


  const fetchUsuarios = useCallback(async () => {
    setLoading(true)
    setErrorMsg(null)
    try {
      const datos = await listarUsuariosConRoles()
      const lista = Array.isArray(datos)
        ? datos
        : datos?.data || datos?.users || datos?.usuarios || []
      setUsuarios(lista)
    } catch (error: any) {
      console.error('Error al obtener usuarios:', error)
      if (error?.response?.status === 401) {
        setErrorMsg(
          'El servidor rechazó la autenticación (Error 401: Unauthenticated). Por favor, haz clic en "Iniciar Sesión" para reintentar.',
        )
      } else if (error?.response?.status === 403) {
        clearAuthSession()
        dispatch(sessionExpired())
        if (typeof window !== 'undefined' && !window.location.hash.includes('#/login')) {
          window.location.replace('/#/login?user_inactive=true')
        }
      } else {
        setErrorMsg('No se pudo conectar con el servidor para obtener los usuarios.')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchRoles = useCallback(async () => {
    // Roles ya no se consultan en el módulo de usuarios
  }, [])

  const handleRecargar = useCallback(async () => {
    setLoading(true)
    try {
      setFiltroRol('todos')
      await fetchUsuarios()
    } catch (error) {
      console.error('Error al refrescar:', error)
    } finally {
      setLoading(false)
    }
  }, [fetchUsuarios])

  const validateUserData = (
    data: { usuario?: string; password?: string; nombres?: string; rol?: any },
    isEdit: boolean = false
  ): string[] => {
    const errors: string[] = []
    const userClean = (data.usuario || '').trim()
    const passClean = data.password || ''
    const nombresClean = (data.nombres || '').trim()

    // 1. Validación de usuario
    if (!userClean) {
      errors.push('El campo "Usuario" es obligatorio.')
    } else if (userClean.length < 3) {
      errors.push('El nombre de usuario debe tener al menos 3 caracteres.')
    } else if (/\s/.test(userClean)) {
      errors.push('El nombre de usuario no debe contener espacios en blanco.')
    } else if (userClean.length > 25) {
          errors.push('El nombre de usuario no puede superar los 25 caracteres.')
        }

    // 2. Validación de contraseña
    if (!isEdit) {
      if (!passClean) {
        errors.push('El campo "Contraseña" es obligatorio.')
      } else if (passClean.length < 6) {
        errors.push('La contraseña debe tener al menos 6 caracteres.')
      } else if (passClean.length > 25) {
        errors.push('La contraseña no puede superar los 25 caracteres.')
      }
    } else {
      // En edición la contraseña es opcional, pero si la escribe debe tener mínimo 6 caracteres
      if (passClean && passClean.trim() !== '' && passClean !== '••••••••' && !isBcryptHash(passClean)) {
        if (passClean.length < 6) {
          errors.push('La nueva contraseña debe tener al menos 6 caracteres.')
        } else if (passClean.length > 25) {
          errors.push('La nueva contraseña no puede superar los 25 caracteres.')
        }
      }
    }

    // 3. Validación de nombres completos
    if (!nombresClean) {
      errors.push('El campo "Nombres Completos" es obligatorio.')
    } else if (nombresClean.length < 3) {
      errors.push('Los nombres completos deben tener al menos 3 caracteres.')
    } else if (nombresClean.length > 25) {
      errors.push('Los nombres completos no pueden superar los 25 caracteres.')
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(nombresClean)) {
      errors.push('El campo "Nombres Completos" solo debe contener letras.')
    }

    return errors
  }

  const handleCrearUsuario = async (formData: UserFormData): Promise<boolean> => {
    if (!canGuardarUsuario) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para guardar o registrar un nuevo usuario.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return false
    }

    const tienePermiso = await verificarAccionEnServidor('btn_guardar_usuario')
    if (!tienePermiso) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para guardar o registrar un nuevo usuario.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return false
    }

    const validationErrors = validateUserData(formData, false)
    if (validationErrors.length > 0) {
      showErrorAlert('Campos requeridos o inválidos', validationErrors)
      return false
    }

    try {
      setGuardando(true)
      const estadoNum = formData.estado === 'Activo' || formData.estado === '1' ? 1 : 0
      const rolNum = formData.rol ? (Number(formData.rol) || formData.rol) : null

      const payload: CreateUserPayload = {
        NICK_USUARIO: formData.usuario.trim(),
        PASSWORD_USUARIO: formData.password,
        NOMBRES_USUARIO: formData.nombres.trim(),
        ESTADO_USUARIO: estadoNum,
        estado: estadoNum,
        usuario: formData.usuario.trim(),
        password: formData.password,
        nombres: formData.nombres.trim(),
      }

      if (rolNum) {
        payload.ID_ROL = rolNum
        payload.rol = rolNum
      }

      const res = await crear(payload)

      // Sincronizar también con la tabla intermedia de roles múltiples
      const newId =
        res?.data?.ID_USUARIO ??
        res?.data?.id ??
        res?.user?.ID_USUARIO ??
        res?.user?.id ??
        res?.ID_USUARIO ??
        res?.id

      if (newId && rolNum) {
        try {
          await asignarRolesUsuario(newId, [rolNum])
          marcarCambioPermisos()
        } catch (syncErr) {
          console.warn('[handleCrearUsuario] Sincronización en tabla intermedia omitida o fallida:', syncErr)
        }
      }

      Swal.fire({
        icon: 'success',
        title: '¡Usuario creado!',
        text: 'El nuevo usuario se registró exitosamente.',
        timer: 1800,
        showConfirmButton: false,
      })
      if (options?.fetchAll !== false) {
        await fetchUsuarios()
      }
      return true
    } catch (error: any) {
      console.error('Error al crear usuario:', error)
      const { title, messages } = parseApiErrors(error, 'Error al crear el usuario')
      showErrorAlert(title, messages)
      return false
    } finally {
      setGuardando(false)
    }
  }

  const handleActualizarUsuario = async (
    id: string | number,
    editFormData: UserEditFormData,
  ): Promise<boolean> => {
    if (!canActualizarUsuario) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para actualizar este usuario.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return false
    }

    const tienePermiso = await verificarAccionEnServidor('btn_actualizar_usuario')
    if (!tienePermiso) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para actualizar este usuario.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return false
    }

    const validationErrors = validateUserData(editFormData, true)
    if (validationErrors.length > 0) {
      showErrorAlert('Campos requeridos o inválidos', validationErrors)
      return false
    }

    try {
      setGuardando(true)
      const estadoNum = editFormData.estado === 'Activo' || editFormData.estado === '1' ? 1 : 0
      const rolNum =
        editFormData.rol && !isNaN(Number(editFormData.rol)) && Number(editFormData.rol) > 0
          ? Number(editFormData.rol)
          : null

      const payload: UpdateUserPayload = {
        NICK_USUARIO: editFormData.usuario.trim(),
        NOMBRES_USUARIO: editFormData.nombres.trim(),
        ESTADO_USUARIO: estadoNum,
        estado: estadoNum,
      }

      if (rolNum) {
        payload.ID_ROL = rolNum
        payload.rol = rolNum
      }
      if (
        editFormData.password &&
        editFormData.password.trim() !== '' &&
        !isBcryptHash(editFormData.password) &&
        editFormData.password !== '••••••••'
      ) {
        payload.PASSWORD_USUARIO = editFormData.password.trim()
        payload.password = editFormData.password.trim()
      }

      console.log('[handleActualizarUsuario] Payload a enviar al backend:', payload)
      await actualizar(id, payload)
      marcarCambioPermisos()
      Swal.fire({
        icon: 'success',
        title: '¡Usuario actualizado!',
        text: 'Los datos del usuario se guardaron correctamente.',
        timer: 1800,
        showConfirmButton: false,
      })
      if (options?.fetchAll !== false) {
        await fetchUsuarios()
      }

      // Si el usuario actualizado es el usuario logueado en esta sesión, sincronizar su sesión en Redux o cerrar si se inactivó
      const currentId = activeUser?.ID_USUARIO ?? activeUser?.id
      const currentNick = String(activeUser?.NICK_USUARIO ?? '').trim().toLowerCase()
      const targetNick = String(editFormData.usuario || '').trim().toLowerCase()
      const isSelf = (currentId && String(id) === String(currentId)) || (currentNick && targetNick && currentNick === targetNick)

      if (isSelf) {
        if (estadoNum === 0) {
          clearAuthSession()
          dispatch(sessionExpired())
          if (typeof window !== 'undefined') {
            window.location.replace('/#/login?user_inactive=true')
          }
          return true
        }

        const updatedUser: UserData = {
          ...activeUser,
          NICK_USUARIO: editFormData.usuario.trim(),
          NOMBRES_USUARIO: editFormData.nombres.trim(),
          ESTADO_USUARIO: estadoNum,
          estado: estadoNum,
        }
        delete (updatedUser as any).ID_ROL
        delete (updatedUser as any).id_rol
        delete (updatedUser as any).NOMBRE_ROL
        dispatch(loginSuccess(updatedUser))
        setAuthSession(updatedUser, activeUser?.token)
      }

      return true
    } catch (error: any) {
      console.error('Error al actualizar usuario:', error)
      const { title, messages } = parseApiErrors(error, 'Error al actualizar el usuario')
      showErrorAlert(title, messages)
      return false
    } finally {
      setGuardando(false)
    }
  }

  const handleEliminarUsuario = async (id: string | number, nombre?: string): Promise<boolean> => {
    if (!canEliminarUsuario) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para eliminar usuarios.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return false
    }

    const currentId = activeUser?.ID_USUARIO ?? activeUser?.id
    const currentNick = String(activeUser?.NICK_USUARIO ?? '').trim().toLowerCase()
    const targetNick = String(nombre || '').trim().toLowerCase()
    const isSelf = (currentId && String(id) === String(currentId)) || (currentNick && targetNick && currentNick === targetNick)

    if (isSelf) {
      Swal.fire({
        icon: 'warning',
        title: 'Acción no permitida',
        text: 'No puedes eliminar tu propia cuenta mientras estás en sesión en el sistema.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return false
    }

    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar al usuario ${nombre ? `"${nombre}"` : ''}? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e55353',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    })

    if (!result.isConfirmed) return false

    const tienePermiso = await verificarAccionEnServidor('btn_eliminar_usuario')
    if (!tienePermiso) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para eliminar usuarios.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return false
    }

    try {
      setGuardando(true)
      await eliminar(id)
      Swal.fire({
        icon: 'success',
        title: '¡Usuario eliminado!',
        text: `El usuario ${nombre ? `"${nombre}"` : ''} fue eliminado correctamente.`,
        timer: 1800,
        showConfirmButton: false,
      })
      if (options?.fetchAll !== false) {
        await fetchUsuarios()
      }
      return true
    } catch (error: any) {
      console.error('Error al eliminar usuario:', error)
      const { title, messages } = parseApiErrors(error, 'Error al eliminar el usuario')
      showErrorAlert(title, messages)
      return false
    } finally {
      setGuardando(false)
    }
  }

  const cambiarEstadoUsuario = async (item: any): Promise<boolean> => {
    const u = item.raw || item
    const id = item.id || u.ID_USUARIO
    const rawEstado = item.Estado ?? item.estado ?? u.ESTADO_USUARIO ?? u.estado ?? 'Activo'
    const isActivo =
      String(rawEstado).toLowerCase() === '1' || String(rawEstado).toLowerCase() === 'activo'
    const nuevoEstado = isActivo ? 'Inactivo' : 'Activo'
    const estadoNum = isActivo ? 0 : 1

    const accionVerificar = isActivo ? 'btn_inactivar_usuario_adm' : 'btn_activar_usuario_adm'
    const accionNombre = isActivo ? 'inactivar' : 'activar'

    if (isActivo && !canInactivarUsuario) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para inactivar este usuario.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return false
    }

    if (!isActivo && !canActivarUsuario) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para activar este usuario.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return false
    }

    const currentId = activeUser?.ID_USUARIO ?? activeUser?.id
    const currentNick = String(activeUser?.NICK_USUARIO ?? '').trim().toLowerCase()
    const targetNick = String(item.Usuario ?? item.usuario ?? u.NICK_USUARIO ?? '').trim().toLowerCase()
    const isSelf = (currentId && String(id) === String(currentId)) || (currentNick && targetNick && currentNick === targetNick)

    if (isSelf && isActivo) {
      Swal.fire({
        icon: 'warning',
        title: 'Acción no permitida',
        text: 'No puedes inactivar tu propia cuenta mientras estás en sesión en el sistema.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return false
    }

    const nombreUsuario = item.Nombres || item.nombres || item.Usuario || item.usuario || u.NOMBRES_USUARIO || u.NICK_USUARIO || ''

    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas ${accionNombre} al usuario ${nombreUsuario ? `"${nombreUsuario}"` : ''}?`,
      icon: isActivo ? 'warning' : 'question',
      showCancelButton: true,
      confirmButtonColor: isActivo ? '#f9b115' : '#2eb85c',
      cancelButtonColor: '#6c757d',
      confirmButtonText: `Sí, ${accionNombre}`,
      cancelButtonText: 'Cancelar',
    })

    if (!result.isConfirmed) return false

    const tienePermiso = await verificarAccionEnServidor(accionVerificar)
    if (!tienePermiso) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: `No tienes permisos para ${accionNombre} este usuario.`,
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return false
    }

    try {
      setGuardando(true)
      const payload: any = {
        NICK_USUARIO: item.Usuario || item.usuario || u.NICK_USUARIO,
        NOMBRES_USUARIO: item.Nombres || item.nombres || u.NOMBRES_USUARIO,
        ESTADO_USUARIO: estadoNum,
        estado: estadoNum,
      }
      const rawRolVal = u.ID_ROL ?? item.Rol ?? item.rol
      if (rawRolVal && !isNaN(Number(rawRolVal)) && Number(rawRolVal) > 0) {
        payload.ID_ROL = Number(rawRolVal)
        payload.rol = Number(rawRolVal)
      }
      await actualizar(id, payload)
      marcarCambioPermisos()

      setEditFormData((prev) => ({
        ...prev,
        estado: nuevoEstado,
      }))

      if (isSelf && estadoNum === 0) {
        clearAuthSession()
        dispatch(sessionExpired())
        if (typeof window !== 'undefined') {
          window.location.replace('/#/login?user_inactive=true')
        }
        return true
      }

      Swal.fire({
        icon: 'success',
        title: nuevoEstado === 'Activo' ? '¡Usuario activado!' : '¡Usuario inactivado!',
        text: `El usuario ${targetNick ? `"${targetNick}"` : ''} fue ${nuevoEstado === 'Activo' ? 'activado' : 'inactivado'} correctamente.`,
        timer: 1800,
        showConfirmButton: false,
      })
      if (options?.fetchAll !== false) {
        await fetchUsuarios()
      }
      return true
    } catch (error: any) {
      console.error('Error al cambiar estado:', error)
      const { title, messages } = parseApiErrors(error, 'Error al cambiar el estado del usuario')
      showErrorAlert(title, messages)
      return false
    } finally {
      setGuardando(false)
    }
  }

  const getRolNombre = (rolVal?: any, userRaw?: any) => {
    if (userRaw?.ROLES && Array.isArray(userRaw.ROLES)) {
      if (userRaw.ROLES.length === 0) return 'Sin Rol'
      return userRaw.ROLES.map((r: any) => r.NOMBRE_ROL || r.nombre || `Rol ${r.ID_ROL}`).join(', ')
    }
    if (userRaw) {
      const directNom = userRaw.NOMBRE_ROL || userRaw.nombre_rol || userRaw.Nombre_Rol || userRaw.ROL_NOMBRE
      if (directNom && typeof directNom === 'string' && isNaN(Number(directNom))) {
        return directNom
      }
    }
    if (!rolVal && rolVal !== 0) return 'Sin Rol'
    return String(rolVal)
  }

  useEffect(() => {
    if (options?.fetchAll !== false) {
      fetchUsuarios()
    }
  }, [fetchUsuarios, options?.fetchAll])

  const resetFormData = useCallback(() => {
    setFormData({
      nombres: '',
      password: '',
      usuario: '',
      rol: '',
      estado: 'Activo',
    })
    setShowPassword(false)
  }, [])

  const handleAbrirCrear = useCallback(async () => {
    if (!canCrearUsuario) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para crear usuarios.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    resetFormData()
    setModalVisible(true)
  }, [resetFormData, canCrearUsuario, verificarAccionEnServidor])

  const handleCerrarCrear = useCallback(() => {
    setModalVisible(false)
    resetFormData()
  }, [resetFormData])

  const handleGuardarUsuario = async () => {
    const ok = await handleCrearUsuario(formData)
    if (ok) {
      setModalVisible(false)
      resetFormData()
    }
  }

  const handleGuardarEditar = async () => {
    const ok = await handleActualizarUsuario(editFormData.id, editFormData)
    if (ok) {
      setModalEdit(false)
    }
  }

  const togglePasswordVisibility = (id: string | number) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const handleAbrirEditar = async (item: any) => {
    if (!canEditarUsuario) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para editar este usuario.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }
    const u = item.raw || item
    const id = String(item.id || u.ID_USUARIO || '')
    const rawRol = u.ID_ROL ?? u.rol ?? item.Rol ?? ''
    const rolVal = rawRol ? String(rawRol) : ''

    const rawEstado = item.Estado ?? u.ESTADO_USUARIO ?? u.estado ?? 'Activo'
    const estadoStr =
      String(rawEstado).toLowerCase() === '1' || String(rawEstado).toLowerCase() === 'activo'
        ? 'Activo'
        : 'Inactivo'

    setEditFormData({
      id,
      usuario: item.Usuario || u.NICK_USUARIO || '',
      password: '',
      nombres: item.Nombres || u.NOMBRES_USUARIO || '',
      rol: rolVal,
      estado: estadoStr,
    })
    setShowPassword(false)
    setModalEdit(true)
  }

  const handleOpenEditModal = () => {
    const current = user || getStoredUser()
    setFormData((prev) => ({
      ...prev,
      usuario: current?.NICK_USUARIO || current?.Usuario || current?.usuario || prev.usuario,
      rol: String(current?.ID_ROL || current?.rol || prev.rol || ''),
      estado: current?.ESTADO_USUARIO || current?.Estado || prev.estado,
      nombres: current?.NOMBRES_USUARIO || current?.NOMBRE_USUARIO || current?.Nombres || current?.nombres || '',
      password: '',
    }))
    setShowPassword(false)
    setModalVisible(true)
  }

  const rawEstado = activeUser?.ESTADO_USUARIO ?? activeUser?.estado ?? activeUser?.NOMBRE_ESTADO ?? activeUser?.Estado
  const estadoNormalizado =
    String(rawEstado).toLowerCase() === '1' || String(rawEstado).toLowerCase() === 'activo'
      ? 'Activo'
      : 'Inactivo'

  const profileItems = activeUser
    ? [
      {
        id: activeUser.ID_USUARIO || activeUser.id || 1,
        Usuario: activeUser.NICK_USUARIO || activeUser.Usuario || activeUser.usuario || '',
        Contraseña: activeUser.PASSWORD_USUARIO || activeUser.password || '••••••••',
        Nombres: activeUser.NOMBRES_USUARIO || activeUser.NOMBRE_USUARIO || 'No disponible',
        fecha_registro: activeUser.FECHA_REGISTRO || activeUser.fecha_registro || '',
        Estado: estadoNormalizado,
      },
    ]
    : []

  const tableItems: UserTableItem[] = useMemo(() => {
    return usuarios.map((u: AdminUser): UserTableItem => {
      const rawPass = u.PASSWORD_USUARIO || u.password || u.contrasena || ''
      return {
        id: u.ID_USUARIO || u.id || 0,
        Usuario: u.NICK_USUARIO || u.usuario || u.email || '',
        Contraseña: rawPass,
        Nombres: u.NOMBRES_USUARIO || u.nombres || u.name || 'No disponible',
        Fecha_registro: u.FECHA_REGISTRO || u.fecha_registro || '',
        Rol: getRolNombre(u.ID_ROL ?? u.rol, u),
        Estado:
          String(u.ESTADO_USUARIO ?? u.estado).toLowerCase() === '1' ||
            String(u.ESTADO_USUARIO ?? u.estado).toLowerCase() === 'activo'
            ? 'Activo'
            : 'Inactivo',
        raw: u,
      }
    })
  }, [usuarios])

  const items = options?.fetchAll === false ? profileItems : tableItems

  const handleGuardar = async () => {
    const current = user || getStoredUser()
    const userId = current?.ID_USUARIO || current?.id
    if (!userId) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo identificar el ID del usuario actual.',
      })
      return
    }

    setLoading(true)
    try {
      const payload: any = {
        ...current,
        NOMBRES_USUARIO: formData.nombres,
      }
      delete payload.PASSWORD_USUARIO
      delete payload.password

      let passToSave = current?.PASSWORD_USUARIO || current?.password
      if (
        formData.password &&
        formData.password.trim() !== '' &&
        !isBcryptHash(formData.password) &&
        formData.password !== '••••••••'
      ) {
        payload.PASSWORD_USUARIO = formData.password.trim()
        payload.password = formData.password.trim()
        passToSave = formData.password.trim()
      }

      await actualizar(userId, payload)

      const updatedUser: UserData = {
        ...current,
        NOMBRES_USUARIO: formData.nombres,
        PASSWORD_USUARIO: passToSave,
        password: passToSave,
        token: current?.token,
      }

      setAuthSession(updatedUser, current?.token)
      dispatch(loginSuccess(updatedUser))

      await Swal.fire({
        icon: 'success',
        title: 'Datos actualizados',
        text: 'Los datos del usuario se guardaron correctamente.',
        timer: 1800,
        showConfirmButton: false,
      })
      setModalVisible(false)
    } catch (error) {
      console.error('Error actualizando usuario:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error al actualizar',
        text: 'No se ha podido actualizar. Intentelo Nuevamente',
      })
    } finally {
      setLoading(false)
    }
  }


  return {
    usuarios,
    rolesList,
    loadingRoles,
    loading,
    guardando,
    errorMsg,
    showPassword,
    setShowPassword,
    showTablePassword,
    setShowTablePassword,
    visiblePasswords,
    togglePasswordVisibility,
    modalVisible,
    setModalVisible,
    modalEdit,
    setModalEdit,
    filtroRol,
    setFiltroRol,
    formData,
    setFormData,
    editFormData,
    setEditFormData,
    fetchUsuarios,
    fetchRoles,
    handleRecargar,
    handleCrearUsuario,
    handleActualizarUsuario,
    handleEliminarUsuario,
    handleGuardarEditar,
    handleGuardarUsuario,
    handleAbrirCrear,
    handleCerrarCrear,
    resetFormData,
    handleAbrirEditar,
    cambiarEstadoUsuario,
    getRolNombre,
    handleOpenEditModal,
    handleGuardar,
    items,
    user: activeUser,
    activeUser,
    getStoredUser,
    canCrearUsuario,
    canGuardarUsuario,
    canEditarUsuario,
    canActualizarUsuario,
    canEliminarUsuario,
    canInactivarUsuario,
    canActivarUsuario,
    verContraseñaUsuario
  }
}

export default useUsers
