import React from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CSmartTable,
  CSpinner
} from '@coreui/react-pro'
import CIcon from '@coreui/icons-react'
import { cilBan, cilCalendar, cilCloudDownload, cilExitToApp, cilSave } from '@coreui/icons'
import { useReporteLibrosBaja } from '@/hooks/reportes/inventario/LibroBaja'


export interface LibBajaProps {
  visible: boolean
  setVisible: (visible: boolean) => void
}

const LibBajaModal: React.FC<LibBajaProps> = ({ visible, setVisible }) => {
const {handleReset,
  anoBaja,
  setAnoBaja,
  libros,
  isLoading,
  handleGetLibrosBaja,excelLink,
  handleDescargarExcel
} = useReporteLibrosBaja()

  const handleClose = () => {
    handleReset()
    setVisible(false)
  }
  const columns = [
    {
      key: 'isbn',
      label: 'ISBN',
      _style: { width: '20%' },
    },
    {
      key: 'titulo',
      label: 'Título',
      _style: { width: '20%' },
    },
    {
      key: 'titulotej',
      label: 'Título Tejuelo',
      _style: { width: '20%' },
    },
    {
      key: 'autortej',
      label: 'Autor Tejuelo',
      _style: { width: '20%' },
    },
    {
      key: 'precio',
      label: 'Precio',
      _style: { width: '20%' },
    },
    {
      key: 'codigo',
      label: 'Código de Barras',
      _style: { width: '20%' },
    },
  ]

  return (
    <CModal
      size="xl"
      alignment="center"
      visible={visible}
      onClose={handleClose}
    >
      <CModalHeader>
        <CIcon icon={cilBan} size='xl' className='me-2' />
        <CModalTitle className='text-secondary text-muted'>Libros Dados de Baja</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CForm className="row g-3">
          <CCol md={6}>
            <CInputGroup>
              <CInputGroupText>
                <CIcon icon={cilCalendar} />
              </CInputGroupText>
              <CFormInput
                type="number"
                placeholder="Año (ej. 2024)"
                value={anoBaja}
                onChange={(e) => setAnoBaja(e.target.value)}
                min="2017"
                max="2099"
              />
            </CInputGroup>
          </CCol>
        </CForm>
        <hr className="my-3" />
        <CCard>
          <CCardHeader>Libros</CCardHeader>
          <CCardBody
            className="table-responsive"
            style={{ maxHeight: '400px', overflowY: 'auto' }}
          >
            <p className='badge bg-white border rounded text-primary'>Total de libros recibidos: <strong>{libros.length}</strong></p>
            <hr className="my-3" style={{ border: '1px dashed black' }} />
            <CSmartTable
              activePage={2}
              columns={columns}
              items={libros.map((l) => ({
                ...l,
                isbn: l.ISBN_LIBROS,
                titulo: l.TITULO_LIBROS,
                titulotej: l.TITULOTEJUELO_LIBROS,
                autortej: l.AUTORTEJUELO_LIBROS,
                precio: l.PRECIO_LIBROS,
                codigo: l.CODIGODEBARRAS_LIBROS
              }))}
              scopedColumns={{
                isbn: (item: any) => (
                  <td>
                    <span className="font-monospace small text-muted badge bg-body border">{item.ISBN_LIBROS}</span>
                  </td>
                ),
                titulo: (item: any) => (
                  <td>
                    <span className="font-monospace small">{item.TITULO_LIBROS}</span>
                  </td>
                ),
                titulotej: (item: any) => (
                  <td>
                    <span className='font-monospace small'>{item.TITULOTEJUELO_LIBROS}</span>
                  </td>
                ),
                autortej: (item: any) => (
                  <td>
                    <span className='font-monospace small'>{item.AUTORTEJUELO_LIBROS}</span>
                  </td>
                ),
                precio: (item: any) => (
                  <td>
                    <span className='text-success font-monospace small  badge bg-body border'>${item.PRECIO_LIBROS || '0.00'}</span>
                  </td>
                ),
                codigo: (item: any) => (
                  <td>
                    <span className="font-monospace small text-primary badge bg-body border">{item.CODIGODEBARRAS_LIBROS}</span>
                  </td>
                ),
              }}
              tableProps={{
                className: 'add-this-custom-class',
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
      </CModalBody>
      <CModalFooter>
        <CButton
          color='danger'
          variant='outline'
          onClick={handleClose}
          className='hover:text-white'
        >
          <CIcon icon={cilExitToApp} className='me-1' /> Cerrar
        </CButton>
        <CButton
          color='primary'
          variant='outline'
          onClick={handleGetLibrosBaja}
          disabled={isLoading}
          className='hover:text-white'
        >
          {isLoading ? (
            <>
              <CSpinner size="sm" variant="grow" aria-hidden="true" />
              Cargando...
            </>
          ) : (
            <>
              <CIcon icon={cilSave} className='me-1' /> Generar
            </>
          )}
        </CButton>
        {excelLink && (
          <CButton
            color='success'
            variant='outline'
            onClick={handleDescargarExcel}
            className='hover:text-white'
          >
            <CIcon icon={cilCloudDownload} className='hover:text-white' /> Descargar
          </CButton>
        )}
      </CModalFooter>
    </CModal>
  )
}

export default LibBajaModal