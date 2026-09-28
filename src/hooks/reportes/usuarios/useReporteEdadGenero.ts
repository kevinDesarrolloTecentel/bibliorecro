import { useState, useCallback, useEffect } from 'react'
import Swal from 'sweetalert2'
import { ListarPersonaReport } from '@/Service/tab/Persona'
import { ListarGenero } from '@/Service/tab/Genero'
import { STORAGE_BASE_URL } from '@/.env'

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

    setIsLoading(true)
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
    } catch (error) {
      console.error('Error al obtener las personas por edad y género:', error)
      Swal.mixin({
        toast: true,
        position: 'top-end',
        timer: 2500,
        timerProgressBar: false,
        showConfirmButton: false,
      }).fire({
        icon: 'error',
        title: 'Error!',
        text: 'Hubo un problema al obtener los usuarios. Por favor, inténtelo de nuevo más tarde.',
      })
    } finally {
      setIsLoading(false)
    }
  }, [edadDesde, edadHasta, generoId])

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
    handleGet,
    handleDescargarExcel,
    handleReset,
  }
}

export default useReporteUsuariosEdadGenero
