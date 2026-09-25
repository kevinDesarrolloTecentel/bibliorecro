import NotFoundPage from '@/components/ui/page-not-found'

const Page403 = () => {
  return (
    <NotFoundPage
      statusCode="403"
      title="Acceso Denegado"
      description="No dispones de los permisos o el rol requerido para visualizar este recurso."
    />
  )
}

export default Page403
