import React, { useState } from 'react'
import { cilBarcode, cilBook,
  cilBookmark, cilDescription, cilDollar, cilExitToApp, cilGlobeAlt, cilLayers, cilLibraryBuilding, cilSave, cilTag, cilTruck, cilUser } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { CButton, CCol, CDatePicker, CForm, CFormInput, CFormTextarea, CInputGroup, CInputGroupText, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle, CSpinner } from '@coreui/react-pro'
import useLibroRegister, { UseLibroRegisterProps } from '@/hooks/rco-libros/useLibroRegister'
import SearchableSelect from '@/components/details_bk/SearchableSelect'
import PaisSelect from '@/components/details_bk/PaisSelect'
import { aFechaLocal, parseDatePickerValue } from '@/utils/dateUtils'

interface RegisterBkProps extends UseLibroRegisterProps {}

const Registro_bk: React.FC<RegisterBkProps> = (props) => {
  const {
    isVisible,
    formData,
    loading,
    errors,
    catalogos,
    handleChange,
    handleSelectChange,
    handleClose,
    handleSubmit,
    canGuardarLibro,
  } = useLibroRegister(props)

  // ISBN: control de "S/N" o número máx 13 dígitos
  const [isbnSN, setIsbnSN] = useState(false)
  // Código de barras: control de "S/N" o solo números
  const [barcodeSN, setBarcodeSN] = useState(false)

  const handleIsbnToggle = (checked: boolean) => {
    setIsbnSN(checked)
    if (checked) {
      handleSelectChange('ISBN_LIBROS', 'S/N')
    } else {
      handleSelectChange('ISBN_LIBROS', '')
    }
  }

  const handleBarcodeToggle = (checked: boolean) => {
    setBarcodeSN(checked)
    if (checked) {
      handleSelectChange('CODIGODEBARRAS_LIBROS', 'S/N')
    } else {
      handleSelectChange('CODIGODEBARRAS_LIBROS', '')
    }
  }

  const handleIsbnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Solo dígitos, máximo 13
    const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 13)
    handleSelectChange('ISBN_LIBROS', val)
  }

  const handleBarcodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Solo dígitos
    const val = e.target.value.replace(/[^0-9]/g, '')
    handleSelectChange('CODIGODEBARRAS_LIBROS', val)
  }

  const handlePrecioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Solo números y punto, máximo 2 decimales
    let val = e.target.value.replace(/[^0-9.]/g, '')
    const parts = val.split('.')
    if (parts.length > 2) {
      val = `${parts[0]}.${parts.slice(1).join('')}`
    }
    if (parts.length === 2 && parts[1].length > 2) {
      val = `${parts[0]}.${parts[1].slice(0, 2)}`
    }
    handleSelectChange('PRECIO_LIBROS', val)
  }

  return (
    <CModal
      size="xl"
      aria-labelledby="ModalRegistroLibroLabel"
      visible={isVisible}
      onClose={handleClose}
      scrollable
      backdrop="static"
    >
      <CModalHeader closeButton className="bg-body">
        <CModalTitle id="ModalRegistroLibroLabel" className="d-flex align-items-center gap-2 fs-5 fw-bold text-body">
          <CIcon icon={cilBook} size="lg" className='text-body'/>
          <span className='text-body'>Registrar Libro</span>
        </CModalTitle>
      </CModalHeader>

      <CModalBody className="px-3 px-md-4 py-3">
        <CForm onSubmit={handleSubmit} className="row g-3">
          <CCol xs={12} className="mt-2">
            <div className="d-flex align-items-center justify-content-between pb-2 border-bottom fw-semibold text-secondary">
              <span>DATOS GENERALES DEL LIBRO</span>
            </div>
          </CCol>

          {/* Categoría - SearchableSelect */}
          <CCol xs={12} sm={6} md={4}>
            <label className="form-label small fw-semibold text-muted">Categoría *</label>
            <CInputGroup>
              <CInputGroupText>
                <CIcon icon={cilBookmark} />
              </CInputGroupText>
              <SearchableSelect
                name="ID_CATEGORIA"
                value={formData.ID_CATEGORIA}
                options={catalogos.categorias}
                onChange={(val) => handleSelectChange('ID_CATEGORIA', val)}
                invalid={!!errors.ID_CATEGORIA}
                loading={catalogos.loading && catalogos.categorias.length === 0}
                placeholder="Seleccionar categoría o buscar..."
              />
            </CInputGroup>
            {errors.ID_CATEGORIA && (
              <small className="text-danger d-block mt-1">{errors.ID_CATEGORIA}</small>
            )}
          </CCol>

          {/* Género - SearchableSelect */}
          <CCol xs={12} sm={6} md={4}>
            <label className="form-label small fw-semibold text-muted">Género *</label>
            <CInputGroup>
              <CInputGroupText>
                <CIcon icon={cilTag} />
              </CInputGroupText>
              <SearchableSelect
                name="ID_RCOGENERO"
                value={formData.ID_RCOGENERO}
                options={catalogos.generos}
                onChange={(val) => handleSelectChange('ID_RCOGENERO', val)}
                invalid={!!errors.ID_RCOGENERO}
                loading={catalogos.loading && catalogos.generos.length === 0}
                placeholder="Seleccionar género o buscar..."
              />
            </CInputGroup>
            {errors.ID_RCOGENERO && (
              <small className="text-danger d-block mt-1">{errors.ID_RCOGENERO}</small>
            )}
          </CCol>

          {/* Proveedor - SearchableSelect */}
          <CCol xs={12} sm={12} md={4}>
            <label className="form-label small fw-semibold text-muted">Proveedor *</label>
            <CInputGroup>
              <CInputGroupText>
                <CIcon icon={cilTruck} />
              </CInputGroupText>
              <SearchableSelect
                name="ID_PROVEEDOR"
                value={formData.ID_PROVEEDOR}
                options={catalogos.proveedores}
                onChange={(val) => handleSelectChange('ID_PROVEEDOR', val)}
                invalid={!!errors.ID_PROVEEDOR}
                loading={catalogos.loading && catalogos.proveedores.length === 0}
                placeholder="Seleccionar proveedor o buscar..."
              />
            </CInputGroup>
            {errors.ID_PROVEEDOR && (
              <small className="text-danger d-block mt-1">{errors.ID_PROVEEDOR}</small>
            )}
          </CCol>

          <CCol xs={12} className="mt-4">
            <div className="d-flex align-items-center gap-2 pb-2 border-bottom fw-semibold text-secondary">
              <span>DATOS BIBLIOGRÁFICOS</span>
            </div>
          </CCol>

          <CCol xs={12} md={6}>
            <label className="form-label small fw-semibold text-muted">Título del Libro *</label>
            <CInputGroup>
              <CInputGroupText>
                <CIcon icon={cilBook} />
              </CInputGroupText>
              <CFormInput
                name="TITULO_LIBROS"
                placeholder="Ej: Cien años de soledad"
                value={formData.TITULO_LIBROS}
                onChange={handleChange}
                invalid={!!errors.TITULO_LIBROS}
                required
              />
            </CInputGroup>
            {errors.TITULO_LIBROS && (
              <small className="text-danger d-block mt-1">{errors.TITULO_LIBROS}</small>
            )}
          </CCol>

          {/* Autor - SearchableSelect */}
          <CCol xs={12} md={6}>
            <label className="form-label small fw-semibold text-muted">Autor *</label>
            <CInputGroup>
              <CInputGroupText>
                <CIcon icon={cilUser} />
              </CInputGroupText>
              <SearchableSelect
                name="ID_AUTOR"
                value={formData.ID_AUTOR}
                options={catalogos.autores}
                onChange={(val) => handleSelectChange('ID_AUTOR', val)}
                invalid={!!errors.ID_AUTOR}
                loading={catalogos.loading && catalogos.autores.length === 0}
                placeholder="Seleccionar autor o buscar..."
              />
            </CInputGroup>
            {errors.ID_AUTOR && (
              <small className="text-danger d-block mt-1">{errors.ID_AUTOR}</small>
            )}
          </CCol>

          {/* Editorial - SearchableSelect */}
          <CCol xs={12} sm={6} md={4}>
            <label className="form-label small fw-semibold text-muted">Editorial *</label>
            <CInputGroup>
              <CInputGroupText>
                <CIcon icon={cilLibraryBuilding} />
              </CInputGroupText>
              <SearchableSelect
                name="ID_EDITORIAL"
                value={formData.ID_EDITORIAL}
                options={catalogos.editoriales}
                onChange={(val) => handleSelectChange('ID_EDITORIAL', val)}
                invalid={!!errors.ID_EDITORIAL}
                loading={catalogos.loading && catalogos.editoriales.length === 0}
                placeholder="Seleccionar editorial o buscar..."
              />
            </CInputGroup>
            {errors.ID_EDITORIAL && (
              <small className="text-danger d-block mt-1">{errors.ID_EDITORIAL}</small>
            )}
          </CCol>

          {/* ISBN: máximo 13 dígitos o S/N */}
          <CCol xs={12} sm={6} md={4}>
            <label className="form-label small fw-semibold text-muted">
              ISBN *
            </label>
            <CInputGroup>
              <CInputGroupText>
                <CIcon icon={cilBarcode} />
              </CInputGroupText>
              <CFormInput
                name="ISBN_LIBROS"
                placeholder={isbnSN ? 'S/N' : 'Ej: 9780000000000'}
                value={isbnSN ? 'S/N' : (formData.ISBN_LIBROS || '')}
                onChange={handleIsbnChange}
                invalid={!!errors.ISBN_LIBROS}
                disabled={isbnSN}
                maxLength={13}
                inputMode="numeric"
              />
              <CInputGroupText
                title="Marcar Sin ISBN"
                style={{ cursor: 'pointer', userSelect: 'none' }}
                onClick={() => handleIsbnToggle(!isbnSN)}
              >
                <input
                  type="checkbox"
                  checked={isbnSN}
                  onChange={(e) => handleIsbnToggle(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                  title="Sin ISBN (S/N)"
                />
                <span className="ms-1 small">S/N</span>
              </CInputGroupText>
            </CInputGroup>
            {errors.ISBN_LIBROS && (
              <small className="text-danger d-block mt-1">{errors.ISBN_LIBROS}</small>
            )}
          </CCol>

          <CCol xs={12} sm={6} md={4}>
            <label className="form-label small fw-semibold text-muted">Volumen *</label>
            <CInputGroup>
              <CInputGroupText>
                <CIcon icon={cilLayers} />
              </CInputGroupText>
              <CFormInput
                name="VOLUMEN_LIBROS"
                placeholder="Ej: Vol. 1, Tomo 2"
                value={formData.VOLUMEN_LIBROS}
                onChange={handleChange}
                invalid={!!errors.VOLUMEN_LIBROS}
              />
            </CInputGroup>
            {errors.VOLUMEN_LIBROS && (
              <small className="text-danger d-block mt-1">{errors.VOLUMEN_LIBROS}</small>
            )}
          </CCol>

          {/* Fecha de Edición - CDatePicker CoreUI Pro */}
          <CCol xs={12} sm={6} md={4}>
            <label className="form-label small fw-semibold text-muted">Fecha de Edición *</label>
            <CDatePicker
              inputReadOnly
              locale="es-ES"
              placeholder="Seleccione fecha de edición"
              date={aFechaLocal(formData.FECHAEDICION_LIBROS)}
              onDateChange={(val) =>
                handleSelectChange('FECHAEDICION_LIBROS', parseDatePickerValue(val ?? null))
              }
              cleaner
              invalid={!!errors.FECHAEDICION_LIBROS}
            />
            {errors.FECHAEDICION_LIBROS && (
              <small className="text-danger d-block mt-1">{errors.FECHAEDICION_LIBROS}</small>
            )}
          </CCol>

          <CCol xs={12} className="mt-4">
            <div className="d-flex align-items-center gap-2 pb-2 border-bottom fw-semibold text-secondary">
              <span>MÁS INFORMACIÓN Y FORMATO</span>
            </div>
          </CCol>

          {/* País - listado completo con búsqueda */}
          <CCol xs={12} sm={6} md={4}>
            <label className="form-label small fw-semibold text-muted">País *</label>
            <CInputGroup>
              <CInputGroupText>
                <CIcon icon={cilGlobeAlt} />
              </CInputGroupText>
              <PaisSelect
                value={formData.PAIS_LIBROS || ''}
                onChange={(val) => handleSelectChange('PAIS_LIBROS', val)}
                invalid={!!errors.PAIS_LIBROS}
              />
            </CInputGroup>
            {errors.PAIS_LIBROS && (
              <small className="text-danger d-block mt-1">{errors.PAIS_LIBROS}</small>
            )}
          </CCol>

          {/* Código de Barras: solo números o S/N */}
          <CCol xs={12} sm={6} md={4}>
            <label className="form-label small fw-semibold text-muted">Código de Barras *</label>
            <CInputGroup>
              <CInputGroupText>
                <CIcon icon={cilBarcode} />
              </CInputGroupText>
              <CFormInput
                name="CODIGODEBARRAS_LIBROS"
                placeholder={barcodeSN ? 'S/N' : '123456789'}
                value={barcodeSN ? 'S/N' : (formData.CODIGODEBARRAS_LIBROS || '')}
                onChange={handleBarcodeChange}
                disabled={barcodeSN}
                invalid={!!errors.CODIGODEBARRAS_LIBROS}
                inputMode="numeric"
              />
              <CInputGroupText
                title="Marcar Sin código de barras"
                style={{ cursor: 'pointer', userSelect: 'none' }}
                onClick={() => handleBarcodeToggle(!barcodeSN)}
              >
                <input
                  type="checkbox"
                  checked={barcodeSN}
                  onChange={(e) => handleBarcodeToggle(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                  title="Sin código de barras (S/N)"
                />
                <span className="ms-1 small">S/N</span>
              </CInputGroupText>
            </CInputGroup>
            {errors.CODIGODEBARRAS_LIBROS && (
              <small className="text-danger d-block mt-1">{errors.CODIGODEBARRAS_LIBROS}</small>
            )}
          </CCol>

          {/* Precio: solo números y hasta 2 decimales */}
          <CCol xs={12} sm={4}>
            <label className="form-label small fw-semibold text-muted">Precio *</label>
            <CInputGroup>
              <CInputGroupText>
                <CIcon icon={cilDollar} />
              </CInputGroupText>
              <CFormInput
                type="text"
                inputMode="decimal"
                name="PRECIO_LIBROS"
                placeholder="0.00"
                value={formData.PRECIO_LIBROS}
                onChange={handlePrecioChange}
                invalid={!!errors.PRECIO_LIBROS}
              />
            </CInputGroup>
            {errors.PRECIO_LIBROS && (
              <small className="text-danger d-block mt-1">{errors.PRECIO_LIBROS}</small>
            )}
          </CCol>

          {/* Formato - SearchableSelect */}
          <CCol xs={12} sm={6} md={4}>
            <label className="form-label small fw-semibold text-muted">Formato *</label>
            <CInputGroup>
              <CInputGroupText>
                <CIcon icon={cilDescription} />
              </CInputGroupText>
              <SearchableSelect
                name="ID_FORMATOS"
                value={formData.ID_FORMATOS}
                options={catalogos.formatos}
                onChange={(val) => handleSelectChange('ID_FORMATOS', val)}
                invalid={!!errors.ID_FORMATOS}
                loading={catalogos.loading && catalogos.formatos.length === 0}
                placeholder="Seleccionar formato o buscar..."
              />
            </CInputGroup>
            {errors.ID_FORMATOS && (
              <small className="text-danger d-block mt-1">{errors.ID_FORMATOS}</small>
            )}
          </CCol>

          {/* Tipo de Libro - SearchableSelect */}
          <CCol xs={12} sm={6} md={4}>
            <label className="form-label small fw-semibold text-muted">Tipo de Libro *</label>
            <CInputGroup>
              <CInputGroupText>
                <CIcon icon={cilBook} />
              </CInputGroupText>
              <SearchableSelect
                name="ID_TIPO"
                value={formData.ID_TIPO}
                options={catalogos.tipos}
                onChange={(val) => handleSelectChange('ID_TIPO', val)}
                invalid={!!errors.ID_TIPO}
                loading={catalogos.loading && catalogos.tipos.length === 0}
                placeholder="Seleccionar tipo o buscar..."
              />
            </CInputGroup>
            {errors.ID_TIPO && (
              <small className="text-danger d-block mt-1">{errors.ID_TIPO}</small>
            )}
          </CCol>

          {/* Estado eliminado del formulario */}

          <CCol xs={12} className="mt-4">
            <div className="d-flex align-items-center gap-2 pb-2 border-bottom fw-semibold text-secondary">
              <span>DETALLES</span>
            </div>
          </CCol>

          {/* Título Tejuelo: máx 10 caracteres */}
          <CCol xs={12} sm={6} md={6}>
            <label className="form-label small fw-semibold text-muted">
              Título Tejuelo *
            </label>
            <CInputGroup>
              <CInputGroupText>
                <CIcon icon={cilTag} />
              </CInputGroupText>
              <CFormInput
                name="TITULOTEJUELO_LIBROS"
                placeholder="Abreviatura del título"
                value={formData.TITULOTEJUELO_LIBROS}
                onChange={handleChange}
                invalid={!!errors.TITULOTEJUELO_LIBROS}
                maxLength={10}
              />
            </CInputGroup>
            {errors.TITULOTEJUELO_LIBROS && (
              <small className="text-danger d-block mt-1">{errors.TITULOTEJUELO_LIBROS}</small>
            )}
          </CCol>

          {/* Autor Tejuelo: máx 3 caracteres */}
          <CCol xs={12} sm={6} md={6}>
            <label className="form-label small fw-semibold text-muted">
              Autor Tejuelo *
            </label>
            <CInputGroup>
              <CInputGroupText>
                <CIcon icon={cilUser} />
              </CInputGroupText>
              <CFormInput
                name="AUTORTEJUELO_LIBROS"
                placeholder="Código de autor"
                value={formData.AUTORTEJUELO_LIBROS}
                onChange={handleChange}
                invalid={!!errors.AUTORTEJUELO_LIBROS}
                maxLength={3}
              />
            </CInputGroup>
            {errors.AUTORTEJUELO_LIBROS && (
              <small className="text-danger d-block mt-1">{errors.AUTORTEJUELO_LIBROS}</small>
            )}
          </CCol>

          <CCol xs={12}>
            <div className="d-flex justify-content-between align-items-center mb-1">
              <label className="form-label small fw-semibold text-muted mb-0">Detalles:</label>
              <span className="small text-muted font-monospace" style={{ fontSize: '0.72rem' }}>
                {(formData.DESCRIPCION_LIBROS || '').length}/255
              </span>
            </div>
            <CFormTextarea
              name="DESCRIPCION_LIBROS"
              maxLength={255}
              rows={3}
              placeholder="Notas o descripción adicional del libro (máx. 255 caracteres)..."
              value={formData.DESCRIPCION_LIBROS}
              onChange={handleChange}
            />
          </CCol>
        </CForm>
      </CModalBody>

      <CModalFooter className="bg-body d-flex justify-content-end gap-2">
        <CButton
          color="danger"
          variant="outline"
          className='hover:text-white'
          onClick={handleClose}
          size="sm"
          disabled={loading}
        >
          <CIcon icon={cilExitToApp} className="me-1" />
          Cerrar
        </CButton>
        {canGuardarLibro && (
          <CButton
            color='success'
            variant='outline'
            className='hover:text-white'
            onClick={handleSubmit}
            disabled={loading}
            size="sm"
          >
            {loading ? (
              <>
                <CSpinner size="sm" className="me-1" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <CIcon icon={cilSave} className="me-1" />
                <span>Guardar Libro</span>
              </>
            )}
          </CButton>
        )}
      </CModalFooter>
    </CModal>
  )
}

export default Registro_bk
