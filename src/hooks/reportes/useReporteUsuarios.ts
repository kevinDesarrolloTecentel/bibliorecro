import { useState, useCallback, useEffect } from 'react'
import Swal from 'sweetalert2'
import apiClient, { BACKEND_API_BASE } from '@/Service/apiClient'
import { STORAGE_BASE_URL } from '@/.env'
import { ListarGenero } from '@/Service/tab/Genero'

export { STORAGE_BASE_URL }
export const API_BASE_URL = BACKEND_API_BASE

export interface PersonaReporteItem {
  ID_PERSONA?: number | string
  IDENTIFICACION_PERSONA?: string
  NOMBRE_PERSONA?: string
  APELLIDO_PERSONA?: string
  FECHA_PERSONA?: string
  EDAD_PERSONA?: number
  CORREO_PERSONA?: string
  ESTADOINSCRIPCION_PERSONA?: number
  TELEFONO_PERSONA?: string
  TIPO_PERSONA?: string
  ESTADO_RENOVACIONES?: number
  cantidad_prestamos?: number
  [key: string]: any
}

export interface PrestamoReporteItem {
  ID_PRESTAMO?: number | string
  NOMBRE_PERSONA?: string
  APELLIDO_PERSONA?: string
  ISBN_LIBROS?: string
  TITULO_LIBROS?: string
  NOMBRE_AUTOR?: string
  PRECIO_LIBROS?: number | string
  ESTADOINSCRIPCION_PERSONA?: number
  [key: string]: any
}

export interface GeneroOption {
  label: string
  value: number | string
}

export const useReporteUsuariosEdadGenero = () => {
  const [generos, setGeneros] = useState<GeneroOption[]>([])
  const [generoId, setGeneroId] = useState<string>('')
  const [edadDesde, setEdadDesde] = useState<string>('')
  const [edadHasta, setEdadHasta] = useState<string>('')
  const [usuarios, setUsuarios] = useState<PersonaReporteItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [excelLink, setExcelLink] = useState<string | null>(null)

  useEffect(() => {
    ListarGenero()
      .then((data: any) => {
        const raw = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
        const optionsData: GeneroOption[] = raw
          .filter((g: any) => g.ID_GENERO)
          .map((g: any) => ({
            label: g.NOMBRE_GENERO,
            value: g.ID_GENERO,
          }))
        setGeneros(optionsData)
      })
      .catch((error) => {
        console.error('Error al cargar géneros en reporte:', error)
      })
  }, [])

  const handleGet = useCallback(async () => {
    if (!edadDesde || !edadHasta) {
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
      const params: Record<string, any> = {
        edadDesde,
        edadHasta,
      }
      if (generoId) {
        params.generoId = generoId
      }

      const { data } = await apiClient.get(`${BACKEND_API_BASE}/personasReport`, { params })
      const rawList = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
      const personasFiltradas = rawList
        .filter((item: PersonaReporteItem) => item.ESTADOINSCRIPCION_PERSONA !== 1)
        .sort((a: PersonaReporteItem, b: PersonaReporteItem) => (a.EDAD_PERSONA || 0) - (b.EDAD_PERSONA || 0))

      setUsuarios(personasFiltradas)
      setExcelLink(data.excel_path || null)
    } catch (error) {
      console.error('Error al obtener las personas', error)
      Swal.mixin({
        toast: true,
        position: 'top-end',
        timer: 2500,
        timerProgressBar: false,
        showConfirmButton: false,
      }).fire({
        icon: 'error',
        title: 'Error!',
        text: 'Hubo un problema al obtener los usuarios. Por favor, inténtelo de nuevo más tarde.',
      })
    } finally {
      setIsLoading(false)
    }
  }, [edadDesde, edadHasta, generoId])

  const handleDescargarExcel = useCallback(() => {
    if (excelLink) {
      window.open(`${STORAGE_BASE_URL}/${excelLink}`, '_blank')
    }
  }, [excelLink])

  const handleReset = useCallback(() => {
    setEdadDesde('')
    setEdadHasta('')
    setGeneroId('')
    setUsuarios([])
    setExcelLink(null)
  }, [])

  return {
    generos,
    generoId,
    setGeneroId,
    edadDesde,
    setEdadDesde,
    edadHasta,
    setEdadHasta,
    usuarios,
    isLoading,
    excelLink,
    handleGet,
    handleDescargarExcel,
    handleReset,
  }
}

export const useReporteUsuariosActivos = () => {
  const [anoRegistro, setAnoRegistro] = useState<string>('')
  const [usuarios, setUsuarios] = useState<PersonaReporteItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [excelLink, setExcelLink] = useState<string | null>(null)

  const handleGetActivas = useCallback(async () => {
    if (!anoRegistro) {
      Swal.mixin({
        toast: true,
        position: 'top-end',
        timer: 2500,
        timerProgressBar: false,
        showConfirmButton: false,
      }).fire({
        icon: 'error',
        title: 'Por favor, ingrese el año.',
      })
      return
    }

    setIsLoading(true)
    try {
      const params = { anoRegistro }
      const { data } = await apiClient.get(`${BACKEND_API_BASE}/personasReportActivas`, { params })
      const rawList = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
      const personasFiltradas = rawList
        .filter((item: PersonaReporteItem) => item.ESTADOINSCRIPCION_PERSONA !== 1)
        .sort((a: PersonaReporteItem, b: PersonaReporteItem) => (a.EDAD_PERSONA || 0) - (b.EDAD_PERSONA || 0))

      setUsuarios(personasFiltradas)
      setExcelLink(data.excel_path || null)
    } catch (error) {
      console.error('Error al obtener las personas activas', error)
      Swal.mixin({
        toast: true,
        position: 'top-end',
        timer: 2500,
        timerProgressBar: false,
        showConfirmButton: false,
      }).fire({
        icon: 'warning',
        title: 'Hubo un problema al obtener los usuarios activos.',
      })
    } finally {
      setIsLoading(false)
    }
  }, [anoRegistro])

  const handleDescargarExcel = useCallback(() => {
    if (excelLink) {
      window.open(`${STORAGE_BASE_URL}/${excelLink}`, '_blank')
    }
  }, [excelLink])

  const handleReset = useCallback(() => {
    setAnoRegistro('')
    setUsuarios([])
    setExcelLink(null)
  }, [])

  return {
    anoRegistro,
    setAnoRegistro,
    usuarios,
    isLoading,
    excelLink,
    handleGetActivas,
    handleDescargarExcel,
    handleReset,
  }
}

export const useReporteUsuariosActivosMesDia = () => {
  const [diaRegistro, setDiaRegistro] = useState<string>('')
  const [mesRegistro, setMesRegistro] = useState<string>('')
  const [anoRegistro, setAnoRegistro] = useState<string>('')
  const [usuarios, setUsuarios] = useState<PersonaReporteItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [excelLink, setExcelLink] = useState<string | null>(null)

  const handleGetActivasMes = useCallback(async () => {
    if (!mesRegistro || !anoRegistro) {
      Swal.mixin({
        toast: true,
        position: 'top-end',
        timer: 2500,
        timerProgressBar: false,
        showConfirmButton: false,
      }).fire({
        icon: 'warning',
        title: 'Por favor, ingrese el día y mes.',
      })
      return
    }

    setIsLoading(true)
    try {
      const params: Record<string, any> = {
        mesRegistro,
        anoRegistro,
      }
      if (diaRegistro) {
        params.diaRegistro = diaRegistro
      }

      const { data } = await apiClient.get(`${BACKEND_API_BASE}/personasReportActivasMes`, { params })
      const rawList = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
      const personasFiltradas = rawList
        .filter((item: PersonaReporteItem) => item.ESTADOINSCRIPCION_PERSONA !== 1)
        .sort((a: PersonaReporteItem, b: PersonaReporteItem) => (a.EDAD_PERSONA || 0) - (b.EDAD_PERSONA || 0))

      setUsuarios(personasFiltradas)
      setExcelLink(data.excel_path || null)
    } catch (error) {
      console.error('Error al obtener las personas activas por mes/día', error)
      Swal.mixin({
        toast: true,
        position: 'top-end',
        timer: 2500,
        timerProgressBar: false,
        showConfirmButton: false,
      }).fire({
        icon: 'warning',
        title: 'Hubo un problema al obtener los usuarios activos.',
      })
    } finally {
      setIsLoading(false)
    }
  }, [diaRegistro, mesRegistro, anoRegistro])

  const handleDescargarExcel = useCallback(() => {
    if (excelLink) {
      window.open(`${STORAGE_BASE_URL}/${excelLink}`, '_blank')
    }
  }, [excelLink])

  const handleReset = useCallback(() => {
    setDiaRegistro('')
    setMesRegistro('')
    setAnoRegistro('')
    setUsuarios([])
    setExcelLink(null)
  }, [])

  return {
    diaRegistro,
    setDiaRegistro,
    mesRegistro,
    setMesRegistro,
    anoRegistro,
    setAnoRegistro,
    usuarios,
    isLoading,
    excelLink,
    handleGetActivasMes,
    handleDescargarExcel,
    handleReset,
  }
}

export const useReporteRenovaciones = () => {
  const [diaRegistro, setDiaRegistro] = useState<string>('')
  const [mesRegistro, setMesRegistro] = useState<string>('')
  const [anoRegistro, setAnoRegistro] = useState<string>('')
  const [usuarios, setUsuarios] = useState<PersonaReporteItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [excelLink, setExcelLink] = useState<string | null>(null)

  const handleGetRenovaciones = useCallback(async () => {
    if (!mesRegistro || !anoRegistro) {
      Swal.mixin({
        toast: true,
        position: 'top-end',
        timer: 2500,
        timerProgressBar: false,
        showConfirmButton: false,
      }).fire({
        icon: 'error',
        title: 'Por favor, ingrese el día, mes y año.',
      })
      return
    }

    setIsLoading(true)
    try {
      const params: Record<string, any> = {
        mesRegistro,
        anoRegistro,
      }
      if (diaRegistro) {
        params.diaRegistro = diaRegistro
      }

      const { data } = await apiClient.get(`${BACKEND_API_BASE}/personasReportRenovaciones`, { params })
      const rawList = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
      const personasFiltradas = rawList
        .filter((item: PersonaReporteItem) => item.ESTADO_RENOVACIONES === 1)
        .sort((a: PersonaReporteItem, b: PersonaReporteItem) => (a.EDAD_PERSONA || 0) - (b.EDAD_PERSONA || 0))

      setUsuarios(personasFiltradas)
      setExcelLink(data.excel_path || null)
    } catch (error) {
      console.warn('Endpoint personasReportRenovaciones falló, intentando fallback con personasNuevas...', error)
      try {
        const { data } = await apiClient.get(`${BACKEND_API_BASE}/personasNuevas`, {
          params: {
            anio: anoRegistro,
            mes: Number(mesRegistro),
            tipo: 'detalle',
          },
        })

        const renovaciones = data?.detalle?.usuarios_renovaciones || []
        const parsedList: PersonaReporteItem[] = renovaciones
          .filter((item: any) => {
            if (!diaRegistro) return true
            if (!item.fecha) return false
            const soloFecha = String(item.fecha).split(' ')[0]
            const partes = soloFecha.split('-')
            const diaItem = partes.length === 3 ? parseInt(partes[2], 10) : null
            return diaItem === parseInt(diaRegistro, 10)
          })
          .map((item: any) => ({
            ...item,
            IDENTIFICACION_PERSONA: item.cedula || item.IDENTIFICACION_PERSONA,
            NOMBRE_PERSONA: item.nombre || item.NOMBRE_PERSONA,
            APELLIDO_PERSONA: item.apellido || item.APELLIDO_PERSONA,
            FECHA_PERSONA: item.fecha_nacimiento || item.FECHA_PERSONA,
            CORREO_PERSONA: item.correo || item.CORREO_PERSONA,
            EDAD_PERSONA: item.edad ?? null,
            ESTADO_RENOVACIONES: 1,
          }))
          .sort((a: PersonaReporteItem, b: PersonaReporteItem) => (Number(a.EDAD_PERSONA) || 0) - (Number(b.EDAD_PERSONA) || 0))

        setUsuarios(parsedList)
        setExcelLink(parsedList.length > 0 ? 'local_csv' : null)
      } catch (fallbackError) {
        console.error('Error al obtener renovaciones (fallback)', fallbackError)
        Swal.mixin({
          toast: true,
          position: 'top-end',
          timer: 2500,
          timerProgressBar: false,
          showConfirmButton: false,
        }).fire({
          icon: 'warning',
          title: 'Hubo un problema al obtener las renovaciones.',
        })
      }
    } finally {
      setIsLoading(false)
    }
  }, [diaRegistro, mesRegistro, anoRegistro])

  const handleDescargarExcel = useCallback(() => {
    if (excelLink && excelLink !== 'local_csv') {
      window.open(`${STORAGE_BASE_URL}/${excelLink}`, '_blank')
      return
    }
    if (!usuarios.length) return
    const headers = ['Cédula', 'Nombre', 'Apellido', 'Fecha Nacimiento', 'Correo']
    const rows = usuarios.map((u) => [
      `"${u.IDENTIFICACION_PERSONA || ''}"`,
      `"${u.NOMBRE_PERSONA || ''}"`,
      `"${u.APELLIDO_PERSONA || ''}"`,
      `"${u.FECHA_PERSONA ? new Date(u.FECHA_PERSONA).toLocaleDateString() : '-'}"`,
      `"${u.CORREO_PERSONA || ''}"`,
    ])
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `renovaciones_${anoRegistro}_${mesRegistro}${diaRegistro ? '_' + diaRegistro : ''}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }, [excelLink, usuarios, anoRegistro, mesRegistro, diaRegistro])

  const handleReset = useCallback(() => {
    setDiaRegistro('')
    setMesRegistro('')
    setAnoRegistro('')
    setUsuarios([])
    setExcelLink(null)
  }, [])

  return {
    diaRegistro,
    setDiaRegistro,
    mesRegistro,
    setMesRegistro,
    anoRegistro,
    setAnoRegistro,
    usuarios,
    isLoading,
    excelLink,
    handleGetRenovaciones,
    handleDescargarExcel,
    handleReset,
  }
}

export const useReporteMejoresUsuarios = () => {
  const [anoMejor, setAnoMejor] = useState<string>('')
  const [usuarios, setUsuarios] = useState<PersonaReporteItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [excelLink, setExcelLink] = useState<string | null>(null)

  const handleGetMejores = useCallback(async () => {
    if (!anoMejor) {
      Swal.mixin({
        toast: true,
        position: 'top-end',
        timer: 2500,
        timerProgressBar: false,
        showConfirmButton: false,
      }).fire({
        icon: 'error',
        title: 'Por favor, ingrese el año.',
      })
      return
    }

    setIsLoading(true)
    try {
      const params = { anoMejor }
      const { data } = await apiClient.get(`${BACKEND_API_BASE}/personasReportMejores`, { params })
      const rawList = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
      const personasFiltradas = rawList
        .filter((item: PersonaReporteItem) => item.ESTADOINSCRIPCION_PERSONA !== 1)
        .sort(
          (a: PersonaReporteItem, b: PersonaReporteItem) =>
            Number(b.cantidad_prestamos || 0) - Number(a.cantidad_prestamos || 0),
        )

      setUsuarios(personasFiltradas)
      setExcelLink(data.excel_path || null)
    } catch (error) {
      console.error('Error al obtener los mejores usuarios', error)
      Swal.mixin({
        toast: true,
        position: 'top-end',
        timer: 2500,
        timerProgressBar: false,
        showConfirmButton: false,
      }).fire({
        icon: 'warning',
        title: 'Hubo un problema al obtener los datos de mejores usuarios.',
      })
    } finally {
      setIsLoading(false)
    }
  }, [anoMejor])

  const handleDescargarExcel = useCallback(() => {
    if (excelLink) {
      window.open(`${STORAGE_BASE_URL}/${excelLink}`, '_blank')
    }
  }, [excelLink])

  const handleReset = useCallback(() => {
    setAnoMejor('')
    setUsuarios([])
    setExcelLink(null)
  }, [])

  return {
    anoMejor,
    setAnoMejor,
    usuarios,
    isLoading,
    excelLink,
    handleGetMejores,
    handleDescargarExcel,
    handleReset,
  }
}

export const useReporteHistorialLibrosUsuario = () => {
  const [cedula, setCedula] = useState<string>('')
  const [libros, setLibros] = useState<PrestamoReporteItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [excelLink, setExcelLink] = useState<string | null>(null)

  const handleGetPrestamos = useCallback(async () => {
    if (!cedula) {
      Swal.mixin({
        toast: true,
        position: 'top-end',
        timer: 2500,
        timerProgressBar: false,
        showConfirmButton: false,
      }).fire({
        icon: 'error',
        title: 'Por favor, ingrese la cédula.',
      })
      return
    }

    setIsLoading(true)
    try {
      const params = { cedula }
      const { data } = await apiClient.get(`${BACKEND_API_BASE}/prestamosReport`, { params })
      const rawList = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
      const librosFiltrados = rawList
        .filter((item: PrestamoReporteItem) => item.ESTADOINSCRIPCION_PERSONA !== 1)
        .sort(
          (a: PrestamoReporteItem, b: PrestamoReporteItem) =>
            Number(a.ID_PRESTAMO || 0) - Number(b.ID_PRESTAMO || 0),
        )

      setLibros(librosFiltrados)
      setExcelLink(data.excel_path || null)
    } catch (error) {
      console.error('Error al obtener historial de libros', error)
      Swal.mixin({
        toast: true,
        position: 'top-end',
        timer: 2500,
        timerProgressBar: false,
        showConfirmButton: false,
      }).fire({
        icon: 'warning',
        title: 'Hubo un problema al obtener los préstamos. Por favor, inténtelo de nuevo más tarde.',
      })
    } finally {
      setIsLoading(false)
    }
  }, [cedula])

  const handleDescargarExcel = useCallback(() => {
    if (excelLink) {
      window.open(`${STORAGE_BASE_URL}/${excelLink}`, '_blank')
    }
  }, [excelLink])

  const handleReset = useCallback(() => {
    setCedula('')
    setLibros([])
    setExcelLink(null)
  }, [])

  return {
    cedula,
    setCedula,
    libros,
    isLoading,
    excelLink,
    handleGetPrestamos,
    handleDescargarExcel,
    handleReset,
  }
}

export const useReporteNuevosUsuarios = () => {
  const [diaRegistro, setDiaRegistro] = useState<string>('')
  const [mesRegistro, setMesRegistro] = useState<string>('')
  const [anoRegistro, setAnoRegistro] = useState<string>('')
  const [usuarios, setUsuarios] = useState<PersonaReporteItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [excelLink, setExcelLink] = useState<string | null>(null)

  const handleGetNuevosUsuarios = useCallback(async () => {
    if (!mesRegistro || !anoRegistro) {
      Swal.mixin({
        toast: true,
        position: 'top-end',
        timer: 2500,
        timerProgressBar: false,
        showConfirmButton: false,
      }).fire({
        icon: 'error',
        title: 'Por favor, ingrese el día, mes y año.',
      })
      return
    }

    setIsLoading(true)
    try {
      const params: Record<string, any> = {
        mesRegistro,
        anoRegistro,
      }
      if (diaRegistro) {
        params.diaRegistro = diaRegistro
      }

      const { data } = await apiClient.get(`${BACKEND_API_BASE}/personasReportNuevas`, { params })
      if (data?.error) {
        Swal.fire({
          icon: 'info',
          title: 'Información',
          text: data.error,
        })
        setUsuarios([])
      } else {
        const rawList = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
        const ordenados = [...rawList].sort(
          (a: PersonaReporteItem, b: PersonaReporteItem) => (a.EDAD_PERSONA || 0) - (b.EDAD_PERSONA || 0),
        )
        setUsuarios(ordenados)
        setExcelLink(data.excel_path || null)
      }
    } catch (error: any) {
      console.error('Error al obtener nuevos usuarios', error)
      Swal.mixin({
        toast: true,
        position: 'top-end',
        timer: 2500,
        timerProgressBar: false,
        showConfirmButton: false,
      }).fire({
        icon: 'warning',
        title: 'Hubo un problema al obtener los nuevos usuarios.',
      })
    } finally {
      setIsLoading(false)
    }
  }, [diaRegistro, mesRegistro, anoRegistro])

  const handleDescargarExcel = useCallback(() => {
    if (excelLink) {
      window.open(`${STORAGE_BASE_URL}/${excelLink}`, '_blank')
    }
  }, [excelLink])

  const handleReset = useCallback(() => {
    setDiaRegistro('')
    setMesRegistro('')
    setAnoRegistro('')
    setUsuarios([])
    setExcelLink(null)
  }, [])

  return {
    diaRegistro,
    setDiaRegistro,
    mesRegistro,
    setMesRegistro,
    anoRegistro,
    setAnoRegistro,
    usuarios,
    isLoading,
    excelLink,
    handleGetNuevosUsuarios,
    handleDescargarExcel,
    handleReset,
  }
}
