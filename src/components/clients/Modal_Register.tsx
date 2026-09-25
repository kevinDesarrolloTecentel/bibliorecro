import usePersonaRegister, { UsePersonaRegisterProps } from "@/hooks/tab-persona/usePersonaRegister"
import {
    cilCalendar,
    cilContact,
    cilDescription,
    cilEnvelopeClosed,
    cilExitToApp,
    cilGlobeAlt,
    cilHeart,
    cilImage,
    cilLocationPin,
    cilMobile,
    cilPeople,
    cilPhone,
    cilSave,
    cilUser,
    cilUserPlus
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
    CModalTitle,
    CSpinner
} from "@coreui/react-pro"

interface ModalRegisterProps extends UsePersonaRegisterProps { }

const Modal_Register = (props: ModalRegisterProps) => {
    const {
        isVisible,
        formData,
        errors,
        loading,
        tiposId,
        nacionalidades,
        generos,
        estadosCiviles,
        handleChange,
        handleBlur,
        handleClose,
        handleSubmit,
        previewFoto,
        handleFotoChange
    } = usePersonaRegister(props)

    return (
        <CModal
            size="xl"
            visible={isVisible}
            onClose={handleClose}
            aria-labelledby="ModalRegistroUsuarioLabel"
            scrollable
            backdrop="static"
        >
            <CModalHeader closeButton className="bg-body">
                <CModalTitle id="ModalRegistroUsuarioLabel" className="d-flex align-items-center gap-2 fs-5 fw-bold">
                    <CIcon icon={cilUserPlus} size="lg" />
                    <span>Registro de Nuevo Usuario</span>
                </CModalTitle>
            </CModalHeader>

            <CModalBody className="px-3 px-md-4 py-3">
                <CForm id="formRegistroUsuario" onSubmit={handleSubmit} noValidate className="row g-3">
                    <CCol xs={12} className="mt-2">
                        <div className="d-flex align-items-center gap-2 pb-2 border-bottom fw-bold text-secondary">
                            <CIcon icon={cilUser} />
                            <span>DATOS PERSONALES DEL USUARIO</span>
                        </div>
                    </CCol>

                    <CCol xs={12} sm={6} md={4}>
                        <label className="form-label small fw-semibold text-muted">Tipo de Identificación <span className="text-danger">*</span></label>
                        <CInputGroup>
                            <CInputGroupText>
                                <CIcon icon={cilContact} />
                            </CInputGroupText>
                            <CFormSelect
                                name="ID_TIPOIDENTIFICACION"
                                value={String(formData.ID_TIPOIDENTIFICACION || '')}
                                onChange={handleChange}
                                onBlur={() => handleBlur('ID_TIPOIDENTIFICACION')}
                                invalid={!!errors.ID_TIPOIDENTIFICACION}
                            >
                                <option value="">Seleccione tipo...</option>
                                {tiposId.map(tipo => (
                                    <option key={tipo.id} value={tipo.id}>
                                        {tipo.nombre}
                                    </option>
                                ))}
                            </CFormSelect>
                        </CInputGroup>
                        {errors.ID_TIPOIDENTIFICACION && (
                            <div className="text-danger small mt-1">{errors.ID_TIPOIDENTIFICACION}</div>
                        )}
                    </CCol>

                    <CCol xs={12} sm={6} md={4}>
                        <div className="d-flex justify-content-between align-items-center mb-1">
                            <label className="form-label small fw-semibold text-muted mb-0">Nº de Identificación <span className="text-danger">*</span></label>
                        </div>
                        <CInputGroup>
                            <CInputGroupText>
                                <CIcon icon={cilContact} />
                            </CInputGroupText>
                            <CFormInput
                                type="text"
                                inputMode="numeric"
                                maxLength={110}
                                name="IDENTIFICACION_PERSONA"
                                placeholder="Ej: 1725608090"
                                value={formData.IDENTIFICACION_PERSONA || ''}
                                onChange={handleChange}
                                onBlur={() => handleBlur('IDENTIFICACION_PERSONA')}
                                invalid={!!errors.IDENTIFICACION_PERSONA}
                            />
                        </CInputGroup>
                        {errors.IDENTIFICACION_PERSONA && (
                            <div className="text-danger small mt-1">{errors.IDENTIFICACION_PERSONA}</div>
                        )}
                    </CCol>

                    <CCol xs={12} sm={6} md={4}>
                        <label className="form-label small fw-semibold text-muted">Fecha de Nacimiento <span className="text-danger">*</span></label>
                        <CInputGroup>
                            <CInputGroupText>
                                <CIcon icon={cilCalendar} />
                            </CInputGroupText>
                            <CFormInput
                                type="date"
                                name="FECHA_PERSONA"
                                max={new Date().toISOString().split('T')[0]}
                                value={formData.FECHA_PERSONA || ''}
                                onChange={handleChange}
                                onBlur={() => handleBlur('FECHA_PERSONA')}
                                invalid={!!errors.FECHA_PERSONA}
                            />
                        </CInputGroup>
                        {errors.FECHA_PERSONA && (
                            <div className="text-danger small mt-1">{errors.FECHA_PERSONA}</div>
                        )}
                    </CCol>

                    <CCol xs={12} md={6}>
                        <label className="form-label small fw-semibold text-muted" >Nombres: <span className="text-danger">*</span></label>
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
                                onBlur={() => handleBlur('NOMBRE_PERSONA')}
                                invalid={!!errors.NOMBRE_PERSONA}
                            />
                        </CInputGroup>
                        {errors.NOMBRE_PERSONA && (
                            <div className="text-danger small mt-1">{errors.NOMBRE_PERSONA}</div>
                        )}
                    </CCol>

                    <CCol xs={12} md={6}>
                        <label className="form-label small fw-semibold text-muted">Apellidos: <span className="text-danger">*</span></label>
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
                                onBlur={() => handleBlur('APELLIDO_PERSONA')}
                                invalid={!!errors.APELLIDO_PERSONA}
                            />
                        </CInputGroup>
                        {errors.APELLIDO_PERSONA && (
                            <div className="text-danger small mt-1">{errors.APELLIDO_PERSONA}</div>
                        )}
                    </CCol>

                    <CCol xs={12} sm={6} md={4}>
                        <label className="form-label small fw-semibold text-muted">Nacionalidad: <span className="text-danger">*</span></label>
                        <CInputGroup>
                            <CInputGroupText>
                                <CIcon icon={cilGlobeAlt} />
                            </CInputGroupText>
                            <CFormSelect
                                name="ID_NACIONALIDAD"
                                value={String(formData.ID_NACIONALIDAD || '')}
                                onChange={handleChange}
                                onBlur={() => handleBlur('ID_NACIONALIDAD')}
                                invalid={!!errors.ID_NACIONALIDAD}
                            >
                                <option value="">Seleccione nacionalidad...</option>
                                {nacionalidades.map(nac => (
                                    <option key={nac.id} value={nac.id}>
                                        {nac.nombre}
                                    </option>
                                ))}
                            </CFormSelect>
                        </CInputGroup>
                        {errors.ID_NACIONALIDAD && (
                            <div className="text-danger small mt-1">{errors.ID_NACIONALIDAD}</div>
                        )}
                    </CCol>

                    <CCol xs={12} sm={6} md={4}>
                        <label className="form-label small fw-semibold text-muted">Género: <span className="text-danger">*</span></label>
                        <CInputGroup>
                            <CInputGroupText>
                                <CIcon icon={cilPeople} />
                            </CInputGroupText>
                            <CFormSelect
                                name="ID_GENERO"
                                value={String(formData.ID_GENERO || '')}
                                onChange={handleChange}
                                onBlur={() => handleBlur('ID_GENERO')}
                                invalid={!!errors.ID_GENERO}
                            >
                                <option value="">Seleccione género...</option>
                                {generos.map(gen => (
                                    <option key={gen.id} value={gen.id}>
                                        {gen.nombre}
                                    </option>
                                ))}
                            </CFormSelect>
                        </CInputGroup>
                        {errors.ID_GENERO && (
                            <div className="text-danger small mt-1">{errors.ID_GENERO}</div>
                        )}
                    </CCol>

                    <CCol xs={12} sm={6} md={4}>
                        <label className="form-label small fw-semibold text-muted">Estado Civil: <span className="text-danger">*</span></label>
                        <CInputGroup>
                            <CInputGroupText>
                                <CIcon icon={cilHeart} />
                            </CInputGroupText>
                            <CFormSelect
                                name="ID_ESTADOCIVIL"
                                value={String(formData.ID_ESTADOCIVIL || '')}
                                onChange={handleChange}
                                onBlur={() => handleBlur('ID_ESTADOCIVIL')}
                                invalid={!!errors.ID_ESTADOCIVIL}
                            >
                                <option value="">Seleccione estado civil...</option>
                                {estadosCiviles.map(est => (
                                    <option key={est.id} value={est.id}>
                                        {est.nombre}
                                    </option>
                                ))}
                            </CFormSelect>
                        </CInputGroup>
                        {errors.ID_ESTADOCIVIL && (
                            <div className="text-danger small mt-1">{errors.ID_ESTADOCIVIL}</div>
                        )}
                    </CCol>

                    <CCol xs={12} sm={12}>
                        <label className="form-label small fw-semibold text-muted">Foto del Usuario: <span className="text-danger">*</span></label>
                        <CInputGroup>
                            <CInputGroupText>
                                <CIcon icon={cilImage} />
                            </CInputGroupText>
                            <CFormInput
                                type="file"
                                name="FOTO_PERSONA"
                                accept="image/*"
                                onChange={handleFotoChange}
                                invalid={!!errors.FOTO_PERSONA}
                            />
                        </CInputGroup>
                        {errors.FOTO_PERSONA && (
                            <div className="text-danger small mt-1">{errors.FOTO_PERSONA}</div>
                        )}
                        {previewFoto && (
                            <div className="mt-2 d-flex align-items-center gap-3 p-2 bg-light rounded border shadow-sm">
                                <img
                                    src={previewFoto}
                                    alt="Vista previa"
                                    className="rounded-circle border border-2 border-primary shadow-sm object-fit-cover"
                                    style={{ width: '75px', height: '75px' }}
                                />
                                <div>
                                    <span className="fw-semibold d-block small text-dark">Vista previa seleccionada</span>
                                    <span className="text-muted small">Esta imagen se asociará al nuevo usuario.</span>
                                </div>
                            </div>
                        )}
                    </CCol>
                    <CCol xs={12}>
                        <CFormTextarea
                            name="DETALLE_PERSONA"
                            label="Descripción:"
                            placeholder="Ingrese información adicional del usuario..."
                            rows={3}
                            value={formData.DETALLE_PERSONA || ''}
                            onChange={handleChange}
                            onBlur={() => handleBlur('DETALLE_PERSONA')}
                            invalid={!!errors.DETALLE_PERSONA}
                        />
                        {errors.DETALLE_PERSONA && (
                            <div className="text-danger small mt-1">{errors.DETALLE_PERSONA}</div>
                        )}
                    </CCol>
                    <CCol xs={12} className="mt-4">
                        <div className="d-flex align-items-center gap-2 pb-2 border-bottom fw-bold text-secondary">
                            <CIcon icon={cilLocationPin} />
                            <span>DATOS DE CONTACTO Y UBICACIÓN</span>
                        </div>
                    </CCol>

                    <CCol xs={12} md={4}>
                        <label className="form-label small fw-semibold text-muted">Correo Electrónico: <span className="text-danger">*</span></label>
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
                                onBlur={() => handleBlur('CORREO_PERSONA')}
                                invalid={!!errors.CORREO_PERSONA}
                            />
                        </CInputGroup>
                        {errors.CORREO_PERSONA && (
                            <div className="text-danger small mt-1">{errors.CORREO_PERSONA}</div>
                        )}
                    </CCol>

                    <CCol xs={12} sm={6} md={4}>
                        <div className="d-flex justify-content-between align-items-center mb-1">
                            <label className="form-label small fw-semibold text-muted mb-0">Teléfono fijo: <span className="text-danger">*</span></label>
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
                                placeholder="Ej: 0223456780"
                                value={formData.TELEFONO_PERSONA || ''}
                                onChange={handleChange}
                                onBlur={() => handleBlur('TELEFONO_PERSONA')}
                                invalid={!!errors.TELEFONO_PERSONA}
                            />
                        </CInputGroup>
                        {errors.TELEFONO_PERSONA && (
                            <div className="text-danger small mt-1">{errors.TELEFONO_PERSONA}</div>
                        )}
                    </CCol>

                    <CCol xs={12} sm={6} md={4}>
                        <div className="d-flex justify-content-between align-items-center mb-1">
                            <label className="form-label small fw-semibold text-muted mb-0">Teléfono Celular: <span className="text-danger">*</span></label>
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
                                onBlur={() => handleBlur('CELULAR_PERSONA')}
                                invalid={!!errors.CELULAR_PERSONA}
                            />
                        </CInputGroup>
                        {errors.CELULAR_PERSONA && (
                            <div className="text-danger small mt-1">{errors.CELULAR_PERSONA}</div>
                        )}
                    </CCol>

                    <CCol xs={12}>
                        <label className="form-label small fw-semibold text-muted">Dirección Domiciliaria <span className="text-danger">*</span></label>
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
                                onBlur={() => handleBlur('DIRECCION_PERSONA')}
                                invalid={!!errors.DIRECCION_PERSONA}
                            />
                        </CInputGroup>
                        {errors.DIRECCION_PERSONA && (
                            <div className="text-danger small mt-1">{errors.DIRECCION_PERSONA}</div>
                        )}
                    </CCol>

                    <CCol xs={12} className="mt-4">
                        <div className="d-flex align-items-center gap-2 pb-2 border-bottom fw-bold text-secondary">
                            <CIcon icon={cilDescription} />
                            <span>INFORMACIÓN ADICIONAL</span>
                        </div>
                    </CCol>

                    <CCol xs={12}>
                        <CFormSelect
                            name="ESTADOINSCRIPCION_PERSONA"
                            label="Estado de Inscripción:"
                            value={String(formData.ESTADOINSCRIPCION_PERSONA ?? 'Activo')}
                            onChange={handleChange}
                        >
                            <option value="Activo">Activo</option>
                            <option value="Inactivo">Inactivo</option>
                        </CFormSelect>
                    </CCol>
                </CForm>
            </CModalBody>

            <CModalFooter className="bg-body d-flex justify-content-end gap-2">
                <CButton
                    color="danger"
                    variant="outline"
                    className="hover:text-white"
                    disabled={loading}
                    onClick={handleClose}
                >
                    <CIcon icon={cilExitToApp} className="me-1" />
                    Cancelar
                </CButton>
                <CButton
                    color="success"
                    variant="outline"
                    type="submit"
                    form="formRegistroUsuario"
                    disabled={loading}
                    className="hover:text-white d-flex align-items-center gap-1 shadow-sm"
                >
                    {loading ? (
                        <>
                            <CSpinner size="sm" className="me-1" />
                            Guardando...
                        </>
                    ) : (
                        <>
                            <CIcon icon={cilSave} className="me-1" />
                            <span>Guardar Usuario</span>
                        </>
                    )}
                </CButton>
            </CModalFooter>
        </CModal>
    )
}

export default Modal_Register