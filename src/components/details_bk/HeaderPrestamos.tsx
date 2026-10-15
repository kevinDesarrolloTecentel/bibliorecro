import React from 'react'
import { cilBook, cilReload } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { CButton } from '@coreui/react-pro'
import usePrestamos from '@/hooks/rco-prestamos/usePrestamos'
import { usePermissions } from '@/context/PermissionsContext'

interface HeaderPrestamosProps {
  prestamoState: ReturnType<typeof usePrestamos>
}

const HeaderPrestamos: React.FC<HeaderPrestamosProps> = ({ prestamoState }) => {
  const { canDoAction } = usePermissions()
  const { loading, handleRecargar, setModalRegister } = prestamoState

  return (
    <div className="d-flex justify-content-end align-items-center mb-3 gap-2">
      <CButton
        color="secondary"
        variant="outline"
        disabled={loading}
        className="hover:text-white d-flex align-items-center gap-1 shadow-sm"
        onClick={() => handleRecargar()}
        title="Recargar"
      >
        <CIcon icon={cilReload} className={`me-1 ${loading ? 'rotate-animation' : ''}`} />
        <span>{loading ? 'Cargando...' : 'Recargar'}</span>
      </CButton>
      {canDoAction('btn_crear_prestamo') && (
        <CButton
          color="primary"
          variant="outline"
          className="hover:text-white d-flex align-items-center gap-2 shadow-sm"
          onClick={() => setModalRegister(true)}
        >
          <CIcon icon={cilBook} className="me-1" />
          <span>Nuevo Préstamo</span>
        </CButton>
      )}
    </div>
  )
}

export default HeaderPrestamos
