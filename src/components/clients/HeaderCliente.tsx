
import usePersonas from '@/hooks/tab-persona/usePersonas'
import { cilSync, cilUserPlus } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { CButton } from '@coreui/react-pro'
const HeaderCliente = ({ personaState }: { personaState: ReturnType<typeof usePersonas> }) => {
  return (
    <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
      <div>
        <h3 className="fw-bold mb-1">Usuarios Registrados</h3>
        <p className="text-body-secondary mb-0">
          Directorio de lectores registrados, control de estados de inscripción y sanciones.
        </p>
      </div>
      <div className="d-flex align-items-center gap-2">
        <CButton
          color="secondary"
          variant="outline"
          size="sm"
          disabled={personaState.loading}
          className="d-flex align-items-center gap-1 shadow-sm"
          onClick={() => personaState.handleRecargar()}
          title="Refrescar lista y reiniciar filtros"
        >
          <CIcon icon={cilSync} className={`me-1 ${personaState.loading ? 'rotate-animation' : ''}`} />
          <span>{personaState.loading ? 'Refrescando...' : 'Refrescar'}</span>
        </CButton>
        {personaState.canCrearUsuario && (
          <CButton
            color="success"
            size="sm"
            variant="outline"
            className="hover:text-white shadow-sm" onClick={() => personaState.handleAbrirCrear ? personaState.handleAbrirCrear() : personaState.setModalRegister(true)}
          >
            <CIcon icon={cilUserPlus} className="me-1" />
            <span>Nuevo Usuario</span>
          </CButton>
        )}
      </div>
    </div>
  )
}

export default HeaderCliente
