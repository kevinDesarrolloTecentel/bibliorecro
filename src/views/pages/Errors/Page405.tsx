import React from 'react'
import ErrorLayout from '@/components/ui/ErrorLayout'
import { cilBan } from '@coreui/icons'

const Page405: React.FC = () => {
  return (
    <ErrorLayout
      statusCode="405"
      title="Método No Permitido"
      description="El método de solicitud utilizado no está permitido para este tipo de usuario o acción."
      icon={cilBan}
      iconColor="#6c757d"
      iconBgColor="rgba(108, 117, 125, 0.1)"
    />
  )
}

export default Page405
