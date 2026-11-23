import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import {
    CBadge,
    CButton,
    CFormSelect,
    CModal,
    CModalBody,
    CModalFooter,
    CModalHeader,
    CModalTitle,
    CSpinner,
    useColorModes,
} from "@coreui/react-pro"
import CIcon from "@coreui/icons-react"
import { cilExitToApp, cilLockLocked, cilShieldAlt, cilUser } from "@coreui/icons"
import { MisPermisosModulo, MisPermisosPantalla } from "@/slices/authSlice"
import { AdminRol } from "@/models/adm/rol.model"

interface ModalVerPermisosProps {
    visible: boolean
    setVisible: (v: boolean) => void
    modulos: MisPermisosModulo[]
    roles?: AdminRol[]
    loading?: boolean
    userName?: string
}

// Estilos por cluster de módulos con adaptación dinámica para modo claro y oscuro
const getClusterStyle = (nombreModulo: string, isDark: boolean = false) => {
    const norm = (nombreModulo || '').toLowerCase()
    if (norm.includes('dash')) {
        return {
            bgHeader: isDark ? 'rgba(99, 102, 241, 0.18)' : 'rgba(99, 102, 241, 0.08)',
            textColor: isDark ? '#a5b4fc' : '#4338ca',
            tagBg: isDark ? 'rgba(99, 102, 241, 0.25)' : '#e0e7ff',
            tagText: isDark ? '#c7d2fe' : '#3730a3',
            borderTop: isDark ? '3px solid #818cf8' : '3px solid #6366f1',
        }
    }
    if (norm.includes('admin')) {
        return {
            bgHeader: isDark ? 'rgba(139, 92, 246, 0.18)' : 'rgba(139, 92, 246, 0.08)',
            textColor: isDark ? '#c4b5fd' : '#6d28d9',
            tagBg: isDark ? 'rgba(139, 92, 246, 0.25)' : '#ede9fe',
            tagText: isDark ? '#ddd6fe' : '#5b21b6',
            borderTop: isDark ? '3px solid #a78bfa' : '3px solid #8b5cf6',
        }
    }
    if (norm.includes('perfil')) {
        return {
            bgHeader: isDark ? 'rgba(59, 130, 246, 0.18)' : 'rgba(59, 130, 246, 0.08)',
            textColor: isDark ? '#93c5fd' : '#1d4ed8',
            tagBg: isDark ? 'rgba(59, 130, 246, 0.25)' : '#dbeafe',
            tagText: isDark ? '#bfdbfe' : '#1e40af',
            borderTop: isDark ? '3px solid #60a5fa' : '3px solid #3b82f6',
        }
    }
    if (norm.includes('usuario')) {
        return {
            bgHeader: isDark ? 'rgba(16, 185, 129, 0.18)' : 'rgba(16, 185, 129, 0.08)',
            textColor: isDark ? '#6ee7b7' : '#047857',
            tagBg: isDark ? 'rgba(16, 185, 129, 0.25)' : '#d1fae5',
            tagText: isDark ? '#a7f3d0' : '#065f46',
            borderTop: isDark ? '3px solid #34d399' : '3px solid #10b981',
        }
    }
    if (norm.includes('biblio')) {
        return {
            bgHeader: isDark ? 'rgba(14, 165, 233, 0.18)' : 'rgba(14, 165, 233, 0.08)',
            textColor: isDark ? '#7dd3fc' : '#0369a1',
            tagBg: isDark ? 'rgba(14, 165, 233, 0.25)' : '#e0f2fe',
            tagText: isDark ? '#bae6fd' : '#075985',
            borderTop: isDark ? '3px solid #38bdf8' : '3px solid #0ea5e9',
        }
    }
    if (norm.includes('libro')) {
        return {
            bgHeader: isDark ? 'rgba(245, 158, 11, 0.18)' : 'rgba(245, 158, 11, 0.08)',
            textColor: isDark ? '#fcd34d' : '#b45309',
            tagBg: isDark ? 'rgba(245, 158, 11, 0.25)' : '#fef3c7',
            tagText: isDark ? '#fde68a' : '#92400e',
            borderTop: isDark ? '3px solid #fbbf24' : '3px solid #f59e0b',
        }
    }
    if (norm.includes('report')) {
        return {
            bgHeader: isDark ? 'rgba(244, 63, 94, 0.18)' : 'rgba(244, 63, 94, 0.08)',
            textColor: isDark ? '#fda4af' : '#be123c',
            tagBg: isDark ? 'rgba(244, 63, 94, 0.25)' : '#ffe4e6',
            tagText: isDark ? '#fecdd3' : '#9f1239',
            borderTop: isDark ? '3px solid #fb7185' : '3px solid #f43f5e',
        }
    }
    return {
        bgHeader: isDark ? 'rgba(148, 163, 184, 0.18)' : 'rgba(100, 116, 139, 0.08)',
        textColor: isDark ? '#cbd5e1' : '#334155',
        tagBg: isDark ? 'rgba(148, 163, 184, 0.25)' : '#f1f5f9',
        tagText: isDark ? '#e2e8f0' : '#334155',
        borderTop: isDark ? '3px solid #94a3b8' : '3px solid #64748b',
    }
}

const ModalVerPermisos: React.FC<ModalVerPermisosProps> = ({
    visible,
    setVisible,
    modulos = [],
    loading = false,
    userName = '',
}) => {
    const scrollContainerRef = useRef<HTMLDivElement | null>(null)
    const wheelCleanupRef = useRef<(() => void) | null>(null)

    const { colorMode } = useColorModes('coreui-pro-react-admin-template-theme-default')
    const [isDark, setIsDark] = useState<boolean>(() => {
        if (typeof document !== 'undefined') {
            const theme = document.documentElement.getAttribute('data-coreui-theme')
            return theme === 'dark' || colorMode === 'dark'
        }
        return false
    })

    useEffect(() => {
        const updateTheme = () => {
            const theme = document.documentElement.getAttribute('data-coreui-theme')
            setIsDark(theme === 'dark' || colorMode === 'dark')
        }
        updateTheme()

        const observer = new MutationObserver(updateTheme)
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-coreui-theme'] })
        return () => observer.disconnect()
    }, [colorMode])

    // Por defecto muestra las primeras 5 acciones por pantalla
    const [actionsLimit, setActionsLimit] = useState<number>(5)

    // Callback ref que asegura adjuntar el listener wheel activo de inmediato al montarse el contenedor en el modal
    const setScrollContainerRef = useCallback((node: HTMLDivElement | null) => {
        if (wheelCleanupRef.current) {
            wheelCleanupRef.current()
            wheelCleanupRef.current = null
        }

        scrollContainerRef.current = node

        if (node) {
            const handleWheel = (e: WheelEvent) => {
                // Intercepta el giro vertical del mouse y lo convierte en desplazamiento horizontal (de izquierda a derecha)
                if (e.deltaY !== 0) {
                    e.preventDefault()
                    e.stopPropagation()
                    node.scrollLeft += e.deltaY * 1.5
                }
            }

            node.addEventListener('wheel', handleWheel, { passive: false })
            wheelCleanupRef.current = () => {
                node.removeEventListener('wheel', handleWheel)
            }
        }
    }, [])

    // Totales calculados
    const { totalPantallas, totalAcciones } = useMemo(() => {
        let pantallas = 0
        let acciones = 0
        modulos.forEach((m) => {
            if (Array.isArray(m.PANTALLAS)) {
                pantallas += m.PANTALLAS.length
                m.PANTALLAS.forEach((p) => {
                    if (Array.isArray(p.ACCIONES)) {
                        acciones += p.ACCIONES.length
                    }
                })
            }
        })
        return { totalPantallas: pantallas, totalAcciones: acciones }
    }, [modulos])

    // Resetear a 5 acciones si se abre el modal
    useEffect(() => {
        if (visible) {
            setActionsLimit(5)
        }
    }, [visible])

    return (
        <CModal
            visible={visible}
            onClose={() => setVisible(false)}
            size="xl"
            alignment="center"
            className="modal-permisos-matriz"
        >
            <CModalHeader className="border-bottom py-3 px-4 bg-body-tertiary">
                <CModalTitle className="d-flex align-items-center gap-2 fs-5 fw-bold text-body">
                    <CIcon icon={cilShieldAlt} size="lg" className="text-body" />
                    <span>Matriz de Permisos y Acciones Asignadas</span>
                </CModalTitle>
            </CModalHeader>

            <CModalBody className="p-0 bg-body">
                {/* Barra de cabecera con usuario, resumen y selector 'Ver más' para las acciones */}
                <div className="p-3 bg-body-tertiary border-bottom d-flex flex-wrap justify-content-between align-items-center gap-3">
                    <div className="d-flex align-items-center gap-2">
                        <CIcon icon={cilUser} className="text-primary" />
                        <span className="text-body-secondary small">Usuario:</span>
                        <strong className="text-body">{userName || 'Usuario'}</strong>
                    </div>

                    <div className="d-flex flex-wrap align-items-center gap-2">
                        <CBadge color="primary" shape="rounded-pill" className="px-3 py-1">
                            {modulos.length} Módulos
                        </CBadge>
                        <CBadge color="info" shape="rounded-pill" className="px-3 py-1">
                            {totalPantallas} Pantallas
                        </CBadge>
                        <CBadge color="success" shape="rounded-pill" className="px-3 py-1">
                            {totalAcciones} Acciones
                        </CBadge>
                    </div>

                    {/* Apartado 'Ver más' para elegir cuántas acciones ver por pantalla */}
                    <div className="d-flex align-items-center gap-2">
                        <span className="text-body-secondary small text-nowrap fw-semibold">
                            Ver más:
                        </span>
                        <CFormSelect
                            size="sm"
                            value={actionsLimit}
                            onChange={(e) => setActionsLimit(Number(e.target.value))}
                            className="shadow-sm"
                            style={{ width: 'auto', minWidth: '175px' }}
                        >
                            <option value={5}>Primeras 5 acciones</option>
                            <option value={10}>Mostrar 10 acciones</option>
                            <option value={15}>Mostrar 15 acciones</option>
                            <option value={9999}>Ver todas las acciones</option>
                        </CFormSelect>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-5">
                        <CSpinner color="primary" />
                        <div className="text-body-secondary small mt-2">Cargando matriz de permisos...</div>
                    </div>
                ) : modulos.length === 0 ? (
                    <div className="text-center py-5 text-body-secondary">
                        <CIcon icon={cilLockLocked} size="xxl" className="mb-2 text-body-secondary opacity-50" />
                        <p className="mb-0 small">No tienes módulos ni acciones asignadas.</p>
                    </div>
                ) : (
                    /* Contenedor con todos los módulos y pantallas visibles con scroll de izquierda a derecha y barra vertical para deslizar manual */
                    <div
                        ref={setScrollContainerRef}
                        style={{
                            overflowX: 'auto',
                            overflowY: 'auto',
                            WebkitOverflowScrolling: 'touch',
                            maxHeight: '62vh',
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
                                    {/* Fila 1 de encabezado: Todos los Módulos */}
                                    {modulos.map((modulo: MisPermisosModulo, mIdx: number) => {
                                        const colSpan = modulo.PANTALLAS?.length || 1
                                        const style = getClusterStyle(modulo.MODULO, isDark)
                                        return (
                                            <th
                                                key={`${modulo.MODULO}-${mIdx}`}
                                                colSpan={colSpan}
                                                className="py-3 px-3 text-uppercase fw-bold text-center"
                                                style={{
                                                    backgroundColor: style.bgHeader,
                                                    color: style.textColor,
                                                    borderTop: style.borderTop,
                                                    borderRight: '2px solid var(--cui-border-color)',
                                                    borderBottom: '1px solid var(--cui-border-color)',
                                                    letterSpacing: '0.6px',
                                                    fontSize: '0.88rem',
                                                }}
                                            >
                                                {modulo.MODULO}
                                            </th>
                                        )
                                    })}
                                </tr>

                                {/* Fila 2 de encabezado: Todas las Pantallas */}
                                <tr style={{ backgroundColor: 'var(--cui-tertiary-bg)' }}>
                                    {modulos.flatMap((modulo: MisPermisosModulo) =>
                                        (modulo.PANTALLAS || []).map((pantalla: MisPermisosPantalla, pIdx: number) => {
                                            const isLastInModulo = pIdx === (modulo.PANTALLAS.length - 1)
                                            const style = getClusterStyle(modulo.MODULO, isDark)

                                            return (
                                                <th
                                                    key={Number(pantalla.ID_PERMISO)}
                                                    className="py-3 px-3 text-center align-top"
                                                    style={{
                                                        minWidth: '220px',
                                                        maxWidth: '280px',
                                                        backgroundColor: 'var(--cui-tertiary-bg)',
                                                        borderRight: isLastInModulo
                                                            ? '2px solid var(--cui-border-color)'
                                                            : '1px solid var(--cui-border-color-translucent)',
                                                        borderBottom: '2px solid var(--cui-border-color)',
                                                    }}
                                                >
                                                    <div className="d-flex flex-column align-items-center gap-1">
                                                        <span
                                                            className="font-monospace fw-bold px-2 py-1 rounded text-truncate shadow-sm d-inline-flex align-items-center gap-1"
                                                            style={{
                                                                fontSize: '0.78rem',
                                                                backgroundColor: style.tagBg,
                                                                color: style.tagText,
                                                                maxWidth: '220px',
                                                                border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)',
                                                            }}
                                                            title={pantalla.PATH_PERMISO}
                                                        >
                                                            <span>{pantalla.PATH_PERMISO}</span>
                                                        </span>
                                                        <span
                                                            className="fw-semibold text-body-secondary text-truncate"
                                                            style={{ fontSize: '0.8rem', maxWidth: '220px' }}
                                                            title={pantalla.NOMBRE_PERMISO}
                                                        >
                                                            {pantalla.NOMBRE_PERMISO}
                                                        </span>
                                                    </div>
                                                </th>
                                            )
                                        })
                                    )}
                                </tr>
                            </thead>

                            <tbody>
                                <tr>
                                    {/* Celdas para cada pantalla con las acciones limitadas por actionsLimit */}
                                    {modulos.flatMap((modulo: MisPermisosModulo) =>
                                        (modulo.PANTALLAS || []).map((pantalla: MisPermisosPantalla, pIdx: number) => {
                                            const isLastInModulo = pIdx === (modulo.PANTALLAS.length - 1)
                                            const pantallaId = Number(pantalla.ID_PERMISO)
                                            const acciones = pantalla.ACCIONES || []
                                            const visibleAcciones = actionsLimit >= 9999 ? acciones : acciones.slice(0, actionsLimit)

                                            return (
                                                <td
                                                    key={pantallaId}
                                                    className="align-top py-3 px-2"
                                                    style={{
                                                        borderRight: isLastInModulo
                                                            ? '2px solid var(--cui-border-color)'
                                                            : '1px solid var(--cui-border-color-translucent)',
                                                        borderBottom: '1px solid var(--cui-border-color)',
                                                        backgroundColor: isDark ? 'rgba(99, 102, 241, 0.04)' : 'rgba(99, 102, 241, 0.02)',
                                                    }}
                                                >
                                                    {/* Acciones como filas verticales */}
                                                    <div className="d-flex flex-column gap-1.5 w-100">
                                                        {visibleAcciones.length > 0 ? (
                                                            visibleAcciones.map((acc, aIdx: number) => {
                                                                const codigo = String(acc || '')
                                                                return (
                                                                    <div
                                                                        key={aIdx}
                                                                        className="badge font-monospace py-1.5 px-2 text-start text-truncate w-100 shadow-xs"
                                                                        style={{
                                                                            fontSize: '0.72rem',
                                                                            display: 'block',
                                                                            backgroundColor: isDark ? 'rgba(99, 102, 241, 0.22)' : 'var(--cui-primary-bg-subtle)',
                                                                            color: isDark ? '#c7d2fe' : 'var(--cui-primary-text-emphasis)',
                                                                            border: isDark ? '1px solid rgba(99, 102, 241, 0.35)' : '1px solid var(--cui-primary-border-subtle)',
                                                                        }}
                                                                        title={codigo}
                                                                    >
                                                                        {codigo}
                                                                    </div>
                                                                )
                                                            })
                                                        ) : (
                                                            <div className="text-body-secondary small fst-italic text-center py-1" style={{ fontSize: '0.72rem' }}>
                                                                Sin acciones
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            )
                                        })
                                    )}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}
            </CModalBody>

            <CModalFooter className="border-top py-2 px-4 d-flex justify-content-end bg-body-tertiary">
                <CButton
                    color="secondary"
                    variant="outline"
                    size="sm"
                    className="d-flex align-items-center gap-1 shadow-sm"
                    onClick={() => setVisible(false)}
                >
                    <CIcon icon={cilExitToApp} className="me-1" />
                    <span>Cerrar</span>
                </CButton>
            </CModalFooter>
        </CModal>
    )
}

export default ModalVerPermisos
