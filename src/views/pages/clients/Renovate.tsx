import {
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CImage,
  CSmartTable,
  CSpinner
} from '@coreui/react-pro'
import CIcon from '@coreui/icons-react'
import { cilCheckCircle, cilContact, cilSync } from '@coreui/icons'
import {
  useRenovaciones,
  PersonaRenovacion,
  STORAGE_BASE_URL,
} from '@/hooks/tab-persona/useRenovaciones'
import ModalAceptarSolicitud from '@/components/clients/ModalAceptarSolicitud'
import ModalVerEditarSolicitud from '@/components/clients/ModalVerEditarSolicitud'

const Renovate = () => {
  const {
    personas,
    loading,
    submitting,
    generos,
    tiposIdentificacion,
    nacionalidades,
    estadosCiviles,
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
    handleActualizarPersona,
  } = useRenovaciones()

  const columns = [
    {
      key: 'cedula',
      label: 'Cédula',
      _style: { width: '12%' },
    },
    {
      key: 'nombre',
      label: 'Nombre',
      _style: { width: '14%' },
    },
    {
      key: 'apellido',
      label: 'Apellido',
      _style: { width: '14%' },
    },
    {
      key: 'imagen',
      label: 'Fotografía',
      _style: { width: '10%' },
      filter: false,
      sorter: false,
    },
    {
      key: 'correo',
      label: 'Email',
      _style: { width: '16%' },
    },
    {
      key: 'fechaNacimiento',
      label: 'Fecha de Nacimiento',
      _style: { width: '10%' },
    },
    {
      key: 'fechaRegistro',
      label: 'Fecha de Inscripción',
      _style: { width: '10%' },
    },
    {
      key: 'tipo',
      label: 'Tipo',
      _style: { width: '10%' },
    },
    {
      key: 'acciones',
      label: 'Acciones',
      _style: { width: '14%' },
      filter: false,
      sorter: false,
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
            activePage={1}
            columns={columns}
            columnSorter
            items={personas}
            itemsPerPage={60}
            itemsPerPageSelect
            pagination
            tableFilter
            tableFilterPlaceholder="Buscar por cédula, nombre, correo..."
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
                  <span className="font-monospace small">{item.NOMBRE_PERSONA}</span>
                </td>
              ),
              apellido: (item: PersonaRenovacion) => (
                <td>
                  <span className="font-monospace small">{item.APELLIDO_PERSONA}</span>
                </td>
              ),
              imagen: (item: PersonaRenovacion) => {
                const fotoUrl = item.FOTO_PERSONA
                  ? item.FOTO_PERSONA.startsWith('http')
                    ? item.FOTO_PERSONA
                    : `${STORAGE_BASE_URL}/${item.FOTO_PERSONA}`
                  : ''
                return (
                  <td>
                    {fotoUrl ? (
                      <CImage
                        src={fotoUrl}
                        width={46}
                        height={46}
                        rounded
                        className="object-fit-cover border"
                      />
                    ) : (
                      <div
                        className="bg-light border rounded d-flex align-items-center justify-content-center text-secondary"
                        style={{ width: '46px', height: '46px' }}
                      >
                        <CIcon icon={cilContact} size="lg" />
                      </div>
                    )}
                  </td>
                )
              },
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
                    {item.FECHA_PERSONA
                      ? new Date(item.FECHA_PERSONA).toLocaleDateString()
                      : '-'}
                  </span>
                </td>
              ),
              fechaRegistro: (item: PersonaRenovacion) => (
                <td>
                  <span className="font-monospace small badge bg-white border text-success">
                    {item.FECHAREGISTRO_PERSONA
                      ? new Date(item.FECHAREGISTRO_PERSONA).toLocaleDateString()
                      : '-'}
                  </span>
                </td>
              ),
              tipo: (item: PersonaRenovacion) => (
                <td>
                  <CBadge color={getBadgeColor(item.tipo_usuario)} shape="rounded-pill">
                    {item.tipo_usuario === 'Renovacion' ? 'Renovación' : 'Nuevo'}
                  </CBadge>
                </td>
              ),
              acciones: (item: PersonaRenovacion) => (
                <td>
                  <div className="d-flex gap-2">
                    <CButton
                      color="info"
                      variant="outline"
                      className="hover:text-white d-flex align-items-center gap-1"
                      size="sm"
                      onClick={() => handleAbrirEditar(item)}
                      title="Ver o editar datos completos"
                    >
                      <CIcon icon={cilContact} size="sm" />
                      <span>Ver Datos</span>
                    </CButton>
                    {item.ESTADO_PERSONA === 0 && (
                      <CButton
                        color="warning"
                        variant="outline"
                        className="hover:text-white d-flex align-items-center gap-1"
                        size="sm"
                        onClick={() => handleAbrirAceptar(item)}
                        title="Aceptar y activar inscripción"
                      >
                        <CIcon icon={cilCheckCircle} size="sm" />
                        <span>Aceptar Solicitud</span>
                      </CButton>
                    )}
                  </div>
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

      <ModalAceptarSolicitud
        visible={visibleAceptar}
        onClose={() => setVisibleAceptar(false)}
        solicitud={solicitudSeleccionada}
        detalleRenovacion={detalleRenovacion}
        setDetalleRenovacion={setDetalleRenovacion}
        onAceptar={handleAceptarSolicitud}
        loading={submitting}
      />

      <ModalVerEditarSolicitud
        visible={visibleEditar}
        onClose={() => setVisibleEditar(false)}
        solicitud={solicitudSeleccionada}
        generos={generos}
        tiposIdentificacion={tiposIdentificacion}
        nacionalidades={nacionalidades}
        estadosCiviles={estadosCiviles}
        onGuardar={handleActualizarPersona}
        loading={submitting}
      />
    </div>
  )
}

export default Renovate 