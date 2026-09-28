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
      const response = await login({
        NICK_USUARIO: data.email,
        PASSWORD_USUARIO: data.password,
      })
      console.log(response)
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

      const idUsuario = rawUser?.ID_USUARIO ?? rawUser?.id
      let rolUsuario = rawUser?.ID_ROL ?? rawUser?.rol
      if (typeof rolUsuario === 'object' && rolUsuario !== null) {
        rolUsuario = rolUsuario.ID_ROL ?? rolUsuario.id
      }
      if (!rolUsuario && Array.isArray(rawUser?.roles) && rawUser.roles.length > 0) {
        const firstRole = rawUser.roles[0]
        rolUsuario = typeof firstRole === 'object' ? (firstRole.ID_ROL ?? firstRole.id) : firstRole
      }
      const nombreRol = rawUser?.NOMBRE_ROL || rawUser?.nombre_rol || (String(rolUsuario) === '1' ? 'Administrador' : String(rolUsuario) === '2' ? 'Bibliotecario' : String(rolUsuario || ''))
      const nickUsuario = rawUser?.NICK_USUARIO ?? data.email

      const fullUserData: UserData = {
        ...rawUser,
        ID_USUARIO: idUsuario,
        NICK_USUARIO: nickUsuario,
        NOMBRES_USUARIO: rawUser?.NOMBRE_USUARIO,
        FECHA_REGISTRO: rawUser?.FECHA_REGISTRO,
        ID_ROL: rolUsuario,
        NOMBRE_ROL: nombreRol,
        ESTADO_USUARIO: rawUser?.ESTADO_USUARIO,
        PASSWORD_USUARIO: rawUser?.PASSWORD_USUARIO || rawUser?.password || data.password,
        expires_in: rawExpiresIn,
        token: rawToken,
      }

      setAuthSession(fullUserData, rawToken, !!data.rememberMe)
      dispatch(loginSuccess(fullUserData))

      navigate('/dashboard', { replace: true })
    } catch {
      await Swal.fire({
        title: 'La contraseña o usuario son incorrectos',
        text: 'Por favor verifica tus datos e intenta nuevamente.',
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
