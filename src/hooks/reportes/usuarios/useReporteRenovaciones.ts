import { useState, useCallback } from 'react'
import Swal from 'sweetalert2'
import { PersonasRenovacionesReport, PersonaNueva } from '@/Service/tab/Persona'
import { STORAGE_BASE_URL } from '@/.env'

export { STORAGE_BASE_URL }

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
        anio: anoRegistro,
        mes: mesRegistro,
      }
      if (diaRegistro) {
        params.diaRegistro = diaRegistro
        params.dia = diaRegistro
      }

      const data = await PersonasRenovacionesReport(params)
      const rawList = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
      const personasFiltradas = rawList
        .filter((item: PersonaReporteItem) => item.ESTADO_RENOVACIONES === 1)
        .sort((a: PersonaReporteItem, b: PersonaReporteItem) => (a.EDAD_PERSONA || 0) - (b.EDAD_PERSONA || 0))

      setUsuarios(personasFiltradas)
      setExcelLink(data?.excel_path || null)
    } catch (error) {
      console.warn('Endpoint PersonasRenovacionesReport falló, intentando fallback con PersonaNueva...', error)
      try {
        const data = await PersonaNueva({
          anio: anoRegistro,
          mes: Number(mesRegistro),
          tipo: 'detalle',
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

export default useReporteRenovaciones
