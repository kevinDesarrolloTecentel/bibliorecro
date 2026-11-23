import { useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Swal from 'sweetalert2'
import { RootState, AppDispatch } from '@/store'
import { STORAGE_BASE_URL, descargarArchivo } from '@/utils/imageUtils'
import { librosBaja } from '@/Service/rco/Libros'
import { usePermissions } from '@/hooks/auth/usePermissions'
import {
  setReporteActivo,
  limpiarReporte,
  LibroInventarioItem,
} from '@/slices/reporteSlice'

export { STORAGE_BASE_URL, descargarArchivo }
export type { LibroInventarioItem }

export const useReporteLibrosBaja = () => {
  const dispatch = useDispatch<AppDispatch>()
  const reporteState = useSelector((state: RootState) => state.reportes)

  const [anoBaja, setAnoBaja] = useState<string>('')
  const [libros, setLibros] = useState<LibroInventarioItem[]>([])
  const [excelLink, setExcelLink] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [haBuscado, setHaBuscado] = useState<boolean>(false)

  const { canDoAction, verificarAccionEnServidor } = usePermissions()
  const canGenerarLibrosBaja = canDoAction('btn_generar_libros_baja')
  const canDescargarLibrosBaja = canDoAction('btn_descargar_libros_baja')

  const handleGetLibrosBaja = useCallback(async () => {
    if (!canGenerarLibrosBaja) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para generar este reporte.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    if (!anoBaja.trim()) {
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

    const tienePermiso = await verificarAccionEnServidor('btn_generar_libros_baja')
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

    setLibros([])
    setExcelLink(null)
    dispatch(limpiarReporte())

    try {
      const params = {
        fechaMes: anoBaja.trim(),
      }
      const data = await librosBaja(params)
      const rawList = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.libros)
          ? data.libros
          : Array.isArray(data)
            ? data
            : []

      const librosFiltrados: LibroInventarioItem[] = rawList
        .filter((item: any) => item.ESTADO_LIBRO !== 1)
        .map((item: any) => ({
          ...item,
          ID_LIBROS: item.ID_LIBROS,
          ISBN_LIBROS: item.ISBN_LIBROS,
          TITULO_LIBROS: item.TITULO_LIBROS,
          CODIGODEBARRAS_LIBROS: item.CODIGODEBARRAS_LIBROS,
          TITULOTEJUELO_LIBROS: item.TITULOTEJUELO_LIBROS,
          AUTORTEJUELO_LIBROS: item.AUTORTEJUELO_LIBROS,
          NOMBRE_AUTOR: item.NOMBRE_AUTOR,
          NOMBRE_CATEGORIA: item.NOMBRE_CATEGORIA,
          NOMBRE_EDITORIAL: item.NOMBRE_EDITORIAL,
          PRECIO_LIBROS: item.PRECIO_LIBROS,
          FECHABAJA_LIBROS: item.FECHABAJA_LIBROS,
          MOTIVO_BAJA: item.MOTIVO_BAJA,
          ESTADO_LIBRO: item.ESTADO_LIBRO,
        }))
        .sort(
          (a: LibroInventarioItem, b: LibroInventarioItem) =>
            Number(b.ESTADO_LIBRO || 0) - Number(a.ESTADO_LIBRO || 0),
        )

      const rutaExcel: string | null = data?.excel?.nombre || data?.excel_path || null

      setLibros(librosFiltrados)
      setExcelLink(rutaExcel)
      setHaBuscado(true)

      dispatch(
        setReporteActivo({
          tipoReporte: 'libros_baja',
          archivoDescarga: rutaExcel,
          total: librosFiltrados.length,
          filtros: { anoBaja: anoBaja.trim() },
        }),
      )

      if (librosFiltrados.length === 0) {
        Swal.fire({
          icon: 'info',
          title: 'Sin libros encontrados',
          text: 'No se encontraron libros dados de baja para el año seleccionado.',
          confirmButtonColor: '#044c8c',
          confirmButtonText: 'Entendido',
        })
      }
    } catch (error: any) {
      setHaBuscado(true)
      console.error('Error al obtener libros dados de baja', error)
      setLibros([])
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
          title: 'Sin libros encontrados',
          text: 'No se encontraron libros dados de baja para el año seleccionado.',
          confirmButtonColor: '#044c8c',
          confirmButtonText: 'Entendido',
        })
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error al consultar',
          text: 'Hubo un problema al obtener los datos de libros dados de baja. Por favor, inténtelo de nuevo más tarde.',
          confirmButtonColor: '#dc3545',
          confirmButtonText: 'Entendido',
        })
      }
    } finally {
      setIsLoading(false)
    }
  }, [canGenerarLibrosBaja, anoBaja, verificarAccionEnServidor, dispatch])

  const handleDescargarExcel = useCallback(async () => {
    if (!canDescargarLibrosBaja) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para descargar este reporte.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    const tienePermiso = await verificarAccionEnServidor('btn_descargar_libros_baja')
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
      await descargarArchivo(`${STORAGE_BASE_URL}/libros/${downloadLink}`)
    }
  }, [canDescargarLibrosBaja, excelLink, reporteState.archivoDescarga, verificarAccionEnServidor])

  const handleReset = useCallback(() => {
    setAnoBaja('')
    setLibros([])
    setExcelLink(null)
    setHaBuscado(false)
    dispatch(limpiarReporte())
  }, [dispatch])

  return {
    anoBaja,
    setAnoBaja,
    libros,
    isLoading,
    excelLink,
    haBuscado,
    handleGetLibrosBaja,
    handleDescargarExcel,
    handleReset,
    canGenerarLibrosBaja,
    canDescargarLibrosBaja,
    verificarAccionEnServidor,
  }
}

export default useReporteLibrosBaja
