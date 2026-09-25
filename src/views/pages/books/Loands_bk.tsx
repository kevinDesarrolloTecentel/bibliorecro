import React from 'react'
import {
  cilBook,
  cilCalendar,
  cilContact,
  cilMobile,
  cilPhone,
  cilReportSlash,
  cilUser,
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import {
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CCollapse,
  CContainer,
  CRow,
  CSmartPagination,
  CSmartTable,
} from '@coreui/react-pro'
import usePrestamos from '@/hooks/rco-prestamos/usePrestamos'
import HeaderPrestamos from '@/components/details_bk/HeaderPrestamos'
import Modal_prestamo from '@/components/details_bk/prestamos'

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
    toggleDetails,
    handlePrestamoCreado,
    handleExtenderPrestamo,
    handleMarcarNoDevuelto,
    getBadgeColor,
  } = prestamoState

  const columns = [
    { key: 'Libro', label: 'Libro', _style: { width: '22%' } },
    { key: 'Nombres', label: 'Nombres', _style: { width: '15%' } },
    { key: 'Apellidos', label: 'Apellidos ', _style: { width: '15%' } },{ key: 'show_details', label: '', _style: { width: '1%' }, filter: false, sorter: false },
  ]

  return (
    <CContainer fluid className="mb-4">
      <HeaderPrestamos prestamoState={prestamoState} />

      <Modal_prestamo
        visible={modalRegister}
        setVisible={setModalRegister}
        onPrestamoCreado={handlePrestamoCreado}
      />

      <CCard className="shadow-sm border-0">
        <CCardHeader className="bg-body py-3 border-bottom d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-2">
            <CIcon icon={cilBook} style={{ color: '#34A6F4' }} size="xl" />
            <h5 className="mb-0 fw-bold text-body">Préstamos de Libros</h5>
          </div>
          <span className="badge bg-light text-dark border px-2 py-1">
            Total Registros: <strong>{totalItems}</strong>
          </span>
        </CCardHeader>

        <CCardBody className="p-0">
          <CSmartTable
            items={prestamos}
            columns={columns}
            loading={loading}
            tableProps={{
              responsive: true,
              hover: true,
              className: 'align-middle mb-0 text-nowrap',
            }}
            scopedColumns={{
              Libro: (item: any) => (
                <td style={{ minWidth: '220px', whiteSpace: 'normal' }}>
                  <div className="d-flex flex-column">
                    <span className="fw-semibold text-body">{item.Libro}</span>
                    <span className="text-muted small font-monospace">ISBN: {item.ISBN || 'S/N'}</span>
                  </div>
                </td>
              ),
              Nombres: (item: any) => (
                <td>
                  <span className="font-monospace small fw-semibold">{item.Nombres || '-'}</span>
                </td>
              ),
              Apellidos: (item: any) => (
                <td>
                  <span className="font-monospace small fw-semibold">{item.Apellidos || '-'}</span>
                </td>
              ),
              Cedula: (item: any) => (
                <td>
                  <span className="font-monospace small fw-semibol badge text-dark">{item.Cedula || '-'}</span>
                </td>
              ),
              Fecha_prestamo: (item: any) => (
                <td>
                  <CBadge color="primary" className="px-2 py-1 font-monospace">
                    {item.Fecha_prestamo || '-'}
                  </CBadge>
                </td>
              ),
              Fecha_entrega: (item: any) => (
                <td>
                  <CBadge color="danger" className="px-2 py-1 font-monospace">
                    {item.Fecha_entrega || '-'}
                  </CBadge>
                </td>
              ),
              status: (item: any) => (
                <td>
                  <CBadge color={getBadgeColor(item.status)} shape="rounded-pill" className="px-2 py-1">
                    {item.status || 'En préstamo'}
                  </CBadge>
                </td>
              ),
              show_details: (item: any) => {
                const isOpened = details.includes(item.id)
                return (
                  <td className="py-2 text-end">
                    <CButton
                      color="primary"
                      variant={isOpened ? undefined : 'outline'}
                      shape="square"
                      size="sm"
                      onClick={() => toggleDetails(item.id)}
                    >
                      {isOpened ? 'Ocultar' : 'Mostrar'}
                    </CButton>
                  </td>
                )
              },
              details: (item: any) => {
                const isOpened = details.includes(item.id)
                return (
                  <CCollapse visible={isOpened}>
                    <div className="p-3 p-md-4 bg-body-tertiary border-top border-bottom">
                      <CRow className="g-3">
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
                          <h6 className="fw-bold mb-1 text-body small">{item.Libro}</h6>
                          <span className="text-muted small mb-2">{item.Nombres} {item.Apellidos}</span>
                          <span className="badge bg-body text-dark border font-monospace mb-2">
                            Cédula: {item.Cedula || '-'}
                          </span>
                          <CBadge color={getBadgeColor(item.status)} shape="rounded-pill" className="px-3 py-1">
                            {item.status || 'En préstamo'}
                          </CBadge>
                        </CCol>

                        <CCol xs={12} md={8}>
                          <CRow className="g-2">
                            <CCol xs={12} sm={6} lg={4}>
                              <CCard className="h-100 shadow-sm border-0 bg-body">
                                <CCardBody className="p-2">
                                  <span className="text-muted small d-block mb-1">
                                    <CIcon icon={cilContact} className="me-1 text-body" />
                                    Identificación
                                  </span>
                                  <span className="badge bg-body rounded-pill text-body font-monospace">{item.Cedula || '-'} </span>
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
                                  <CBadge color="light" shape="rounded-pill" className="px-2 py-1 font-monospace text-primary">
                                    <span className="fw-bold ">{item.Fecha_prestamo || '-'}</span>
                                  </CBadge>
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
                                  <CBadge color='light' shape='rounded-pill' className='px-2 py-1 text-danger'>
                                    <span className="fw-bold">{item.Fecha_entrega || '-'}</span>
                                  </CBadge>
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
                                  <CBadge color='light' shape='rounded-pill' className='px-2 py-1 text-dark font-monospace'>
                                    <span className="fw-bold">{item.Celular || '-'}</span>
                                  </CBadge>
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
                                  <CBadge color='light' shape='rounded-pill' className='text-dark'>
                                    <span className="fw-bold">{item.Telefono || '-'}</span>
                                  </CBadge>
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
                                  <CBadge color={getBadgeColor(item.status)} shape='rounded-pill' className="px-2 py-1">
                                    {item.status || 'En préstamo'}
                                  </CBadge>
                                </CCardBody>
                              </CCard>
                            </CCol>
                          </CRow>

                          <div className="d-flex flex-wrap gap-2 justify-content-end mt-3 pt-2 border-top">
                            <CButton
                              color="primary"
                              variant="outline"
                              size="sm"
                              onClick={() => handleExtenderPrestamo(item)}
                              title="Extender fecha de entrega"
                              className="d-flex align-items-center gap-1 shadow-sm"
                            >
                              <CIcon icon={cilCalendar} />
                              <span>Extender</span>
                            </CButton>
                            <CButton
                              color="danger"
                              variant="outline"
                              size="sm"
                              onClick={() => handleMarcarNoDevuelto(item)}
                              title="Marcar como no devuelto / dañado"
                              className="hover:text-body d-flex align-items-center gap-1 shadow-sm"
                              disabled={item.status === 'No Devuelto' || item.status === '2'}
                            >
                              <CIcon icon={cilReportSlash} />
                              <span>No Devuelto</span>
                            </CButton>
                          </div>
                        </CCol>
                      </CRow>
                    </div>
                  </CCollapse>
                )
              },
            }}
          />

          <div className="d-flex flex-wrap justify-content-between align-items-center p-3 border-top bg-body">
            <span className="text-muted small">
              Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong> (Total: {totalItems} préstamos)
            </span>
            <CSmartPagination
              size="sm"
              activePage={currentPage}
              pages={totalPages}
              onActivePageChange={handlePageChange}
            />
          </div>
        </CCardBody>
      </CCard>
    </CContainer>
  )
}

export default Loands