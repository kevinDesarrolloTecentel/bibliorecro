import { useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Swal from 'sweetalert2'
import { RootState, AppDispatch } from '@/store'
import { STORAGE_BASE_URL, descargarArchivo } from '@/utils/imageUtils'
import { listarPrestamosCedula } from '@/Service/rco/Prestamos'
import { usePermissions } from '@/hooks/auth/usePermissions'
import {
  setReporteActivo,
  limpiarReporte,
  PrestamoReporteItem,
} from '@/slices/reporteSlice'

export { STORAGE_BASE_URL, descargarArchivo }
export type { PrestamoReporteItem }

export const useReporteHistorialLibrosUsuario = () => {
  const dispatch = useDispatch<AppDispatch>()
  const reporteState = useSelector((state: RootState) => state.reportes)

  const [cedula, setCedula] = useState<string>('')
  const [libros, setLibros] = useState<PrestamoReporteItem[]>([])
  const [excelLink, setExcelLink] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [haBuscado, setHaBuscado] = useState<boolean>(false)

  const { canDoAction, verificarAccionEnServidor } = usePermissions()
  const canGenerarLibrosUsuario = canDoAction('btn_generar_libros_usuario')
  const canDescargarLibrosUsuarios = canDoAction('btn_descargar_libros_usuarios')

  const handleGetPrestamos = useCallback(async () => {
    if (!canGenerarLibrosUsuario) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para generar este reporte.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    const cleanCedula = cedula.trim()
    if (!cleanCedula) {
      Swal.fire({
        icon: 'warning',
        title: 'Campo requerido',
        text: 'Por favor, ingrese el número de cédula.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    if (cleanCedula.length !== 10) {
      Swal.fire({
        icon: 'warning',
        title: 'Cédula inválida',
        text: 'La cédula debe contener exactamente 10 dígitos.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    setIsLoading(true)

    const tienePermiso = await verificarAccionEnServidor('btn_generar_libros_usuario')
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
        cedula: cleanCedula,
      }
      const data = await listarPrestamosCedula(params)

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
        .map((item: any) => {
          const persona = item.persona || item.PERSONA || {}
          const libro = item.libro || item.LIBRO || {}
          const autor = libro.autor || libro.AUTOR || {}

          return {
            ...item,
            ID_PRESTAMO: item.ID_PRESTAMO,
            NOMBRE_PERSONA: item.NOMBRE_PERSONA ?? persona.NOMBRE_PERSONA,
            APELLIDO_PERSONA: item.APELLIDO_PERSONA ?? persona.APELLIDO_PERSONA,
            IDENTIFICACION_PERSONA: item.IDENTIFICACION_PERSONA ?? persona.IDENTIFICACION_PERSONA,
            CORREO_PERSONA: item.CORREO_PERSONA ?? persona.CORREO_PERSONA,
            CELULAR_PERSONA: item.CELULAR_PERSONA ?? persona.CELULAR_PERSONA,
            TELEFONO_PERSONA: item.TELEFONO_PERSONA ?? persona.TELEFONO_PERSONA,
            EDAD_PERSONA: item.EDAD_PERSONA ?? persona.EDAD_PERSONA,
            DETALLE_PRESTAMO: item.DETALLE_PRESTAMO,
            ESTADO_PRESTAMO: item.ESTADO_PRESTAMO,
            FECHAINICIO_PRESTAMO_FORMATO: item.FECHAINICIO_PRESTAMO_FORMATO,
            FECHAFIN_PRESTAMO_FORMATO: item.FECHAFIN_PRESTAMO_FORMATO,
            FECHAENTREGA_PRESTAMO_FORMATO: item.FECHAENTREGA_PRESTAMO_FORMATO,
            ISBN_LIBROS: item.ISBN_LIBROS ?? libro.ISBN_LIBROS,
            TITULO_LIBROS: item.TITULO_LIBROS ?? libro.TITULO_LIBROS,
            NOMBRE_AUTOR: item.NOMBRE_AUTOR ?? libro.NOMBRE_AUTOR ?? autor.NOMBRE_AUTOR,
            PRECIO_LIBROS: item.PRECIO_LIBROS ?? libro.PRECIO_LIBROS,
          }
        })
        .sort(
          (a: PrestamoReporteItem, b: PrestamoReporteItem) =>
            Number(a.ID_PRESTAMO || 0) - Number(b.ID_PRESTAMO || 0),
        )

      const rutaExcel: string | null = data?.excel?.nombre || data?.excel_path || null

      setLibros(normalizados)
      setExcelLink(rutaExcel)
      setHaBuscado(true)

      dispatch(
        setReporteActivo({
          tipoReporte: 'usuarios_historial_libros',
          archivoDescarga: rutaExcel,
          total: normalizados.length,
          filtros: { cedula: cleanCedula },
        }),
      )

      if (normalizados.length === 0) {
        Swal.fire({
          icon: 'info',
          title: 'Sin registros',
          text: 'No se encontraron préstamos registrados para la cédula ingresada.',
          confirmButtonColor: '#044c8c',
          confirmButtonText: 'Entendido',
        })
      }
    } catch (error: any) {
      setHaBuscado(true)
      console.error('Error al obtener historial de libros', error)
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
          title: 'Sin préstamos encontrados',
          text: 'No se encontraron préstamos registrados para la cédula ingresada.',
          confirmButtonColor: '#044c8c',
          confirmButtonText: 'Entendido',
        })
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error al consultar',
          text: 'Hubo un problema al consultar el historial de libros. Por favor, inténtelo de nuevo más tarde.',
          confirmButtonColor: '#dc3545',
          confirmButtonText: 'Entendido',
        })
      }
    } finally {
      setIsLoading(false)
    }
  }, [canGenerarLibrosUsuario, cedula, verificarAccionEnServidor, dispatch])

  const handleDescargarExcel = useCallback(async () => {
    if (!canDescargarLibrosUsuarios) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para descargar este reporte.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    const tienePermiso = await verificarAccionEnServidor('btn_descargar_libros_usuarios')
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
      await descargarArchivo(`${STORAGE_BASE_URL}/prestamos/${downloadLink}`)
    }
  }, [canDescargarLibrosUsuarios, excelLink, reporteState.archivoDescarga, verificarAccionEnServidor])

  const handleReset = useCallback(() => {
    setCedula('')
    setLibros([])
    setExcelLink(null)
    setHaBuscado(false)
    dispatch(limpiarReporte())
  }, [dispatch])

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
    canGenerarLibrosUsuario,
    canDescargarLibrosUsuarios,
    verificarAccionEnServidor,
  }
}

export default useReporteHistorialLibrosUsuario
