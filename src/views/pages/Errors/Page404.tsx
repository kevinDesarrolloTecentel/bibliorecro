import React from 'react'
import ErrorLayout from '@/components/ui/ErrorLayout'
import { cilWarning } from '@coreui/icons'

const Page404: React.FC = () => {
  return (
    <ErrorLayout
      statusCode="404"
      title="Página no Encontrada"
      description="La página o ruta que estás buscando no existe o fue movida a otra ubicación."
      icon={cilWarning}
      iconColor="#D97706"
      iconBgColor="rgba(217, 119, 6, 0.1)"
    />
  )
}

export default Page404
