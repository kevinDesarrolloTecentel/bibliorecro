import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilCalendar,
  cilCloudDownload,
  cilPrint,
  cilSync,
} from '@coreui/icons'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormInput,
  CFormLabel,
  CInputGroup,
  CInputGroupText,
  CSpinner,
} from '@coreui/react-pro'
import useReportTej from '@/hooks/reportes/useReportTej'

const borderBoxStyle: React.CSSProperties = {
  padding: '0.6rem 0.4rem',
  borderRadius: '8px',
  boxShadow: '0 2px 6px rgba(71, 0, 0, 0.08)',
  background: '#ffffff',
  width: '250px',
  height: '120px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
  boxSizing: 'border-box',
  pageBreakInside: 'avoid',
}

const ImpresionTej: React.FC = () => {
  const {
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    pdfPath,
    libros,
    isLoading,
    activeTab,
    handleGeneratePdf,
    handleReset,
    handleDescargarPdf,
  } = useReportTej()

  return (
    <div className="reporte-tejuelos-wrapper">
      <CCard className="mb-4 border-0 bg-body shadow-sm no-print">
        <CCardHeader className="bg-body border-bottom py-3 fw-semibold d-flex align-items-center gap-2">
          <CIcon icon={cilCalendar} style={{color:'#0143a5ff'}} size='xl'/>
          <span>Seleccionar Rango de Fechas</span>
        </CCardHeader>
        <CCardBody className="p-4 bg-body">
          <CForm className="row g-3 align-items-end">
            <CCol xs={12} sm={6} md={4}>
              <CFormLabel className="form-label small fw-semibold text-muted mb-1">
                Fecha Desde
              </CFormLabel>
              <CInputGroup>
                <CInputGroupText>
                  <CIcon icon={cilCalendar} />
                </CInputGroupText>
                <CFormInput
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  placeholder="Desde"
                />
              </CInputGroup>
            </CCol>

            <CCol xs={12} sm={6} md={4}>
              <CFormLabel className="form-label small fw-semibold text-muted mb-1">
                Fecha Hasta
              </CFormLabel>
              <CInputGroup>
                <CInputGroupText>
                  <CIcon icon={cilCalendar} />
                </CInputGroupText>
                <CFormInput
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  placeholder="Hasta"
                />
              </CInputGroup>
            </CCol>

            <CCol xs={12} sm={12} md={4} className="d-flex align-items-end gap-2">
              <CButton
                color="primary"
                variant='outline'
                className="d-flex align-items-center justify-content-center gap-1 shadow-sm flex-grow-1 px-3 py-2"
                onClick={handleGeneratePdf}
              >
                {isLoading ? (
                  <>
                    <span>Generando...</span>
                    <CSpinner size="sm" className="me-1" variant='grow' />
                  </>
                ) : (
                  <>
                    <CIcon icon={cilPrint} className="me-1" />
                    <span>Generar</span>
                  </>
                )}
              </CButton>

              {pdfPath && (
                <CButton
                  color="success"
                  variant='outline'
                  className="hover:text-white d-flex align-items-center justify-content-center gap-1 shadow-sm px-3 py-2"
                  onClick={handleDescargarPdf}
                  title="Abrir o Descargar PDF"
                >
                  <CIcon icon={cilCloudDownload} />
                  <span>PDF</span>
                </CButton>
              )}

              <CButton
                color="secondary"
                variant="outline"
                onClick={handleReset}
                title="Limpiar filtros"
                disabled={isLoading}
                className="px-3 py-2"
              >
                <CIcon icon={cilSync} />
              </CButton>
            </CCol>
          </CForm>
        </CCardBody>
      </CCard>

      {libros.length > 0 && (
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 no-print gap-2">
          <div className="d-flex align-items-center gap-2">
            <span className='badge bg-body border text-primary'>
              Total de Tejuelos: <strong>{libros.length}</strong>
            </span>
          </div>
        </div>
      )}

      {libros.length > 0 ? (
        <>
          {activeTab === 'etiquetas' && (
            <div className="tejuelos-print-zone p-3 bg-body rounded border shadow-sm">
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  justifyContent: 'flex-start',
                }}
              >
                {libros.map((libro, index) => {
                  const codigo =
                    libro.CODIGO_CATEGORIA ||
                    libro.codigo_categoria ||
                    libro.CODIGO_LIBRO ||
                    libro.codigo ||
                    '-'
                  const autor =
                    libro.AUTORTEJUELO_LIBROS ||
                    libro.autortejuelo_libros ||
                    libro.AUTOR_LIBRO ||
                    libro.autor ||
                    '-'
                  const titulo =
                    libro.TITULOTEJUELO_LIBROS ||
                    libro.titulotejuelo_libros ||
                    libro.TITULO_LIBRO ||
                    libro.titulo ||
                    '-'

                  return (
                    <div key={index} style={borderBoxStyle} className="tejuelo-card bg-body border">
                      <p className="badge bg-dark border rounded-pill text-body ">
                        {codigo}
                      </p>
                      <p className="font-monospace mb-1 text-body">
                        {autor}
                      </p>
                      <p  className="text-muted font-monospace small mb-0 text-body">
                        {titulo}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </>
      ) : (
        !isLoading && (
          <div className="text-center py-5 bg-body rounded border text-muted no-print">
            <CIcon icon={cilPrint} size="3xl" className="mb-3 text-secondary opacity-50" />
            <h6 className="fw-bold">No se han generado tejuelos todavía</h6>
            <p className="small mb-0">
              Seleccione un rango de fechas y haga clic en <strong>Generar Tejuelos</strong> para
              consultar y visualizar las etiquetas.
            </p><br />
            <CSpinner variant='grow' style={{color:'#b291ffff'}}/>
          </div>
        )
      )}
    </div>
  )
}

export { ImpresionTej, ImpresionTej as TejModal, ImpresionTej as ReportesT }
export default ImpresionTej