import React from 'react'
import ErrorLayout from '@/components/ui/ErrorLayout'
import { cilLockLocked } from '@coreui/icons'

const Page403: React.FC = () => {
  return (
    <ErrorLayout
      statusCode="403"
      title="Acceso Denegado"
      description="No dispones de los permisos o el rol requerido para visualizar este recurso. Si crees que se trata de un error, por favor contacta al administrador del sistema."
      icon={cilLockLocked}
      iconColor="#dc3545"
      iconBgColor="rgba(220, 53, 69, 0.1)"
    />
  )
}

export default Page403
