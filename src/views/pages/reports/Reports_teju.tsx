import ImpresionTej from '@/components/reportesModals/Tejuelo/ImpresionTej'
import CIcon from "@coreui/icons-react"
import { cilTag } from '@coreui/icons'

const Rep_teju = () => {
  return (
    <div className="pb-4">
      <div className="mb-4">

        <h3 className="fw-bold mb-1 text-body d-flex align-items-center gap-2">
          <CIcon icon={cilTag} size="lg" style={{ color: '#12358dff' }} />
          <span>Reportes de Tejuelos</span>
        </h3>
        <p className="text-body-secondary mb-0">
          Gestión de los tejuelos para los libros del sistema.
        </p>
      </div>
      <ImpresionTej />
    </div>
  )
}

export default Rep_teju