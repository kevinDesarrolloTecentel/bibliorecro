import { useReporteLibrosSistema } from "@/hooks/reportes/useReporteInventario"
import { cilBookmark, cilCloudDownload, cilExitToApp, cilSave } from "@coreui/icons"
import CIcon from "@coreui/icons-react"
import { CBadge, CButton, CCard, CCardBody, CCardHeader, CCardTitle, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle, CSmartTable, CSpinner } from "@coreui/react-pro"

export interface LibSistemaProps {
    visible: boolean
    setVisible: (visible: boolean) => void
}

const LibSistemaModal: React.FC<LibSistemaProps> = ({ visible, setVisible }) => {
    const {
        libros,
        excelLink,
        isLoading,
        handleDescargarExcel,
        handleGetLibrosSistema,
        handleReset
    } = useReporteLibrosSistema()

    const handleClose = () => {
        handleReset()
        setVisible(false)
    }
    const columns = [
        {
            key: 'isbn',
            label: 'ISBN',
            _style: { width: '20%' },
        },
        {
            key: 'titulo',
            label: 'Título',
            _style: { width: '20%' },
        },
        {
            key: 'codigo',
            label: 'Código de Barras',
            _style: { width: '20%' },
        },
    ]
    return (
        <>
            <CModal
                size="xl"
                visible={visible}
                scrollable
                onClose={handleClose}>
                <CModalHeader>
                    <CModalTitle>
                      <CIcon icon={cilBookmark} size="xl" className="me-2"/>
                      Libros en el Sistema
                    </CModalTitle>
                </CModalHeader>
                <CModalBody>
                    <CCard>
                        <CCardHeader>
                            <CCardTitle className="text-muted">
                                Listado de Libros en el Sistema
                            </CCardTitle>
                        </CCardHeader>
                        <CCardBody>
                          <CBadge className="rounded-pill border bg-white text-primary">Total Libros en el Sistema: <strong>{libros.length}</strong></CBadge>
                            <CSmartTable
                                activePage={2}
                                pagination
                                itemsPerPage={60}
                                columns={columns}
                                items={libros.map((l) => ({
                                    ...l,
                                    isbn: l.ISBN_LIBROS,
                                    titulo: l.TITULO_LIBROS,
                                    codigo: l.CODIGODEBARRAS_LIBROS
                                }))}
                                scopedColumns={{
                                    isbn: (item: any) => (
                                        <td>
                                            <span className="font-monospace small text-muted badge bg-body border">{item.ISBN_LIBROS}</span>
                                        </td>
                                    ),
                                    titulo: (item: any) => (
                                        <td>
                                            <span className="font-monospace">{item.TITULO_LIBROS}</span>
                                        </td>
                                    ),
                                    codigo: (item: any) => (
                                        <td>
                                            <span className="font-monospace small text-muted">{item.CODIGODEBARRAS_LIBROS}</span>
                                        </td>
                                    ),
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
                </CModalBody>
                <CModalFooter>
                    <CButton
                        color="danger"
                        variant="outline"
                        onClick={handleClose}
                        className="hover:text-white"
                    >
                        <CIcon icon={cilExitToApp} className="me-1"/>
                        Cerrar
                    </CButton>
                    <CButton
                        color="primary"
                        variant="outline"
                        onClick={handleGetLibrosSistema}
                        className="hover:text-white"
                    >
                        {isLoading ? (
                            <>
                                <CSpinner size="sm" variant="grow" aria-hidden='true' className="me-1"/>
                                Cargando
                            </>
                        ) : (
                            <>
                                <CIcon icon={cilSave} className="me-1"/>
                                Generar
                            </>)}
                    </CButton>
                    {excelLink && (
                        <CButton
                            color="success"
                            variant="outline"
                            onClick={handleDescargarExcel}
                            className="hover:text-white"
                        >
                            <CIcon icon={cilCloudDownload} className="me-1"/>
                            Descargar
                        </CButton>
                    )}
                </CModalFooter>
            </CModal>
        </>
    )
}
export default LibSistemaModal