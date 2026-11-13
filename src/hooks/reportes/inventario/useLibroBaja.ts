import { STORAGE_BASE_URL, descargarArchivo } from "@/utils/imageUtils"
import { librosBaja } from "@/Service/rco/Libros"
import { useCallback, useState } from "react"
import Swal from "sweetalert2"
import { usePermissions } from "@/context/PermissionsContext"
import { LibroInventarioItem } from "@/models/reportes/inventario"

export type { LibroInventarioItem }

export const useReporteLibrosBaja = () => {
  const { canDoAction, verificarAccionEnServidor } = usePermissions()
  const canGenerarLibrosBaja = canDoAction('btn_generar_libros_baja')
  const canDescargarLibrosBaja = canDoAction('btn_descargar_libros_baja')

  const [anoBaja, setAnoBaja] = useState<string>('')
  const [libros, setLibros] = useState<LibroInventarioItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [excelLink, setExcelLink] = useState<string | null>(null)
  const [haBuscado, setHaBuscado] = useState<boolean>(false)

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
        .filter((item: LibroInventarioItem) => item.ESTADO_LIBRO !== 1)
        .sort(
          (a: LibroInventarioItem, b: LibroInventarioItem) =>
            Number(b.ESTADO_LIBRO || 0) - Number(a.ESTADO_LIBRO || 0),
        )

      setLibros(librosFiltrados)
      const rutaExcel: string | null = data?.excel?.nombre || data?.excel_path || null
      setExcelLink(rutaExcel)      
      setHaBuscado(true)

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
  }, [canGenerarLibrosBaja, anoBaja, verificarAccionEnServidor])

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

    if (excelLink) {
      await descargarArchivo(`${STORAGE_BASE_URL}/libros/${excelLink}`)
    }
  }, [canDescargarLibrosBaja, excelLink, verificarAccionEnServidor])

  const handleReset = useCallback(() => {
    setAnoBaja('')
    setLibros([])
    setExcelLink(null)
    setHaBuscado(false)
  }, [])

  return {
    anoBaja,
    setAnoBaja,
    handleGetLibrosBaja,
    handleDescargarExcel,
    handleReset,
    libros,
    isLoading,
    excelLink,
    haBuscado,
    canGenerarLibrosBaja,
    canDescargarLibrosBaja,
    verificarAccionEnServidor,
  }
}

export const useReporteInventario = () => {
  const baja = useReporteLibrosBaja()

  return {
    baja,
  }
}