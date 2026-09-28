import { useState, useCallback } from 'react'
import Swal from 'sweetalert2'
import { PersonasHistorialLibrosReport } from '@/Service/tab/Persona'
import { STORAGE_BASE_URL } from '@/.env'

export { STORAGE_BASE_URL }

export interface PrestamoReporteItem {
  ID_PRESTAMO?: number | string
  NOMBRE_PERSONA?: string
  APELLIDO_PERSONA?: string
  ISBN_LIBROS?: string
  TITULO_LIBROS?: string
  NOMBRE_AUTOR?: string
  PRECIO_LIBROS?: number | string
  ESTADOINSCRIPCION_PERSONA?: number
  [key: string]: any
}

export const useReporteHistorialLibrosUsuario = () => {
  const [cedula, setCedula] = useState<string>('')
  const [libros, setLibros] = useState<PrestamoReporteItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [excelLink, setExcelLink] = useState<string | null>(null)

  const handleGetPrestamos = useCallback(async () => {
    if (!cedula) {
      Swal.mixin({
        toast: true,
        position: 'top-end',
        timer: 2500,
        timerProgressBar: false,
        showConfirmButton: false,
      }).fire({
        icon: 'error',
        title: 'Por favor, ingrese la cédula.',
      })
      return
    }

    setIsLoading(true)
    try {
      const params = { cedula }
      const data = await PersonasHistorialLibrosReport(params)
      const rawList = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
      const librosFiltrados = rawList
        .filter((item: PrestamoReporteItem) => item.ESTADOINSCRIPCION_PERSONA !== 1)
        .sort(
          (a: PrestamoReporteItem, b: PrestamoReporteItem) =>
            Number(a.ID_PRESTAMO || 0) - Number(b.ID_PRESTAMO || 0),
        )

      setLibros(librosFiltrados)
      setExcelLink(data?.excel_path || null)
    } catch (error) {
      console.error('Error al obtener historial de libros', error)
      Swal.mixin({
        toast: true,
        position: 'top-end',
        timer: 2500,
        timerProgressBar: false,
        showConfirmButton: false,
      }).fire({
        icon: 'warning',
        title: 'Hubo un problema al obtener los préstamos. Por favor, inténtelo de nuevo más tarde.',
      })
    } finally {
      setIsLoading(false)
    }
  }, [cedula])

  const handleDescargarExcel = useCallback(() => {
    if (excelLink) {
      window.open(`${STORAGE_BASE_URL}/${excelLink}`, '_blank')
    }
  }, [excelLink])

  const handleReset = useCallback(() => {
    setCedula('')
    setLibros([])
    setExcelLink(null)
  }, [])

  return {
    cedula,
    setCedula,
    libros,
    isLoading,
    excelLink,
    handleGetPrestamos,
    handleDescargarExcel,
    handleReset,
  }
}

export const useReporteHistorialLibros = useReporteHistorialLibrosUsuario
export default useReporteHistorialLibrosUsuario
