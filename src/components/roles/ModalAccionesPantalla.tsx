import React, { useState, useEffect, useMemo } from 'react'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CBadge,
  CFormSwitch,
} from '@coreui/react-pro'
import CIcon from '@coreui/icons-react'
import {
  cilShieldAlt,
  cilOptions,
} from '@coreui/icons'
import { Accion, Pantalla } from '@/models/adm/permiso.model'

interface ModalAccionesPantallaProps {
  visible: boolean
  onClose: () => void
  pantalla: Pantalla | null
  roles: any[]
  allAcciones: Accion[]
  isPermisoAsignado?: (rolId: number, idPermiso: number) => boolean
  isAccionAsignada: (rolId: number, idAccion: number) => boolean
  onToggleAccion: (
    rolId: number,
    nombreRol: string,
    accion: Accion,
    pantalla: Pantalla,
  ) => Promise<void>
  onToggleTodasAcciones?: (
    rolId: number,
    nombreRol: string,
    pantalla: Pantalla,
    habilitarTodas: boolean,
  ) => Promise<void>
}

export const ModalAccionesPantalla: React.FC<ModalAccionesPantallaProps> = ({
  visible,
  onClose,
  pantalla,
  roles = [],
  allAcciones = [],
  isAccionAsignada,
  onToggleAccion,
}) => {
  const [selectedRolId, setSelectedRolId] = useState<number | null>(null)

  // Seleccionar automáticamente el primer rol disponible si no hay uno seleccionado
  useEffect(() => {
    if (roles && roles.length > 0) {
      if (selectedRolId === null || !roles.some((r) => Number(r.ID_ROL ?? r.id) === selectedRolId)) {
        setSelectedRolId(Number(roles[0].ID_ROL ?? roles[0].id))
      }
    }
  }, [roles, selectedRolId])

  const currentRol = useMemo(() => {
    if (!roles || roles.length === 0) return null
    return (
      roles.find((r: any) => Number(r.ID_ROL ?? r.id) === selectedRolId) || roles[0]
    )
  }, [roles, selectedRolId])

  const currentRolId = currentRol ? Number(currentRol.ID_ROL ?? currentRol.id) : 0
  const currentRolNombre = currentRol
    ? String(currentRol.NOMBRE_ROL ?? currentRol.nombre ?? `Rol ${currentRolId}`)
    : ''

  // Filtrar acciones que pertenecen a la pantalla seleccionada
  const accionesPantalla = useMemo(() => {
    if (!pantalla) return []
    return allAcciones.filter(
      (a: any) => Number(a.ID_PERMISO) === Number(pantalla.ID_PERMISO),
    )
  }, [allAcciones, pantalla])

  if (!pantalla) return null

  const isRolAdmin = Boolean(currentRol?.ES_ADMINISTRADOR || currentRolId === 1)

  return (
    <CModal visible={visible} onClose={onClose} size="lg" alignment="center">
      <CModalHeader className="border-bottom py-3 px-4 bg-light">
        <CModalTitle className="d-flex align-items-center gap-2 text-dark fs-5 w-100">
          <div
            className="rounded-3 p-2 d-flex align-items-center justify-content-center text-white"
            style={{ backgroundColor: '#321fdb', width: '38px', height: '38px' }}
          >
            <CIcon icon={cilOptions} size="lg" />
          </div>
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <span className="fw-bold">{pantalla.NOMBRE_PERMISO}</span>
            <CBadge color="primary" className="font-monospace px-2 py-1" style={{ fontSize: '0.75rem' }}>
              {pantalla.PATH_PERMISO}
            </CBadge>
          </div>
        </CModalTitle>
      </CModalHeader>

      <CModalBody className="p-4">
        <div className="mb-4">
          <label className="form-label text-uppercase text-secondary fw-bold small mb-2" style={{ letterSpacing: '0.5px' }}>
            Selecciona el Rol a configurar:
          </label>
          <div className="d-flex flex-wrap gap-2">
            {roles.map((rol: any) => {
              const rId = Number(rol.ID_ROL ?? rol.id)
              const rNombre = String(rol.NOMBRE_ROL ?? rol.nombre ?? `Rol ${rId}`)
              const rNivel = Number(rol.NIVEL_ROL ?? rol.nivel ?? 1)
              const isSelected = rId === selectedRolId
              const isPillAdmin = Boolean(rol?.ES_ADMINISTRADOR || rId === 1)

              // Conteo de acciones activas para este rol en esta pantalla
              const rActiveCount = isPillAdmin
                ? accionesPantalla.length
                : accionesPantalla.filter((a) =>
                    isAccionAsignada(rId, Number(a.ID_ACCION ?? (a as any).id)),
                  ).length

              return (
                <button
                  key={rId}
                  type="button"
                  className={`btn d-flex align-items-center gap-2 px-3 py-2 rounded-3 transition-all ${
                    isSelected
                      ? 'btn-primary text-white shadow-sm'
                      : 'btn-outline-secondary bg-white text-dark'
                  }`}
                  style={{
                    fontSize: '0.88rem',
                    fontWeight: isSelected ? 600 : 500,
                  }}
                  onClick={() => setSelectedRolId(rId)}
                >
                  <CIcon icon={cilShieldAlt} size="sm" />
                  <span>{rNombre}</span>
                  <span
                    className={`badge rounded-pill ${
                      isSelected ? 'bg-white text-primary' : 'bg-light text-secondary border'
                    }`}
                    style={{ fontSize: '0.7rem' }}
                  >
                    Nivel {rNivel}
                  </span>
                  {accionesPantalla.length > 0 && (
                    <span
                      className={`badge rounded-pill ms-1 ${
                        isSelected ? 'bg-info text-white' : 'bg-secondary text-white'
                      }`}
                      style={{ fontSize: '0.68rem' }}
                    >
                      {rActiveCount}/{accionesPantalla.length}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <h6 className="mb-3 fw-bold text-dark">Acciones disponibles</h6>

          {accionesPantalla.length === 0 ? (
            <div className="text-center py-4 text-muted fw-semibold">
              Sin acciones registradas
            </div>
          ) : (
            <div className="d-flex flex-column gap-2">
              {accionesPantalla.map((accion) => {
                const accionId = Number(accion.ID_ACCION ?? (accion as any).id)
                const isActiva = isRolAdmin || isAccionAsignada(currentRolId, accionId)

                return (
                  <div
                    key={accionId}
                    className="p-3 rounded-3 border bg-white d-flex align-items-center justify-content-between gap-3 shadow-sm"
                  >
                    <span className="fw-semibold text-dark fs-6">
                      {accion.NOMBRE_ACCION}
                    </span>

                    <CFormSwitch
                      id={`switch-accion-${currentRolId}-${accionId}`}
                      checked={isActiva}
                      size="lg"
                      onChange={() =>
                        onToggleAccion(currentRolId, currentRolNombre, accion, pantalla)
                      }
                      style={{ cursor: 'pointer', transform: 'scale(1.15)' }}
                      title={
                        isRolAdmin
                          ? 'El administrador principal tiene acceso completo'
                          : isActiva
                          ? `Deshabilitar ${accion.NOMBRE_ACCION}`
                          : `Habilitar ${accion.NOMBRE_ACCION}`
                      }
                    />
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </CModalBody>

      <CModalFooter className="border-top py-2 px-4 bg-light">
        <CButton color="secondary" variant="ghost" onClick={onClose} className="px-4 fw-semibold">
          Cerrar
        </CButton>
      </CModalFooter>
    </CModal>
  )
}

export default ModalAccionesPantalla
