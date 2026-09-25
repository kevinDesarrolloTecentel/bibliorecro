import PrestamoAModal from "@/components/reportesModals/Prestamo/Anuales"
import CantidadModal from "@/components/reportesModals/Prestamo/Cantidad"
import PrestamoMModal from "@/components/reportesModals/Prestamo/Mensuales"
import NoDevueltosDanados from "@/components/reportesModals/Prestamo/NDevueltosDanados"
import PendientesModal from "@/components/reportesModals/Prestamo/PendientesDevo"
import { cilCalendar, cilCloudDownload, cilNoteAdd, cilReload, cilWarning } from "@coreui/icons"
import CIcon from "@coreui/icons-react"
import { CButton, CCard, CCardBody, CCol, CRow } from "@coreui/react-pro"
import { useState } from "react"

const Rep_prestamos = () => { 

  const [visiblePendientes, setVisiblePendientes] = useState(false)
  const [visibleNoDevueltos, setVisibleNoDevueltos] = useState(false)
  const [visibleCantidad, setVisibleCantidad] = useState(false)
  const [visibleMensual, setVisibleMensual] = useState(false)
  const [visibleAnuales, setVisibleAnuales] = useState(false)

  const loanReports = [
    {
      title: "Libros Pendientes Por Devolver",
      icon: cilReload,
      description:
        "Personaliza tu análisis al obtener un  informe detallado sobre la información de los libros.",
        onOpen:()=>setVisiblePendientes(true),
    },
    {
      title: "Libros No Devueltos y Dañados",
      icon:cilWarning,
      description:
        "Personaliza tu análisis al obtener un informme  detallado sobre la información de libros.",
        onOpen:() => setVisibleNoDevueltos(true),
    },
    {
      title: "Cantidad de Préstamos",
      icon:cilNoteAdd,  
      description:
        "Consulta y genera el reporte de libros no devueltos en la fecha pactada para realizar el seguimiento y gestión de sanciones.",
        onOpen:()=>setVisibleCantidad(true)
    },
    {
      title: "Préstamos Mensuales",
      icon:cilCalendar,
      description:
        "Informe detallado sobre las solicitudes de renovación y ampliación de plazos concedidas a los usuarios del sistema.",
        onOpen:() => setVisibleMensual(true)
    },
    {
      title: "Préstamos Anuales",
      icon:cilCalendar,
      description:
        "Identifica los títulos, autores y géneros más solicitados en préstamo por los lectores en el transcurso del año.",
        onOpen: ()=> setVisibleAnuales(true)
    }
  ]

  return (
    <div className="pb-4">
      <div className="mb-4">
        <h3 className="fw-bold mb-1">Reportes de Préstamos</h3>
        <p className="text-body-secondary mb-0">
          Supervisión, estadísticas y control del flujo de préstamos, entregas y devoluciones de la biblioteca.
        </p>
      </div>

      <CRow className="g-4">
        {loanReports.map((report, index) => (
          <CCol key={index} xs={12} md={6} lg={4}>
            <CCard className="h-100 shadow-sm border-0">
              <CCardBody className="d-flex flex-column p-4">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <CIcon icon={report.icon} size="xl" style={{color:'#37BC7D'}}/>
                </div>

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
      <PendientesModal
      visible={visiblePendientes}
      setVisible={setVisiblePendientes}/>

      <NoDevueltosDanados
      visible ={visibleNoDevueltos}
      setVisible={setVisibleNoDevueltos}
      />

      <CantidadModal
      visible={visibleCantidad}
      setVisible={setVisibleCantidad}/>

      <PrestamoMModal
      visible={visibleMensual}
      setVisible={setVisibleMensual}/>

      <PrestamoAModal
      visible={visibleAnuales}
      setVisible={setVisibleAnuales}/>
    </div>
  )
}

export default Rep_prestamos