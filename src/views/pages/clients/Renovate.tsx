import { useState, useEffect, useMemo } from 'react'
import {
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardFooter,
  CCardHeader,
  CCol,
  CCollapse,
  CRow,
  CSmartPagination,
  CSmartTable,
  CSpinner,
} from '@coreui/react-pro'
import CIcon from '@coreui/icons-react'
import {
  cilCalendar,
  cilCheckCircle,
  cilDescription,
  cilDollar,
  cilLocationPin,
  cilPencil,
  cilPhone,
  cilSync,
} from '@coreui/icons'
import {
  useRenovaciones,
  PersonaRenovacion,
} from '@/hooks/tab-persona/useRenovaciones'
import ModalAceptarSolicitud from '@/components/clients/ModalAceptarSolicitud'
import Modal_Edit from '@/components/clients/Modal_Edit'
import { getUserImageUrl, DEFAULT_RECREO_IMAGE } from '@/utils/imageUtils'
import { formatFecha } from '@/hooks/tab-persona/useClienteDs'
import { usePermissions } from '@/context/PermissionsContext'

const ClienteAvatar = ({ src, nombre, apellido }: { src?: string; nombre?: string; apellido?: string }) => {
  const [imgSrc, setImgSrc] = useState(src || DEFAULT_RECREO_IMAGE)

  useEffect(() => {
    setImgSrc(src || DEFAULT_RECREO_IMAGE)
  }, [src])

  return (
    <img
      src={imgSrc}
      alt={`${nombre || ''} ${apellido || ''}`.trim()}
      className="rounded-circle mb-2 shadow-sm border border-2 border-info bg-white"
      style={{ width: '140px', height: '140px', objectFit: 'cover' }}
      onError={() => {
        if (imgSrc !== DEFAULT_RECREO_IMAGE) {
          setImgSrc(DEFAULT_RECREO_IMAGE)
        }
      }}
    />
  )
}

const Renovate = () => {
  const { canDoAction } = usePermissions()
  const {
    personas,
    loading,
    submitting,
    visibleEditar,
    setVisibleEditar,
    visibleAceptar,
    setVisibleAceptar,
    solicitudSeleccionada,
    detalleRenovacion,
    setDetalleRenovacion,
    fetchSolicitudes,
    handleAbrirEditar,
    handleAbrirAceptar,
    handleAceptarSolicitud,
    details,
    toggleDetails,
  } = useRenovaciones()

  const [paginaActual, setPaginaActual] = useState<number>(1)
  const [itemsPerPage] = useState<number>(10)
  const [searchTerm, setSearchTerm] = useState<string>('')

  const columns = [
    {
      key: 'cedula',
      label: 'Cédula',
      _style: { width: '14%' },
    },
    {
      key: 'nombre',
      label: 'Nombre',
      _style: { width: '18%' },
    },
    {
      key: 'apellido',
      label: 'Apellido',
      _style: { width: '18%' },
    },
    {
      key: 'correo',
      label: 'Email',
      _style: { width: '22%' },
    },
    {
      key: 'fechaNacimiento',
      label: 'Fecha de Nacimiento',
      _style: { width: '12%' },
    },
    {
      key: 'fechaRegistro',
      label: 'Fecha de Registro',
      _style: { width: '12%' },
    },
    {
      key: 'tipo',
      label: 'Tipo',
      _style: { width: '8%' },
    },
  ]

  const getBadgeColor = (tipo?: string) => {
    switch (tipo) {
      case 'Renovacion':
      case 'Renovación':
        return 'danger'
      case 'Nuevo':
        return 'success'
      default:
        return 'info'
    }
  }

  // Filtrado en cliente de todas las solicitudes
  const filteredPersonas = useMemo(() => {
    if (!searchTerm.trim()) return personas
    const term = searchTerm.toLowerCase().trim()
    return personas.filter((p) => {
      const ced = String(p.IDENTIFICACION_PERSONA || '').toLowerCase()
      const nom = String(p.NOMBRE_PERSONA || '').toLowerCase()
      const ape = String(p.APELLIDO_PERSONA || '').toLowerCase()
      const email = String(p.CORREO_PERSONA || '').toLowerCase()
      return ced.includes(term) || nom.includes(term) || ape.includes(term) || email.includes(term)
    })
  }, [personas, searchTerm])

  const totalRegistros = filteredPersonas.length
  const totalPaginas = Math.max(1, Math.ceil(totalRegistros / itemsPerPage))
  const validActivePage = Math.min(paginaActual, totalPaginas)

  const paginatedItems = useMemo(() => {
    const start = (validActivePage - 1) * itemsPerPage
    return filteredPersonas.slice(start, start + itemsPerPage)
  }, [filteredPersonas, validActivePage, itemsPerPage])

  return (
    <div className="pb-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1">Solicitudes y Renovaciones</h3>
          <p className="text-body-secondary mb-0">
            Aprobación, verificación y gestión de solicitudes de registro y renovación de usuarios.
          </p>
        </div>
        <CButton
          color="secondary"
          variant="outline"
          size="sm"
          onClick={fetchSolicitudes}
          disabled={loading}
          className="d-flex align-items-center gap-2"
        >
          <CIcon icon={cilSync} />
          <span>Refrescar</span>
        </CButton>
      </div>

      <CCard className="shadow-sm border-0">
        <CCardHeader className="bg-transparent py-3 d-flex justify-content-between align-items-center">
          <span className="fw-semibold text-uppercase small">
            Listado de Solicitudes
          </span>
          <span className="text-body-secondary small">
            Total pendientes / registrados: <strong>{personas.length}</strong>
          </span>
        </CCardHeader>
        <CCardBody className="p-0">
          <CSmartTable
            clickableRows
            columns={columns}
            columnSorter
            cleaner
            loading={loading}
            items={paginatedItems}
            tableFilter={{ external: true }}
            tableFilterPlaceholder="Buscar por cédula, nombre, correo..."
            onTableFilterChange={(busqueda) => {
              setSearchTerm(busqueda || '')
              setPaginaActual(1)
            }}
            onRowClick={(item: PersonaRenovacion) => {
              const id = item.ID_PERSONA ?? item.IDENTIFICACION_PERSONA
              if (id !== undefined && id !== null) {
                toggleDetails(id)
              }
            }}
            noItemsLabel={
              loading ? (
                'Cargando solicitudes...'
              ) : (
                <div className="d-flex justify-content-center py-3">
                  <CSpinner color="primary" size="sm" variant="grow" />
                </div>
              )
            }
            scopedColumns={{
              cedula: (item: PersonaRenovacion) => (
                <td>
                  <span className="font-monospace small text-muted badge bg-body border">
                    {item.IDENTIFICACION_PERSONA}
                  </span>
                </td>
              ),
              nombre: (item: PersonaRenovacion) => (
                <td>
                  <span className="font-monospace small fw-semibold text-body">{item.NOMBRE_PERSONA}</span>
                </td>
              ),
              apellido: (item: PersonaRenovacion) => (
                <td>
                  <span className="font-monospace small fw-semibold text-body">{item.APELLIDO_PERSONA}</span>
                </td>
              ),
              correo: (item: PersonaRenovacion) => (
                <td>
                  <span
                    className="font-monospace small rounded-pill border px-2 text-muted d-inline-block text-truncate"
                    style={{ maxWidth: '180px' }}
                    title={item.CORREO_PERSONA}
                  >
                    {item.CORREO_PERSONA}
                  </span>
                </td>
              ),
              fechaNacimiento: (item: PersonaRenovacion) => (
                <td>
                  <span className="font-monospace small badge bg-white border text-primary">
                    {formatFecha(item.FECHA_PERSONA)}
                  </span>
                </td>
              ),
              fechaRegistro: (item: PersonaRenovacion) => (
                <td>
                  <span className="font-monospace small badge bg-white border text-success">
                    {formatFecha(item.FECHAREGISTRO_PERSONA)}
                  </span>
                </td>
              ),
              tipo: (item: PersonaRenovacion) => (
                <td>
                  <CBadge color={getBadgeColor(item.tipo_usuario)} shape="rounded-pill" className="px-3 py-1">
                    {item.tipo_usuario === 'Renovacion' || item.tipo_usuario === 'Renovación' ? 'Renovación' : 'Nuevo'}
                  </CBadge>
                </td>
              ),
              details: (item: PersonaRenovacion) => {
                const rowId = item.ID_PERSONA ?? item.IDENTIFICACION_PERSONA
                const isVisible =
                  (item.ID_PERSONA !== undefined && details.includes(item.ID_PERSONA)) ||
                  (item.IDENTIFICACION_PERSONA !== undefined && details.includes(item.IDENTIFICACION_PERSONA))
                const fotoUrl = getUserImageUrl(item.FOTO_PERSONA)

                const fechaNac = formatFecha(item.FECHA_PERSONA)
                const fechaReg = formatFecha(item.FECHAREGISTRO_PERSONA)
                const costo =
                  item.COSTO_INSCRIPCION !== undefined && item.COSTO_INSCRIPCION !== null && item.COSTO_INSCRIPCION !== ''
                    ? `$${item.COSTO_INSCRIPCION}`
                    : '$0.00'
                const detalle = item.DETALLE_INSCRIPCION || item.DETALLE_PERSONA || 'Sin observaciones registradas'
                const telefono = item.CELULAR_PERSONA || item.TELEFONO_PERSONA || 'No registrado'
                const direccion = item.DIRECCION_PERSONA || 'No registrada'
                const isRenovacion = item.tipo_usuario === 'Renovacion' || item.tipo_usuario === 'Renovación'

                return (
                  <CCollapse visible={isVisible} className="user-details-collapse">
                    <div className="user-details-content p-3 p-md-4 bg-body-tertiary border-top border-bottom rounded-bottom">
                      <CRow className="g-3">
                        {/* Lado izquierdo: Avatar grande y resumen */}
                        <CCol
                          xs={12}
                          md={4}
                          lg={3}
                          className="d-flex flex-column align-items-center justify-content-center font-monospace text-center border-end-md pb-3 pb-md-0"
                        >
                          <ClienteAvatar
                            key={`${rowId}_${item.FOTO_PERSONA || 'avatar'}`}
                            src={fotoUrl}
                            nombre={item.NOMBRE_PERSONA}
                            apellido={item.APELLIDO_PERSONA}
                          />
                          <h5 className="fw-bold mb-1 text-body">
                            {item.NOMBRE_PERSONA} {item.APELLIDO_PERSONA}
                          </h5>
                          <span className="text-muted small mb-2 text-truncate" style={{ maxWidth: '220px' }}>
                            {item.CORREO_PERSONA || 'Sin correo registrado'}
                          </span>
                          <div className="d-flex flex-wrap gap-1 justify-content-center">
                            <CBadge color={getBadgeColor(item.tipo_usuario)} shape="rounded-pill" className="px-3 py-1">
                              {isRenovacion ? 'Solicitud Renovación' : 'Usuario Nuevo'}
                            </CBadge>
                            <CBadge
                              color={item.ESTADO_PERSONA === 1 ? 'success' : 'warning'}
                              shape="rounded-pill"
                              className="px-3 py-1"
                            >
                              {item.ESTADO_PERSONA === 1 ? 'Activo' : 'Pendiente'}
                            </CBadge>
                          </div>
                        </CCol>

                        {/* Lado derecho: Tarjetas informativas en Grid */}
                        <CCol xs={12} md={8} lg={9}>
                          <CRow className="g-2">
                            <CCol xs={12} sm={6} lg={4}>
                              <CCard className="h-100 shadow-sm border-0 bg-body">
                                <CCardBody className="p-3">
                                  <span className="text-muted small d-block mb-1">Nº Identificación</span>
                                  <span className="font-monospace text-body badge bg-body border rounded-pill">
                                    {item.IDENTIFICACION_PERSONA || 'S/N'}
                                  </span>
                                </CCardBody>
                              </CCard>
                            </CCol>

                            <CCol xs={12} sm={6} lg={4}>
                              <CCard className="h-100 shadow-sm border-0 bg-body">
                                <CCardBody className="p-3">
                                  <span className="text-muted small d-block mb-1">Fecha de Nacimiento</span>
                                  <div className="d-flex align-items-center gap-1">
                                    <CIcon icon={cilCalendar} className="text-primary" />
                                    <span className="badge bg-body rounded-pill border text-primary">
                                      {fechaNac}
                                    </span>
                                  </div>
                                </CCardBody>
                              </CCard>
                            </CCol>

                            <CCol xs={12} sm={6} lg={4}>
                              <CCard className="h-100 shadow-sm border-0 bg-body">
                                <CCardBody className="p-3">
                                  <span className="text-muted small d-block mb-1">Fecha de Registro</span>
                                  <div className="d-flex align-items-center gap-1">
                                    <CIcon icon={cilCalendar} className="text-success" />
                                    <span className="badge bg-body rounded-pill border text-success">
                                      {fechaReg}
                                    </span>
                                  </div>
                                </CCardBody>
                              </CCard>
                            </CCol>

                            <CCol xs={12} sm={6} lg={4}>
                              <CCard className="h-100 shadow-sm border-0 bg-body">
                                <CCardBody className="p-3">
                                  <span className="text-muted small d-block mb-1">Costo Inscripción</span>
                                  <div className="d-flex align-items-center gap-1">
                                    <CIcon
                                      icon={cilDollar}
                                      className={costo === '$0.00' ? 'text-secondary' : 'text-primary'}
                                    />
                                    <span
                                      className={`badge bg-body rounded-pill border ${
                                        costo === '$0.00' ? 'text-secondary' : 'text-primary'
                                      }`}
                                    >
                                      {costo}
                                    </span>
                                  </div>
                                </CCardBody>
                              </CCard>
                            </CCol>

                            <CCol xs={12} sm={6} lg={4}>
                              <CCard className="h-100 shadow-sm border-0 bg-body">
                                <CCardBody className="p-3">
                                  <span className="text-muted small d-block mb-1">Teléfono / Celular</span>
                                  <div className="d-flex align-items-center gap-1">
                                    <CIcon icon={cilPhone} className="text-secondary" />
                                    <span className="small text-body font-monospace">{telefono}</span>
                                  </div>
                                </CCardBody>
                              </CCard>
                            </CCol>

                            <CCol xs={12} sm={6} lg={4}>
                              <CCard className="h-100 shadow-sm border-0 bg-body">
                                <CCardBody className="p-3">
                                  <span className="text-muted small d-block mb-1">Dirección</span>
                                  <div className="d-flex align-items-center gap-1 text-truncate">
                                    <CIcon icon={cilLocationPin} className="text-secondary flex-shrink-0" />
                                    <span className="small text-body text-truncate" title={direccion}>
                                      {direccion}
                                    </span>
                                  </div>
                                </CCardBody>
                              </CCard>
                            </CCol>

                            <CCol xs={12}>
                              <CCard className="shadow-sm border-0 bg-body">
                                <CCardBody className="p-3">
                                  <span className="text-muted small d-block mb-1">Detalle de Solicitud / Observaciones:</span>
                                  <div className="d-flex align-items-start gap-1">
                                    <CIcon icon={cilDescription} className="text-info mt-1 flex-shrink-0" />
                                    <span className="small text-body">{detalle}</span>
                                  </div>
                                </CCardBody>
                              </CCard>
                            </CCol>
                          </CRow>

                          {/* Acciones dentro del detalle */}
                          <div className="d-flex flex-wrap gap-2 justify-content-end mt-3 pt-2 border-top">
                            {canDoAction('btn_editar_usuario_renovaciones') && (
                            <CButton
                              color="info"
                              variant="outline"
                              size="sm"
                              className="d-flex align-items-center gap-1 px-3"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleAbrirEditar(item)
                              }}
                            >
                              <CIcon icon={cilPencil} size="sm" />
                              <span>Ver / Editar Solicitud</span>
                            </CButton>
                            )}

                            {item.ESTADO_PERSONA === 0 && canDoAction('btn_aceptar_solicitud') && (
                              <CButton
                                color="warning"
                                variant="outline"
                                size="sm"
                                className="d-flex align-items-center gap-1 px-3"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleAbrirAceptar(item)
                                }}
                              >
                                <CIcon icon={cilCheckCircle} size="sm" />
                                <span>Aceptar Solicitud</span>
                              </CButton>
                            )}
                          </div>
                        </CCol>
                      </CRow>
                    </div>
                  </CCollapse>
                )
              },
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

        <CCardFooter className="bg-transparent border-top py-3">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 px-1">
            <span className="text-muted small">
              Mostrando {paginatedItems.length} de {totalRegistros} solicitudes (Página {validActivePage} de {totalPaginas})
            </span>
            <CSmartPagination
              activePage={validActivePage}
              pages={totalPaginas}
              onActivePageChange={(nuevaPagina: number) => {
                setPaginaActual(nuevaPagina)
              }}
            />
          </div>
        </CCardFooter>
      </CCard>

      <ModalAceptarSolicitud
        visible={visibleAceptar}
        onClose={() => setVisibleAceptar(false)}
        solicitud={solicitudSeleccionada}
        detalleRenovacion={detalleRenovacion}
        setDetalleRenovacion={setDetalleRenovacion}
        onAceptar={handleAceptarSolicitud}
        loading={submitting}
      />

      <Modal_Edit
        visible={visibleEditar}
        setVisible={setVisibleEditar}
        user={solicitudSeleccionada}
        onSuccess={fetchSolicitudes}
      />
    </div>
  )
}

export default Renovate