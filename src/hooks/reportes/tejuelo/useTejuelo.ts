import { useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Swal from 'sweetalert2'
import { RootState, AppDispatch } from '@/store'
import { librosPDF } from '@/Service/rco/Libros'
import { STORAGE_BASE_URL } from '@/utils/imageUtils'
import { usePermissions } from '@/hooks/auth/usePermissions'
import {
  setReporteActivo,
  limpiarReporte,
  LibroTejueloItem,
  UseReportTejReturn,
} from '@/slices/reporteSlice'

export { STORAGE_BASE_URL }
export type { LibroTejueloItem, UseReportTejReturn }

export const useReportTej = (): UseReportTejReturn => {
  const dispatch = useDispatch<AppDispatch>()
  const reporteState = useSelector((state: RootState) => state.reportes)

  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [pdfPath, setPdfPath] = useState<string | null>(null)
  const [totalTejuelos, setTotalTejuelos] = useState<number>(0)
  const [totalPaginas, setTotalPaginas] = useState<number>(0)
  const [haBuscado, setHaBuscado] = useState<boolean>(false)
  const [libros, setLibros] = useState<LibroTejueloItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<'etiquetas' | 'tabla' | 'pdf'>('etiquetas')

  const { canDoAction, verificarAccionEnServidor } = usePermissions()
  const canGenerarReporteTejuelos = canDoAction('btn_generar_reporte_tejuelos')
  const canDescargarPdfTejuelos = canDoAction('btn_descargar_pdf_tejuelos')

  const handleReset = useCallback(() => {
    setStartDate('')
    setEndDate('')
    setLibros([])
    setPdfPath(null)
    setTotalTejuelos(0)
    setTotalPaginas(0)
    setHaBuscado(false)
    setActiveTab('etiquetas')
    dispatch(limpiarReporte())
  }, [dispatch])

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
    dispatch(limpiarReporte())

    try {
      const response = await librosPDF({
        fechaDesde: startDate,
        fechaHasta: endDate,
      })

      const data = response?.data || response

      const rutaPdf: string | null =
        data?.pdf?.nombre || data?.pdf_path || data?.pdf?.ruta || null

      const rawLibros: any[] = Array.isArray(data.libros) ? data.libros : []
      const librosData: LibroTejueloItem[] = rawLibros.map((item: any) => ({
        ...item,
        ID_LIBROS: item.ID_LIBROS,
        TITULO_LIBROS: item.TITULO_LIBROS,
        CODIGODEBARRAS_LIBROS: item.CODIGODEBARRAS_LIBROS,
        TITULOTEJUELO_LIBROS: item.TITULOTEJUELO_LIBROS,
        AUTORTEJUELO_LIBROS: item.AUTORTEJUELO_LIBROS,
        ISBN_LIBROS: item.ISBN_LIBROS,
        NOMBRE_AUTOR: item.NOMBRE_AUTOR,
        NOMBRE_CATEGORIA: item.NOMBRE_CATEGORIA,
        CODIGO_CATEGORIA:
          item.CODIGO_CATEGORIA ||
          item.codigo_categoria ||
          item.CODIGO_LIBRO ||
          item.codigo,
      }))

      const totalCount = Number(data?.total ?? librosData.length ?? 0)
      const totalPags = Number(data?.total_paginas ?? 0)

      setLibros(librosData)
      setPdfPath(rutaPdf)
      setTotalTejuelos(totalCount)
      setTotalPaginas(totalPags)
      setHaBuscado(true)

      dispatch(
        setReporteActivo({
          tipoReporte: 'tejuelos',
          archivoDescarga: rutaPdf,
          total: totalCount,
          filtros: { startDate, endDate },
        }),
      )

      if (!rutaPdf || (data?.total === 0 && librosData.length === 0)) {
        Swal.fire({
          icon: 'info',
          title: 'Sin tejuelos encontrados',
          text: 'No se encontraron tejuelos registrados en el rango de fechas seleccionado.',
          confirmButtonColor: '#044c8c',
          confirmButtonText: 'Entendido',
        })
      } else {
        Swal.fire({
          icon: 'success',
          title: 'PDF de tejuelos generado',
          text: `Se generó el PDF correctamente con ${totalCount} tejuelos.`,
          confirmButtonColor: '#044c8c',
          confirmButtonText: 'Aceptar',
        })
      }
    } catch (error: any) {
      console.error('Error al generar PDF de tejuelos:', error)
      setLibros([])
      setPdfPath(null)
      setTotalTejuelos(0)
      setTotalPaginas(0)
      setHaBuscado(true)
      dispatch(limpiarReporte())
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
          text: 'No se encontraron tejuelos registrados en el rango de fechas seleccionado.',
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
  }, [canGenerarReporteTejuelos, startDate, endDate, verificarAccionEnServidor, dispatch])

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

    const downloadLink = pdfPath || reporteState.archivoDescarga
    if (downloadLink) {
      const ruta = downloadLink.startsWith('http')
        ? downloadLink
        : downloadLink.startsWith('/tejuelos/')
          ? `${STORAGE_BASE_URL}/${downloadLink}`
          : `${STORAGE_BASE_URL}/tejuelos/${downloadLink}`
      window.open(ruta, '_blank')
    }
  }, [canDescargarPdfTejuelos, pdfPath, reporteState.archivoDescarga, verificarAccionEnServidor])

  const handleImprimir = useCallback(() => {
    window.print()
  }, [])

  return {
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    pdfPath,
    totalTejuelos,
    totalPaginas,
    haBuscado,
    libros,
    isLoading,
    activeTab,
    setActiveTab,
    handleGeneratePdf,
    handleReset,
    handleDescargarPdf,
    handleDownloadPdf: handleDescargarPdf,
    handlePrint: handleImprimir,
    canGenerarReporteTejuelos,
    canDescargarPdfTejuelos,
  }
}

export default useReportTej
