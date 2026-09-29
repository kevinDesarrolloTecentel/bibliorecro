import { useState, useEffect, useCallback } from 'react'
import Swal from 'sweetalert2'
import { cibLibreoffice, cilBookmark, cilPrint } from "@coreui/icons"
import CIcon from "@coreui/icons-react"
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CDatePicker,
  CRow,
  CSmartTable,
  CSpinner,
} from "@coreui/react-pro"
import { ReporteIngresos, ReporteIngesosExcel, listarLibros } from '@/Service/rco/libros'
import { STORAGE_BASE_URL } from '@/.env'

const extractBooksList = (res: any): any[] => {
    if (!res) return []
    if (Array.isArray(res)) return res
    if (Array.isArray(res.data)) return res.data
    if (Array.isArray(res.libros)) return res.libros
    if (Array.isArray(res.data?.libros)) return res.data.libros
    if (Array.isArray(res.data?.data)) return res.data.data
    if (Array.isArray(res.reporte)) return res.reporte
    if (Array.isArray(res.data?.reporte)) return res.data.reporte
    if (Array.isArray(res.ingresos)) return res.ingresos
    if (Array.isArray(res.data?.ingresos)) return res.data.ingresos
    if (Array.isArray(res.items)) return res.items
    if (Array.isArray(res.data?.items)) return res.data.items

    // Buscar recursivamente el primer array con elementos
    if (typeof res === 'object') {
        for (const k of Object.keys(res)) {
            if (Array.isArray(res[k]) && res[k].length > 0) return res[k]
        }
        if (res.data && typeof res.data === 'object') {
            for (const k of Object.keys(res.data)) {
                if (Array.isArray(res.data[k]) && res.data[k].length > 0) return res.data[k]
            }
        }
        for (const k of Object.keys(res)) {
            if (Array.isArray(res[k])) return res[k]
        }
    }
    return []
}

const LibIng = () => {
    const currentYear = new Date().getFullYear()
    const [fechaDesde, setFechaDesde] = useState<string>(`2024-01-01`)
    const [fechaHasta, setFechaHasta] = useState<string>(`${currentYear}-12-31`)
    const [libros, setLibros] = useState<any[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [exportando, setExportando] = useState<boolean>(false)

    const handleBuscarReporte = useCallback(async () => {
        setLoading(true)
        try {
            const params = {
                fecha_desde: fechaDesde,
                fecha_hasta: fechaHasta,
                fecha_inicio: fechaDesde,
                fecha_fin: fechaHasta,
                desde: fechaDesde,
                hasta: fechaHasta,
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

            // Si la respuesta no trajo elementos, consultar el catálogo completo mediante listarLibros
            if (list.length === 0) {
                try {
                    const resFallback = await listarLibros()
                    list = extractBooksList(resFallback)
                } catch (fallbackErr) {
                    console.warn('Error al obtener libros de respaldo:', fallbackErr)
                }
            }

            const normalized = list.map((item: any) => {
                const isbn = item.ISBN_LIBROS || item.isbn || item.ISBN || item.codigo || 'S/N'
                const titulo = item.TITULO_LIBROS || item.titulo || item.TITULO || item.nombre || 'Sin título'
                const autor = item.AUTORTEJUELO_LIBROS || item.NOMBRE_AUTOR || item.autor || item.AUTOR || '-'
                const editorial = item.Editorial || item.NOMBRE_EDITORIAL || item.editorial || item.EDITORIAL || '-'
                const proveedor = item.proveedor || item.NOMBRE_PROVEEDOR || item.proveedor_nombre || item.PROVEEDOR || '-'
                const categoria = item.Categoria || item.NOMBRE_CATEGORIA || item.categoria || item.CATEGORIA || '-'
                const genero = item.Genero || item.NOMBRE_RCOGENERO || item.genero || item.GENERO || '-'
                const formato = item.Formatos || item.FORMATO_LIBROS || item.formato || item.FORMATO || '-'
                const volumen = item.VOLUMEN_LIBROS || item.volumen || item.VOLUMEN || 'S/N'
                const pais = item.Pais || item.PAIS_LIBROS || item.pais || item.PAIS || '-'
                const fechaEdicion = item.FechaEdicion || item.FECHAEDICION_LIBROS || item.fecha_edicion || '-'
                const fechaIngreso = item.FechaRegistro || item.FECHAREGISTRO_LIBROS || item.fecha_registro || item.created_at || '-'
                const precio = item.PRECIO_LIBROS || item.precio || item.PRECIO || '0.00'
                const estado = item.Estado || (Number(item.ESTADO_LIBROS) === 1 ? 'Activo' : 'Inactivo')

                return {
                    ...item,
                    ISBN_LIBROS: isbn,
                    TITULO_LIBROS: titulo,
                    AUTORTEJUELO_LIBROS: autor,
                    Editorial: editorial,
                    proveedor,
                    Categoria: categoria,
                    Genero: genero,
                    Formatos: formato,
                    VOLUMEN_LIBROS: volumen,
                    Pais: pais,
                    FechaEdicion: fechaEdicion,
                    FechaRegistro: fechaIngreso,
                    PRECIO_LIBROS: precio,
                    Estado: estado,
                    isbn,
                    titulo,
                    autor,
                    editorial,
                    categoria,
                    genero,
                    formato,
                    volumen,
                    pais,
                    fechaEdicion,
                    fechaIngreso,
                    precio,
                    estado,
                }
            })
            setLibros(normalized)
        } catch (err) {
            console.error('Error al cargar reporte de libros:', err)
        } finally {
            setLoading(false)
        }
    }, [fechaDesde, fechaHasta])

    useEffect(() => {
        handleBuscarReporte()
    }, [handleBuscarReporte])

    const handleExportarExcel = async () => {
        setExportando(true)
        try {
            const params = {
                fecha_desde: fechaDesde,
                fecha_hasta: fechaHasta,
                desde: fechaDesde,
                hasta: fechaHasta,
            }
            let exportado = false
            try {
                const res = await ReporteIngesosExcel(params)
                const link = res?.excel_path || res?.url || res?.path
                if (link) {
                    const fullUrl = link.startsWith('http') ? link : `${STORAGE_BASE_URL}/${link}`
                    window.open(fullUrl, '_blank')
                    exportado = true
                }
            } catch (err) {
                console.warn('ReporteIngesosExcel falló, exportando en formato CSV local:', err)
            }

            if (!exportado && libros.length > 0) {
                const headers = ['ISBN', 'Título', 'Autor', 'Editorial', 'Proveedor', 'Categoría', 'Género', 'Formato', 'Precio', 'Fecha Registro', 'Estado']
                const rows = libros.map((l) => [
                    `"${l.ISBN_LIBROS || ''}"`,
                    `"${(l.TITULO_LIBROS || '').replace(/"/g, '""')}"`,
                    `"${(l.AUTORTEJUELO_LIBROS || '').replace(/"/g, '""')}"`,
                    `"${(l.Editorial || '').replace(/"/g, '""')}"`,
                    `"${(l.proveedor || '').replace(/"/g, '""')}"`,
                    `"${(l.Categoria || '').replace(/"/g, '""')}"`,
                    `"${(l.Genero || '').replace(/"/g, '""')}"`,
                    `"${(l.Formatos || '').replace(/"/g, '""')}"`,
                    `"${l.PRECIO_LIBROS || '0.00'}"`,
                    `"${l.FechaRegistro || ''}"`,
                    `"${l.Estado || ''}"`,
                ])
                const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `reporte_ingresos_libros_${fechaDesde}_${fechaHasta}.csv`
                a.click()
                URL.revokeObjectURL(url)
            } else if (!exportado && libros.length === 0) {
                Swal.fire({
                    icon: 'info',
                    title: 'Sin datos',
                    text: 'No hay libros disponibles para exportar en este rango.',
                })
            }
        } catch (err) {
            console.error('Error al exportar libros:', err)
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo generar el archivo de libros.',
            })
        } finally {
            setExportando(false)
        }
    }

    const handleDateChange = (
        val: Date | string | null,
        setter: React.Dispatch<React.SetStateAction<string>>,
    ) => {
        if (!val) {
            setter('')
            return
        }
        if (val instanceof Date) {
            const y = val.getFullYear()
            const m = String(val.getMonth() + 1).padStart(2, '0')
            const d = String(val.getDate()).padStart(2, '0')
            setter(`${y}-${m}-${d}`)
        } else if (typeof val === 'string') {
            const match = val.match(/^(\d{4})-(\d{2})-(\d{2})/)
            if (match) {
                setter(val.substring(0, 10))
            } else {
                const parsed = new Date(val)
                if (!isNaN(parsed.getTime())) {
                    const y = parsed.getFullYear()
                    const m = String(parsed.getMonth() + 1).padStart(2, '0')
                    const d = String(parsed.getDate()).padStart(2, '0')
                    setter(`${y}-${m}-${d}`)
                } else {
                    setter(val)
                }
            }
        }
    }

    const columns = [
        {
            key: 'isbn',
            label: 'ISBN',
            _style: { width: '' },
        },
        {
            key: 'titulo',
            label: 'Título',
            _style: { width: '' },
        },
        {
            key: 'autor',
            label: 'Autor',
            _style: { width: '' },
        },
        {
            key: 'editorial',
            label: 'Editorial',
            _style: { width: '' },
        },
        {
            key: 'proveedor',
            label: 'Proveedor',
            _style: { width: '' },
        },
        {
            key: 'categoria',
            label: 'Categoría',
            _style: { width: '' },
        },
        {
            key: 'genero',
            label: 'Género',
            _style: { width: '' },
        },
        {
            key: 'formato',
            label: 'Formato',
            _style: { width: '' },
        },
        {
            key: 'volumen',
            label: 'Volumen',
            _style: { width: '' },
        },
        {
            key: 'pais',
            label: 'País',
            _style: { width: '' },
        },
        {
            key: 'fechaEdicion',
            label: 'Fecha Edición',
            _style: { width: '' },
        },
        {
            key: 'fechaIngreso',
            label: 'Fecha Ingreso',
            _style: { width: '' },
        },
        {
            key: 'precio',
            label: 'Precio',
            _style: { width: '' },
        },
        {
            key: 'estado',
            label: 'Estado',
            _style: { width: '' },
        },
    ]

    return (
        <>
            <CRow className="justify-content-center">
                <CCol xs={12} lg={10} xl={8}>
                    <CCard className="shadow-sm border-0 mb-4">
                        <CCardBody className="p-4">
                            <p className="text-body-secondary small mb-4">
                                Selecciona el periodo de ingreso de los nuevos libros al sistema BiblioRecreo.
                            </p>

                            <CRow className="g-3 mb-4">
                                <CCol xs={12} md={6}>
                                    <CDatePicker
                                        label="Fecha (Desde)"
                                        locale="es-ES"
                                        date={fechaDesde}
                                        onDateChange={(val) => handleDateChange(val, setFechaDesde)}
                                    />
                                </CCol>
                                <CCol xs={12} md={6}>
                                    <CDatePicker
                                        label="Fecha (Hasta)"
                                        locale="es-ES"
                                        date={fechaHasta}
                                        onDateChange={(val) => handleDateChange(val, setFechaHasta)}
                                    />
                                </CCol>
                            </CRow>

                            <div className="d-flex flex-wrap justify-content-end gap-2 pt-2 border-top">
                                <CButton
                                    color="primary"
                                    variant='outline'
                                    className="d-flex align-items-center gap-2 px-4 py-2"
                                    onClick={handleBuscarReporte}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <CSpinner size="sm" />
                                            <span className="fw-semibold">Buscando...</span>
                                        </>
                                    ) : (
                                        <>
                                            <CIcon icon={cilPrint} />
                                            <span className="fw-semibold">Buscar Reporte</span>
                                        </>
                                    )}
                                </CButton>
                                <CButton
                                    color='success'
                                    variant='outline'
                                    className='hover:text-white fw-semibold d-flex align-items-center gap-2'
                                    onClick={handleExportarExcel}
                                    disabled={exportando || libros.length === 0}
                                >
                                    {exportando ? (
                                        <CSpinner size="sm" />
                                    ) : (
                                        <CIcon icon={cibLibreoffice} className='me-1'/>
                                    )}
                                    Exportar Excel
                                </CButton>
                            </div>
                        </CCardBody>
                    </CCard>
                </CCol>

                <CCol>
                    <CCard>
                        <CCardHeader>
                            <CIcon icon={cilBookmark} className="me-2" size="xl" style={{ color: "#b60741ff" }} />
                            <span className="fw-bold text-body text-dark">
                                Tabla de Ingreso de los Nuevos Libros ({libros.length})
                            </span>
                        </CCardHeader>
                        <CCardBody>
                            <CSmartTable
                                activePage={1}
                                columns={columns}
                                items={libros}
                                itemsPerPage={10}
                                itemsPerPageSelect
                                pagination
                                tableFilter
                                tableFilterPlaceholder="Buscar por título, autor, isbn..."
                                columnSorter
                                scopedColumns={{
                                    isbn:(item:any)=>(
                                        <td>
                                            <span className="font-monospace small text-muted badge bg-body rounded-pill border">
                                                {item.ISBN_LIBROS}
                                            </span>
                                        </td>
                                    ),
                                    titulo:(item:any)=>(
                                        <td>
                                            <span className="font-monospace small text-body">
                                                {item.TITULO_LIBROS}
                                            </span>
                                        </td>
                                    ),
                                    autor:(item: any)=>(
                                        <td>
                                            <span className="badge bg-body small font-monospace text-body border rounded-pill">
                                                {item.AUTORTEJUELO_LIBROS}
                                            </span>
                                        </td>
                                    ),
                                    editorial:(item:any)=>(
                                        <td>
                                            <span className="font-monospace small ">
                                                {item.Editorial}
                                            </span>
                                        </td>
                                    ),
                                    proveedor:(item:any)=>(
                                        <td>
                                            <span className="font-monospace small">
                                                {item.proveedor}
                                            </span>
                                        </td>
                                    ),
                                    categoria:(item:any)=>(
                                        <td>
                                            <span className="font-monospace small fw-semibold">
                                                {item.Categoria}
                                            </span>
                                        </td>
                                    ),
                                    genero:(item:any)=>(
                                        <td>
                                            <span className="font-monospace small">
                                                {item.Genero}
                                            </span>
                                        </td>
                                    ),
                                    formato:(item: any)=>(
                                        <td>
                                            <span className="font-monospace small">
                                                {item.Formatos}
                                            </span>
                                        </td>
                                    ),
                                    formatos:(item:any)=>(
                                        <td>
                                            <span className="font-monospace small">
                                                {item.FORMATO_LIBROS}
                                            </span>
                                        </td>
                                    ),
                                    volumen:(item:any)=>(
                                        <td>
                                            <span className="font-monospace small">
                                                {item.VOLUMEN_LIBROS || 'S/N'}
                                            </span>
                                        </td>
                                    ),
                                    pais:(item:any)=>(
                                        <td>
                                            <span className="font-monospace small badge bg-body text-body border rounded-pill">
                                                {item.Pais}
                                            </span>
                                        </td>
                                    ),
                                    fechaEdicion:(item:any) =>(
                                        <td>
                                            <span className="badge bg-body rounded-pill text-primary">
                                                {item.FechaEdicion}
                                            </span>
                                        </td>
                                    ),
                                    fechaIngreso:(item:any)=>(
                                        <td>
                                            <span className="badge bg-body border text-success rounded-pill">
                                                {item.FechaRegistro}
                                            </span>
                                        </td>
                                    ),precio:(item:any)=>(
                                        <td>
                                            <span className="font-monospace badge bg-body rounded-pill border text-success">
                                                ${item.PRECIO_LIBROS || '0.00'} 
                                            </span>
                                        </td>
                                    ),
                                    estado:(item:any)=>(
                                        <td>
                                            <span className={`badge ${item.Estado === 'Activo' ? 'bg-success' : 'bg-danger'}`}>
                                                {item.Estado}
                                            </span>
                                        </td>
                                    )
                                }}
                                tableProps={{
                                    className: 'add-this-custom-class',
                                    responsive: true,
                                    striped: true,
                                    hover: true,
                                }}
                                tableBodyProps={{
                                    className: 'align-middle',
                                }}
                            />
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>
        </>
    )
}

export default LibIng