import { CBadge, CButton, CCard, CCardBody, CCol, CCollapse, CRow, CSmartPagination, CSmartTable, CSpinner } from '@coreui/react-pro'
import CIcon from '@coreui/icons-react'
import { cilCalendar, cilDollar, cilPencil, cilTrash, cilWarning } from '@coreui/icons'
import Swal from 'sweetalert2'
import Modal_Register from '@/components/clients/Modal_Register'
import Modal_Edit from '@/components/clients/Modal_Edit'
import HeaderCliente from '@/components/clients/HeaderCliente'
import ModalRenova from '@/components/clients/ModalRenovaciones'
import useClienteDs, { ClienteItem } from '@/hooks/tab-persona/useClienteDs'



export type { ClienteItem }

const ClienteDs = () => {
  const {
    personaState,
    items,
    columns,
    getBadge,
  } = useClienteDs()

  const handleConfirmarEliminar = async (item: any) => {
    const idPersona = item.id || item.raw?.ID_PERSONA
    if (!idPersona) return

    const result = await Swal.fire({
      title: '¿Eliminar usuario?',
      text: `¿Estás seguro de que deseas eliminar a ${item.nombre} ${item.apellido}? Esta acción no se puede deshacer.`,
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
          title: 'Usuario Eliminado',
          text: `El usuario ${item.nombre} ${item.apellido} fue eliminado correctamente.`,
          timer: 2000,
          showConfirmButton: false,
        })
      }
    }
  }

  return (
    <>
      <HeaderCliente personaState={personaState} />
      <Modal_Register personaState={personaState} />
      <Modal_Edit personaState={personaState} />
      {personaState.loading && items.length === 0 ? (
        <div className="text-center py-5">
          <CSpinner color="primary" />
        </div>
      ) : (
        <>
          <CSmartTable
            activePage={personaState.paginaActual}
            clickableRows
            columns={columns}
            columnSorter
            tableFilter
            tableFilterPlaceholder="Buscar usuarios..."
            onTableFilterChange={(busqueda) => personaState.fetchPersonas(undefined, undefined, busqueda)}
            items={items}
            itemsPerPage={personaState.porPagina || 60}
            scopedColumns={{
              identificacion: (item: any) => (
                <td>
                  <div className="text-body font-monospace">
                    <span>{item.identificacion}</span>
                  </div>
                </td>
              ),
              nombre: (item: any) => (
                <td>
                  <div className="text-body font-monospace">
                    <span className="fw-semibold">{item.nombre}</span>
                  </div>
                </td>
              ),
              apellido: (item: any) => (
                <td>
                  <div className="text-body font-monospace">
                    <span className="fw-semibold">{item.apellido}</span>
                  </div>
                </td>
              ),
              email: (item: any) => (
                <td>
                  <span className='font-monospace'>{item.email}</span>
                </td>
              ),
              estado: (item: any) => (
                <td>
                  <CBadge color={getBadge(item.estado)} shape="rounded-pill" className="px-3 py-1">
                    {item.estado}
                  </CBadge>
                </td>
              ),
              show_details: (item: any) => {
                const isOpened = personaState.details.includes(item.id)
                return (
                  <td className="py-2">
                    <div className="d-flex align-items-center gap-2">
                      <CButton
                        color="primary"
                        variant="outline"
                        shape="square"
                        size="sm"
                        onClick={() => personaState.toggleDetails(item.id)}
                      >
                        {isOpened ? 'Ocultar' : 'Mostrar'}
                      </CButton>
                    </div>
                  </td>
                )
              },
              details: (item: any) => {
                const isVisible = personaState.details.includes(item.id)
                return (
                  <CCollapse visible={isVisible} className={isVisible ? 'show' : ''} style={{ visibility: isVisible ? 'visible' : undefined }}>
                    <div className="p-3 p-md-4 bg-body-tertiary border-top border-bottom rounded-bottom">
                      <CRow className="g-3">
                        <CCol xs={12} md={4} lg={3} className="d-flex flex-column align-items-center justify-content-center font-monospace text-center border-end-md pb-3 pb-md-0">
                          {item.FOTO_PERSONA ? (
                            <img
                              src={item.FOTO_PERSONA}
                              alt={`${item.nombre} ${item.apellido}`}
                              className="rounded-circle mb-2 shadow-sm border border-2 border-info"
                              style={{ width: '140px', height: '140px', objectFit: 'cover' }}
                              onError={(e) => {
                                const target = e.currentTarget
                                target.style.display = 'none'
                                if (target.nextElementSibling) {
                                  (target.nextElementSibling as HTMLElement).style.display = 'flex'
                                }
                              }}
                            />
                          ) : null}
                          <h5 className="fw-bold mb-0 text-body">
                            {item.nombre} {item.apellido}
                          </h5>
                          <span className="text-muted small mb-2">{item.email}</span>
                          <CBadge color={getBadge(item.estado)} shape="rounded-pill" className="px-3 py-1">
                            {item.estado}
                          </CBadge>
                        </CCol>

                        <CCol xs={12} md={8} lg={9}>
                          <CRow className="g-2">
                            <CCol xs={12} sm={6} lg={4}>
                              <CCard className="h-100 shadow-sm border-0 bg-body">
                                <CCardBody className="p-3">
                                  <span className="text-body small d-block mb-1">Nº Identificación</span>
                                  <span className='font-monospace text-body badge bg-body border rounded-pill'>{item.identificación}</span>
                                </CCardBody>
                              </CCard>
                            </CCol>

                            <CCol xs={12} sm={6} lg={4}>
                              <CCard className="h-100 shadow-sm border-0 bg-body">
                                <CCardBody className="p-3">
                                  <span className="text-muted small d-block mb-1">Inicio de Inscripción</span>
                                  <div className="d-flex align-items-center gap-1">
                                    <CIcon icon={cilCalendar} className="text-success" />
                                      <span  className='badge bg-body rounded-pill border text-success'>{item.inicio_inscripcion}</span>
                                  </div>
                                </CCardBody>
                              </CCard>
                            </CCol>

                            <CCol xs={12} sm={6} lg={4}>
                              <CCard className="h-100 shadow-sm border-0 bg-body">
                                <CCardBody className="p-3">
                                  <span className="text-muted small d-block mb-1">Fin de Inscripción</span>
                                  <div className="d-flex align-items-center gap-1">
                                    <CIcon icon={cilCalendar} className="text-warning" />
                                      <span className='badge bg-body rounded-pill border text-warning'>{item.fin_inscripcion}</span>
                                  </div>
                                </CCardBody>
                              </CCard>
                            </CCol>

                            <CCol xs={12} sm={6} lg={4}>
                              <CCard className="h-100 shadow-sm border-0 bg-body">
                                <CCardBody className="p-3">
                                  <span className="text-muted small d-block mb-1">Costo Inscripción</span>
                                  <div className="d-flex align-items-center gap-1">
                                    <CIcon icon={cilDollar} className="text-primary" />
                                      <span className='badge bg-body rounded-pill border text-primary'>{item.costo}</span>
                                  </div>
                                </CCardBody>
                              </CCard>
                            </CCol>

                            <CCol xs={12} sm={12} lg={4}>
                              <CCard className="h-100 shadow-sm border-0 bg-body">
                                <CCardBody className="p-3">
                                  <span className="text-muted small d-block mb-1">Detalle de Sanciones:</span>
                                  <div className="d-flex align-items-center gap-1">
                                    <CIcon icon={cilWarning} className="text-warning" />
                                    <span className="small text-body">{item.sancion}</span>
                                  </div>
                                </CCardBody>
                              </CCard>
                            </CCol>

                            <div className="d-flex flex-wrap gap-2 justify-content-end mt-3 pt-2 border-top">
                              <CButton
                                color="primary"
                                variant="outline"
                                className="d-flex align-items-center gap-1 shadow-sm"
                                onClick={() => personaState.handleAbrirEditar(item)}
                              >
                                <CIcon icon={cilPencil} />
                                <span>Editar Usuario</span>
                              </CButton>
                              <CButton
                                color="danger"
                                variant="outline"
                                className="hover:text-white d-flex align-items-center gap-1 shadow-sm"
                                onClick={() => handleConfirmarEliminar(item)}
                              >
                                <CIcon icon={cilTrash} />
                                <span>Eliminar Usuario</span>
                              </CButton>
                              <ModalRenova
                                item={item}
                                onRenovado={() => personaState.fetchPersonas(personaState.paginaActual, undefined, undefined, true)}
                              />
                            </div>
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

          <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap gap-2 px-1">
            <span className="text-muted small">
              Mostrando {items.length} de {personaState.totalRegistros} usuarios (Página {personaState.paginaActual} de {personaState.totalPaginas})
            </span>
            <CSmartPagination
              activePage={personaState.paginaActual}
              pages={personaState.totalPaginas}
              onActivePageChange={(nuevaPagina) => {
                personaState.fetchPersonas(nuevaPagina)
              }}
            />
          </div>
        </>
      )}
    </>
  )
}

export default ClienteDs