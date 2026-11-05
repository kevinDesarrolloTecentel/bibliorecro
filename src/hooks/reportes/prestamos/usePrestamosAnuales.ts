import { useState, useCallback } from 'react'
import Swal from 'sweetalert2'
import { Anio } from '@/Service/rco/Prestamos'
import { STORAGE_BASE_URL, descargarArchivo } from '@/utils/imageUtils'
import { usePermissions } from '@/context/PermissionsContext'

export { STORAGE_BASE_URL, descargarArchivo }

import { PrestamoReporteItem } from '@/models/reportes/prestamos'

export type { PrestamoReporteItem }

export const useReportePrestamosAnuales = () => {
  const { canDoAction, verificarAccionEnServidor } = usePermissions()
  const canGenerarPrestamosAnuales = canDoAction('btn_generar_prestamos_anuales')
  const canDescargarPrestamosAnuales = canDoAction('btn_descargar_prestamos_anuales')

  const [fechaAno, setFechaAno] = useState<string>('')
  const [prestamos, setPrestamos] = useState<PrestamoReporteItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [excelLink, setExcelLink] = useState<string | null>(null)
  const [haBuscado, setHaBuscado] = useState<boolean>(false)

  const handleGetAnual = useCallback(async () => {
    if (!canGenerarPrestamosAnuales) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para generar este reporte.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    if (!fechaAno) {
      Swal.fire({
        icon: 'warning',
        title: 'Campo requerido',
        text: 'Por favor, seleccione un año.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    setIsLoading(true)

    const tienePermiso = await verificarAccionEnServidor('btn_generar_prestamos_anuales')
    if (!tienePermiso) {
      setIsLoading(false)
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para generar este reporte.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    setHaBuscado(true)
    setPrestamos([])
    setExcelLink(null)

    try {
      const params = {
        fechaMes: fechaAno,
        fechaAno,
        anio: fechaAno,
        year: fechaAno,
      }
      const data = await Anio(params)
      const rawList = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
      const filtrados = rawList.filter(
        (p: PrestamoReporteItem) => p.ESTADOINSCRIPCION_PERSONA !== 1,
      )

      setPrestamos(filtrados)
      setExcelLink(data?.excel_path || null)

      if (filtrados.length === 0) {
        Swal.fire({
          icon: 'info',
          title: 'Sin préstamos encontrados',
          text: `No se encontraron préstamos para el año ${fechaAno}.`,
          confirmButtonColor: '#044c8c',
          confirmButtonText: 'Entendido',
        })
      }
    } catch (error: any) {
      console.error('Error al obtener préstamos anuales', error)
      setPrestamos([])
      setExcelLink(null)
      const respData = error?.response?.data
      const errStr = typeof respData === 'string' ? respData : JSON.stringify(respData || '')
      const errorMsg = error?.response?.data?.message || error?.message || ''
      const isNotFound =
        error?.response?.status === 404 ||
        (error?.response?.status === 500 && (errStr.includes('toArray() on null') || errStr.includes('PersonasExport'))) ||
        errorMsg.toLowerCase().includes('no existe') ||
        errorMsg.toLowerCase().includes('no se encontr') ||
        errorMsg.toLowerCase().includes('sin registros') ||
        errStr.toLowerCase().includes('no existe') ||
        errStr.toLowerCase().includes('no se encontr')

      if (isNotFound) {
        Swal.fire({
          icon: 'info',
          title: 'Sin préstamos encontrados',
          text:  `No se encontraron préstamos para el año ${fechaAno}.`,
          confirmButtonColor: '#044c8c',
          confirmButtonText: 'Entendido',
        })
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error al consultar',
          text: 'Hubo un problema al obtener los préstamos anuales. Por favor, inténtelo de nuevo más tarde.',
          confirmButtonColor: '#dc3545',
          confirmButtonText: 'Entendido',
        })
      }
    } finally {
      setIsLoading(false)
    }
  }, [canGenerarPrestamosAnuales, fechaAno, verificarAccionEnServidor])

  const handleDescargarExcel = useCallback(async () => {
    if (!canDescargarPrestamosAnuales) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para descargar este reporte.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    const tienePermiso = await verificarAccionEnServidor('btn_descargar_prestamos_anuales')
    if (!tienePermiso) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para descargar este reporte.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    if (excelLink) {
      await descargarArchivo(`${STORAGE_BASE_URL}/${excelLink}`)
    }
  }, [canDescargarPrestamosAnuales, excelLink, verificarAccionEnServidor])

  const handleReset = useCallback(() => {
    setFechaAno('')
    setPrestamos([])
    setExcelLink(null)
    setHaBuscado(false)
  }, [])

  return {
    fechaAno,
    setFechaAno,
    prestamos,
    isLoading,
    excelLink,
    haBuscado,
    handleGetAnual,
    handleDescargarExcel,
    handleReset,
    canGenerarPrestamosAnuales,
    canDescargarPrestamosAnuales,
    verificarAccionEnServidor,
  }
}

export default useReportePrestamosAnuales
