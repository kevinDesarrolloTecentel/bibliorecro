import React from 'react'
import ErrorLayout from '@/components/ui/ErrorLayout'
import { cilWarning } from '@coreui/icons'

const Page500: React.FC = () => {
  return (
    <ErrorLayout
      statusCode="500"
      title="Error del Servidor"
      description="Ocurrió un problema interno en el servidor. Por favor intenta de nuevo más tarde o contacta a soporte técnico."
      icon={cilWarning}
      iconColor="#dc3545"
      iconBgColor="rgba(220, 53, 69, 0.1)"
    />
  )
}

export default Page500
