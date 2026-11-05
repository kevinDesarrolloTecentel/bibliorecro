import { useState, useCallback } from 'react'
import Swal from 'sweetalert2'
import { PersonasMejoresReport } from '@/Service/tab/Persona'
import { STORAGE_BASE_URL, descargarArchivo } from '@/utils/imageUtils'
import { usePermissions } from '@/context/PermissionsContext'

export { STORAGE_BASE_URL, descargarArchivo }

import { PersonaReporteItem } from '@/models/reportes/usuarios'

export type { PersonaReporteItem }

  const useReporteMejores = () => {
  const { canDoAction, verificarAccionEnServidor } = usePermissions()
  const canGenerarRankingUsuarios = canDoAction('btn_generar_ranking_usuarios')
  const canDescargarRankingUsuarios = canDoAction('btn_descargar_ranking_usuarios')

  const [anoMejor, setAnoMejor] = useState<string>('')
  const [usuarios, setUsuarios] = useState<PersonaReporteItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [excelLink, setExcelLink] = useState<string | null>(null)
  const [haBuscado, setHaBuscado] = useState<boolean>(false)

  const handleGetMejores = useCallback(async () => {
    if (!canGenerarRankingUsuarios) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para generar este reporte.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    const anio = (anoMejor || '').trim()
    if (!anio) {
      Swal.fire({
        icon: 'warning',
        title: 'Campo requerido',
        text: 'Por favor, seleccione un año.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    setIsLoading(true)

    const tienePermiso = await verificarAccionEnServidor('btn_generar_ranking_usuarios')
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
      const params = {
        anoMejor: anio,
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

      if (personasFiltradas.length === 0){
        Swal.fire({
          icon: 'info',
          title: 'Sin registros',
          text: 'No se encontraron usuarios en el ranking para el año seleccionado.',
          confirmButtonColor: '#044c8c',
          confirmButtonText: 'Entendido',
        })
      }
    } catch (error: any) {
      console.error('Error al obtener los mejores usuarios:', error)
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
          title: 'Sin usuarios en el ranking',
          text:  'No se encontraron usuarios en el ranking para el año seleccionado.',
          confirmButtonColor: '#044c8c',
          confirmButtonText: 'Entendido',
        })
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error al consultar',
          text:  'Hubo un problema al obtener los datos de mejores usuarios.',
          confirmButtonColor: '#dc3545',
          confirmButtonText: 'Entendido',
        })
      }
    } finally {
      setIsLoading(false)
    }
  }, [canGenerarRankingUsuarios, anoMejor])

  const handleDescargarExcel = useCallback(async () => {
    if (!canDescargarRankingUsuarios) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para descargar este reporte.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    const tienePermiso = await verificarAccionEnServidor('btn_descargar_ranking_usuarios')
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
  }, [canDescargarRankingUsuarios, excelLink, verificarAccionEnServidor])

  const handleReset = useCallback(() => {
    setAnoMejor('')
    setUsuarios([])
    setExcelLink(null)
    setHaBuscado(false)
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
    haBuscado,
    canGenerarRankingUsuarios,
    canDescargarRankingUsuarios,
    verificarAccionEnServidor,
  }
}

export const useReporteMejoresUsuarios = useReporteMejores
export default useReporteMejores
