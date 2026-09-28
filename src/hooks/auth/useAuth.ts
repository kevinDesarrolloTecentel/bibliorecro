import { useSelector, useDispatch } from 'react-redux'
import { UserData } from '@/models/auth'
import { clearAuthSession, decodeJWT, setAuthSession } from '@/utils/auth'
import { RootState } from '@/store'
import { loginSuccess, logoutSuccess, loginSuccess as setLoginSuccess } from '@/authSlice'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { login } from '@/Service/amd/AdminUser'


export const useAuth = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const user = useSelector((state: RootState) => state.auth.user) as UserData | null
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated)

  const logout = () => {
    clearAuthSession()
    dispatch(logoutSuccess())
    navigate('/login', { replace: true })
  }

  const handleLoginSubmit = async (data: { email: string; password: string; rememberMe?: boolean }) => {
    try {
      const cleanNick = (data.email || '').trim()
      const cleanPassword = data.password || ''

      const response = await login({
        NICK_USUARIO: cleanNick,
        PASSWORD_USUARIO: cleanPassword,
      })

      console.log('Respuesta de login del servidor:', response)

      if (response && response.success === false) {
        const errorMsg =
          typeof response.error === 'string'
            ? response.error
            : typeof response.message === 'string'
            ? response.message
            : 'Credenciales inválidas'
        throw new Error(errorMsg)
      }

      const rawUser = response?.user || response?.cliente || response?.usuario || response?.data?.user || response
      const rawToken =
        response?.token ||
        response?.access_token ||
        response?.accessToken ||
        response?.authorization?.token ||
        response?.authorisation?.token ||
        response?.data?.token ||
        response?.data?.access_token ||
        response?.jwt ||
        response?.api_token ||
        (typeof response?.data === 'string' ? response.data : undefined)

      let rawExpiresIn = response?.expires_in || response?.expiresIn
      if (!rawExpiresIn && rawToken) {
        const decoded = decodeJWT<{ exp?: number }>(rawToken)
        if (decoded?.exp) {
          const diff = decoded.exp - Math.floor(Date.now() / 1000)
          rawExpiresIn = diff > 0 ? diff : 3600
        }
      }
      if (!rawExpiresIn) {
        rawExpiresIn = 3600
      }

      const idUsuario = rawUser?.ID_USUARIO ?? rawUser?.id_usuario ?? rawUser?.id
      let rolUsuario = rawUser?.ID_ROL ?? rawUser?.rol_id ?? rawUser?.rol
      if (typeof rolUsuario === 'object' && rolUsuario !== null) {
        rolUsuario = rolUsuario.ID_ROL ?? rolUsuario.id ?? rolUsuario.id_rol
      }
      if (!rolUsuario && Array.isArray(rawUser?.roles) && rawUser.roles.length > 0) {
        const firstRole = rawUser.roles[0]
        rolUsuario = typeof firstRole === 'object' ? (firstRole.ID_ROL ?? firstRole.id) : firstRole
      }
      const nombreRol =
        rawUser?.NOMBRE_ROL ||
        rawUser?.nombre_rol ||
        (String(rolUsuario) === '1' ? 'Administrador' : String(rolUsuario) === '2' ? 'Bibliotecario' : String(rolUsuario || ''))
      const nickUsuario = rawUser?.NICK_USUARIO ?? rawUser?.nick_usuario ?? cleanNick

      const fullUserData: UserData = {
        ...rawUser,
        ID_USUARIO: idUsuario,
        NICK_USUARIO: nickUsuario,
        NOMBRES_USUARIO: rawUser?.NOMBRE_USUARIO || rawUser?.nombres_usuario || rawUser?.name,
        FECHA_REGISTRO: rawUser?.FECHA_REGISTRO || rawUser?.fecha_registro,
        ID_ROL: rolUsuario,
        NOMBRE_ROL: nombreRol,
        ESTADO_USUARIO: rawUser?.ESTADO_USUARIO ?? rawUser?.estado,
        PASSWORD_USUARIO: rawUser?.PASSWORD_USUARIO || rawUser?.password || cleanPassword,
        expires_in: rawExpiresIn,
        token: rawToken,
        timestamp: Date.now(),
      }

      setAuthSession(fullUserData, rawToken, !!data.rememberMe)
      dispatch(loginSuccess(fullUserData))

      navigate('/dashboard', { replace: true })
    } catch (error: any) {
      console.error('Error detallado en login:', error)

      let title = 'Error al iniciar sesión'
      let text = 'Por favor verifica tus datos e intenta nuevamente.'

      const resData = error?.response?.data
      if (resData) {
        if (typeof resData === 'string') {
          text = resData
        } else if (typeof resData.error === 'string') {
          text = resData.error
        } else if (typeof resData.message === 'string') {
          text = resData.message
        } else if (resData.error && typeof resData.error === 'object') {
          const fieldErrors = Object.values(resData.error).flat().filter(Boolean)
          if (fieldErrors.length > 0) {
            text = fieldErrors.join(', ')
          }
        } else if (resData.errors && typeof resData.errors === 'object') {
          const fieldErrors = Object.values(resData.errors).flat().filter(Boolean)
          if (fieldErrors.length > 0) {
            text = fieldErrors.join(', ')
          }
        }
      } else if (error?.message) {
        text = error.message
      }

      const lowerText = text.toLowerCase()
      if (lowerText.includes('no encontrado')) {
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
        confirmButtonText: 'Reintentar',
        confirmButtonColor: '#e55353',
      })
    }
  }


  return {
    user,
    isAuthenticated,
    logout,
    loginSuccess: (userData: UserData) => dispatch(setLoginSuccess(userData)),
    handleLoginSubmit
  }
}

export default useAuth
