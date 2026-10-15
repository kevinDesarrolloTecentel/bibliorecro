import { useState, useRef, useEffect } from 'react'
import {
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CFormCheck,
  CSpinner,
} from '@coreui/react-pro'
import CIcon from '@coreui/icons-react'
import {
  cilPlus,
  cilShieldAlt,
} from '@coreui/icons'
import ModalCreate from '@/components/roles/ModalCreate'
import ModalRolActu from '@/components/roles/ModalRol'
import ModalAccionesPantalla from '@/components/roles/ModalAccionesPantalla'
import useRoles from '@/hooks/admin-roles/useRoles'
import usePermisosMatriz from '@/hooks/admin-roles/usePermisosMatriz'
import { Pantalla } from '@/models/adm/permiso.model'
import { usePermissions } from '@/context/PermissionsContext'


const getClusterStyle = (nombreModulo: string) => {
  const norm = (nombreModulo || '').toLowerCase()
  if (norm.includes('dash')) {
    return {
      bgHeader: 'rgba(99, 102, 241, 0.08)',
      textColor: '#4338ca',
      tagBg: '#e0e7ff',
      tagText: '#3730a3',
      borderTop: '3px solid #6366f1',
    }
  }
  if (norm.includes('admin')) {
    return {
      bgHeader: 'rgba(139, 92, 246, 0.08)',
      textColor: '#6d28d9',
      tagBg: '#ede9fe',
      tagText: '#5b21b6',
      borderTop: '3px solid #8b5cf6',
    }
  }
  if (norm.includes('usuario')) {
    return {
      bgHeader: 'rgba(16, 185, 129, 0.08)',
      textColor: '#047857',
      tagBg: '#d1fae5',
      tagText: '#065f46',
      borderTop: '3px solid #10b981',
    }
  }
  if (norm.includes('biblio')) {
    return {
      bgHeader: 'rgba(14, 165, 233, 0.08)',
      textColor: '#0369a1',
      tagBg: '#e0f2fe',
      tagText: '#075985',
      borderTop: '3px solid #0ea5e9',
    }
  }
  if (norm.includes('libro')) {
    return {
      bgHeader: 'rgba(245, 158, 11, 0.08)',
      textColor: '#b45309',
      tagBg: '#fef3c7',
      tagText: '#92400e',
      borderTop: '3px solid #f59e0b',
    }
  }
  if (norm.includes('report')) {
    return {
      bgHeader: 'rgba(244, 63, 94, 0.08)',
      textColor: '#be123c',
      tagBg: '#ffe4e6',
      tagText: '#9f1239',
      borderTop: '3px solid #f43f5e',
    }
  }
  return {
    bgHeader: 'rgba(100, 116, 139, 0.08)',
    textColor: '#334155',
    tagBg: '#f1f5f9',
    tagText: '#334155',
    borderTop: '3px solid #64748b',
  }
}

export const Roles = () => {
  const { canDoAction } = usePermissions()

  // 1. Hook de CRUD de Roles
  const userState = useRoles()

  // 2. Hook de Lógica Centralizada de la Matriz de Permisos
  const permisos = usePermisosMatriz(userState.roles, userState.fetchRoles)

  // 3. Estado para el modal de acciones/botones de una pantalla
  const [pantallaSeleccionada, setPantallaSeleccionada] = useState<Pantalla | null>(null)
  const [modalAccionesVisible, setModalAccionesVisible] = useState<boolean>(false)

  const handleAbrirAcciones = (pantalla: Pantalla) => {
    setPantallaSeleccionada(pantalla)
    setModalAccionesVisible(true)
  }

  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scrollContainerRef.current
    if (!el) return

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0 && !e.shiftKey) {
        if (el.scrollWidth > el.clientWidth) {
          e.preventDefault()
          el.scrollLeft += e.deltaY * 1.3
        }
      }
    }

    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => {
      el.removeEventListener('wheel', handleWheel)
    }
  }, [permisos.loadingMatriz, permisos.catalogo])

  return (
    <div className="w-100 pb-4">
      <ModalCreate userState={userState} />
      <ModalRolActu userState={userState} />

      <ModalAccionesPantalla
        visible={modalAccionesVisible}
        onClose={() => setModalAccionesVisible(false)}
        pantalla={pantallaSeleccionada}
        roles={userState.roles}
        allAcciones={permisos.allAcciones}
        isPermisoAsignado={permisos.isPermisoAsignado}
        isAccionAsignada={permisos.isAccionAsignada}
        onToggleAccion={permisos.handleConfirmarCambioAccion}
        onToggleTodasAcciones={permisos.handleConfirmarToggleTodasAcciones}
      />


      <CCard className="mb-4 shadow-sm border-0">
        <CCardBody className="p-3 px-4">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
            {/* Título simple y limpio */}
            <div className="d-flex align-items-center gap-2">
              <div
                className="rounded-3 p-2 d-flex align-items-center justify-content-center text-white"
                style={{ backgroundColor: '#321fdb', width: '42px', height: '42px' }}
              >
                <CIcon icon={cilShieldAlt} size="xl" />
              </div>
              <h4 className="mb-0 fw-bold text-dark">Gestión de Roles y Permisos</h4>
            </div>

            <div>
              {canDoAction('btn_crear_rol') && (
                <CButton
                  color="success"
                  onClick={() => userState.setModalCrear(true)}
                  style={{ color: 'white' }}
                  className="d-flex align-items-center gap-2 px-3 py-2 fw-semibold shadow-sm"
                >
                  <CIcon icon={cilPlus} />
                  <span>Nuevo Rol</span>
                </CButton>
              )}
            </div>
          </div>
        </CCardBody>
      </CCard>

      <CCard className="shadow-sm border-0">
        <CCardBody className="p-0">
          {permisos.loadingMatriz ? (
            <div className="text-center py-5">
              <CSpinner color="primary" style={{ width: '3rem', height: '3rem' }} />
              <div className="mt-3 fw-bold fs-5 text-dark">Cargando permisos...</div>
            </div>
          ) : permisos.errorPermisos || userState.errorMsg ? (
            <div className="text-center py-5 px-4">
              <div
                className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                style={{ width: '68px', height: '68px', backgroundColor: '#fee2e2', color: '#dc2626' }}
              >
                <CIcon icon={cilShieldAlt} size="xxl" />
              </div>
              <h5 className="fw-bold text-danger mb-2">Acceso Restringido en el Servidor</h5>
              <p className="text-muted mx-auto mb-0" style={{ maxWidth: '520px', fontSize: '0.95rem' }}>
                {permisos.errorPermisos || userState.errorMsg}
              </p>
            </div>
          ) : permisos.catalogo.length === 0 ? (
            <div className="text-center py-5 text-muted">
              No se encontraron pantallas en el catálogo.
            </div>
          ) : (
            <div
              ref={scrollContainerRef}
              style={{
                overflowX: 'auto',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              <table
                className="table table-hover align-middle mb-0"
                style={{
                  minWidth: 'max-content',
                  borderCollapse: 'separate',
                  borderSpacing: 0,
                }}
              >
                <thead>
                  <tr>
                    <th
                      rowSpan={2}
                      className="py-3 px-4 text-start fw-bold"
                      style={{
                        width: '240px',
                        minWidth: '240px',
                        backgroundColor: '#ffffff',
                        borderRight: '2px solid #e2e8f0',
                        borderBottom: '2px solid #e2e8f0',
                      }}
                    />
                    {permisos.catalogo.map((modulo) => {
                      const style = getClusterStyle(modulo.MODULO)
                      return (
                        <th
                          key={modulo.MODULO}
                          colSpan={modulo.PANTALLAS.length}
                          className="py-3 px-3 text-uppercase fw-bold text-center"
                          style={{
                            backgroundColor: style.bgHeader,
                            color: style.textColor,
                            borderTop: style.borderTop,
                            borderRight: '2px solid #e2e8f0',
                            borderBottom: '1px solid #e2e8f0',
                            letterSpacing: '0.6px',
                            fontSize: '0.88rem',
                          }}
                        >
                          {modulo.MODULO}
                        </th>
                      )
                    })}
                  </tr>

                  <tr style={{ backgroundColor: '#f8fafc' }}>
                    {permisos.catalogo.flatMap((modulo) =>
                      modulo.PANTALLAS.map((pantalla, pIdx) => {
                        const isLastInModulo = pIdx === modulo.PANTALLAS.length - 1
                        const style = getClusterStyle(modulo.MODULO)

                        return (
                          <th
                            key={pantalla.ID_PERMISO}
                            className="py-3 px-3 text-center align-top"
                            style={{
                              minWidth: '200px',
                              maxWidth: '240px',
                              borderRight: isLastInModulo
                                ? '2px solid #e2e8f0'
                                : '1px solid #f1f5f9',
                              borderBottom: '2px solid #e2e8f0',
                            }}
                          >
                            <div className="d-flex flex-column align-items-center gap-1">
                              <span
                                className="font-monospace fw-bold px-2 py-1 rounded text-truncate shadow-sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleAbrirAcciones(pantalla)
                                }}
                                style={{
                                  fontSize: '0.78rem',
                                  backgroundColor: style.tagBg,
                                  color: style.tagText,
                                  maxWidth: '200px',
                                  border: '1px solid rgba(0,0,0,0.08)',
                                  cursor: 'pointer',
                                  userSelect: 'none',
                                  transition: 'transform 0.12s ease, box-shadow 0.12s ease',
                                }}
                                title={`Haz clic para ver y configurar las acciones de ${pantalla.PATH_PERMISO}`}
                              >
                                {pantalla.PATH_PERMISO}
                              </span>
                              <span
                                className="fw-semibold text-secondary text-truncate"
                                style={{ fontSize: '0.8rem', maxWidth: '200px', userSelect: 'none' }}
                                title={pantalla.NOMBRE_PERMISO}
                              >
                                {pantalla.NOMBRE_PERMISO}
                              </span>
                            </div>
                          </th>
                        )
                      }),
                    )}
                  </tr>
                </thead>

                <tbody>
                  {userState.roles.map((rol: any) => {
                    const rolId = Number(rol.ID_ROL ?? rol.id)
                    const nombreRol = String(rol.NOMBRE_ROL ?? rol.nombre ?? `Rol ${rolId}`)
                    const nivelRol = Number(rol.NIVEL_ROL ?? rol.nivel ?? 1)
                    const isModified = permisos.modifiedRoleIds.has(rolId)

                    return (
                      <tr key={rolId}>
                        <td
                          className="px-3 py-3 text-start align-middle"
                          style={{
                            width: '240px',
                            minWidth: '240px',
                            backgroundColor: '#ffffff',
                            borderRight: '2px solid #e2e8f0',
                            borderBottom: '1px solid #e2e8f0',
                            cursor: (canDoAction('btn_actualizar_rol') || canDoAction('btn_eliminar_rol')) ? 'pointer' : 'default',
                            userSelect: 'none',
                          }}
                          onClick={() => {
                            if (canDoAction('btn_actualizar_rol') || canDoAction('btn_eliminar_rol')) {
                              userState.handleAbrirEditar(rol)
                            }
                          }}
                          title={
                            (canDoAction('btn_actualizar_rol') || canDoAction('btn_eliminar_rol'))
                              ? 'Haz clic para actualizar o eliminar este rol'
                              : nombreRol
                          }
                        >
                          <div className="d-flex align-items-center justify-content-between gap-2 p-1 rounded-2">
                            <div>
                              <div className="d-flex align-items-center gap-2">
                                <span className="fw-bold text-dark fs-6">{nombreRol}</span>
                                {isModified && (
                                  <CBadge color="warning" className="text-dark py-1 px-2" style={{ fontSize: '0.68rem' }}>
                                    Modificado
                                  </CBadge>
                                )}
                              </div>
                              <div className="d-flex align-items-center gap-2 mt-1">
                                <CBadge
                                  color={nivelRol === 1 ? 'danger' : 'info'}
                                  className="px-2 py-0 text-white"
                                  style={{ fontSize: '0.7rem' }}
                                >
                                  Nivel {nivelRol}
                                </CBadge>
                              </div>
                            </div>
                          </div>
                        </td>

                        {permisos.catalogo.flatMap((modulo) =>
                          modulo.PANTALLAS.map((pantalla, pIdx) => {
                            const isChecked = permisos.isPermisoAsignado(rolId, pantalla.ID_PERMISO)
                            const isLastInModulo = pIdx === modulo.PANTALLAS.length - 1

                            return (
                              <td
                                key={pantalla.ID_PERMISO}
                                className="text-center align-middle py-3 px-2"
                                style={{
                                  borderRight: isLastInModulo
                                    ? '2px solid #e2e8f0'
                                    : '1px solid #f1f5f9',
                                  borderBottom: '1px solid #e2e8f0',
                                  backgroundColor: isChecked ? 'rgba(50, 31, 219, 0.04)' : undefined,
                                }}
                              >
                                <div className="d-flex justify-content-center align-items-center">
                                  <CFormCheck
                                    id={`perm-${rolId}-${pantalla.ID_PERMISO}`}
                                    checked={isChecked}
                                    onChange={() =>
                                      permisos.handleConfirmarCambioPermiso(
                                        rolId,
                                        nombreRol,
                                        pantalla.ID_PERMISO,
                                        pantalla.NOMBRE_PERMISO,
                                      )
                                    }
                                    style={{
                                      cursor: 'pointer',
                                      transform: 'scale(1.25)',
                                    }}
                                  />
                                </div>
                              </td>
                            )
                          }),
                        )}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CCardBody>
      </CCard>
    </div>
  )
}

export default Roles
