import {
    cilBarcode,
    cilBook,
    cilBookmark,
    cilCalendar,
    cilCheckCircle,
    cilDescription,
    cilDollar,
    cilExitToApp,
    cilGlobeAlt,
    cilLayers,
    cilLibraryBuilding,
    cilTag,
    cilTruck,
    cilUser
} from "@coreui/icons"
import CIcon from "@coreui/icons-react"
import {
    CButton,
    CCol,
    CForm,
    CFormInput,
    CFormSelect,
    CFormTextarea,
    CInputGroup,
    CInputGroupText,
    CModal,
    CModalBody,
    CModalFooter,
    CModalHeader,
    CModalTitle
} from "@coreui/react-pro"
import { useState } from "react"

const Registro_bk = () => {
    const [isVisible, setVisible ] = useState(false)
    return (
        <>
            <CModal
                size="xl"
                aria-labelledby="ModalRegistroLibroLabel"
                visible={isVisible}
                onClose={() => setVisible(false)}
                scrollable
                backdrop="static"
            >
                <CModalHeader closeButton className="bg-light">
                    <CModalTitle id="ModalRegistroLibroLabel" className="d-flex align-items-center gap-2 fs-5 fw-bold text-dark">
                        <CIcon icon={cilBook} size="lg" />
                        <span>Registro de Nuevo Libro</span>
                    </CModalTitle>
                </CModalHeader>

                <CModalBody className="px-3 px-md-4 py-3">
                    <CForm className="row g-3">
                        <CCol xs={12} className="mt-2">
                            <div className="d-flex align-items-center justify-content-between pb-2 border-bottom fw-semibold">
                                <span>DATOS GENERALES DEL LIBRO</span>
                                
                            </div>
                        </CCol>
                        <CCol xs={12} sm={6} md={4}>
                            <label className="form-label small fw-semibold text-muted">Categoría *</label>
                            <CInputGroup>
                                <CInputGroupText>
                                    <CIcon icon={cilBookmark} />
                                </CInputGroupText>
                                <CFormSelect
                                    name="NOMBRE_CATEGORIA"
                                >
                                </CFormSelect>
                            </CInputGroup>
                        </CCol>
                        <CCol xs={12} sm={6} md={4}>
                            <label className="form-label small fw-semibold text-muted">Género</label>
                            <CInputGroup>
                                <CInputGroupText>
                                    <CIcon icon={cilTag} />
                                </CInputGroupText>
                                <CFormSelect
                                    name="NOMBRE_GENERO"
                                >
                                </CFormSelect>
                            </CInputGroup>
                        </CCol>
                        <CCol xs={12} sm={12} md={4}>
                            <label className="form-label small fw-semibold text-muted">Proveedor</label>
                            <CInputGroup>
                                <CInputGroupText>
                                    <CIcon icon={cilTruck} />
                                </CInputGroupText>
                                <CFormSelect
                                    name="NOMBRE_PROVEEDOR"
                                >
                                </CFormSelect>
                            </CInputGroup>
                        </CCol>

                        <CCol xs={12} className="mt-4">
                            <div className="d-flex align-items-center gap-2 pb-2 border-bottom fw-semibold">
                                <span>DATOS BIBLIOGRÁFICOS</span>
                            </div>
                        </CCol>

                        <CCol xs={12} md={6}>
                            <label className="form-label small fw-semibold text-muted">Título del Libro *</label>
                            <CInputGroup>
                                <CInputGroupText>
                                    <CIcon icon={cilBook} />
                                </CInputGroupText>
                                <CFormInput
                                    name="TITULO_LIBROS"
                                    placeholder="Ej: Cien años de soledad"
                                    required
                                />
                            </CInputGroup>
                        </CCol>

                        <CCol xs={12} md={6}>
                            <label className="form-label small fw-semibold text-muted">Autor</label>
                            <CInputGroup>
                                <CInputGroupText>
                                    <CIcon icon={cilUser} />
                                </CInputGroupText>
                                <CFormInput
                                    name="AUTOR"
                                    placeholder="Ej: Gabriel García Márquez"
                                />
                            </CInputGroup>
                        </CCol>
                        <CCol xs={12} sm={6} md={4}>
                            <label className="form-label small fw-semibold text-muted">Editorial</label>
                            <CInputGroup>
                                <CInputGroupText>
                                    <CIcon icon={cilLibraryBuilding} />
                                </CInputGroupText>
                                <CFormSelect
                                    name="NOMBRE_EDITORIAL"
                                >
                                </CFormSelect>
                            </CInputGroup>
                        </CCol>

                        <CCol xs={12} sm={6} md={4}>
                            <label className="form-label small fw-semibold text-muted">ISBN:</label>
                            <CInputGroup>
                                <CInputGroupText>
                                    <CIcon icon={cilBarcode} />
                                </CInputGroupText>
                                <CFormInput
                                    name="ISBN_LIBROS"
                                    placeholder="978-X-XXXX-XXXX-X"
                                />
                            </CInputGroup>
                        </CCol>

                        <CCol xs={12} sm={6} md={4}>
                            <label className="form-label small fw-semibold text-muted">Volumen:</label>
                            <CInputGroup>
                                <CInputGroupText>
                                    <CIcon icon={cilLayers} />
                                </CInputGroupText>
                                <CFormInput
                                    name="VOLUMEN_LIBROS"
                                    placeholder="Ej: Vol. 1, Tomo 2"
                                />
                            </CInputGroup>
                        </CCol>

                        <CCol xs={12} sm={6} md={4}>
                            <label className="form-label small fw-semibold text-muted">Fecha de Edición:</label>
                            <CInputGroup>
                                <CInputGroupText>
                                    <CIcon icon={cilCalendar} />
                                </CInputGroupText>
                                <CFormInput
                                    type="date"
                                    name="FECHAEDICION_LIBROS"
                                />
                            </CInputGroup>
                        </CCol>

                        <CCol xs={12} sm={6} md={4}>
                            <label className="form-label small fw-semibold text-muted">País</label>
                            <CInputGroup>
                                <CInputGroupText>
                                    <CIcon icon={cilGlobeAlt} />
                                </CInputGroupText>
                                <CFormInput
                                    name="PAIS_LIBROS"
                                    placeholder="Ej: Ecuador, México, España"
                                />
                            </CInputGroup>
                        </CCol>

                        <CCol xs={12} sm={6} md={4}>
                            <label className="form-label small fw-semibold text-muted">Código de Barras:</label>
                            <CInputGroup>
                                <CInputGroupText>
                                    <CIcon icon={cilBarcode} />
                                </CInputGroupText>
                                <CFormInput
                                    name="CODIGODEBARRAS_LIBROS"
                                    placeholder="0 000000 000000"
                                />
                            </CInputGroup>
                        </CCol>

                        <CCol xs={12} className="mt-4">
                            <div className="d-flex align-items-center gap-2 pb-2 border-bottom fw-semibold">
                                <span>FORMATO Y EJEMPLAR</span>
                            </div>
                        </CCol>

                        <CCol xs={12} sm={6} md={4}>
                            <label className="form-label small fw-semibold text-muted">Precio</label>
                            <CInputGroup>
                                <CInputGroupText>
                                    <CIcon icon={cilDollar} />
                                </CInputGroupText>
                                <CFormInput
                                    type="number"
                                    step="0.01"
                                    name="PRECIO_LIBROS"
                                    placeholder="0.00"
                                />
                            </CInputGroup>
                        </CCol>

                        <CCol xs={12} sm={6} md={4}>
                            <label className="form-label small fw-semibold text-muted">Formato</label>
                            <CInputGroup>
                                <CInputGroupText>
                                    <CIcon icon={cilDescription} />
                                </CInputGroupText>
                                <CFormSelect
                                    name="NOMBRE_FORMATOS"
                                >
                                </CFormSelect>
                            </CInputGroup>
                        </CCol>

                        <CCol xs={12} sm={6} md={4}>
                            <label className="form-label small fw-semibold text-muted">Tipo de Libro</label>
                            <CInputGroup>
                                <CInputGroupText>
                                    <CIcon icon={cilBook} />
                                </CInputGroupText>
                                <CFormSelect
                                    name="NOMBRE_TIPO"
                                >
                                </CFormSelect>
                            </CInputGroup>
                        </CCol>

                        <CCol xs={12} sm={6} md={4}>
                            <label className="form-label small fw-semibold text-muted">Título Tejuelo</label>
                            <CInputGroup>
                                <CInputGroupText>
                                    <CIcon icon={cilTag} />
                                </CInputGroupText>
                                <CFormInput
                                    name="TITULOTEJUELO_LIBROS"
                                    placeholder="Abreviatura del título"
                                />
                            </CInputGroup>
                        </CCol>

                        <CCol xs={12} sm={6} md={4}>
                            <label className="form-label small fw-semibold text-muted">Autor Tejuelo</label>
                            <CInputGroup>
                                <CInputGroupText>
                                    <CIcon icon={cilUser} />
                                </CInputGroupText>
                                <CFormInput
                                    name="AUTORTEJUELO_LIBROS"
                                    placeholder="Código de autor"
                                />
                            </CInputGroup>
                        </CCol>
                        <CCol xs={12} sm={6} md={4}>
                            <label className="form-label small fw-semibold text-muted">Estado del Libro</label>
                            <CInputGroup>
                                <CInputGroupText>
                                    <CIcon icon={cilCheckCircle} />
                                </CInputGroupText>
                                <CFormSelect
                                    name="ESTADO_LIBROS"
                                >
                                </CFormSelect>
                            </CInputGroup>
                        </CCol>

                        <CCol xs={12}>
                            <label className="form-label small fw-semibold text-muted">Detalles:</label>
                            <CFormTextarea
                                name="DESCRIPCION_LIBROS"
                                rows={3}
                                placeholder="Notas o descripción adicional del libro..."
                            />
                        </CCol>
                    </CForm>
                </CModalBody>

                <CModalFooter className="bg-body d-flex justify-content-end gap-2">
                    <CButton
                        color="danger"
                        variant="ghost"
                    >
                        <CIcon icon={cilExitToApp} className="me-1" />
                        Cerrar
                    </CButton>
                </CModalFooter>
            </CModal>
        </>
    )
}

export default Registro_bk