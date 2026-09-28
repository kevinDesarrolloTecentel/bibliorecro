import { useEffect } from 'react'
import { clearAuthSession } from '@/utils/auth'
import { AuthFormSplitScreen } from '@/components/ui/login'
import useAuth from '@/hooks/useAuth'


const Login = () => {
  const userState = useAuth()

  useEffect(() => {
    const hashParts = window.location.hash.split('?')
    const searchParams = new URLSearchParams(hashParts[1] || window.location.search)
    if (searchParams.get('session_expired') === 'true') {
      clearAuthSession()
      if (window.location.hash.includes('session_expired')) {
        window.history.replaceState(null, '', '#/login')
      }
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
