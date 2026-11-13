import { useState, useCallback } from 'react'
import Swal from 'sweetalert2'

import { STORAGE_BASE_URL, descargarArchivo } from '@/utils/imageUtils'
import { listarPrestamosCedula } from '@/Service/rco/Prestamos'
import { usePermissions } from '@/context/PermissionsContext'

export { STORAGE_BASE_URL, descargarArchivo }

import { PrestamoReporteItem } from '@/models/reportes/prestamos'

export type { PrestamoReporteItem }

export const useReporteHistorialLibrosUsuario = () => {
  const { canDoAction, verificarAccionEnServidor } = usePermissions()
  const canGenerarLibrosUsuario = canDoAction('btn_generar_libros_usuario')
  const canDescargarLibrosUsuarios = canDoAction('btn_descargar_libros_usuarios')

  const [cedula, setCedula] = useState<string>('')
  const [libros, setLibros] = useState<PrestamoReporteItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [excelLink, setExcelLink] = useState<string | null>(null)
  const [haBuscado, setHaBuscado] = useState<boolean>(false)

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
          IDENTIFICACION_PERSONA:
            item.IDENTIFICACION_PERSONA ??
            item.identificacion_persona ??
            item.cedula ??
            item.identificacion ??
            item.persona?.IDENTIFICACION_PERSONA ??
            item.persona?.identificacion,
          CORREO_PERSONA:
            item.CORREO_PERSONA ??
            item.correo_persona ??
            item.correo ??
            item.email ??
            item.persona?.CORREO_PERSONA ??
            item.persona?.correo,
          CELULAR_PERSONA:
            item.CELULAR_PERSONA ??
            item.celular_persona ??
            item.celular ??
            item.persona?.CELULAR_PERSONA ??
            item.persona?.celular,
          TELEFONO_PERSONA:
            item.TELEFONO_PERSONA ??
            item.telefono_persona ??
            item.telefono ??
            item.persona?.TELEFONO_PERSONA ??
            item.persona?.telefono,
          EDAD_PERSONA:
            item.EDAD_PERSONA ??
            item.edad_persona ??
            item.edad ??
            item.persona?.EDAD_PERSONA ??
            item.persona?.edad,
          DETALLE_PRESTAMO:
            item.DETALLE_PRESTAMO ??
            item.detalle_prestamo ??
            item.detalle,
          ESTADO_PRESTAMO:
            item.ESTADO_PRESTAMO ??
            item.estado_prestamo ??
            item.estado,
          FECHAINICIO_PRESTAMO_FORMATO:
            item.FECHAINICIO_PRESTAMO_FORMATO ??
            item.fechainicio_prestamo_formato,
          FECHAFIN_PRESTAMO_FORMATO:
            item.FECHAFIN_PRESTAMO_FORMATO ??
            item.fechafin_prestamo_formato,
          FECHAENTREGA_PRESTAMO_FORMATO:
            item.FECHAENTREGA_PRESTAMO_FORMATO ??
            item.fechaentrega_prestamo_formato,
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

      const rutaExcel: string | null = data?.excel?.nombre || data?.excel_path || null
      setExcelLink(rutaExcel)      
      setHaBuscado(true)


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
          text: 'Hubo un problema al obtener los préstamos. Por favor, inténtelo de nuevo más tarde.',
          confirmButtonColor: '#dc3545',
          confirmButtonText: 'Entendido',
        })
      }
    } finally {
      setIsLoading(false)
    }
  }, [canGenerarLibrosUsuario, cedula])

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

    if (excelLink) {
      await descargarArchivo(`${STORAGE_BASE_URL}/prestamos/${excelLink}`)
    }
  }, [canDescargarLibrosUsuarios, excelLink, verificarAccionEnServidor])

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
    canGenerarLibrosUsuario,
    canDescargarLibrosUsuarios,
    verificarAccionEnServidor,
  }
}

export const useReporteHistorialLibros = useReporteHistorialLibrosUsuario
export default useReporteHistorialLibrosUsuario
