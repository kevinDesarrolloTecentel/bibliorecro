import { useState, useCallback } from 'react'
import axios from 'axios'
import Swal from 'sweetalert2'

export const API_BASE_URL = 'https://bibliobackend.ccelrecreo.com:1500/server.php/api'
export const STORAGE_BASE_URL = 'https://bibliobackend.ccelrecreo.com:1500/storage/app/public'

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
        toast:true,
        position:'top-end',
        timer:2500,
        timerProgressBar:false,
        showConfirmButton:false
      }).fire({
        icon: 'error',
        title: 'Por favor, ingrese todos los valores requeridos.',
      })
      return
    }

    setIsLoading(true)
    try {
      const endpoint = `${API_BASE_URL}/prestamosPendientes`
      const params = {
        fecha_desde: fechaDesde,
        fecha_hasta: fechaHasta,
      }
      const { data } = await axios.get(endpoint, { params })
      const rawList = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
      const filtrados = rawList.filter(
        (p: PrestamoReporteItem) => p.ESTADOINSCRIPCION_PERSONA !== 1,
      )

      setPrestamos(filtrados)
      setExcelLink(data.excel_path || null)
    } catch (error) {
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

export const useReporteNoDevueltosDanados = () => {
  const [fechaDesde, setFechaDesde] = useState<string>('')
  const [fechaHasta, setFechaHasta] = useState<string>('')
  const [prestamos, setPrestamos] = useState<PrestamoReporteItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [excelLink, setExcelLink] = useState<string | null>(null)

  const handleGetCaducados = useCallback(async () => {
    if (!fechaDesde || !fechaHasta) {
      Swal.mixin({
        toast:true,
        position:'top-end',
        timer:2500,
        timerProgressBar:false,
        showConfirmButton:false
      }).fire({
        icon: 'error',
        title: 'Por favor, ingrese todos los valores requeridos.',
      })
      return
    }

    setIsLoading(true)
    try {
      const endpoint = `${API_BASE_URL}/prestamosCaducados`
      const params = {
        fecha_desde: fechaDesde,
        fecha_hasta: fechaHasta,
      }
      const { data } = await axios.get(endpoint, { params })
      const rawList = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
      const filtrados = rawList.filter(
        (p: PrestamoReporteItem) => p.ESTADOINSCRIPCION_PERSONA !== 1,
      )

      setPrestamos(filtrados)
      setExcelLink(data.excel_path || null)
    } catch (error) {
      console.error('Error al obtener libros no devueltos y dañados', error)
      Swal.mixin({
        toast:true,
        position:'top-end',
        timer:2500,
        timerProgressBar:false,
        showConfirmButton:false
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
  }, [])

  return {
    fechaDesde,
    setFechaDesde,
    fechaHasta,
    setFechaHasta,
    prestamos,
    isLoading,
    excelLink,
    handleGetCaducados,
    handleDescargarExcel,
    handleReset,
  }
}

export const useReporteCantidadPrestamosHoy = () => {
  const [fechaHoy, setFechaHoy] = useState<string>('')
  const [prestamos, setPrestamos] = useState<PrestamoReporteItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [excelLink, setExcelLink] = useState<string | null>(null)

  const handleGetHoy = useCallback(async () => {
    if (!fechaHoy) {
      Swal.mixin({
        toast:true,
        position:'top-end',
        timer:2500,
        timerProgressBar:false,
        showConfirmButton:false
      }).fire({
        icon: 'error',
        title: 'Por favor, ingrese la fecha requerida.',
      })
      return
    }

    setIsLoading(true)
    try {
      const endpoint = `${API_BASE_URL}/prestamoshoy`
      const params = {
        fechaHoy,
      }
      const { data } = await axios.get(endpoint, { params })
      const rawList = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
      const filtrados = rawList.filter(
        (p: PrestamoReporteItem) => p.ESTADOINSCRIPCION_PERSONA !== 1,
      )

      setPrestamos(filtrados)
      setExcelLink(data.excel_path || null)
    } catch (error: any) {
      console.error('Error al obtener cantidad de préstamos', error)
      Swal.mixin({
        toast:true,
        position:'top-end',
        timer:2500,
        timerProgressBar:false,
        showConfirmButton:false
      }).fire({
        icon: 'warning',
        title: 'Error al obtener los préstamos de la fecha.',
      })
    } finally {
      setIsLoading(false)
    }
  }, [fechaHoy])

  const handleDescargarExcel = useCallback(() => {
    if (excelLink) {
      window.open(`${STORAGE_BASE_URL}/${excelLink}`, '_blank')
    }
  }, [excelLink])

  const handleReset = useCallback(() => {
    setFechaHoy('')
    setPrestamos([])
    setExcelLink(null)
  }, [])

  return {
    fechaHoy,
    setFechaHoy,
    prestamos,
    isLoading,
    excelLink,
    handleGetHoy,
    handleDescargarExcel,
    handleReset,
  }
}

export const useReportePrestamosMensuales = () => {
  const [fechaMes, setFechaMes] = useState<string>('')
  const [prestamos, setPrestamos] = useState<PrestamoReporteItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [excelLink, setExcelLink] = useState<string | null>(null)

  const handleGetMes = useCallback(async () => {
    if (!fechaMes) {
      Swal.mixin({
        toast:true,
        position:'top-end',
        timer:2500,
        timerProgressBar:false,
        showConfirmButton:false
      }).fire({
        icon: 'error',
        title: 'Por favor, ingrese el año y mes requeridos.',
      })
      return
    }

    setIsLoading(true)
    try {
      const endpoint = `${API_BASE_URL}/prestamosmes`
      const params = {
        fechaMes,
      }
      const { data } = await axios.get(endpoint, { params })
      const rawList = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
      const filtrados = rawList.filter(
        (p: PrestamoReporteItem) => p.ESTADOINSCRIPCION_PERSONA !== 1,
      )

      setPrestamos(filtrados)
      setExcelLink(data.excel_path || null)
    } catch (error) {
      console.error('Error al obtener préstamos mensuales', error)
      Swal.mixin({
        toast:true,
        position:'top-end',
        timer:2500,
        timerProgressBar:false,
        showConfirmButton:false
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

export const useReportePrestamosAnuales = () => {
  const [fechaAno, setFechaAno] = useState<string>('')
  const [prestamos, setPrestamos] = useState<PrestamoReporteItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [excelLink, setExcelLink] = useState<string | null>(null)

  const handleGetAnual = useCallback(async () => {
    if (!fechaAno) {
      Swal.mixin({
        toast:true,
        position:'top-end',
        timer:2500,
        timerProgressBar:false,
        showConfirmButton:false
      }).fire({
        icon: 'error',
        title: 'Por favor, ingrese el año requerido.',
      })
      return
    }

    setIsLoading(true)
    try {
      const endpoint = `${API_BASE_URL}/prestamosaño`
      const params = {
        fechaMes: fechaAno,
      }
      const { data } = await axios.get(endpoint, { params })
      const rawList = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
      const filtrados = rawList.filter(
        (p: PrestamoReporteItem) => p.ESTADOINSCRIPCION_PERSONA !== 1,
      )

      setPrestamos(filtrados)
      setExcelLink(data.excel_path || null)
    } catch (error) {
      console.error('Error al obtener préstamos anuales', error)
      Swal.mixin({
        toast:true,
        position:'top-end',
        timer:2500,
        timerProgressBar:false,
        showConfirmButton:false
      }).fire({
        icon: 'warning',
        title: 'Hubo un problema al obtener los préstamos anuales.',
      })
    } finally {
      setIsLoading(false)
    }
  }, [fechaAno])

  const handleDescargarExcel = useCallback(() => {
    if (excelLink) {
      window.open(`${STORAGE_BASE_URL}/${excelLink}`, '_blank')
    }
  }, [excelLink])

  const handleReset = useCallback(() => {
    setFechaAno('')
    setPrestamos([])
    setExcelLink(null)
  }, [])

  return {
    fechaAno,
    setFechaAno,
    prestamos,
    isLoading,
    excelLink,
    handleGetAnual,
    handleDescargarExcel,
    handleReset,
  }
}
