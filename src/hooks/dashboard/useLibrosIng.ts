import { useState, useCallback } from 'react'
import Swal from 'sweetalert2'
import { ReporteIngresos, listarLibros } from '@/Service/rco/libros'

export interface LibroIngresoItem {
  id?: number | string
  isbn: string
  titulo: string
  autor: string
  editorial: string
  proveedor: string
  categoria: string
  genero: string
  formato: string
  volumen: string
  pais: string
  fechaEdicion: string
  fechaIngreso: string
  estado: string
  precio?: string | number
  [key: string]: any
}

export interface UseLibrosIngReturn {
  fechaDesde: string
  fechaHasta: string
  libros: LibroIngresoItem[]
  loading: boolean
  exportando: boolean
  haBuscado: boolean
  totalLibros: number
  setFechaDesde: React.Dispatch<React.SetStateAction<string>>
  setFechaHasta: React.Dispatch<React.SetStateAction<string>>
  handleDateChange: (val: Date | string | null, field: 'desde' | 'hasta') => void
  handleBuscarReporte: () => Promise<void>
  handleExportarExcel: () => Promise<void>
}

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
    // Si la hora es >= 18 (desfase UTC hacia GMT-5 en horas nocturnas),
    // el día real seleccionado corresponde al día UTC.
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
  const [fechaDesde, setFechaDesde] = useState<string>('')
  const [fechaHasta, setFechaHasta] = useState<string>('')
  const [libros, setLibros] = useState<LibroIngresoItem[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [exportando, setExportando] = useState<boolean>(false)
  const [haBuscado, setHaBuscado] = useState<boolean>(false)

  const handleBuscarReporte = useCallback(async () => {
    if (!fechaDesde || !fechaHasta) {
      Swal.fire({
        icon: 'warning',
        title: 'Fechas requeridas',
        text: 'Por favor selecciona la fecha (Desde) y la fecha (Hasta) para consultar los libros ingresados.',
        confirmButtonColor: '#321fdb',
      })
      return
    }

    setLoading(true)
    setHaBuscado(true)
    try {
      const params = {
        fechaDesde,
        fechaHasta,
        anio: fechaDesde.split('-')[0],
      }

      let list: any[] = []
      try {
        const res = await ReporteIngresos(params)
        list = extractBooksList(res)
      } catch (apiErr) {
        console.warn('Endpoint ReporteIngresos falló, consultando libros mediante listarLibros:', apiErr)
      }

      if (list.length === 0) {
        try {
          const resFallback = await listarLibros()
          list = extractBooksList(resFallback)
        } catch (fallbackErr) {
          console.warn('Error al obtener libros de respaldo:', fallbackErr)
        }
      }

      setLibros(list.map(normalizeLibro))
    } catch (err) {
      console.error('Error al cargar reporte de libros:', err)
    } finally {
      setLoading(false)
    }
  }, [fechaDesde, fechaHasta])

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
    if (!libros || libros.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'Sin datos',
        text: 'No hay libros disponibles para exportar en este período.',
        confirmButtonColor: '#321fdb',
      })
      return
    }

    setExportando(true)
    try {
      const headers = [
        '#',
        'ISBN',
        'Título',
        'Autor',
        'Editorial',
        'Proveedor',
        'Categoría',
        'Género',
        'Formato',
        'Volumen',
        'País',
        'Fecha Edición',
        'Fecha Ingreso',
        'Estado',
      ]

      const rows = libros.map((l, idx) => [
        idx + 1,
        `"${l.isbn || ''}"`,
        `"${(l.titulo || '').replace(/"/g, '""')}"`,
        `"${(l.autor || '').replace(/"/g, '""')}"`,
        `"${(l.editorial || '').replace(/"/g, '""')}"`,
        `"${(l.proveedor || '').replace(/"/g, '""')}"`,
        `"${(l.categoria || '').replace(/"/g, '""')}"`,
        `"${(l.genero || '').replace(/"/g, '""')}"`,
        `"${(l.formato || '').replace(/"/g, '""')}"`,
        `"${l.volumen || ''}"`,
        `"${l.pais || ''}"`,
        `"${l.fechaEdicion || ''}"`,
        `"${l.fechaIngreso || ''}"`,
        `"${l.estado || ''}"`,
      ])

      const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const nombreArchivo = `reporte_ingresos_libros_${fechaDesde || 'inicio'}_${fechaHasta || 'fin'}.csv`
      a.download = nombreArchivo
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      Swal.fire({
        icon: 'success',
        title: 'Archivo exportado',
        text: `Se descargó exitosamente el reporte con ${libros.length} libros.`,
        timer: 2000,
        showConfirmButton: false,
      })
    } catch (err) {
      console.error('Error al exportar libros:', err)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo generar el archivo de libros.',
        confirmButtonColor: '#321fdb',
      })
    } finally {
      setExportando(false)
    }
  }, [fechaDesde, fechaHasta, libros])

  return {
    fechaDesde,
    fechaHasta,
    libros,
    loading,
    exportando,
    haBuscado,
    totalLibros: libros.length,
    setFechaDesde,
    setFechaHasta,
    handleDateChange,
    handleBuscarReporte,
    handleExportarExcel,
  }
}

export default useLibrosIng