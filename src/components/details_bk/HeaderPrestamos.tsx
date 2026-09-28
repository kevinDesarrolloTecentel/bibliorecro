import React from 'react'
import { cilBook, cilReload, cilSearch, cilX } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { CButton, CCol, CFormInput, CInputGroup, CRow, CSpinner } from '@coreui/react-pro'
import usePrestamos from '@/hooks/rco-prestamos/usePrestamos'

interface HeaderPrestamosProps {
  prestamoState: ReturnType<typeof usePrestamos>
}

const HeaderPrestamos: React.FC<HeaderPrestamosProps> = ({ prestamoState }) => {
  const {
    loading,
    searchTerm,
    setSearchTerm,
    handleBuscar,
    handleLimpiarBusqueda,
    fetchPrestamos,
    setModalRegister,
  } = prestamoState

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleBuscar()
    }
  }

  return (
    <CRow className="g-3 my-2 align-items-center justify-content-between">
      <CCol xs={12} md={6} lg={5}>
        <CInputGroup className="shadow-sm">
          <CFormInput
            type="text"
            placeholder="Buscar por cédula y título..."
            aria-label="Buscar préstamos"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={100}
            disabled={loading}
          />
          {searchTerm && (
            <CButton
              type="button"
              color="light"
              className="border"
              onClick={handleLimpiarBusqueda}
              title="Limpiar búsqueda"
            >
              <CIcon icon={cilX} />
            </CButton>
          )}
          <CButton
            type="button"
            style={{ backgroundColor: '#044c8c', borderColor: '#044c8c' }}
            className="text-white d-inline-flex align-items-center gap-1"
            onClick={handleBuscar}
            disabled={loading}
            title="Buscar"
          >
            {loading ? <CSpinner size="sm" /> : <CIcon icon={cilSearch} />}
            <span>Buscar</span>
          </CButton>
        </CInputGroup>
      </CCol>

      <CCol xs={12} md={6} lg={5} className="d-flex justify-content-md-end align-items-center gap-2">
        <CButton
          color="secondary"
          variant="outline"
          disabled={loading}
          className="d-flex align-items-center gap-1 shadow-sm"
          onClick={() => fetchPrestamos()}
          title="Actualizar tabla"
        >
          <CIcon icon={cilReload} className={loading ? 'rotate-animation' : ''} />
          <span>{loading ? 'Cargando...' : 'Actualizar'}</span>
        </CButton>

        <CButton
          style={{ backgroundColor: '#044c8c', borderColor: '#044c8c' }}
          className="text-white d-flex align-items-center gap-2 shadow-sm"
          onClick={() => setModalRegister(true)}
        >
          <CIcon icon={cilBook} size="lg" />
          <span className="fw-semibold">Nuevo Préstamo</span>
        </CButton>
      </CCol>
    </CRow>
  )
}

export default HeaderPrestamos
