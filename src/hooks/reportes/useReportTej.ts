import { useState, useCallback } from 'react'
import axios from 'axios'
import Swal from 'sweetalert2'

export interface LibroTejueloItem {
  ID_LIBROS?: number | string
  CODIGO_CATEGORIA?: string
  codigo_categoria?: string
  AUTORTEJUELO_LIBROS?: string
  autortejuelo_libros?: string
  TITULOTEJUELO_LIBROS?: string
  titulotejuelo_libros?: string
  [key: string]: any
}

export interface UseReportTejReturn {
  startDate: string
  setStartDate: (val: string) => void
  endDate: string
  setEndDate: (val: string) => void
  pdfPath: string | null
  setPdfPath: (val: string | null) => void
  libros: LibroTejueloItem[]
  setLibros: (val: LibroTejueloItem[]) => void
  isLoading: boolean
  activeTab: 'etiquetas' | 'tabla' | 'pdf'
  setActiveTab: (tab: 'etiquetas' | 'tabla' | 'pdf') => void
  handleGeneratePdf: () => Promise<void>
  handleReset: () => void
  handleDescargarPdf: () => void
  handleImprimir: () => void
}

const API_PDF_URL = 'https://bibliobackend.ccelrecreo.com:1500/server.php/api/pdf'
const STORAGE_BASE_URL = 'https://bibliobackend.ccelrecreo.com:1500/storage/app/public'

export const useReportTej = (): UseReportTejReturn => {
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
    if (!startDate || !endDate) {
      Swal.mixin({
        toast: true,
        position: 'top-end',
        timer: 2500,
        timerProgressBar: false,
        showConfirmButton: false,
      }).fire({
        icon: 'warning',
        title: 'Por favor seleccione las fechas Desde y Hasta',
      })
      return
    }

    if (endDate < startDate) {
      Swal.mixin({
        toast: true,
        position: 'top-end',
        timer: 2500,
        timerProgressBar: false,
        showConfirmButton: false,
      }).fire({
        icon: 'warning',
        title: 'La fecha de finalización no debe ser menor a la fecha de inicio',
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await axios.get(API_PDF_URL, {
        params: {
          fechaDesde: startDate,
          fechaHasta: endDate,
          fechafinal: endDate,
        },
      })

      if (!response.data || !response.data.pdf_path) {
        throw new Error('No se encontró el archivo PDF en el reporte del Tejuelo')
      }

      const rawPdfPath = response.data.pdf_path
      const fullPdfUrl = rawPdfPath.startsWith('http')
        ? rawPdfPath
        : `${STORAGE_BASE_URL}/${rawPdfPath.replace(/^\/+/, '')}`

      const librosData: LibroTejueloItem[] = Array.isArray(response.data.libros)
        ? response.data.libros
        : []

      setLibros(librosData)
      setPdfPath(fullPdfUrl)

      Swal.mixin({
        toast: true,
        position: 'top-end',
        timer: 2500,
        timerProgressBar: false,
        showConfirmButton: false,
      }).fire({
        icon: 'success',
        title: `Se obtuvieron ${librosData.length} tejuelos con éxito`,
      })
    } catch (error: any) {
      console.error(error)
      const errorMsg =
        error?.response?.data?.message ||
        error?.message ||
        'Ocurrió un error al procesar la solicitud de tejuelos.'
      Swal.mixin({
        toast: true,
        position:'top-end',
        timer:2500,
        timerProgressBar:false,
        showConfirmButton:false
      }).fire({
        icon: 'error',
        title: errorMsg,
      })
    } finally {
      setIsLoading(false)
    }
  }, [startDate, endDate])

  const handleDescargarPdf = useCallback(() => {
    if (pdfPath) {
      window.open(pdfPath, '_blank')
    }
  }, [pdfPath])

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
  }
}

export default useReportTej
