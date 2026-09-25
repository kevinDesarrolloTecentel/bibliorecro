import { useState, useCallback, useEffect } from 'react'
import axios from 'axios'
import Swal from 'sweetalert2'

const API_BASE_URL = 'https://bibliobackend.ccelrecreo.com:1500/server.php/api'
const STORAGE_BASE_URL = 'https://bibliobackend.ccelrecreo.com:1500/storage/app/public'

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

export const useReporteLibrosSistema = () => {
  const [libros, setLibros] = useState<LibroInventarioItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [excelLink, setExcelLink] = useState<string | null>(null)

  const handleGetLibrosSistema = useCallback(async () => {
    setIsLoading(true)
    try {
      const endpoint = `${API_BASE_URL}/librosC`
      const { data } = await axios.get(endpoint)

      const rawItems: LibroInventarioItem[] = data.data || []
      const filtrados = rawItems.filter(
        (item) => item.ESTADOINSCRIPCION_PERSONA !== 1,
      )
      const ordenados = filtrados.sort(
        (a, b) => Number(a.ID_LIBROS || 0) - Number(b.ID_LIBROS || 0),
      )

      setLibros(ordenados)
      setExcelLink(data.excel_path || null)
    } catch (error: any) {
      console.error(error)
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Hubo un problema al obtener los préstamos. Por favor, inténtelo de nuevo más tarde.',
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleDescargarExcel = useCallback(() => {
    if (excelLink) {
      window.open(`${STORAGE_BASE_URL}/${excelLink}`, '_blank')
    }
  }, [excelLink])

  const handleReset = useCallback(() => {
    setLibros([])
    setExcelLink(null)
  }, [])

  return {
    libros,
    isLoading,
    excelLink,
    handleGetLibrosSistema,
    handleDescargarExcel,
    handleReset,
  }
}

export const useReporteLibrosCategoria = () => {
  const [categorias, setCategorias] = useState<CategoriaOption[]>([])
  const [selectedValue, setSelectedValue] = useState<CategoriaOption | null>(null)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [libros, setLibros] = useState<LibroInventarioItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [excelLink, setExcelLink] = useState<string | null>(null)

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/categorias`)
      .then(({ data }) => {
        const optionsData: CategoriaOption[] = (data || []).map((cat: any) => ({
          label: cat.NOMBRE_CATEGORIA,
          value: cat.ID_CATEGORIA,
        }))
        setCategorias(optionsData)
      })
      .catch((error) => {
        console.error(error)
      })
  }, [])

  const handleGetLibrosCategoria = useCallback(async () => {
    if (!selectedValue || !selectedValue.value) {
      Swal.mixin({
        toast:true,
        position: 'top-end',
        showConfirmButton: false,
        timer:2500,
        timerProgressBar:false,
      }).fire({
        icon:'warning',
        title:'Por favor, seleccione una categoría'
      })
      return
    }

    setIsLoading(true)
    try {
      const endpoint = `${API_BASE_URL}/libroscategoria`
      const params = {
        generoId: selectedValue.value,
      }
      const { data } = await axios.get(endpoint, { params })
      const rawData: LibroInventarioItem[] = data.data || []
      const ordenados = rawData.sort(
        (a, b) => Number(a.ID_LIBROS || 0) - Number(b.ID_LIBROS || 0),
      )
      setLibros(ordenados)
      setExcelLink(data.excel_path || null)
    } catch (error: any) {
      console.error(error)
      Swal.mixin({
        toast: true,
        position:'top-end',
        showConfirmButton:false,
        timer:2500,
        timerProgressBar: false
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

export const useReporteLibrosBaja = () => {
  const [anoBaja, setAnoBaja] = useState<string>('')
  const [libros, setLibros] = useState<LibroInventarioItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [excelLink, setExcelLink] = useState<string | null>(null)

  const handleGetLibrosBaja = useCallback(async () => {
    if (!anoBaja.trim()) {
      Swal.mixin({
        toast: true,
        position:'top-end',
        timer:2500,
        timerProgressBar:false,
        showConfirmButton:false
      }).fire({
        icon: 'warning',
        title: 'Por favor, ingresa o selecciona un año.',
      })
      return
    }

    setIsLoading(true)
    try {
      const endpoint = `${API_BASE_URL}/librosbaja`
      const params = {
        fechaMes: anoBaja.trim(),
      }
      const { data } = await axios.get(endpoint, { params })
      const rawData: LibroInventarioItem[] = data.data || []
      const ordenados = rawData.sort(
        (a, b) => Number(a.ID_LIBROS || 0) - Number(b.ID_LIBROS || 0),
      )
      setLibros(ordenados)
      setExcelLink(data.excel_path || null)
    } catch (error: any) {
      console.error(error)
      Swal.mixin({
        toast:true,
        position:'top-end',
        timer:2500,
        timerProgressBar:false,
        showConfirmButton:false
      }).fire({
        icon: 'error',
        title: 'No se encontraron libros dados de baja en el año especificado.'
      })
      setLibros([])
      setExcelLink(null)
    } finally {
      setIsLoading(false)
    }
  }, [anoBaja])

  const handleDescargarExcel = useCallback(() => {
    if (excelLink) {
      window.open(`${STORAGE_BASE_URL}/${excelLink}`, '_blank')
    }
  }, [excelLink])

  const handleReset = useCallback(() => {
    setAnoBaja('')
    setLibros([])
    setExcelLink(null)
  }, [])

  return {
    anoBaja,
    setAnoBaja,
    libros,
    isLoading,
    excelLink,
    handleGetLibrosBaja,
    handleDescargarExcel,
    handleReset,
  }
}

export const useReporteInventario = () => {
  const sistema = useReporteLibrosSistema()
  const categoria = useReporteLibrosCategoria()
  const baja = useReporteLibrosBaja()

  return {
    sistema,
    categoria,
    baja,
  }
}

export default useReporteInventario
