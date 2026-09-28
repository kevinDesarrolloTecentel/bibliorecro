import { useState, useCallback } from 'react'
import Swal from 'sweetalert2'
import { Mes } from '@/Service/rco/Prestamos'
import { STORAGE_BASE_URL } from '@/.env'

export { STORAGE_BASE_URL }

export interface PrestamoReporteItem {
  ID_PERSONA?: number | string
  ID_PRESTAMO?: number | string
  TITULO_LIBROS?: string
  FECHAFIN_PRESTAMO?: string
  IDENTIFICACION_PERSONA?: string
  NOMBRE_PERSONA?: string
  APELLIDO_PERSONA?: string
  CORREO_PERSONA?: string
  CELULAR_PERSONA?: string
  TELEFONO_PERSONA?: string
  DETALLE_PERSONA?: string
  EDAD_PERSONA?: number
  ESTADOINSCRIPCION_PERSONA?: number
  [key: string]: any
}

export const useReportePrestamosMensuales = () => {
  const [fechaMes, setFechaMes] = useState<string>('')
  const [prestamos, setPrestamos] = useState<PrestamoReporteItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [excelLink, setExcelLink] = useState<string | null>(null)

  const handleGetMes = useCallback(async () => {
    if (!fechaMes) {
      Swal.mixin({
        toast: true,
        position: 'top-end',
        timer: 2500,
        timerProgressBar: false,
        showConfirmButton: false,
      }).fire({
        icon: 'error',
        title: 'Por favor, ingrese el año y mes requeridos.',
      })
      return
    }

    setIsLoading(true)
    try {
      const params = {
        fechaMes,
        mes: fechaMes,
      }
      const data = await Mes(params)
      const rawList = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
      const filtrados = rawList.filter(
        (p: PrestamoReporteItem) => p.ESTADOINSCRIPCION_PERSONA !== 1,
      )

      setPrestamos(filtrados)
      setExcelLink(data?.excel_path || null)
    } catch (error) {
      console.error('Error al obtener préstamos mensuales', error)
      Swal.mixin({
        toast: true,
        position: 'top-end',
        timer: 2500,
        timerProgressBar: false,
        showConfirmButton: false,
      }).fire({
        icon: 'warning',
        title: 'Hubo un problema al obtener los préstamos mensuales.',
      })
    } finally {
      setIsLoading(false)
    }
  }, [fechaMes])

  const handleDescargarExcel = useCallback(() => {
    if (excelLink) {
      window.open(`${STORAGE_BASE_URL}/${excelLink}`, '_blank')
    }
  }, [excelLink])

  const handleReset = useCallback(() => {
    setFechaMes('')
    setPrestamos([])
    setExcelLink(null)
  }, [])

  return {
    fechaMes,
    setFechaMes,
    prestamos,
    isLoading,
    excelLink,
    handleGetMes,
    handleDescargarExcel,
    handleReset,
  }
}

export default useReportePrestamosMensuales
