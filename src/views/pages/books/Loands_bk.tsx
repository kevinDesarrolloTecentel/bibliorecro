import React, { useMemo, useState } from 'react'
import {
  cilBook,
  cilCalendar,
  cilCheck,
  cilContact,
  cilMobile,
  cilPhone,
  cilReportSlash,
  cilSync,
  cilUser,
  cilTransfer
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
import Swal from 'sweetalert2'
import usePrestamos from '@/hooks/rco-prestamos/usePrestamos'
import { CambioEstado } from '@/Service/rco/Prestamos'
import Modal_prestamo from '@/components/details_bk/prestamos'
import ModalDevolverSancion from '@/components/details_bk/ModalDevolverSancion'
import ModalNoDevuelto from '@/components/details_bk/ModalNoDevuelto'


const Loands: React.FC = () => {
  const prestamoState = usePrestamos()
  const {
    prestamos,
    loading,
    currentPage,
    totalPages,
    totalItems,
    handlePageChange,
    modalRegister,
    setModalRegister,
    details,
    setDetails,
    toggleDetails,
    handlePrestamoCreado,
    handleExtenderPrestamo,
    getBadgeColor,
    fetchPrestamos,
    tableKey,
    setTableKey,
    canCrearPrestamo,
    canExtenderPrestamo,
    canNoDevuelto,
    canConfirmarDarBaja,
    canRegistrarDevolucion,
    canDevolverSancion,
    canGuardarPrestamo,
    canGuardarDevolverSancion,
    canMostrarInfoPrestamo,
    prestamoSeleccionado,
    setPrestamoSeleccionado,
  } = prestamoState

  const [procesandoId, setProcesandoId] = useState<number | string | null>(null)
  const [modalSancionVisible, setModalSancionVisible] = useState(false)
  const [modalNoDevueltoVisible, setModalNoDevueltoVisible] = useState(false)

  const handleDevolver = async (item: any) => {
    if (!canRegistrarDevolucion) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para registrar devoluciones.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    const id = item.ID_PRESTAMO
    if (!id) return

    setPrestamoSeleccionado(item)

    const result = await Swal.fire({
      title: '¿Confirmar Devolución?',
      text: `¿Desea registrar la devolución del libro "${item.TITULO_LIBROS}" prestado a ${item.NOMBRE_PERSONA} ${item.APELLIDO_PERSONA}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#0d6efd',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, Registrar Devolución',
      cancelButtonText: 'Cancelar',
    })

    if (!result.isConfirmed) {
      setPrestamoSeleccionado(null)
      return
    }

    const tienePermiso = await prestamoState.verificarAccionEnServidor('btn_registrar_devolucion')
    if (!tienePermiso) {
      setPrestamoSeleccionado(null)
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para registrar devoluciones.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    setProcesandoId(id)
    try {
      const payload = {
        nuevo_estado: 0,
        ID_PRESTAMO: id,
        ID_LIBROS: item.ID_LIBROS,
        DETALLE_PRESTAMO: 'Devuelto satisfactoriamente',
      }
      await CambioEstado(id, payload)

      Swal.fire({
        icon: 'success',
        title: '¡Devolución registrada!',
        text: 'El libro fue devuelto con éxito.',
        timer: 1800,
        showConfirmButton: false,
      })

      setDetails([])
      setTableKey((k) => k + 1)
      fetchPrestamos()
    } catch (error: any) {
      console.error('Error al registrar devolución:', error)
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        'Ocurrió un error al procesar la devolución.'
      Swal.fire({
        icon: 'error',
        title: 'Error al registrar devolución',
        text: msg,
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
    } finally {
      setProcesandoId(null)
      setPrestamoSeleccionado(null)
    }
  }

  const handleAbrirSancion = (item: any) => {
    setPrestamoSeleccionado(item)
    setModalSancionVisible(true)
  }

  const handleSancionSuccess = () => {
    setPrestamoSeleccionado(null)
    setDetails([])
    setTableKey((k) => k + 1)
    fetchPrestamos()
  }

  const handleAbrirNoDevuelto = (item: any) => {
    setPrestamoSeleccionado(item)
    setModalNoDevueltoVisible(true)
  }

  const handleNoDevueltoSuccess = () => {
    setPrestamoSeleccionado(null)
    setDetails([])
    setTableKey((k) => k + 1)
    fetchPrestamos()
  }

  const columns = useMemo(
    () => [
      { key: 'TITULO_LIBROS', label: 'Libro', _style: { width: '30%' } },
      { key: 'NOMBRE_PERSONA', label: 'Nombres', _style: { width: '20%' } },
      { key: 'APELLIDO_PERSONA', label: 'Apellidos', _style: { width: '20%' } },
      { key: 'CELULAR_PERSONA', label: 'Celular', _style: { width: '15%' } },
      { key: 'ESTADO_TEXTO', label: 'Estado', _style: { width: '15%' } },
    ],
    []
  )

  return (
    <div className="pb-4">
      {/* Encabezado estándar unificado */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h3 className="fw-bold mb-1 text-body d-flex align-items-center gap-2">
            <CIcon icon={cilTransfer} size="lg" style={{ color: '#2e59e5ff' }} />
            <span>  Préstamos y Devoluciones</span>
          </h3>
          <p className="text-body-secondary mb-0">
            Visualiza y gestiona los préstamos activos y procesa las devoluciones de libros.
          </p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <CButton
            color="secondary"
            variant="outline"
            size="sm"
            disabled={loading}
            className="d-flex align-items-center gap-1 shadow-sm"
            onClick={() => prestamoState.handleRecargar()}
            title="Refrescar lista y reiniciar filtros"
          >
            <CIcon icon={cilSync} className={`me-1 ${loading ? 'rotate-animation' : ''}`} />
            <span>{loading ? 'Refrescando...' : 'Refrescar'}</span>
          </CButton>
          {canCrearPrestamo && (
            <CButton
              color="primary"
              size="sm"
              variant="outline"
              className="hover:text-white shadow-sm"
              onClick={() => setModalRegister(true)}
            >
              <CIcon icon={cilBook} className="me-1" />
              <span>Nuevo Préstamo</span>
            </CButton>
          )}
        </div>
      </div>

      <Modal_prestamo
        visible={modalRegister}
        setVisible={setModalRegister}
        onPrestamoCreado={handlePrestamoCreado}
        canGuardarPrestamo={canGuardarPrestamo}
      />

      <ModalDevolverSancion
        visible={modalSancionVisible}
        setVisible={(v) => {
          setModalSancionVisible(v)
          if (!v) setPrestamoSeleccionado(null)
        }}
        item={prestamoSeleccionado}
        onSuccess={handleSancionSuccess}
        canGuardarDevolverSancion={canGuardarDevolverSancion}
      />

      <ModalNoDevuelto
        visible={modalNoDevueltoVisible}
        setVisible={(v) => {
          setModalNoDevueltoVisible(v)
          if (!v) setPrestamoSeleccionado(null)
        }}
        item={prestamoSeleccionado}
        onSuccess={handleNoDevueltoSuccess}
        canNoDevuelto={canNoDevuelto}
        canConfirmarDarBaja={canConfirmarDarBaja}
      />

      <CCard className="shadow-sm border-0">
        <CCardHeader className="bg-transparent py-3 d-flex justify-content-between align-items-center">
          <span className="fw-semibold text-uppercase small d-inline-flex align-items-center gap-2">
            <CIcon icon={cilTransfer} style={{ color: '#2e59e5ff' }} />
            Listado de Préstamos y Devoluciones
          </span>
          <span className="text-body-secondary small">
            Total registrados: <strong>{totalItems}</strong>
          </span>
        </CCardHeader>

        <CCardBody className="p-0">
          <CSmartTable
            key={tableKey}
            clickableRows={canMostrarInfoPrestamo}
            columns={columns}
            columnSorter
            loading={loading}
            items={prestamos}
            tableFilter={{ external: true }}
            tableFilterPlaceholder="Buscar por cédula, lector, libro, ISBN..."
            onTableFilterChange={(busqueda) => prestamoState.handleBuscarGlobal(busqueda || '')}
            onRowClick={(item: any) => {
              if (!canMostrarInfoPrestamo) return
              const id = item?.ID_PRESTAMO
              if (id) toggleDetails(id)
            }}
            noItemsLabel={
              loading ? (
                'Cargando registros...'
              ) : (
                'No se encontraron registros'
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
              TITULO_LIBROS: (item: any) => (
                <td style={{ minWidth: '220px', whiteSpace: 'normal' }}>
                  <div className="d-flex flex-column">
                    <span className="fw-semibold text-body">{item.TITULO_LIBROS}</span>
                    <span className="text-muted small font-monospace">ISBN: {item.ISBN_LIBROS || 'S/N'}</span>
                  </div>
                </td>
              ),
              NOMBRE_PERSONA: (item: any) => (
                <td>
                  <span className="text-body fw-medium">{item.NOMBRE_PERSONA || '-'}</span>
                </td>
              ),
              APELLIDO_PERSONA: (item: any) => (
                <td>
                  <span className="text-body fw-medium">{item.APELLIDO_PERSONA || '-'}</span>
                </td>
              ),
              CELULAR_PERSONA: (item: any) => (
                <td>
                  <span className="font-monospace fw-semibold text-secondary">{item.CELULAR_PERSONA || '-'}</span>
                </td>
              ),
              ESTADO_TEXTO: (item: any) => (
                <td>
                  <CBadge color={getBadgeColor(item.ESTADO_TEXTO)} shape="rounded-pill" className="px-3 py-1">
                    {item.ESTADO_TEXTO || 'En préstamo'}
                  </CBadge>
                </td>
              ),
              details: (item: any) => {
                const rowId = item.ID_PRESTAMO
                const isOpened = details.includes(rowId)
                const procesando = procesandoId === item.ID_PRESTAMO
                const esDevuelto =
                  Number(item.ESTADO_PRESTAMO) === 0 ||
                  Number(item.ESTADO_PRESTAMO) === 2 ||
                  String(item.ESTADO_TEXTO || '').toLowerCase().includes('devuelto') ||
                  String(item.ESTADO_TEXTO || '').toLowerCase().includes('disponible') ||
                  String(item.ESTADO_TEXTO || '').toLowerCase().includes('dañado') ||
                  String(item.ESTADO_TEXTO || '').toLowerCase().includes('danado') ||
                  String(item.ESTADO_TEXTO || '').toLowerCase().includes('sancion') ||
                  String(item.ESTADO_TEXTO || '').toLowerCase().includes('sanción') ||
                  String(item.ESTADO_TEXTO || '').toLowerCase().includes('no devuelto')

                const yaExtendido = Number(item.EXTENDER_PRESTAMO) === 1

                return (
                  <CCollapse visible={isOpened} className="user-details-collapse">
                    <div className="p-3 p-md-4 bg-body-tertiary border-top border-bottom rounded-bottom">
                      <CRow className="g-3">
                        {/* Lado izquierdo: Ícono grande y resumen del libro */}
                        <CCol
                          xs={12}
                          md={4}
                          className="d-flex flex-column align-items-center justify-content-center text-center border-end-md pb-3 pb-md-0"
                        >
                          <div
                            className="bg-primary bg-opacity-10 text-primary p-3 rounded-4 shadow-sm mb-3 d-flex align-items-center justify-content-center"
                            style={{ width: '120px', height: '120px' }}
                          >
                            <CIcon icon={cilBook} size="xxl" />
                          </div>
                          <h6 className="fw-bold mb-1 text-body small">{item.TITULO_LIBROS}</h6>
                          <span className="text-muted small mb-2">{item.NOMBRE_PERSONA} {item.APELLIDO_PERSONA}</span>
                          <span className="badge bg-body text-body border font-monospace mb-2">
                            Cédula: {item.IDENTIFICACION_PERSONA || '-'}
                          </span>
                          <CBadge color={getBadgeColor(item.ESTADO_TEXTO)} shape="rounded-pill" className="px-3 py-1">
                            {item.ESTADO_TEXTO || 'En préstamo'}
                          </CBadge>
                        </CCol>

                        {/* Lado derecho: Tarjetas informativas en Grid */}
                        <CCol xs={12} md={8}>
                          <CRow className="g-2">
                            <CCol xs={12} sm={6} lg={4}>
                              <CCard className="h-100 shadow-sm border-0 bg-body">
                                <CCardBody className="p-2">
                                  <span className="text-muted small d-block mb-1">
                                    <CIcon icon={cilContact} className="me-1 text-body" />
                                    Identificación
                                  </span>
                                  <span className="badge bg-body rounded-pill text-body font-monospace">{item.IDENTIFICACION_PERSONA || '-'}</span>
                                </CCardBody>
                              </CCard>
                            </CCol>

                            <CCol xs={12} sm={6} lg={4}>
                              <CCard className="h-100 shadow-sm border-0 bg-body">
                                <CCardBody className="p-2">
                                  <span className="text-muted small d-block mb-1">
                                    <CIcon icon={cilCalendar} className="me-1 text-body" />
                                    Fecha de Préstamo
                                  </span>
                                  <span className="badge bg-body rounded-pill border text-primary font-monospace">
                                    {item.FECHAINICIO_PRESTAMO || '-'}
                                  </span>
                                </CCardBody>
                              </CCard>
                            </CCol>

                            <CCol xs={12} sm={6} lg={4}>
                              <CCard className="h-100 shadow-sm border-0 bg-body">
                                <CCardBody className="p-2">
                                  <span className="text-muted small d-block mb-1">
                                    <CIcon icon={cilCalendar} className="me-1 text-body" />
                                    Fecha de Entrega
                                  </span>
                                  <span className="badge bg-body rounded-pill border text-danger font-monospace">
                                    {item.FECHAFIN_PRESTAMO || '-'}
                                  </span>
                                </CCardBody>
                              </CCard>
                            </CCol>

                            <CCol xs={12} sm={6} lg={4}>
                              <CCard className="h-100 shadow-sm border-0 bg-body">
                                <CCardBody className="p-2">
                                  <span className="text-muted small d-block mb-1">
                                    <CIcon icon={cilMobile} className="me-1 text-body" />
                                    Celular
                                  </span>
                                  <span className="small text-body font-monospace">{item.CELULAR_PERSONA || '-'}</span>
                                </CCardBody>
                              </CCard>
                            </CCol>

                            <CCol xs={12} sm={6} lg={4}>
                              <CCard className="h-100 shadow-sm border-0 bg-body">
                                <CCardBody className="p-2">
                                  <span className="text-muted small d-block mb-1">
                                    <CIcon icon={cilPhone} className="me-1 text-body" />
                                    Teléfono
                                  </span>
                                  <span className="small text-body font-monospace">{item.TELEFONO_PERSONA || '-'}</span>
                                </CCardBody>
                              </CCard>
                            </CCol>

                            <CCol xs={12} sm={6} lg={4}>
                              <CCard className="h-100 shadow-sm border-0 bg-body">
                                <CCardBody className="p-2">
                                  <span className="text-muted small d-block mb-1">
                                    <CIcon icon={cilUser} className="me-1 text-body" />
                                    Estado
                                  </span>
                                  <CBadge color={getBadgeColor(item.ESTADO_TEXTO)} shape="rounded-pill" className="px-2 py-1">
                                    {item.ESTADO_TEXTO || 'En préstamo'}
                                  </CBadge>
                                </CCardBody>
                              </CCard>
                            </CCol>

                            {item.DETALLE_PRESTAMO && (
                              <CCol xs={12}>
                                <CCard className="shadow-sm border-0 bg-body">
                                  <CCardBody className="p-2">
                                    <span className="text-muted small d-block mb-1">Observaciones / Detalle:</span>
                                    <span className="text-body small">{item.DETALLE_PRESTAMO}</span>
                                  </CCardBody>
                                </CCard>
                              </CCol>
                            )}
                          </CRow>

                          <div className="d-flex flex-wrap gap-2 justify-content-end align-items-center mt-3 pt-2 border-top">
                            {canExtenderPrestamo || canRegistrarDevolucion || canDevolverSancion || canNoDevuelto ? (
                              <>
                                {canExtenderPrestamo && !esDevuelto && (
                                  <CButton
                                    color={yaExtendido ? 'secondary' : 'primary'}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleExtenderPrestamo(item)}
                                    title={
                                      yaExtendido
                                        ? 'El préstamo ya fue extendido previamente y no permite más extensiones'
                                        : 'Extender fecha de entrega'
                                    }
                                    className="d-flex align-items-center gap-1 shadow-sm px-3"
                                    disabled={procesando || yaExtendido}
                                  >
                                    <CIcon icon={cilCalendar} size="sm" />
                                    <span>Extender</span>
                                  </CButton>
                                )}

                                {/* Registrar Devolución */}
                                {canRegistrarDevolucion && !esDevuelto && (
                                  <CButton
                                    color="success"
                                    variant="outline"
                                    size="sm"
                                    className="d-flex align-items-center gap-1 shadow-sm px-3"
                                    disabled={procesando}
                                    onClick={() => handleDevolver(item)}
                                    title="Registrar devolución normal del libro"
                                  >
                                    {procesando ? (
                                      <CSpinner size="sm" />
                                    ) : (
                                      <CIcon icon={cilCheck} size="sm" />
                                    )}
                                    <span>Registrar Devolución</span>
                                  </CButton>
                                )}

                                {/* Devolver con Sanción */}
                                {canDevolverSancion && !esDevuelto && (
                                  <CButton
                                    color="warning"
                                    variant="outline"
                                    size="sm"
                                    className="d-flex align-items-center gap-1 shadow-sm px-3"
                                    disabled={procesando}
                                    onClick={() => handleAbrirSancion(item)}
                                    title="Registrar devolución aplicando sanción"
                                  >
                                    <CIcon icon={cilReportSlash} size="sm" />
                                    <span>Devolver con Sanción</span>
                                  </CButton>
                                )}

                                {/* No Devuelto */}
                                {canNoDevuelto && !esDevuelto && (
                                  <CButton
                                    color="danger"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleAbrirNoDevuelto(item)}
                                    title="Marcar como no devuelto / dar de baja ejemplar"
                                    className="d-flex align-items-center gap-1 shadow-sm px-3"
                                    disabled={procesando || Number(item.ESTADO_PRESTAMO) === 2 || item.ESTADO_TEXTO === 'Devuelto pero dañado'}
                                  >
                                    <CIcon icon={cilReportSlash} size="sm" />
                                    <span>No Devuelto</span>
                                  </CButton>
                                )}
                              </>
                            ) : (
                              <span className="text-danger small fw-semibold py-1">
                                No tienes acceso a las acciones de préstamos.
                              </span>
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
              Mostrando {prestamos.length} de {totalItems} préstamos (Página {currentPage} de {totalPages})
            </span>
            <CSmartPagination
              activePage={currentPage}
              pages={totalPages}
              onActivePageChange={handlePageChange}
            />
          </div>
        </CCardFooter>
      </CCard>
    </div>
  )
}

export default Loands