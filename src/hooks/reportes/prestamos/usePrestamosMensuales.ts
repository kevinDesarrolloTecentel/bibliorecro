import { useState, useCallback } from 'react'
import Swal from 'sweetalert2'
import { Mes } from '@/Service/rco/Prestamos'
import { STORAGE_BASE_URL, descargarArchivo } from '@/utils/imageUtils'
import { usePermissions } from '@/context/PermissionsContext'

export { STORAGE_BASE_URL, descargarArchivo }

import { PrestamoReporteItem } from '@/models/reportes/prestamos'

export type { PrestamoReporteItem }

export const useReportePrestamosMensuales = () => {
  const { canDoAction, verificarAccionEnServidor } = usePermissions()
  const canGenerarPrestamosMensuales = canDoAction('btn_generar_prestamos_mensuales')
  const canDescargarPrestamosMensuales = canDoAction('btn_descargar_prestamos_mensuales')

  const [fechaMes, setFechaMes] = useState<string>('')
  const [prestamos, setPrestamos] = useState<PrestamoReporteItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [excelLink, setExcelLink] = useState<string | null>(null)
  const [haBuscado, setHaBuscado] = useState<boolean>(false)

  const handleGetMes = useCallback(async () => {
    if (!canGenerarPrestamosMensuales) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para generar este reporte.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    if (!fechaMes) {
      Swal.fire({
        icon: 'warning',
        title: 'Campo requerido',
        text: 'Por favor, seleccione un mes y año.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    setIsLoading(true)

    const tienePermiso = await verificarAccionEnServidor('btn_generar_prestamos_mensuales')
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

    setPrestamos([])
    setExcelLink(null)

    try {
      const params = {
        fechaMes,
      }
      const data = await Mes(params)
      const rawList = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.prestamos)
          ? data.prestamos
          : Array.isArray(data)
            ? data
            : []
      const filtrados = rawList.filter(
        (p: PrestamoReporteItem) => p.ESTADOINSCRIPCION_PERSONA !== 1,
      )

      setPrestamos(filtrados)
      const rutaExcel: string | null = data?.excel?.nombre || data?.excel_path || null
      setExcelLink(rutaExcel)
      setHaBuscado(true)

      if (filtrados.length === 0) {
        Swal.fire({
          icon: 'info',
          title: 'Sin préstamos encontrados',
          text: `No se encontraron préstamos para la fecha seleccionada (${fechaMes}).`,
          confirmButtonColor: '#044c8c',
          confirmButtonText: 'Entendido',
        })
      }
    } catch (error: any) {
      setHaBuscado(true)
      console.error('Error al obtener préstamos mensuales', error)
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
          text: `No se encontraron préstamos para la fecha seleccionada (${fechaMes}).`,
          confirmButtonColor: '#044c8c',
          confirmButtonText: 'Entendido',
        })
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error al consultar',
          text: 'Hubo un problema al obtener los préstamos mensuales. Por favor, inténtelo de nuevo más tarde.',
          confirmButtonColor: '#dc3545',
          confirmButtonText: 'Entendido',
        })
      }
    } finally {
      setIsLoading(false)
    }
  }, [canGenerarPrestamosMensuales, fechaMes, verificarAccionEnServidor])

  const handleDescargarExcel = useCallback(async () => {
    if (!canDescargarPrestamosMensuales) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para descargar este reporte.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    const tienePermiso = await verificarAccionEnServidor('btn_descargar_prestamos_mensuales')
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
      await descargarArchivo(`${STORAGE_BASE_URL}/prestamos/${excelLink}`)
    }
  }, [canDescargarPrestamosMensuales, excelLink, verificarAccionEnServidor])

  const handleReset = useCallback(() => {
    setFechaMes('')
    setPrestamos([])
    setExcelLink(null)
    setHaBuscado(false)
  }, [])

  return {
    fechaMes,
    setFechaMes,
    prestamos,
    isLoading,
    excelLink,
    haBuscado,
    handleGetMes,
    handleDescargarExcel,
    handleReset,
    canGenerarPrestamosMensuales,
    canDescargarPrestamosMensuales,
    verificarAccionEnServidor,
  }
}

export default useReportePrestamosMensuales
