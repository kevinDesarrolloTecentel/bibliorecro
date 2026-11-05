import { useState, useCallback } from 'react'
import Swal from 'sweetalert2'
import { Hoy } from '@/Service/rco/Prestamos'
import { STORAGE_BASE_URL, descargarArchivo } from '@/utils/imageUtils'
import { usePermissions } from '@/context/PermissionsContext'

export { STORAGE_BASE_URL, descargarArchivo }

import { PrestamoReporteItem } from '@/models/reportes/prestamos'

export type { PrestamoReporteItem }

export const useReporteCantidadPrestamosHoy = () => {
  const { canDoAction, verificarAccionEnServidor } = usePermissions()
  const canGenerarCantidadPrestamos = canDoAction('btn_generar_cantidad_prestamos')
  const canDescargarCantidadPrestamos = canDoAction('btn_descargar_cantidad_prestamos')

  const [fechaHoy, setFechaHoy] = useState<string>('')
  const [prestamos, setPrestamos] = useState<PrestamoReporteItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [excelLink, setExcelLink] = useState<string | null>(null)
  const [haBuscado, setHaBuscado] = useState<boolean>(false)

  const handleGetHoy = useCallback(async () => {
    if (!canGenerarCantidadPrestamos) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para generar este reporte.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    if (!fechaHoy) {
      Swal.fire({
        icon: 'warning',
        title: 'Campo requerido',
        text: 'Por favor, seleccione una fecha.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    setIsLoading(true)

    const tienePermiso = await verificarAccionEnServidor('btn_generar_cantidad_prestamos')
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
        fechaHoy,
        fecha: fechaHoy,
      }
      const data = await Hoy(params)
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
          text: `No se encontraron préstamos para la fecha seleccionada (${fechaHoy}).`,
          confirmButtonColor: '#044c8c',
          confirmButtonText: 'Entendido',
        })
      }
    } catch (error: any) {
      console.error('Error al obtener cantidad de préstamos', error)
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
          text:  `No se encontraron préstamos para la fecha seleccionada (${fechaHoy}).`,
          confirmButtonColor: '#044c8c',
          confirmButtonText: 'Entendido',
        })
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error al consultar',
          text: 'Error al obtener los préstamos de la fecha. Por favor, inténtelo de nuevo más tarde.',
          confirmButtonColor: '#dc3545',
          confirmButtonText: 'Entendido',
        })
      }
    } finally {
      setIsLoading(false)
    }
  }, [canGenerarCantidadPrestamos, fechaHoy])

  const handleDescargarExcel = useCallback(async () => {
    if (!canDescargarCantidadPrestamos) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para descargar este reporte.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    const tienePermiso = await verificarAccionEnServidor('btn_descargar_cantidad_prestamos')
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
  }, [canDescargarCantidadPrestamos, excelLink, verificarAccionEnServidor])

  const handleReset = useCallback(() => {
    setFechaHoy('')
    setPrestamos([])
    setExcelLink(null)
    setHaBuscado(false)
  }, [])

  return {
    fechaHoy,
    setFechaHoy,
    prestamos,
    isLoading,
    excelLink,
    haBuscado,
    handleGetHoy,
    handleDescargarExcel,
    handleReset,
    canGenerarCantidadPrestamos,
    canDescargarCantidadPrestamos,
    verificarAccionEnServidor,
  }
}

export default useReporteCantidadPrestamosHoy
