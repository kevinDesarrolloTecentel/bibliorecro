import { useState, useCallback } from 'react'
import Swal from 'sweetalert2'
import { listarLibros } from '@/Service/rco/libros'
import { STORAGE_BASE_URL } from '@/.env'

export { STORAGE_BASE_URL }

export interface LibroInventarioItem {
  ID_LIBROS?: number | string
  ISBN_LIBROS?: string
  TITULO_LIBROS?: string
  CODIGODEBARRAS_LIBROS?: string
  PRECIO_LIBROS?: number | string
  TITULOTEJUELO_LIBROS?: string
  AUTORTEJUELO_LIBROS?: string
  ESTADOINSCRIPCION_PERSONA?: number
  [key: string]: any
}

export const useReporteLibrosSistema = () => {
  const [libros, setLibros] = useState<LibroInventarioItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [excelLink, setExcelLink] = useState<string | null>(null)

  const handleGetLibrosSistema = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await listarLibros()
      const rawItems: LibroInventarioItem[] = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
      const filtrados = rawItems.filter(
        (item) => item.ESTADOINSCRIPCION_PERSONA !== 1,
      )
      const ordenados = filtrados.sort(
        (a, b) => Number(a.ID_LIBROS || 0) - Number(b.ID_LIBROS || 0),
      )

      setLibros(ordenados)
      setExcelLink(data?.excel_path || null)
    } catch (error: any) {
      console.error('Error al obtener libros del sistema:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Hubo un problema al obtener los libros del sistema. Por favor, inténtelo de nuevo más tarde.',
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleDescargarExcel = useCallback(() => {
    if (excelLink) {
      window.open(`${STORAGE_BASE_URL}/${excelLink}`, '_blank')
    }
  }, [excelLink])

  const handleReset = useCallback(() => {
    setLibros([])
    setExcelLink(null)
  }, [])

  return {
    libros,
    isLoading,
    excelLink,
    handleGetLibrosSistema,
    handleDescargarExcel,
    handleReset,
  }
}

export default useReporteLibrosSistema
