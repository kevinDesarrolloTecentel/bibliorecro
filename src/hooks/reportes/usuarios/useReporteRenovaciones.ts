import { useState, useCallback } from 'react'
import Swal from 'sweetalert2'
import { PersonasRenovacionesReport } from '@/Service/tab/Persona'
import { STORAGE_BASE_URL, descargarArchivo } from '@/utils/imageUtils'
import { usePermissions } from '@/context/PermissionsContext'

export { STORAGE_BASE_URL, descargarArchivo }

import { PersonaReporteItem } from '@/models/reportes/usuarios'

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
    genero: genero,
    // Alias directos para las columnas y el ordenamiento de CSmartTable
    cedula: identificacion,
    nombre: nombre,
    apellido: apellido,
    correo: correo,
    fechaNacimiento: fecha,
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
  const { canDoAction, verificarAccionEnServidor } = usePermissions()
  const canGenerarRenovacionesUsuario = canDoAction('btn_generar_renovaciones_usuario')
  const canDescargarRenovacionesUsuario = canDoAction('btn_descargar_renovaciones_usuario')

  const [diaRegistro, setDiaRegistro] = useState<string>('')
  const [mesRegistro, setMesRegistro] = useState<string>('')
  const [anoRegistro, setAnoRegistro] = useState<string>('')
  const [usuarios, setUsuarios] = useState<PersonaReporteItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [excelLink, setExcelLink] = useState<string | null>(null)
  const [haBuscado, setHaBuscado] = useState<boolean>(false)

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

    try {
      const params: Record<string, any> = {
        mesRegistro,
        anoRegistro,
        diaRegistro,
      }

      const data = await PersonasRenovacionesReport(params)
      const rawList = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
      const personasNormalizadas = rawList.map(normalizarRenovacion)
      const personasFiltradas = personasNormalizadas
        .filter((item: PersonaReporteItem) => item.ESTADO_RENOVACIONES === undefined || item.ESTADO_RENOVACIONES === 1 || item.tipo_usuario === 'Renovacion')
        .sort((a: PersonaReporteItem, b: PersonaReporteItem) => (Number(a.EDAD_PERSONA) || 0) - (Number(b.EDAD_PERSONA) || 0))

      setUsuarios(personasFiltradas)
      const rutaExcel: string | null = data?.excel?.nombre || data?.excel_path || null
      setExcelLink(rutaExcel)      
      setHaBuscado(true)


      if (personasFiltradas.length === 0) {
        Swal.fire({
          icon: 'info',
          title: 'Sin renovaciones',
          text: 'No se encontraron renovaciones registradas en la fecha seleccionada.',
          confirmButtonColor: '#044c8c',
          confirmButtonText: 'Entendido',
        })
      }
    } catch (error: any) {
      setHaBuscado(true)

      console.error('Error al obtener renovaciones', error)
      const respData = error?.response?.data
      const errStr = typeof respData === 'string' ? respData : JSON.stringify(respData || '')
      const errorMsg = error?.response?.data?.message || error?.message || ''

      const isZeroResultsError =
        error?.response?.status === 404 ||
        (error?.response?.status === 500 &&
          (errStr.includes('PersonasExport') || errStr.includes('toArray() on null'))) ||
        errorMsg.toLowerCase().includes('no existe') ||
        errorMsg.toLowerCase().includes('no se encontr') ||
        errorMsg.toLowerCase().includes('sin registros') ||
        errStr.toLowerCase().includes('no existe') ||
        errStr.toLowerCase().includes('no se encontr')

      const isBackendSchemaError =
        error?.response?.status === 500 &&
        (errStr.includes('ID_RENOVACION') || errStr.includes('Column not found'))

      if (isZeroResultsError) {
        setUsuarios([])
        setExcelLink(null)
        Swal.fire({
          icon: 'info',
          title: 'Sin renovaciones',
          text: 'No se encontraron renovaciones registradas en la fecha seleccionada.',
          confirmButtonColor: '#044c8c',
          confirmButtonText: 'Entendido',
        })
      } else if (isBackendSchemaError) {
        setUsuarios([])
        setExcelLink(null)
        Swal.fire({
          icon: 'warning',
          title: 'Servicio en revisión',
          text: 'El reporte de renovaciones está en mantenimiento en el servidor. Por favor, comuníquese con el administrador.',
          confirmButtonColor: '#dc3545',
          confirmButtonText: 'Entendido',
        })
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error al consultar',
          text: 'Hubo un problema al obtener las renovaciones.',
          confirmButtonColor: '#dc3545',
          confirmButtonText: 'Entendido',
        })
      }
    } finally {
      setIsLoading(false)
    }
  }, [canGenerarRenovacionesUsuario, diaRegistro, mesRegistro, anoRegistro])

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

    if (excelLink) {
      await descargarArchivo(`${STORAGE_BASE_URL}/personas/${excelLink}`)
    }
  }, [canDescargarRenovacionesUsuario, excelLink, verificarAccionEnServidor])

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
    handleGetRenovaciones,
    handleDescargarExcel,
    handleReset,
    canGenerarRenovacionesUsuario,
    canDescargarRenovacionesUsuario,
    verificarAccionEnServidor,
  }
}

export default useReporteRenovaciones
