import { useState, useMemo, useCallback } from 'react'
import Swal from 'sweetalert2'
import { useRoles } from './useRoles'
import { actualizar } from '@/Service/amd/AdminUser'
import useUsers from '../adm-user/useUsers'

export const useRoleMatrix = () => {
  const userState = useUsers()
  const rolesState = useRoles()
  const [updatingUserId, setUpdatingUserId] = useState<string | number | null>(null)

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

  const handleChangeRol = async (userItem: any, newRoleId: string) => {
    const u = userItem.raw || userItem
    const id = userItem.id || u.ID_USUARIO || u.id
    const currentRolId = String(userItem.rolId || getRoleId(u))

    if (String(newRoleId) === currentRolId) return

    const targetRole = availableRoles.find(
      (r: any) => String(r.ID_ROL ?? r.id) === String(newRoleId)
    )
    const targetRoleName =
      targetRole?.NOMBRE_ROL ||
      targetRole?.nombre ||
      targetRole?.name ||
      (newRoleId === '0' || !newRoleId ? 'Sin Rol' : `Rol ${newRoleId}`)

    const confirm = await Swal.fire({
      title: '¿Cambiar Rol?',
      text: `¿Deseas asignar el rol "${targetRoleName}" al usuario ${userItem.Nombre || userItem.Nick_Usuario}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#321fdb',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, cambiar',
      cancelButtonText: 'Cancelar',
    })

    if (!confirm.isConfirmed) return

    try {
      setUpdatingUserId(id)
      const rolNum = Number(newRoleId) || 0
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

      await actualizar(id, payload)

      Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true,
      }).fire({
        icon: 'success',
        title: `Rol "${targetRoleName}" asignado a @${userItem.Nick_Usuario}`,
      })

      await userState.fetchUsuarios()
    } catch (error: any) {
      console.error('Error al actualizar rol:', error)
      Swal.fire('Error', 'No se pudo actualizar el rol del usuario.', 'error')
    } finally {
      setUpdatingUserId(null)
    }
  }

  const columns = useMemo(() => {
    return [
      {
        key: 'Nick_Usuario',
        label: 'Usuario',
        _style: { width: '22%', minWidth: '140px' },
      },
      {
        key: 'Nombre',
        label: 'Nombre Completo',
        _style: { width: '38%', minWidth: '180px' },
      },
      {
        key: 'Rol',
        label: 'Rol Asignado',
        _style: { width: '25%', minWidth: '180px' },
        filter: false,
        sorter: false,
      },
      {
        key: 'status',
        label: 'Estado',
        _style: { width: '15%', minWidth: '100px' },
        _props: { className: 'text-center' },
      },
    ]
  }, [])

  const items = useMemo(() => {
    return userState.usuarios.map((u: any) => {
      const id = u.ID_USUARIO || u.id
      const nick = u.NICK_USUARIO || u.usuario || u.email || 'Sin usuario'
      const nombre = u.NOMBRES_USUARIO || u.nombres || u.name || 'Sin nombre'
      const rolId = getRoleId(u)
      const rolNombre = getRoleName(rolId, u)
      const estadoRaw = u.ESTADO_USUARIO ?? u.estado ?? 'Activo'
      const status =
        String(estadoRaw).toLowerCase() === '1' || String(estadoRaw).toLowerCase() === 'activo'
          ? 'Activo'
          : 'Inactivo'
      const registered = u.FECHA_REGISTRO || u.fecha_registro || ''

      return {
        id,
        Nick_Usuario: nick,
        Nombre: nombre,
        Rol: rolNombre,
        rolId,
        status,
        registered,
        raw: u,
      }
    })
  }, [userState.usuarios, getRoleId, getRoleName])

  return {
    columns,
    items,
    availableRoles,
    updatingUserId,
    handleChangeRol,
    loading: userState.loading || rolesState.loading,
    userState,
    rolesState,
  }
}

export default useRoleMatrix
