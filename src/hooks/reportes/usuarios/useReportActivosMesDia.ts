import { useState, useCallback } from 'react'
import Swal from 'sweetalert2'
import { PersonasActivasMesReport } from '@/Service/tab/Persona'
import { STORAGE_BASE_URL, descargarArchivo } from '@/utils/imageUtils'
import { usePermissions } from '@/context/PermissionsContext'

export { STORAGE_BASE_URL, descargarArchivo }

import { PersonaReporteItem } from '@/models/reportes/usuarios'

export type { PersonaReporteItem }

export const useReportActivosMesDia = () => {
  const { canDoAction, verificarAccionEnServidor } = usePermissions()
  const canGenerarUsuariosActivosMesDia = canDoAction('btn_generar_usuarios_activos_mes_dia')
  const canDescargarUsuariosActivosMesDia = canDoAction('btn_descargar_usuarios_activos_mes_dia')

  const [diaRegistro, setDiaRegistro] = useState<string>('')
  const [mesRegistro, setMesRegistro] = useState<string>('')
  const [anoRegistro, setAnoRegistro] = useState<string>('')
  const [usuarios, setUsuarios] = useState<PersonaReporteItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [excelLink, setExcelLink] = useState<string | null>(null)
  const [haBuscado, setHaBuscado] = useState<boolean>(false)


  const handleGetActivasMes = useCallback(async () => {
    if (!canGenerarUsuariosActivosMesDia) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para generar este reporte.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    if (!mesRegistro || !anoRegistro || !diaRegistro) {
      Swal.fire({
        icon: 'warning',
        title: 'Campo requerido',
        text: 'Por favor, seleccione una fecha para consultar el reporte.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    setIsLoading(true)

    const tienePermiso = await verificarAccionEnServidor('btn_generar_usuarios_activos_mes_dia')
    if (!tienePermiso) {
      setIsLoading(false)
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para generar este reporte.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

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

      if (personasFiltradas.length === 0) {
        Swal.fire({
          icon: 'info',
          title: 'Sin usuarios activos',
          text: 'No se encontraron usuarios activos registrados en la fecha seleccionada.',
          confirmButtonColor: '#044c8c',
          confirmButtonText: 'Entendido',
        })
      }
    } catch (error: any) {
      console.error('Error al obtener las personas activas por mes/día', error)
      setUsuarios([])
      setExcelLink(null)
      const respData = error?.response?.data
      const errStr = typeof respData === 'string' ? respData : JSON.stringify(respData || '')
      const errorMsg = error?.response?.data?.message || error?.message || ''
      const isZeroResultsError =
        error?.response?.status === 404 ||
        (error?.response?.status === 500 &&
          ((typeof respData === 'string' && (respData.includes('PersonasExport') || respData.includes('toArray() on null'))) ||
            (errorMsg && errorMsg.includes('toArray() on null')))) ||
        errorMsg.toLowerCase().includes('no existe') ||
        errorMsg.toLowerCase().includes('no se encontr') ||
        errorMsg.toLowerCase().includes('sin registros') ||
        errStr.toLowerCase().includes('no existe') ||
        errStr.toLowerCase().includes('no se encontr')

      if (isZeroResultsError) {
        Swal.fire({
          icon: 'info',
          title: 'Sin usuarios activos',
          text: 'No se encontraron usuarios activos registrados en la fecha seleccionada.',
          confirmButtonColor: '#044c8c',
          confirmButtonText: 'Entendido',
        })
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error al consultar',
          text: errorMsg || 'Hubo un problema al obtener los usuarios activos.',
          confirmButtonColor: '#dc3545',
          confirmButtonText: 'Entendido',
        })
      }
    } finally {
      setIsLoading(false)
    }
  }, [canGenerarUsuariosActivosMesDia, diaRegistro, mesRegistro, anoRegistro])

  const handleDescargarExcel = useCallback(async () => {
    if (!canDescargarUsuariosActivosMesDia) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para descargar este reporte.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    const tienePermiso = await verificarAccionEnServidor('btn_descargar_usuarios_activos_mes_dia')
    if (!tienePermiso) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para descargar este reporte.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    if (excelLink) {
      await descargarArchivo(`${STORAGE_BASE_URL}/${excelLink}`)
    }
  }, [canDescargarUsuariosActivosMesDia, excelLink, verificarAccionEnServidor])

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
    canGenerarUsuariosActivosMesDia,
    canDescargarUsuariosActivosMesDia,
    verificarAccionEnServidor,
  }
}

export const useReporteUsuariosActivosMesDia = useReportActivosMesDia
export default useReportActivosMesDia
