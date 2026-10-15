import { useState, useCallback } from 'react'
import Swal from 'sweetalert2'
import { PersonasRenovacionesReport } from '@/Service/tab/Persona'
import { STORAGE_BASE_URL } from '@/utils/imageUtils'

export { STORAGE_BASE_URL }

export interface PersonaReporteItem {
  ID_PERSONA?: number | string
  IDENTIFICACION_PERSONA?: string
  NOMBRE_PERSONA?: string
  APELLIDO_PERSONA?: string
  FECHA_PERSONA?: string
  EDAD_PERSONA?: number | string
  CORREO_PERSONA?: string
  ESTADOINSCRIPCION_PERSONA?: number
  TELEFONO_PERSONA?: string
  CELULAR_PERSONA?: string
  TIPO_PERSONA?: string
  ESTADO_RENOVACIONES?: number
  cantidad_prestamos?: number
  PERSONA?: any
  RENOVACIONES?: any[]
  cedula?: string
  nombre?: string
  apellido?: string
  correo?: string
  fechaNacimiento?: string
  [key: string]: any
}

export const normalizarRenovacion = (item: any): PersonaReporteItem => {
  if (!item) return {}
  const persona = item.PERSONA || item.persona || {}
  const renovaciones = Array.isArray(item.RENOVACIONES)
    ? item.RENOVACIONES
    : Array.isArray(item.renovaciones)
    ? item.renovaciones
    : []
  const primeraRenovacion = renovaciones[0] || {}

  const identificacion = persona.IDENTIFICACION_PERSONA || item.IDENTIFICACION_PERSONA || ''
  const nombre = persona.NOMBRE_PERSONA || item.NOMBRE_PERSONA || ''
  const apellido = persona.APELLIDO_PERSONA || item.APELLIDO_PERSONA || ''
  const correo = persona.CORREO_PERSONA || item.CORREO_PERSONA || ''
  const fecha = persona.FECHA_PERSONA || item.FECHA_PERSONA || ''
  const telefono = persona.TELEFONO_PERSONA || item.TELEFONO_PERSONA || ''
  const celular = persona.CELULAR_PERSONA || item.CELULAR_PERSONA || ''
  const edad = item.EDAD_PERSONA ?? persona.EDAD_PERSONA

  return {
    ...persona,
    ...item,
    ID_PERSONA: item.ID_PERSONA ?? persona.ID_PERSONA,
    IDENTIFICACION_PERSONA: identificacion,
    NOMBRE_PERSONA: nombre,
    APELLIDO_PERSONA: apellido,
    CORREO_PERSONA: correo,
    FECHA_PERSONA: fecha,
    TELEFONO_PERSONA: telefono,
    CELULAR_PERSONA: celular,
    EDAD_PERSONA: edad,
    // Alias directos para las columnas y el ordenamiento de CSmartTable
    cedula: identificacion,
    nombre: nombre,
    apellido: apellido,
    correo: correo,
    fechaNacimiento: fecha,
    RENOVACIONES: renovaciones,
    PERSONA: persona,
    FECHAINICIO_RENOVACIONES: primeraRenovacion.FECHAINICIO_RENOVACIONES ?? item.FECHAINICIO_RENOVACIONES,
    FECHAFIN_RENOVACIONES: primeraRenovacion.FECHAFIN_RENOVACIONES ?? item.FECHAFIN_RENOVACIONES,
    COSTO_RENOVACIONES: primeraRenovacion.COSTO_RENOVACIONES ?? item.COSTO_RENOVACIONES,
    ESTADO_RENOVACIONES: primeraRenovacion.ESTADO_RENOVACIONES ?? item.ESTADO_RENOVACIONES,
  }
}

export const useReporteRenovaciones = () => {
  const [diaRegistro, setDiaRegistro] = useState<string>('')
  const [mesRegistro, setMesRegistro] = useState<string>('')
  const [anoRegistro, setAnoRegistro] = useState<string>('')
  const [usuarios, setUsuarios] = useState<PersonaReporteItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [excelLink, setExcelLink] = useState<string | null>(null)
  const [haBuscado, setHaBuscado] = useState<boolean>(false)

  const handleGetRenovaciones = useCallback(async () => {
    if (!mesRegistro || !anoRegistro) {
      Swal.mixin({
        toast: true,
        position: 'top-end',
        timer: 2500,
        timerProgressBar: false,
        showConfirmButton: false,
      }).fire({
        icon: 'warning',
        title: 'Por favor, ingrese el mes y año.',
      })
      return
    }

    setIsLoading(true)
    setHaBuscado(true)
    setUsuarios([])
    setExcelLink(null)

    try {
      const params: Record<string, any> = {
        mesRegistro,
        anoRegistro,
        anio: anoRegistro,
        mes: mesRegistro,
      }
      if (diaRegistro) {
        params.diaRegistro = diaRegistro
        params.dia = diaRegistro
      }

      const data = await PersonasRenovacionesReport(params)
      const rawList = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
      const personasNormalizadas = rawList.map(normalizarRenovacion)
      const personasFiltradas = personasNormalizadas
        .filter((item: PersonaReporteItem) => item.ESTADO_RENOVACIONES === undefined || item.ESTADO_RENOVACIONES === 1 || item.tipo_usuario === 'Renovacion')
        .sort((a: PersonaReporteItem, b: PersonaReporteItem) => (Number(a.EDAD_PERSONA) || 0) - (Number(b.EDAD_PERSONA) || 0))

      setUsuarios(personasFiltradas)
      setExcelLink(data?.excel_path || null)

      if (personasFiltradas.length === 0) {
        Swal.fire({
          icon: 'info',
          title: 'Sin renovaciones',
          text: 'No se encontraron renovaciones registradas en la fecha seleccionada.',
          confirmButtonColor: '#0d6efd',
        })
      }
    } catch (error: any) {
      console.error('Error al obtener renovaciones', error)
      const respData = error?.response?.data
      const errStr = typeof respData === 'string' ? respData : JSON.stringify(respData || '')

      const isZeroResultsError =
        error?.response?.status === 500 &&
        (errStr.includes('PersonasExport') || errStr.includes('toArray() on null'))

      const isBackendSchemaError =
        error?.response?.status === 500 &&
        (errStr.includes('ID_RENOVACION') || errStr.includes('Column not found'))

      if (isZeroResultsError) {
        setUsuarios([])
        setExcelLink(null)
        Swal.fire({
          icon: 'info',
          title: 'Sin renovaciones',
          text: 'No se encontraron renovaciones registradas en la fecha seleccionada.',
          confirmButtonColor: '#0d6efd',
        })
      } else if (isBackendSchemaError) {
        setUsuarios([])
        setExcelLink(null)
        Swal.fire({
          icon: 'warning',
          title: 'Servicio en revisión',
          text: 'El reporte de renovaciones está en mantenimiento en el servidor. Por favor, comuníquese con el administrador.',
          confirmButtonColor: '#0d6efd',
        })
      } else {
        Swal.mixin({
          toast: true,
          position: 'top-end',
          timer: 2500,
          timerProgressBar: false,
          showConfirmButton: false,
        }).fire({
          icon: 'warning',
          title: 'Error!',
          text: 'Hubo un problema al obtener las renovaciones.',
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
    const rows = usuarios.map((u) => {
      let fechaStr = '-'
      if (u.FECHA_PERSONA) {
        const d = new Date(u.FECHA_PERSONA)
        if (!isNaN(d.getTime()) && d.getFullYear() > 1900 && d.getFullYear() < 2100) {
          fechaStr = d.toLocaleDateString()
        }
      }
      return [
        `"${u.IDENTIFICACION_PERSONA || ''}"`,
        `"${u.NOMBRE_PERSONA || ''}"`,
        `"${u.APELLIDO_PERSONA || ''}"`,
        `"${fechaStr}"`,
        `"${u.CORREO_PERSONA || ''}"`,
      ]
    })
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
    setHaBuscado(false)
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
    haBuscado,
    handleGetRenovaciones,
    handleDescargarExcel,
    handleReset,
  }
}

export default useReporteRenovaciones
