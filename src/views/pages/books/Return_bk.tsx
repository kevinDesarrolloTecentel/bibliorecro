import { cilBook, cilCalendar, cilCreditCard, cilPhone, cilReload, cilReportSlash } from "@coreui/icons"
import CIcon from "@coreui/icons-react"
import {
    CBadge,
    CButton,
    CCard,
    CCardBody,
    CCol,
    CCollapse,
    CRow,
    CSmartPagination,
    CSmartTable,
    CSpinner
} from "@coreui/react-pro"
import { useState } from "react"
import Swal from "sweetalert2"
import usePrestamos from "@/hooks/rco-prestamos/usePrestamos"
import { CambioEstado, CambioEstadoSancion } from "@/Service/rco/Prestamos"

const BooksRT = () => {
    const {
        prestamos,
        loading,
        fetchPrestamos,
        details,
        toggleDetails,
        getBadgeColor,
        paginaActual,
        totalPaginas,
    } = usePrestamos()

    const [procesandoId, setProcesandoId] = useState<number | string | null>(null)

    const handleDevolver = async (item: any, conSancion: boolean = false) => {
        const id = item.id || item.ID_PRESTAMO
        if (!id) return

        const accion = conSancion ? 'Devolver con Sanción' : 'Devolver'
        const result = await Swal.fire({
            title: conSancion ? '¿Devolver con Sanción?' : '¿Confirmar Devolución?',
            text: `¿Desea registrar la devolución del libro "${item.Libro}" prestado a ${item.Nombres} ${item.Apellidos}?`,
            icon: conSancion ? 'warning' : 'question',
            showCancelButton: true,
            confirmButtonColor: conSancion ? '#dc3545' : '#0d6efd',
            cancelButtonColor: '#6c757d',
            confirmButtonText: `Sí, ${accion}`,
            cancelButtonText: 'Cancelar',
        })

        if (!result.isConfirmed) return

        setProcesandoId(id)
        try {
            if (conSancion) {
                await CambioEstadoSancion(id, { ESTADO_PRESTAMO: 'Devuelto con Sancion' })
            } else {
                await CambioEstado(id, { ESTADO_PRESTAMO: 'Devuelto' })
            }

            Swal.mixin({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 2500,
                timerProgressBar: true,
            }).fire({
                icon: 'success',
                title: conSancion ? 'Libro devuelto con sanción registrada' : 'Libro devuelto con éxito',
            })

            fetchPrestamos()
        } catch (error: any) {
            console.error('Error al registrar devolución:', error)
            const msg = error?.response?.data?.message || 'Ocurrió un error al procesar la devolución.'
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: msg,
                confirmButtonColor: '#dc3545',
            })
        } finally {
            setProcesandoId(null)
        }
    }

    const columns = [
        {
            key: 'Libro',
            label: 'Libro',
            _style: { width: '22%' },
        },
        {
            key: 'Nombres',
            label: 'Nombres',
            _style: { width: '15%' },
        },
        {
            key: 'Apellidos',
            label: 'Apellidos',
            _style: { width: '15%' },
        },
        {
            key: 'Celular',
            label: 'Celular',
            _style: { width: '13%' }
        },
        {
            key: 'status',
            label: 'Estado',
            _style: { width: '12%' },
        },
        {
            key: 'show_details',
            label: '',
            _style: { width: '10%' },
            filter: false,
            sorter: false,
        },
    ]

    return (
        <>
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
                <div>
                    <h4 className="fw-bold mb-1 text-body d-flex align-items-center gap-2">
                        <span>Gestión de Devoluciones</span>
                    </h4>
                    <p className="text-muted small mb-0">
                        Visualiza préstamos activos y procesa las devoluciones de libros a la biblioteca.
                    </p>
                </div>
            </div>

            {loading && prestamos.length === 0 ? (
                <div className="text-center py-5">
                    <CSpinner color="primary" />
                    <div className="mt-2 text-muted small">Cargando préstamos desde el servidor...</div>
                </div>
            ) : (
                <>
                    <CSmartTable
                        activePage={paginaActual}
                        clickableRows
                        columns={columns}
                        columnSorter
                        items={prestamos}
                        tableFilter
                        tableFilterPlaceholder="Buscar por libro, persona, cédula..."
                        onTableFilterChange={() => fetchPrestamos()}
                        tableProps={{
                            className: 'border rounded',
                            responsive: true,
                            striped: true,
                            hover: true,
                        }}
                        tableBodyProps={{
                            className: 'align-middle',
                        }}
                        scopedColumns={{
                            Libro: (item: any) => (
                                <td style={{ minWidth: '220px', whiteSpace: 'normal' }}>
                                    <div className="d-flex flex-column">
                                        <span className="fw-semibold text-body">{item.Libro}</span>
                                        <span className="text-muted small font-monospace">ISBN: {item.ISBN || 'S/N'}</span>
                                    </div>
                                </td>
                            ),
                            Nombres: (item: any) => (
                                <td>
                                    <span className="text-body fw-medium">{item.Nombres}</span>
                                </td>
                            ),
                            Apellidos: (item: any) => (
                                <td>
                                    <span className="text-body fw-medium">{item.Apellidos}</span>
                                </td>
                            ),
                            Celular: (item: any) => (
                                <td>
                                    <span className="font-monospace fw-semibold text-secondary">{item.Celular}</span>
                                </td>
                            ),
                            status: (item: any) => (
                                <td>
                                    <CBadge color={getBadgeColor(item.status)} shape="rounded-pill" className="px-2.5 py-1">
                                        {item.status}
                                    </CBadge>
                                </td>
                            ),
                            show_details: (item: any) => {
                                const isVisible = details.includes(item.id)
                                return (
                                    <td className="py-2 text-end">
                                        <CButton
                                            color="primary"
                                            variant={isVisible ? undefined : 'outline'}
                                            size="sm"
                                            onClick={() => toggleDetails(item.id)}
                                        >
                                            {isVisible ? 'Ocultar' : 'Mostrar'}
                                        </CButton>
                                    </td>
                                )
                            },
                            details: (item: any) => {
                                const isVisible = details.includes(item.id)
                                const procesando = procesandoId === item.id
                                const esDevuelto = String(item.status || '').toLowerCase().includes('devuelto')
                                return (
                                    <CCollapse visible={isVisible}>
                                        <div className="p-3 p-md-4 bg-body-tertiary border-top border-bottom">
                                            <CRow className="g-3">
                                                <CCol xs={12} md={4} lg={3} className="d-flex flex-column align-items-center justify-content-center text-center border-end-md pb-3 pb-md-0">
                                                    <div
                                                        className="bg-primary bg-opacity-10 text-primary p-4 rounded-4 shadow-sm mb-3 d-flex align-items-center justify-content-center"
                                                        style={{ width: '90px', height: '110px' }}
                                                    >
                                                        <CIcon icon={cilBook} size="3xl" />
                                                    </div>
                                                    <h6 className="fw-bold mb-1 text-body">{item.Libro}</h6>
                                                    <span className="text-muted small mb-2 d-flex align-items-center gap-1">
                                                        {item.Nombres} {item.Apellidos}
                                                    </span>
                                                    <CBadge color={getBadgeColor(item.status)} shape="rounded-pill" className="px-3 py-1">
                                                        {item.status}
                                                    </CBadge>
                                                </CCol>

                                                <CCol xs={12} md={8} lg={9}>
                                                    <CRow className="g-2">
                                                        <CCol xs={12} sm={6} >
                                                            <CCard className="h-100 shadow-sm border-0 bg-body">
                                                                <CCardBody className="p-3">
                                                                    <span className="text-muted small d-block mb-1">
                                                                        <CIcon icon={cilCreditCard} className="me-1" />Cedula</span>
                                                                    <span className="badge bg-body text-body border font-monospace">{item.Cedula || 'No registrada'}</span>
                                                                </CCardBody>
                                                            </CCard>
                                                        </CCol>

                                                        <CCol xs={12} sm={6}>
                                                            <CCard className="h-100 shadow-sm border-0 bg-body">
                                                                <CCardBody className="p-3">
                                                                    <span className="text-muted small d-block mb-1">
                                                                        <CIcon icon={cilPhone} className="me-1 text-body" />
                                                                        Telefono
                                                                    </span>
                                                                    <span className="badge bg-body rounded border text-primary font-monospace">{item.Telefono}</span>
                                                                </CCardBody>
                                                            </CCard>
                                                        </CCol>

                                                        <CCol xs={12} sm={6}>
                                                            <CCard className="h-100 shadow-sm border-0 bg-body">
                                                                <CCardBody className="p-3">
                                                                    <span className="text-muted small d-block mb-1">
                                                                        <CIcon icon={cilCalendar} className="me-1 text-success" />
                                                                        Fecha Préstamo
                                                                    </span>
                                                                    <span className="badge bg-body rounded-pill border text-success font-monospace">{item.Fecha_prestamo || '-'}</span>
                                                                </CCardBody>
                                                            </CCard>
                                                        </CCol>

                                                        <CCol xs={12} sm={6}>
                                                            <CCard className="h-100 shadow-sm border-0 bg-body">
                                                                <CCardBody className="p-3">
                                                                    <span className="text-muted small d-block mb-1">
                                                                        <CIcon icon={cilCalendar} className="me-1 text-danger" />
                                                                        Fecha Entrega
                                                                    </span>
                                                                    <span className="badge bg-body rounded-pill border text-danger font-monospace">{item.Fecha_entrega || '-'}</span>
                                                                </CCardBody>
                                                            </CCard>
                                                        </CCol>
                                                    </CRow>

                                                    {!esDevuelto && (
                                                        <div className="d-flex flex-wrap gap-2 justify-content-end mt-3 pt-2 border-top">
                                                            <CButton
                                                                color="primary"
                                                                variant="outline"
                                                                className="d-flex align-items-center gap-1 shadow-sm"
                                                                disabled={procesando}
                                                                onClick={() => handleDevolver(item, false)}
                                                            >
                                                                {procesando ? <CSpinner size="sm" /> : <CIcon icon={cilReload} />}
                                                                <span>Registrar Devolución</span>
                                                            </CButton>
                                                            <CButton
                                                                color="danger"
                                                                variant="outline"
                                                                className="hover:text-white d-flex align-items-center gap-1 shadow-sm"
                                                                disabled={procesando}
                                                                onClick={() => handleDevolver(item, true)}
                                                            >
                                                                {procesando ? <CSpinner size="sm" /> : <CIcon icon={cilReportSlash} />}
                                                                <span>Devolver con Sanción</span>
                                                            </CButton>
                                                        </div>
                                                    )}
                                                </CCol>
                                            </CRow>
                                        </div>
                                    </CCollapse>
                                )
                            },
                        }}
                    />

                    {totalPaginas > 1 && (
                        <div className="d-flex justify-content-center mt-3">
                            <CSmartPagination
                                activePage={paginaActual}
                                pages={totalPaginas}
                                onActivePageChange={() => fetchPrestamos()}
                            />
                        </div>
                    )}
                </>
            )}
        </>
    )
}

export default BooksRT