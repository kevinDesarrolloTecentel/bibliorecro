import NotFoundPage from '@/components/ui/page-not-found'

const Page405 = () => {
  return (
    <NotFoundPage
      statusCode="405"
      title="Método No Permitido"
      description="El método de solicitud utilizado no está permitido para el tipo de usuario."
    />
  )
}

export default Page405
