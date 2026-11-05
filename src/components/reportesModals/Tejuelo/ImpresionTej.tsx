import React, { useState, useMemo } from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilCalendar,
  cilCloudDownload,
  cilPrint,
  cilSearch,
  cilSync,
  cilWarning,
  cilX,
} from '@coreui/icons'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CDateRangePicker,
  CForm,
  CFormInput,
  CFormLabel,
  CInputGroup,
  CInputGroupText,
  CRow,
  CSpinner,
} from '@coreui/react-pro'
import useReportTej from '@/hooks/reportes/tejuelo/useTejuelo'
import { aFechaLocal, parseDatePickerValue, formatFecha } from '@/utils/dateUtils'

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
  const [calendarKey, setCalendarKey] = useState<number>(0)
  const [filtroTexto, setFiltroTexto] = useState<string>('')

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
    canGenerarReporteTejuelos,
    canDescargarPdfTejuelos,
  } = useReportTej()

  const handleFullReset = () => {
    handleReset()
    setCalendarKey((prev) => prev + 1)
    setFiltroTexto('')
  }

  const tejuelosFiltrados = useMemo(() => {
    const q = filtroTexto.trim().toLowerCase()
    if (!q) return libros
    return libros.filter((libro) => {
      const codigo = String(
        libro.CODIGO_CATEGORIA ||
        libro.codigo_categoria ||
        libro.CODIGO_LIBRO ||
        libro.codigo || ''
      ).toLowerCase()
      const autor = String(
        libro.AUTORTEJUELO_LIBROS ||
        libro.autortejuelo_libros ||
        libro.AUTOR_LIBRO ||
        libro.autor || ''
      ).toLowerCase()
      const titulo = String(
        libro.TITULOTEJUELO_LIBROS ||
        libro.titulotejuelo_libros ||
        libro.TITULO_LIBRO ||
        libro.titulo || ''
      ).toLowerCase()
      return codigo.includes(q) || autor.includes(q) || titulo.includes(q)
    })
  }, [libros, filtroTexto])

  const isRangoInvalido = Boolean(
    startDate && endDate && new Date(endDate) < new Date(startDate)
  )

  const diasDiferencia = useMemo(() => {
    if (!startDate || !endDate || isRangoInvalido) return 0
    const d1 = new Date(startDate)
    const d2 = new Date(endDate)
    const diffTime = d2.getTime() - d1.getTime()
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))
    return diffDays >= 0 ? diffDays : 0
  }, [startDate, endDate, isRangoInvalido])

  return (
    <div className="reporte-tejuelos-wrapper">
      <CCard className="mb-4 border-0 bg-body shadow-sm no-print">
        <CCardHeader className="bg-body border-bottom py-3 fw-semibold d-flex align-items-center gap-2">
          <CIcon icon={cilCalendar} style={{ color: '#0143a5ff' }} size="xl" />
          <span>Seleccionar Rango de Fechas</span>
        </CCardHeader>
        <CCardBody className="p-4 bg-body">
          <CForm onSubmit={(e) => e.preventDefault()}>
            <CFormLabel className="small fw-semibold mb-1">
              Rango de Fechas (Desde - Hasta)
            </CFormLabel>
            <CRow className="g-3 align-items-center">
              <CCol xs={12} md={8}>
                <CDateRangePicker
                  key={`daterange-${calendarKey}`}
                  size="sm"
                  locale="es-ES"
                  cleaner
                  inputReadOnly
                  calendars={2}
                  startDate={aFechaLocal(startDate)}
                  endDate={aFechaLocal(endDate)}
                  invalid={isRangoInvalido}
                  feedbackInvalid="La Fecha (Hasta) no puede ser anterior a la Fecha (Desde)."
                  placeholder={['Fecha desde', 'Fecha hasta']}
                  cancelButton="Cancelar"
                  confirmButton="Aceptar"
                  onStartDateChange={(val) => {
                    const parsed = parseDatePickerValue(val ?? null)
                    setStartDate(parsed)
                    if (parsed && endDate && parsed > endDate) {
                      setEndDate(parsed)
                    }
                  }}
                  onEndDateChange={(val) => {
                    const parsed = parseDatePickerValue(val ?? null)
                    if (parsed && startDate && parsed < startDate) {
                      setEndDate(startDate)
                    } else {
                      setEndDate(parsed)
                    }
                  }}
                />
              </CCol>

              <CCol xs={12} md={4} className="d-flex gap-2 align-items-center">
                {canGenerarReporteTejuelos && (
                  <CButton
                    color="primary"
                    variant="outline"
                    size="sm"
                    className="d-flex align-items-center justify-content-center gap-1 shadow-sm flex-grow-1"
                    onClick={() => {
                      setFiltroTexto('')
                      handleGeneratePdf()
                    }}
                    disabled={
                      isLoading ||
                      !startDate ||
                      !endDate ||
                      isRangoInvalido
                    }                  >
                    {isLoading ? (
                      <>
                        <CSpinner size="sm" className="me-1" />
                        <span>Cargando...</span>
                      </>
                    ) : (
                      <>
                        <CIcon icon={cilPrint} className="me-1" />
                        <span>Generar</span>
                      </>
                    )}
                  </CButton>
                )}

                {canDescargarPdfTejuelos && (
                  <CButton
                    color="success"
                    variant="outline"
                    size="sm"
                    className="hover:text-white d-flex align-items-center justify-content-center gap-1 shadow-sm"
                    onClick={handleDescargarPdf}
                    title="Abrir o Descargar PDF"
                    disabled={
                      isLoading ||
                      libros.length === 0 ||
                      !pdfPath
                    }
                  >
                    <CIcon icon={cilCloudDownload} className="me-1" />
                    <span>PDF</span>
                  </CButton>
                )}


                <CButton
                  color="secondary"
                  variant="outline"
                  size="sm"
                  onClick={handleFullReset}
                  title="Limpiar filtros"
                  disabled={isLoading}
                >
                  <CIcon icon={cilSync} />
                </CButton>
              </CCol>
            </CRow>

            {isRangoInvalido ? (
              <div className="alert alert-danger py-2 px-3 mt-2 small d-flex align-items-center gap-2 mb-0">
                <CIcon icon={cilWarning} className="text-danger flex-shrink-0" />
                <span>
                  <strong>Rango inválido:</strong> La Fecha (Desde) no puede ser posterior a la Fecha (Hasta).
                </span>
              </div>
            ) : (
              startDate &&
              endDate && (
                <div className="d-flex align-items-center gap-2 mt-2 text-muted small">
                  <span>
                    Periodo: <strong>{formatFecha(startDate)}</strong> al <strong>{formatFecha(endDate)}</strong>
                  </span>
                  {diasDiferencia >= 0 && (
                    <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1">
                      {diasDiferencia} día{diasDiferencia !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              )
            )}
          </CForm>
        </CCardBody>
      </CCard>

      {libros.length > 0 && (
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 no-print gap-2">
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-body border text-primary font-monospace">
              Total de Tejuelos: <strong>{libros.length}</strong>
            </span>
            {filtroTexto.trim() && (
              <span className="badge bg-body border text-secondary font-monospace">
                Filtrados: <strong>{tejuelosFiltrados.length}</strong>
              </span>
            )}
          </div>

          <div style={{ maxWidth: '235px', width: '100%' }}>
            <CInputGroup size="sm">
              <CInputGroupText className="bg-body border text-muted">
                <CIcon icon={cilSearch} />
              </CInputGroupText>
              <CFormInput
                type="text"
                placeholder="Buscar por nombre de tejuelo"
                value={filtroTexto}
                onChange={(e) => setFiltroTexto(e.target.value)}
              />
              {filtroTexto && (
                <CButton
                  type="button"
                  color="secondary"
                  variant="outline"
                  onClick={() => setFiltroTexto('')}
                  title="Limpiar búsqueda"
                >
                  <CIcon icon={cilX} />
                </CButton>
              )}
            </CInputGroup>
          </div>
        </div>
      )}

      {libros.length > 0 ? (
        <>
          {activeTab === 'etiquetas' && (
            <div className="tejuelos-print-zone p-3 bg-body rounded border shadow-sm">
              {tejuelosFiltrados.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  <CIcon icon={cilSearch} size="xl" className="mb-2 text-secondary opacity-50" />
                  <p className="mb-2 fw-semibold">
                    No se encontraron tejuelos que coincidan con &quot;{filtroTexto}&quot;
                  </p>
                  <CButton
                    size="sm"
                    color="secondary"
                    className="hover:text-white shadow-sm"
                    variant="outline"
                    onClick={() => setFiltroTexto('')}
                  >
                    Limpiar búsqueda
                  </CButton>
                </div>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    justifyContent: 'center',
                  }}
                >
                  {tejuelosFiltrados.map((libro, index) => {
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
                      <div
                        key={index}
                        style={borderBoxStyle}
                        className="tejuelo-card bg-body border"
                      >
                        <p className="badge bg-body border rounded-pill text-body mb-2">
                          {codigo}
                        </p>
                        <p className="font-monospace mb-1 text-body fw-semibold">
                          {autor}
                        </p>
                        <p className="text-muted font-monospace small mb-0">
                          {titulo}
                        </p>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </>
      ) : isLoading ? (
        <div className="text-center py-5 bg-body rounded border text-muted no-print">
          <CSpinner style={{ color: '#0143a5ff' }} className="mb-3" />
          <h6 className="fw-bold">Generando tejuelos...</h6>
          <p className="small mb-0">Por favor espere mientras se procesa la información.</p>
        </div>
      ) : (
        <div className="text-center py-5 bg-body rounded border text-muted no-print">
          <CIcon icon={cilPrint} size="3xl" className="mb-3 text-secondary opacity-50" />
          <h6 className="fw-bold">No se han generado tejuelos todavía</h6>
        </div>
      )}
    </div>
  )
}

export { ImpresionTej, ImpresionTej as TejModal, ImpresionTej as ReportesT }
export default ImpresionTej