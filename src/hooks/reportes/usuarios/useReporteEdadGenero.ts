import { useState, useCallback, useEffect } from 'react'
import Swal from 'sweetalert2'
import { ListarPersonaReport } from '@/Service/tab/Persona'
import { ListarGenero } from '@/Service/tab/Genero'
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

export interface GeneroOption {
  label: string
  value: number | string
}

export const useReporteUsuariosEdadGenero = () => {
  const [generos, setGeneros] = useState<GeneroOption[]>([])
  const [generoId, setGeneroId] = useState<string>('')
  const [edadDesde, setEdadDesde] = useState<string>('')
  const [edadHasta, setEdadHasta] = useState<string>('')
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
    if (!edadDesde || !edadHasta) {
      Swal.mixin({
        toast: true,
        position: 'top-end',
        timer: 2500,
        timerProgressBar: false,
        showConfirmButton: false,
      }).fire({
        icon: 'error',
        title: 'Por favor, ingrese todos los valores requeridos.',
      })
      return
    }

    if (Number(edadDesde) > Number(edadHasta)){
      Swal.mixin({
        toast: true,
        position: 'top-end',
        timer: 3000,
        timerProgressBar: false,
        showConfirmButton: false,
      }).fire({
        icon: 'warning',
        title: 'La edad mínima no puede ser mayor que la edad máxima'
      })
      return
    }

    setIsLoading(true)
    setHaBuscado(true)
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

      setUsuarios(personasFiltradas)
      setExcelLink(data?.excel_path || null)

      if (personasFiltradas.length === 0) {
        const generoSeleccionado = generos.find((g) => String(g.value) === String(generoId))?.label
        const detalleFiltro = generoSeleccionado
          ? `con el rango de edad (${edadDesde} a ${edadHasta} años) y género "${generoSeleccionado}".`
          : `con el rango de edad (${edadDesde} a ${edadHasta} años).`

        Swal.fire({
          icon: 'info',
          title: 'Sin usuarios encontrados',
          text: `No se encontraron usuarios registrados ${detalleFiltro}`,
          confirmButtonColor: '#0d6efd',
        })
      }
    } catch (error: any) {
      console.error('Error al obtener las personas por edad y género:', error)
      const respData = error?.response?.data
      const isZeroResultsError =
        error?.response?.status === 500 &&
        ((typeof respData === 'string' && (respData.includes('PersonasExport') || respData.includes('toArray() on null'))) ||
          (error?.response?.data?.message && error.response.data.message.includes('toArray() on null')))

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
          icon: 'error',
          title: 'Error!',
          text: error?.response?.data?.message || 'Hubo un problema al obtener los usuarios. Por favor, inténtelo de nuevo más tarde.',
        })
      }
    } finally {
      setIsLoading(false)
    }
  }, [edadDesde, edadHasta, generoId, generos])

  const handleDescargarExcel = useCallback(() => {
    if (excelLink) {
      window.open(`${STORAGE_BASE_URL}/${excelLink}`, '_blank')
    }
  }, [excelLink])

  const handleReset = useCallback(() => {
    setEdadDesde('')
    setEdadHasta('')
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
  }
}

export default useReporteUsuariosEdadGenero
