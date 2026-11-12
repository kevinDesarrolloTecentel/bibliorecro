import { useState, useCallback, useEffect } from 'react'
import Swal from 'sweetalert2'
import { librosPorCategoria } from '@/Service/rco/Libros'
import { CatLibros } from '@/Service/rco/CatLib'
import { STORAGE_BASE_URL, descargarArchivo } from '@/utils/imageUtils'
import { usePermissions } from '@/context/PermissionsContext'

export { STORAGE_BASE_URL, descargarArchivo }

import { LibroInventarioItem, CategoriaOption } from '@/models/reportes/inventario'

export type { LibroInventarioItem, CategoriaOption }

export const useReporteLibrosCategoria = () => {
  const { canDoAction, verificarAccionEnServidor } = usePermissions()
  const canGenerarLibrosCategoria = canDoAction('btn_generar_libros_categoria')
  const canDescargarLibrosCategoria = canDoAction('btn_descargar_libros_categoria')

  const [categorias, setCategorias] = useState<CategoriaOption[]>([])
  const [selectedValue, setSelectedValue] = useState<CategoriaOption | null>(null)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [libros, setLibros] = useState<LibroInventarioItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [excelLink, setExcelLink] = useState<string | null>(null)
  const [haBuscado, setHaBuscado] = useState<boolean>(false)

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const res = await CatLibros()
        const raw: any[] = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []

        const optionsData: CategoriaOption[] = raw
          .filter((cat: any) => cat.ID_CATEGORIA || cat.id)
          .map((cat: any) => ({
            label: cat.NOMBRE_CATEGORIA || cat.nombre || cat.name,
            value: cat.ID_CATEGORIA || cat.id,
          }))
        setCategorias(optionsData)
      } catch (error) {
        console.error('Error al cargar categorías:', error)
      }
    }

    fetchCategorias()
  }, [])

  const handleGetLibrosCategoria = useCallback(async () => {
    if (!canGenerarLibrosCategoria) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para generar este reporte.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    if (!selectedValue || !selectedValue.value) {
      Swal.fire({
        icon: 'warning',
        title: 'Campo requerido',
        text: 'Por favor, seleccione una categoría.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    setIsLoading(true)

    const tienePermiso = await verificarAccionEnServidor('btn_generar_libros_categoria')
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
        generoId: selectedValue.value,
      }
      const data = await librosPorCategoria(params)
      const rawData: LibroInventarioItem[] = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
      const ordenados = rawData.sort(
        (a, b) => Number(a.ID_LIBROS || 0) - Number(b.ID_LIBROS || 0),
      )
      setLibros(ordenados)
      const rutaExcel: string | null = data?.excel?.nombre || data?.excel_path || null
      setExcelLink(rutaExcel)      
      setHaBuscado(true)

      if (ordenados.length === 0) {
        Swal.fire({
          icon: 'info',
          title: 'Sin libros encontrados',
          text: `No se encontraron libros para la categoría "${selectedValue.label || ''}".`,
          confirmButtonColor: '#044c8c',
          confirmButtonText: 'Entendido',
        })
      }
    } catch (error: any) {
      setHaBuscado(true)
      console.error('Error al obtener libros por categoría:', error)
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
          text: `No se encontraron libros para la categoría "${selectedValue.label || ''}".`,
          confirmButtonColor: '#044c8c',
          confirmButtonText: 'Entendido',
        })
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error al consultar',
          text: 'No se pudieron obtener los libros de la categoría seleccionada. Por favor, inténtelo de nuevo más tarde.',
          confirmButtonColor: '#dc3545',
          confirmButtonText: 'Entendido',
        })
      }
    } finally {
      setIsLoading(false)
    }
  }, [canGenerarLibrosCategoria, selectedValue, verificarAccionEnServidor])

  const handleDescargarExcel = useCallback(async () => {
    if (!canDescargarLibrosCategoria) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para descargar este reporte.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    const tienePermiso = await verificarAccionEnServidor('btn_descargar_libros_categoria')
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
      await descargarArchivo(`${STORAGE_BASE_URL}/prestamos/${excelLink}`)
    }
  }, [canDescargarLibrosCategoria, excelLink, verificarAccionEnServidor])

  const handleReset = useCallback(() => {
    setSelectedValue(null)
    setSearchTerm('')
    setLibros([])
    setExcelLink(null)
    setHaBuscado(false)
  }, [])

  return {
    categorias,
    selectedValue,
    setSelectedValue,
    searchTerm,
    setSearchTerm,
    libros,
    isLoading,
    excelLink,
    haBuscado,
    handleGetLibrosCategoria,
    handleDescargarExcel,
    handleReset,
    canGenerarLibrosCategoria,
    canDescargarLibrosCategoria,
    verificarAccionEnServidor,
  }
}

export default useReporteLibrosCategoria
