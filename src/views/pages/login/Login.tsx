import { useEffect } from 'react'
import Swal from 'sweetalert2'
import { clearAuthSession } from '@/utils/auth'
import { AuthFormSplitScreen } from '@/components/ui/login'
import useAuth from '@/hooks/useAuth'


const Login = () => {
  const userState = useAuth()

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.hash.split('?')[1] || window.location.search)
    if (searchParams.get('session_expired') === 'true') {
      clearAuthSession()
      Swal.fire({
        title: 'Sesión Expirada',
        text: 'Tu sesión ha vencido. Por favor, ingresa tus credenciales nuevamente.',
        icon: 'warning',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#321fdb',
      })
    }
  }, [])
    return (
    <AuthFormSplitScreen
      logo={
        <div className="flex items-center justify-center">
          <img
            src="https://i.postimg.cc/5tKp3dDJ/svgviewer-png-output.png"
            alt="BiblioRecreo Logo"
            className="h-12 sm:h-14 w-auto object-contain drop-shadow-sm"
          />
        </div>
      }
      title="Iniciar Sesión"
      description=""
      imageSrc="https://i.postimg.cc/VNPwvzST/bus-1.jpg"
      imageAlt="BiblioRecreo Bus"
      onSubmit={userState.handleLoginSubmit}
    />
  )
}

export default Login
