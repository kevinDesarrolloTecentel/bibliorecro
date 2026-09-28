import React from 'react'
import { CButton, CCol, CForm, CFormInput, CInputGroup, CInputGroupText, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle, CSpinner } from '@coreui/react-pro'
import CIcon from '@coreui/icons-react'
import { cilBookmark, cilExitToApp, cilSave, cilTag } from '@coreui/icons'
import useCategoria, { UseCategoriaProps } from '@/hooks/rco-libros/useCategoria'

export interface ModalCategoriaProps extends UseCategoriaProps {
  categoriaState?: ReturnType<typeof useCategoria>
}

const ModalCate: React.FC<ModalCategoriaProps> = (props) => {
  const internalHook = useCategoria({
    ...props,
    autoFetch: !props.categoriaState,
  })
  const hook = props.categoriaState || internalHook

  const {
    isVisible,
    handleClose,
    categoriaEnEdicion,
    codigoCategoria,
    setCodigoCategoria, 
    nombreCategoria,
    setNombreCategoria,
    guardando,
    handleGuardarCategoria,
  } = hook

  return (
    <>
      <CModal
        size="lg"
        visible={isVisible}
        onClose={handleClose}
        aria-labelledby="ModalCategoriaLabel"
        backdrop="static"
      >
        <CModalHeader closeButton className="bg-body">
          <CModalTitle id="ModalCategoriaLabel" className="d-flex align-items-center gap-2 fs-5 fw-bold text-dark">
            <CIcon icon={cilBookmark} size="lg" className="text-primary" />
            <span>
              {categoriaEnEdicion
                ? 'Editar Información de la Categoría'
                : 'Registrar Nueva Categoría'}
            </span>
          </CModalTitle>
        </CModalHeader>

        <CModalBody className="p-4">
          <CForm id="formModalCategoria" onSubmit={handleGuardarCategoria} className="row g-3">
            <CCol xs={12}>
              <div className="d-flex align-items-center gap-2 pb-2 border-bottom fw-semibold">
                <CIcon icon={cilBookmark} />
                <span>DATOS GENERALES DE LA CATEGORÍA</span>
              </div>
            </CCol>

            <CCol xs={12} md={4}>
              <label className="form-label small fw-semibold text-muted">
                Código Categoría <span className="text-danger">*</span>
              </label>
              <CInputGroup>
                <CInputGroupText className="bg-body">
                  <CIcon icon={cilTag} className="text-muted" />
                </CInputGroupText>
                <CFormInput
                  type="text"
                  placeholder="Ej: 001"
                  value={codigoCategoria}
                  onChange={(e) => setCodigoCategoria(e.target.value)}
                  required
                />
              </CInputGroup>
            </CCol>

            <CCol xs={12} md={8}>
              <label className="form-label small fw-semibold text-muted">
                Nombre de la Categoría <span className="text-danger">*</span>
              </label>
              <CInputGroup>
                <CInputGroupText className="bg-body">
                  <CIcon icon={cilBookmark} className="text-muted" />
                </CInputGroupText>
                <CFormInput
                  type="text"
                  placeholder="Ej: Ficción y Literatura"
                  value={nombreCategoria}
                  onChange={(e) => setNombreCategoria(e.target.value)}
                  required
                  autoFocus
                />
              </CInputGroup>
            </CCol>
          </CForm>
        </CModalBody>

        <CModalFooter className="bg-body d-flex justify-content-between align-items-center">
          <CButton color="danger" variant="outline" className='hover:text-white' onClick={handleClose} disabled={guardando}>
            <CIcon icon={cilExitToApp} className="me-1" />
            Cancelar
          </CButton>
          <CButton
            color="success"
            variant='outline'
            type="submit"
            form="formModalCategoria"
            disabled={guardando || !codigoCategoria.trim() || !nombreCategoria.trim()}
            className="d-flex align-items-center gap-1 shadow-sm hover:text-white"
          >
            {guardando ? (
              <>
                <CSpinner size="sm" className="me-1" />
                Guardando...
              </>
            ) : (
              <>
                <CIcon icon={cilSave} className="me-1" />
                {categoriaEnEdicion ? 'Actualizar Categoría' : 'Guardar Categoría'}
              </>
            )}
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default ModalCate