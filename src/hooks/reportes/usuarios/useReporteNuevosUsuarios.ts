import { useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Swal from 'sweetalert2'
import { RootState, AppDispatch } from '@/store'
import { PersonasNuevasReport } from '@/Service/tab/Persona'
import { STORAGE_BASE_URL, descargarArchivo } from '@/utils/imageUtils'
import { usePermissions } from '@/hooks/auth/usePermissions'
import {
  setReporteActivo,
  limpiarReporte,
  PersonaReporteItem,
} from '@/slices/reporteSlice'

export { STORAGE_BASE_URL, descargarArchivo }
export type { PersonaReporteItem }

export const useReporteNuevosUsuarios = () => {
  const dispatch = useDispatch<AppDispatch>()
  const reporteState = useSelector((state: RootState) => state.reportes)

  const [usuarios, setUsuarios] = useState<PersonaReporteItem[]>([])
  const [excelLink, setExcelLink] = useState<string | null>(null)
  const [diaRegistro, setDiaRegistro] = useState<string>('')
  const [mesRegistro, setMesRegistro] = useState<string>('')
  const [anoRegistro, setAnoRegistro] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [haBuscado, setHaBuscado] = useState<boolean>(false)

  const { canDoAction, verificarAccionEnServidor } = usePermissions()
  const canGenerarNuevosUsuarios = canDoAction('btn_generar_nuevos_usuarios')
  const canDescargarNuevosUsuarios = canDoAction('btn_descargar_nuevos_usuarios')

  const handleGetNuevosUsuarios = useCallback(async () => {
    if (!canGenerarNuevosUsuarios) {
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
        text: 'Por favor, seleccione una fecha.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    setIsLoading(true)

    const tienePermiso = await verificarAccionEnServidor('btn_generar_nuevos_usuarios')
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
      const params: Record<string, any> = {
        mesRegistro,
        anoRegistro,
        diaRegistro,
      }

      const data = await PersonasNuevasReport(params)
      if (data?.error) {
        Swal.fire({
          icon: 'info',
          title: 'Sin nuevos usuarios',
          text: data.error,
          confirmButtonColor: '#044c8c',
          confirmButtonText: 'Entendido',
        })
        setUsuarios([])
        setExcelLink(null)
        setHaBuscado(true)
        dispatch(limpiarReporte())
      } else {
        const rawList = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
        const ordenados = [...rawList].sort(
          (a: PersonaReporteItem, b: PersonaReporteItem) => (a.EDAD_PERSONA || 0) - (b.EDAD_PERSONA || 0),
        )

        const rutaExcel: string | null = data?.excel?.nombre || data?.excel_path || null

        setUsuarios(ordenados)
        setExcelLink(rutaExcel)
        setHaBuscado(true)

        dispatch(
          setReporteActivo({
            tipoReporte: 'usuarios_nuevos',
            archivoDescarga: rutaExcel,
            total: ordenados.length,
            filtros: { diaRegistro, mesRegistro, anoRegistro },
          }),
        )

        if (ordenados.length === 0) {
          Swal.fire({
            icon: 'info',
            title: 'Sin nuevos usuarios',
            text: 'No se encontraron nuevos usuarios registrados en la fecha seleccionada.',
            confirmButtonColor: '#044c8c',
            confirmButtonText: 'Entendido',
          })
        }
      }
    } catch (error: any) {
      setHaBuscado(true)
      console.error('Error al obtener nuevos usuarios:', error)
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
          title: 'Sin nuevos usuarios',
          text: 'No se encontraron nuevos usuarios registrados en la fecha seleccionada.',
          confirmButtonColor: '#044c8c',
          confirmButtonText: 'Entendido',
        })
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error al consultar',
          text: 'Hubo un problema al consultar los nuevos usuarios. Por favor, inténtelo de nuevo más tarde.',
          confirmButtonColor: '#dc3545',
          confirmButtonText: 'Entendido',
        })
      }
    } finally {
      setIsLoading(false)
    }
  }, [diaRegistro, mesRegistro, anoRegistro, canGenerarNuevosUsuarios, verificarAccionEnServidor, dispatch])

  const handleDescargarExcel = useCallback(async () => {
    if (!canDescargarNuevosUsuarios) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para descargar este reporte.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    const tienePermiso = await verificarAccionEnServidor('btn_descargar_nuevos_usuarios')
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
  }, [canDescargarNuevosUsuarios, excelLink, reporteState.archivoDescarga, verificarAccionEnServidor])

  const handleReset = useCallback(() => {
    setDiaRegistro('')
    setMesRegistro('')
    setAnoRegistro('')
    setUsuarios([])
    setExcelLink(null)
    setHaBuscado(false)
    dispatch(limpiarReporte())
  }, [dispatch])

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
    canGenerarNuevosUsuarios,
    canDescargarNuevosUsuarios,
    verificarAccionEnServidor,
  }
}

export default useReporteNuevosUsuarios
