import {
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
  CSmartPagination,
  CSpinner,
} from '@coreui/react-pro'
import CIcon from '@coreui/icons-react'
import {
  cilCheckCircle,
  cilInfo,
  cilPencil,
  cilPlus,
  cilSearch,
  cilSync,
  cilTrash,
  cilTruck,
  cilX,
} from '@coreui/icons'
import ModalPv from '@/components/details_bk/proveedor'
import useProveedor from '@/hooks/rco-libros/useProveedor'

const Supplier = () => {
  const proveedorHook = useProveedor()

  const {
    handleOpen,
    handleRecargar,
    proveedoresFiltrados,
    proveedoresPaginados,
    loadingProveedor,
    busquedaProveedor,
    setBusquedaProveedor,
    proveedorSeleccionado,
    setProveedorSeleccionado,
    handleEliminarProveedor,
    paginaActual,
    totalPaginas,
    totalProveedores,
    totalFiltrados,
    handlePageChange,
    canCrearProveedor,
    canEditarProveedor,
    canEliminarProveedor,
    canVerInfoProveedor,
  } = proveedorHook

  const handleToggleSelect = (proveedor: any) => {
    if (!canVerInfoProveedor) return

    const currentId = String(proveedorSeleccionado?.ID_PROVEEDOR ?? proveedorSeleccionado?.id ?? '')
    const targetId = String(proveedor?.ID_PROVEEDOR ?? proveedor?.id ?? '')
    if (currentId && currentId === targetId) {
      setProveedorSeleccionado(null)
    } else {
      setProveedorSeleccionado(proveedor)
    }
  }

  return (
    <>
      <ModalPv proveedorState={proveedorHook} />
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h4 className="fw-bold mb-1 text-body d-flex align-items-center gap-2">
            <CIcon icon={cilTruck} size='lg' style={{ color: "#193CB8" }} />
            <span>Gestión de Proveedores</span>
          </h4>
          <p className="text-muted small mb-0">
            Administra el catálogo de proveedores.
          </p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <CButton
            color="secondary"
            variant="outline"
            size="sm"
            disabled={loadingProveedor}
            className="d-flex align-items-center gap-1 shadow-sm"
            onClick={() => handleRecargar()}
            title="Refrescar lista y reiniciar filtros"
          >
            <CIcon icon={cilSync} className={`me-1 ${loadingProveedor ? 'rotate-animation' : ''}`} />
            <span>{loadingProveedor ? 'Refrescando...' : 'Refrescar'}</span>
          </CButton>
          {canCrearProveedor && (
            <CButton
              color="success"
              variant='outline'
              size="sm"
              className="d-flex align-items-center gap-2 shadow-sm hover:text-white"
              onClick={() => handleOpen()}
            >
              <CIcon icon={cilPlus} />
              <span>Nuevo Proveedor</span>
            </CButton>
          )}
        </div>
      </div>

      <CRow className="g-4">
        <CCol xs={12} lg={7}>
          <CCard className="h-100 border shadow-sm">
            <CCardHeader className="bg-body d-flex align-items-center justify-content-between py-2">
              <div className="d-flex align-items-center gap-2 fw-semibold text-body">
                <CIcon icon={cilTruck} size='lg' style={{ color: "#193CB8" }} />
                <span>Catálogo de Proveedores</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                {busquedaProveedor && (
                  <CBadge color="info" shape="rounded-pill">
                    {totalFiltrados} encontrados
                  </CBadge>
                )}
                <CBadge color="primary" shape="rounded-pill">
                  {totalProveedores} Registrados
                </CBadge>
              </div>
            </CCardHeader>

            <CCardBody className="p-3">
              <label className="form-label small fw-semibold text-muted">
                Buscar proveedor por nombre:
              </label>
              <CInputGroup className="mb-3">
                <CInputGroupText className="bg-body">
                  <CIcon icon={cilSearch} className="text-muted" />
                </CInputGroupText>
                <CFormInput
                  type="text"
                  placeholder="Ej: La Luz, Casa de la Cultura, 1..."
                  value={busquedaProveedor}
                  onChange={(e) => setBusquedaProveedor(e.target.value)}
                />
                {busquedaProveedor && (
                  <CButton
                    type="button"
                    color="light"
                    variant="outline"
                    onClick={() => setBusquedaProveedor('')}
                  >
                    <CIcon icon={cilX} />
                  </CButton>
                )}
              </CInputGroup>

              <div
                className="border rounded p-2 overflow-auto"
                style={{ maxHeight: '500px', minHeight: '350px' }}
              >
                {loadingProveedor ? (
                  <div className="text-center py-5">
                    <CSpinner size="sm" color="primary" />
                    <span className="ms-2 small text-muted">Cargando proveedores...</span>
                  </div>
                ) : proveedoresFiltrados.length === 0 ? (
                  <div className="text-center text-muted py-5 small">
                    No se encontraron proveedores coincidentes con &quot;{busquedaProveedor}&quot;.
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    {proveedoresPaginados.map((proveedor) => {
                      const id = proveedor.ID_PROVEEDOR || proveedor.id
                      const isSelected =
                        String(proveedorSeleccionado?.ID_PROVEEDOR || proveedorSeleccionado?.id) === String(id)

                      return (
                        <div
                          key={id}
                          onClick={() => handleToggleSelect(proveedor)}
                          className={`p-3 rounded border d-flex align-items-center justify-content-between transition-all ${isSelected
                            ? 'border-primary bg-primary bg-opacity-10 shadow-sm'
                            : 'bg-body'
                            }`}
                          style={{
                            cursor: canVerInfoProveedor ? 'pointer' : 'default',
                            borderColor: isSelected ? '#0d6efd' : '#dee2e6',
                            transition: 'all 0.2s ease',
                          }}
                          onMouseEnter={(e) => {
                            if (canVerInfoProveedor && !isSelected) e.currentTarget.style.borderColor = '#0d6efd'
                          }}
                          onMouseLeave={(e) => {
                            if (canVerInfoProveedor && !isSelected) e.currentTarget.style.borderColor = '#dee2e6'
                          }}
                        >
                          <div className="d-flex align-items-center gap-3">
                            <div
                              className={`rounded-circle p-2 d-flex align-items-center justify-content-center ${isSelected
                                ? 'bg-primary text-white'
                                : 'bg-primary bg-opacity-10 text-primary'
                                }`}
                              style={{ width: '40px', height: '40px' }}
                            >
                              <CIcon icon={cilTruck} />
                            </div>
                            <div>
                              <div className="font-monospace small fw-semibold text-body">{proveedor.NOMBRE_PROVEEDOR}
                              </div>
                            </div>
                          </div>
                          {isSelected && (
                            <CBadge className="px-3 py-2 shadow-sm text-white" color="primary" shape="rounded-pill">
                              Seleccionado ✕
                            </CBadge>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="d-flex flex-wrap justify-content-between align-items-center pt-3 mt-2 border-top bg-body">
                <span className="text-muted small">
                  Página <strong>{paginaActual}</strong> de <strong>{totalPaginas}</strong> ({totalFiltrados} proveedores)
                </span>
                <CSmartPagination
                  size="sm"
                  activePage={paginaActual}
                  pages={totalPaginas}
                  onActivePageChange={handlePageChange}
                />
              </div>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol xs={12} lg={5}>
          <CCard className="h-100 border shadow-sm">
            <CCardHeader className="bg-body d-flex align-items-center justify-content-between py-2">
              <div className="d-flex align-items-center gap-2 fw-semibold text-body">
                <CIcon icon={cilInfo} className="text-primary" />
                <span>Detalle del Proveedor</span>
              </div>
              <div className="d-flex align-items-center gap-1">
                <CButton
                  color="secondary"
                  variant="ghost"
                  size="sm"
                  disabled={loadingProveedor}
                  className="p-1 text-muted"
                  onClick={() => handleRecargar()}
                  title="Refrescar y limpiar selección"
                >
                  <CIcon icon={cilSync} className={loadingProveedor ? 'rotate-animation' : ''} />
                </CButton>
                {proveedorSeleccionado && (
                  <CButton
                    color="secondary"
                    variant="ghost"
                    size="sm"
                    className="p-1 text-muted"
                    onClick={() => setProveedorSeleccionado(null)}
                    title="Cerrar detalle"
                  >
                    <CIcon icon={cilX} />
                  </CButton>
                )}
              </div>
            </CCardHeader>

            <CCardBody className="p-4 d-flex flex-column justify-content-between">
              {!canVerInfoProveedor ? (
                <div className="text-center py-5 my-auto text-muted">
                  <div
                    className="bg-body rounded-circle p-4 d-inline-flex align-items-center justify-content-center mb-3"
                    style={{ width: '80px', height: '80px' }}
                  >
                    <CIcon icon={cilTruck} size="xxl" className="text-danger opacity-50" />
                  </div>
                  <h6 className="fw-bold text-body mb-1">Información no disponible</h6>
                  <p className="small text-muted mb-0 px-3">
                    No cuentas con los permisos necesarios para visualizar la información y las acciones de este proveedor.
                  </p>
                </div>
              ) : proveedorSeleccionado ? (
                <div>
                  <div className="d-flex align-items-center gap-2 mb-3 text-success">
                    <CIcon icon={cilCheckCircle} size="lg" />
                    <span className="fw-bold small text-uppercase">Visualización del Proveedor</span>
                  </div>

                  <div className="bg-body p-3 rounded border mb-4">
                    <div className="d-flex align-items-center gap-3 mb-3">
                      <div
                        className="bg-primary text-white rounded-circle p-3 d-flex align-items-center justify-content-center shadow-sm"
                        style={{ width: '54px', height: '54px' }}
                      >
                        <CIcon icon={cilTruck} size="xl" />
                      </div>
                      <div>
                        <h5 className="fw-bold text-body mb-1">{proveedorSeleccionado.NOMBRE_PROVEEDOR}</h5>
                      </div>
                    </div>

                    <div className="d-flex flex-column gap-2 pt-2 border-top">
                      <div className="d-flex justify-content-between align-items-center py-1">
                        <span className="text-muted small badge bg-body rounded-pill border d-inline-flex align-items-center justify-content-center">Nombre del Proveedor:</span>
                        <span className="fw-semibold small text-body text-end ms-2">
                          {proveedorSeleccionado.NOMBRE_PROVEEDOR}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex gap-2 justify-content-end">
                    {canEliminarProveedor && (
                      <CButton
                        color='danger'
                        variant='outline'
                        size="sm"
                        className='hover:text-white d-flex align-items-center gap-2 shadow-sm'
                        onClick={() => handleEliminarProveedor(proveedorSeleccionado)}>
                        <CIcon icon={cilTrash} />
                        <span>Eliminar</span>
                      </CButton>
                    )}
                    {canEditarProveedor && (
                      <CButton
                        color="success"
                        variant='outline'
                        size="sm"
                        className="hover:text-white d-flex align-items-center gap-2 shadow-sm"
                        onClick={() => handleOpen(proveedorSeleccionado)}
                      >
                        <CIcon icon={cilPencil} />
                        <span>Editar Proveedor</span>
                      </CButton>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-5 my-auto text-muted">
                  <div
                    className="bg-body rounded-circle p-4 d-inline-flex align-items-center justify-content-center mb-3"
                    style={{ width: '80px', height: '80px' }}
                  >
                    <CIcon icon={cilTruck} size="xxl" className="text-secondary opacity-50" />
                  </div>
                  <h6 className="fw-bold text-body mb-1">Ningún proveedor seleccionado</h6>
                  <p className="small text-muted mb-4 px-3">
                    Selecciona un proveedor de la lista para consultar sus detalles o modificarlo.
                  </p>
                  {canCrearProveedor && (
                    <CButton
                      color="primary"
                      variant="outline"
                      size="sm"
                      className="d-inline-flex align-items-center gap-1"
                      onClick={() => handleOpen()}
                    >
                      <CIcon icon={cilPlus} />
                      <span>Crear Nuevo Proveedor</span>
                    </CButton>
                  )}
                </div>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}

export default Supplier