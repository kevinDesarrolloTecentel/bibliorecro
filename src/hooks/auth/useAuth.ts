import { useSelector, useDispatch } from 'react-redux'
import { UserData, LoginFormData } from '@/models/auth'
import { clearAuthSession, setAuthSession } from '@/utils/auth'
import { RootState } from '@/store'
import { loginSuccess, logoutSuccess } from '@/authSlice'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { login } from '@/Service/adm/AdminUser'
import { PERMISOS_EVENTO_LOCAL } from '@/context/PermissionsContext'

const normalizePath = (p?: string): string => {
  if (!p) return '/'
  let clean = p.split('?')[0].trim().toLowerCase()
  if (!clean.startsWith('/')) clean = '/' + clean
  return clean.replace(/\/+$/, '') || '/'
}

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

      // Determinar si es administrador
      const isUserAdmin = Boolean(
        rawUser?.ES_ADMINISTRADOR ||
        Number(rawUser?.ID_ROL) === 1 ||
        rawUser?.ROLES?.some(
          (r: any) =>
            Number(r.ID_ROL) === 1 ||
            String(r.NOMBRE_ROL).toUpperCase() === 'ADMINISTRADOR',
        ) ||
        rawUser?.IDS_ROLES?.includes(1)
      )

      let targetRoute = '/dashboard'

      // Leer permisos directamente de la respuesta del login (sin hacer petición extra)
      const misPermisosData = response?.permisos || response?.data?.permisos

      if (misPermisosData) {
        const isAdminFromPermisos = Boolean(
          misPermisosData?.ES_ADMINISTRADOR ||
          Number(misPermisosData?.ID_ROL) === 1 ||
          misPermisosData?.IDS_ROLES?.includes(1) ||
          misPermisosData?.ROLES?.some(
            (r: any) =>
              Number(r.ID_ROL) === 1 ||
              String(r.NOMBRE_ROL).toUpperCase() === 'ADMINISTRADOR',
          )
        )

        const esAdminFinal = isUserAdmin || isAdminFromPermisos

        let totalPantallas = 0
        const rutasDisponibles: string[] = []
        const rutasSet = new Set<string>()
        const accionesSet = new Set<string>()

        if (misPermisosData?.MODULOS && Array.isArray(misPermisosData.MODULOS)) {
          misPermisosData.MODULOS.forEach((m: any) => {
            m.PANTALLAS?.forEach((p: any) => {
              totalPantallas++
              if (p.PATH_PERMISO) {
                const normPath = normalizePath(p.PATH_PERMISO)
                rutasDisponibles.push(normPath)
                rutasSet.add(normPath)
              }
              p.ACCIONES?.forEach((acc: any) => {
                const codigo = typeof acc === 'string' ? acc : acc?.CODIGO_ACCION
                if (codigo && typeof codigo === 'string' && codigo.trim() !== '') {
                  accionesSet.add(codigo.trim())
                }
              })
            })
          })
        }

        // Guardar permisos en caché local para que PermissionsContext los tenga de inmediato sin re-consultar
        try {
          const cachedPayload = {
            esAdmin: esAdminFinal,
            roles: misPermisosData?.ROLES || [
              {
                ID_ROL: rawUser?.ID_ROL || misPermisosData?.ID_ROL,
                NOMBRE_ROL: rawUser?.NOMBRE_ROL || misPermisosData?.NOMBRE_ROL,
                NIVEL_ROL: 1,
              },
            ],
            modulos: misPermisosData?.MODULOS || [],
            rutas: Array.from(rutasSet),
            acciones: Array.from(accionesSet),
            timestamp: Date.now(),
          }
          localStorage.setItem('biblio_permisos_cache', JSON.stringify(cachedPayload))
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event(PERMISOS_EVENTO_LOCAL))
          }
        } catch (cacheErr) {
          console.warn('[useAuth] Error guardando caché de permisos:', cacheErr)
        }

        // Si el usuario tiene rol pero ese rol no tiene ninguna pantalla asignada
        if (totalPantallas === 0) {
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

        // Si no tiene acceso al dashboard, redirigir a su primera ruta disponible desde la base de datos
        if (!rutasDisponibles.includes('/dashboard')) {
          targetRoute = rutasDisponibles[0] || '/dashboard'
        }
      }

      dispatch(loginSuccess(fullUserData))
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
    isAuthenticated,
    logout,
    clearAuthSession,
    loginSuccess: (userData: UserData) => dispatch(loginSuccess(userData)),
    handleLoginSubmit,
  }
}

export default useAuth
