import { useState, useEffect, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import Swal from 'sweetalert2'
import { useAuth } from '../auth/useAuth'
import { loginSuccess } from '@/authSlice'
import { getStoredUser } from '@/utils/auth'
import { UserData } from '@/models/auth'
import { actualizar, perfil } from '@/Service/amd/AdminUser'

export const useProfile = () => {
  const dispatch = useDispatch()
  const { user } = useAuth()
  const activeUser = user || getStoredUser()

  const [loading, setLoading] = useState(false)
  const [profileData, setProfileData] = useState<any>(null)

  const fetchProfile = useCallback(async () => {
    setLoading(true)
    try {
      const response = await perfil()
      const data = response?.data || response?.usuario || response
      if (data) {
        setProfileData(data)
      }
    } catch (error) {
      console.error('Error al consultar perfil:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleActualizarPerfil = async (formData: { nombres: string; password?: string }): Promise<boolean> => {
    const current = activeUser
    const userId = current?.ID_USUARIO ?? current?.id

    if (!userId) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo identificar el ID del usuario actual.',
      })
      return false
    }

    setLoading(true)
    try {
      const payload: any = {
        ...current,
        NOMBRES_USUARIO: formData.nombres,
      }
      if (formData.password && formData.password.trim() !== '') {
        payload.PASSWORD_USUARIO = formData.password
      }

      await actualizar(userId, payload)

      const updatedUser: UserData = {
        ...current,
        NOMBRES_USUARIO: formData.nombres,
        PASSWORD_USUARIO: formData.password || current?.PASSWORD_USUARIO,
        token: current?.token,
      }

      dispatch(loginSuccess(updatedUser))

      await Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
      }).fire({
        icon: 'success',
        title: 'Datos actualizados correctamente',
      })

      return true
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || 'Error al actualizar perfil'
      Swal.fire('Error', msg, 'error')
      return false
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  return {
    user: activeUser,
    profileData,
    loading,
    fetchProfile,
    handleActualizarPerfil,
  }
}

export default useProfile
