import { useState, useCallback } from 'react'
import Swal from 'sweetalert2'
import { Pendientes } from '@/Service/rco/Prestamos'
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

export const useReportePendientesDevolver = () => {
  const [fechaDesde, setFechaDesde] = useState<string>('')
  const [fechaHasta, setFechaHasta] = useState<string>('')
  const [prestamos, setPrestamos] = useState<PrestamoReporteItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [excelLink, setExcelLink] = useState<string | null>(null)

  const handleGetPendientes = useCallback(async () => {
    if (!fechaDesde || !fechaHasta) {
      Swal.mixin({
        toast: true,
        position: 'top-end',
        timer: 2500,
        timerProgressBar: false,
        showConfirmButton: false,
      }).fire({
        icon: 'error',
        title: 'Por favor, ingrese todos los valores requeridos.',
      })
      return
    }

    setIsLoading(true)
    try {
      const params = {
        fecha_desde: fechaDesde,
        fecha_hasta: fechaHasta,
        fechaDesde,
        fechaHasta,
      }
      const data = await Pendientes(params)
      const rawList = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
      const filtrados = rawList.filter(
        (p: PrestamoReporteItem) => p.ESTADOINSCRIPCION_PERSONA !== 1,
      )

      setPrestamos(filtrados)
      setExcelLink(data?.excel_path || null)
    } catch (error: any) {
      if (error?.response?.status === 404) {
        setPrestamos([])
        setExcelLink(null)
        Swal.mixin({
          toast: true,
          position: 'top-end',
          timer: 3000,
          timerProgressBar: false,
          showConfirmButton: false,
        }).fire({
          icon: 'info',
          title: error.response.data?.message || 'No se encontraron préstamos pendientes en el rango seleccionado.',
        })
        return
      }
      console.error('Error al obtener préstamos pendientes', error)
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Hubo un problema al obtener los libros pendientes por devolver.',
      })
    } finally {
      setIsLoading(false)
    }
  }, [fechaDesde, fechaHasta])

  const handleDescargarExcel = useCallback(() => {
    if (excelLink) {
      window.open(`${STORAGE_BASE_URL}/${excelLink}`, '_blank')
    }
  }, [excelLink])

  const handleReset = useCallback(() => {
    setFechaDesde('')
    setFechaHasta('')
    setPrestamos([])
    setExcelLink(null)
  }, [])

  return {
    fechaDesde,
    setFechaDesde,
    fechaHasta,
    setFechaHasta,
    prestamos,
    isLoading,
    excelLink,
    handleGetPendientes,
    handleDescargarExcel,
    handleReset,
  }
}

export default useReportePendientesDevolver
