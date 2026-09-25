import React, { useState, useEffect } from 'react'
import {
  CButton,
  CCol,
  CForm,
  CFormInput,
  CFormSelect,
  CFormTextarea,
  CInputGroup,
  CInputGroupText,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CSpinner,
} from '@coreui/react-pro'
import CIcon from '@coreui/icons-react'
import {
  cilCalendar,
  cilContact,
  cilDescription,
  cilEnvelopeClosed,
  cilExitToApp,
  cilGlobeAlt,
  cilHeart,
  cilImage,
  cilLocationPin,
  cilMobile,
  cilPeople,
  cilPhone,
  cilSave,
  cilUser,
  cilPencil,
} from '@coreui/icons'
import { CatalogOption, PersonaRenovacion } from '@/hooks/tab-persona/useRenovaciones'
import { getUserImageUrl } from '@/.env'
import Swal from 'sweetalert2'

export interface ModalVerEditarSolicitudProps {
  visible: boolean
  onClose: () => void
  solicitud: PersonaRenovacion | null
  generos: CatalogOption[]
  tiposIdentificacion: CatalogOption[]
  nacionalidades: CatalogOption[]
  estadosCiviles: CatalogOption[]
  onGuardar: (formData: FormData, idPersona: number | string) => Promise<void> | void
  loading: boolean
}

const ModalVerEditarSolicitud: React.FC<ModalVerEditarSolicitudProps> = ({
  visible,
  onClose,
  solicitud,
  generos,
  tiposIdentificacion,
  nacionalidades,
  estadosCiviles,
  onGuardar,
  loading,
}) => {
  const [form, setForm] = useState<Record<string, any>>({})
  const [fotoFile, setFotoFile] = useState<File | null>(null)
  const [previewFoto, setPreviewFoto] = useState<string | null>(null)
  const [fotoActual, setFotoActual] = useState<string>('')

  useEffect(() => {
    if (solicitud) {
      const raw = (solicitud as any).raw || solicitud || {}
      const fotoRaw =
        solicitud.FOTO_PERSONA ||
        (solicitud as any).fotografia ||
        raw.FOTO_PERSONA ||
        raw.IMAGEN_PERSONA ||
        ''
      setFotoActual(getUserImageUrl(fotoRaw))
      setPreviewFoto(null)
      setFotoFile(null)

      setForm({
        ID_TIPOIDENTIFICACION: solicitud.ID_TIPOIDENTIFICACION ?? '',
        IDENTIFICACION_PERSONA: solicitud.IDENTIFICACION_PERSONA ?? '',
        NOMBRE_PERSONA: solicitud.NOMBRE_PERSONA ?? '',
        APELLIDO_PERSONA: solicitud.APELLIDO_PERSONA ?? '',
        ID_NACIONALIDAD: solicitud.ID_NACIONALIDAD ?? '',
        ID_GENERO: solicitud.ID_GENERO ?? '',
        ID_ESTADOCIVIL: solicitud.ID_ESTADOCIVIL ?? '',
        FECHA_PERSONA: solicitud.FECHA_PERSONA ? String(solicitud.FECHA_PERSONA).split('T')[0] : '',
        EDAD_PERSONA: solicitud.EDAD_PERSONA ?? '',
        DETALLE_PERSONA: solicitud.DETALLE_PERSONA ?? '',
        TELEFONO_PERSONA: solicitud.TELEFONO_PERSONA ?? '',
        CELULAR_PERSONA: solicitud.CELULAR_PERSONA ?? '',
        CORREO_PERSONA: solicitud.CORREO_PERSONA ?? '',
        DIRECCION_PERSONA: solicitud.DIRECCION_PERSONA ?? '',
        DETALLE_INSCRIPCION: solicitud.DETALLE_INSCRIPCION ?? '',
        FECHAINICIO_INSCRIPCION: solicitud.FECHAINICIO_INSCRIPCION
          ? String(solicitud.FECHAINICIO_INSCRIPCION).split('T')[0]
          : '',
        ESTADO_PERSONA: solicitud.ESTADO_PERSONA ?? 0,
        ESTADO_INSCRIPCION: solicitud.ESTADO_INSCRIPCION ?? 0,
        ESTADOINSCRIPCION_PERSONA: solicitud.ESTADOINSCRIPCION_PERSONA ?? 'Activo',
      })
    }
  }, [solicitud])

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png']
      if (!allowedTypes.includes(file.type)) {
        Swal.fire({
          icon: 'error',
          title: 'Archivo no permitido',
          text: 'Solo se permiten imágenes JPEG o PNG.',
        })
        e.target.value = ''
        return
      }
      setFotoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewFoto(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!solicitud?.ID_PERSONA) return

    const formData = new FormData()
    Object.keys(form).forEach((key) => {
      formData.append(key, form[key] ?? '')
    })
    if (fotoFile) {
      formData.append('FOTO_PERSONA', fotoFile)
    }

    onGuardar(formData, solicitud.ID_PERSONA)
  }

  return (
    <CModal
      size="xl"
      visible={visible}
      onClose={onClose}
      aria-labelledby="ModalVerEditarSolicitudLabel"
      scrollable
      backdrop="static"
    >
      <CModalHeader closeButton className="bg-body">
        <CModalTitle id="ModalVerEditarSolicitudLabel" className="d-flex align-items-center gap-2 fs-5 fw-bold">
          <CIcon icon={cilPencil} size="lg" />
          <span>Información y Edición del Usuario</span>
        </CModalTitle>
      </CModalHeader>

      <CModalBody className="px-3 px-md-4 py-3">
        <CForm id="formVerEditarSolicitud" onSubmit={handleSubmit} noValidate className="row g-3">
          <CCol xs={12} className="mt-2">
            <div className="d-flex align-items-center gap-2 pb-2 border-bottom fw-bold text-secondary">
              <CIcon icon={cilUser} />
              <span>DATOS PERSONALES DEL USUARIO</span>
            </div>
          </CCol>

          <CCol xs={12} sm={6} md={4}>
            <label className="form-label small fw-semibold text-muted">
              Tipo de Identificación
            </label>
            <CInputGroup>
              <CInputGroupText>
                <CIcon icon={cilContact} />
              </CInputGroupText>
              <CFormSelect
                name="ID_TIPOIDENTIFICACION"
                value={String(form.ID_TIPOIDENTIFICACION || '')}
                onChange={(e) => handleChange('ID_TIPOIDENTIFICACION', e.target.value)}
              >
                <option value="">Seleccione tipo...</option>
                {tiposIdentificacion.map((tipo: any) => (
                  <option key={tipo.value ?? tipo.id} value={tipo.value ?? tipo.id}>
                    {tipo.label ?? tipo.nombre}
                  </option>
                ))}
              </CFormSelect>
            </CInputGroup>
          </CCol>

          <CCol xs={12} sm={6} md={4}>
            <div className="d-flex justify-content-between align-items-center mb-1">
              <label className="form-label small fw-semibold text-muted mb-0">
                Nº de Identificación
              </label>
            </div>
            <CInputGroup>
              <CInputGroupText>
                <CIcon icon={cilContact} />
              </CInputGroupText>
              <CFormInput
                type="text"
                inputMode="numeric"
                maxLength={110}
                name="IDENTIFICACION_PERSONA"
                placeholder="Ej: 1725608090"
                value={form.IDENTIFICACION_PERSONA || ''}
                onChange={(e) => handleChange('IDENTIFICACION_PERSONA', e.target.value)}
                required
              />
            </CInputGroup>
          </CCol>

          <CCol xs={12} sm={6} md={4}>
            <label className="form-label small fw-semibold text-muted">
              Fecha de Nacimiento
            </label>
            <CInputGroup>
              <CInputGroupText>
                <CIcon icon={cilCalendar} />
              </CInputGroupText>
              <CFormInput
                type="date"
                name="FECHA_PERSONA"
                max={new Date().toISOString().split('T')[0]}
                value={form.FECHA_PERSONA || ''}
                onChange={(e) => handleChange('FECHA_PERSONA', e.target.value)}
              />
            </CInputGroup>
          </CCol>

          <CCol xs={12} md={6}>
            <label className="form-label small fw-semibold text-muted">
              Nombres
            </label>
            <CInputGroup>
              <CInputGroupText>
                <CIcon icon={cilUser} />
              </CInputGroupText>
              <CFormInput
                type="text"
                name="NOMBRE_PERSONA"
                placeholder="Ej: Juan Carlos"
                value={form.NOMBRE_PERSONA || ''}
                onChange={(e) => handleChange('NOMBRE_PERSONA', e.target.value)}
                required
              />
            </CInputGroup>
          </CCol>

          <CCol xs={12} md={6}>
            <label className="form-label small fw-semibold text-muted">
              Apellidos
            </label>
            <CInputGroup>
              <CInputGroupText>
                <CIcon icon={cilUser} />
              </CInputGroupText>
              <CFormInput
                type="text"
                name="APELLIDO_PERSONA"
                placeholder="Ej: Pérez Gómez"
                value={form.APELLIDO_PERSONA || ''}
                onChange={(e) => handleChange('APELLIDO_PERSONA', e.target.value)}
                required
              />
            </CInputGroup>
          </CCol>

          <CCol xs={12} sm={6} md={4}>
            <label className="form-label small fw-semibold text-muted">
              Nacionalidad
            </label>
            <CInputGroup>
              <CInputGroupText>
                <CIcon icon={cilGlobeAlt} />
              </CInputGroupText>
              <CFormSelect
                name="ID_NACIONALIDAD"
                value={String(form.ID_NACIONALIDAD || '')}
                onChange={(e) => handleChange('ID_NACIONALIDAD', e.target.value)}
              >
                <option value="">Seleccione nacionalidad...</option>
                {nacionalidades.map((nac: any) => (
                  <option key={nac.value ?? nac.id} value={nac.value ?? nac.id}>
                    {nac.label ?? nac.nombre}
                  </option>
                ))}
              </CFormSelect>
            </CInputGroup>
          </CCol>

          <CCol xs={12} sm={6} md={4}>
            <label className="form-label small fw-semibold text-muted">
              Género
            </label>
            <CInputGroup>
              <CInputGroupText>
                <CIcon icon={cilPeople} />
              </CInputGroupText>
              <CFormSelect
                name="ID_GENERO"
                value={String(form.ID_GENERO || '')}
                onChange={(e) => handleChange('ID_GENERO', e.target.value)}
              >
                <option value="">Seleccione género...</option>
                {generos.map((gen: any) => (
                  <option key={gen.value ?? gen.id} value={gen.value ?? gen.id}>
                    {gen.label ?? gen.nombre}
                  </option>
                ))}
              </CFormSelect>
            </CInputGroup>
          </CCol>

          <CCol xs={12} sm={6} md={4}>
            <label className="form-label small fw-semibold text-muted">
              Estado Civil
            </label>
            <CInputGroup>
              <CInputGroupText>
                <CIcon icon={cilHeart} />
              </CInputGroupText>
              <CFormSelect
                name="ID_ESTADOCIVIL"
                value={String(form.ID_ESTADOCIVIL || '')}
                onChange={(e) => handleChange('ID_ESTADOCIVIL', e.target.value)}
              >
                <option value="">Seleccione estado civil...</option>
                {estadosCiviles.map((est: any) => (
                  <option key={est.value ?? est.id} value={est.value ?? est.id}>
                    {est.label ?? est.nombre}
                  </option>
                ))}
              </CFormSelect>
            </CInputGroup>
          </CCol>

          <CCol xs={12} sm={12}>
            <label className="form-label small fw-semibold text-muted">Fotografía del Usuario:</label>
            <CInputGroup>
              <CInputGroupText>
                <CIcon icon={cilImage} />
              </CInputGroupText>
              <CFormInput
                type="file"
                name="FOTO_PERSONA"
                accept="image/*"
                onChange={handleFileChange}
              />
            </CInputGroup>
            {(previewFoto || fotoActual) && (
              <div className="mt-2 d-flex align-items-center gap-3 p-2 bg-body rounded border shadow-sm">
                <img
                  src={previewFoto || fotoActual}
                  alt="Foto del usuario"
                  className="rounded-circle border border-2 border-primary shadow-sm object-fit-cover"
                  style={{ width: '75px', height: '75px' }}
                  onError={(e: any) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
                <div>
                  <span className="fw-semibold d-block small text-body">
                    {previewFoto ? 'Nueva fotografía seleccionada' : 'Fotografía actual'}
                  </span>
                  <span className="text-muted small">
                    {previewFoto
                      ? 'La fotografía será actualizada al guardar.'
                      : 'Fotografía registrada actualmente.'}
                  </span>
                </div>
              </div>
            )}
          </CCol>

          <CCol xs={12}>
            <CFormTextarea
              name="DETALLE_PERSONA"
              label="Descripción:"
              placeholder="Ingrese información adicional del usuario..."
              rows={3}
              value={form.DETALLE_PERSONA || ''}
              onChange={(e) => handleChange('DETALLE_PERSONA', e.target.value)}
            />
          </CCol>

          <CCol xs={12} className="mt-4">
            <div className="d-flex align-items-center gap-2 pb-2 border-bottom fw-bold text-secondary">
              <CIcon icon={cilLocationPin} />
              <span>DATOS DE CONTACTO Y UBICACIÓN</span>
            </div>
          </CCol>

          <CCol xs={12} md={4}>
            <label className="form-label small fw-semibold text-muted">
              Correo Electrónico
            </label>
            <CInputGroup>
              <CInputGroupText>
                <CIcon icon={cilEnvelopeClosed} />
              </CInputGroupText>
              <CFormInput
                type="email"
                name="CORREO_PERSONA"
                placeholder="Ej: usuario@correo.com"
                value={form.CORREO_PERSONA || ''}
                onChange={(e) => handleChange('CORREO_PERSONA', e.target.value)}
                required
              />
            </CInputGroup>
          </CCol>

          <CCol xs={12} sm={6} md={4}>
            <div className="d-flex justify-content-between align-items-center mb-1">
              <label className="form-label small fw-semibold text-muted mb-0">Teléfono fijo:</label>
            </div>
            <CInputGroup>
              <CInputGroupText>
                <CIcon icon={cilPhone} />
              </CInputGroupText>
              <CFormInput
                type="tel"
                inputMode="numeric"
                maxLength={10}
                name="TELEFONO_PERSONA"
                placeholder="Ej: 0223456780"
                value={form.TELEFONO_PERSONA || ''}
                onChange={(e) => handleChange('TELEFONO_PERSONA', e.target.value)}
              />
            </CInputGroup>
          </CCol>

          <CCol xs={12} sm={6} md={4}>
            <div className="d-flex justify-content-between align-items-center mb-1">
              <label className="form-label small fw-semibold text-muted mb-0">
                Teléfono Celular
              </label>
            </div>
            <CInputGroup>
              <CInputGroupText>
                <CIcon icon={cilMobile} />
              </CInputGroupText>
              <CFormInput
                type="tel"
                inputMode="numeric"
                maxLength={10}
                name="CELULAR_PERSONA"
                placeholder="Ej: 0991234567"
                value={form.CELULAR_PERSONA || ''}
                onChange={(e) => handleChange('CELULAR_PERSONA', e.target.value)}
              />
            </CInputGroup>
          </CCol>

          <CCol xs={12}>
            <label className="form-label small fw-semibold text-muted">
              Dirección Domiciliaria
            </label>
            <CInputGroup>
              <CInputGroupText>
                <CIcon icon={cilLocationPin} />
              </CInputGroupText>
              <CFormInput
                type="text"
                name="DIRECCION_PERSONA"
                placeholder="Ej: Av. Maldonado y El Recreo, Quito"
                value={form.DIRECCION_PERSONA || ''}
                onChange={(e) => handleChange('DIRECCION_PERSONA', e.target.value)}
                required
              />
            </CInputGroup>
          </CCol>

          <CCol xs={12} className="mt-4">
            <div className="d-flex align-items-center gap-2 pb-2 border-bottom fw-bold text-secondary">
              <CIcon icon={cilDescription} />
              <span>INFORMACIÓN ADICIONAL</span>
            </div>
          </CCol>

          <CCol xs={12}>
            <CFormTextarea
              name="DETALLE_INSCRIPCION"
              label="Detalle de Inscripción:"
              placeholder="Ingrese información adicional sobre la inscripción..."
              rows={3}
              value={form.DETALLE_INSCRIPCION || ''}
              onChange={(e) => handleChange('DETALLE_INSCRIPCION', e.target.value)}
            />
          </CCol>

          <CCol xs={12}>
            <CFormSelect
              name="ESTADOINSCRIPCION_PERSONA"
              label="Estado de Inscripción:"
              value={
                typeof form.ESTADOINSCRIPCION_PERSONA === 'boolean'
                  ? form.ESTADOINSCRIPCION_PERSONA
                    ? 'Activo'
                    : 'Inactivo'
                  : String(form.ESTADOINSCRIPCION_PERSONA ?? 'Activo')
              }
              onChange={(e) => handleChange('ESTADOINSCRIPCION_PERSONA', e.target.value)}
            >
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </CFormSelect>
          </CCol>
        </CForm>
      </CModalBody>

      <CModalFooter className="bg-body d-flex justify-content-end gap-2">
        <CButton
          color="danger"
          variant="outline"
          className='hover:text-white'
          disabled={loading}
          onClick={onClose}
        >
          <CIcon icon={cilExitToApp} className="me-1" />
          Cancelar
        </CButton>
        <CButton
          color="success"
          variant='outline'
          type="submit"
          form="formVerEditarSolicitud"
          disabled={loading}
          className="d-flex align-items-center gap-1 shadow-sm hover:text-white"
        >
          {loading ? (
            <>
              <CSpinner size="sm" className="me-1" />
              Guardando...
            </>
          ) : (
            <>
              <CIcon icon={cilSave} className="me-1" />
              <span>Guardar Cambios</span>
            </>
          )}
        </CButton>
      </CModalFooter>
    </CModal>
  )
}

export default ModalVerEditarSolicitud
