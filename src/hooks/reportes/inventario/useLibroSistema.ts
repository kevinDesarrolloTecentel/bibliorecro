import { useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Swal from 'sweetalert2'
import { RootState, AppDispatch } from '@/store'
import { listarLibros } from '@/Service/rco/Libros'
import { STORAGE_BASE_URL, descargarArchivo } from '@/utils/imageUtils'
import { usePermissions } from '@/hooks/auth/usePermissions'
import {
  setReporteActivo,
  limpiarReporte,
  LibroInventarioItem,
} from '@/slices/reporteSlice'

export { STORAGE_BASE_URL, descargarArchivo }
export type { LibroInventarioItem }

export const useReporteLibrosSistema = () => {
  const dispatch = useDispatch<AppDispatch>()
  const reporteState = useSelector((state: RootState) => state.reportes)

  const [libros, setLibros] = useState<LibroInventarioItem[]>([])
  const [excelLink, setExcelLink] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [haBuscado, setHaBuscado] = useState<boolean>(false)

  const { canDoAction, verificarAccionEnServidor } = usePermissions()
  const canGenerarLibrosSistema = canDoAction('btn_generar_libros_sistema')
  const canDescargarLibrosSistema = canDoAction('btn_descargar_libros_sistema')

  const handleGetLibrosSistema = useCallback(async () => {
    if (!canGenerarLibrosSistema) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para generar este reporte.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    setIsLoading(true)

    const tienePermiso = await verificarAccionEnServidor('btn_generar_libros_sistema')
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
      const data = await listarLibros()
      const rawItems: any[] = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
        ? data
        : Array.isArray(data?.libros)
        ? data.libros
        : []

      const ordenados: LibroInventarioItem[] = rawItems
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
          FECHAINGRESO_LIBROS: item.FECHAINGRESO_LIBROS,
        }))
        .sort((a, b) => {
          const fechaA = a.FECHAINGRESO_LIBROS || ''
          const fechaB = b.FECHAINGRESO_LIBROS || ''
          if (fechaA && fechaB && fechaA !== fechaB) {
            const timeA = new Date(fechaA).getTime()
            const timeB = new Date(fechaB).getTime()
            if (!isNaN(timeA) && !isNaN(timeB) && timeA !== timeB) {
              return timeB - timeA
            }
          }
          const idA = Number(a.ID_LIBROS || 0)
          const idB = Number(b.ID_LIBROS || 0)
          return idB - idA
        })

      const rutaExcel: string | null = data?.excel?.nombre || data?.excel_path || null

      setLibros(ordenados)
      setExcelLink(rutaExcel)
      setHaBuscado(true)

      setLibros(ordenados)
      setExcelLink(rutaExcel)
      setHaBuscado(true)

      dispatch(
        setReporteActivo({
          tipoReporte: 'libros_sistema',
          archivoDescarga: rutaExcel,
          total: ordenados.length,
        }),
      )

      if (ordenados.length === 0) {
        Swal.fire({
          icon: 'info',
          title: 'Sin libros encontrados',
          text: 'No se encontraron libros registrados en el sistema.',
          confirmButtonColor: '#044c8c',
          confirmButtonText: 'Entendido',
        })
      }
    } catch (error: any) {
      setHaBuscado(true)
      console.error('Error al obtener libros del sistema:', error)
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
          text: 'No se encontraron libros registrados en el sistema.',
          confirmButtonColor: '#044c8c',
          confirmButtonText: 'Entendido',
        })
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error al consultar',
          text: 'Hubo un problema al consultar los libros del sistema. Por favor, inténtelo de nuevo más tarde.',
          confirmButtonColor: '#dc3545',
          confirmButtonText: 'Entendido',
        })
      }
    } finally {
      setIsLoading(false)
    }
  }, [canGenerarLibrosSistema, verificarAccionEnServidor, dispatch])

  const handleDescargarExcel = useCallback(async () => {
    if (!canDescargarLibrosSistema) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para descargar este reporte.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    const tienePermiso = await verificarAccionEnServidor('btn_descargar_libros_sistema')
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
  }, [canDescargarLibrosSistema, excelLink, reporteState.archivoDescarga, verificarAccionEnServidor])

  const handleReset = useCallback(() => {
    setLibros([])
    setExcelLink(null)
    setHaBuscado(false)
    dispatch(limpiarReporte())
  }, [dispatch])

  return {
    libros,
    isLoading,
    excelLink,
    haBuscado,
    handleGetLibrosSistema,
    handleDescargarExcel,
    handleReset,
    canGenerarLibrosSistema,
    canDescargarLibrosSistema,
    verificarAccionEnServidor,
  }
}

export default useReporteLibrosSistema
