import { useState, useCallback } from 'react'
import Swal from 'sweetalert2'
import { Pendientes } from '@/Service/rco/Prestamos'
import { STORAGE_BASE_URL, descargarArchivo } from '@/utils/imageUtils'
import { usePermissions } from '@/context/PermissionsContext'

export { STORAGE_BASE_URL, descargarArchivo }

import { PrestamoReporteItem } from '@/models/reportes/prestamos'

export type { PrestamoReporteItem }

export const useReportePendientesDevolver = () => {
  const { canDoAction, verificarAccionEnServidor } = usePermissions()
  const canGenerarLibrosPendientes = canDoAction('btn_generar_libros_pendientes')
  const canDescargarLibrosPendientes = canDoAction('btn_descargar_libros_pendientes')

  const [fechaDesde, setFechaDesde] = useState<string>('')
  const [fechaHasta, setFechaHasta] = useState<string>('')
  const [prestamos, setPrestamos] = useState<PrestamoReporteItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [excelLink, setExcelLink] = useState<string | null>(null)
  const [haBuscado, setHaBuscado] = useState<boolean>(false)

  const handleGetPendientes = useCallback(async () => {
    if (!canGenerarLibrosPendientes) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para generar este reporte.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    if (!fechaDesde || !fechaHasta) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos requeridos',
        text: 'Por favor, ingrese el rango de fechas completo.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    if (fechaDesde > fechaHasta) {
      Swal.fire({
        icon: 'warning',
        title: 'Rango de fechas inválido',
        text: 'La fecha "Desde" no puede ser mayor que la fecha "Hasta".',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    setIsLoading(true)

    const tienePermiso = await verificarAccionEnServidor('btn_generar_libros_pendientes')
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
        fecha_desde: fechaDesde,
        fecha_hasta: fechaHasta,
      }
      const data = await Pendientes(params)
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
          text: 'No se encontraron libros pendientes por devolver en el rango de fechas seleccionado.',
          confirmButtonColor: '#044c8c',
          confirmButtonText: 'Entendido',
        })
      }
    } catch (error: any) {
      console.error('Error al obtener préstamos pendientes', error)
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
          title: 'Sin registros encontrados',
          text:  'No se encontraron libros pendientes por devolver en el rango de fechas seleccionado.',
          confirmButtonColor: '#044c8c',
          confirmButtonText: 'Entendido',
        })
        return
      }

      Swal.fire({
        icon: 'error',
        title: 'Error al consultar',
        text: 'Hubo un problema al obtener los libros pendientes por devolver. Por favor, inténtelo de nuevo más tarde.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
    } finally {
      setIsLoading(false)
    }
  }, [canGenerarLibrosPendientes, fechaDesde, fechaHasta])

  const handleDescargarExcel = useCallback(async () => {
    if (!canDescargarLibrosPendientes) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para descargar este reporte.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    const tienePermiso = await verificarAccionEnServidor('btn_descargar_libros_pendientes')
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
  }, [canDescargarLibrosPendientes, excelLink, verificarAccionEnServidor])

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
    handleGetPendientes,
    handleDescargarExcel,
    handleReset,
    canGenerarLibrosPendientes,
    canDescargarLibrosPendientes,
    verificarAccionEnServidor,
  }
}

export default useReportePendientesDevolver
