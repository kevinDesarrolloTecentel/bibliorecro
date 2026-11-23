import { useState, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import Swal from 'sweetalert2'
import { AppDispatch } from '@/store'
import { ReporteIngresos } from '@/Service/rco/Libros'
import {
  setReporteActivo,
  limpiarReporte,
  LibroIngresoItem,
  UseLibrosIngReturn,
} from '@/slices/reporteSlice'
import { usePermissions } from '@/hooks/auth/usePermissions'
import { generarExcelEstilizado } from '@/utils/dashboardExcel'

export type { LibroIngresoItem, UseLibrosIngReturn }

export const aFechaLocal = (str?: string | null): Date | undefined => {
  if (!str) return undefined
  const match = String(str).match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (match) {
    const [, y, m, d] = match.map(Number)
    return new Date(y, m - 1, d, 12, 0, 0)
  }
  const esMatch = String(str).match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})/)
  if (esMatch) {
    const d = Number(esMatch[1])
    const m = Number(esMatch[2])
    const y = Number(esMatch[3])
    return new Date(y, m - 1, d, 12, 0, 0)
  }
  return undefined
}

export const parseDatePickerValue = (val: Date | string | null): string => {
  if (!val) return ''
  if (val instanceof Date) {

    if (val.getHours() >= 18) {
      const y = val.getUTCFullYear()
      const m = String(val.getUTCMonth() + 1).padStart(2, '0')
      const d = String(val.getUTCDate()).padStart(2, '0')
      return `${y}-${m}-${d}`
    }
    const y = val.getFullYear()
    const m = String(val.getMonth() + 1).padStart(2, '0')
    const d = String(val.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }
  if (typeof val === 'string') {
    const isoMatch = val.match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (isoMatch) return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`

    const esMatch = val.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})/)
    if (esMatch) {
      const d = esMatch[1].padStart(2, '0')
      const m = esMatch[2].padStart(2, '0')
      const y = esMatch[3]
      return `${y}-${m}-${d}`
    }

    const parsed = new Date(val)
    if (!isNaN(parsed.getTime())) {
      if (parsed.getHours() >= 18) {
        const y = parsed.getUTCFullYear()
        const m = String(parsed.getUTCMonth() + 1).padStart(2, '0')
        const d = String(parsed.getUTCDate()).padStart(2, '0')
        return `${y}-${m}-${d}`
      }
      const y = parsed.getFullYear()
      const m = String(parsed.getMonth() + 1).padStart(2, '0')
      const d = String(parsed.getDate()).padStart(2, '0')
      return `${y}-${m}-${d}`
    }
    return val
  }
  return ''
}

const cleanDateString = (val?: string | Date | null): string => {
  if (!val) return '-'
  if (val instanceof Date) return val.toISOString().slice(0, 10)
  return String(val).slice(0, 10)
}

// Normalización limpia y exacta a partir de las columnas canónicas de la base de datos
const normalizeLibro = (item: any): LibroIngresoItem => {
  const isbn = item.ISBN_LIBROS || 'S/N'
  const titulo = item.TITULO_LIBROS || 'Sin título'
  const autor = item.NOMBRE_AUTOR || item.AUTORTEJUELO_LIBROS || '-'
  const editorial = item.NOMBRE_EDITORIAL || '-'
  const proveedor = item.NOMBRE_PROVEEDOR ? String(item.NOMBRE_PROVEEDOR).trim() : '-'
  const categoria = item.NOMBRE_CATEGORIA || '-'
  const genero = item.NOMBRE_RCOGENERO || '-'
  const formato = item.NOMBRE_FORMATOS || '-'
  const volumen = item.VOLUMEN_LIBROS || 'S/N'
  const pais = item.PAIS_LIBROS || '-'
  const fechaEdicion = cleanDateString(item.FECHAEDICION_LIBROS)
  const fechaIngreso = cleanDateString(item.FECHAREGISTRO_LIBROS)
  const estado = Number(item.ESTADO_LIBROS) === 1 ? 'Activo' : 'Inactivo'

  return {
    ...item,
    id: item.ID_LIBROS,
    isbn,
    titulo,
    autor,
    editorial,
    proveedor,
    categoria,
    genero,
    formato,
    volumen,
    pais,
    fechaEdicion,
    fechaIngreso,
    estado,
  }
}

export const useLibrosIng = (): UseLibrosIngReturn => {
  const dispatch = useDispatch<AppDispatch>()
  const { canDoAction, verificarAccionEnServidor } = usePermissions()
  const canBuscar = canDoAction('btn_buscar_reporte_libros')
  const canExportar = canDoAction('btn_exportar_excel_libros')

  const [fechaDesde, setFechaDesde] = useState<string>('')
  const [fechaHasta, setFechaHasta] = useState<string>('')
  const [libros, setLibros] = useState<LibroIngresoItem[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [exportando, setExportando] = useState<boolean>(false)
  const [haBuscado, setHaBuscado] = useState<boolean>(false)

  const handleBuscarReporte = useCallback(async () => {
    if (!canBuscar) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para consultar el reporte de libros ingresados.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    if (!fechaDesde || !fechaHasta) {
      Swal.fire({
        icon: 'warning',
        title: 'Fechas requeridas',
        text: 'Por favor selecciona la fecha (Desde) y la fecha (Hasta) para consultar los libros ingresados.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    if (fechaDesde > fechaHasta) {
      Swal.fire({
        icon: 'warning',
        title: 'Rango de fechas inválido',
        text: 'La Fecha (Desde) no puede ser posterior a la Fecha (Hasta).',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    setLoading(true)

    const tienePermiso = await verificarAccionEnServidor('btn_buscar_reporte_libros')
    if (!tienePermiso) {
      setLoading(false)
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para consultar el reporte de libros ingresados.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    setHaBuscado(true)
    try {
      const params = {
        fechaDesde,
        fechaHasta,
      }

      const res = await ReporteIngresos(params)
      const rawLibros: any[] = Array.isArray(res?.libros)
        ? res.libros
        : Array.isArray(res?.data)
          ? res.data
          : []

      const librosMapeados = rawLibros.map(normalizeLibro)
      setLibros(librosMapeados)

      dispatch(
        setReporteActivo({
          tipoReporte: 'libros_ingreso',
          total: librosMapeados.length,
          filtros: { fechaDesde, fechaHasta },
        }),
      )

      if (librosMapeados.length === 0) {
        Swal.fire({
          icon: 'info',
          title: 'Sin registros',
          text: 'No se encontraron libros ingresados en el rango de fechas seleccionado.',
          confirmButtonColor: '#044c8c',
          confirmButtonText: 'Entendido',
        })
      }
    } catch (err) {
      console.error('Error al cargar reporte de libros:', err)
      setLibros([])
      dispatch(limpiarReporte())
    } finally {
      setLoading(false)
    }
  }, [fechaDesde, fechaHasta, canBuscar, verificarAccionEnServidor, dispatch])

  const handleDateChange = useCallback(
    (val: Date | string | null, field: 'desde' | 'hasta') => {
      const formatted = parseDatePickerValue(val)
      if (field === 'desde') {
        setFechaDesde(formatted)
      } else {
        setFechaHasta(formatted)
      }
    },
    [],
  )

  const handleExportarExcel = useCallback(async () => {
    if (!canExportar) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para exportar este reporte a Excel.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    if (!libros || libros.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'Sin datos',
        text: 'No hay libros disponibles para exportar en este período.',
        confirmButtonColor: '#044c8c',
        confirmButtonText: 'Entendido',
      })
      return
    }

    setExportando(true)

    const tienePermiso = await verificarAccionEnServidor('btn_exportar_excel_libros')
    if (!tienePermiso) {
      setExportando(false)
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para exportar este reporte a Excel.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    try {
      const headers = [
        '#', 'ISBN', 'Título', 'Autor', 'Editorial', 'Proveedor',
        'Categoría', 'Género', 'Formato', 'Volumen', 'País',
        'Fecha Edición', 'Fecha Ingreso', 'Estado'
      ]

      const rows = libros.map((l, idx) => [
        idx + 1,
        String(l.isbn || ''),
        l.titulo || '',
        l.autor || '',
        l.editorial || '',
        l.proveedor || '',
        l.categoria || '',
        l.genero || '',
        l.formato || '',
        l.volumen || '',
        l.pais || '',
        l.fechaEdicion || '',
        l.fechaIngreso || '',
        l.estado || '',
      ])

      await generarExcelEstilizado({
        nombreArchivo: `reporte_ingresos_libros_${fechaDesde || 'inicio'}_${fechaHasta || 'fin'}.xlsx`,
        tituloPrincipal: 'Reporte de Libros Ingresados',
        subtituloFiltro: `Libros registrados entre ${fechaDesde || 'inicio'} y ${fechaHasta || 'fin'}`,
        totalRegistros: libros.length,
        headers,
        rows,
      })


      Swal.fire({
        icon: 'success',
        title: 'Archivo exportado',
        text: `Se descargó exitosamente el reporte con ${libros.length} libros.`,
        timer: 1800,
        showConfirmButton: false,
      })
    } catch (err) {
      console.error('Error al exportar libros:', err)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo generar el archivo de libros.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
    } finally {
      setExportando(false)
    }
  }, [canExportar, verificarAccionEnServidor, fechaDesde, fechaHasta, libros])

  return {
    fechaDesde,
    fechaHasta,
    libros,
    loading,
    exportando,
    haBuscado,
    totalLibros: libros.length,
    canBuscar,
    canExportar,
    setFechaDesde,
    setFechaHasta,
    handleDateChange,
    handleBuscarReporte,
    handleExportarExcel,
  }
}

export default useLibrosIng