import NotFoundPage from '@/components/ui/page-not-found'

const Page500 = () => {
  return (
    <NotFoundPage
      statusCode="500"
      title="Error del Servidor"
      description="Ocurrió un problema interno en el servidor. Por favor intenta de nuevo más tarde."
    />
  )
}

export default Page500
