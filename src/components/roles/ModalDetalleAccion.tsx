import React from 'react'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CBadge,
} from '@coreui/react-pro'
import CIcon from '@coreui/icons-react'
import { cilInfo } from '@coreui/icons'
import { Accion, Pantalla } from '@/models/adm/permiso.model'

interface ModalDetalleAccionProps {
  visible: boolean
  onClose: () => void
  accion: Accion | null
  pantalla?: Pantalla | null
}

export const ModalDetalleAccion: React.FC<ModalDetalleAccionProps> = ({
  visible,
  onClose,
  accion,
  pantalla,
}) => {
  return (
    <>
      {visible && (
        <style>{`
          .modal-backdrop ~ .modal-backdrop {
            z-index: 1060 !important;
            opacity: 0.65 !important;
            background-color: #000 !important;
          }
          .modal-detalle-accion {
            z-index: 1065 !important;
          }
          .modal-detalle-accion .modal-content {
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5) !important;
            border: 1px solid rgba(0, 0, 0, 0.1) !important;
          }
        `}</style>
      )}

      <CModal
        visible={visible}
        onClose={onClose}
        alignment="center"
        className="modal-detalle-accion"
      >
        <CModalHeader className="border-bottom py-3 px-4 bg-body-tertiary">
          <CModalTitle className="d-flex align-items-center gap-2 text-body fs-6 fw-bold">
            <CIcon icon={cilInfo} className="text-primary me-1" size="lg" />
            Detalle de la Acción
          </CModalTitle>
        </CModalHeader>

        <CModalBody className="p-4">
          {accion && (
            <div className="d-flex flex-column gap-3">
              <div>
                <span
                  className="text-secondary small fw-bold text-uppercase d-block mb-1"
                  style={{ fontSize: '0.72rem', letterSpacing: '0.5px' }}
                >
                  Nombre de la Acción
                </span>
                <h5 className="fw-bold text-body mb-0">
                  {accion.NOMBRE_ACCION}
                </h5>
              </div>

              {pantalla && (
                <div>
                  <span
                    className="text-secondary small fw-bold text-uppercase d-block mb-1"
                    style={{ fontSize: '0.72rem', letterSpacing: '0.5px' }}
                  >
                    Pantalla
                  </span>
                  <CBadge
                    color="secondary"
                    className="px-2.5 py-1 text-wrap"
                    style={{ fontSize: '0.8rem' }}
                  >
                    {pantalla.NOMBRE_PERMISO}
                  </CBadge>
                </div>
              )}

              <div className="p-3 rounded-3 bg-body-tertiary border mt-1">
                <span
                  className="text-secondary small fw-bold text-uppercase d-block mb-1.5"
                  style={{ fontSize: '0.72rem', letterSpacing: '0.5px' }}
                >
                  Descripción
                </span>
                <p
                  className="text-body mb-0"
                  style={{
                    fontSize: '0.9rem',
                    lineHeight: '1.5',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {accion.DESCRIPCION_ACCION &&
                  accion.DESCRIPCION_ACCION.trim() !== ''
                    ? accion.DESCRIPCION_ACCION
                    : 'No se ha registrado una descripción detallada para esta acción.'}
                </p>
              </div>
            </div>
          )}
        </CModalBody>

        <CModalFooter className="border-top py-2 px-4 bg-body-tertiary">
        <CButton size="sm" color="secondary" className="hover:text-white shadow-sm" variant="ghost" onClick={onClose}>
          Cerrar
        </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default ModalDetalleAccion

