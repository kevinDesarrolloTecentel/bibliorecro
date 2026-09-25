import {
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CSmartTable,
} from '@coreui/react-pro'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilLockUnlocked, cilShieldAlt } from '@coreui/icons'
import useRoleMatrix from '@/hooks/admin-roles/useRoleMatrix'

const getBadge = (status: string) => {
  switch (status) {
    case 'Activo':
      return 'success'
    case 'Inactivo':
      return 'danger'
    default:
      return 'primary'
  }
}

const AdminRoles = () => {
  const {
    columns,
    items,
    roleScopedColumns,
    loading,
    showTablePassword,
    visiblePasswords,
    togglePasswordVisibility,
  } = useRoleMatrix()

  return (
    <CCard className="mb-4 shadow-sm border-0">
      <CCardHeader className="bg-body py-3">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
          <h5 className="mb-0 fw-bold d-flex align-items-center gap-2">
            <CIcon icon={cilShieldAlt} className="text-primary" />
            <span>Asignación de Roles</span>
          </h5>
        </div>
      </CCardHeader>
      <CCardBody>
        <CSmartTable
          activePage={1}
          columns={columns}
          columnSorter
          items={items}
          itemsPerPageSelect
          itemsPerPage={10}
          loading={loading}
          tableFilter
          tableFilterPlaceholder="Buscar usuario, contraseña o nombre..."
          noItemsLabel="No se encontraron usuarios"
          scopedColumns={{
            Nick_Usuario: (item: any) => (
              <td className="align-middle">
                <span className="fw-semibold text-primary">{item.Nick_Usuario}</span>
              </td>
            ),
            Password: (item: any) => {
              const current = item?.raw || item
              const rawPass = current?.PASSWORD_USUARIO || item.Password || ''
              const isVisible = visiblePasswords[item.id] ?? showTablePassword

              return (
                <td className="align-middle">
                  <div className="d-flex align-items-center gap-2">
                    <span className="font-monospace small text-body">
                      {isVisible && rawPass ? rawPass : '••••••••'}
                    </span>
                    {rawPass && (
                      <CButton
                        size="sm"
                        color="light"
                        variant="ghost"
                        className="p-1 text-muted"
                        onClick={() => togglePasswordVisibility(item.id)}
                        title={isVisible ? 'Ocultar contraseña' : 'Ver contraseña'}
                      >
                        <CIcon icon={isVisible ? cilLockUnlocked : cilLockLocked} />
                      </CButton>
                    )}
                  </div>
                </td>
              )
            },
            Nombre: (item: any) => (
              <td className="align-middle">
                <span className="fw-medium">{item.Nombre}</span>
              </td>
            ),
            status: (item: any) => (
              <td className="text-center align-middle">
                <CBadge color={getBadge(item.status)} className="px-2 py-1">
                  {item.status}
                </CBadge>
              </td>
            ),
            ...roleScopedColumns,
          }}
          tableProps={{
            responsive: true,
            striped: true,
            hover: true,
            className: 'align-middle mb-0',
          }}
          tableBodyProps={{
            className: 'align-middle',
          }}
        />
      </CCardBody>
    </CCard>
  )
}

export default AdminRoles