import { useState, useCallback } from 'react'
import Swal from 'sweetalert2'
import { listarLibros } from '@/Service/rco/Libros'
import { STORAGE_BASE_URL, descargarArchivo } from '@/utils/imageUtils'
import { usePermissions } from '@/context/PermissionsContext'

export { STORAGE_BASE_URL, descargarArchivo }

import { LibroInventarioItem } from '@/models/reportes/inventario'

export type { LibroInventarioItem }

export const useReporteLibrosSistema = () => {
  const { canDoAction, verificarAccionEnServidor } = usePermissions()
  const canGenerarLibrosSistema = canDoAction('btn_generar_libros_sistema')
  const canDescargarLibrosSistema = canDoAction('btn_descargar_libros_sistema')

  const [libros, setLibros] = useState<LibroInventarioItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [excelLink, setExcelLink] = useState<string | null>(null)
  const [haBuscado, setHaBuscado] = useState<boolean>(false)

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
        .map((item: any, idx: number) => ({
          ...item,
          id: item.ID_LIBROS ?? item.id ?? idx + 1,
          ID_LIBROS: item.ID_LIBROS ?? item.id ?? idx + 1,
          ISBN_LIBROS: item.ISBN_LIBROS || item.isbn || 'S/N',
          TITULO_LIBROS: item.TITULO_LIBROS || item.titulo || item.Titulo || 'Sin título',
          CODIGODEBARRAS_LIBROS:
            item.CODIGODEBARRAS_LIBROS || item.codigo || item.CodigoBarras || item.CODIGO_LIBRO || 'S/C',
          TITULOTEJUELO_LIBROS: item.TITULOTEJUELO_LIBROS || item.titulo_tejuelo || '-',
          AUTORTEJUELO_LIBROS: item.AUTORTEJUELO_LIBROS || item.autor_tejuelo || '-',
          NOMBRE_AUTOR: item.NOMBRE_AUTOR || item.autor || item.Autor || 'Sin autor',
          NOMBRE_CATEGORIA: item.NOMBRE_CATEGORIA || item.categoria || item.Categoria || 'Sin categoría',
          NOMBRE_EDITORIAL: item.NOMBRE_EDITORIAL || item.editorial || item.Editorial || 'Sin editorial',
          PRECIO_LIBROS: item.PRECIO_LIBROS ?? item.precio ?? '-',
        }))
        .sort((a, b) => {
          const fechaA = a.FECHAINGRESO_LIBROS || a.fechaIngreso || a.created_at || ''
          const fechaB = b.FECHAINGRESO_LIBROS || b.fechaIngreso || b.created_at || ''
          if (fechaA && fechaB && fechaA !== fechaB) {
            const timeA = new Date(fechaA).getTime()
            const timeB = new Date(fechaB).getTime()
            if (!isNaN(timeA) && !isNaN(timeB) && timeA !== timeB) {
              return timeB - timeA
            }
          }
          const idA = Number(a.ID_LIBROS ?? a.id ?? 0)
          const idB = Number(b.ID_LIBROS ?? b.id ?? 0)
          return idB - idA
        })

      setLibros(ordenados)
      const rutaExcel: string | null = data?.excel?.nombre || data?.excel_path || null
      setExcelLink(rutaExcel)
      setHaBuscado(true)

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
          text:  'No se encontraron libros registrados en el sistema.',
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
  }, [canGenerarLibrosSistema, verificarAccionEnServidor])

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

    if (excelLink) {
      await descargarArchivo(`${STORAGE_BASE_URL}/libros/${excelLink}`)

    }
  }, [canDescargarLibrosSistema, excelLink, verificarAccionEnServidor])

  const handleReset = useCallback(() => {
    setLibros([])
    setExcelLink(null)
    setHaBuscado(false)
  }, [])

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
