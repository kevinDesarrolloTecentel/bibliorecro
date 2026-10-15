import { useState, useCallback } from 'react'
import Swal from 'sweetalert2'
import { Caducados } from '@/Service/rco/Prestamos'
import { STORAGE_BASE_URL } from '@/utils/imageUtils'

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

export const useReporteNoDevueltosDanados = () => {
  const [fechaDesde, setFechaDesde] = useState<string>('')
  const [fechaHasta, setFechaHasta] = useState<string>('')
  const [prestamos, setPrestamos] = useState<PrestamoReporteItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [excelLink, setExcelLink] = useState<string | null>(null)
  const [haBuscado, setHaBuscado] = useState<boolean>(false)

  const handleGetCaducados = useCallback(async () => {
    if (!fechaDesde || !fechaHasta) {
      Swal.mixin({
        toast: true,
        position: 'top-end',
        timer: 2500,
        timerProgressBar: false,
        showConfirmButton: false,
      }).fire({
        icon: 'warning',
        title: 'Por favor, ingrese el rango de fechas completo.',
      })
      return
    }

    if (fechaDesde > fechaHasta) {
      Swal.mixin({
        toast: true,
        position: 'top-end',
        timer: 2500,
        timerProgressBar: false,
        showConfirmButton: false,
      }).fire({
        icon: 'warning',
        title: 'La fecha "Desde" no puede ser mayor que la fecha "Hasta".',
      })
      return
    }

    setIsLoading(true)
    setHaBuscado(true)
    setPrestamos([])
    setExcelLink(null)

    try {
      const params = {
        fecha_desde: fechaDesde,
        fecha_hasta: fechaHasta,
      }
      const data = await Caducados(params)
      const rawList = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
      const filtrados = rawList.filter(
        (p: PrestamoReporteItem) => p.ESTADOINSCRIPCION_PERSONA !== 1,
      )

      setPrestamos(filtrados)
      setExcelLink(data?.excel_path || null)

      if (filtrados.length === 0) {
        Swal.fire({
          icon: 'info',
          title: 'Sin registros',
          text: 'No se encontraron libros no devueltos o dañados en el rango de fechas seleccionado.',
          confirmButtonColor: '#0d6efd',
        })
      }
    } catch (error: any) {
      console.error('Error al obtener libros no devueltos y dañados', error)
      if (error?.response?.status === 404) {
        setPrestamos([])
        setExcelLink(null)
        Swal.fire({
          icon: 'info',
          title: 'Sin registros',
          text: 'No se encontraron libros no devueltos o dañados en el rango de fechas seleccionado.',
          confirmButtonColor: '#0d6efd',
        })
        return
      }

      Swal.mixin({
        toast: true,
        position: 'top-end',
        timer: 2500,
        timerProgressBar: false,
        showConfirmButton: false,
      }).fire({
        icon: 'error',
        title: 'Hubo un problema al obtener los libros no devueltos o dañados.',
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
    setHaBuscado(false)
  }, [])

  return {
    fechaDesde,
    setFechaDesde,
    fechaHasta,
    setFechaHasta,
    prestamos,
    isLoading,
    excelLink,
    haBuscado,
    handleGetCaducados,
    handleDescargarExcel,
    handleReset,
  }
}

export default useReporteNoDevueltosDanados
