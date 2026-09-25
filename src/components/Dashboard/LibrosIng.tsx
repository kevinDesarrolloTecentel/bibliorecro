import { useState, useEffect, useCallback } from 'react'
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

const LibIng = () => {
    const currentYear = new Date().getFullYear()
    const [fechaDesde, setFechaDesde] = useState<string>(`${currentYear}-01-01`)
    const [fechaHasta, setFechaHasta] = useState<string>(`${currentYear}-12-31`)

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
                                >
                                        <>
                                            <CSpinner size="sm" />
                                            <span className="fw-semibold">Buscando...</span>
                                        </>
                                  
                                        <>
                                            <CIcon icon={cilPrint} />
                                            <span className="fw-semibold">Buscar Reporte</span>
                                        </>
                            
                                </CButton>
                                <CButton
                                    color='success'
                                    variant='outline'
                                    className='hover:text-white fw-semibold'>
                                    <CIcon icon={cibLibreoffice} className='me-1'/>
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
                                Tabla de Ingreso de los Nuevos Libros
                            </span>
                        </CCardHeader>
                        <CCardBody>
                            <CSmartTable
                                activePage={1}
                                columns={columns}
                                items={[]}
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