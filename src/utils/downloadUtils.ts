/**
 * Descarga un archivo directamente a la computadora del usuario usando un iframe oculto.
 * 
 * Ventajas:
 * 1. Cero errores de CORS: A diferencia de fetch(), el navegador no bloquea descargas de archivos estáticos en iframes por políticas de origen cruzado.
 * 2. Previene la redirección de Microsoft Edge: Edge solo intercepta navegaciones de pestañas principales (_blank) para enviarlas a Office Online. En un iframe, el visor de Office no interviene y Edge descarga el archivo .xlsx directamente a la carpeta de Descargas.
 * 3. No abre pestañas en blanco ni interrumpe la navegación del usuario en la SPA.
 */
export const descargarArchivo = async (
  url: string,
  _nombreArchivoDefault?: string,
): Promise<void> => {
  if (!url || typeof window === 'undefined') return

  const fullUrl = url.startsWith('http')
    ? url
    : `${window.location.origin}/${url.replace(/^\/+/, '')}`

  const iframe = document.createElement('iframe')
  iframe.style.position = 'fixed'
  iframe.style.top = '-9999px'
  iframe.style.left = '-9999px'
  iframe.style.width = '1px'
  iframe.style.height = '1px'
  iframe.style.opacity = '0'
  iframe.style.border = 'none'
  iframe.src = fullUrl

  document.body.appendChild(iframe)

  // Limpiar el elemento del DOM tras dar tiempo suficiente al navegador para iniciar la descarga
  setTimeout(() => {
    try {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe)
      }
    } catch { }
  }, 20000)
}

export default descargarArchivo
