import { useState, useCallback } from 'react'
import Swal from 'sweetalert2'
import { PersonasActivasMesReport } from '@/Service/tab/Persona'
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

export const useReportActivosMesDia = () => {
  const [diaRegistro, setDiaRegistro] = useState<string>('')
  const [mesRegistro, setMesRegistro] = useState<string>('')
  const [anoRegistro, setAnoRegistro] = useState<string>('')
  const [usuarios, setUsuarios] = useState<PersonaReporteItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [excelLink, setExcelLink] = useState<string | null>(null)
  const [haBuscado, setHaBuscado] = useState<boolean>(false)

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
    setHaBuscado(true)
    setUsuarios([])
    setExcelLink(null)

    try {
      const params: Record<string, any> = {
        mesRegistro,
        anoRegistro,
      }
      if (diaRegistro) {
        params.diaRegistro = diaRegistro
        params.dia = diaRegistro
      }

      const data = await PersonasActivasMesReport(params)
      const rawList = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
      const personasFiltradas = rawList
        .filter((item: PersonaReporteItem) => item.ESTADOINSCRIPCION_PERSONA !== 1)
        .sort((a: PersonaReporteItem, b: PersonaReporteItem) => (a.EDAD_PERSONA || 0) - (b.EDAD_PERSONA || 0))

      
      setUsuarios(personasFiltradas)
      setExcelLink(data?.excel_path || null)

      if(personasFiltradas.length === 0){
        Swal.fire({
          icon: 'info',
          title: 'Sin usuarios activos',
          text: 'No se encontraron usuarios activos registrados en la fecha seleccionada',
          confirmButtonColor: '#0d6efd',
        })
      }
    } catch (error: any) {
      console.error('Error al obtener las personas activas por mes/día', error)
      const respData = error?.response?.data
      const isZeroResultsError =
        error?.response?.status === 500 &&
        ((typeof respData === 'string' && (respData.includes('PersonasExport') || respData.includes('toArray() on null'))) ||
          (error?.response?.data?.message && error.response.data.message.includes('toArray() on null')))

          if (isZeroResultsError){
            setUsuarios([])
            setExcelLink(null)
            Swal.fire({
              icon: 'info',
              title: 'Sin usuarios activos',
              text: 'No se encontraron usuarios activos registrados en la fecha seleccionada',
              confirmButtonColor: '#0d6efd',
            })
          }else {
            Swal.mixin({
              toast: true,
              position: 'top-end',
              timer: 2500,
              timerProgressBar: false,
              showConfirmButton: false,
            }).fire({
              icon: 'warning',
              title: 'Error!',
              text: 'Hubo un problema al obtener los usuarios activos.',
            })
          }
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
    handleGetActivasMes,
    handleDescargarExcel,
    handleReset,
    haBuscado,
  }
}

export const useReporteUsuariosActivosMesDia = useReportActivosMesDia
export default useReportActivosMesDia
