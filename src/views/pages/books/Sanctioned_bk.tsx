import React, { useMemo, useState } from 'react'
import {
  cilBan,
  cilBook,
  cilCalendar,
  cilCheck,
  cilCreditCard,
  cilPhone,
  cilReportSlash,
  cilSync,
  cilWarning,
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'
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
import useSanciones from '@/hooks/rco-sanciones/useSanciones'
import ModalSancionarDePorVida from '@/components/details_bk/ModalSancionarDePorVida'

const Sanctioned_bk: React.FC = () => {
  const {
    sancionados,
    loading,
    procesandoId,
    paginaActual,
    totalPaginas,
    totalRegistros,
    details,
    tableKey,
    filtroVeto,
    filtroEstado,
    handleColumnFilterChange,
    canQuitarSancion,
    canSancionarDePorVida,
    canGuardarSancionPermanente,
    canVerInfoSancion,
    toggleDetails,
    handlePageChange,
    handleBuscarGlobal,
    handleRecargar,
    handleQuitarSancion,
    getBadgeColorSancion,
    getBadgeColorUsuario,
  } = useSanciones()

  const [modalSancionVisible, setModalSancionVisible] = useState(false)
  const [usuarioASancionar, setUsuarioASancionar] = useState<any | null>(null)

  const handleAbrirModalSancionPermanente = (item: any) => {
    setUsuarioASancionar(item)
    setModalSancionVisible(true)
  }

  const columns = useMemo(
    () => [
      { key: 'Cedula', label: 'Cédula', _style: { width: '14%' }, filter: false  },
      { key: 'Nombres', label: 'Nombres', _style: { width: '18%' }, filter: false },
      { key: 'Apellidos', label: 'Apellidos', _style: { width: '18%' }, filter: false },
      { key: 'Celular', label: 'Celular', _style: { width: '12%' }, filter: false },
      { key: 'status', label: 'Sanción', _style: { width: '13%' }, filter: false },
            {
        key: 'estado',
        label: 'Estado',
        _style: { width: '9%' },
        filter: (_values: unknown[], onChange: (val: string | number) => void, filterValue?: string | number) => (
          <select
            className="form-select form-select-sm"
            value={String(filterValue ?? (filtroEstado || ''))}
            onChange={(e) => onChange(e.target.value)}
            aria-label="Filtrar por estado"
          >
            <option value="">Todos</option>
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </select>
        ),
      },
      {
        key: 'vetado',
        label: 'Vetado',
        _style: { width: '9%' },
        filter: (_values: unknown[], onChange: (val: string | number) => void, filterValue?: string | number) => (
          <select
            className="form-select form-select-sm"
            value={String(filterValue ?? (filtroVeto !== null && filtroVeto !== undefined ? filtroVeto : ''))}
            onChange={(e) => onChange(e.target.value)}
            aria-label="Filtrar por veto"
          >
            <option value="">Todos</option>
            <option value="2">Sí</option>
            <option value="0">No</option>
          </select>
        ),
      },
    ],
    [filtroVeto, filtroEstado]
  )

  return (
    <div className="pb-4">
      {/* Encabezado unificado */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h3 className="fw-bold mb-1">Gestión de Sancionados</h3>
          <p className="text-body-secondary mb-0">
            Registro oficial de usuarios que cuentan con sanciones activas en el sistema.
          </p>
        </div>
        <CButton
          color="secondary"
          variant="outline"
          size="sm"
          disabled={loading}
          className="d-flex align-items-center gap-1 shadow-sm"
          onClick={() => handleRecargar()}
          title="Refrescar lista y reiniciar filtros"
        >
          <CIcon icon={cilSync} className={`me-1 ${loading ? 'rotate-animation' : ''}`} />
          <span>{loading ? 'Refrescando...' : 'Refrescar'}</span>
        </CButton>
      </div>

      <CCard className="shadow-sm border-0">
        <CCardHeader className="bg-transparent py-3 d-flex justify-content-between align-items-center">
          <span className="fw-semibold text-uppercase small">
            Listado de Usuarios Sancionados
          </span>
          <span className="text-body-secondary small">
            Total sancionados: <strong>{totalRegistros}</strong>
          </span>
        </CCardHeader>

        <CCardBody className="p-0">
          <CSmartTable
            key={tableKey}
            clickableRows={canVerInfoSancion}
            columns={columns}
            columnSorter
            columnFilter={{ external: true }}
            onColumnFilterChange={(filtros: any) => handleColumnFilterChange(filtros)}
            loading={loading}
            items={sancionados}
            tableFilter={{ external: true }}
            tableFilterPlaceholder="Buscar por cédula, nombres o apellidos..."
            onTableFilterChange={(busqueda) => handleBuscarGlobal(busqueda || '')}
            onRowClick={(item: any) => {
              if (!canVerInfoSancion) return
              const id = item?.id ?? item?.ID_PERSONA ?? item?.ID_SANCION
              if (id) toggleDetails(id)
            }}
            noItemsLabel={
              loading ? (
                'Cargando usuarios sancionados...'
              ) : (
                'No se encontraron usuarios sancionados en el sistema'
              )
            }
            tableProps={{
              responsive: true,
              striped: true,
              hover: true,
              className: 'mb-0',
            }}
            tableBodyProps={{
              className: 'align-middle',
            }}
            scopedColumns={{
              Cedula: (item: any) => (
                <td>
                  <span className="badge bg-body text-body border font-monospace px-2 py-1">
                    {item.Cedula || '-'}
                  </span>
                </td>
              ),
              Nombres: (item: any) => (
                <td>
                  <span className="text-body fw-medium">{item.Nombres || '-'}</span>
                </td>
              ),
              Apellidos: (item: any) => (
                <td>
                  <span className="text-body fw-medium">{item.Apellidos || '-'}</span>
                </td>
              ),
              Celular: (item: any) => (
                <td>
                  <span className="font-monospace fw-semibold text-secondary">{item.Celular || '-'}</span>
                </td>
              ),
              estado: (item: any) => (
                <td>
                  <CBadge color={getBadgeColorUsuario(item.estado)} shape="rounded-pill" className="px-3 py-1">
                    {item.estado}
                  </CBadge>
                </td>
              ),
              status: (item: any) => (
                <td>
                  <CBadge color={getBadgeColorSancion(item.status)} shape="rounded-pill" className="px-3 py-1">
                    {item.status || 'Sancionado'}
                  </CBadge>
                </td>
              ),
              vetado: (item: any) => {
                const esVet = Boolean(
                  item.esVetado ||
                  item.esDePorVida ||
                  item.vetado === 'Sí' ||
                  item.status === 'Vetado' ||
                  item.ESTADO_VETO === 2 ||
                  item.ESTADO_VETO === '2' ||
                  item.estado_veto === 2 ||
                  item.estado_veto === '2' ||
                  item.TIENE_VETO_PERMANENTE === 1 ||
                  item.TIENE_VETO_PERMANENTE === '1' ||
                  (Array.isArray(item.vetos) && item.vetos.some((v: any) => v.ESTADO_VETO === 2 || v.ESTADO_VETO === '2' || v.estado_veto === 2 || v.estado_veto === '2')) ||
                  (Array.isArray(item.raw?.vetos) && item.raw.vetos.some((v: any) => v.ESTADO_VETO === 2 || v.ESTADO_VETO === '2' || v.estado_veto === 2 || v.estado_veto === '2'))
                )
                return (
                  <td>
                    <CBadge
                      color={esVet ? 'danger' : 'secondary'}
                      shape="rounded-pill"
                      className="px-3 py-1"
                    >
                      {esVet ? 'Sí' : 'No'}
                    </CBadge>
                  </td>
                )
              },
              details: (item: any) => {
                if (!canVerInfoSancion) return null
                const rowId = item.id ?? item.ID_PERSONA ?? item.ID_SANCION
                const isVisible = details.includes(rowId)
                const procesando = procesandoId === item.id
                const esDePorVida = Boolean(
                  item.esVetado ||
                  item.esDePorVida ||
                  item.vetado === 'Sí' ||
                  item.status === 'Vetado' ||
                  item.ESTADO_VETO === 2 ||
                  item.ESTADO_VETO === '2' ||
                  item.estado_veto === 2 ||
                  item.estado_veto === '2' ||
                  item.TIENE_VETO_PERMANENTE === 1 ||
                  item.TIENE_VETO_PERMANENTE === '1' ||
                  (Array.isArray(item.vetos) && item.vetos.some((v: any) => v.ESTADO_VETO === 2 || v.ESTADO_VETO === '2' || v.estado_veto === 2 || v.estado_veto === '2')) ||
                  (Array.isArray(item.raw?.vetos) && item.raw.vetos.some((v: any) => v.ESTADO_VETO === 2 || v.ESTADO_VETO === '2' || v.estado_veto === 2 || v.estado_veto === '2'))
                )
                const tieneLibro = Boolean(item.Libro && item.Libro.trim() && item.Libro !== 'Sin libro')

                return (
                  <CCollapse visible={isVisible} className="user-details-collapse">
                    <div className="p-3 p-md-4 bg-body-tertiary border-top border-bottom rounded-bottom">
                      <CRow className="g-3">
                        {/* Lado izquierdo: Ícono y Estado General */}
                        <CCol
                          xs={12}
                          md={4}
                          lg={3}
                          className="d-flex flex-column align-items-center justify-content-center text-center border-end-md pb-3 pb-md-0"
                        >
                          <div
                            className="bg-danger bg-opacity-10 text-danger p-3 rounded-4 shadow-sm mb-3 d-flex align-items-center justify-content-center"
                            style={{ width: '100px', height: '100px' }}
                          >
                            <CIcon icon={cilReportSlash} size="3xl" />
                          </div>
                          <h6 className="fw-bold mb-1 text-body">{item.Nombres} {item.Apellidos}</h6>
                          <span className="text-body-secondary small mb-2 font-monospace">
                            Cédula: {item.Cedula || 'S/N'}
                          </span>
                          <div className="d-flex flex-wrap gap-1 justify-content-center">
                            <CBadge color={getBadgeColorUsuario(item.estado)} shape="rounded-pill" className="px-3 py-1">
                              {item.estado}
                            </CBadge>
                            <CBadge color={getBadgeColorSancion(item.status)} shape="rounded-pill" className="px-3 py-1">
                              {item.status || 'Sancionado'}
                            </CBadge>
                          </div>
                        </CCol>

                        {/* Lado derecho: Información detallada */}
                        <CCol xs={12} md={8} lg={9}>
                          <CRow className="g-2">
                            {tieneLibro && (
                              <CCol xs={12} sm={6}>
                                <CCard className="h-100 shadow-sm border-0 bg-body">
                                  <CCardBody className="p-3">
                                    <span className="text-muted small d-block mb-1">
                                      <CIcon icon={cilBook} className="me-1 text-primary" />
                                      Libro Asociado
                                    </span>
                                    <div className="fw-semibold text-body">{item.Libro}</div>
                                    <span className="text-muted small font-monospace">ISBN: {item.ISBN || 'S/N'}</span>
                                  </CCardBody>
                                </CCard>
                              </CCol>
                            )}

                            <CCol xs={12} sm={tieneLibro ? 6 : 4}>
                              <CCard className="h-100 shadow-sm border-0 bg-body">
                                <CCardBody className="p-3">
                                  <span className="text-muted small d-block mb-1">
                                    <CIcon icon={cilCreditCard} className="me-1 text-secondary" />
                                    Cédula
                                  </span>
                                  <span className="badge bg-body rounded border text-body font-monospace">
                                    {item.Cedula || 'No registrada'}
                                  </span>
                                </CCardBody>
                              </CCard>
                            </CCol>

                            <CCol xs={12} sm={tieneLibro ? 6 : 4}>
                              <CCard className="h-100 shadow-sm border-0 bg-body">
                                <CCardBody className="p-3">
                                  <span className="text-muted small d-block mb-1">
                                    <CIcon icon={cilPhone} className="me-1 text-success" />
                                    Teléfono / Celular
                                  </span>
                                  <span className="badge bg-body rounded border text-primary font-monospace me-1">
                                    Cel: {item.Celular || '-'}
                                  </span>
                                  {item.Telefono && item.Telefono !== '-' && (
                                    <span className="badge bg-body rounded border text-secondary font-monospace">
                                      Tel: {item.Telefono}
                                    </span>
                                  )}
                                </CCardBody>
                              </CCard>
                            </CCol>

                            <CCol xs={12} sm={tieneLibro ? 6 : 4}>
                              <CCard className="h-100 shadow-sm border-0 bg-body">
                                <CCardBody className="p-3">
                                  <span className="text-muted small d-block mb-1">
                                    <CIcon icon={cilCalendar} className="me-1 text-warning" />
                                    Vigencia de la Sanción
                                  </span>
                                  <div className="d-flex flex-wrap gap-1 align-items-center mb-2">
                                    <span className="badge bg-body rounded-pill border text-danger font-monospace">
                                      Desde: {item.Fecha_inicio_sancion || '-'}
                                    </span>
                                    <span className="badge bg-body rounded-pill border text-danger font-monospace">
                                      Hasta: {esDePorVida ? 'Indefinido' : (item.Fecha_fin_sancion || 'Activa')}
                                    </span>
                                  </div>
                                  <div className="small text-body pt-1 border-top">
                                    <span className="text-muted fw-semibold me-1">Motivo:</span>
                                    <span>{item.Motivo_sancion || 'Sanción registrada en el sistema'}</span>
                                  </div>
                                </CCardBody>
                              </CCard>
                            </CCol>

                            {Array.isArray(item.otras_sanciones) && item.otras_sanciones.length > 0 && (
                              <CCol xs={12}>
                                <CCard className="h-100 shadow-sm border-0 bg-body">
                                  <CCardBody className="p-3">
                                    <div className="d-flex align-items-center justify-content-between mb-2">
                                      <span className="text-muted small fw-semibold">
                                        <CIcon icon={cilWarning} className="me-1 text-danger" />
                                        Otras Sanciones
                                      </span>
                                      <CBadge color="warning" shape="rounded-pill" className="px-2 py-1 text-dark">
                                        {item.otras_sanciones.length} {item.otras_sanciones.length === 1 ? 'otra sanción' : 'otras sanciones'}
                                      </CBadge>
                                    </div>

                                    <div className="d-flex flex-column gap-2 mt-2">
                                      {item.otras_sanciones.map((sanc: any, sIdx: number) => (
                                        <div
                                          key={sIdx}
                                          className="p-2 border rounded bg-body-tertiary small d-flex flex-column gap-1"
                                        >
                                          <div className="d-flex align-items-center justify-content-between flex-wrap gap-1">
                                            <span className="fw-semibold text-danger">
                                              <CIcon icon={cilWarning} className="me-1" />
                                              Sanción #{sIdx + 2}
                                            </span>
                                            <span className="badge bg-body border text-muted">
                                              <CIcon icon={cilCalendar} className="me-1 text-danger" />
                                              {sanc.inicio || '-'} - {sanc.fin || 'Activa'}
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
                          </CRow>

                          {/* Botones de acción: Quitar Sanción y Sancionar de por vida */}
                          <div className="d-flex flex-wrap gap-2 justify-content-end mt-3 pt-2 border-top">
                            {esDePorVida ? (
                              <div className="d-flex align-items-center gap-2 text-danger fw-semibold small bg-danger bg-opacity-10 px-3 py-2 rounded-2 border border-danger border-opacity-25 shadow-sm">
                                <CIcon icon={cilBan} size="sm" />
                                <span>Usuario inhabilitado permanentemente</span>
                              </div>
                            ) : (
                              <>
                                {canQuitarSancion && (
                                  <CButton
                                    color="success"
                                    variant="outline"
                                    size="sm"
                                    className="d-flex align-items-center gap-1 shadow-sm px-3"
                                    disabled={procesando}
                                    onClick={() => handleQuitarSancion(item)}
                                  >
                                    {procesando ? (
                                      <CSpinner size="sm" />
                                    ) : (
                                      <CIcon icon={cilCheck} size="sm" />
                                    )}
                                    <span>Quitar Sanción</span>
                                  </CButton>
                                )}

                                {canSancionarDePorVida && (
                                  <CButton
                                    color="danger"
                                    variant="outline"
                                    size="sm"
                                    className="d-flex align-items-center gap-1 shadow-sm px-3"
                                    disabled={procesando}
                                    onClick={() => handleAbrirModalSancionPermanente(item)}
                                  >
                                    {procesando ? (
                                      <CSpinner size="sm" />
                                    ) : (
                                      <CIcon icon={cilBan} size="sm" />
                                    )}
                                    <span>Sancionar de por vida</span>
                                  </CButton>
                                )}
                              </>
                            )}
                          </div>
                        </CCol>
                      </CRow>
                    </div>
                  </CCollapse>
                )
              },
            }}
          />
        </CCardBody>

        <CCardFooter className="bg-transparent border-top py-3">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 px-1">
            <span className="text-muted small">
              Mostrando {sancionados.length} de {totalRegistros} usuarios sancionados (Página {paginaActual} de {totalPaginas})
            </span>
            <CSmartPagination
              activePage={paginaActual}
              pages={totalPaginas}
              onActivePageChange={(nuevaPagina: number) => handlePageChange(nuevaPagina)}
            />
          </div>
        </CCardFooter>
      </CCard>

      <ModalSancionarDePorVida
        visible={modalSancionVisible}
        setVisible={setModalSancionVisible}
        item={usuarioASancionar}
        canGuardarSancionPermanente={canGuardarSancionPermanente}
        onSuccess={() => handleRecargar()}
      />
    </div>
  )
}

export default Sanctioned_bk