import React, { useState, useEffect } from 'react'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CForm,
  CFormLabel,
  CFormTextarea,
  CRow,
  CCol,
  CSpinner,
  CAlert,
  CDateRangePicker,
} from '@coreui/react-pro'
import CIcon from '@coreui/icons-react'
import { cilReportSlash } from '@coreui/icons'
import Swal from 'sweetalert2'
import { CambioEstadoSancion } from '@/Service/rco/Prestamos'
import { aFechaLocal, parseDatePickerValue, formatFecha } from '@/utils/dateUtils'
import { usePermissions } from '@/context/PermissionsContext'

interface ModalDevolverSancionProps {
  visible: boolean
  setVisible: (v: boolean) => void
  item: any | null
  onSuccess: () => void
  canGuardarDevolverSancion?: boolean
}

const getTodayString = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const getFechaFinPorDias = (dias: number) => {
  const now = new Date()
  now.setDate(now.getDate() + dias)
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const getTodayAtMidnight = () => {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return now
}

export const ModalDevolverSancion: React.FC<ModalDevolverSancionProps> = ({
  visible,
  setVisible,
  item,
  onSuccess,
  canGuardarDevolverSancion = true,
}) => {
  const { verificarAccionEnServidor } = usePermissions()
  const [fechaInicio, setFechaInicio] = useState(getTodayString())
  const [fechaFin, setFechaFin] = useState(getFechaFinPorDias(7))
  const [detalle, setDetalle] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const isRangoInvalido = Boolean(
    fechaInicio && fechaFin && new Date(fechaFin) < new Date(fechaInicio)
  )


  useEffect(() => {
    if (visible) {
      setFechaInicio(getTodayString())
      setFechaFin(getFechaFinPorDias(7))
      setDetalle('')
      setErrorMsg('')
    }
  }, [visible])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (!canGuardarDevolverSancion) {
      setErrorMsg('No cuenta con permisos para guardar la devolución con sanción.')
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para registrar devoluciones con sanción.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    const tienePermiso = await verificarAccionEnServidor('btn_guardar_devolver_sancion')
    if (!tienePermiso) {
      setErrorMsg('No cuenta con permisos para guardar la devolución con sanción.')
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para registrar devoluciones con sanción.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    if (!item) return

    const id = item.id ?? item.ID_PRESTAMO
    if (!id) {
      setErrorMsg('No se pudo identificar el préstamo.')
      return
    }

    // Asegurar que la fecha de inicio siempre sea hoy para que la sanción entre en vigencia de inmediato
    const hoyActual = getTodayString()

    if (!fechaFin) {
      setErrorMsg('Debe seleccionar la fecha de fin de la sanción.')
      return
    }

    if (new Date(fechaFin) < new Date(hoyActual)) {
      setErrorMsg('La fecha de fin no puede ser anterior a la fecha de hoy.')
      return
    }

    if (!detalle.trim() || detalle.trim().length < 4) {
      setErrorMsg('Debe ingresar un motivo o detalle de la sanción (mínimo 4 caracteres).')
      return
    }

    setGuardando(true)
    try {
      const payload = {
        nuevo_estado: 0,
        ID_PRESTAMO: id,
        ID_LIBROS: item.ID_LIBROS ?? item.raw?.ID_LIBROS,
        ID_INSCRIPCION: item.ID_INSCRIPCION ?? item.id_inscripcion ?? item.raw?.ID_INSCRIPCION,
        id_inscripcion: item.ID_INSCRIPCION ?? item.id_inscripcion ?? item.raw?.ID_INSCRIPCION,
        ID_PERSONA: item.ID_PERSONA ?? item.id_persona ?? item.raw?.ID_PERSONA,
        id_persona: item.ID_PERSONA ?? item.id_persona ?? item.raw?.ID_PERSONA,
        FECHAINICIO_SANCION: hoyActual,
        FECHAFIN_SANCION: fechaFin,
        DETALLE_SANCION: detalle.trim(),
        fecha_inicio: hoyActual,
        fecha_fin: fechaFin,
        detalle: detalle.trim(),
        motivo: detalle.trim(),
        DETALLE_PRESTAMO: `Devuelto con sanción: ${detalle.trim()}`,
        detalle_prestamo: `Devuelto con sanción: ${detalle.trim()}`,
        ESTADO_SANCION: '1',
      }

      await CambioEstadoSancion(id, payload)

      Swal.fire({
        icon: 'success',
        title: '¡Sanción registrada!',
        text: 'La devolución y sanción fueron registradas con éxito.',
        timer: 1800,
        showConfirmButton: false,
      })

      setVisible(false)
      onSuccess()
    } catch (error: any) {
      console.error('Error al registrar sanción:', error)
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        'Ocurrió un error al registrar la devolución con sanción.'
      setErrorMsg(msg)
    } finally {
      setGuardando(false)
    }
  }

  if (!item) return null

  return (
    <CModal size="lg" visible={visible} onClose={() => !guardando && setVisible(false)} alignment="center">
      <CModalHeader closeButton className="border-bottom bg-warning bg-opacity-10 py-3">
        <CModalTitle className="d-flex align-items-center gap-2 text-warning fs-5 fw-bold">
          <CIcon icon={cilReportSlash} />
          <span>Registrar Devolución con Sanción</span>
        </CModalTitle>
      </CModalHeader>

      <CForm onSubmit={handleSubmit}>
        <CModalBody className="p-4">
          {errorMsg && (
            <CAlert color="warning" dismissible onClose={() => setErrorMsg('')} className="mb-3 py-2 small">
              {errorMsg}
            </CAlert>
          )}

          <CRow className="g-3">
            <CCol xs={12}>
              <div className="d-flex justify-content-between align-items-center mb-1">
                <CFormLabel className="fw-semibold small mb-0">
                  Rango de Fechas de la Sanción <span className="text-danger">*</span>
                </CFormLabel>
                <span className="text-muted small">
                  Inicia hoy: <strong>{formatFecha(fechaInicio)}</strong>
                </span>
              </div>

              {/* Calendario de rangos CoreUI */}
              <CDateRangePicker
                locale="es-ES"
                inputReadOnly
                invalid={isRangoInvalido}
                feedbackInvalid="La fecha de fin no puede ser anterior a la fecha de inicio."
                startDate={aFechaLocal(fechaInicio)}
                endDate={aFechaLocal(fechaFin)}
                minDate={getTodayAtMidnight()}
                onStartDateChange={(val) => {
                  const parsed = parseDatePickerValue(val ?? null)
                  if (parsed && parsed > getTodayString()) {
                    // Al seleccionar una fecha posterior en el calendario,
                    // se toma como la fecha de fin de la sanción, manteniendo inicio en hoy
                    setFechaFin(parsed)
                  }
                  setFechaInicio(getTodayString())
                  setErrorMsg('')
                }}
                onEndDateChange={(val) => {
                  const parsed = parseDatePickerValue(val ?? null)
                  if (parsed) {
                    if (parsed < getTodayString()) {
                      setFechaFin(getTodayString())
                    } else {
                      setFechaFin(parsed)
                    }
                  }
                  setFechaInicio(getTodayString())
                  setErrorMsg('')
                }}
                placeholder={['Fecha de inicio (Hoy)', 'Fecha de fin']}
                disabled={guardando}
                calendars={2}
                cancelButton="Cancelar"
                confirmButton="Aceptar"
              />
            </CCol>

            <CCol xs={12}>
              <div className="d-flex justify-content-between align-items-center mb-1">
                <CFormLabel className="fw-semibold small mb-0">
                  Detalle de la Sanción <span className="text-danger">*</span>
                </CFormLabel>
                <span className="small text-muted font-monospace" style={{ fontSize: '0.72rem' }}>
                  {detalle.length}/255
                </span>
              </div>
              <CFormTextarea
                rows={3}
                maxLength={255}
                placeholder="Especifique el motivo de la sanción (máx. 255 caracteres)"
                value={detalle}
                onChange={(e) => setDetalle(e.target.value)}
                disabled={guardando}
                required
              />
            </CCol>
          </CRow>
        </CModalBody>

        <CModalFooter className="border-top py-2 px-4 d-flex justify-content-end gap-2 bg-body">
          <CButton
            color="secondary"
            variant="outline"
            size="sm"
            onClick={() => setVisible(false)}
            disabled={guardando}
          >
            Cancelar
          </CButton>
          {canGuardarDevolverSancion && (
            <CButton
              color="danger"
              size="sm"
              type="submit"
              disabled={guardando || isRangoInvalido || !fechaInicio || !fechaFin || detalle.trim().length < 4}
              variant="outline" className="hover:text-white shadow-sm"            >
              {guardando ? (
                <>
                  <CSpinner size="sm" />
                  <span>Registrando...</span>
                </>
              ) : (
                <>
                  <CIcon icon={cilReportSlash} />
                  <span>Registrar Sanción y Devolución</span>
                </>
              )}
            </CButton>
          )}
        </CModalFooter>
      </CForm>
    </CModal>
  )
}

export default ModalDevolverSancion
