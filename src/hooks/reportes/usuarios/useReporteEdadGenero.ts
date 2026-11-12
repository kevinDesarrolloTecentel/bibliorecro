import { useState, useCallback, useEffect } from 'react'
import Swal from 'sweetalert2'
import { ListarPersonaReport } from '@/Service/tab/Persona'
import { ListarGenero } from '@/Service/tab/Genero'
import { STORAGE_BASE_URL, descargarArchivo } from '@/utils/imageUtils'
import { usePermissions } from '@/context/PermissionsContext'

export { STORAGE_BASE_URL, descargarArchivo }

import { PersonaReporteItem, GeneroOption } from '@/models/reportes/usuarios'

export type { PersonaReporteItem, GeneroOption }

export const useReporteUsuariosEdadGenero = () => {
  const { canDoAction, verificarAccionEnServidor } = usePermissions()
  const canGenerarUsuariosInscritos = canDoAction('btn_generar_usuarios_inscritos')
  const canDescargarUsuariosInscritos = canDoAction('btn_descargar_usuarios_inscritos')

  const [generos, setGeneros] = useState<GeneroOption[]>([])
  const [generoId, setGeneroId] = useState<string>('')
  const [edadDesde, setEdadDesde] = useState<string>('1')
  const [edadHasta, setEdadHasta] = useState<string>('100')
  const [usuarios, setUsuarios] = useState<PersonaReporteItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [excelLink, setExcelLink] = useState<string | null>(null)
  const [haBuscado, setHaBuscado] = useState<boolean>(false)

  useEffect(() => {
    ListarGenero()
      .then((data: any) => {
        const raw = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
        const optionsData: GeneroOption[] = raw
          .filter((g: any) => g.ID_GENERO)
          .map((g: any) => ({
            label: g.NOMBRE_GENERO,
            value: g.ID_GENERO,
          }))
        setGeneros(optionsData)
      })
      .catch((error) => {
        console.error('Error al cargar géneros en reporte:', error)
      })
  }, [])

  const handleGet = useCallback(async () => {
    if (!canGenerarUsuariosInscritos) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para generar este reporte.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    if (edadDesde === '' || edadHasta === '' || edadDesde === undefined || edadHasta === undefined) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos requeridos',
        text: 'Por favor, ingrese el rango de edad para consultar el reporte.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    setIsLoading(true)

    const tienePermiso = await verificarAccionEnServidor('btn_generar_usuarios_inscritos')
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

    if (Number(edadDesde) > Number(edadHasta)){
      Swal.fire({
        icon: 'warning',
        title: 'Rango de edad inválido',
        text: 'La edad mínima no puede ser mayor que la edad máxima.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    setUsuarios([])
    setExcelLink(null)

    try {
      const params: Record<string, any> = {
        edadDesde,
        edadHasta,
      }
      if (generoId) {
        params.generoId = generoId
      }

      const data = await ListarPersonaReport(params)
      const rawList = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
      const personasFiltradas = rawList
        .filter((item: PersonaReporteItem) => item.ESTADOINSCRIPCION_PERSONA !== 1)
        .sort((a: PersonaReporteItem, b: PersonaReporteItem) => (a.EDAD_PERSONA || 0) - (b.EDAD_PERSONA || 0))

      let rutaExcel: string | null = data?.excel?.nombre || data?.excel_path || null

      setUsuarios(personasFiltradas)
      setExcelLink(rutaExcel)
      setHaBuscado(true)

      if (personasFiltradas.length === 0) {
        const generoSeleccionado = generos.find((g) => String(g.value) === String(generoId))?.label
        const detalleFiltro = generoSeleccionado
          ? `con el rango de edad (${edadDesde} a ${edadHasta} años) y género "${generoSeleccionado}".`
          : `con el rango de edad (${edadDesde} a ${edadHasta} años).`

        Swal.fire({
          icon: 'info',
          title: 'Sin usuarios encontrados',
          text: `No se encontraron usuarios registrados ${detalleFiltro}`,
          confirmButtonColor: '#044c8c',
          confirmButtonText: 'Entendido',
        })
      }
    } catch (error: any) {
      setHaBuscado(true)
      console.error('Error al obtener las personas por edad y género:', error)
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
        setUsuarios([])
        setExcelLink(null)
        const generoSeleccionado = generos.find((g) => String(g.value) === String(generoId))?.label
        const detalleFiltro = generoSeleccionado
          ? `con el rango de edad (${edadDesde} a ${edadHasta} años) y género "${generoSeleccionado}".`
          : `con el rango de edad (${edadDesde} a ${edadHasta} años).`

        Swal.fire({
          icon: 'info',
          title: 'Sin usuarios encontrados',
          text: `No se encontraron usuarios registrados ${detalleFiltro}`,
          confirmButtonColor: '#044c8c',
          confirmButtonText: 'Entendido',
        })
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error al consultar',
          text: error?.response?.data?.message || 'Hubo un problema al obtener los usuarios.',
          confirmButtonColor: '#dc3545',
          confirmButtonText: 'Entendido',
        })
      }
    } finally {
      setIsLoading(false)
    }
  }, [edadDesde, edadHasta, generoId, generos, canGenerarUsuariosInscritos])

  const handleDescargarExcel = useCallback(async () => {
    if (!canDescargarUsuariosInscritos) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para descargar este reporte.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    const tienePermiso = await verificarAccionEnServidor('btn_descargar_usuarios_inscritos')
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
  }, [canDescargarUsuariosInscritos, excelLink, verificarAccionEnServidor])

  const handleReset = useCallback(() => {
    setEdadDesde('1')
    setEdadHasta('100')
    setGeneroId('')
    setUsuarios([])
    setExcelLink(null)
    setHaBuscado(false)
  }, [])

  return {
    generos,
    generoId,
    setGeneroId,
    edadDesde,
    setEdadDesde,
    edadHasta,
    setEdadHasta,
    usuarios,
    isLoading,
    excelLink,
    haBuscado,
    handleGet,
    handleDescargarExcel,
    handleReset,
    canGenerarUsuariosInscritos,
    canDescargarUsuariosInscritos,
    verificarAccionEnServidor,
  }
}

export default useReporteUsuariosEdadGenero
