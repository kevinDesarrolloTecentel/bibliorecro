import { useState, useEffect, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import Swal from 'sweetalert2'
import { useAuth } from '../auth/useAuth'
import { loginSuccess } from '@/authSlice'
import { getStoredUser } from '@/utils/auth'
import { UserData } from '@/models/auth'
import { ProfileFormData, ProfileTableItem } from '@/models/adm/user.model'
import { actualizar, perfil } from '@/Service/adm/AdminUser'
import { isBcryptHash, parseApiErrors } from '@/hooks/adm-user/useUsers'
import { usePermissions } from '@/context/PermissionsContext'

/**
 * Valida los datos del formulario de edición de perfil
 */
export const validateProfileData = (
  formData: ProfileFormData
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []

  if (!formData.nombres || !formData.nombres.trim()) {
    errors.push('El nombre completo es obligatorio.')
  }

  if (formData.password && formData.password.trim() !== '') {
    const pass = formData.password.trim()
    if (pass !== '••••••••' && !isBcryptHash(pass)) {
      if (pass.length < 6) {
        errors.push('La contraseña debe tener al menos 6 caracteres.')
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export const useProfile = () => {
  const dispatch = useDispatch()
  const { user } = useAuth()
  const { canDoAction, verificarAccionEnServidor } = usePermissions()
  const activeUser = user || getStoredUser()

  const canMostrarBotonEditar = canDoAction('btn_mostrar_boton_editar')
  const canEditarPerfil = canDoAction('btn_editar_perfil')
  const canGuardarPerfil = canDoAction('btn_guardar_perfil')

  const [loading, setLoading] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [profileData, setProfileData] = useState<any>(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState<ProfileFormData>({
    usuario: '',
    nombres: '',
    password: '',
  })

  const currentUser = profileData || activeUser

  const fetchProfile = useCallback(async () => {
    setLoading(true)
    try {
      const response = await perfil()
      const data = response?.data || response?.usuario || response?.user || response
      if (data) {
        setProfileData(data)
      }
    } catch (error) {
      console.error('Error al consultar perfil:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleOpenEditModal = async () => {
    if (!canEditarPerfil) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para editar el perfil.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    const current = profileData || activeUser
    setFormData({
      usuario: current?.NICK_USUARIO || current?.Usuario || current?.usuario || '',
      nombres: current?.NOMBRES_USUARIO || current?.NOMBRE_USUARIO || current?.Nombres || current?.nombres || '',
      password: '',
    })
    setShowPassword(false)
    setModalVisible(true)
  }

  const handleGuardar = async () => {
    if (!canGuardarPerfil) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para guardar cambios en el perfil.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    const tienePermiso = await verificarAccionEnServidor('btn_guardar_perfil')
    if (!tienePermiso) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para guardar cambios en el perfil.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }
    const { isValid, errors } = validateProfileData(formData)
    if (!isValid) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos requeridos',
        text: errors.join('\n'),
        confirmButtonColor: '#0d6efd',
        confirmButtonText: 'Entendido',
      })
      return
    }

    const current = profileData || activeUser
    const userId = current?.ID_USUARIO ?? current?.id

    if (!userId) {
      Swal.fire({
        icon: 'error',
        title: 'Error de identificación',
        text: 'No se pudo identificar el ID del usuario actual.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    setGuardando(true)
    try {
      const payload: any = {
        NOMBRES_USUARIO: formData.nombres.trim(),
      }

      let passToSave = current?.PASSWORD_USUARIO || current?.password
      if (
        formData.password &&
        formData.password.trim() !== '' &&
        formData.password !== '••••••••' &&
        !isBcryptHash(formData.password)
      ) {
        payload.PASSWORD_USUARIO = formData.password.trim()
        payload.password = formData.password.trim()
        passToSave = formData.password.trim()
      }

      await actualizar(userId, payload)

      const updatedUser: UserData = {
        ...current,
        NOMBRES_USUARIO: formData.nombres.trim(),
        PASSWORD_USUARIO: passToSave,
        password: passToSave,
        token: current?.token,
      }

      dispatch(loginSuccess(updatedUser))

      await fetchProfile()

      Swal.fire({
        icon: 'success',
        title: 'Perfil actualizado',
        text: 'Tu información de perfil se ha guardado correctamente.',
        timer: 1800,
        showConfirmButton: false,
      })

      setModalVisible(false)
    } catch (error: any) {
      console.error('Error al actualizar perfil:', error)
      const { title, messages } = parseApiErrors(error, 'Error al actualizar perfil')
      Swal.fire({
        icon: 'error',
        title: title || 'Error al actualizar perfil',
        text: messages?.join('\n') || 'Ocurrió un error al persistir el cambio en el servidor.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
    } finally {
      setGuardando(false)
    }
  }

  // Normalización del estado para la tabla
  const rawEstado = currentUser?.ESTADO_USUARIO ?? currentUser?.estado ?? currentUser?.NOMBRE_ESTADO ?? currentUser?.Estado
  const estadoNormalizado: 'Activo' | 'Inactivo' =
    String(rawEstado).toLowerCase() === '1' || String(rawEstado).toLowerCase() === 'activo'
      ? 'Activo'
      : 'Inactivo'

  // Items para la CSmartTable
  const items: ProfileTableItem[] = currentUser
    ? [
      {
        id: currentUser.ID_USUARIO || currentUser.id || 1,
        Usuario: currentUser.NICK_USUARIO || currentUser.Usuario || currentUser.usuario || '',
        Nombres: currentUser.NOMBRES_USUARIO || currentUser.NOMBRE_USUARIO || currentUser.Nombres || currentUser.nombres || 'No disponible',
        fecha_registro: currentUser.FECHA_REGISTRO || currentUser.fecha_registro || '',
        Estado: estadoNormalizado,
        raw: currentUser,
      },
    ]
    : []

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  return {
    user: activeUser,
    currentUser,
    profileData,
    loading,
    guardando,
    modalVisible,
    setModalVisible,
    showPassword,
    setShowPassword,
    formData,
    setFormData,
    items,
    fetchProfile,
    handleOpenEditModal,
    handleGuardar,
    getStoredUser,
    canMostrarBotonEditar,
    canEditarPerfil,
    canGuardarPerfil,
  }
}

export default useProfile
