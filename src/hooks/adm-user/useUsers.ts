import { useState, useEffect, useCallback } from 'react'
import Swal from 'sweetalert2'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/store'
import {
  setUsuarios,
  setUsuarioSeleccionado,
  agregarUsuario,
  actualizarUsuarioEnLista,
  eliminarUsuarioDeLista,
} from '@/slices/adminSlice'
import { actualizar, crear, eliminar } from '@/Service/adm/AdminUser'
import { asignarRolesUsuario, listarUsuariosConRoles } from '@/Service/adm/Rol'
import { AdminUsuario } from '@/models/adm/user.model'
import useAuth from '@/hooks/auth/useAuth'
import { usePermissions, marcarCambioPermisos } from '@/hooks/auth/usePermissions'
import { parseApiErrors, showErrorAlert, isBcryptHash } from '@/utils/errors'

export const useUsers = (options: { fetchAll?: boolean } = { fetchAll: true }) => {
  const dispatch = useDispatch()

  // Estado Global desde Redux 
  const usuarios = useSelector((state: RootState) => state.admin.usuarios)
  const rolesList = useSelector((state: RootState) => state.admin.roles)
  const usuarioSeleccionado = useSelector((state: RootState) => state.admin.usuarioSeleccionado)

  // Control de estado local de UI y modales
  const [loading, setLoading] = useState<boolean>(false)
  const [guardando, setGuardando] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [modalEdit, setModalEdit] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Formulario puro usando exclusivamente AdminUsuario
  const initialFormData: AdminUsuario = {
    NICK_USUARIO: '',
    NOMBRES_USUARIO: '',
    PASSWORD_USUARIO: '',
    ESTADO_USUARIO: 1,
  }
  const [formData, setFormData] = useState<AdminUsuario>(initialFormData)
  const [editFormData, setEditFormData] = useState<AdminUsuario>(initialFormData)

  // Permisos de sesión
  const { user } = useAuth()
  const { canDoAction } = usePermissions()

  const canCrearUsuario = canDoAction('btn_crear_usuario')
  const canGuardarUsuario = canDoAction('btn_guardar_usuario')
  const canEditarUsuario = canDoAction('btn_editar_usuario')
  const canActualizarUsuario = canDoAction('btn_actualizar_usuario')
  const canEliminarUsuario = canDoAction('btn_eliminar_usuario')
  const canInactivarUsuario = canDoAction('btn_inactivar_usuario_adm')
  const canActivarUsuario = canDoAction('btn_activar_usuario_adm')
  const verContraseñaUsuario = canDoAction('btn_ver_contraseña_usuario')

  // Cargar usuarios desde la API y persistirlos en Redux
  const fetchUsuarios = useCallback(async () => {
    setLoading(true)
    setErrorMsg(null)
    try {
      const response = await listarUsuariosConRoles()
      const lista: AdminUsuario[] = Array.isArray(response)
        ? response
        : response?.data || []
      dispatch(setUsuarios(lista))
    } catch (error: any) {
      console.error('Error al obtener usuarios:', error)
      if (error?.response?.status === 401) {
        setErrorMsg('El servidor rechazó la autenticación. Por favor vuelva a iniciar sesión.')
      } else {
        setErrorMsg('No se pudo conectar con el servidor para obtener los usuarios.')
      }
    } finally {
      setLoading(false)
    }
  }, [dispatch])

  // Validación con las propiedades oficiales de AdminUsuario
  const validateUserData = (data: AdminUsuario, isEdit = false): string[] => {
    const errors: string[] = []
    const nick = (data.NICK_USUARIO || '').trim()
    const pass = data.PASSWORD_USUARIO || ''
    const nombres = (data.NOMBRES_USUARIO || '').trim()

    if (!nick) {
      errors.push('El campo "Usuario" es obligatorio.')
    } else if (nick.length < 3) {
      errors.push('El nombre de usuario debe tener al menos 3 caracteres.')
    } else if (/\s/.test(nick)) {
      errors.push('El nombre de usuario no debe contener espacios en blanco.')
    } else if (nick.length > 25) {
      errors.push('El nombre de usuario no puede superar los 25 caracteres.')
    }

    if (!isEdit) {
      if (!pass) {
        errors.push('El campo "Contraseña" es obligatorio.')
      } else if (pass.length < 6) {
        errors.push('La contraseña debe tener al menos 6 caracteres.')
      } else if (pass.length > 25) {
        errors.push('La contraseña no puede superar los 25 caracteres.')
      }
    } else if (pass && pass.trim() !== '' && pass !== '••••••••' && !isBcryptHash(pass)) {
      if (pass.length < 6) {
        errors.push('La nueva contraseña debe tener al menos 6 caracteres.')
      } else if (pass.length > 25) {
        errors.push('La nueva contraseña no puede superar los 25 caracteres.')
      }
    }

    if (!nombres) {
      errors.push('El campo "Nombres Completos" es obligatorio.')
    } else if (nombres.length < 3) {
      errors.push('Los nombres completos deben tener al menos 3 caracteres.')
    } else if (nombres.length > 25) {
      errors.push('Los nombres completos no pueden superar los 25 caracteres.')
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(nombres)) {
      errors.push('El campo "Nombres Completos" solo debe contener letras.')
    }

    return errors
  }

  // Crear usuario
  const handleCrearUsuario = async (data: AdminUsuario): Promise<boolean> => {
    if (!canGuardarUsuario) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para registrar un nuevo usuario.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return false
    }

    const errors = validateUserData(data, false)
    if (errors.length > 0) {
      showErrorAlert('Campos requeridos o inválidos', errors)
      return false
    }

    try {
      setGuardando(true)
      const payload: AdminUsuario = {
        NICK_USUARIO: data.NICK_USUARIO?.trim(),
        PASSWORD_USUARIO: data.PASSWORD_USUARIO,
        NOMBRES_USUARIO: data.NOMBRES_USUARIO?.trim(),
        ESTADO_USUARIO: Number(data.ESTADO_USUARIO) === 0 ? 0 : 1,
      }
      if (data.ID_ROL) payload.ID_ROL = Number(data.ID_ROL)

      const res = await crear(payload)
      const newId = res?.data?.ID_USUARIO ?? res?.ID_USUARIO

      if (newId && payload.ID_ROL) {
        try {
          await asignarRolesUsuario(newId, [Number(payload.ID_ROL)])
          marcarCambioPermisos()
        } catch (syncErr) {
          console.warn('Error al asignar rol inicial:', syncErr)
        }
      }

      dispatch(agregarUsuario({ ...payload, ID_USUARIO: newId, ROLES: [] }))

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

  // Actualizar usuario
  const handleActualizarUsuario = async (
    id: string | number,
    data: AdminUsuario,
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

    const errors = validateUserData(data, true)
    if (errors.length > 0) {
      showErrorAlert('Campos requeridos o inválidos', errors)
      return false
    }

    try {
      setGuardando(true)
      const payload: AdminUsuario = {
        NICK_USUARIO: data.NICK_USUARIO?.trim(),
        NOMBRES_USUARIO: data.NOMBRES_USUARIO?.trim(),
        ESTADO_USUARIO: Number(data.ESTADO_USUARIO) === 0 ? 0 : 1,
      }

      if (data.ID_ROL) payload.ID_ROL = Number(data.ID_ROL)

      if (
        data.PASSWORD_USUARIO &&
        data.PASSWORD_USUARIO.trim() !== '' &&
        data.PASSWORD_USUARIO !== '••••••••' &&
        !isBcryptHash(data.PASSWORD_USUARIO)
      ) {
        payload.PASSWORD_USUARIO = data.PASSWORD_USUARIO.trim()
      }

      await actualizar(id, payload)
      dispatch(actualizarUsuarioEnLista({ ID_USUARIO: id, ...payload }))
      marcarCambioPermisos()

      Swal.fire({
        icon: 'success',
        title: '¡Usuario actualizado!',
        text: 'Los datos del usuario se actualizaron correctamente.',
        timer: 1800,
        showConfirmButton: false,
      })

      if (options?.fetchAll !== false) {
        await fetchUsuarios()
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

  // Eliminar usuario
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

    const currentId = user?.ID_USUARIO
    if (currentId && String(id) === String(currentId)) {
      Swal.fire({
        icon: 'warning',
        title: 'Acción no permitida',
        text: 'No puedes eliminar tu propia cuenta mientras estás en sesión.',
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

    try {
      setGuardando(true)
      await eliminar(id)
      dispatch(eliminarUsuarioDeLista(id))

      Swal.fire({
        icon: 'success',
        title: '¡Usuario eliminado!',
        text: 'El usuario fue eliminado correctamente.',
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

  // Cambiar Estado (Activar / Inactivar)
  const cambiarEstadoUsuario = async (u: AdminUsuario): Promise<boolean> => {
    const id = u.ID_USUARIO
    if (!id) return false

    const isActivo = Number(u.ESTADO_USUARIO) === 1
    const nuevoEstado = isActivo ? 0 : 1
    const accion = isActivo ? 'inactivar' : 'activar'
    const permiso = isActivo ? canInactivarUsuario : canActivarUsuario

    if (!permiso) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: `No tienes permisos para ${accion} este usuario.`,
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return false
    }

    const currentId = user?.ID_USUARIO
    if (isActivo && currentId && String(id) === String(currentId)) {
      Swal.fire({
        icon: 'warning',
        title: 'Acción no permitida',
        text: 'No puedes inactivar tu propia cuenta mientras estás en sesión.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return false
    }

    const confirm = await Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas ${accion} al usuario "${u.NICK_USUARIO || ''}"?`,
      icon: isActivo ? 'warning' : 'question',
      showCancelButton: true,
      confirmButtonColor: isActivo ? '#f9b115' : '#2eb85c',
      cancelButtonColor: '#6c757d',
      confirmButtonText: `Sí, ${accion}`,
      cancelButtonText: 'Cancelar',
    })

    if (!confirm.isConfirmed) return false

    try {
      setGuardando(true)
      await actualizar(id, { ESTADO_USUARIO: nuevoEstado })
      dispatch(actualizarUsuarioEnLista({ ID_USUARIO: id, ESTADO_USUARIO: nuevoEstado }))
      setEditFormData((prev) => ({ ...prev, ESTADO_USUARIO: nuevoEstado }))
      marcarCambioPermisos()

      Swal.fire({
        icon: 'success',
        title: nuevoEstado === 1 ? '¡Usuario activado!' : '¡Usuario inactivado!',
        timer: 1800,
        showConfirmButton: false,
      })

      if (options?.fetchAll !== false) {
        await fetchUsuarios()
      }
      return true
    } catch (error: any) {
      console.error(`Error al ${accion} usuario:`, error)
      const { title, messages } = parseApiErrors(error, `Error al ${accion} el usuario`)
      showErrorAlert(title, messages)
      return false
    } finally {
      setGuardando(false)
    }
  }

  // Control de Modales
  const handleAbrirCrear = useCallback(() => {
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
    setFormData(initialFormData)
    setShowPassword(false)
    setModalVisible(true)
  }, [canCrearUsuario])

  const handleCerrarCrear = useCallback(() => {
    setModalVisible(false)
    setFormData(initialFormData)
    setShowPassword(false)
  }, [])

  const handleAbrirEditar = useCallback(
    (u: AdminUsuario) => {
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
      dispatch(setUsuarioSeleccionado(u))
      setEditFormData({
        ID_USUARIO: u.ID_USUARIO,
        NICK_USUARIO: u.NICK_USUARIO || '',
        NOMBRES_USUARIO: u.NOMBRES_USUARIO || '',
        PASSWORD_USUARIO: '',
        ESTADO_USUARIO: u.ESTADO_USUARIO ?? 1,
        ID_ROL: u.ID_ROL ?? null,
        ROLES: u.ROLES || [],
      })
      setShowPassword(false)
      setModalEdit(true)
    },
    [canEditarUsuario, dispatch],
  )

  const resetFormData = useCallback(() => {
    setFormData(initialFormData)
    setEditFormData(initialFormData)
    dispatch(setUsuarioSeleccionado(null))
    setShowPassword(false)
  }, [dispatch])

  useEffect(() => {
    if (options?.fetchAll !== false) {
      fetchUsuarios()
    }
  }, [fetchUsuarios, options?.fetchAll])

  return {
    usuarios,
    rolesList,
    usuarioSeleccionado,
    loading,
    guardando,
    errorMsg,
    showPassword,
    setShowPassword,
    modalVisible,
    setModalVisible,
    modalEdit,
    setModalEdit,
    formData,
    setFormData,
    editFormData,
    setEditFormData,
    fetchUsuarios,
    handleCrearUsuario,
    handleActualizarUsuario,
    handleEliminarUsuario,
    cambiarEstadoUsuario,
    handleAbrirCrear,
    handleCerrarCrear,
    handleAbrirEditar,
    resetFormData,
    canCrearUsuario,
    canGuardarUsuario,
    canEditarUsuario,
    canActualizarUsuario,
    canEliminarUsuario,
    canInactivarUsuario,
    canActivarUsuario,
    verContraseñaUsuario,
  }
}

export default useUsers
