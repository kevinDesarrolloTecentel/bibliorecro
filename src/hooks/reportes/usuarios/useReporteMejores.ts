import { useState, useCallback } from 'react'
import Swal from 'sweetalert2'
import { PersonasMejoresReport } from '@/Service/tab/Persona'
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

  const useReporteMejores = () => {
  const [anoMejor, setAnoMejor] = useState<string>('')
  const [usuarios, setUsuarios] = useState<PersonaReporteItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [excelLink, setExcelLink] = useState<string | null>(null)

  const handleGetMejores = useCallback(async () => {
    const anio = (anoMejor || '').trim()
    if (!anio) {
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
      const params = {
        anoMejor: anio,
        anio: anio,
        year: anio,
      }

      const data = await PersonasMejoresReport(params)
      const rawList = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []

      const personasFiltradas: PersonaReporteItem[] = rawList
        .filter((item: PersonaReporteItem) => item.ESTADOINSCRIPCION_PERSONA !== 1)
        .sort(
          (a: PersonaReporteItem, b: PersonaReporteItem) =>
            Number(b.cantidad_prestamos || 0) - Number(a.cantidad_prestamos || 0),
        )

      setUsuarios(personasFiltradas)
      setExcelLink(data?.excel_path || null)
    } catch (error: any) {
      console.error('Error al obtener los mejores usuarios:', error)
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

export const useReporteMejoresUsuarios = useReporteMejores
export default useReporteMejores
