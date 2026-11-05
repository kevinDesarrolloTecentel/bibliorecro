import React from 'react'
import { cibLibreoffice, cilPrint, cilWarning } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { CButton, CCard, CCardBody, CCol, CDateRangePicker, CRow, CSpinner } from '@coreui/react-pro'
import { aFechaLocal, parseDatePickerValue } from '@/hooks/dashboard/useLibrosIng'
import { formatFecha } from '@/utils/dateUtils'

export interface LibrosIngFiltrosProps {
  fechaDesde: string
  fechaHasta: string
  loading?: boolean
  exportando?: boolean
  hasData?: boolean
  canBuscar?: boolean
  canExportar?: boolean
  onDateChange: (val: Date | string | null, field: 'desde' | 'hasta') => void
  onBuscar: () => void
  onExportar: () => void
}

export const LibrosIngFiltros: React.FC<LibrosIngFiltrosProps> = ({
  fechaDesde,
  fechaHasta,
  loading = false,
  exportando = false,
  hasData = false,
  canBuscar = true,
  canExportar = true,
  onDateChange,
  onBuscar,
  onExportar,
}) => {
  const isRangoInvalido = Boolean(
    fechaDesde && fechaHasta && new Date(fechaHasta) < new Date(fechaDesde)
  )

  const diasDiferencia = React.useMemo(() => {
    if (!fechaDesde || !fechaHasta || isRangoInvalido) return 0
    const d1 = new Date(fechaDesde)
    const d2 = new Date(fechaHasta)
    const diffTime = d2.getTime() - d1.getTime()
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))
    return diffDays >= 0 ? diffDays : 0
  }, [fechaDesde, fechaHasta, isRangoInvalido])

  return (
    <CRow className="justify-content-center">
      <CCol xs={12} lg={10} xl={8}>
        <CCard className="shadow-sm border-0 mb-4">
          <CCardBody className="p-4">
            <p className="text-body-secondary small mb-4">
              Selecciona el periodo de ingreso de los nuevos libros al sistema BiblioRecreo.
            </p>

            <CRow className="g-3 mb-4">
              <CCol xs={12}>
                <CDateRangePicker
                  label="Rango de Fechas (Desde - Hasta)"
                  inputReadOnly
                  locale="es-ES"
                  invalid={isRangoInvalido}
                  feedbackInvalid="La Fecha (Hasta) no puede ser anterior a la Fecha (Desde)."
                  startDate={aFechaLocal(fechaDesde)}
                  endDate={aFechaLocal(fechaHasta)}
                  onStartDateChange={(val) => {
                    onDateChange(val, 'desde')
                    const parsed = parseDatePickerValue(val)
                    if (parsed && fechaHasta && parsed > fechaHasta) {
                      onDateChange(val, 'hasta')
                    }
                  }}
                  onEndDateChange={(val) => {
                    const parsed = parseDatePickerValue(val)
                    if (parsed && fechaDesde && parsed < fechaDesde) {
                      onDateChange(aFechaLocal(fechaDesde) ?? null, 'hasta')
                    } else {
                      onDateChange(val, 'hasta')
                    }
                  }}
                  placeholder={['Fecha desde', 'Fecha hasta']}
                  calendars={2}
                  cancelButton="Cancelar"
                  confirmButton="Aceptar"
                />
                {isRangoInvalido ? (
                  <div className="alert alert-danger py-2 px-3 mt-2 small d-flex align-items-center gap-2 mb-0">
                    <CIcon icon={cilWarning} className="text-danger flex-shrink-0" />
                    <span>
                      <strong>Rango inválido:</strong> La Fecha (Desde) no puede ser posterior a la Fecha (Hasta).
                    </span>
                  </div>
                ) : (
                  fechaDesde &&
                  fechaHasta && (
                    <div className="d-flex align-items-center gap-2 mt-2 text-muted small">
                      <span>
                        Periodo: <strong>{formatFecha(fechaDesde)}</strong> al <strong>{formatFecha(fechaHasta)}</strong>
                      </span>
                      <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1">
                        {diasDiferencia} día{diasDiferencia !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )
                )}
              </CCol>
            </CRow>

            <div className="d-flex flex-wrap justify-content-end gap-2 pt-2 border-top">
              {canBuscar && (
                <CButton
                  color="primary"
                  variant="outline"
                  size="sm"
                  className="hover:text-white shadow-sm" onClick={onBuscar}
                  disabled={loading || isRangoInvalido || !fechaDesde || !fechaHasta}
                >
                  {loading ? (
                    <>
                      <CSpinner size="sm" />
                      <span className="fw-semibold">Buscando...</span>
                    </>
                  ) : (
                    <>
                      <CIcon icon={cilPrint} />
                      <span className="fw-semibold">Buscar Reporte</span>
                    </>
                  )}
                </CButton>
              )}
              {canExportar && (
                <CButton
                  color="success"
                  variant="outline"
                  size="sm"
                  className="hover:text-white shadow-sm" onClick={onExportar}
                  disabled={exportando || !hasData}
                >
                  {exportando ? (
                    <CSpinner size="sm" />
                  ) : (
                    <CIcon icon={cibLibreoffice} className="me-1" />
                  )}
                  Exportar Excel
                </CButton>
              )}
            </div>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default LibrosIngFiltros
