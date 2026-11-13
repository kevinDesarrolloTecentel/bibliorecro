import { useRef, useEffect } from 'react'
import Swal from 'sweetalert2'
import { motion } from 'framer-motion'
import {
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CElementCover,
  CFormCheck,
  CSpinner,
} from '@coreui/react-pro'
import CIcon from '@coreui/icons-react'
import {
  cilPlus,
  cilShieldAlt,
  cilSync,
  cilOptions,


} from '@coreui/icons'
import ModalCreate from '@/components/roles/ModalCreate'
import ModalRolActu from '@/components/roles/ModalRol'
import ModalAccionesPantalla from '@/components/roles/ModalAccionesPantalla'
import useRoles from '@/hooks/admin-roles/useRoles'
import usePermisosMatriz from '@/hooks/admin-roles/usePermisosMatriz'

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
  // 1. Hook de CRUD de Roles
  const userState = useRoles()

  // 2. Hook de Lógica Centralizada de la Matriz de Permisos
  const permisos = usePermisosMatriz(userState.roles, userState.fetchRoles)

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
        visible={permisos.modalAccionesVisible}
        onClose={permisos.handleCerrarAcciones}
        pantalla={permisos.pantallaSeleccionada}
        roles={userState.roles}
        allAcciones={permisos.allAcciones}
        isPermisoAsignado={permisos.isPermisoAsignado}
        isAccionAsignada={permisos.isAccionAsignada}
        canModificarAcciones={permisos.canModificarAcciones}
        canVerAccionesPorRol={permisos.canVerAccionesPorRol}
        onToggleAccion={permisos.handleConfirmarCambioAccion}
      />

      {/* Encabezado estándar con el mismo diseño que Renovaciones y Reportes */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h3 className="fw-bold mb-1 text-body d-flex align-items-center gap-2">
            <CIcon icon={cilShieldAlt} size="lg" style={{ color: '#2a0adcff' }} />
            <span>Roles y Permisos</span>
          </h3>
          <p className="text-body-secondary mb-0">
            Administración de roles y asignación de permisos por módulo y pantalla.
          </p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <CButton
            color="secondary"
            variant="outline"
            size="sm"
            onClick={() => {
              permisos.handleRefrescarTodo()
            }}
            disabled={userState.loading || permisos.loadingMatriz}
            className="d-flex align-items-center gap-1 shadow-sm"
            title="Refrescar lista y matriz de permisos"
          >
            <CIcon
              icon={cilSync}
              className={`me-1 ${userState.loading || permisos.loadingMatriz ? 'rotate-animation' : ''}`}
            />
            <span>{userState.loading || permisos.loadingMatriz ? 'Refrescando...' : 'Refrescar'}</span>
          </CButton>
          {userState.canCrearRol && (
            <CButton
              color="success"
              size="sm"
              onClick={userState.handleAbrirCrear}
              variant="outline"
              className="hover:text-white shadow-sm"            >
              <CIcon icon={cilPlus} className="me-1" />
              <span>Nuevo Rol</span>
            </CButton>
          )}
        </div>
      </div>

      <CCard className="shadow-sm border-0">
        <CCardHeader className="bg-transparent py-3 d-flex justify-content-between align-items-center">
          <span className="fw-semibold text-uppercase small d-inline-flex align-items-center gap-2">
            <CIcon icon={cilShieldAlt} style={{ color: '#2a0adcff' }} />
             <span>Matriz de Permisos</span>
          </span>
          <span className="text-body-secondary small">
            Total roles registrados: <strong>{userState.roles.length}</strong>
          </span>
        </CCardHeader>
        <CCardBody className="p-0">
          {permisos.loadingMatriz ? (
            <div className="position-relative py-3 px-3" style={{ minHeight: '100px' }}>
              <div className="text-body-secondary py-2 border-bottom">
                Cargando permisos...
              </div>
              <CElementCover opacity={0.2} style={{ backgroundColor: 'transparent' }}>
                <CSpinner variant="grow" color="primary" />
              </CElementCover>
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
                        backgroundColor: 'var(--cui-body-bg)',
                        borderRight: '2px solid var(--cui-border-color)',
                        borderBottom: '2px solid var(--cui-border-color)',
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

                  <tr style={{ backgroundColor: 'var(--cui-tertiary-bg)' }}>
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
                              backgroundColor: 'var(--cui-tertiary-bg)',
                              borderRight: isLastInModulo
                                ? '2px solid var(--cui-border-color)'
                                : '1px solid var(--cui-border-color-translucent)',
                              borderBottom: '2px solid var(--cui-border-color)',
                            }}
                          >
                            <div className="d-flex flex-column align-items-center gap-1">
                              <motion.span
                                whileHover={permisos.canVerAcciones ? { scale: 1.05, y: -1 } : {}}
                                whileTap={permisos.canVerAcciones ? { scale: 0.96 } : {}}
                                className="font-monospace fw-bold px-2 py-1 rounded text-truncate shadow-sm d-inline-flex align-items-center gap-1"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  if (permisos.canVerAcciones) {
                                    permisos.handleAbrirAcciones(pantalla)
                                  }
                                }}
                                style={{
                                  fontSize: '0.78rem',
                                  backgroundColor: style.tagBg,
                                  color: style.tagText,
                                  maxWidth: '200px',
                                  border: '1px solid rgba(0,0,0,0.08)',
                                  cursor: permisos.canVerAcciones ? 'pointer' : 'default',
                                  userSelect: 'none',
                                }}
                                title={
                                  permisos.canVerAcciones
                                    ? `Haz clic para ver y configurar las acciones de ${pantalla.PATH_PERMISO}`
                                    : pantalla.PATH_PERMISO
                                }
                              >
                                <span>{pantalla.PATH_PERMISO}</span>
                                {permisos.canVerAcciones && (
                                  <CIcon icon={cilOptions} style={{ width: '10px', height: '10px', opacity: 0.7 }} />
                                )}
                              </motion.span>
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
                            backgroundColor: 'var(--cui-body-bg)',
                            borderRight: '2px solid var(--cui-border-color)',
                            borderBottom: '1px solid var(--cui-border-color)',
                            cursor: userState.canEditarRol ? 'pointer' : 'default',
                            userSelect: 'none',
                          }}
                          onClick={() => {
                            if (userState.canEditarRol) {
                              userState.handleAbrirEditar(rol)
                            }
                          }}
                          title={
                            userState.canEditarRol
                              ? 'Haz clic para actualizar o eliminar este rol'
                              : nombreRol
                          }
                        >
                          <div className="d-flex align-items-center justify-content-between gap-2 p-1 rounded-2">
                            <div>
                              <div className="d-flex align-items-center gap-2">
                                <span className="fw-bold text-body fs-6">{nombreRol}</span>
                                {isModified && (
                                  <CBadge color="warning" className="text-dark py-1 px-2" style={{ fontSize: '0.68rem' }}>
                                    Modificado
                                  </CBadge>
                                )}
                              </div>
                              <div className="d-flex align-items-center gap-2 mt-1">
                                <span className="text-secondary small">
                                  Nivel {nivelRol}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {permisos.catalogo.flatMap((modulo) =>
                          modulo.PANTALLAS.map((pantalla, pIdx) => {
                            const isChecked = permisos.isPermisoAsignado(rolId, pantalla.ID_PERMISO)
                            const isLastInModulo = pIdx === modulo.PANTALLAS.length - 1
                            const isNivel1 = nivelRol === 1 || rolId === 1
                            const isProtegido = isChecked && isNivel1

                            return (
                              <td
                                key={pantalla.ID_PERMISO}
                                className="text-center align-middle py-3 px-2"
                                style={{
                                  borderRight: isLastInModulo
                                    ? '2px solid var(--cui-border-color)'
                                    : '1px solid var(--cui-border-color-translucent)',
                                  borderBottom: '1px solid var(--cui-border-color)',
                                  backgroundColor: isChecked ? 'rgba(99, 102, 241, 0.12)' : undefined,
                                }}
                              >
                                <div
                                  className="d-flex justify-content-center align-items-center"
                                  onClick={(e) => {
                                    if (isProtegido) {
                                      e.stopPropagation()
                                      Swal.fire({
                                        icon: 'warning',
                                        title: 'Permiso protegido',
                                        text: `No se pueden revocar permisos al rol de Nivel 1 (${nombreRol}).`,
                                        confirmButtonColor: '#044c8c',
                                        confirmButtonText: 'Entendido',
                                      })
                                    }
                                  }}
                                >
                                  <CFormCheck
                                    id={`perm-${rolId}-${pantalla.ID_PERMISO}`}
                                    checked={isChecked}
                                    disabled={!permisos.canCheckboxPermisos}
                                    onChange={() => {
                                      if (isProtegido) {
                                        Swal.fire({
                                          icon: 'warning',
                                          title: 'Permiso protegido',
                                          text: `No se pueden revocar permisos de pantallas al rol de Nivel 1 (${nombreRol}).`,
                                          confirmButtonColor: '#044c8c',
                                          confirmButtonText: 'Entendido',
                                        })
                                        return
                                      }
                                      if (permisos.canCheckboxPermisos) {
                                        permisos.handleConfirmarCambioPermiso(
                                          rolId,
                                          nombreRol,
                                          pantalla.ID_PERMISO,
                                          pantalla.NOMBRE_PERMISO,
                                        )
                                      }
                                    }}
                                    style={{
                                      cursor: permisos.canCheckboxPermisos ? 'pointer' : 'not-allowed',
                                      transform: 'scale(1.25)',
                                    }}
                                    title={
                                      !permisos.canCheckboxPermisos
                                        ? 'Sin permiso para modificar'
                                        : isChecked
                                          ? `Quitar ${pantalla.NOMBRE_PERMISO}`
                                          : `Asignar ${pantalla.NOMBRE_PERMISO}`
                                    }
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
