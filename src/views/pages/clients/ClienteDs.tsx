import { useMemo, useState, useEffect } from 'react'
import { CBadge, CButton, CCard, CCardBody, CCol, CCollapse, CRow, CSmartPagination, CSmartTable } from '@coreui/react-pro'
import CIcon from '@coreui/icons-react'
import { cilCalendar, cilDollar, cilPencil, cilTrash, cilWarning } from '@coreui/icons'
import Swal from 'sweetalert2'
import Modal_Register from '@/components/clients/Modal_Register'
import Modal_Edit from '@/components/clients/Modal_Edit'
import HeaderCliente from '@/components/clients/HeaderCliente'
import ModalRenova from '@/components/clients/ModalRenovaciones'
import useClienteDs, { ClienteItem } from '@/hooks/tab-persona/useClienteDs'
import { DEFAULT_RECREO_IMAGE } from '@/utils/imageUtils'
import { usePermissions } from '@/context/PermissionsContext'

export type { ClienteItem }

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

const ClienteDs = () => {
  const { canDoAction } = usePermissions()
  const canDeleteUser = canDoAction('btn_eliminar_usuario_gestion_usuario')

  const {
    personaState,
    items,
    getBadge,
    getBadgeSancion,
  } = useClienteDs()

  const tableColumns = useMemo(
    () => [
      {
        key: 'identificacion',
        label: 'Identificación',
        _style: { width: '14%' },
      },
      {
        key: 'nombre',
        label: 'Nombres',
        _style: { width: '18%' },
      },
      {
        key: 'apellido',
        label: 'Apellidos',
        _style: { width: '18%' },
      },
      {
        key: 'email',
        label: 'Email',
        _style: { width: '22%' },
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
          </select>
        ),
      },
    ],
    [],
  )

  const handleConfirmarEliminar = async (item: any) => {
    if (!canDeleteUser) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para eliminar usuarios.',
      })
      return
    }

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
      <CSmartTable
        key={personaState.tableKey}
        clickableRows
        columns={tableColumns}
        columnSorter
        columnFilter={{ external: true }}
        onColumnFilterChange={(filtros: any) => personaState.handleColumnFilterChange(filtros)}
        cleaner
        loading={personaState.loading}
        tableFilter={{ external: true }}
        tableFilterPlaceholder="Buscar usuarios..."
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
              if (item?.id) {
                personaState.toggleDetails(item.id)
              }
            }}
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
              sancionado: (item: any) => (
                <td>
                  <CBadge color={getBadgeSancion(item.sancionado)} shape="rounded-pill" className="px-3 py-1">
                    {item.sancionado || 'Sin sanción'}
                  </CBadge>
                </td>
              ),
              details: (item: any) => {
                const isVisible = personaState.details.includes(item.id)
                return (
                  <CCollapse visible={isVisible} className="user-details-collapse">
                    <div className="user-details-content p-3 p-md-4 bg-body-tertiary border-top border-bottom rounded-bottom">
                      <CRow className="g-3">
                        <CCol xs={12} md={4} lg={3} className="d-flex flex-column align-items-center justify-content-center font-monospace text-center border-end-md pb-3 pb-md-0">
                          <ClienteAvatar key={`${item.id}_${item.fotografia || 'no_foto'}`} src={item.fotografia} nombre={item.nombre} apellido={item.apellido} />
                          <h5 className="fw-bold mb-0 text-body">
                            {item.nombre} {item.apellido}
                          </h5>
                          <span className="text-muted small mb-2">{item.email}</span>
                          <div className="d-flex flex-wrap gap-1 justify-content-center">
                            <CBadge color={getBadge(item.estado)} shape="rounded-pill" className="px-3 py-1">
                              {item.estado}
                            </CBadge>
                            <CBadge color={getBadgeSancion(item.sancionado)} shape="rounded-pill" className="px-3 py-1">
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
                                  <span className='font-monospace text-body badge bg-body border rounded-pill'>{item.identificacion}</span>
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
                                      className={`badge bg-body rounded-pill border ${
                                        item.inicio_inscripcion === 'Sin inscripción' || item.inicio_inscripcion === 'No registrada'
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
                                      className={`badge bg-body rounded-pill border ${
                                        item.fin_inscripcion === 'Sin inscripción' || item.fin_inscripcion === 'No registrada'
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
                                      className={`badge bg-body rounded-pill border ${
                                        item.costo === '0.00' ? 'text-secondary' : 'text-primary'
                                      }`}
                                    >
                                      {item.costo}
                                    </span>
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
                              {canDoAction('btn_editar_usuario_gestion_usuario') && (
                                <CButton
                                  color="primary"
                                  variant="outline"
                                  className="d-flex align-items-center gap-1 shadow-sm"
                                  onClick={() => personaState.handleAbrirEditar(item)}
                                >
                                  <CIcon icon={cilPencil} />
                                  <span>Editar Usuario</span>
                                </CButton>
                              )}
                              {canDeleteUser && (
                                <CButton
                                  color="danger"
                                  variant="outline"
                                  className="hover:text-white d-flex align-items-center gap-1 shadow-sm"
                                  onClick={() => handleConfirmarEliminar(item)}
                                >
                                  <CIcon icon={cilTrash} />
                                  <span>Eliminar Usuario</span>
                                </CButton>
                              )}
                              {canDoAction('btn_renovar_usuario_gestion_usuario') && (
                                <ModalRenova
                                  item={item}
                                  onRenovado={() => personaState.fetchPersonas(personaState.paginaActual, undefined, undefined, true)}
                                />
                              )}
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
              onActivePageChange={(nuevaPagina: number) => {
                personaState.fetchPersonas(nuevaPagina)
              }}
            />
      </div>
    </>
  )
}

export default ClienteDs