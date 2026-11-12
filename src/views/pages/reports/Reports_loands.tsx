import PrestamoAModal from "@/components/reportesModals/Prestamo/Anuales"
import CantidadModal from "@/components/reportesModals/Prestamo/Cantidad"
import PrestamoMModal from "@/components/reportesModals/Prestamo/Mensuales"
import NoDevueltosDanados from "@/components/reportesModals/Prestamo/NDevueltosDanados"
import PendientesModal from "@/components/reportesModals/Prestamo/PendientesDevo"
import {
  cilArrowRight,
  cilCalendar,
  cilCloudDownload,
  cilFilter,
  cilLockLocked,
  cilNoteAdd,
  cilReload,
  cilWarning,
  cilChartLine
} from "@coreui/icons"
import CIcon from "@coreui/icons-react"
import { CButton, CCard, CCardBody, CCol, CRow } from "@coreui/react-pro"
import { useState } from "react"
import { usePermissions } from "@/context/PermissionsContext"

const Rep_prestamos = () => {
  const [visiblePendientes, setVisiblePendientes] = useState(false)
  const [visibleNoDevueltos, setVisibleNoDevueltos] = useState(false)
  const [visibleCantidad, setVisibleCantidad] = useState(false)
  const [visibleMensual, setVisibleMensual] = useState(false)
  const [visibleAnuales, setVisibleAnuales] = useState(false)
  const { canDoAction } = usePermissions()

  const loanReports = [
    {
      id: "pendientes",
      title: "Libros Pendientes Por Devolver",
      filtroInfo: "Filtro por rango de Fechas",
      action: "btn_libros_pendientes",
      icon: cilReload,
      color: "#0d6efd",
      bgLight: "rgba(13, 110, 253, 0.12)",
      description:
        "Consulta en tiempo real los libros actualmente prestados y pendientes de devolución para el seguimiento oportuno.",
      onOpen: () => setVisiblePendientes(true),
    },
    {
      id: "no_devueltos",
      title: "Libros No Devueltos y Dañados",
      filtroInfo: "Filtro por rango de Fechas",
      action: "btn_libros_no_devueltos",
      icon: cilWarning,
      color: "#dc3545",
      bgLight: "rgba(220, 53, 69, 0.12)",
      description:
        "Identifica préstamos vencidos, libros no entregados en la fecha pactada y ejemplares en estado de sanción o daño.",
      onOpen: () => setVisibleNoDevueltos(true),
    },
    {
      id: "cantidad",
      title: "Cantidad de Préstamos",
      filtroInfo: "Filtro por Mes y Día",
      action: "btn_cantidad_prestamos",
      icon: cilNoteAdd,
      color: "#10b981",
      bgLight: "rgba(16, 185, 129, 0.12)",
      description:
        "Consulta y genera el reporte de la cantidad total de préstamos gestionados durante la jornada para el control operativo.",
      onOpen: () => setVisibleCantidad(true),
    },
    {
      id: "mensual",
      title: "Préstamos Mensuales",
      filtroInfo: "Filtro por Mes y Año",
      action: "btn_prestamos_mensuales",
      icon: cilCalendar,
      color: "#3b82f6",
      bgLight: "rgba(59, 130, 246, 0.12)",
      description:
        "Informe consolidado del flujo de préstamos otorgados mes a mes para evaluar la actividad y demanda lectora.",
      onOpen: () => setVisibleMensual(true),
    },
    {
      id: "anual",
      title: "Préstamos Anuales",
      filtroInfo: "Filtro por Año",
      action: "btn_prestamos_anuales",
      icon: cilCalendar,
      color: "#8b5cf6",
      bgLight: "rgba(139, 92, 246, 0.12)",
      description:
        "Histórico anual de libros prestados para análisis de tendencias, volumen total y balance de fin de ciclo.",
      onOpen: () => setVisibleAnuales(true),
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
            <CIcon icon={cilChartLine} size="lg" style={{ color: '#12358dff' }} />
            <span>Reportes de Préstamos</span>

          </h3>
          <p className="text-body-secondary mb-0 small">
            Gestión de los préstamos de los libros del sistema.
          </p>
        </div>
      </div>

      {/* Grid de Tarjetas */}
      <CRow className="g-4">
        {loanReports.map((report) => {
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

      {/* Modales correspondientes a cada reporte */}
      <PendientesModal
        visible={visiblePendientes}
        setVisible={setVisiblePendientes}
      />
      <NoDevueltosDanados
        visible={visibleNoDevueltos}
        setVisible={setVisibleNoDevueltos}
      />
      <CantidadModal
        visible={visibleCantidad}
        setVisible={setVisibleCantidad}
      />
      <PrestamoMModal
        visible={visibleMensual}
        setVisible={setVisibleMensual}
      />
      <PrestamoAModal
        visible={visibleAnuales}
        setVisible={setVisibleAnuales}
      />
    </div>
  )
}

export default Rep_prestamos