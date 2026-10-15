import { useState, useCallback } from 'react'
import Swal from 'sweetalert2'

import { STORAGE_BASE_URL } from '@/utils/imageUtils'
import { listarPrestamosCedula } from '@/Service/rco/Prestamos'

export { STORAGE_BASE_URL }

export interface PrestamoReporteItem {
  ID_PRESTAMO?: number | string
  NOMBRE_PERSONA?: string
  APELLIDO_PERSONA?: string
  ISBN_LIBROS?: string
  TITULO_LIBROS?: string
  NOMBRE_AUTOR?: string
  PRECIO_LIBROS?: number | string
  ESTADOINSCRIPCION_PERSONA?: number
  [key: string]: any
}

export const useReporteHistorialLibrosUsuario = () => {
  const [cedula, setCedula] = useState<string>('')
  const [libros, setLibros] = useState<PrestamoReporteItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [excelLink, setExcelLink] = useState<string | null>(null)
  const [haBuscado, setHaBuscado] = useState<boolean>(false)

  const handleGetPrestamos = useCallback(async () => {
    const cleanCedula = cedula.trim()
    if (!cleanCedula) {
      Swal.mixin({
        toast: true,
        position: 'top-end',
        timer: 2500,
        timerProgressBar: false,
        showConfirmButton: false,
      }).fire({
        icon: 'warning',
        title: 'Por favor, ingrese el número de cédula.',
      })
      return
    }

    if (cleanCedula.length !== 10) {
      Swal.mixin({
        toast: true,
        position: 'top-end',
        timer: 2500,
        timerProgressBar: false,
        showConfirmButton: false,
      }).fire({
        icon: 'warning',
        title: 'La cédula debe contener exactamente 10 dígitos.',
      })
      return
    }

    setIsLoading(true)
    setHaBuscado(true)
    setLibros([])
    setExcelLink(null)

    try {
      const params = {
        cedula: cleanCedula,
      }
      const data = await listarPrestamosCedula(params)
      console.log('Datos recibidos de reporte por cédula:', data)

      const rawList: any[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.prestamos)
        ? data.prestamos
        : Array.isArray(data?.libros)
        ? data.libros
        : Array.isArray(data?.data?.prestamos)
        ? data.data.prestamos
        : Array.isArray(data?.data?.libros)
        ? data.data.libros
        : Array.isArray(data?.reporte)
        ? data.reporte
        : []

      const normalizados: PrestamoReporteItem[] = rawList
        .map((item: any) => ({
          ...item,
          ID_PRESTAMO: item.ID_PRESTAMO ?? item.id_prestamo ?? item.id,
          NOMBRE_PERSONA:
            item.NOMBRE_PERSONA ??
            item.nombre_persona ??
            item.nombre ??
            item.nombres ??
            item.persona?.NOMBRE_PERSONA ??
            item.persona?.nombre,
          APELLIDO_PERSONA:
            item.APELLIDO_PERSONA ??
            item.apellido_persona ??
            item.apellido ??
            item.apellidos ??
            item.persona?.APELLIDO_PERSONA ??
            item.persona?.apellido,
          ISBN_LIBROS:
            item.ISBN_LIBROS ??
            item.isbn_libros ??
            item.isbn ??
            item.ISBN ??
            item.libro?.ISBN_LIBROS ??
            item.libro?.isbn,
          TITULO_LIBROS:
            item.TITULO_LIBROS ??
            item.titulo_libros ??
            item.titulo ??
            item.titulo_libro ??
            item.libro?.TITULO_LIBROS ??
            item.libro?.titulo,
          NOMBRE_AUTOR:
            item.NOMBRE_AUTOR ??
            item.nombre_autor ??
            item.autor ??
            item.libro?.NOMBRE_AUTOR ??
            item.libro?.autor?.NOMBRE_AUTOR ??
            item.libro?.autor?.nombre ??
            item.libro?.autor,
          PRECIO_LIBROS:
            item.PRECIO_LIBROS ??
            item.precio_libros ??
            item.precio ??
            item.libro?.PRECIO_LIBROS ??
            item.libro?.precio,
        }))
        .sort(
          (a: PrestamoReporteItem, b: PrestamoReporteItem) =>
            Number(a.ID_PRESTAMO || 0) - Number(b.ID_PRESTAMO || 0),
        )

      setLibros(normalizados)
      setExcelLink(data?.excel_path || data?.data?.excel_path || null)

      if (normalizados.length === 0) {
        Swal.fire({
          icon: 'info',
          title: 'Sin registros',
          text: 'No se encontraron préstamos registrados para la cédula ingresada.',
          confirmButtonColor: '#0d6efd',
        })
      }
    } catch (error: any) {
      console.error('Error al obtener historial de libros', error)
      const isNotFound = error?.response?.status === 404

      if (isNotFound) {
        setLibros([])
        setExcelLink(null)
        Swal.fire({
          icon: 'info',
          title: 'Sin registros',
          text: 'No se encontraron préstamos registrados para la cédula ingresada.',
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
          icon: 'warning',
          title: 'Error!',
          text: 'Hubo un problema al obtener los préstamos. Por favor, inténtelo de nuevo más tarde.',
        })
      }
    } finally {
      setIsLoading(false)
    }
  }, [cedula])

  const handleDescargarExcel = useCallback(() => {
    if (excelLink) {
      window.open(`${STORAGE_BASE_URL}/${excelLink}`, '_blank')
    }
  }, [excelLink])

  const handleReset = useCallback(() => {
    setCedula('')
    setLibros([])
    setExcelLink(null)
    setHaBuscado(false)
  }, [])

  return {
    cedula,
    setCedula,
    libros,
    isLoading,
    excelLink,
    haBuscado,
    handleGetPrestamos,
    handleDescargarExcel,
    handleReset,
  }
}

export const useReporteHistorialLibros = useReporteHistorialLibrosUsuario
export default useReporteHistorialLibrosUsuario
