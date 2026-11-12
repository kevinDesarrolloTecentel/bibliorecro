import { useState, useCallback } from 'react'
import Swal from 'sweetalert2'
import { ReporteIngresos } from '@/Service/rco/Libros'
import { LibroIngresoItem, UseLibrosIngReturn } from '@/models/dashboard/dashboard.model'
import { usePermissions } from '@/context/PermissionsContext'
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

const extractBooksList = (res: any): any[] => {
  if (!res) return []
  if (Array.isArray(res)) return res
  const candidates = [
    res.data,
    res.libros,
    res.data?.libros,
    res.data?.data,
    res.reporte,
    res.data?.reporte,
    res.ingresos,
    res.data?.ingresos,
    res.items,
    res.data?.items,
  ]
  const found = candidates.find(Array.isArray)
  if (found) return found

  if (typeof res === 'object') {
    const direct = Object.values(res).find(Array.isArray)
    if (direct) return direct as any[]
    if (res.data && typeof res.data === 'object') {
      const nested = Object.values(res.data).find(Array.isArray)
      if (nested) return nested as any[]
    }
  }
  return []
}

const cleanDateString = (val?: string | Date | null): string => {
  if (!val) return '-'
  if (val instanceof Date) return val.toISOString().slice(0, 10)
  return String(val).slice(0, 10)
}

const normalizeLibro = (item: any): LibroIngresoItem => {
  const isbn = item.ISBN_LIBROS || item.isbn || 'S/N'
  const titulo = item.TITULO_LIBROS || item.titulo || item.TITULO || 'Sin título'
  const autor = item.AUTORTEJUELO_LIBROS || item.autor || item.NOMBRE_AUTOR || '-'
  const editorial = item.editorial || item.EDITORIAL_LIBROS || item.Editorial || item.NOMBRE_EDITORIAL || '-'
  const proveedor = item.proveedor || item.PROVEEDOR_LIBROS || item.Proveedor || item.NOMBRE_PROVEEDOR || '-'
  const categoria = item.Categoria || item.categoria || item.CATEGORIA_LIBROS || item.NOMBRE_CATEGORIA || '-'
  const genero = item.Genero || item.genero || item.GENERO_LIBROS || item.NOMBRE_RCOGENERO || '-'
  const formato = item.Formatos || item.formato || item.FORMATOS_LIBROS || item.FORMATO_LIBROS || item.NOMBRE_FORMATOS || '-'
  const volumen = item.VOLUMEN_LIBROS || item.volumen || 'S/N'
  const pais = item.PAIS_LIBROS || item.pais || item.Pais || '-'
  const fechaEdicion = cleanDateString(item.FECHAEDICION_LIBROS || item.FechaEdicion || item.fechaEdicion)
  const fechaIngreso = cleanDateString(item.FECHAREGISTRO_LIBROS || item.FechaRegistro || item.fechaIngreso || item.created_at)

  let estado = 'Activo'
  if (item.ESTADO_LIBROS !== undefined && item.ESTADO_LIBROS !== null) {
    estado = (item.ESTADO_LIBROS === 1 || item.ESTADO_LIBROS === '1' || item.ESTADO_LIBROS === 'Activo') ? 'Activo' : 'Inactivo'
  } else if (item.Estado) {
    estado = item.Estado
  } else if (item.estado) {
    estado = item.estado
  }

  const precio = item.PRECIO_LIBROS || item.precio || '0.00'

  return {
    ...item,
    id: item.ID_LIBROS || item.id,
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
    precio,
    // Alias de compatibilidad para evitar roturas
    ISBN_LIBROS: isbn,
    TITULO_LIBROS: titulo,
    AUTORTEJUELO_LIBROS: autor,
    EDITORIAL_LIBROS: editorial,
    Editorial: editorial,
    FORMATOS_LIBROS: formato,
    Formatos: formato,
    VOLUMEN_LIBROS: volumen,
    PAIS_LIBROS: pais,
    Pais: pais,
    FechaEdicion: fechaEdicion,
    FechaRegistro: fechaIngreso,
    Estado: estado,
  }
}

export const useLibrosIng = (): UseLibrosIngReturn => {
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

      let list: any[] = []
      try {
        const res = await ReporteIngresos(params)
        list = extractBooksList(res)
      } catch (apiErr) {
        console.warn('[useLibrosIng] Error al consultar ReporteIngresos:', apiErr)
      }

      // Si vienen datos del backend, asegurar filtrado estricto dentro del rango de fechas
      if (list.length > 0 && fechaDesde && fechaHasta) {
        const dInicio = fechaDesde.slice(0, 10)
        const dFin = fechaHasta.slice(0, 10)
        list = list.filter((item) => {
          const rawFecha =
            item.FECHAREGISTRO_LIBROS ||
            item.FechaRegistro ||
            item.fechaIngreso ||
            item.created_at ||
            item.FECHA_INGRESO ||
            item.FECHAEDICION_LIBROS
          if (!rawFecha) return true
          const f = String(rawFecha).slice(0, 10)
          if (/^\d{4}-\d{2}-\d{2}/.test(f)) {
            return f >= dInicio && f <= dFin
          }
          return true
        })
      }

      setLibros(list.map(normalizeLibro))

      if (list.length === 0) {
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
    } finally {
      setLoading(false)
    }
  }, [fechaDesde, fechaHasta, canBuscar, verificarAccionEnServidor])

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