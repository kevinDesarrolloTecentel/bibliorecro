import React, { useState, useEffect, useMemo } from 'react'
import Swal from 'sweetalert2'
import { motion, AnimatePresence } from 'framer-motion'
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
import { cilCheckCircle, cilLockLocked, cilInfo } from '@coreui/icons'
import { Accion, Pantalla } from '@/models/adm/permiso.model'
import { useDetalleAcciones } from '@/hooks/admin-roles/useDetalleAcciones'
import { ModalDetalleAccion } from './ModalDetalleAccion'

interface ModalAccionesPantallaProps {
  visible: boolean
  onClose: () => void
  pantalla: Pantalla | null
  roles: any[]
  allAcciones: Accion[]
  isPermisoAsignado?: (rolId: number, idPermiso: number) => boolean
  isAccionAsignada: (rolId: number, idAccion: number) => boolean
  canModificarAcciones?: boolean
  canVerAccionesPorRol?: boolean
  onToggleAccion: (
    rolId: number,
    nombreRol: string,
    accion: Accion,
    pantalla: Pantalla,
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
  canModificarAcciones = false,
  canVerAccionesPorRol = false,
}) => {
  const [selectedRolId, setSelectedRolId] = useState<number | null>(null)

  // Hook centralizado para detalles y descripciones de acciones
  const {
    accionSeleccionada,
    modalDetalleOpen,
    verDetalleAccion,
    cerrarDetalleAccion,
  } = useDetalleAcciones()

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
  const currentRolNivel = currentRol ? Number(currentRol.NIVEL_ROL ?? currentRol.nivel ?? 1) : 1
  const isRolNivel1 = currentRolNivel === 1 || Boolean(currentRol?.ES_ADMINISTRADOR)

  // Filtrar acciones que pertenecen a la pantalla seleccionada
  const accionesPantalla = useMemo(() => {
    if (!pantalla) return []
    const filtradas = allAcciones.filter(
      (a: any) => Number(a.ID_PERMISO) === Number(pantalla.ID_PERMISO),
    )
    const base = filtradas.length > 0 ? filtradas : (pantalla.ACCIONES || [])
    return base.map((acc) => {
      const dePantalla = (pantalla.ACCIONES || []).find(
        (pa) => Number(pa.ID_ACCION ?? (pa as any).id) === Number(acc.ID_ACCION ?? (acc as any).id),
      )
      return {
        ...acc,
        DESCRIPCION_ACCION: acc.DESCRIPCION_ACCION || dePantalla?.DESCRIPCION_ACCION || '',
      }
    })
  }, [allAcciones, pantalla])

  if (!pantalla) return null

  return (
    <>
      <CModal visible={visible} onClose={onClose} size="lg" alignment="center">
      <CModalHeader className="border-bottom py-3 px-4 bg-body-tertiary">
        <CModalTitle className="d-flex align-items-center gap-2 text-body fs-5 w-100">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="d-flex align-items-center gap-3 flex-wrap"
          >

            <div>
              <span className="fw-bold d-block text-body">
                {pantalla.NOMBRE_PERMISO}
              </span>
              <div className="d-flex align-items-center gap-2 mt-1">
                <CBadge color="primary" className="font-monospace px-2 py-0.5" style={{ fontSize: '0.75rem' }}>
                  {pantalla.PATH_PERMISO}
                </CBadge>
              </div>
            </div>
          </motion.div>
        </CModalTitle>
      </CModalHeader>

      <CModalBody className="p-4">
        {canVerAccionesPorRol && (
          <div className="mb-4">
            <style>{`
              .modal-roles-grid {
                display: grid;
                grid-template-columns: repeat(3, minmax(0, 1fr));
                gap: 0.5rem;
              }
              @media (max-width: 576px) {
                .modal-roles-grid {
                  grid-template-columns: 1fr;
                }
              }
            `}</style>
            <label className="form-label text-uppercase text-secondary fw-bold small mb-2" style={{ letterSpacing: '0.5px' }}>
              Selecciona el Rol a configurar:
            </label>
            <div className="modal-roles-grid">
              {roles.map((rol: any) => {
                const rId = Number(rol.ID_ROL ?? rol.id)
                const rNombre = String(rol.NOMBRE_ROL ?? rol.nombre ?? `Rol ${rId}`)
                const rNivel = Number(rol.NIVEL_ROL ?? rol.nivel ?? 1)
                const isSelected = rId === selectedRolId
                // Conteo de acciones activas para este rol en esta pantalla
                const rActiveCount = accionesPantalla.filter((a) =>
                  isAccionAsignada(rId, Number(a.ID_ACCION ?? (a as any).id)),
                ).length

                return (
                  <motion.button
                    key={rId}
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`btn d-flex align-items-center justify-content-between gap-1 px-2.5 py-2 rounded-3 text-start w-100 transition-all ${isSelected
                        ? 'btn-primary text-white shadow-sm'
                        : 'btn-outline-secondary bg-body text-body'
                      }`}
                    style={{
                      fontSize: '0.82rem',
                      fontWeight: isSelected ? 600 : 500,
                    }}
                    onClick={() => setSelectedRolId(rId)}
                  >
                    <span className="text-truncate me-1" title={rNombre}>{rNombre}</span>
                    <div className="d-flex align-items-center gap-1 flex-shrink-0">
                      <span
                        className={`badge rounded-pill ${isSelected ? 'bg-white text-primary' : 'bg-body-secondary text-body-secondary border'
                          }`}
                        style={{ fontSize: '0.68rem', padding: '0.25em 0.45em' }}
                      >
                        Nivel {rNivel}
                      </span>
                      {accionesPantalla.length > 0 && (
                        <span
                          className={`badge rounded-pill ${isSelected ? 'bg-info text-white' : 'bg-secondary text-white'
                            }`}
                          style={{ fontSize: '0.68rem', padding: '0.25em 0.45em' }}
                        >
                          {rActiveCount}/{accionesPantalla.length}
                        </span>
                      )}
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </div>
        )}

        <div>
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h6 className="mb-0 fw-bold text-body">
              Acciones
            </h6>
          </div>

          <AnimatePresence mode="wait">
            {accionesPantalla.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-5 text-muted fw-semibold border rounded-3 bg-light-subtle"
              >
                <CIcon icon={cilLockLocked} size="xl" className="text-secondary opacity-50 mb-2 d-block mx-auto" />
                Sin acciones registradas para esta pantalla
              </motion.div>
            ) : (
              <motion.div
                key={canVerAccionesPorRol ? (selectedRolId ?? 'roles-actions') : 'acciones-catalogo'}
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.05,
                    },
                  },
                }}
                className="d-flex flex-column gap-2.5"
              >
                {accionesPantalla.map((accion) => {
                  const accionId = Number(accion.ID_ACCION ?? (accion as any).id)
                  const isActiva = isAccionAsignada(currentRolId, accionId)

                  return (
                    <motion.div
                      key={accionId}
                      variants={{
                        hidden: { opacity: 0, y: 12 },
                        visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
                      }}
                      whileHover={{ scale: 1.01, boxShadow: '0 6px 16px rgba(0,0,0,0.06)' }}
                      className={`p-3 rounded-3 border bg-body d-flex align-items-center justify-content-between gap-3 shadow-sm transition-all ${
                        canVerAccionesPorRol && isActiva ? 'border-primary-subtle' : ''
                      }`}
                      style={{
                        borderLeft: canVerAccionesPorRol
                          ? isActiva
                            ? '4px solid #10b981'
                            : '4px solid #cbd5e1'
                          : '4px solid #6366f1',
                      }}
                    >
                      <div
                        className="d-flex align-items-center gap-2.5 flex-grow-1"
                        style={{ cursor: 'pointer' }}
                        onClick={() => verDetalleAccion(accion, pantalla, accionesPantalla)}
                        title="Haz clic para ver la descripción y detalle de esta acción"
                      >
                        <div
                          className={`rounded-circle d-flex align-items-center justify-content-center ${
                            canVerAccionesPorRol
                              ? isActiva
                                ? 'text-success bg-success-subtle'
                                : 'text-secondary bg-body-secondary'
                              : 'text-primary bg-primary-subtle'
                          }`}
                          style={{ width: '32px', height: '32px' }}
                        >
                          <CIcon
                            icon={
                              canVerAccionesPorRol
                                ? isActiva
                                  ? cilCheckCircle
                                  : cilLockLocked
                                : cilInfo
                            }
                            size="sm"
                          />
                        </div>
                        <div>
                          <div className="d-flex align-items-center gap-1.5">
                            <span className="fw-semibold text-body fs-6 d-block">
                              {accion.NOMBRE_ACCION}
                            </span>
                            <CIcon icon={cilInfo} size="sm" className="text-primary opacity-50" title="Ver descripción" />
                          </div>
                          {canVerAccionesPorRol && (
                            <span className="small text-secondary" style={{ fontSize: '0.78rem' }}>
                              {isActiva ? 'Acción habilitada para este rol' : 'Acción restringida'}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Solo mostrar Switch si canVerAccionesPorRol está habilitado */}
                      {canVerAccionesPorRol && (
                        <div
                          onClick={(e) => {
                            e.stopPropagation()
                            if (!canModificarAcciones) {
                              return
                            }
                            if (isActiva && isRolNivel1) {
                              Swal.fire({
                                icon: 'warning',
                                title: 'Acción protegida',
                                text: `No se pueden deshabilitar acciones para el rol de Nivel 1 (${currentRolNombre}).`,
                                confirmButtonColor: '#044c8c',
                                confirmButtonText: 'Entendido',
                              })
                              return
                            }
                          }}
                          style={{
                            cursor: !canModificarAcciones ? 'not-allowed' : 'pointer',
                          }}
                        >
                          <CFormSwitch
                            id={`switch-accion-${currentRolId}-${accionId}`}
                            checked={isActiva}
                            size="lg"
                            disabled={!canModificarAcciones}
                            onChange={() => {
                              if (!canModificarAcciones) return
                              if (isActiva && isRolNivel1) {
                                Swal.fire({
                                  icon: 'warning',
                                  title: 'Acción protegida',
                                  text: `No se pueden deshabilitar acciones para el rol de Nivel 1 (${currentRolNombre}).`,
                                  confirmButtonColor: '#044c8c',
                                  confirmButtonText: 'Entendido',
                                })
                                return
                              }
                              onToggleAccion(currentRolId, currentRolNombre, accion, pantalla)
                            }}
                            style={{
                              cursor: !canModificarAcciones ? 'not-allowed' : 'pointer',
                              transform: 'scale(1.2)',
                            }}
                            title={
                              !canModificarAcciones
                                ? 'Solo lectura: no tienes permiso para modificar acciones'
                                : isActiva
                                  ? `Deshabilitar ${accion.NOMBRE_ACCION}`
                                  : `Habilitar ${accion.NOMBRE_ACCION}`
                            }
                          />
                        </div>
                      )}
                    </motion.div>
                  )
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CModalBody>

      <CModalFooter className="border-top py-2 px-4 bg-body-tertiary">
        <CButton size="sm" color="secondary" className="hover:text-white shadow-sm" variant="ghost" onClick={onClose}>
          Cerrar
        </CButton>
      </CModalFooter>
    </CModal>

    {/* Modal independiente de Detalle / Descripción de la Acción */}
    <ModalDetalleAccion
      visible={modalDetalleOpen}
      onClose={cerrarDetalleAccion}
      accion={accionSeleccionada}
      pantalla={pantalla}
    />
  </>
  )
}

export default ModalAccionesPantalla
