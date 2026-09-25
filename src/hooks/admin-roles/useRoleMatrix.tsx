import React, { useState, useMemo, useCallback } from 'react'
import { CFormCheck, CSpinner } from '@coreui/react-pro'
import Swal from 'sweetalert2'
import { useRoles } from './useRoles'
import { actualizar } from '@/Service/amd/AdminUser'
import useUsers from '../adm-user/useUsers'

export const useRoleMatrix = () => {
  const userState = useUsers()
  const rolesState = useRoles()
  const [updatingState, setUpdatingState] = useState<{
    userId: string | number
    roleId: string | number
  } | null>(null)

  const availableRoles = useMemo(() => {
    return rolesState.roles.length > 0 ? rolesState.roles : userState.rolesList
  }, [rolesState.roles, userState.rolesList])

  const getRoleId = useCallback(
    (userRaw: any): string => {
      const rawRol = userRaw.ID_ROL ?? userRaw.rol ?? ''
      if (!rawRol && rawRol !== 0) return ''
      const str = String(rawRol).toLowerCase()
      const found = availableRoles.find((r: any) => {
        const rId = String(r.ID_ROL ?? r.id ?? '').toLowerCase()
        const rName = String(r.NOMBRE_ROL ?? r.nombre ?? r.name ?? '').toLowerCase()
        return rId === str || rName === str
      })
      if (found) {
        return String(found.ID_ROL ?? found.id)
      }
      if (str === 'administrador' || str === 'admin') {
        const admin = availableRoles.find((r: any) =>
          String(r.NOMBRE_ROL ?? r.nombre ?? '').toLowerCase().includes('admin')
        )
        if (admin) return String(admin.ID_ROL ?? admin.id)
        return '1'
      }
      if (str === 'bibliotecario') {
        const biblio = availableRoles.find((r: any) =>
          String(r.NOMBRE_ROL ?? r.nombre ?? '').toLowerCase().includes('biblio')
        )
        if (biblio) return String(biblio.ID_ROL ?? biblio.id)
        return '2'
      }
      return String(rawRol)
    },
    [availableRoles]
  )

  const getRoleName = useCallback(
    (rolId: string, u: any): string => {
      const found = availableRoles.find((r: any) => {
        const id = String(r.ID_ROL ?? r.id ?? '').toLowerCase()
        const nom = String(r.NOMBRE_ROL ?? r.nombre ?? r.name ?? '').toLowerCase()
        return id === String(rolId).toLowerCase() || nom === String(rolId).toLowerCase()
      })
      if (found) {
        return found.NOMBRE_ROL || found.nombre || found.name || 'Sin Rol'
      }
      return userState.getRolNombre(rolId || u.ID_ROL || u.rol)
    },
    [availableRoles, userState]
  )

  const handleToggleRol = async (
    userItem: any,
    targetRoleId: string,
    targetRoleName: string,
    isCurrentlyChecked: boolean
  ) => {
    const u = userItem.raw || userItem
    const id = userItem.id || u.ID_USUARIO || u.id

    if (isCurrentlyChecked) {
      const confirm = await Swal.fire({
        title: '¿Deshabilitar Rol?',
        text: `¿Deseas deshabilitar el rol "${targetRoleName}" para el usuario ${userItem.Nombre || userItem.Nick_Usuario}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#e55353',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, deshabilitar',
        cancelButtonText: 'Cancelar',
      })

      if (!confirm.isConfirmed) return

      try {
        setUpdatingState({ userId: id, roleId: targetRoleId })
        const estadoNum =
          userItem.status === 'Activo' || String(u.ESTADO_USUARIO) === '1' ? 1 : 0

        const payload: any = {
          NICK_USUARIO: userItem.Nick_Usuario || u.NICK_USUARIO || u.usuario || '',
          NOMBRES_USUARIO: userItem.Nombre || u.NOMBRES_USUARIO || u.nombres || '',
          ID_ROL: 0,
          rol: 0,
          ESTADO_USUARIO: estadoNum,
          estado: estadoNum,
        }

        if (u.PASSWORD_USUARIO) {
          payload.PASSWORD_USUARIO = u.PASSWORD_USUARIO
          payload.password = u.PASSWORD_USUARIO
        }

        await actualizar(id, payload)

        Swal.mixin({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 2500,
          timerProgressBar: true,
        }).fire({
          icon: 'info',
          title: `Rol "${targetRoleName}" deshabilitado`,
        })

        await userState.fetchUsuarios()
      } catch (error: any) {
        console.error('Error al deshabilitar rol:', error)
        Swal.fire('Error', 'No se pudo deshabilitar el rol.', 'error')
      } finally {
        setUpdatingState(null)
      }
    } else {
      try {
        setUpdatingState({ userId: id, roleId: targetRoleId })
        const rolNum = Number(targetRoleId) || targetRoleId
        const estadoNum =
          userItem.status === 'Activo' || String(u.ESTADO_USUARIO) === '1' ? 1 : 0

        const payload: any = {
          NICK_USUARIO: userItem.Nick_Usuario || u.NICK_USUARIO || u.usuario || '',
          NOMBRES_USUARIO: userItem.Nombre || u.NOMBRES_USUARIO || u.nombres || '',
          ID_ROL: rolNum,
          rol: rolNum,
          ESTADO_USUARIO: estadoNum,
          estado: estadoNum,
        }

        if (u.PASSWORD_USUARIO) {
          payload.PASSWORD_USUARIO = u.PASSWORD_USUARIO
          payload.password = u.PASSWORD_USUARIO
        }

        await actualizar(id, payload)

        Swal.mixin({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 2500,
          timerProgressBar: true,
        }).fire({
          icon: 'success',
          title: `Rol "${targetRoleName}" habilitado para @${userItem.Nick_Usuario}`,
        })

        await userState.fetchUsuarios()
      } catch (error: any) {
        console.error('Error al habilitar rol:', error)
        Swal.fire('Error', 'No se pudo habilitar el rol para el usuario.', 'error')
      } finally {
        setUpdatingState(null)
      }
    }
  }

  const roleColumns = useMemo(() => {
    return availableRoles.map((r: any) => {
      const id = String(r.ID_ROL ?? r.id ?? '')
      const nombre = r.NOMBRE_ROL ?? r.nombre ?? r.name ?? `Rol ${id}`
      return {
        key: `rol_${id}`,
        label: nombre,
        filter: false,
        sorter: false,
        _style: { minWidth: '120px' },
        _props: { className: 'text-center' },
      }
    })
  }, [availableRoles])

  const [showTablePassword, setShowTablePassword] = useState(false)
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string | number, boolean>>({})

  const togglePasswordVisibility = useCallback((id: string | number) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }, [])

  const columns = useMemo(() => {
    return [
      {
        key: 'Nick_Usuario',
        label: 'Usuario',
        _style: { width: '16%', minWidth: '130px' },
      },
      {
        key: 'Password',
        label: 'Contraseña',
        _style: { width: '15%', minWidth: '130px' },
        filter: false,
        sorter: false,
      },
      {
        key: 'Nombre',
        label: 'Nombre Completo',
        _style: { width: '22%', minWidth: '160px' },
      },
      ...roleColumns,
      {
        key: 'status',
        label: 'Estado',
        _style: { width: '90px' },
        _props: { className: 'text-center' },
      },
    ]
  }, [roleColumns])

  const items = useMemo(() => {
    return userState.usuarios.map((u: any) => {
      const id = u.ID_USUARIO || u.id
      const nick = u.NICK_USUARIO || u.usuario || u.email || 'Sin usuario'
      const nombre = u.NOMBRES_USUARIO || u.nombres || u.name || 'Sin nombre'
      const password = u.PASSWORD_USUARIO || u.password || ''
      const rolId = getRoleId(u)
      const rolNombre = getRoleName(rolId, u)
      const estadoRaw = u.ESTADO_USUARIO ?? u.estado ?? 'Activo'
      const status =
        String(estadoRaw).toLowerCase() === '1' || String(estadoRaw).toLowerCase() === 'activo'
          ? 'Activo'
          : 'Inactivo'
      const registered = u.FECHA_REGISTRO || u.fecha_registro || ''

      const roleFlags: Record<string, boolean> = {}
      availableRoles.forEach((r: any) => {
        const rId = String(r.ID_ROL ?? r.id ?? '')
        roleFlags[`rol_${rId}`] = String(rolId) === String(rId)
      })

      return {
        id,
        Nick_Usuario: nick,
        Password: password,
        Nombre: nombre,
        Rol: rolNombre,
        rolId,
        status,
        registered,
        raw: u,
        ...roleFlags,
      }
    })
  }, [userState.usuarios, availableRoles, getRoleId, getRoleName])

  const roleScopedColumns = useMemo(() => {
    const map: Record<string, (item: any) => React.ReactNode> = {}
    availableRoles.forEach((r: any) => {
      const id = String(r.ID_ROL ?? r.id ?? '')
      const roleName = r.NOMBRE_ROL ?? r.nombre ?? r.name ?? `Rol ${id}`

      map[`rol_${id}`] = (item: any) => {
        const isSelected = String(item.rolId) === String(id)
        const isUpdating =
          updatingState?.userId === item.id && updatingState?.roleId === id

        return (
          <td className="text-center align-middle" key={`cell_${item.id}_${id}`}>
            <div className="d-flex justify-content-center align-items-center py-1">
              {isUpdating ? (
                <CSpinner size="sm" color="primary" />
              ) : (
                <div
                  className="d-inline-flex justify-content-center align-items-center p-1 rounded hover-bg"
                  title={
                    isSelected
                      ? `Rol "${roleName}" habilitado para @${item.Nick_Usuario}. Clic para deshabilitar.`
                      : `Marcar para habilitar rol "${roleName}" a @${item.Nick_Usuario}`
                  }
                >
                  <CFormCheck
                    id={`check_${item.id}_${id}`}
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleToggleRol(item, id, roleName, isSelected)}
                    style={{
                      transform: 'scale(1.35)',
                      cursor: 'pointer',
                    }}
                  />
                </div>
              )}
            </div>
          </td>
        )
      }
    })
    return map
  }, [availableRoles, updatingState])

  return {
    columns,
    items,
    roleScopedColumns,
    loading: userState.loading || rolesState.loading,
    userState,
    rolesState,
    showTablePassword,
    setShowTablePassword,
    visiblePasswords,
    togglePasswordVisibility,
  }
}

export default useRoleMatrix
