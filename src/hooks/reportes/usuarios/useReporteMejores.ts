import { useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Swal from 'sweetalert2'
import { RootState, AppDispatch } from '@/store'
import { PersonasMejoresReport } from '@/Service/tab/Persona'
import { STORAGE_BASE_URL, descargarArchivo } from '@/utils/imageUtils'
import { usePermissions } from '@/hooks/auth/usePermissions'
import {
  setReporteActivo,
  limpiarReporte,
  PersonaReporteItem,
} from '@/slices/reporteSlice'

export { STORAGE_BASE_URL, descargarArchivo }
export type { PersonaReporteItem }

export const useReporteMejores = () => {
  const dispatch = useDispatch<AppDispatch>()
  const reporteState = useSelector((state: RootState) => state.reportes)

  const [usuarios, setUsuarios] = useState<PersonaReporteItem[]>([])
  const [excelLink, setExcelLink] = useState<string | null>(null)
  const [anoMejor, setAnoMejor] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [haBuscado, setHaBuscado] = useState<boolean>(false)

  const { canDoAction, verificarAccionEnServidor } = usePermissions()
  const canGenerarRankingUsuarios = canDoAction('btn_generar_ranking_usuarios')
  const canDescargarRankingUsuarios = canDoAction('btn_descargar_ranking_usuarios')

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

    setUsuarios([])
    setExcelLink(null)
    dispatch(limpiarReporte())

    try {
      const params = {
        anoMejor: anio,
      }

      const data = await PersonasMejoresReport(params)
      const rawList = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []

      const personasFiltradas: PersonaReporteItem[] = rawList
        .filter((item: PersonaReporteItem) => item.ESTADOINSCRIPCION_PERSONA !== 1)
        .map((item: any) => ({
          ...item,
          ID_PERSONA: item.ID_PERSONA,
          IDENTIFICACION_PERSONA: item.IDENTIFICACION_PERSONA,
          NOMBRE_PERSONA: item.NOMBRE_PERSONA,
          APELLIDO_PERSONA: item.APELLIDO_PERSONA,
          CELULAR_PERSONA: item.CELULAR_PERSONA,
          CORREO_PERSONA: item.CORREO_PERSONA,
          EDAD_PERSONA: item.EDAD_PERSONA,
          NOMBRE_GENERO: item.NOMBRE_GENERO,
          CANTIDAD_PRESTAMOS: item.CANTIDAD_PRESTAMOS ?? item.cantidad_prestamos,
          TOTAL_PRESTAMOS: item.TOTAL_PRESTAMOS ?? item.total_prestamos,
        }))
        .sort(
          (a: PersonaReporteItem, b: PersonaReporteItem) =>
            Number(b.CANTIDAD_PRESTAMOS || 0) - Number(a.CANTIDAD_PRESTAMOS || 0),
        )

      const rutaExcel: string | null = data?.excel?.nombre || data?.excel_path || null

      setUsuarios(personasFiltradas)
      setExcelLink(rutaExcel)
      setHaBuscado(true)

      dispatch(
        setReporteActivo({
          tipoReporte: 'usuarios_mejores',
          archivoDescarga: rutaExcel,
          total: personasFiltradas.length,
          filtros: { anoMejor: anio },
        }),
      )

      if (personasFiltradas.length === 0) {
        Swal.fire({
          icon: 'info',
          title: 'Sin registros',
          text: 'No se encontraron usuarios en el ranking para el año seleccionado.',
          confirmButtonColor: '#044c8c',
          confirmButtonText: 'Entendido',
        })
      }
    } catch (error: any) {
      setHaBuscado(true)
      console.error('Error al obtener ranking de mejores usuarios:', error)
      setUsuarios([])
      setExcelLink(null)
      dispatch(limpiarReporte())
      const respData = error?.response?.data
      const errStr = typeof respData === 'string' ? respData : JSON.stringify(respData || '')
      const errorMsg = error?.response?.data?.message || error?.message || ''
      const isNotFound =
        error?.response?.status === 404 ||
        (error?.response?.status === 500 && (errStr.includes('toArray() on null') || errStr.includes('PersonasExport'))) ||
        errorMsg.toLowerCase().includes('no existe') ||
        errorMsg.toLowerCase().includes('no se encontr') ||
        errorMsg.toLowerCase().includes('sin registros') ||
        errStr.toLowerCase().includes('no existe') ||
        errStr.toLowerCase().includes('no se encontr')

      if (isNotFound) {
        Swal.fire({
          icon: 'info',
          title: 'Sin registros',
          text: 'No se encontraron usuarios en el ranking para el año seleccionado.',
          confirmButtonColor: '#044c8c',
          confirmButtonText: 'Entendido',
        })
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error al consultar',
          text: 'Hubo un problema al consultar el ranking de usuarios. Por favor, inténtelo de nuevo más tarde.',
          confirmButtonColor: '#dc3545',
          confirmButtonText: 'Entendido',
        })
      }
    } finally {
      setIsLoading(false)
    }
  }, [anoMejor, canGenerarRankingUsuarios, verificarAccionEnServidor, dispatch])

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

    const downloadLink = excelLink || reporteState.archivoDescarga
    if (downloadLink) {
      await descargarArchivo(`${STORAGE_BASE_URL}/personas/${downloadLink}`)
    }
  }, [canDescargarRankingUsuarios, excelLink, reporteState.archivoDescarga, verificarAccionEnServidor])

  const handleReset = useCallback(() => {
    setAnoMejor('')
    setUsuarios([])
    setExcelLink(null)
    setHaBuscado(false)
    dispatch(limpiarReporte())
  }, [dispatch])

  return {
    anoMejor,
    setAnoMejor,
    usuarios,
    isLoading,
    excelLink,
    haBuscado,
    handleGetMejores,
    handleDescargarExcel,
    handleReset,
    canGenerarRankingUsuarios,
    canDescargarRankingUsuarios,
    verificarAccionEnServidor,
  }
}

export default useReporteMejores
export const useReporteMejoresUsuarios = useReporteMejores
