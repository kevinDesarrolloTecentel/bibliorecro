import { useState, useCallback } from 'react'
import Swal from 'sweetalert2'
import { PersonasNuevasReport } from '@/Service/tab/Persona'
import { STORAGE_BASE_URL, descargarArchivo } from '@/utils/imageUtils'
import { usePermissions } from '@/context/PermissionsContext'

export { STORAGE_BASE_URL, descargarArchivo }

import { PersonaReporteItem } from '@/models/reportes/usuarios'

export type { PersonaReporteItem }

export const useReporteNuevosUsuarios = () => {
  const { canDoAction, verificarAccionEnServidor } = usePermissions()
  const canGenerarNuevosUsuarios = canDoAction('btn_generar_nuevos_usuarios')
  const canDescargarNuevosUsuarios = canDoAction('btn_descargar_nuevos_usuarios')

  const [diaRegistro, setDiaRegistro] = useState<string>('')
  const [mesRegistro, setMesRegistro] = useState<string>('')
  const [anoRegistro, setAnoRegistro] = useState<string>('')
  const [usuarios, setUsuarios] = useState<PersonaReporteItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [excelLink, setExcelLink] = useState<string | null>(null)
  const [haBuscado, setHaBuscado] = useState<boolean>(false)

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
          confirmButtonColor: '#044c8c',
          confirmButtonText: 'Entendido',
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
            confirmButtonColor: '#044c8c',
            confirmButtonText: 'Entendido',
          })
        }
      }
    } catch (error: any) {
      console.error('Error al obtener nuevos usuarios', error)
      setUsuarios([])
      setExcelLink(null)
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

      if (isZeroResultsError) {
        Swal.fire({
          icon: 'info',
          title: 'Sin nuevos usuarios',
          text:  'No se encontraron nuevos usuarios registrados en la fecha seleccionada.',
          confirmButtonColor: '#044c8c',
          confirmButtonText: 'Entendido',
        })
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error al consultar',
          text:  'Hubo un problema al obtener los nuevos usuarios.',
          confirmButtonColor: '#dc3545',
          confirmButtonText: 'Entendido',
        })
      }
    } finally {
      setIsLoading(false)
    }
  }, [canGenerarNuevosUsuarios, diaRegistro, mesRegistro, anoRegistro])

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

    if (excelLink) {
      await descargarArchivo(`${STORAGE_BASE_URL}/${excelLink}`)
    }
  }, [canDescargarNuevosUsuarios, excelLink, verificarAccionEnServidor])

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
    canGenerarNuevosUsuarios,
    canDescargarNuevosUsuarios,
    verificarAccionEnServidor,
  }
}

export default useReporteNuevosUsuarios
