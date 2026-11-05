import { useSelector, useDispatch } from 'react-redux'
import { UserData, LoginFormData } from '@/models/auth'
import { clearAuthSession, setAuthSession } from '@/utils/auth'
import { RootState } from '@/store'
import { loginSuccess, logoutSuccess } from '@/authSlice'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { login } from '@/Service/adm/AdminUser'

export const useAuth = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const user = useSelector((state: RootState) => state.auth.user) as UserData | null
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated)

  const logout = () => {
    clearAuthSession()
    dispatch(logoutSuccess())
    if (typeof window !== 'undefined') {
      window.location.replace('/#/login')
      window.location.reload()
    } else {
      navigate('/login', { replace: true })
    }
  }

  const handleLoginSubmit = async (data: LoginFormData) => {
    try {
      const cleanNick = (data.email || '').trim()
      const cleanPassword = data.password || ''

      const response = await login({
        NICK_USUARIO: cleanNick,
        PASSWORD_USUARIO: cleanPassword,
      })

      if (response && response.success === false) {
        throw new Error(response.message || response.error || 'Credenciales inválidas')
      }

      const rawUser = response?.user || response?.data?.user
      const rawToken = response?.token || response?.data?.token
      const rawExpiresIn = Number(response?.expires_in || 3600)

      const rawEstado = rawUser?.ESTADO_USUARIO ?? rawUser?.estado ?? rawUser?.Estado
      if (
        rawEstado !== undefined &&
        rawEstado !== null &&
        (String(rawEstado) === '0' || String(rawEstado).toLowerCase() === 'inactivo' || rawEstado === false)
      ) {
        clearAuthSession()
        await Swal.fire({
          icon: 'error',
          title: 'Usuario inactivo',
          text: 'Tu usuario se encuentra inactivo. Comunícate con el administrador para activar tu cuenta.',
          confirmButtonColor: '#dc3545',
          confirmButtonText: 'Entendido',
        })
        return
      }

      const fullUserData: UserData = {
        ...rawUser,
        ID_USUARIO: rawUser?.ID_USUARIO,
        NICK_USUARIO: rawUser?.NICK_USUARIO || cleanNick,
        NOMBRES_USUARIO: rawUser?.NOMBRES_USUARIO || '',
        FECHA_REGISTRO: rawUser?.FECHA_REGISTRO || '',
        ESTADO_USUARIO: rawUser?.ESTADO_USUARIO,
        expires_in: rawExpiresIn,
        token: rawToken,
        timestamp: Date.now(),
      }

      setAuthSession(fullUserData, rawToken, Boolean(data.rememberMe), rawExpiresIn)
      dispatch(loginSuccess(fullUserData))
      navigate('/dashboard', { replace: true })
    } catch (error: any) {
      console.error('Error al iniciar sesión:', error)

      let title = 'Error al iniciar sesión'
      const text =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        'Por favor verifica tus datos e intenta nuevamente.'

      const lowerText = text.toLowerCase()
      if (
        lowerText.includes('inactiv') ||
        lowerText.includes('bloquea') ||
        lowerText.includes('desactiv') ||
        error?.response?.status === 403
      ) {
        title = 'Usuario inactivo'
      } else if (lowerText.includes('no encontrado')) {
        title = 'Usuario no encontrado'
      } else if (lowerText.includes('contrase') || lowerText.includes('password')) {
        title = 'Contraseña incorrecta'
      } else if (lowerText.includes('required') || lowerText.includes('requerid')) {
        title = 'Campos requeridos'
      } else if (lowerText.includes('network') || lowerText.includes('conexión')) {
        title = 'Error de conexión'
      }

      await Swal.fire({
        title,
        text,
        icon: 'error',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
    }
  }

  return {
    user,
    isAuthenticated,
    logout,
    clearAuthSession,
    loginSuccess: (userData: UserData) => dispatch(loginSuccess(userData)),
    handleLoginSubmit,
  }
}

export default useAuth
