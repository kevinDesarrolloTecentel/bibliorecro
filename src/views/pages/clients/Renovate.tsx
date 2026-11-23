import { useMemo } from 'react'
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
} from '@coreui/react-pro'
import CIcon from '@coreui/icons-react'
import {
  cilCalendar,
  cilCheckCircle,
  cilDescription,
  cilLocationPin,
  cilPencil,
  cilPhone,
  cilSync,
  cilTask
} from '@coreui/icons'
import useRenovaciones from '@/hooks/tab-persona/useRenovaciones'
import { PersonaRenovacion } from '@/models/tab/persona.model'
import ModalAceptarSolicitud from '@/components/clients/ModalAceptarSolicitud'
import Modal_Edit from '@/components/clients/Modal_Edit'
import ClienteAvatar from '@/components/clients/ClienteAvatar'
import { getUserImageUrl } from '@/utils/imageUtils'
import { formatFecha } from '@/utils/dateUtils'

const Renovate = () => {
  const {
    loading,
    submitting,
    setSearchTerm,
    setPaginaActual,
    totalRegistros,
    totalPaginas,
    validActivePage,
    paginatedItems,
    getBadgeColor,
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
    canVerUsuario,
    canAceptarSolicitud,
    canMostrarInfo,
    canActivarUsuario,
    handleColumnFilterChange,
    handleRecargar,
    tableKey,
  } = useRenovaciones()

  const columns = useMemo(
    () => [
      {
        key: 'cedula',
        label: 'Cédula',
        _style: { width: '6%' },
        filter: false,
      },
      {
        key: 'nombre',
        label: 'Nombre',
        _style: { width: '10%' },
        filter: false,
      },
      {
        key: 'apellido',
        label: 'Apellido',
        _style: { width: '10%' },
        filter: false,
      },
      {
        key: 'correo',
        label: 'Email',
        _style: { width: '15%' },
        filter: false,
      },
      {
        key: 'fechaNacimiento',
        label: 'Fecha de Nacimiento',
        _style: { width: '12%' },
        filter: false,
      },
      {
        key: 'fechaRegistro',
        label: 'Fecha de Registro',
        _style: { width: '12%' },
        filter: false,
      },
      {
        key: 'tipo',
        label: 'Tipo',
        _style: { width: '7%' },
        filter: (_values: unknown[], onChange: (val: string | number) => void, filterValue?: string | number) => (
          <select
            className="form-select form-select-sm"
            value={String(filterValue || '')}
            onChange={(e) => onChange(e.target.value)}
            aria-label="Filtrar por tipo"
          >
            <option value="">Todo</option>
            <option value="Nuevo">Nuevo</option>
            <option value="Renovación">Renovación</option>
          </select>
        ),
      },
    ],
    []
  )

  return (
    <div className="pb-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h3 className="fw-bold mb-1 text-body d-flex align-items-center gap-2">
            <CIcon icon={cilTask} size="lg" style={{ color: '#27a142ff' }} />
            <span>
              Solicitudes y Renovaciones
            </span>
          </h3>
          <p className="text-body-secondary mb-0">
            Gestión de solicitudes de registro y renovación de usuarios.
          </p>
        </div>
        <CButton
          color="secondary"
          variant="outline"
          size="sm"
          onClick={handleRecargar}
          disabled={loading}
          className="d-flex align-items-center gap-1 shadow-sm"
          title="Refrescar solicitudes y reiniciar filtros"
        >
          <CIcon icon={cilSync} className={`me-1 ${loading ? 'rotate-animation' : ''}`} />
          <span>{loading ? 'Refrescando...' : 'Refrescar'}</span>
        </CButton>
      </div>

      <CCard className="shadow-sm border-0">
        <CCardHeader className="bg-transparent py-3 d-flex justify-content-between align-items-center">
          <span className="fw-semibold text-uppercase small d-inline-flex align-items-center gap-2">
            <CIcon icon={cilTask} style={{ color: '#27a142ff' }} />
            Listado de Solicitudes
          </span>
          <span className="text-body-secondary small">
            Total pendientes / registrados: <strong>{totalRegistros}</strong>
          </span>
        </CCardHeader>
        <CCardBody className="p-0">
          <CSmartTable
            key={tableKey}
            clickableRows={canMostrarInfo}
            columns={columns}
            columnSorter
            columnFilter={{ external: true }}
            onColumnFilterChange={(filtros: any) => handleColumnFilterChange(filtros)}
            loading={loading}
            items={paginatedItems}
            tableFilter={{ external: true }}
            tableFilterPlaceholder="Buscar por cédula, nombre, correo..."
            onTableFilterChange={(busqueda) => {
              setSearchTerm(busqueda || '')
            }}
            onRowClick={(item: PersonaRenovacion) => {
              if (!canMostrarInfo) return
              const id = item.ID_PERSONA ?? item.IDENTIFICACION_PERSONA
              if (id !== undefined && id !== null) {
                toggleDetails(id)
              }
            }}
            noItemsLabel={
              loading ? (
                'Cargando usuarios...'
              ) : (
                'No se encontraron usuarios'
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
                    title={item.CORREO_PERSONA || undefined}
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
                  <CBadge color={getBadgeColor(item.tipo_usuario || undefined)} shape="rounded-pill" className="px-3 py-1">
                    {item.tipo_usuario === 'Renovacion' || item.tipo_usuario === 'Renovación' ? 'Renovación' : 'Nuevo'}
                  </CBadge>
                </td>
              ),
              details: (item: PersonaRenovacion) => {
                if (!canMostrarInfo) return null
                const rowId = item.ID_PERSONA ?? item.IDENTIFICACION_PERSONA
                const isVisible =
                  (item.ID_PERSONA !== undefined && item.ID_PERSONA !== null && details.includes(item.ID_PERSONA)) ||
                  (item.IDENTIFICACION_PERSONA !== undefined && item.IDENTIFICACION_PERSONA !== null && details.includes(item.IDENTIFICACION_PERSONA))
                const fotoUrl = getUserImageUrl(item.FOTO_PERSONA)

                const fechaNac = formatFecha(item.FECHA_PERSONA)
                const fechaReg = formatFecha(item.FECHAREGISTRO_PERSONA)
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
                            nombre={item.NOMBRE_PERSONA || undefined}
                            apellido={item.APELLIDO_PERSONA || undefined}
                          />
                          <h5 className="fw-bold mb-1 text-body">
                            {item.NOMBRE_PERSONA} {item.APELLIDO_PERSONA}
                          </h5>
                          <span className="text-muted small mb-2 text-truncate" style={{ maxWidth: '220px' }}>
                            {item.CORREO_PERSONA || 'Sin correo registrado'}
                          </span>
                          <div className="d-flex flex-wrap gap-1 justify-content-center">
                            <CBadge color={getBadgeColor(item.tipo_usuario || undefined)} shape="rounded-pill" className="px-3 py-1">
                              {isRenovacion ? 'Solicitud Renovación' : 'Usuario Nuevo'}
                            </CBadge>
                            <CBadge
                              color={Number(item.ESTADO_PERSONA) === 1 ? 'success' : 'warning'}
                              shape="rounded-pill"
                              className="px-3 py-1"
                            >
                              {Number(item.ESTADO_PERSONA) === 1 ? 'Activo' : 'Pendiente'}
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

                            <CCol xs={12} sm={6} lg={6}>
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

                            <CCol xs={12} sm={6} lg={6}>
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
                                  <span className="text-muted small d-block mb-1">Descripción:</span>
                                  <div className="d-flex align-items-start gap-1">
                                    <CIcon icon={cilDescription} className="text-info mt-1 flex-shrink-0" />
                                    <span className="small text-body">{detalle}</span>
                                  </div>
                                </CCardBody>
                              </CCard>
                            </CCol>
                          </CRow>

                          {/* Acciones dentro del detalle */}
                          {(canVerUsuario || (Number(item.ESTADO_PERSONA) === 0 && canAceptarSolicitud)) ? (
                            <div className="d-flex flex-wrap gap-2 justify-content-end mt-3 pt-2 border-top">
                              {canVerUsuario && (
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
                                  <span>Ver Datos</span>
                                </CButton>
                              )}

                              {Number(item.ESTADO_PERSONA) === 0 && canAceptarSolicitud && (
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
                          ) : (
                            <span className="text-danger small fw-semibold d-inline-flex align-items-center py-1">                                  
                            No tienes acceso a las acciones de usuario.
                            </span>
                          )}
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
        canActivar={canActivarUsuario}
      />

      <Modal_Edit
        visible={visibleEditar}
        setVisible={setVisibleEditar}
        user={solicitudSeleccionada}
        onSuccess={fetchSolicitudes}
        readOnly={true}
      />
    </div>
  )
}

export default Renovate