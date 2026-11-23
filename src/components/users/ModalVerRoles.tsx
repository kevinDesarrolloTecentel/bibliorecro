import React from 'react'
import {
    CBadge,
    CButton,
    CModal,
    CModalBody,
    CModalFooter,
    CModalHeader,
    CModalTitle,
    CSpinner,
    CTable,
    CTableBody,
    CTableDataCell,
    CTableHead,
    CTableHeaderCell,
    CTableRow,
} from "@coreui/react-pro"
import CIcon from "@coreui/icons-react"
import { cilExitToApp, cilShieldAlt, cilUser } from "@coreui/icons"
import { AdminRol } from "@/models/adm/rol.model"

interface ModalVerRolesProps {
    visible: boolean
    setVisible: (v: boolean) => void
    roles: AdminRol[]
    loading?: boolean
    userName?: string
}

const ModalVerRoles: React.FC<ModalVerRolesProps> = ({
    visible,
    setVisible,
    roles,
    loading = false,
    userName = '',
}) => {
    return (
        <CModal
            visible={visible}
            onClose={() => setVisible(false)}
            size="lg"
            alignment="center"
        >
            <CModalHeader className="border-bottom py-3 px-4 bg-body-tertiary">
                <CModalTitle className="d-flex align-items-center gap-2 fs-5 fw-bold text-body">
                    <CIcon icon={cilShieldAlt} size="lg" className="text-body" />
                    <span>Roles Asignados al Usuario</span>
                </CModalTitle>
            </CModalHeader>

            <CModalBody className="p-4 bg-body">
                {/* Cabecera del usuario */}
                <div className="d-flex flex-wrap justify-content-between align-items-center pb-3 mb-3 border-bottom bg-body-tertiary p-3 rounded-3">
                    <div className="d-flex align-items-center gap-2">
                        <CIcon icon={cilUser} className="text-primary" />
                        <span className="text-body-secondary small">Usuario:</span>
                        <strong className="text-body">{userName || 'Usuario Actual'}</strong>
                    </div>
                    <CBadge color="primary" shape="rounded-pill" className="px-3 py-2">
                        {roles.length} {roles.length === 1 ? 'Rol asignado' : 'Roles asignados'}
                    </CBadge>
                </div>

                {loading ? (
                    <div className="text-center py-5">
                        <CSpinner color="primary" />
                        <div className="text-body-secondary small mt-2">Cargando roles...</div>
                    </div>
                ) : roles.length > 0 ? (
                    <div className="table-responsive">
                        <CTable hover striped bordered align="middle" className="mb-0 text-center">
                            <CTableHead className="bg-body-tertiary">
                                <CTableRow>
                                    <CTableHeaderCell style={{ width: '15%' }} className="text-body-secondary py-2">#</CTableHeaderCell>
                                    <CTableHeaderCell style={{ width: '60%' }} className="text-start text-body-secondary py-2">Nombre del Rol</CTableHeaderCell>
                                    <CTableHeaderCell style={{ width: '25%' }} className="text-body-secondary py-2">Nivel</CTableHeaderCell>
                                </CTableRow>
                            </CTableHead>
                            <CTableBody>
                                {roles.map((rol: AdminRol, index: number) => {
                                    const idRol = Number(rol.ID_ROL)
                                    const nombreRol = rol.NOMBRE_ROL || `Rol #${idRol}`
                                    const nivel = rol.NIVEL_ROL ?? '-'

                                    return (
                                        <CTableRow key={idRol}>
                                            <CTableDataCell className="fw-semibold text-body-secondary">
                                                {index + 1}
                                            </CTableDataCell>
                                            <CTableDataCell className="text-start">
                                                <span className="fw-bold text-body">
                                                    {nombreRol}
                                                </span>
                                            </CTableDataCell>
                                            <CTableDataCell>
                                                <CBadge
                                                    color={'secondary'}
                                                    shape="rounded-pill"
                                                    className="px-3 py-1 shadow-xs"
                                                >
                                                    Nivel {nivel}
                                                </CBadge>
                                            </CTableDataCell>
                                        </CTableRow>
                                    )
                                })}
                            </CTableBody>
                        </CTable>
                    </div>
                ) : (
                    <div className="text-center py-4 text-body-secondary">
                        <CIcon icon={cilShieldAlt} size="xxl" className="mb-2 text-body-secondary opacity-50" />
                        <p className="mb-0 small">No tienes roles asignados en el sistema.</p>
                    </div>
                )}
            </CModalBody>

            <CModalFooter className="border-top py-2 px-4 d-flex justify-content-end bg-body-tertiary">
                <CButton
                    color="secondary"
                    variant="outline"
                    size="sm"
                    className="d-flex align-items-center gap-1 shadow-sm"
                    onClick={() => setVisible(false)}
                >
                    <CIcon icon={cilExitToApp} className="me-1" />
                    <span>Cerrar</span>
                </CButton>
            </CModalFooter>
        </CModal>
    )
}

export default ModalVerRoles

