import { useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Swal from 'sweetalert2'
import { RootState, AppDispatch } from '@/store'
import { PersonasRenovacionesReport } from '@/Service/tab/Persona'
import { STORAGE_BASE_URL, descargarArchivo } from '@/utils/imageUtils'
import { usePermissions } from '@/hooks/auth/usePermissions'
import {
  setReporteActivo,
  limpiarReporte,
  PersonaReporteItem,
} from '@/slices/reporteSlice'

export { STORAGE_BASE_URL, descargarArchivo }
export type { PersonaReporteItem }

export const normalizarRenovacion = (item: any): PersonaReporteItem => {
  if (!item) return {}
  const persona = item.PERSONA || item.persona || {}
  const renovaciones = Array.isArray(item.RENOVACIONES)
    ? item.RENOVACIONES
    : Array.isArray(item.renovaciones)
      ? item.renovaciones
      : []
  const primeraRenovacion = renovaciones[0] || {}

  const identificacion = persona.IDENTIFICACION_PERSONA || item.IDENTIFICACION_PERSONA || ''
  const nombre = persona.NOMBRE_PERSONA || item.NOMBRE_PERSONA || ''
  const apellido = persona.APELLIDO_PERSONA || item.APELLIDO_PERSONA || ''
  const correo = persona.CORREO_PERSONA || item.CORREO_PERSONA || ''
  const fecha = persona.FECHA_PERSONA || item.FECHA_PERSONA || ''
  const telefono = persona.TELEFONO_PERSONA || item.TELEFONO_PERSONA || ''
  const celular = persona.CELULAR_PERSONA || item.CELULAR_PERSONA || ''
  const edad = item.EDAD_PERSONA ?? persona.EDAD_PERSONA
  const genero = item.NOMBRE_GENERO || persona.NOMBRE_GENERO || ''

  const inicioRenov = primeraRenovacion.FECHAINICIO_RENOVACIONES ?? item.FECHAINICIO_RENOVACIONES ?? item.FECHAINICIO_INSCRIPCION
  const finRenov = primeraRenovacion.FECHAFIN_RENOVACIONES ?? item.FECHAFIN_RENOVACIONES ?? item.FECHAFIN_INSCRIPCION
  const costoRenov = primeraRenovacion.COSTO_RENOVACIONES ?? item.COSTO_RENOVACIONES ?? item.COSTO_INSCRIPCION
  const estadoRenov = primeraRenovacion.ESTADO_RENOVACIONES ?? item.ESTADO_RENOVACIONES ?? item.ESTADO_INSCRIPCION

  return {
    ...persona,
    ...item,
    ID_PERSONA: item.ID_PERSONA ?? persona.ID_PERSONA,
    IDENTIFICACION_PERSONA: identificacion,
    NOMBRE_PERSONA: nombre,
    APELLIDO_PERSONA: apellido,
    CORREO_PERSONA: correo,
    FECHA_PERSONA: fecha,
    TELEFONO_PERSONA: telefono,
    CELULAR_PERSONA: celular,
    EDAD_PERSONA: edad,
    NOMBRE_GENERO: genero,
    RENOVACIONES: renovaciones,
    PERSONA: persona,
    FECHAINICIO_RENOVACIONES: inicioRenov,
    FECHAFIN_RENOVACIONES: finRenov,
    COSTO_RENOVACIONES: costoRenov,
    ESTADO_RENOVACIONES: estadoRenov,
    FECHAINICIO_INSCRIPCION: inicioRenov,
    FECHAFIN_INSCRIPCION: finRenov,
    COSTO_INSCRIPCION: costoRenov,
    ESTADO_INSCRIPCION: estadoRenov,
  }
}

export const useReporteRenovaciones = () => {
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
  const canGenerarRenovacionesUsuario = canDoAction('btn_generar_renovaciones_usuario')
  const canDescargarRenovacionesUsuario = canDoAction('btn_descargar_renovaciones_usuario')

  const handleGetRenovaciones = useCallback(async () => {
    if (!canGenerarRenovacionesUsuario) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para generar este reporte.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    if (!diaRegistro || !mesRegistro || !anoRegistro) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos requeridos',
        text: 'Por favor, ingrese el día, mes y año para consultar el reporte.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    setIsLoading(true)

    const tienePermiso = await verificarAccionEnServidor('btn_generar_renovaciones_usuario')
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
        diaRegistro,
        mesRegistro,
        anoRegistro,
      }

      const data = await PersonasRenovacionesReport(params)
      const rawList = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []

      const normalizados = rawList.map(normalizarRenovacion)

      const personasFiltradas = normalizados
        .filter((item: PersonaReporteItem) => item.ESTADO_RENOVACIONES === undefined || item.ESTADO_RENOVACIONES === 1 || item.tipo_usuario === 'Renovacion')
        .sort((a: PersonaReporteItem, b: PersonaReporteItem) => (Number(a.EDAD_PERSONA) || 0) - (Number(b.EDAD_PERSONA) || 0))

      const rutaExcel: string | null = data?.excel?.nombre || data?.excel_path || null

      setUsuarios(personasFiltradas)
      setExcelLink(rutaExcel)
      setHaBuscado(true)

      dispatch(
        setReporteActivo({
          tipoReporte: 'usuarios_renovaciones',
          archivoDescarga: rutaExcel,
          total: personasFiltradas.length,
          filtros: { diaRegistro, mesRegistro, anoRegistro },
        }),
      )

      if (personasFiltradas.length === 0) {
        Swal.fire({
          icon: 'info',
          title: 'Sin renovaciones encontradas',
          text: `No se encontraron renovaciones de usuarios registradas en la fecha seleccionada.`,
          confirmButtonColor: '#044c8c',
          confirmButtonText: 'Entendido',
        })
      }
    } catch (error: any) {
      setHaBuscado(true)
      console.error('Error al obtener renovaciones de usuarios:', error)
      setUsuarios([])
      setExcelLink(null)
      dispatch(limpiarReporte())
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
          title: 'Sin renovaciones encontradas',
          text: `No se encontraron renovaciones de usuarios registradas en la fecha seleccionada.`,
          confirmButtonColor: '#044c8c',
          confirmButtonText: 'Entendido',
        })
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error al consultar',
          text: error?.response?.data?.message || 'Hubo un problema al obtener las renovaciones de usuarios.',
          confirmButtonColor: '#dc3545',
          confirmButtonText: 'Entendido',
        })
      }
    } finally {
      setIsLoading(false)
    }
  }, [diaRegistro, mesRegistro, anoRegistro, canGenerarRenovacionesUsuario, verificarAccionEnServidor, dispatch])

  const handleDescargarExcel = useCallback(async () => {
    if (!canDescargarRenovacionesUsuario) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para descargar este reporte.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    const tienePermiso = await verificarAccionEnServidor('btn_descargar_renovaciones_usuario')
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
  }, [canDescargarRenovacionesUsuario, excelLink, reporteState.archivoDescarga, verificarAccionEnServidor])

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
    handleGetRenovaciones,
    handleDescargarExcel,
    handleReset,
    canGenerarRenovacionesUsuario,
    canDescargarRenovacionesUsuario,
    verificarAccionEnServidor,
  }
}

export default useReporteRenovaciones
