import {
  cilArrowRight,
  cilBadge,
  cilCalendar,
  cilCalendarCheck,
  cilCloudDownload,
  cilFilter,
  cilHistory,
  cilLockLocked,
  cilPeople,
  cilUserFollow,
  cilChartPie
} from "@coreui/icons"
import CIcon from "@coreui/icons-react"
import { CButton, CCard, CCardBody, CCol, CRow } from "@coreui/react-pro"
import { useState } from "react"
import EGModal from "@/components/reportesModals/Usuarios/EdadGeneroModal"
import UsuActModal from "@/components/reportesModals/Usuarios/UsuariosActModal"
import MesDiaModal from "@/components/reportesModals/Usuarios/ActivosMesDia"
import MDAModal from "@/components/reportesModals/Usuarios/RenoDMA"
import MejoresUModal from "@/components/reportesModals/Usuarios/MejoresUsu"
import UsuNuevoModal from "@/components/reportesModals/Usuarios/UsuNuevos"
import LibroUModal from "@/components/reportesModals/Usuarios/LibrosUsu"
import { usePermissions } from "@/context/PermissionsContext"

const Report_usu = () => {
  const { canDoAction } = usePermissions()
  const [visibleEG, setVisibleEG] = useState(false)
  const [visibleAct, setVisibleAct] = useState(false)
  const [visibleMD, setVisibleMD] = useState(false)
  const [visibleAMD, setVisibleAMD] = useState(false)
  const [visibleMejores, setVisibleMejores] = useState(false)
  const [visibleHistLib, setVisibleHistLib] = useState(false)
  const [visibleNuevos, setVisibleNuevos] = useState(false)

  const userReports = [
    {
      id: "edad_genero",
      title: "Usuarios Inscritos por Edad y Género",
      filtroInfo: "Filtro por Rango de Edad y Género",
      action: "btn_usuarios_inscritos",
      icon: cilPeople,
      color: "#FE9A37",
      bgLight: "rgba(254, 154, 55, 0.12)",
      description:
        "Personaliza tu análisis al ingresar la edad deseada y obtén un informe detallado sobre la distribución de usuarios en diferentes rangos de edad y género.",
      onOpen: () => setVisibleEG(true),
    },
    {
      id: "activos",
      title: "Usuarios Activos",
      filtroInfo: "Filtro por Año",
      action: "btn_usuarios_activos",
      icon: cilUserFollow,
      color: "#10b981",
      bgLight: "rgba(16, 185, 129, 0.12)",
      description:
        "Personaliza tu análisis al ingresar el año y obtén un informe detallado sobre la concurrencia y distribución de usuarios activos en el sistema.",
      onOpen: () => setVisibleAct(true),
    },
    {
      id: "activos_mes_dia",
      title: "Usuarios Activos por Mes y Día",
      filtroInfo: "Filtro por Mes y Día",
      action: "btn_usuarios_activos_mes_dia",
      icon: cilCalendarCheck,
      color: "#3b82f6",
      bgLight: "rgba(59, 130, 246, 0.12)",
      description:
        "Personaliza tu análisis al ingresar el mes y día específicos y obtén un informe detallado sobre la asistencia y uso de servicios bibliotecarios.",
      onOpen: () => setVisibleMD(true),
    },
    {
      id: "renovaciones",
      title: "Renovaciones de Usuarios",
      filtroInfo: "Filtro por Día, Mes y Año",
      action: "btn_renovaciones_usuario",
      icon: cilCalendarCheck,
      color: "#8b5cf6",
      bgLight: "rgba(139, 92, 246, 0.12)",
      description:
        "Personaliza tu análisis por fecha para obtener el informe detallado sobre las renovaciones de registros y carnetización por día, mes y año.",
      onOpen: () => setVisibleAMD(true),
    },
    {
      id: "mejores",
      title: "Ranking de los Mejores Usuarios",
      filtroInfo: "Filtro por Año",
      action: "btn_ranking_usuarios",
      icon: cilBadge,
      color: "#f59e0b",
      bgLight: "rgba(245, 158, 11, 0.12)",
      description:
        "Personaliza tu análisis al ingresar el año y obtén un informe detallado con el ranking de los usuarios más activos y con mayor índice de lectura.",
      onOpen: () => setVisibleMejores(true),
    },
    {
      id: "historial_libros",
      title: "Historial de Libros por Usuario",
      filtroInfo: "Filtro por Cédula",
      action: "btn_libros_usuario",
      icon: cilHistory,
      color: "#06b6d4",
      bgLight: "rgba(6, 182, 212, 0.12)",
      description:
        "Consulta el registro histórico de libros prestados, devueltos y consultados por cada usuario en los diferentes periodos de atención.",
      onOpen: () => setVisibleHistLib(true),
    },
    {
      id: "nuevos",
      title: "Nuevos Usuarios en el Sistema",
      filtroInfo: "Filtro por Día, Mes y Año",
      action: "btn_nuevos_usuarios",
      icon: cilCalendar,
      color: "#f43f5e",
      bgLight: "rgba(244, 63, 94, 0.12)",
      description:
        "Informe detallado sobre las nuevas altas e incorporaciones de lectores registradas en el sistema por día, mes y año.",
      onOpen: () => setVisibleNuevos(true),
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
            <CIcon icon={cilChartPie} size="lg" style={{ color: '#12358dff' }} />

            <span>Reportes de Usuarios</span>

          </h3>
          <p className="text-body-secondary mb-0 small">
            Gestión de reportes del usuario del sistema.
          </p>
        </div>
      </div>

      {/* Grid de Tarjetas */}
      <CRow className="g-4">
        {userReports.map((report) => {
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
                  {/* Fila superior: Ícono en caja y Badge de Categoría */}
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

                  <div className="mb-3 pt-2 border-top border-light-subtle">
                    <div className="d-flex align-items-center gap-1.5 text-body-tertiary small">
                      <CIcon icon={cilFilter} size="sm" style={{ color: report.color }} />
                      <span className="fw-medium text-secondary" style={{ fontSize: "0.78rem" }}>
                        {report.filtroInfo}
                      </span>
                    </div>
                  </div>

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
      <EGModal visible={visibleEG} setVisible={setVisibleEG} />
      <UsuActModal visible={visibleAct} setVisible={setVisibleAct} />
      <MesDiaModal visible={visibleMD} setVisible={setVisibleMD} />
      <MDAModal visible={visibleAMD} setVisible={setVisibleAMD} />
      <MejoresUModal visible={visibleMejores} setVisible={setVisibleMejores} />
      <LibroUModal visible={visibleHistLib} setVisible={setVisibleHistLib} />
      <UsuNuevoModal visible={visibleNuevos} setVisible={setVisibleNuevos} />
    </div>
  )
}

export default Report_usu
