import { cilBadge, cilCalendar, cilCalendarCheck, cilCloudDownload, cilHistory, cilPeople, cilUserFollow } from "@coreui/icons"
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

const Report_usu = () => {
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
      icon: cilPeople,
      description:
        "Personaliza tu análisis al ingresar la edad deseada y obtén un informe detallado sobre la distribución de usuarios en diferentes rangos de edad y género.",
      onOpen: () => setVisibleEG(true),
    },
    {
      id: "activos",
      title: "Usuarios Activos",
      icon:cilUserFollow,
      description:
        "Personaliza tu análisis al ingresar el año y obtén un informe detallado sobre la concurrencia y distribución de usuarios activos en el sistema.",
      onOpen: () => setVisibleAct(true),
    },
    {
      id: "activos_mes_dia",
      title: "Usuarios Activos por Mes y Día",
      icon:cilCalendarCheck,
      description:
        "Personaliza tu análisis al ingresar el mes y día específicos y obtén un informe detallado sobre la asistencia y uso de servicios bibliotecarios.",
      onOpen: () => setVisibleMD(true),
    },
    {
      id: "renovaciones",
      title: "Renovaciones de Usuarios por Día, Mes y Año",
      icon:cilCalendarCheck,
      description:
        "Personaliza tu análisis por fecha para obtener el informe detallado sobre las renovaciones de registros y carnetización por día, mes y año.",
      onOpen: () => setVisibleAMD(true),
    },
    {
      id: "mejores",
      title: "Ranking de los Mejores Usuarios",
      icon:cilBadge,
      description:
        "Personaliza tu análisis al ingresar el año y obtén un informe detallado con el ranking de los usuarios más activos y con mayor índice de lectura.",
      onOpen: () => setVisibleMejores(true),
    },
    {
      id: "historial_libros",
      icon:cilHistory,
      title: "Historial de Libros por Usuario",
      description:
        "Consulta el registro histórico de libros prestados, devueltos y consultados por cada usuario en los diferentes periodos de atención.",
      onOpen: () => setVisibleHistLib(true),
    },
    {
      id: "nuevos",
      icon:cilCalendar,
      title: "Nuevos Usuarios en el Sistema por Día, Mes y Año",
      description:
        "Informe detallado sobre las nuevas altas e incorporaciones de lectores registradas en el sistema por día, mes y año.",
      onOpen: () => setVisibleNuevos(true),
    },
  ]

  return (
    <div className="pb-4">
      <div className="mb-4">
        <h3 className="fw-bold mb-1">Reportes de Usuarios</h3>
        <p className="text-body-secondary mb-0">
          Estadísticas, análisis demográfico y comportamiento de la comunidad de lectores y usuarios registrados.
        </p>
      </div>

      <CRow className="g-4">
        {userReports.map((report, index) => (
          <CCol key={index} xs={12} md={6} lg={4}>
            <CCard className="h-100 shadow-sm border-0">
              <CCardBody className="d-flex flex-column p-4">
                <CIcon icon={report.icon} size="xl" style={{color:'#FE9A37'}}/>
                <h5 className="fw-bold mb-2">{report.title}</h5>
                <p className="text-body-secondary small flex-grow-1 mb-4">
                  {report.description}
                </p>

                <div className="mt-auto pt-2">
                  <CButton
                    color="primary"
                    variant="outline"
                    className="w-100 d-flex align-items-center justify-content-center gap-2"
                    onClick={report.onOpen}
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


      <EGModal
        visible={visibleEG}
        setVisible={setVisibleEG}
      />
      <UsuActModal
        visible={visibleAct}
        setVisible={setVisibleAct}
      />
      <MesDiaModal
      visible={visibleMD}
      setVisible={setVisibleMD}
      />
      <MDAModal
      visible={visibleAMD}
      setVisible={setVisibleAMD}/>

      <MejoresUModal
      visible ={visibleMejores}
      setVisible={setVisibleMejores}/>

      <LibroUModal
      visible = {visibleHistLib}
      setVisible={setVisibleHistLib}/>

      <UsuNuevoModal
      visible ={visibleNuevos}
      setVisible={setVisibleNuevos}/>
    </div>
  )
}

export default Report_usu
