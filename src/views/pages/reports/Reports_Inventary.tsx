import React, { useState } from 'react'
import { CButton, CCard, CCardBody, CCol, CRow } from '@coreui/react-pro'
import CIcon from '@coreui/icons-react'
import {
  cilArrowRight,
  cilBan,
  cilBook,
  cilBookmark,
  cilCloudDownload,
  cilFilter,
  cilLockLocked,
  cilStorage
} from '@coreui/icons'
import LibBajaModal from '@/components/reportesModals/Inventario/LibBaja'
import LibCategoriaModal from '@/components/reportesModals/Inventario/LibCategoria'
import LibSistemaModal from '@/components/reportesModals/Inventario/LibSistema'
import { usePermissions } from '@/context/PermissionsContext'

const RP_inv: React.FC = () => {
  const { canDoAction } = usePermissions()

  const [visibleSistema, setVisibleSistema] = useState<boolean>(false)
  const [visibleCategoria, setVisibleCategoria] = useState<boolean>(false)
  const [visibleBaja, setVisibleBaja] = useState<boolean>(false)

  const reports = [
    {
      id: 'sistema',
      title: 'Libros del Sistema',
      filtroInfo: 'Listado de Libros',
      action: 'btn_libros_sistema',
      icon: cilBook,
      color: '#044c8c',
      bgLight: 'rgba(4, 76, 140, 0.12)',
      description:
        'Catálogo maestro y existencias de todos los libros registrados en el sistema bibliotecario.',
      onOpen: () => setVisibleSistema(true),
    },
    {
      id: 'categoria',
      title: 'Libros por Categoría',
      filtroInfo: 'Filtro por Categoría',
      action: 'btn_libros_categoria',
      icon: cilBookmark,
      color: '#FE9A37',
      bgLight: 'rgba(254, 154, 55, 0.12)',
      description:
        'Distribución y clasificación temática del fondo bibliográfico organizado por categorías y materias.',
      onOpen: () => setVisibleCategoria(true),
    },
    {
      id: 'baja',
      title: 'Libros Dados de Baja',
      filtroInfo: 'Filtro por Año',
      action: 'btn_libros_baja',
      icon: cilBan,
      color: '#e11d48',
      bgLight: 'rgba(225, 29, 72, 0.12)',
      description:
        'Registro de ejemplares desincorporados del inventario por deterioro, extravío o baja administrativa.',
      onOpen: () => setVisibleBaja(true),
    },
  ]

  return (
    <div className="pb-4">
      {/* Estilos encapsulados para las tarjetas y microinteracciones */}
      <style>{`
        .report-card-premium {
          position: relative;
          overflow: hidden;
          border-radius: 16px;
          transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1),
                      box-shadow 0.28s cubic-bezier(0.4, 0, 0.2, 1),
                      border-color 0.28s ease;
          background: var(--cui-card-bg, #ffffff);
          border: 1px solid rgba(0, 0, 0, 0.07);
        }
        .report-card-premium:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 32px -8px rgba(0, 0, 0, 0.12), 0 4px 8px -2px rgba(0, 0, 0, 0.04);
          border-color: rgba(0, 0, 0, 0.15);
        }
        .report-accent-bar {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          transition: height 0.25s ease, opacity 0.25s ease;
        }
        .report-card-premium:hover .report-accent-bar {
          height: 6px;
        }
        .report-icon-container {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.25s ease;
        }
        .report-card-premium:hover .report-icon-container {
          transform: scale(1.08);
        }
        .report-btn-action {
          transition: all 0.2s ease;
          font-weight: 600;
          border-radius: 10px;
        }
        .report-btn-action:hover .report-arrow-icon {
          transform: translateX(4px);
        }
        .report-arrow-icon {
          transition: transform 0.2s ease;
        }
      `}</style>

      {/* Encabezado del Módulo */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-4">
        <div>
          <h3 className="fw-bold mb-1 text-body d-flex align-items-center gap-2">
            <CIcon icon={cilStorage} size="lg" style={{ color: '#12358dff' }} />
             <span>Reportes de Inventario</span> 
          </h3>
          <p className="text-body-secondary mb-0 small">
            Gestión de los libros del sistema.
          </p>
        </div>
      </div>

      {/* Grid de Tarjetas */}
      <CRow className="g-4">
        {reports.map((report) => {
          const hasPermission = canDoAction(report.action)

          return (
            <CCol key={report.id} xs={12} md={6} lg={4}>
              <CCard className="h-100 report-card-premium shadow-sm">
                {/* Barra superior de acento de color */}
                <div
                  className="report-accent-bar"
                  style={{
                    backgroundColor: report.color,
                  }}
                />

                <CCardBody className="d-flex flex-column p-4">
                  {/* Fila superior: Ícono en caja */}
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div
                      className="report-icon-container"
                      style={{
                        backgroundColor: report.bgLight,
                        border: `1px solid ${report.color}25`,
                      }}
                    >
                      <CIcon
                        icon={report.icon}
                        size="xl"
                        style={{ color: report.color }}
                      />
                    </div>
                  </div>

                  {/* Título del Reporte */}
                  <h5 className="fw-bold mb-2 text-body" style={{ minHeight: "2.6rem", lineHeight: 1.35 }}>
                    {report.title}
                  </h5>

                  {/* Descripción */}
                  <p className="text-body-secondary small flex-grow-1 mb-3" style={{ lineHeight: 1.55 }}>
                    {report.description}
                  </p>

                  {/* Chip de Filtro / Parámetros */}
                  <div className="mb-3 pt-2 border-top border-light-subtle">
                    <div className="d-flex align-items-center gap-1.5 text-body-tertiary small">
                      <CIcon icon={cilFilter} size="sm" style={{ color: report.color }} />
                      <span className="fw-medium text-secondary" style={{ fontSize: "0.78rem" }}>
                        {report.filtroInfo}
                      </span>
                    </div>
                  </div>

                  {/* Botón de Acción */}
                  <div className="mt-auto">
                    {hasPermission ? (
                      <CButton
                        color="primary"
                        variant="outline"
                        size="sm"
                        className="w-100 d-flex align-items-center justify-content-between px-3 py-2 report-btn-action shadow-none"
                        onClick={report.onOpen}
                      >
                        <span className="d-flex align-items-center gap-2">
                          <CIcon icon={cilCloudDownload} />
                          <span>Configurar Reporte</span>
                        </span>
                        <CIcon icon={cilArrowRight} className="report-arrow-icon" />
                      </CButton>
                    ) : (
                      <div className="d-flex align-items-center justify-content-center gap-2 py-2 px-3 rounded-2 text-muted bg-body-tertiary border small fw-medium">
                        <CIcon icon={cilLockLocked} size="sm" />
                        <span>Sin permiso de acceso</span>
                      </div>
                    )}
                  </div>
                </CCardBody>
              </CCard>
            </CCol>
          )
        })}
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