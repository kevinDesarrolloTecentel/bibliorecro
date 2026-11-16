import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import Swal from 'sweetalert2'
import { AuthFormSplitScreen } from '@/components/ui/login'
import { useAuth } from '@/hooks/auth/useAuth'
import busImg from '@/assets/images/bus-1.jpg'
import logoImg from '@/assets/images/logo-recreo.png'

const Login = () => {
  const { handleLoginSubmit, clearAuthSession } = useAuth()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const isInactive =
      searchParams.get('user_inactive') === 'true' ||
      window.location.hash.includes('user_inactive')

    const isExpired =
      searchParams.get('session_expired') === 'true' ||
      window.location.hash.includes('session_expired')

    if (window.location.hash.includes('user_inactive') || window.location.hash.includes('session_expired')) {
      window.history.replaceState(null, '', '#/login')
    }

    if (isInactive) {
      Swal.fire({
        icon: 'error',
        title: 'Usuario inactivo',
        text: 'Tu usuario se encuentra inactivo.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
    } else if (isExpired) {
      Swal.fire({
        icon: 'warning',
        title: 'Sesión expirada',
        text: 'Tu sesión ha expirado por inactividad. Por favor inicia sesión nuevamente.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
    }

    clearAuthSession()
  }, [])

  return (
    <AuthFormSplitScreen
      logo={
        <div className="flex items-center justify-center">
          <img
            src={logoImg}
            alt="BiblioRecreo Logo"
            className="h-14 sm:h-16 md:h-18 lg:h-20 w-auto object-contain drop-shadow-sm"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = '/logo-recreo.png'
            }}
          />
        </div>
      }
      title="Iniciar Sesión"
      description=""
      imageSrc={busImg}
      imageAlt="BiblioRecreo Bus"
      onSubmit={handleLoginSubmit}
    />
  )
}

export default Login
