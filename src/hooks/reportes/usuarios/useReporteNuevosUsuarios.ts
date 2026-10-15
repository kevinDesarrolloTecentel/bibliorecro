import { useState, useCallback } from 'react'
import Swal from 'sweetalert2'
import { PersonasNuevasReport } from '@/Service/tab/Persona'
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

export const useReporteNuevosUsuarios = () => {
  const [diaRegistro, setDiaRegistro] = useState<string>('')
  const [mesRegistro, setMesRegistro] = useState<string>('')
  const [anoRegistro, setAnoRegistro] = useState<string>('')
  const [usuarios, setUsuarios] = useState<PersonaReporteItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [excelLink, setExcelLink] = useState<string | null>(null)
  const [haBuscado, setHaBuscado] = useState<boolean>(false)

  const handleGetNuevosUsuarios = useCallback(async () => {
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

      const data = await PersonasNuevasReport(params)
      if (data?.error) {
        Swal.fire({
          icon: 'info',
          title: 'Sin nuevos usuarios',
          text: data.error,
          confirmButtonColor: '#0d6efd',
        })
        setUsuarios([])
      } else {
        const rawList = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
        const ordenados = [...rawList].sort(
          (a: PersonaReporteItem, b: PersonaReporteItem) => (a.EDAD_PERSONA || 0) - (b.EDAD_PERSONA || 0),
        )
        setUsuarios(ordenados)
        setExcelLink(data?.excel_path || null)

        if (ordenados.length === 0) {
          Swal.fire({
            icon: 'info',
            title: 'Sin nuevos usuarios',
            text: 'No se encontraron nuevos usuarios registrados en la fecha seleccionada.',
            confirmButtonColor: '#0d6efd',
          })
        }
      }
    } catch (error: any) {
      console.error('Error al obtener nuevos usuarios', error)
      const respData = error?.response?.data
      const errStr = typeof respData === 'string' ? respData : JSON.stringify(respData || '')

      const isZeroResultsError =
        error?.response?.status === 404 ||
        (error?.response?.status === 500 &&
          (errStr.includes('PersonasExport') || errStr.includes('toArray() on null')))

      if (isZeroResultsError) {
        setUsuarios([])
        setExcelLink(null)
        Swal.fire({
          icon: 'info',
          title: 'Sin nuevos usuarios',
          text: 'No se encontraron nuevos usuarios registrados en la fecha seleccionada.',
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
          text: 'Hubo un problema al obtener los nuevos usuarios.',
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
    haBuscado,
    handleGetNuevosUsuarios,
    handleDescargarExcel,
    handleReset,
  }
}

export default useReporteNuevosUsuarios
