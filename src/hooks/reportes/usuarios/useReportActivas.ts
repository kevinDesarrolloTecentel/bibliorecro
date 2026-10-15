import { useState, useCallback } from 'react'
import Swal from 'sweetalert2'
import { PersonasActivasReport } from '@/Service/tab/Persona'
import { STORAGE_BASE_URL } from '@/utils/imageUtils'

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

const useReportActivas = () => {
  const [anoRegistro, setAnoRegistro] = useState<string>('')
  const [usuarios, setUsuarios] = useState<PersonaReporteItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [excelLink, setExcelLink] = useState<string | null>(null)
  const [haBuscado, setHaBuscado] = useState<boolean> (false)

  const handleGetActivas = useCallback(async () => {
    const anio = (anoRegistro || '').trim()
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
    setHaBuscado(true)
    setUsuarios([])
    setExcelLink(null)

    try {
      const params = {
        anoRegistro: anio,
      }

      const data = await PersonasActivasReport(params)
      const rawList = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []

      const personasFiltradas: PersonaReporteItem[] = rawList
        .filter((item: PersonaReporteItem) => item.ESTADOINSCRIPCION_PERSONA !== 1)
        .sort((a: PersonaReporteItem, b: PersonaReporteItem) => (a.EDAD_PERSONA || 0) - (b.EDAD_PERSONA || 0))

      setUsuarios(personasFiltradas)
      setExcelLink(data?.excel_path || null)
      
      if(personasFiltradas.length === 0) {
        Swal.fire({
          icon: 'info',
          title: 'Sin usuarios activos',
          text: `No se encontraron usuarios activos registrados en el año ${anio}`, confirmButtonColor: '#0d6efd',
        })
      }
    } catch (error: any){
      console.error('Error al obtener las personas activas', error)
      const respData = error?.response?.data
            const isZeroResultsError =
        error?.response?.status === 500 &&
        ((typeof respData === 'string' && (respData.includes('PersonasExport') || respData.includes('toArray() on null'))) ||
          (error?.response?.data?.message && error.response.data.message.includes('toArray() on null')))

          if (isZeroResultsError) {
            setUsuarios([])
            setExcelLink(null)
            Swal.fire({
              icon: 'info',
              title: 'Sin usuarios activos',
              text: `No se encontraron usuarios activos registrados en el año ${anio}`,
              confirmButtonColor: '#0d6efd',
            })
          } else {
            Swal.mixin({
              toast: true,
              position: 'top-end',
              timer: 2500,
              timerProgressBar: false,
              showCancelButton: false,
            }).fire({
              icon: 'error',
              title: 'Error!',
              text: error?.response?.data?.message || 'Hubo un problema al obtener los usuarios activos.',
            })
          }
    } finally{
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
    setHaBuscado(false)
  }, [])

  return {
    anoRegistro,
    setAnoRegistro,
    anoMejor: anoRegistro,
    setAnoMejor: setAnoRegistro,
    usuarios,
    isLoading,
    excelLink,
    handleGetActivas,
    handleObtenerActivos: handleGetActivas,
    handleDescargarExcel,
    handleReset,
    haBuscado
  }
}

export const useReporteUsuariosActivos = useReportActivas
export default useReportActivas 