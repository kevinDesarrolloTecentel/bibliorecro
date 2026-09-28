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
import { cibLibreoffice, cilBadge, cilCalendar, cilCheckCircle } from '@coreui/icons'

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
}

const UsuNRT = () => {


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
                        <span className="badge bg-light text-dark border">
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
            <CTabList variant="tabs">
                <CTab itemKey="home">
                    Todos 
                </CTab>
                <CTab itemKey="profile">
                    Nuevos 
                </CTab>
                <CTab itemKey="contact">
                    Renovaciones 
                </CTab>
                <CButton 
                color='success' 
                variant='outline' 
                size='sm' 
                className='hover:text-white fw-semibold' >
                    <CIcon icon={cibLibreoffice} className='me-1' />
                    Exportar Excel
                </CButton>
            </CTabList>
            <hr />
            <div className='d-flex gap-2'>
                <span className='badge border rounded-pill bg-secondary font-monospace px-3 py-2'><CIcon icon={cilCalendar} className='me-1'/></span>
                <span className='badge border rounded-pill bg-primary font-monospace px-3 py-2'><CIcon icon={cilBadge} className='me-1'/> Nuevos: </span>
                <span className='badge border rounded-pill bg-info font-monospace px-3 py-2'><CIcon icon={cilCheckCircle} className='me-1'/>Renovaciones: </span>
            </div>
            <hr />
            <CTabContent>
                <CTabPanel className="p-3" itemKey="home">
                    {renderTabla([])}
                </CTabPanel>
                <CTabPanel className="p-3" itemKey="profile">
                    {renderTabla([])}
                </CTabPanel>
                <CTabPanel className="p-3" itemKey="contact">
                    {renderTabla([])}
                </CTabPanel>
            </CTabContent>
        </CTabs>
    )
}

export default UsuNRT