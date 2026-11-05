import { useState, useEffect } from "react"
import usePersonaEdit, { UsePersonaEditProps } from "@/hooks/tab-persona/usePersonaEdit"
import {
    cilContact,
    cilEnvelopeClosed,
    cilExitToApp,
    cilGlobeAlt,
    cilHeart,
    cilImage,
    cilLocationPin,
    cilMobile,
    cilPencil,
    cilPeople,
    cilPhone,
    cilSave,
    cilUser
} from "@coreui/icons"
import CIcon from "@coreui/icons-react"
import {
    CButton,
    CCol,
    CDatePicker,
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
    CModalTitle,
    CSpinner
} from "@coreui/react-pro"
import { aFechaLocal } from "@/utils/dateUtils"
import { DEFAULT_RECREO_IMAGE } from "@/utils/imageUtils"


interface ModalEditProps extends UsePersonaEditProps { }

const ModalEditAvatar = ({ src }: { src?: string }) => {
    const [imgSrc, setImgSrc] = useState(src || DEFAULT_RECREO_IMAGE)

    useEffect(() => {
        setImgSrc(src || DEFAULT_RECREO_IMAGE)
    }, [src])

    return (
        <img
            src={imgSrc}
            alt="Foto del usuario"
            className="rounded-circle border border-2 border-primary shadow-sm object-fit-cover bg-white"
            style={{ width: '75px', height: '75px', minWidth: '75px' }}
            onError={() => {
                if (imgSrc !== DEFAULT_RECREO_IMAGE) {
                    setImgSrc(DEFAULT_RECREO_IMAGE)
                }
            }}
        />
    )
}

const Modal_Edit = (props: ModalEditProps) => {
    const {
        isVisible,
        formData,
        loading,
        tiposId,
        nacionalidades,
        generos,
        estadosCiviles,
        handleChange,
        handleDateChange,
        handleClose,
        handleSubmit,
        previewFoto,
        fotoActual,
        handleFotoChange,
        canActualizar,
        readOnly,
    } = usePersonaEdit(props)

    return (
        <CModal
            size="xl"
            visible={isVisible}
            onClose={handleClose}
            backdrop="static"
            scrollable
        >
            <CModalHeader closeButton className="bg-body">
                <CModalTitle className="d-flex align-items-center gap-2 fs-5 fw-bold">
                    <CIcon icon={readOnly ? cilUser : cilPencil} />
                    <span>{readOnly ? 'Visualización de Datos del Usuario' : 'Edición de Datos del Usuario'}</span>
                </CModalTitle>
            </CModalHeader>
            <CModalBody className="px-3 px-md-4 py-3">
                <CForm id="formEditUsuario" onSubmit={handleSubmit} className="row g-3">
                    <fieldset disabled={readOnly} className="row g-3 p-0 m-0 border-0">
                        <CCol xs={12} className="mt-2">
                            <div className="d-flex align-items-center gap-2 pb-2 border-bottom fw-bold text-secondary">
                                <CIcon icon={cilUser} />
                                <span>DATOS PERSONALES DEL USUARIO</span>
                            </div>
                        </CCol>

                        <CCol xs={12} sm={6} md={4}>
                            <label className="form-label small fw-semibold text-muted">Tipo de Identificación</label>
                            <CInputGroup>
                                <CInputGroupText>
                                    <CIcon icon={cilContact} />
                                </CInputGroupText>
                                <CFormSelect
                                    name="ID_TIPOIDENTIFICACION"
                                    value={String(formData.ID_TIPOIDENTIFICACION || '')}
                                    onChange={handleChange}
                                >
                                    <option value="">Seleccione tipo...</option>
                                    {tiposId.map(tipo => (
                                        <option key={tipo.id} value={tipo.id}>
                                            {tipo.nombre}
                                        </option>
                                    ))}
                                </CFormSelect>
                            </CInputGroup>
                        </CCol>

                        <CCol xs={12} sm={6} md={4}>
                            <div className="d-flex justify-content-between align-items-center mb-1">
                                <label className="form-label small fw-semibold text-muted mb-0">Nº de Identificación</label>
                            </div>
                            <CInputGroup>
                                <CInputGroupText>
                                    <CIcon icon={cilContact} />
                                </CInputGroupText>
                                <CFormInput
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={10}
                                    name="IDENTIFICACION_PERSONA"
                                    placeholder="Ej: 1725608090"
                                    value={formData.IDENTIFICACION_PERSONA || ''}
                                    onChange={handleChange}
                                    required
                                />
                            </CInputGroup>
                        </CCol>

                        <CCol xs={12} sm={6} md={4}>
                            <label className="form-label small fw-semibold text-muted">Fecha de Nacimiento</label>
                            <CDatePicker
                                locale="es-ES"
                                inputReadOnly
                                placeholder="Seleccione fecha"
                                date={aFechaLocal(formData.FECHA_PERSONA)}
                                maxDate={new Date()}
                                onDateChange={(val) => handleDateChange(val)}
                                cleaner={!readOnly}
                                disabled={readOnly}
                            />
                        </CCol>

                        <CCol xs={12} md={4}>
                            <label className="form-label small fw-semibold text-muted">Nombres:</label>
                            <CInputGroup>
                                <CInputGroupText>
                                    <CIcon icon={cilUser} />
                                </CInputGroupText>
                                <CFormInput
                                    type="text"
                                    name="NOMBRE_PERSONA"
                                    placeholder="Ej: Juan Carlos"
                                    value={formData.NOMBRE_PERSONA || ''}
                                    onChange={handleChange}
                                    required
                                />
                            </CInputGroup>
                        </CCol>

                        <CCol xs={12} md={4}>
                            <label className="form-label small fw-semibold text-muted">Apellidos:</label>
                            <CInputGroup>
                                <CInputGroupText>
                                    <CIcon icon={cilUser} />
                                </CInputGroupText>
                                <CFormInput
                                    type="text"
                                    name="APELLIDO_PERSONA"
                                    placeholder="Ej: Pérez Gómez"
                                    value={formData.APELLIDO_PERSONA || ''}
                                    onChange={handleChange}
                                    required
                                />
                            </CInputGroup>
                        </CCol>

                        <CCol xs={12} sm={6} md={4}>
                            <label className="form-label small fw-semibold text-muted">Edad:</label>
                            <CInputGroup>
                                <CInputGroupText className="bg-body-secondary">
                                    <CIcon icon={cilUser} />
                                </CInputGroupText>
                                <CFormInput
                                    type="text"
                                    name="EDAD_PERSONA"
                                    placeholder="No calculada"
                                    value={
                                        formData.EDAD_PERSONA
                                            ? String(formData.EDAD_PERSONA).includes('año')
                                                ? formData.EDAD_PERSONA
                                                : `${formData.EDAD_PERSONA} años`
                                            : 'No registrada'
                                    }
                                    disabled
                                    readOnly
                                    className="bg-body-secondary text-secondary fw-semibold cursor-not-allowed"
                                />
                            </CInputGroup>
                        </CCol>

                        <CCol xs={12} sm={6} md={4}>
                            <label className="form-label small fw-semibold text-muted">Nacionalidad:</label>
                            <CInputGroup>
                                <CInputGroupText>
                                    <CIcon icon={cilGlobeAlt} />
                                </CInputGroupText>
                                <CFormSelect
                                    name="ID_NACIONALIDAD"
                                    value={String(formData.ID_NACIONALIDAD || '')}
                                    onChange={handleChange}
                                >
                                    <option value="">Seleccione nacionalidad...</option>
                                    {nacionalidades.map(nac => (
                                        <option key={nac.id} value={nac.id}>
                                            {nac.nombre}
                                        </option>
                                    ))}
                                </CFormSelect>
                            </CInputGroup>
                        </CCol>

                        <CCol xs={12} sm={6} md={4}>
                            <label className="form-label small fw-semibold text-muted">Género:</label>
                            <CInputGroup>
                                <CInputGroupText>
                                    <CIcon icon={cilPeople} />
                                </CInputGroupText>
                                <CFormSelect
                                    name="ID_GENERO"
                                    value={String(formData.ID_GENERO || '')}
                                    onChange={handleChange}
                                >
                                    <option value="">Seleccione género...</option>
                                    {generos.map(gen => (
                                        <option key={gen.id} value={gen.id}>
                                            {gen.nombre}
                                        </option>
                                    ))}
                                </CFormSelect>
                            </CInputGroup>
                        </CCol>

                        <CCol xs={12} sm={6} md={4}>
                            <label className="form-label small fw-semibold text-muted">Estado Civil:</label>
                            <CInputGroup>
                                <CInputGroupText>
                                    <CIcon icon={cilHeart} />
                                </CInputGroupText>
                                <CFormSelect
                                    name="ID_ESTADOCIVIL"
                                    value={String(formData.ID_ESTADOCIVIL || '')}
                                    onChange={handleChange}
                                >
                                    <option value="">Seleccione estado civil...</option>
                                    {estadosCiviles.map(est => (
                                        <option key={est.id} value={est.id}>
                                            {est.nombre}
                                        </option>
                                    ))}
                                </CFormSelect>
                            </CInputGroup>
                        </CCol>

                        <CCol xs={12}>
                            <CFormTextarea
                                name="DETALLE_PERSONA"
                                label="Descripción:"
                                placeholder="Ingrese descripción del usuario..."
                                rows={3}
                                value={formData.DETALLE_PERSONA || ''}
                                onChange={handleChange}
                            />
                        </CCol>

                        <CCol xs={12} sm={12}>
                            <label className="form-label small fw-semibold text-muted">Fotografía del Usuario:</label>
                            {!readOnly && (
                                <CInputGroup>
                                    <CInputGroupText>
                                        <CIcon icon={cilImage} />
                                    </CInputGroupText>
                                    <CFormInput
                                        type="file"
                                        name="FOTO_PERSONA"
                                        accept="image/*"
                                        onChange={handleFotoChange}
                                    />
                                </CInputGroup>
                            )}
                            {(previewFoto || fotoActual) ? (
                                <div className="mt-2 d-flex align-items-center gap-3 p-2 bg-body rounded border shadow-sm">
                                    <ModalEditAvatar src={previewFoto || fotoActual} />
                                    <div>
                                        <span className="fw-semibold d-block small text-body">
                                            {previewFoto ? 'Nueva fotografía seleccionada' : 'Fotografía actual'}
                                        </span>
                                        <span className="text-muted small">
                                            {previewFoto ? 'La fotografía será actualizada al guardar.' : 'Fotografía registrada actualmente.'}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-2 d-flex align-items-center gap-3 p-2 bg-body-tertiary rounded border border-dashed">
                                    <div
                                        className="rounded-circle border border-2 border-secondary d-flex align-items-center justify-content-center bg-body-secondary text-secondary"
                                        style={{ width: '75px', height: '75px', minWidth: '75px', userSelect: 'none' }}
                                    >
                                        <CIcon icon={cilUser} size="xl" className="text-secondary opacity-50" />
                                    </div>
                                    <div>
                                        <span className="fw-semibold d-block small text-body">Sin fotografía</span>
                                        <span className="text-muted small">El usuario no tiene una fotografía registrada.</span>
                                    </div>
                                </div>
                            )}
                        </CCol>

                        <CCol xs={12} className="mt-4">
                            <div className="d-flex align-items-center gap-2 pb-2 border-bottom fw-bold text-secondary">
                                <CIcon icon={cilLocationPin} />
                                <span>DATOS DE CONTACTO Y UBICACIÓN</span>
                            </div>
                        </CCol>

                        <CCol xs={12} md={4}>
                            <label className="form-label small fw-semibold text-muted">Correo Electrónico:</label>
                            <CInputGroup>
                                <CInputGroupText>
                                    <CIcon icon={cilEnvelopeClosed} />
                                </CInputGroupText>
                                <CFormInput
                                    type="email"
                                    name="CORREO_PERSONA"
                                    placeholder="Ej: usuario@correo.com"
                                    value={formData.CORREO_PERSONA || ''}
                                    onChange={handleChange}
                                />
                            </CInputGroup>
                        </CCol>

                        <CCol xs={12} sm={6} md={4}>
                            <div className="d-flex justify-content-between align-items-center mb-1">
                                <label className="form-label small fw-semibold text-muted mb-0">Teléfono fijo:</label>
                            </div>
                            <CInputGroup>
                                <CInputGroupText>
                                    <CIcon icon={cilPhone} />
                                </CInputGroupText>
                                <CFormInput
                                    type="tel"
                                    inputMode="numeric"
                                    maxLength={10}
                                    name="TELEFONO_PERSONA"
                                    placeholder="Ej: 2073303 o 022345678"
                                    value={formData.TELEFONO_PERSONA || ''}
                                    onChange={handleChange}
                                />
                            </CInputGroup>
                        </CCol>

                        <CCol xs={12} sm={6} md={4}>
                            <div className="d-flex justify-content-between align-items-center mb-1">
                                <label className="form-label small fw-semibold text-muted mb-0">Teléfono Celular:</label>
                            </div>
                            <CInputGroup>
                                <CInputGroupText>
                                    <CIcon icon={cilMobile} />
                                </CInputGroupText>
                                <CFormInput
                                    type="tel"
                                    inputMode="numeric"
                                    maxLength={10}
                                    name="CELULAR_PERSONA"
                                    placeholder="Ej: 0991234567"
                                    value={formData.CELULAR_PERSONA || ''}
                                    onChange={handleChange}
                                />
                            </CInputGroup>
                        </CCol>

                        <CCol xs={12}>
                            <label className="form-label small fw-semibold text-muted">Dirección Domiciliaria:</label>
                            <CInputGroup>
                                <CInputGroupText>
                                    <CIcon icon={cilLocationPin} />
                                </CInputGroupText>
                                <CFormInput
                                    type="text"
                                    name="DIRECCION_PERSONA"
                                    placeholder="Ej: Av. Maldonado y El Recreo, Quito"
                                    value={formData.DIRECCION_PERSONA || ''}
                                    onChange={handleChange}
                                />
                            </CInputGroup>
                        </CCol>
                    </fieldset>
                </CForm>
            </CModalBody>
            <CModalFooter className="bg-body d-flex justify-content-end gap-2">
                <CButton
                    color={readOnly ? "secondary" : "danger"}
                    variant="outline"
                    className="hover:text-white shadow-sm"
                    disabled={loading}
                    size="sm"
                    onClick={handleClose}
                >
                    <CIcon icon={cilExitToApp} className="me-1" />
                    {readOnly ? 'Cerrar' : 'Cancelar'}
                </CButton>
                {!readOnly && canActualizar && (
                    <CButton
                        color="primary"
                        variant="outline"
                        type="submit"
                        size="sm"
                        form="formEditUsuario"
                        disabled={loading}
                        className="hover:text-white shadow-sm"
                    >
                        {loading ? (
                            <>
                                <CSpinner size="sm" className="me-1" />
                                Actualizando...
                            </>
                        ) : (
                            <>
                                <CIcon icon={cilSave} className="me-1" />
                                <span>Actualizar Usuario</span>
                            </>
                        )}
                    </CButton>
                )}
            </CModalFooter>
        </CModal>
    )
}

export default Modal_Edit
