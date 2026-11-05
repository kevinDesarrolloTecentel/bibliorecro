import React, { useState, useMemo } from 'react'
import {
  useReporteMejoresUsuarios,
  PersonaReporteItem,
} from '@/hooks/reportes/usuarios/useReporteMejores'
import {
  cilCloudDownload,
  cilExitToApp,
  cilSave,
  cilSync,
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CDatePicker,
  CFormLabel,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CRow,
  CSmartTable,
  CSpinner,
} from '@coreui/react-pro'

export interface UseMejoresProps {
  visible: boolean
  setVisible: (visible: boolean) => void
}

const MejoresUModal: React.FC<UseMejoresProps> = ({ visible, setVisible }) => {
  const [tableKey, setTableKey] = useState<number>(0)

  const {
    anoMejor,
    setAnoMejor,
    usuarios,
    isLoading,
    excelLink,
    haBuscado,
    handleGetMejores,
    handleDescargarExcel,
    handleReset,
    canGenerarRankingUsuarios,
    canDescargarRankingUsuarios,
  } = useReporteMejoresUsuarios()

  const handleFullReset = () => {
    handleReset()
    setTableKey((prev: number) => prev + 1)
  }

  const handleClose = () => {
    handleFullReset()
    setVisible(false)
  }

  const tableItems = useMemo(() => {
    return usuarios.map((item: PersonaReporteItem) => ({
      ...item,
      nombre: item.NOMBRE_PERSONA || '',
      apellido: item.APELLIDO_PERSONA || '',
      cantidad: item.cantidad_prestamos ?? 0,
    }))
  }, [usuarios])

  const columns = [
    {
      key: 'nombre',
      label: 'Nombre',
      _style: { width: '38%' },
    },
    {
      key: 'apellido',
      label: 'Apellido',
      _style: { width: '38%' },
    },
    {
      key: 'cantidad',
      label: 'Cantidad de Préstamos',
      _style: { width: '24%' },
    },
  ]

  return (
    <CModal
      size="xl"
      scrollable
      visible={visible}
      onClose={handleClose}
      backdrop="static"
    >
      <CModalHeader closeButton>
        <CModalTitle className="d-flex align-items-center gap-2">
          <span>Ranking de los Mejores Usuarios</span>
        </CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CCard className="mb-3 border-0 bg-body shadow-sm">
          <CCardBody className="p-3">
            <div className="fw-semibold text-body mb-2 small text-uppercase">
              Filtro por Año de Actividad
            </div>
            <CRow className="g-3 align-items-end">
              <CCol xs={12} sm={8} md={6}>
                <CFormLabel className="small fw-semibold mb-1">Año de Actividad</CFormLabel>
                <CDatePicker
                  key={tableKey}
                  size="sm"
                  locale="es-ES"
                  selectionType="year"
                  placeholder="Seleccione el año"
                  cleaner
                  inputReadOnly
                  inputDateFormat={(date: Date) => {
                    if (!date || isNaN(date.getTime())) return ''
                    const year = date.getHours() >= 18 ? date.getUTCFullYear() : date.getFullYear()
                    return String(year)
                  }}
                  inputDateParse={(val: string | Date) => {
                    if (val instanceof Date) return val
                    const num = Number(val)
                    return !isNaN(num) && num > 1900 ? new Date(num, 0, 1, 12, 0, 0) : new Date(val)
                  }}
                  date={anoMejor ? new Date(Number(anoMejor), 0, 1, 12, 0, 0) : null}
                  onDateChange={(val: any) => {
                    if (!val) {
                      setAnoMejor('')
                      return
                    }
                    if (typeof val === 'string') {
                      const match = val.match(/\b(19\d{2}|20\d{2})\b/) || val.match(/^(\d{4})/)
                      if (match) {
                        setAnoMejor(match[1])
                        return
                      }
                    }
                    if (val instanceof Date && !isNaN(val.getTime())) {
                      const year = val.getHours() >= 18 ? val.getUTCFullYear() : val.getFullYear()
                      setAnoMejor(String(year))
                      return
                    }
                  }}
                />
              </CCol>

              <CCol xs={12} sm={4} md={6} className="d-flex gap-2">
                {canGenerarRankingUsuarios && (
                  <CButton
                    color="primary"
                    variant="outline"
                    size="sm"
                    className="w-100 d-flex align-items-center justify-content-center"
                    onClick={() => {
                      setTableKey((prev) => prev + 1)
                      handleGetMejores()
                    }}
                    disabled={isLoading || !anoMejor}                  >
                    {isLoading ? (
                      <>
                        <CSpinner size="sm" className="me-1" />
                        <span>Cargando...</span>
                      </>
                    ) : (
                      <>
                        <CIcon icon={cilSave} className="me-1" />
                        <span>Generar</span>
                      </>
                    )}
                  </CButton>
                )}
                <CButton
                  color="secondary"
                  variant="outline"
                  size="sm"
                  title="Limpiar filtros"
                  onClick={handleFullReset}
                  disabled={isLoading}
                >
                  <CIcon icon={cilSync} />
                </CButton>
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>

        <CCard className="border shadow-sm">
          <CCardHeader className="d-flex justify-content-between align-items-center bg-transparent py-2">
            <span className="fw-semibold small text-uppercase">
              Ranking de Usuarios
            </span>
            <span className="text-body-secondary small">
              Total recibidos: <strong>{usuarios.length}</strong>
            </span>
          </CCardHeader>
          <CCardBody className="p-0">
            <CSmartTable
              key={tableKey}
              activePage={1}
              columns={columns}
              columnSorter
              tableFilter={haBuscado && !isLoading && usuarios.length > 0}
              tableFilterLabel="Buscar:"
              tableFilterPlaceholder="Buscar en el ranking..."
              cleaner
              items={tableItems}
              itemsPerPage={60}
              pagination
              noItemsLabel={
                haBuscado
                  ? 'No se encontraron usuarios en el ranking para el año seleccionado'
                  : 'Seleccione un año y haga clic en Generar para ver el reporte'
              }
              scopedColumns={{
                nombre: (item: any) => (
                  <td>
                    <span className="font-monospace small">{item.nombre}</span>
                  </td>
                ),
                apellido: (item: any) => (
                  <td>
                    <span className="font-monospace small">{item.apellido}</span>
                  </td>
                ),
                cantidad: (item: any) => (
                  <td>
                    <span className="font-monospace text-success fw-semibold badge bg-body border">
                      {item.cantidad}
                    </span>
                  </td>
                ),
              }}
              tableProps={{
                responsive: true,
                striped: true,
                hover: true,
                className: 'mb-0',
              }}
              tableBodyProps={{
                className: 'align-middle',
              }}
            />
          </CCardBody>
        </CCard>
      </CModalBody>
      <CModalFooter className="d-flex justify-content-between align-items-center">
        <div className="text-body-secondary small">
          Mostrando <strong>{usuarios.length}</strong> usuario(s)
        </div>
        <div className="d-flex gap-2">
          <CButton size="sm" color="danger" variant="outline" className="hover:text-white shadow-sm" onClick={handleClose}>
            <CIcon icon={cilExitToApp} className="me-1" />
            Cerrar
          </CButton>

          {canDescargarRankingUsuarios && (
            <CButton
              color="success"
              size="sm"
              variant="outline"
              className="hover:text-white shadow-sm"
              onClick={handleDescargarExcel}
              disabled={
                isLoading ||
                !haBuscado ||
                usuarios.length === 0 ||
                !excelLink
              }
            >
              <CIcon icon={cilCloudDownload} className="me-1" />
              Descargar Excel
            </CButton>
          )}

        </div>
      </CModalFooter>
    </CModal>
  )
}

export default MejoresUModal