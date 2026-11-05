import { useState, useCallback } from 'react'
import Swal from 'sweetalert2'
import { librosPDF } from '@/Service/rco/Libros'
import { STORAGE_BASE_URL } from '@/utils/imageUtils'
import { usePermissions } from '@/context/PermissionsContext'

export { STORAGE_BASE_URL }

import { LibroTejueloItem, UseReportTejReturn } from '@/models/reportes/tejuelo'

export type { LibroTejueloItem, UseReportTejReturn }

export const useReportTej = (): UseReportTejReturn => {
  const { canDoAction, verificarAccionEnServidor } = usePermissions()
  const canGenerarReporteTejuelos = canDoAction('btn_generar_reporte_tejuelos')
  const canDescargarPdfTejuelos = canDoAction('btn_descargar_pdf_tejuelos')

  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [pdfPath, setPdfPath] = useState<string | null>(null)
  const [libros, setLibros] = useState<LibroTejueloItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<'etiquetas' | 'tabla' | 'pdf'>('etiquetas')

  const handleReset = useCallback(() => {
    setStartDate('')
    setEndDate('')
    setLibros([])
    setPdfPath(null)
    setActiveTab('etiquetas')
  }, [])

  const handleGeneratePdf = useCallback(async () => {
    if (!canGenerarReporteTejuelos) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para generar este reporte.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    if (!startDate || !endDate) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos requeridos',
        text: 'Por favor, seleccione las fechas Desde y Hasta.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    if (endDate < startDate) {
      Swal.fire({
        icon: 'warning',
        title: 'Rango de fechas inválido',
        text: 'La fecha "Hasta" no puede ser menor a la fecha "Desde".',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    setIsLoading(true)

    const tienePermiso = await verificarAccionEnServidor('btn_generar_reporte_tejuelos')
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

    setLibros([])
    setPdfPath(null)

    try {
      const response = await librosPDF({
        fechaDesde: startDate,
        fechaHasta: endDate,
      })

      const data = response?.data || response

      if (!data || !data.pdf_path) {
        throw new Error('No se encontró el archivo PDF en el reporte del Tejuelo')
      }

      const rawPdfPath = data.pdf_path
      const fullPdfUrl = rawPdfPath.startsWith('http')
        ? rawPdfPath
        : `${STORAGE_BASE_URL}/${rawPdfPath.replace(/^\/+/, '')}`

      const librosData: LibroTejueloItem[] = Array.isArray(data.libros)
        ? data.libros
        : []

      setLibros(librosData)
      setPdfPath(fullPdfUrl)

      if (librosData.length === 0) {
        Swal.fire({
          icon: 'info',
          title: 'Sin tejuelos encontrados',
          text: 'No se encontraron tejuelos registrados en el rango de fechas seleccionado.',
          confirmButtonColor: '#044c8c',
          confirmButtonText: 'Entendido',
        })
      }
    } catch (error: any) {
      console.error(error)
      setLibros([])
      setPdfPath(null)
      const respData = error?.response?.data
      const errStr = typeof respData === 'string' ? respData : JSON.stringify(respData || '')
      const errorMsg =
        error?.response?.data?.message ||
        error?.message ||
        'Ocurrió un error al procesar la solicitud de tejuelos.'
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
          title: 'Sin tejuelos encontrados',
          text:  'No se encontraron tejuelos registrados en el rango de fechas seleccionado.',
          confirmButtonColor: '#044c8c',
          confirmButtonText: 'Entendido',
        })
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error al consultar',
          text: errorMsg,
          confirmButtonColor: '#dc3545',
          confirmButtonText: 'Entendido',
        })
      }
    } finally {
      setIsLoading(false)
    }
  }, [canGenerarReporteTejuelos, startDate, endDate, verificarAccionEnServidor])

  const handleDescargarPdf = useCallback(async () => {
    if (!canDescargarPdfTejuelos) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para descargar este reporte.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    const tienePermiso = await verificarAccionEnServidor('btn_descargar_pdf_tejuelos')
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

    if (pdfPath) {
      window.open(pdfPath, '_blank')
    }
  }, [canDescargarPdfTejuelos, pdfPath, verificarAccionEnServidor])

  const handleImprimir = useCallback(() => {
    window.print()
  }, [])

  return {
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    pdfPath,
    setPdfPath,
    libros,
    setLibros,
    isLoading,
    activeTab,
    setActiveTab,
    handleGeneratePdf,
    handleReset,
    handleDescargarPdf,
    handleImprimir,
    canGenerarReporteTejuelos,
    canDescargarPdfTejuelos,
    verificarAccionEnServidor,
  }
}

export default useReportTej
