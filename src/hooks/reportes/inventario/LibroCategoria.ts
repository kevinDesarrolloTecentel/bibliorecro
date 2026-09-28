import { useState, useCallback, useEffect } from 'react'
import Swal from 'sweetalert2'
import { librosPorCategoria } from '@/Service/rco/libros'
import { CatLibros } from '@/Service/rco/CatLib'
import apiClient, { BACKEND_API_BASE } from '@/Service/apiClient'
import { STORAGE_BASE_URL } from '@/.env'

export { STORAGE_BASE_URL }

export interface LibroInventarioItem {
  ID_LIBROS?: number | string
  ISBN_LIBROS?: string
  TITULO_LIBROS?: string
  CODIGODEBARRAS_LIBROS?: string
  PRECIO_LIBROS?: number | string
  TITULOTEJUELO_LIBROS?: string
  AUTORTEJUELO_LIBROS?: string
  ESTADOINSCRIPCION_PERSONA?: number
  [key: string]: any
}

export interface CategoriaOption {
  label: string
  value: number | string
}

export const useReporteLibrosCategoria = () => {
  const [categorias, setCategorias] = useState<CategoriaOption[]>([])
  const [selectedValue, setSelectedValue] = useState<CategoriaOption | null>(null)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [libros, setLibros] = useState<LibroInventarioItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [excelLink, setExcelLink] = useState<string | null>(null)

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        let raw: any[] = []
        try {
          const res = await CatLibros()
          raw = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []
        } catch {
          const res = await apiClient.get(`${BACKEND_API_BASE}/categorias`)
          raw = Array.isArray(res?.data) ? res.data : []
        }

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
    if (!selectedValue || !selectedValue.value) {
      Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: false,
      }).fire({
        icon: 'warning',
        title: 'Por favor, seleccione una categoría',
      })
      return
    }

    setIsLoading(true)
    try {
      const params = {
        generoId: selectedValue.value,
        idCategoria: selectedValue.value,
        categoriaId: selectedValue.value,
      }
      const data = await librosPorCategoria(params)
      const rawData: LibroInventarioItem[] = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
      const ordenados = rawData.sort(
        (a, b) => Number(a.ID_LIBROS || 0) - Number(b.ID_LIBROS || 0),
      )
      setLibros(ordenados)
      setExcelLink(data?.excel_path || null)
    } catch (error: any) {
      console.error('Error al obtener libros por categoría:', error)
      Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: false,
      }).fire({
        icon: 'error',
        title: 'Error!',
        text: error?.response?.data?.message || 'No se pudieron obtener los libros de la categoría seleccionada.',
      })
      setLibros([])
      setExcelLink(null)
    } finally {
      setIsLoading(false)
    }
  }, [selectedValue])

  const handleDescargarExcel = useCallback(() => {
    if (excelLink) {
      window.open(`${STORAGE_BASE_URL}/${excelLink}`, '_blank')
    }
  }, [excelLink])

  const handleReset = useCallback(() => {
    setSelectedValue(null)
    setSearchTerm('')
    setLibros([])
    setExcelLink(null)
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
    handleGetLibrosCategoria,
    handleDescargarExcel,
    handleReset,
  }
}

export default useReporteLibrosCategoria
