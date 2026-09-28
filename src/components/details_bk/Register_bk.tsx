import React from 'react'
import { cilBarcode, cilBook,
  cilBookmark, cilCalendar, cilCheckCircle, cilDescription, cilDollar, cilExitToApp, cilGlobeAlt, cilLayers, cilLibraryBuilding, cilSave, cilTag, cilTruck, cilUser } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { CButton, CCol, CForm, CFormInput, CFormSelect, CFormTextarea, CInputGroup, CInputGroupText, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle, CSpinner } from '@coreui/react-pro'
import useLibroRegister, { UseLibroRegisterProps } from '@/hooks/rco-libros/useLibroRegister'

interface RegisterBkProps extends UseLibroRegisterProps {}

const Registro_bk: React.FC<RegisterBkProps> = (props) => {
  const {
    isVisible,
    formData,
    loading,
    errors,
    catalogos,
    handleChange,
    handleClose,
    handleSubmit,
  } = useLibroRegister(props)

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
        <CModalTitle id="ModalRegistroLibroLabel" className="d-flex align-items-center gap-2 fs-5 fw-bold text-dark">
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

          <CCol xs={12} sm={6} md={4}>
            <label className="form-label small fw-semibold text-muted">Categoría *</label>
            <CInputGroup>
              <CInputGroupText>
                <CIcon icon={cilBookmark} />
              </CInputGroupText>
              <CFormSelect
                name="ID_CATEGORIA"
                value={formData.ID_CATEGORIA}
                onChange={handleChange}
                invalid={!!errors.ID_CATEGORIA}
                required
              >
                <option value="">Seleccionar...</option>
                {catalogos.categorias.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </CFormSelect>
            </CInputGroup>
            {errors.ID_CATEGORIA && (
              <small className="text-danger d-block mt-1">{errors.ID_CATEGORIA}</small>
            )}
          </CCol>

          <CCol xs={12} sm={6} md={4}>
            <label className="form-label small fw-semibold text-muted">Género *</label>
            <CInputGroup>
              <CInputGroupText>
                <CIcon icon={cilTag} />
              </CInputGroupText>
              <CFormSelect
                name="ID_RCOGENERO"
                value={formData.ID_RCOGENERO}
                onChange={handleChange}
                invalid={!!errors.ID_RCOGENERO}
                required
              >
                <option value="">Seleccionar...</option>
                {catalogos.generos.map((gen) => (
                  <option key={gen.value} value={gen.value}>
                    {gen.label}
                  </option>
                ))}
              </CFormSelect>
            </CInputGroup>
            {errors.ID_RCOGENERO && (
              <small className="text-danger d-block mt-1">{errors.ID_RCOGENERO}</small>
            )}
          </CCol>

          <CCol xs={12} sm={12} md={4}>
            <label className="form-label small fw-semibold text-muted">Proveedor *</label>
            <CInputGroup>
              <CInputGroupText>
                <CIcon icon={cilTruck} />
              </CInputGroupText>
              <CFormSelect
                name="ID_PROVEEDOR"
                value={formData.ID_PROVEEDOR}
                onChange={handleChange}
                invalid={!!errors.ID_PROVEEDOR}
                required
              >
                <option value="">Seleccionar...</option>
                {catalogos.proveedores.map((prov) => (
                  <option key={prov.value} value={prov.value}>
                    {prov.label}
                  </option>
                ))}
              </CFormSelect>
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

          <CCol xs={12} md={6}>
            <label className="form-label small fw-semibold text-muted">Autor *</label>
            <CInputGroup>
              <CInputGroupText>
                <CIcon icon={cilUser} />
              </CInputGroupText>
              <CFormSelect
                name="ID_AUTOR"
                value={formData.ID_AUTOR}
                onChange={handleChange}
                invalid={!!errors.ID_AUTOR}
                required
              >
                <option value="">Seleccionar...</option>
                {catalogos.autores.map((aut) => (
                  <option key={aut.value} value={aut.value}>
                    {aut.label}
                  </option>
                ))}
              </CFormSelect>
            </CInputGroup>
            {errors.ID_AUTOR && (
              <small className="text-danger d-block mt-1">{errors.ID_AUTOR}</small>
            )}
          </CCol>

          <CCol xs={12} sm={6} md={4}>
            <label className="form-label small fw-semibold text-muted">Editorial *</label>
            <CInputGroup>
              <CInputGroupText>
                <CIcon icon={cilLibraryBuilding} />
              </CInputGroupText>
              <CFormSelect
                name="ID_EDITORIAL"
                value={formData.ID_EDITORIAL}
                onChange={handleChange}
                invalid={!!errors.ID_EDITORIAL}
                required
              >
                <option value="">Seleccionar...</option>
                {catalogos.editoriales.map((edit) => (
                  <option key={edit.value} value={edit.value}>
                    {edit.label}
                  </option>
                ))}
              </CFormSelect>
            </CInputGroup>
            {errors.ID_EDITORIAL && (
              <small className="text-danger d-block mt-1">{errors.ID_EDITORIAL}</small>
            )}
          </CCol>

          <CCol xs={12} sm={6} md={4}>
            <label className="form-label small fw-semibold text-muted">ISBN:</label>
            <CInputGroup>
              <CInputGroupText>
                <CIcon icon={cilBarcode} />
              </CInputGroupText>
              <CFormInput
                name="ISBN_LIBROS"
                placeholder="978-X-XXXX-XXXX-X"
                value={formData.ISBN_LIBROS}
                onChange={handleChange}
              />
            </CInputGroup>
          </CCol>

          <CCol xs={12} sm={6} md={4}>
            <label className="form-label small fw-semibold text-muted">Volumen:</label>
            <CInputGroup>
              <CInputGroupText>
                <CIcon icon={cilLayers} />
              </CInputGroupText>
              <CFormInput
                name="VOLUMEN_LIBROS"
                placeholder="Ej: Vol. 1, Tomo 2"
                value={formData.VOLUMEN_LIBROS}
                onChange={handleChange}
              />
            </CInputGroup>
          </CCol>

          <CCol xs={12} sm={6} md={4}>
            <label className="form-label small fw-semibold text-muted">Fecha de Edición: *</label>
            <CInputGroup>
              <CInputGroupText>
                <CIcon icon={cilCalendar} />
              </CInputGroupText>
              <CFormInput
                type="date"
                name="FECHAEDICION_LIBROS"
                value={formData.FECHAEDICION_LIBROS}
                onChange={handleChange}
                invalid={!!errors.FECHAEDICION_LIBROS}
                required
              />
            </CInputGroup>
            {errors.FECHAEDICION_LIBROS && (
              <small className="text-danger d-block mt-1">{errors.FECHAEDICION_LIBROS}</small>
            )}
          </CCol>

          <CCol xs={12} className="mt-4">
            <div className="d-flex align-items-center gap-2 pb-2 border-bottom fw-semibold text-secondary">
              <span>MÁS INFORMACIÓN Y FORMATO</span>
            </div>
          </CCol>

          <CCol xs={12} sm={6} md={4}>
            <label className="form-label small fw-semibold text-muted">País:</label>
            <CInputGroup>
              <CInputGroupText>
                <CIcon icon={cilGlobeAlt} />
              </CInputGroupText>
              <CFormInput
                name="PAIS_LIBROS"
                placeholder="Ej: Ecuador, México, España"
                value={formData.PAIS_LIBROS}
                onChange={handleChange}
              />
            </CInputGroup>
          </CCol>

          <CCol xs={12} sm={6} md={4}>
            <label className="form-label small fw-semibold text-muted">Código de Barras:</label>
            <CInputGroup>
              <CInputGroupText>
                <CIcon icon={cilBarcode} />
              </CInputGroupText>
              <CFormInput
                name="CODIGODEBARRAS_LIBROS"
                placeholder="0 000000 000000"
                value={formData.CODIGODEBARRAS_LIBROS}
                onChange={handleChange}
              />
            </CInputGroup>
          </CCol>

          <CCol xs={12} sm={4}>
            <label className="form-label small fw-semibold text-muted">Precio:</label>
            <CInputGroup>
              <CInputGroupText>
                <CIcon icon={cilDollar} />
              </CInputGroupText>
              <CFormInput
                type="number"
                step="0.01"
                name="PRECIO_LIBROS"
                placeholder="0.00"
                value={formData.PRECIO_LIBROS}
                onChange={handleChange}
              />
            </CInputGroup>
          </CCol>

          <CCol xs={12} sm={6} md={4}>
            <label className="form-label small fw-semibold text-muted">Formato *</label>
            <CInputGroup>
              <CInputGroupText>
                <CIcon icon={cilDescription} />
              </CInputGroupText>
              <CFormSelect
                name="ID_FORMATOS"
                value={formData.ID_FORMATOS}
                onChange={handleChange}
                invalid={!!errors.ID_FORMATOS}
                required
              >
                <option value="">Seleccionar...</option>
                {catalogos.formatos.map((form) => (
                  <option key={form.value} value={form.value}>
                    {form.label}
                  </option>
                ))}
              </CFormSelect>
            </CInputGroup>
            {errors.ID_FORMATOS && (
              <small className="text-danger d-block mt-1">{errors.ID_FORMATOS}</small>
            )}
          </CCol>

          <CCol xs={12} sm={6} md={4}>
            <label className="form-label small fw-semibold text-muted">Tipo de Libro *</label>
            <CInputGroup>
              <CInputGroupText>
                <CIcon icon={cilBook} />
              </CInputGroupText>
              <CFormSelect
                name="ID_TIPO"
                value={formData.ID_TIPO}
                onChange={handleChange}
                invalid={!!errors.ID_TIPO}
                required
              >
                <option value="">Seleccionar...</option>
                {catalogos.tipos.map((tip) => (
                  <option key={tip.value} value={tip.value}>
                    {tip.label}
                  </option>
                ))}
              </CFormSelect>
            </CInputGroup>
            {errors.ID_TIPO && (
              <small className="text-danger d-block mt-1">{errors.ID_TIPO}</small>
            )}
          </CCol>

          <CCol xs={12} sm={6} md={4}>
            <label className="form-label small fw-semibold text-muted">Estado del Libro *</label>
            <CInputGroup>
              <CInputGroupText>
                <CIcon icon={cilCheckCircle} />
              </CInputGroupText>
              <CFormSelect
                name="ESTADO_LIBROS"
                value={formData.ESTADO_LIBROS}
                onChange={handleChange}
                invalid={!!errors.ESTADO_LIBROS}
                required
              >
                <option value="1">Activo</option>
                <option value="0">Inactivo</option>
              </CFormSelect>
            </CInputGroup>
            {errors.ESTADO_LIBROS && (
              <small className="text-danger d-block mt-1">{errors.ESTADO_LIBROS}</small>
            )}
          </CCol>

          <CCol xs={12} className="mt-4">
            <div className="d-flex align-items-center gap-2 pb-2 border-bottom fw-semibold text-secondary">
              <span>DETALLES</span>
            </div>
          </CCol>

          <CCol xs={12} sm={6} md={6}>
            <label className="form-label small fw-semibold text-muted">Título Tejuelo:</label>
            <CInputGroup>
              <CInputGroupText>
                <CIcon icon={cilTag} />
              </CInputGroupText>
              <CFormInput
                name="TITULOTEJUELO_LIBROS"
                placeholder="Abreviatura del título"
                value={formData.TITULOTEJUELO_LIBROS}
                onChange={handleChange}
              />
            </CInputGroup>
          </CCol>

          <CCol xs={12} sm={6} md={6}>
            <label className="form-label small fw-semibold text-muted">Autor Tejuelo:</label>
            <CInputGroup>
              <CInputGroupText>
                <CIcon icon={cilUser} />
              </CInputGroupText>
              <CFormInput
                name="AUTORTEJUELO_LIBROS"
                placeholder="Código de autor"
                value={formData.AUTORTEJUELO_LIBROS}
                onChange={handleChange}
              />
            </CInputGroup>
          </CCol>

          <CCol xs={12}>
            <label className="form-label small fw-semibold text-muted">Detalles:</label>
            <CFormTextarea
              name="DESCRIPCION_LIBROS"
              rows={3}
              placeholder="Notas o descripción adicional del libro..."
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
          disabled={loading}
        >
          <CIcon icon={cilExitToApp} className="me-1" />
          Cerrar
        </CButton>
        <CButton
          color='success'
          variant='outline'
          className='hover:text-white'
          onClick={handleSubmit}
          disabled={loading}
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
      </CModalFooter>
    </CModal>
  )
}

export default Registro_bk
