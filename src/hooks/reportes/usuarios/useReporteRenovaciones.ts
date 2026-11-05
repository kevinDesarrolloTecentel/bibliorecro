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
    // Alias directos para las columnas y el ordenamiento de CSmartTable
    cedula: identificacion,
    nombre: nombre,
    apellido: apellido,
    correo: correo,
    fechaNacimiento: fecha,
    RENOVACIONES: renovaciones,
    PERSONA: persona,
    FECHAINICIO_RENOVACIONES: primeraRenovacion.FECHAINICIO_RENOVACIONES ?? item.FECHAINICIO_RENOVACIONES,
    FECHAFIN_RENOVACIONES: primeraRenovacion.FECHAFIN_RENOVACIONES ?? item.FECHAFIN_RENOVACIONES,
    COSTO_RENOVACIONES: primeraRenovacion.COSTO_RENOVACIONES ?? item.COSTO_RENOVACIONES,
    ESTADO_RENOVACIONES: primeraRenovacion.ESTADO_RENOVACIONES ?? item.ESTADO_RENOVACIONES,
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

      const data = await PersonasRenovacionesReport(params)
      const rawList = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
      const personasNormalizadas = rawList.map(normalizarRenovacion)
      const personasFiltradas = personasNormalizadas
        .filter((item: PersonaReporteItem) => item.ESTADO_RENOVACIONES === undefined || item.ESTADO_RENOVACIONES === 1 || item.tipo_usuario === 'Renovacion')
        .sort((a: PersonaReporteItem, b: PersonaReporteItem) => (Number(a.EDAD_PERSONA) || 0) - (Number(b.EDAD_PERSONA) || 0))

      setUsuarios(personasFiltradas)
      setExcelLink(data?.excel_path || null)

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

    if (excelLink && excelLink !== 'local_csv') {
      await descargarArchivo(`${STORAGE_BASE_URL}/${excelLink}`)
      return
    }
    if (!usuarios.length) return
    const headers = ['Cédula', 'Nombre', 'Apellido', 'Fecha Nacimiento', 'Correo']
    const rows = usuarios.map((u) => {
      let fechaStr = '-'
      if (u.FECHA_PERSONA) {
        const d = new Date(u.FECHA_PERSONA)
        if (!isNaN(d.getTime()) && d.getFullYear() > 1900 && d.getFullYear() < 2100) {
          fechaStr = d.toLocaleDateString()
        }
      }
      return [
        `"${u.IDENTIFICACION_PERSONA || ''}"`,
        `"${u.NOMBRE_PERSONA || ''}"`,
        `"${u.APELLIDO_PERSONA || ''}"`,
        `"${fechaStr}"`,
        `"${u.CORREO_PERSONA || ''}"`,
      ]
    })
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `renovaciones_${anoRegistro}_${mesRegistro}${diaRegistro ? '_' + diaRegistro : ''}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }, [canDescargarRenovacionesUsuario, excelLink, usuarios, anoRegistro, mesRegistro, diaRegistro, verificarAccionEnServidor])

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
