import { useSelector, useDispatch } from 'react-redux'
import { clearAuthSession, encryptCredentials, saveAuthCookie, getRawAuthCookie, saveUserStorage } from '@/utils/auth'
import { RootState } from '@/store'
import { loginSuccess, logoutSuccess, AuthUser, MisPermisosData, LoginCredentials } from '@/slices/authSlice'
import { AdminRol } from '@/models/adm/rol.model'
import { ModuloGrupo, ModuloPantalla } from '@/models/adm/catalogo.model'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { login } from '@/Service/adm/AdminUser'
import { obtenerMisPermisos } from '@/Service/adm/Permisos'
import { normalizePath } from '@/hooks/auth/usePermissions'

export const useAuth = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const user = useSelector((state: RootState) => state.auth.user)
  const token = useSelector((state: RootState) => state.auth.token)
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated)

  const logout = () => {
    clearAuthSession()
    dispatch(logoutSuccess())
    navigate('/login', { replace: true })
  }

  const handleLoginSubmit = async (data: LoginCredentials) => {
    try {
      const cleanNick = (data.NICK_USUARIO || '').trim()
      const cleanPassword = data.PASSWORD_USUARIO || ''

      const response = await login(
        encryptCredentials({
          NICK_USUARIO: cleanNick,
          PASSWORD_USUARIO: cleanPassword,
        }),
      )

      if (response && response.success === false) {
        throw new Error(response.message || response.error || 'Credenciales inválidas')
      }

      const rawUser = response?.user || response?.data?.user
      const rawToken = response?.token || response?.data?.token
      const rawExpiresIn = Number(response?.expires_in || 3600)

      const rawEstado = rawUser?.ESTADO_USUARIO
      if (
        rawEstado !== undefined &&
        rawEstado !== null &&
        (String(rawEstado) === '0' || String(rawEstado).toLowerCase() === 'inactivo')
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

      // 1. Guardar token inmediatamente para que apiClient esté autenticado
      if (rawToken) {
        saveAuthCookie(rawToken, rawExpiresIn)
      }

      // 2. Consultar mis-permisos para obtener todos los roles y módulos reales asignados
      let misPermisosData: MisPermisosData = response?.permisos || response?.data?.permisos
      try {
        const misPermRes = await obtenerMisPermisos()
        const misPermData = misPermRes?.data || misPermRes
        if (misPermData) {
          misPermisosData = {
            ID_USUARIO: misPermData.ID_USUARIO || rawUser?.ID_USUARIO,
            ROLES: Array.isArray(misPermData.ROLES) ? misPermData.ROLES : (misPermisosData?.ROLES || []),
            MODULOS: Array.isArray(misPermData.MODULOS) ? misPermData.MODULOS : (misPermisosData?.MODULOS || []),
          }
        }
      } catch (e) {
        console.warn('[useAuth] Error consultando mis-permisos:', e)
      }

      const rolesArray: AdminRol[] = Array.isArray(misPermisosData?.ROLES) ? misPermisosData.ROLES : []
      const isUserAdmin = rolesArray.some((r: AdminRol) => Number(r.NIVEL_ROL ?? r.ID_ROL ?? 0) === 1)

      // Usuario depurado estricto
      const fullUserData: AuthUser = {
        ID_USUARIO: rawUser?.ID_USUARIO,
        NICK_USUARIO: rawUser?.NICK_USUARIO,
        NOMBRES_USUARIO: rawUser?.NOMBRES_USUARIO,
        FECHA_REGISTRO: rawUser?.FECHA_REGISTRO,
        ESTADO_USUARIO: rawUser?.ESTADO_USUARIO,
        expires_in: rawExpiresIn,
      }

      // Permisos depurados
      const cleanPermisos: MisPermisosData = {
        ID_USUARIO: misPermisosData?.ID_USUARIO || fullUserData.ID_USUARIO,
        ROLES: rolesArray,
        MODULOS: Array.isArray(misPermisosData?.MODULOS) ? misPermisosData.MODULOS : [],
      }

      let targetRoute = '/dashboard'

      if (cleanPermisos.MODULOS && cleanPermisos.MODULOS.length > 0) {
        let totalPantallas = 0
        const rutasDisponibles: string[] = []

        cleanPermisos.MODULOS.forEach((m: ModuloGrupo<ModuloPantalla<string>>) => {
          m.PANTALLAS?.forEach((p: ModuloPantalla<string>) => {
            totalPantallas++
            if (p.PATH_PERMISO) {
              const normPath = normalizePath(p.PATH_PERMISO)
              rutasDisponibles.push(normPath)
            }
          })
        })

        if (totalPantallas === 0 && !isUserAdmin) {
          clearAuthSession()
          await Swal.fire({
            icon: 'error',
            title: 'Acceso Denegado',
            text: 'No tienes acceso a ninguna pantalla en el sistema.',
            confirmButtonColor: '#dc3545',
            confirmButtonText: 'Entendido',
          })
          return
        }

        if (!rutasDisponibles.includes('/dashboard') && rutasDisponibles.length > 0) {
          targetRoute = rutasDisponibles[0]
        }
      }

      // 3. Guardar usuario en storage
      saveUserStorage(fullUserData)

      // 4. Despachar a Redux
      dispatch(
        loginSuccess({
          user: fullUserData,
          token: getRawAuthCookie() || '',
          permisos: cleanPermisos,
        }),
      )

      navigate(targetRoute, { replace: true })
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
    token,
    isAuthenticated,
    logout,
    clearAuthSession,
    handleLoginSubmit,
  }
}

export default useAuth
