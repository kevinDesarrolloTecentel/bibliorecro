import { useMemo } from 'react'
import {
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CCollapse,
  CRow,
  CSmartPagination,
  CSmartTable,
} from '@coreui/react-pro'
import CIcon from '@coreui/icons-react'
import { cilCalendar, cilClock, cilDollar, cilPencil, cilTrash, cilUser, cilWarning, cilAddressBook } from '@coreui/icons'
import Swal from 'sweetalert2'
import Modal_Register from '@/components/clients/Modal_Register'
import Modal_Edit from '@/components/clients/Modal_Edit'
import HeaderCliente from '@/components/clients/HeaderCliente'
import ModalRenova from '@/components/clients/ModalRenovaciones'
import usePersonas from '@/hooks/tab-persona/usePersonas'
import ClienteAvatar from '@/components/clients/ClienteAvatar'
import { buscarPrestamos } from '@/Service/rco/Prestamos'

const ClienteDs = () => {
  const personaState = usePersonas()
  const {
    items,
    getBadge,
    getBadgeSancion,
    canVerDetalles,
    canEditar,
    canEliminar,
    canRenovar,
    canGuardarRenovacion,
    tieneAcciones,
  } = personaState

  const tableColumns = useMemo(
    () => [
      {
        key: 'IDENTIFICACION_PERSONA',
        label: 'Identificación',
        _style: { width: '14%' },
        filter: false,
      },
      {
        key: 'NOMBRE_PERSONA',
        label: 'Nombres',
        _style: { width: '18%' },
        filter: false,
      },
      {
        key: 'APELLIDO_PERSONA',
        label: 'Apellidos',
        _style: { width: '18%' },
        filter: false,
      },
      {
        key: 'CORREO_PERSONA',
        label: 'Email',
        _style: { width: '22%' },
        filter: false,
      },
      {
        key: 'estado',
        label: 'Estado',
        _style: { width: '14%' },
        filter: (_values: unknown[], onChange: (val: string | number) => void, filterValue?: string | number) => (
          <select
            className="form-select form-select-sm"
            value={String(filterValue || '')}
            onChange={(e) => onChange(e.target.value)}
            aria-label="Filtrar por estado"
          >
            <option value="">Todos los estados</option>
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </select>
        ),
      },
      {
        key: 'sancionado',
        label: 'Sanción',
        _style: { width: '14%' },
        filter: (_values: unknown[], onChange: (val: string | number) => void, filterValue?: string | number) => (
          <select
            className="form-select form-select-sm"
            value={String(filterValue || '')}
            onChange={(e) => onChange(e.target.value)}
            aria-label="Filtrar por sanción"
          >
            <option value="">Todas las sanciones</option>
            <option value="Sin sanción">Sin sanción</option>
            <option value="Con sanción">Con sanción</option>
            <option value="Vetado">Vetado</option>
          </select>
        ),
      },
    ],
    [],
  )

  const handleConfirmarEliminar = async (item: any) => {
    if (!canEliminar) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para eliminar usuarios.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    const idPersona = item.ID_PERSONA
    if (!idPersona) return

    const nombreCompleto = `${item.NOMBRE_PERSONA || ''} ${item.APELLIDO_PERSONA || ''}`.trim()

    // 1. Verificar si el usuario se encuentra con libros en préstamo
    const cedula = item.IDENTIFICACION_PERSONA
    if (cedula) {
      try {
        const resp = await buscarPrestamos(cedula)
        const listaPrestamos: any[] = Array.isArray(resp?.data)
          ? resp.data
          : Array.isArray(resp?.prestamos)
            ? resp.prestamos
            : Array.isArray(resp)
              ? resp
              : []

        const tienePrestamoActivo = listaPrestamos.some((p: any) => {
          const idPrestamoPersona = p.ID_PERSONA ?? p.id_persona
          const esMismaPersona = idPrestamoPersona ? String(idPrestamoPersona) === String(idPersona) : true
          const est = String(p.ESTADO_PRESTAMO ?? p.estado ?? p.status ?? '1').toLowerCase().trim()
          const enPrestamo = est === '1' || est === 'en prestamo' || est === 'en préstamo' || est === 'activo'
          return esMismaPersona && enPrestamo
        })

        if (tienePrestamoActivo) {
          Swal.fire({
            icon: 'warning',
            title: 'No se puede eliminar',
            text: `No se puede eliminar el usuario ${nombreCompleto} porque se encuentra en préstamo.`,
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'Entendido',
          })
          return
        }
      } catch (e) {
        console.warn('[ClienteDs] No se pudo verificar préstamos previos:', e)
      }
    }

    // 2. Si no tiene préstamos activos, solicitar confirmación
    const result = await Swal.fire({
      title: '¿Eliminar usuario?',
      text: `¿Estás seguro de que deseas eliminar a ${nombreCompleto}? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    })

    if (result.isConfirmed) {
      const ok = await personaState.handleEliminarPersona(idPersona)
      if (ok) {
        Swal.fire({
          icon: 'success',
          title: '¡Usuario eliminado!',
          text: `El usuario ${nombreCompleto} fue eliminado correctamente.`,
          timer: 1800,
          showConfirmButton: false,
        })
      }
    }
  }

  return (
    <div className="pb-4">
      <HeaderCliente personaState={personaState} />
      <Modal_Register personaState={personaState} />
      <Modal_Edit personaState={personaState} />

      <CCard className="shadow-sm border-0">
        <CCardHeader className="bg-transparent py-3 d-flex justify-content-between align-items-center">
          <span className="fw-semibold text-uppercase small d-inline-flex align-items-center gap-2">
            <CIcon icon={cilAddressBook} style={{ color: '#258d1bff' }} />
            <span>Listado de Usuarios Registrados</span>
          </span>
          <span className="text-body-secondary small">
            Total usuarios registrados: <strong>{personaState.totalRegistros}</strong>
          </span>
        </CCardHeader>
        <CCardBody className="p-0">
          <CSmartTable
            key={personaState.tableKey}
            clickableRows={canVerDetalles}
            columns={tableColumns}
            columnSorter
            columnFilter={{ external: true }}
            onColumnFilterChange={(filtros: any) => personaState.handleColumnFilterChange(filtros)}
            loading={personaState.loading}
            tableFilter={{ external: true }}
            tableFilterPlaceholder="Buscar por Identificación o Nombres"
            onTableFilterChange={(busqueda) => personaState.fetchPersonas(1, undefined, busqueda)}
            items={items}
            noItemsLabel={
              personaState.loading ? (
                'Cargando usuarios...'
              ) : (
                'No se encontraron usuarios'
              )
            }
            onRowClick={(item: any) => {
              if (canVerDetalles && item?.ID_PERSONA) {
                personaState.toggleDetails(item.ID_PERSONA)
              }
            }}
            scopedColumns={{
              IDENTIFICACION_PERSONA: (item: any) => (
                <td>
                  <div className="text-body font-monospace">
                    <span>{item.IDENTIFICACION_PERSONA}</span>
                  </div>
                </td>
              ),
              NOMBRE_PERSONA: (item: any) => (
                <td>
                  <div className="text-body font-monospace">
                    <span className="fw-semibold">{item.NOMBRE_PERSONA}</span>
                  </div>
                </td>
              ),
              APELLIDO_PERSONA: (item: any) => (
                <td>
                  <div className="text-body font-monospace">
                    <span className="fw-semibold">{item.APELLIDO_PERSONA}</span>
                  </div>
                </td>
              ),
              CORREO_PERSONA: (item: any) => (
                <td>
                  <span className='font-monospace'>{item.CORREO_PERSONA}</span>
                </td>
              ),
              estado: (item: any) => (
                <td>
                  <CBadge color={getBadge(item.estado)} shape="rounded-pill" className="px-3 py-1">
                    {item.estado}
                  </CBadge>
                </td>
              ),
              sancionado: (item: any) => (
                <td>
                  <CBadge
                    color={getBadgeSancion(item.sancionado)}
                    shape="rounded-pill"
                    className={`px-3 py-1 ${getBadgeSancion(item.sancionado) === 'warning' ? 'text-dark fw-semibold' : ''}`}
                  >
                    {item.sancionado || 'Sin sanción'}
                  </CBadge>
                </td>
              ),
              details: (item: any) => {
                if (!canVerDetalles) {
                  return null
                }
                const isVisible = personaState.details.includes(item.ID_PERSONA)
                return (
                  <CCollapse visible={isVisible} className="user-details-collapse">
                    <div className="user-details-content p-3 p-md-4 bg-body-tertiary border-top border-bottom rounded-bottom">
                      <CRow className="g-3">
                        <CCol xs={12} md={4} lg={3} className="d-flex flex-column align-items-center justify-content-center font-monospace text-center border-end-md pb-3 pb-md-0">
                          <ClienteAvatar key={`${item.ID_PERSONA}_${item.fotografia || 'no_foto'}`} src={item.fotografia} nombre={item.NOMBRE_PERSONA} apellido={item.APELLIDO_PERSONA} />
                          <h5 className="fw-bold mb-0 text-body">
                            {item.NOMBRE_PERSONA} {item.APELLIDO_PERSONA}
                          </h5>
                          <span className="text-muted small mb-2">{item.CORREO_PERSONA}</span>
                          <div className="d-flex flex-wrap gap-1 justify-content-center">
                            <CBadge color={getBadge(item.estado)} shape="rounded-pill" className="px-3 py-1">
                              {item.estado}
                            </CBadge>
                            <CBadge
                              color={getBadgeSancion(item.sancionado)}
                              shape="rounded-pill"
                              className={`px-3 py-1 ${getBadgeSancion(item.sancionado) === 'warning' ? 'text-dark fw-semibold' : ''}`}
                            >
                              {item.sancionado || 'Sin sanción'}
                            </CBadge>
                          </div>
                        </CCol>

                        <CCol xs={12} md={8} lg={9}>
                          <CRow className="g-2">
                            <CCol xs={12} sm={6} lg={4}>
                              <CCard className="h-100 shadow-sm border-0 bg-body">
                                <CCardBody className="p-3">
                                  <span className="text-body small d-block mb-1">Nº Identificación</span>
                                  <span className='font-monospace text-body badge bg-body border rounded-pill'>{item.IDENTIFICACION_PERSONA}</span>
                                </CCardBody>
                              </CCard>
                            </CCol>

                            <CCol xs={12} sm={6} lg={4}>
                              <CCard className="h-100 shadow-sm border-0 bg-body">
                                <CCardBody className="p-3">
                                  <span className="text-muted small d-block mb-1">Inicio de Inscripción</span>
                                  <div className="d-flex align-items-center gap-1">
                                    <CIcon
                                      icon={cilCalendar}
                                      className={
                                        item.inicio_inscripcion === 'Sin inscripción' || item.inicio_inscripcion === 'No registrada'
                                          ? 'text-secondary'
                                          : 'text-success'
                                      }
                                    />
                                    <span
                                      className={`badge bg-body rounded-pill border ${item.inicio_inscripcion === 'Sin inscripción' || item.inicio_inscripcion === 'No registrada'
                                        ? 'text-secondary'
                                        : 'text-success'
                                        }`}
                                    >
                                      {item.inicio_inscripcion}
                                    </span>
                                  </div>
                                </CCardBody>
                              </CCard>
                            </CCol>

                            <CCol xs={12} sm={6} lg={4}>
                              <CCard className="h-100 shadow-sm border-0 bg-body">
                                <CCardBody className="p-3">
                                  <span className="text-muted small d-block mb-1">Fin de Inscripción</span>
                                  <div className="d-flex align-items-center gap-1">
                                    <CIcon
                                      icon={cilCalendar}
                                      className={
                                        item.fin_inscripcion === 'Sin inscripción' || item.fin_inscripcion === 'No registrada'
                                          ? 'text-secondary'
                                          : 'text-warning'
                                      }
                                    />
                                    <span
                                      className={`badge bg-body rounded-pill border ${item.fin_inscripcion === 'Sin inscripción' || item.fin_inscripcion === 'No registrada'
                                        ? 'text-secondary'
                                        : 'text-warning'
                                        }`}
                                    >
                                      {item.fin_inscripcion}
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
                                      className={item.costo === '0.00' ? 'text-secondary' : 'text-primary'}
                                    />
                                    <span
                                      className={`badge bg-body rounded-pill border ${item.costo === '0.00' ? 'text-secondary' : 'text-primary'
                                        }`}
                                    >
                                      {item.costo}
                                    </span>
                                  </div>
                                </CCardBody>
                              </CCard>
                            </CCol>

                            <CCol xs={12} sm={6} lg={4}>
                              <CCard className="h-100 shadow-sm border-0 bg-body">
                                <CCardBody className="p-3">
                                  <span className="text-muted small d-block mb-1">Edad</span>
                                  <div className="d-flex align-items-center gap-1">
                                    <CIcon icon={cilUser} className="text-info" />
                                    <span className="badge bg-body rounded-pill border text-body font-monospace">
                                      {item.EDAD_PERSONA
                                        ? (String(item.EDAD_PERSONA).toLowerCase().includes('año')
                                          ? String(item.EDAD_PERSONA)
                                          : `${item.EDAD_PERSONA} años`)
                                        : 'No registrada'}
                                    </span>
                                  </div>
                                </CCardBody>
                              </CCard>
                            </CCol>

                            <CCol xs={12} sm={6} lg={4}>
                              <CCard className="h-100 shadow-sm border-0 bg-body">
                                <CCardBody className="p-3">
                                  <span className="text-muted small d-block mb-1">Dirección Domiciliaria</span>
                                  <span
                                    className="small text-body fw-medium d-block text-break"
                                    title={item.DIRECCION_PERSONA || 'No registrada'}
                                  >
                                    {item.DIRECCION_PERSONA || 'No registrada'}
                                  </span>
                                </CCardBody>
                              </CCard>
                            </CCol>

                            {/* Si tiene sanción ACTIVA o VETO PERMANENTE */}
                            {(item.tiene_sancion || item.sancionado === 'Con sanción' || String(item.sancionado || '').includes('Vetado')) ? (
                              <>
                                <CCol xs={12} sm={12} lg={12}>
                                  <CCard className="h-100 shadow-sm border-0 bg-body">
                                    <CCardBody className="p-3">
                                      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
                                        <span className="text-muted small fw-semibold">
                                          <CIcon icon={cilCalendar} className="me-1 text-danger" />
                                          Sanción Actual
                                        </span>
                                        <CBadge
                                          color={String(item.sancionado || '').includes('Vetado') || item.es_vetado ? 'danger' : 'warning'}
                                          shape="rounded-pill"
                                          className={`px-2 py-1 ${!(String(item.sancionado || '').includes('Vetado') || item.es_vetado) ? 'text-dark fw-semibold' : ''}`}
                                        >
                                          {String(item.sancionado || '').includes('Vetado') || item.es_vetado ? 'Vetado' : 'Con sanción'}
                                        </CBadge>
                                      </div>
                                      <div className="d-flex flex-wrap gap-1 align-items-center mb-2">
                                        <span className="badge bg-body rounded-pill border text-danger font-monospace">
                                          Desde: {item.inicio_sancion || 'No registrada'}
                                        </span>
                                        <span className="badge bg-body rounded-pill border text-danger font-monospace">
                                          Hasta: {item.fin_sancion || 'No registrada'}
                                        </span>
                                      </div>
                                      <div className="small text-body pt-1 border-top">
                                        <span className="text-muted fw-semibold me-1">Motivo:</span>
                                        <span>{item.motivo_sancion_actual || 'Sanción registrada en el sistema'}</span>
                                      </div>
                                    </CCardBody>
                                  </CCard>
                                </CCol>

                                {Array.isArray(item.otras_sanciones) && item.otras_sanciones.length > 0 && (
                                  <CCol xs={12} sm={12} lg={12}>
                                    <CCard className="h-100 shadow-sm border-0 bg-body">
                                      <CCardBody className="p-3">
                                        <div className="d-flex align-items-center justify-content-between mb-2">
                                          <span className="text-muted small fw-semibold">
                                            <CIcon icon={cilWarning} className="me-1 text-danger" />
                                            Otras Sanciones
                                          </span>
                                          <CBadge
                                            color="warning"
                                            shape="rounded-pill"
                                            className="px-2 py-1 text-dark"
                                          >
                                            {item.otras_sanciones.length} {item.otras_sanciones.length === 1 ? 'otra sanción' : 'otras sanciones'}
                                          </CBadge>
                                        </div>

                                        <div className="d-flex flex-column gap-2 mt-2">
                                          {item.otras_sanciones.map((sanc: any, idx: number) => (
                                            <div
                                              key={idx}
                                              className="p-2 border rounded bg-body-tertiary small d-flex flex-column gap-1"
                                            >
                                              <div className="d-flex align-items-center justify-content-between flex-wrap gap-1">
                                                <span className="fw-semibold text-danger">
                                                  <CIcon icon={cilWarning} className="me-1" />
                                                  Sanción #{idx + 2}
                                                </span>
                                                <span className="badge bg-body border text-muted">
                                                  <CIcon icon={cilCalendar} className="me-1 text-danger" />
                                                  {sanc.inicio || 'No registrada'} - {sanc.fin || 'No registrada'}
                                                </span>
                                              </div>
                                              <div className="text-body ps-1">
                                                <span className="text-muted fw-semibold me-1">Motivo:</span>
                                                {sanc.detalle || 'Sin detalle especificado'}
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </CCardBody>
                                    </CCard>
                                  </CCol>
                                )}
                              </>
                            ) : (item.tiene_sancion_previa || (Array.isArray(item.historial_sanciones) && item.historial_sanciones.length > 0) || Boolean(item.inicio_sancion && item.inicio_sancion !== 'No registrada')) ? (
                              /* Si no tiene sanción activa, pero REGISTRA SANCIONES PREVIAS EN SU HISTORIAL */
                              <>
                                <CCol xs={12} sm={12} lg={12}>
                                  <CCard className="h-100 shadow-sm border-0 bg-body">
                                    <CCardBody className="p-3">
                                      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
                                        <span className="text-muted small fw-semibold">
                                          <CIcon icon={cilClock} className="me-1 text-primary" />
                                          Sanción Previa más Reciente
                                        </span>
                                      </div>
                                      <div className="d-flex flex-wrap gap-1 align-items-center mb-2">
                                        <span className="badge bg-body rounded-pill border text-secondary font-monospace">
                                          Desde: {item.inicio_sancion || 'No registrada'}
                                        </span>
                                        <span className="badge bg-body rounded-pill border text-secondary font-monospace">
                                          Hasta: {item.fin_sancion || 'No registrada'}
                                        </span>
                                      </div>
                                      <div className="small text-body pt-1 border-top">
                                        <span className="text-muted fw-semibold me-1">Motivo registrado:</span>
                                        <span>{item.motivo_sancion_actual || 'Sanción anterior registrada en el sistema'}</span>
                                      </div>
                                    </CCardBody>
                                  </CCard>
                                </CCol>

                                {Array.isArray(item.otras_sanciones) && item.otras_sanciones.length > 0 && (
                                  <CCol xs={12} sm={12} lg={12}>
                                    <CCard className="h-100 shadow-sm border-0 bg-body">
                                      <CCardBody className="p-3">
                                        <div className="d-flex align-items-center justify-content-between mb-2">
                                          <span className="text-muted small fw-semibold">
                                            <CIcon icon={cilClock} className="me-1 text-secondary" />
                                            Otras Sanciones
                                          </span>
                                          <CBadge
                                            color="secondary"
                                            shape="rounded-pill"
                                            className="px-2 py-1"
                                          >
                                            {item.otras_sanciones.length} {item.otras_sanciones.length === 1 ? 'sanción previa' : 'sanciones previas'}
                                          </CBadge>
                                        </div>
                                        <div className="d-flex flex-column gap-2 mt-2">
                                          {item.otras_sanciones.map((sanc: any, idx: number) => (
                                            <div
                                              key={idx}
                                              className="p-2 border rounded bg-body-tertiary small d-flex flex-column gap-1"
                                            >
                                              <div className="d-flex align-items-center justify-content-between flex-wrap gap-1">
                                                <span className="fw-semibold text-secondary">
                                                  <CIcon icon={cilClock} className="me-1" />
                                                  Sanción anterior #{idx + 2}
                                                </span>
                                                <span className="badge bg-body border text-muted">
                                                  <CIcon icon={cilCalendar} className="me-1 text-secondary" />
                                                  {sanc.inicio || 'No registrada'} - {sanc.fin || 'No registrada'}
                                                </span>
                                              </div>
                                              <div className="text-body ps-1">
                                                <span className="text-muted fw-semibold me-1">Motivo:</span>
                                                {sanc.detalle || 'Sin detalle especificado'}
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </CCardBody>
                                    </CCard>
                                  </CCol>
                                )}
                              </>
                            ) : null}

                            {tieneAcciones ? (
                              <div className="d-flex flex-wrap gap-2 justify-content-end mt-3 pt-2 border-top">
                                {canEditar && (
                                  <CButton
                                    color="primary"
                                    variant="outline"
                                    size="sm"
                                    className="hover:text-white shadow-sm" onClick={() => personaState.handleAbrirEditar(item)}
                                  >
                                    <CIcon icon={cilPencil} />
                                    <span>Editar Usuario</span>
                                  </CButton>
                                )}
                                {canEliminar && (
                                  <CButton
                                    color="danger"
                                    variant="outline"
                                    size="sm"
                                    className="hover:text-white shadow-sm" onClick={() => handleConfirmarEliminar(item)}
                                  >
                                    <CIcon icon={cilTrash} />
                                    <span>Eliminar Usuario</span>
                                  </CButton>
                                )}
                                {canRenovar && (
                                  <ModalRenova
                                    item={item}
                                    canRenovar={canRenovar}
                                    canGuardarRenovacion={canGuardarRenovacion}
                                    onRenovado={() => personaState.fetchPersonas(personaState.paginaActual, undefined, undefined, true)}
                                  />
                                )}
                              </div>
                            ) : (
                              <span className="text-danger small fw-semibold d-inline-flex align-items-center py-1">
                                No tienes acceso a las acciones de usuario.
                              </span>
                            )}
                          </CRow>
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
            }}
            tableBodyProps={{
              className: 'align-middle',
            }}
          />
        </CCardBody>
      </CCard>

      <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap gap-2 px-1">
        <span className="text-muted small">
          Mostrando {items.length} de {personaState.totalRegistros} usuarios (Página {personaState.paginaActual} de {personaState.totalPaginas})
        </span>
        <CSmartPagination
          activePage={personaState.paginaActual}
          pages={personaState.totalPaginas}
          onActivePageChange={(nuevaPagina: number) => {
            if (nuevaPagina && nuevaPagina !== personaState.paginaActual) {
              personaState.fetchPersonas(nuevaPagina)
            }
          }}
        />
      </div>
    </div>
  )
}

export default ClienteDs