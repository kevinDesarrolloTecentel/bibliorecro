
// Descargar el archivo Excel para que funcione en todos los navegadores sin bloqueo de CORS
export const descargarArchivo = async (
  url: string,
  _nombreArchivoDefault?: string,
): Promise<void> => {

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
  setTimeout(() => {
    try {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe)
      }
    } catch { }
  }, 20000)
}

export default descargarArchivo