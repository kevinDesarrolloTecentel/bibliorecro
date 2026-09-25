import React, { useState } from 'react'
import { CButton, CCard, CCardBody, CCol, CRow } from '@coreui/react-pro'
import CIcon from '@coreui/icons-react'
import { cilBan, cilBook, cilBookmark, cilCloudDownload,} from '@coreui/icons'
import LibBajaModal from '@/components/reportesModals/Inventario/LibBaja'
import LibCategoriaModal from '@/components/reportesModals/Inventario/LibCategoria'
import LibSistemaModal from '@/components/reportesModals/Inventario/LibSistema'

const RP_inv: React.FC = () => {
  const [visibleSistema, setVisibleSistema] = useState<boolean>(false)
  const [visibleCategoria, setVisibleCategoria] = useState<boolean>(false)
  const [visibleBaja, setVisibleBaja] = useState<boolean>(false)

  const reports = [
    {
      title: 'Libros del Sistema',
      icon:cilBook,
      description:
        'Personaliza tu análisis y obtén un informe detallado sobre la información de libros.',
      onOpen: () => setVisibleSistema(true),
    },
    {
      title: 'Libros por Categoría',
      icon: cilBookmark,
      description:
        'Personaliza tu análisis al obtener un informe detallado sobre la información de libros.',
      onOpen: () => setVisibleCategoria(true),
    },
    {
      title: 'Libros Dados de Baja',
      icon: cilBan,
      description:
        'Personaliza tu análisis y obtén un informe detallado sobre la información de libros.',
      onOpen: () => setVisibleBaja(true),
    },
  ]

  return (
    <div className="pb-4">
      <div className="mb-4">
        <h3 className="fw-bold mb-1">Reportes de Inventario</h3>
        <p className="text-body-secondary mb-0">
          Consulta y genera informes detallados sobre las existencias, clasificación y estado de los libros.
        </p>
      </div>

      <CRow className="g-4">
        {reports.map((item, index) => (
          <CCol key={index} xs={12} md={6} lg={4}>
            <CCard className="h-100 shadow-sm border-0">
              <CCardBody className="d-flex flex-column p-4">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <CIcon icon={item.icon} size="xl" style={{ color: '#044c8c' }} />
                </div>
                <h5 className="fw-bold mb-2">{item.title}</h5>
                <p className="text-body-secondary small flex-grow-1 mb-4">
                  {item.description}
                </p>

                <div className="mt-auto pt-2">
                  <CButton
                    color="primary"
                    variant="outline"
                    className="w-100 d-flex align-items-center justify-content-center gap-2"
                    onClick={item.onOpen}
                  >
                    <CIcon icon={cilCloudDownload} />
                    <span>Generar Reporte</span>
                  </CButton>
                </div>
              </CCardBody>
            </CCard>
          </CCol>
        ))}
      </CRow>

      <LibSistemaModal
        visible={visibleSistema}
        setVisible={setVisibleSistema}
      />

      <LibCategoriaModal
        visible={visibleCategoria}
        setVisible={setVisibleCategoria}
      />

      <LibBajaModal
        visible={visibleBaja}
        setVisible={setVisibleBaja}
      />
    </div>
  )
}

export default RP_inv