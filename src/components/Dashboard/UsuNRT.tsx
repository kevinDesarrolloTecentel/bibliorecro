import {
    CBadge,
    CButton,
    CSmartTable,
    CTab,
    CTabContent,
    CTabList,
    CTabPanel,
    CTabs,
} from '@coreui/react-pro'
import CIcon from '@coreui/icons-react'
import { cibLibreoffice } from '@coreui/icons'
import { usePermissions } from '@/context/PermissionsContext'

export interface PersonaReporteItem {
    ID_PERSONA?: number | string
    IDENTIFICACION_PERSONA?: string
    NOMBRE_PERSONA?: string
    APELLIDO_PERSONA?: string
    FECHA_PERSONA?: string
    EDAD_PERSONA?: number | string
    CORREO_PERSONA?: string
    ESTADOINSCRIPCION_PERSONA?: number
    TELEFONO_PERSONA?: string
    TIPO_PERSONA?: string
    ESTADO_RENOVACIONES?: number
    cantidad_prestamos?: number
    [key: string]: any
}

export interface UsuNRTProps {
    usuariosNuevos?: any[]
    usuariosRenovaciones?: any[]
    todosUsuarios?: any[]
    loading?: boolean
    visible?: boolean
    setVisible?: (visible: boolean) => void
    onExportarExcel?: () => void
}

const UsuNRT: React.FC<UsuNRTProps> = ({
    usuariosNuevos = [],
    usuariosRenovaciones = [],
    todosUsuarios = [],
    loading = false,
    onExportarExcel,
}) => {

    const { canDoAction } = usePermissions()

    const columns = [
        { key: 'cedula', label: 'Cédula', _style: { width: '13%' } },
        { key: 'nombre', label: 'Nombre', _style: { width: '18%' } },
        { key: 'apellido', label: 'Apellido', _style: { width: '18%' } },
        { key: 'correo', label: 'Correo', _style: { width: '20%' } },
        { key: 'edad', label: 'Edad', _style: { width: '10%' } },
        { key: 'telefono', label: 'Teléfono', _style: { width: '13%' } },
        { key: 'tipo', label: 'Tipo', _style: { width: '10%' } },
    ]

    const renderTabla = (items: any[]) => (
        <CSmartTable
            activePage={1}
            columns={columns}
            items={items}
            itemsPerPage={10}
            pagination
            itemsPerPageSelect
            tableFilter
            tableFilterPlaceholder="Buscar por cédula, nombre, correo..."
            columnSorter
            noItemsLabel={
                    <div className="text-center py-3 text-muted">
                        No se encontraron usuarios para este período.
                    </div>
                
            }
            scopedColumns={{
                cedula: (item: any) => (
                    <td>
                        <span className="font-monospace small badge bg-body border rounded-pill text-body">
                            {item.cedula}
                        </span>
                    </td>
                ),
                nombre: (item: any) => (
                    <td>
                        <span className="font-monospace small">
                            {item.nombre}
                        </span>
                    </td>
                ),
                apellido: (item: any) =>(
                <td>
                    <span className='font-monospace small'>
                        {item.apellido}
                    </span>
                </td>),
                correo: (item: any) => (
                    <td>
                        <span className='badge bg-body border text-primary rounded-pill'>
                            {item.correo}
                        </span>
                    </td>
                ),
                edad: (item: any) => (
                    <td>
                        <span className="badge bg-body-secondary text-body border">
                            {item.edad}
                        </span>
                    </td>
                ),
                telefono: (item: any) => (
                    <td>
                        <span className="font-monospace small">{item.telefono}</span>
                    </td>
                ),
                tipo: (item: any) => (
                    <td>
                        <CBadge color={item.tipoBadgeColor} shape="rounded-pill">
                            {item.tipo}
                        </CBadge>
                    </td>
                ),
            }}
            tableProps={{
                className: 'mb-0',
                responsive: true,
                striped: true,
                hover: true,
            }}
            tableBodyProps={{
                className: 'align-middle',
            }}
        />
    )

    return (
        <CTabs defaultActiveItemKey="home">
            <div className="d-flex flex-wrap justify-content-between align-items-center border-bottom mb-3 pb-1">
                <CTabList variant="tabs" className="border-bottom-0 mb-0">
                    <CTab itemKey="home" className="fw-semibold">
                        Todos ({todosUsuarios.length})
                    </CTab>
                    <CTab itemKey="profile" className="fw-semibold">
                        Nuevos ({usuariosNuevos.length})
                    </CTab>
                    <CTab itemKey="contact" className="fw-semibold">
                        Renovaciones ({usuariosRenovaciones.length})
                    </CTab>
                </CTabList>
                {canDoAction('btn_exportar_excel_usuario') && (
                <CButton 
                    color='success' 
                    size='sm' 
                    className='text-white fw-semibold mb-2 mb-sm-0'
                    onClick={onExportarExcel}
                    disabled={loading || (todosUsuarios.length === 0 && usuariosNuevos.length === 0 && usuariosRenovaciones.length === 0)}
                >
                    <CIcon icon={cibLibreoffice} className='me-1' />
                    Exportar Excel
                </CButton>
            )}
            </div>
            <CTabContent>
                <CTabPanel className="p-3" itemKey="home">
                    {renderTabla(todosUsuarios)}
                </CTabPanel>
                <CTabPanel className="p-3" itemKey="profile">
                    {renderTabla(usuariosNuevos)}
                </CTabPanel>
                <CTabPanel className="p-3" itemKey="contact">
                    {renderTabla(usuariosRenovaciones)}
                </CTabPanel>
            </CTabContent>
        </CTabs>
    )
}

export default UsuNRT