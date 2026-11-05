import { useState, useCallback } from 'react'
import Swal from 'sweetalert2'
import { listarLibros, getLibros, BuscarLibros } from '@/Service/rco/Libros'
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

    setHaBuscado(true)
    setLibros([])
    setExcelLink(null)

    try {
      let rawItems: any[] = []
      let excelPath: string | null = null

      // 1. Intento principal con listarLibros (/v1/libros/librosC)
      try {
        const data = await listarLibros()
        if (Array.isArray(data?.data)) {
          rawItems = data.data
        } else if (Array.isArray(data)) {
          rawItems = data
        } else if (Array.isArray(data?.libros)) {
          rawItems = data.libros
        }
        excelPath = data?.excel_path || null
      } catch (err) {
        console.warn('[useReporteLibrosSistema] Falló /librosC, intentando fallback:', err)
      }

      // 2. Si /librosC vino vacío o falló, consultar con BuscarLibros o getLibros
      if (rawItems.length === 0) {
        try {
          const fallbackData = await BuscarLibros('', 1, 1000)
          if (Array.isArray(fallbackData?.data)) {
            rawItems = fallbackData.data
          } else if (Array.isArray(fallbackData)) {
            rawItems = fallbackData
          }
          if (!excelPath) excelPath = fallbackData?.excel_path || null
        } catch (err2) {
          console.warn('[useReporteLibrosSistema] Falló /librosNew, intentando getLibros:', err2)
          try {
            const getLibrosData = await getLibros()
            if (Array.isArray(getLibrosData?.data)) {
              rawItems = getLibrosData.data
            } else if (Array.isArray(getLibrosData)) {
              rawItems = getLibrosData
            }
          } catch (err3) {
            console.error('[useReporteLibrosSistema] Fallaron todos los endpoints de libros:', err3)
          }
        }
      }

      // 3. Normalizar libros para que todos los campos coincidan con la tabla
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
        .sort((a, b) => Number(a.ID_LIBROS || 0) - Number(b.ID_LIBROS || 0))

      setLibros(ordenados)
      setExcelLink(excelPath)

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
      await descargarArchivo(`${STORAGE_BASE_URL}/${excelLink}`)
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
