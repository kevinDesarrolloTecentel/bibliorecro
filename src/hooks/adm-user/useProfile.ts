import { useState, useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Swal from 'sweetalert2'
import { RootState } from '@/store'
import { updateUserProfile, AuthUser, PerfilResponse } from '@/slices/authSlice'
import { AdminUsuario } from '@/models/adm/user.model'
import { actualizar, perfil } from '@/Service/adm/AdminUser'
import { isBcryptHash, parseApiErrors } from '@/utils/errors'
import { usePermissions } from '@/hooks/auth/usePermissions'

// Valida los datos del formulario de editar perfil
export const validateProfileData = (
  data: AdminUsuario,
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []

  const nombres = (data.NOMBRES_USUARIO || '').trim()
  if (!nombres) {
    errors.push('El nombre completo es obligatorio.')
  } else if (nombres.length > 25) {
    errors.push('El nombre completo no puede superar los 25 caracteres.')
  }

  const pass = (data.PASSWORD_USUARIO || '').trim()
  if (pass !== '') {
    if (pass !== '••••••••' && !isBcryptHash(pass)) {
      if (pass.length < 6) {
        errors.push('La contraseña debe tener al menos 6 caracteres.')
      } else if (pass.length > 25) {
        errors.push('La contraseña no puede superar los 25 caracteres.')
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
  const user = useSelector((state: RootState) => state.auth.user)
  const { canDoAction } = usePermissions()

  // Permisos de acciones del perfil
  const canMostrarBotonEditar = canDoAction('btn_mostrar_boton_editar')
  const canEditarPerfil = canDoAction('btn_editar_perfil')
  const canGuardarPerfil = canDoAction('btn_guardar_perfil')
  const canVermisPermisos = canDoAction('btn_ver_permisos')
  const canVermisRoles = canDoAction('btn_ver_roles')

  // Estados locales
  const [loading, setLoading] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState<AdminUsuario>({
    NICK_USUARIO: '',
    NOMBRES_USUARIO: '',
    PASSWORD_USUARIO: '',
  })

  // Obtener información del perfil desde el backend y sincronizar el authSlice
  const fetchProfile = useCallback(async () => {
    setLoading(true)
    try {
      const response: PerfilResponse = await perfil()
      if (response?.data) {
        const cleanPerfil: Partial<AuthUser> = {
          ID_USUARIO: response.data.ID_USUARIO,
          NICK_USUARIO: response.data.NICK_USUARIO,
          NOMBRES_USUARIO: response.data.NOMBRES_USUARIO,
          ESTADO_USUARIO: response.data.ESTADO_USUARIO,
          FECHA_REGISTRO: response.data.FECHA_REGISTRO,
        }
        dispatch(updateUserProfile(cleanPerfil))
      }
    } catch (error) {
      console.error('Error al consultar perfil:', error)
    } finally {
      setLoading(false)
    }
  }, [dispatch])

  // Abrir modal de edición con los datos del usuario actual
  const handleOpenEditModal = () => {
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

    setFormData({
      NICK_USUARIO: user?.NICK_USUARIO || '',
      NOMBRES_USUARIO: user?.NOMBRES_USUARIO || '',
      PASSWORD_USUARIO: '',
    })
    setShowPassword(false)
    setModalVisible(true)
  }

  // Guardar cambios del perfil
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

    const userId = user?.ID_USUARIO
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
      const payload: Partial<AdminUsuario> = {
        NOMBRES_USUARIO: (formData.NOMBRES_USUARIO || '').trim(),
      }

      const pass = (formData.PASSWORD_USUARIO || '').trim()
      if (
        pass !== '' &&
        pass !== '••••••••' &&
        !isBcryptHash(pass)
      ) {
        payload.PASSWORD_USUARIO = pass
      }

      await actualizar(userId, payload)

      // Actualizar el estado global en authSlice
      dispatch(updateUserProfile({ NOMBRES_USUARIO: payload.NOMBRES_USUARIO }))

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

  // Fila para la tabla de perfil (directamente el usuario autenticado)
  const items: AuthUser[] = user ? [user] : []

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  return {
    user,
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
    canMostrarBotonEditar,
    canEditarPerfil,
    canGuardarPerfil,
    canVermisPermisos,
    canVermisRoles,
  }
}

export default useProfile
