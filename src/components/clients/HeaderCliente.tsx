
import usePersonas from '@/hooks/tab-persona/usePersonas'
import { cilReload, cilUserPlus } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { CButton } from '@coreui/react-pro'

const HeaderCliente = ({ personaState }: { personaState: ReturnType<typeof usePersonas> }) => {
  return (
    <div className="d-flex justify-content-end align-items-center mb-3 gap-2">
      <CButton
        color="secondary"
        variant="outline"
        disabled={personaState.loading}
        className="hover:text-white d-flex align-items-center gap-1 shadow-sm"
        onClick={() => personaState.fetchPersonas(1, undefined, undefined, true)}
        title="Recargar"
      >
        <CIcon icon={cilReload} className={`me-1 ${personaState.loading ? 'rotate-animation' : ''}`} />
        <span>{personaState.loading ? 'Cargando...' : 'Recargar'}</span>
      </CButton>
      <CButton
        color="primary"
        variant="outline"
        className="hover:text-white d-flex align-items-center gap-2 shadow-sm"
        onClick={() => personaState.setModalRegister(true)}
      >
        <CIcon icon={cilUserPlus} className="me-1" />
        <span>Nuevo Usuario</span>
      </CButton>
    </div>
  )
}

export default HeaderCliente
