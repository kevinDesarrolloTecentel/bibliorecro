import React from 'react'
import { cibLibreoffice, cilPrint } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { CButton, CCard, CCardBody, CCol, CDatePicker, CRow, CSpinner } from '@coreui/react-pro'
import { usePermissions } from '@/context/PermissionsContext'
import { aFechaLocal } from '@/hooks/dashboard/useLibrosIng'

export interface LibrosIngFiltrosProps {
  fechaDesde: string
  fechaHasta: string
  loading?: boolean
  exportando?: boolean
  hasData?: boolean
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
  onDateChange,
  onBuscar,
  onExportar,
}) => {

  const {canDoAction} = usePermissions()

  return (
    <CRow className="justify-content-center">
      <CCol xs={12} lg={10} xl={8}>
        <CCard className="shadow-sm border-0 mb-4">
          <CCardBody className="p-4">
            <p className="text-body-secondary small mb-4">
              Selecciona el periodo de ingreso de los nuevos libros al sistema BiblioRecreo.
            </p>

            <CRow className="g-3 mb-4">
              <CCol xs={12} md={6}>
                <CDatePicker
                  label="Fecha (Desde)"
                  locale="es-ES"
                  date={aFechaLocal(fechaDesde)}
                  onDateChange={(val) => onDateChange(val, 'desde')}
                />
              </CCol>
              <CCol xs={12} md={6}>
                <CDatePicker
                  label="Fecha (Hasta)"
                  locale="es-ES"
                  date={aFechaLocal(fechaHasta)}
                  onDateChange={(val) => onDateChange(val, 'hasta')}
                />
              </CCol>
            </CRow>

            <div className="d-flex flex-wrap justify-content-end gap-2 pt-2 border-top">
              {canDoAction('btn_buscar_reporte_libros') && (
              <CButton
                color="primary"
                variant="outline"
                className="d-flex align-items-center gap-2 px-4 py-2"
                onClick={onBuscar}
                disabled={loading}
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
              {canDoAction('btn_exportar_excel_libros') && (
              <CButton
                color="success"
                variant="outline"
                className="hover:text-white fw-semibold d-flex align-items-center gap-2"
                onClick={onExportar}
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
