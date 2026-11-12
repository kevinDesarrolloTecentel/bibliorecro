import React, { useState, useMemo } from 'react'
import {
  useReporteNuevosUsuarios,
  PersonaReporteItem,
} from '@/hooks/reportes/usuarios/useReporteNuevosUsuarios'
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

export interface useNuevosProps {
  visible: boolean
  setVisible: (visible: boolean) => void
}

const UsuNuevoModal: React.FC<useNuevosProps> = ({ visible, setVisible }) => {
  const [tableKey, setTableKey] = useState<number>(0)

  const {
    diaRegistro,
    setDiaRegistro,
    mesRegistro,
    setMesRegistro,
    anoRegistro,
    setAnoRegistro,
    usuarios,
    isLoading,
    excelLink,
    haBuscado,
    handleGetNuevosUsuarios,
    handleDescargarExcel,
    handleReset,
    canGenerarNuevosUsuarios,
    canDescargarNuevosUsuarios,
  } = useReporteNuevosUsuarios()

  const handleFullReset = () => {
    handleReset()
    setTableKey((prev: number) => prev + 1)
  }

  const handleClose = () => {
    handleFullReset()
    setVisible(false)
  }

  const currentDate = useMemo(() => {
    if (anoRegistro && mesRegistro && diaRegistro) {
      const y = Number(anoRegistro)
      const m = Number(mesRegistro) - 1
      const d = Number(diaRegistro)
      if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
        return new Date(y, m, d, 12, 0, 0)
      }
    }
    return null
  }, [anoRegistro, mesRegistro, diaRegistro])

  const tableItems = useMemo(() => {
    return usuarios.map((item: PersonaReporteItem) => ({
      ...item,
      cedula: item.IDENTIFICACION_PERSONA || '',
      nombre: item.NOMBRE_PERSONA || '',
      apellido: item.APELLIDO_PERSONA || '',
      fechaNacimiento: item.FECHA_PERSONA
        ? new Date(item.FECHA_PERSONA).toLocaleDateString()
        : '-',
      correo: item.CORREO_PERSONA || '',
    }))
  }, [usuarios])

  const columns = [
    {
      key: 'cedula',
      label: 'Cédula',
      _style: { width: '18%' },
    },
    {
      key: 'nombre',
      label: 'Nombre',
      _style: { width: '22%' },
    },
    {
      key: 'apellido',
      label: 'Apellido',
      _style: { width: '22%' },
    },
    {
      key: 'fechaNacimiento',
      label: 'Fecha de Nacimiento',
      _style: { width: '18%' },
    },
    {
      key: 'correo',
      label: 'Correo',
      _style: { width: '20%' },
    },
  ]

  return (
    <CModal
      size="xl"
      scrollable
      visible={visible}
      onClose={() => {
        if (!isLoading) handleClose()
      }} backdrop="static"
    >
      <CModalHeader closeButton={!isLoading}>
        <CModalTitle className="d-flex align-items-center gap-2">
          <span>Nuevos Usuarios por Mes y Día</span>
        </CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CCard className="mb-3 border-0 bg-body shadow-sm">
          <CCardBody className="p-3">
            <div className="fw-semibold text-body mb-2 small text-uppercase">
              Filtros de Búsqueda
            </div>
            <CRow className="g-3 align-items-end">
              <CCol xs={12} sm={8} md={6}>
                <CFormLabel className="small fw-semibold mb-1">Fecha de Registro</CFormLabel>
                <CDatePicker
                  key={tableKey}
                  size="sm"
                  locale="es-ES"
                  placeholder="Seleccione la fecha"
                  cleaner
                  inputReadOnly
                  inputDateFormat={(date: Date) => {
                    if (!date || isNaN(date.getTime())) return ''
                    const d = date.getHours() >= 18 ? new Date(date.getTime() + 6 * 3600 * 1000) : date
                    const day = String(d.getDate()).padStart(2, '0')
                    const month = String(d.getMonth() + 1).padStart(2, '0')
                    const year = d.getFullYear()
                    return `${day}/${month}/${year}`
                  }}
                  inputDateParse={(val: string | Date) => {
                    if (val instanceof Date) return val
                    if (typeof val === 'string') {
                      const match = val.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})/)
                      if (match) {
                        return new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]), 12, 0, 0)
                      }
                    }
                    return new Date(val)
                  }}
                  date={currentDate}
                  onDateChange={(val: any, formatted?: string) => {
                    if (!val) {
                      setDiaRegistro('')
                      setMesRegistro('')
                      setAnoRegistro('')
                      return
                    }
                    if (typeof val === 'string') {
                      const match = val.match(/^(\d{4})-(\d{2})-(\d{2})/)
                      if (match) {
                        setAnoRegistro(String(Number(match[1])))
                        setMesRegistro(String(Number(match[2])))
                        setDiaRegistro(String(Number(match[3])))
                        return
                      }
                    }
                    if (val instanceof Date && !isNaN(val.getTime())) {
                      const d = val.getHours() >= 18 ? new Date(val.getTime() + 6 * 3600 * 1000) : val
                      setAnoRegistro(String(d.getFullYear()))
                      setMesRegistro(String(d.getMonth() + 1))
                      setDiaRegistro(String(d.getDate()))
                      return
                    }
                    if (formatted) {
                      const match = formatted.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})/)
                      if (match) {
                        setDiaRegistro(String(Number(match[1])))
                        setMesRegistro(String(Number(match[2])))
                        setAnoRegistro(match[3])
                      }
                    }
                  }}
                />
              </CCol>

              <CCol xs={12} sm={4} md={6} className="d-flex gap-2">
                {canGenerarNuevosUsuarios && (
                  <CButton
                    color="primary"
                    variant="outline"
                    size="sm"
                    className="w-100 d-flex align-items-center justify-content-center"
                    onClick={() => {
                      setTableKey((prev) => prev + 1)
                      handleGetNuevosUsuarios()
                    }}
                    disabled={
                      isLoading ||
                      !diaRegistro ||
                      !mesRegistro ||
                      !anoRegistro
                    }                  >
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
              Nuevos Usuarios Encontrados
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
              tableFilterPlaceholder="Buscar en la tabla..."
              loading={isLoading}
              cleaner
              items={tableItems}
              itemsPerPage={60}
              pagination
              noItemsLabel={
                isLoading
                  ? 'Cargando nuevos usuarios...'
                  : haBuscado
                    ? 'No se encontraron nuevos usuarios para la fecha seleccionada'
                    : 'Seleccione una fecha y haga clic en Generar para ver el reporte'
              }
              scopedColumns={{
                cedula: (item: any) => (
                  <td>
                    <span className="font-monospace small text-muted badge bg-body border">
                      {item.cedula}
                    </span>
                  </td>
                ),
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
                fechaNacimiento: (item: any) => (
                  <td>
                    <span className="font-monospace text-primary small badge bg-body border">
                      {item.fechaNacimiento}
                    </span>
                  </td>
                ),
                correo: (item: any) => (
                  <td>
                    <span className="font-monospace small badge bg-body border text-muted rounded-pill py-1 px-2">
                      {item.correo || '-'}
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
          Mostrando <strong>{usuarios.length}</strong> registro(s)
        </div>
        <div className="d-flex gap-2">
          <CButton size="sm" color="danger" variant="outline" className="hover:text-white shadow-sm" onClick={handleClose} disabled={isLoading}>
            <CIcon icon={cilExitToApp} className="me-1" />
            Cerrar
          </CButton>

          {canDescargarNuevosUsuarios && (
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

export default UsuNuevoModal