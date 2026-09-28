import { useState, useCallback } from 'react'
import Swal from 'sweetalert2'
import { PersonasNuevasReport } from '@/Service/tab/Persona'
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
        anio: anoRegistro,
        mes: mesRegistro,
      }
      if (diaRegistro) {
        params.diaRegistro = diaRegistro
        params.dia = diaRegistro
      }

      const data = await PersonasNuevasReport(params)
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
        setExcelLink(data?.excel_path || null)
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

export default useReporteNuevosUsuarios
