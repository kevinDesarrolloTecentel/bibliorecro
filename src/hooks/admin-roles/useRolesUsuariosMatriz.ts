import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import Swal from 'sweetalert2'
import { asignarRolesUsuario, listarUsuariosConRoles } from '@/Service/adm/Rol'
import { AdminUser } from '@/models/adm/user.model'
import { Rol } from '@/models/adm/rol.model'
import { usePermissions, marcarCambioPermisos } from '@/context/PermissionsContext'
import useAuth from '@/hooks/auth/useAuth'
import { getStoredUser } from '@/utils/auth'
import { parseApiErrors, showErrorAlert } from '@/hooks/adm-user/useUsers'

export const useRolesUsuariosMatriz = (rolesList: Rol[] = [], fetchRoles?: () => Promise<void>) => {
  const { user } = useAuth()
  const { canDoAction, verificarAccionEnServidor } = usePermissions()
  const activeUser = user || getStoredUser()

  const canCheckboxRoles = canDoAction('btn_checkbox_roles')

  const [usuarios, setUsuarios] = useState<AdminUser[]>([])
  const [userRolesMap, setUserRolesMap] = useState<Record<number, Set<number>>>({})
  const [loadingUsuarios, setLoadingUsuarios] = useState<boolean>(true)
  const [savingUserId, setSavingUserId] = useState<number | null>(null)
  const [busqueda, setBusqueda] = useState<string>('')


  // Extraer los IDs de roles asignados a un usuario de cualquier estructura devuelta por el backend
  const extractUserRoleIds = useCallback((u: any): number[] => {
    const ids = new Set<number>()

    // 1. u.roles array de objetos o ids
    if (u.roles && Array.isArray(u.roles)) {
      u.roles.forEach((r: any) => {
        const id = Number(r?.ID_ROL ?? r?.id_rol ?? r?.id ?? r)
        if (!isNaN(id) && id > 0) ids.add(id)
      })
    }

    // 2. u.ROLES array
    if (u.ROLES && Array.isArray(u.ROLES)) {
      u.ROLES.forEach((r: any) => {
        const id = Number(r?.ID_ROL ?? r?.id_rol ?? r?.id ?? r)
        if (!isNaN(id) && id > 0) ids.add(id)
      })
    }

    // 3. u.roles_ids array
    if (u.roles_ids && Array.isArray(u.roles_ids)) {
      u.roles_ids.forEach((id: any) => {
        const num = Number(id)
        if (!isNaN(num) && num > 0) ids.add(num)
      })
    }

    // 4. u.admin_usuario_rol array
    if (u.admin_usuario_rol && Array.isArray(u.admin_usuario_rol)) {
      u.admin_usuario_rol.forEach((r: any) => {
        const id = Number(r?.ID_ROL ?? r?.id_rol ?? r?.id ?? r)
        if (!isNaN(id) && id > 0) ids.add(id)
      })
    }

    // 5. u.usuario_roles
    if (u.usuario_roles && Array.isArray(u.usuario_roles)) {
      u.usuario_roles.forEach((r: any) => {
        const id = Number(r?.ID_ROL ?? r?.id_rol ?? r?.id ?? r)
        if (!isNaN(id) && id > 0) ids.add(id)
      })
    }

    // 6. Fallback a ID_ROL si no se encontraron roles múltiples en los arrays
    if (ids.size === 0) {
      const fallbackId = Number(u.ID_ROL ?? u.id_rol ?? (typeof u.rol === 'object' ? u.rol?.ID_ROL ?? u.rol?.id : u.rol))
      if (!isNaN(fallbackId) && fallbackId > 0) {
        ids.add(fallbackId)
      }
    }

    return Array.from(ids)
  }, [])

  const rolesListRef = useRef(rolesList)
  rolesListRef.current = rolesList

  const fetchUsuarios = useCallback(async () => {
    setLoadingUsuarios(true)
    try {
      const datos = await listarUsuariosConRoles()
      const lista: AdminUser[] = Array.isArray(datos)
        ? datos
        : datos?.data || datos?.users || datos?.usuarios || []

      setUsuarios(lista)

      // Construir mapa de asignación usuarioId -> Set(rolIds) estrictamente desde el backend
      const newMap: Record<number, Set<number>> = {}
      lista.forEach((u) => {
        const uId = Number(u.ID_USUARIO ?? u.id ?? 0)
        if (uId > 0) {
          const roleIds = extractUserRoleIds(u)
          newMap[uId] = new Set(roleIds)
        }
      })

      // Complementar si los roles vienen con lista de usuarios asignados
      const currentRoles = rolesListRef.current
      if (Array.isArray(currentRoles) && currentRoles.length > 0) {
        currentRoles.forEach((r: any) => {
          const rId = Number(r.ID_ROL ?? r.id ?? 0)
          const usersInRole = r.usuarios || r.users || r.admin_usuario || r.admin_usuarios || []
          if (Array.isArray(usersInRole) && rId > 0) {
            usersInRole.forEach((uItem: any) => {
              const uId = Number(uItem?.ID_USUARIO ?? uItem?.id ?? uItem)
              if (uId > 0) {
                if (!newMap[uId]) newMap[uId] = new Set()
                newMap[uId].add(rId)
              }
            })
          }
        })
      }

      setUserRolesMap(newMap)
    } catch (error) {
      console.error('Error al cargar usuarios para matriz de roles:', error)
    } finally {
      setLoadingUsuarios(false)
    }
  }, [extractUserRoleIds])

  useEffect(() => {
    fetchUsuarios()
  }, [fetchUsuarios])

  // Si los roles traen usuarios asignados embebidos, sincronizarlos con la matriz en memoria sin consultar al backend de nuevo
  useEffect(() => {
    if (!Array.isArray(rolesList) || rolesList.length === 0 || usuarios.length === 0) return

    let hasChanges = false
    const updatedMap: Record<number, Set<number>> = { ...userRolesMap }

    rolesList.forEach((r: any) => {
      const rId = Number(r.ID_ROL ?? r.id ?? 0)
      const usersInRole = r.usuarios || r.users || r.admin_usuario || r.admin_usuarios || []
      if (Array.isArray(usersInRole) && rId > 0) {
        usersInRole.forEach((uItem: any) => {
          const uId = Number(uItem?.ID_USUARIO ?? uItem?.id ?? uItem)
          if (uId > 0) {
            if (!updatedMap[uId]) {
              updatedMap[uId] = new Set()
            }
            if (!updatedMap[uId].has(rId)) {
              updatedMap[uId] = new Set(updatedMap[uId])
              updatedMap[uId].add(rId)
              hasChanges = true
            }
          }
        })
      }
    })

    if (hasChanges) {
      setUserRolesMap(updatedMap)
    }
  }, [rolesList, usuarios.length])

  const handleRefrescarTodo = useCallback(async () => {
    await Promise.all([
      fetchUsuarios(),
      fetchRoles ? fetchRoles() : Promise.resolve(),
    ])
  }, [fetchUsuarios, fetchRoles])

  const isRolAsignado = useCallback((usuarioId: number, rolId: number): boolean => {
    return Boolean(userRolesMap[usuarioId]?.has(rolId))
  }, [userRolesMap])

  const handleConfirmarCambioRol = useCallback(async (
    usuario: AdminUser,
    rol: Rol,
  ) => {
    if (!canCheckboxRoles) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para modificar la asignación de roles a los usuarios.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    const usuarioId = Number(usuario.ID_USUARIO ?? usuario.id ?? 0)
    const rolId = Number(rol.ID_ROL ?? rol.id ?? 0)
    if (!usuarioId || !rolId) return

    const rawEstado = usuario.ESTADO_USUARIO ?? (usuario as any).estado
    const isActivo =
      String(rawEstado).toLowerCase() === '1' ||
      String(rawEstado).toLowerCase() === 'activo'

    const nombreUsuario = usuario.NICK_USUARIO || usuario.NOMBRES_USUARIO || `Usuario #${usuarioId}`
    const nombreRol = rol.NOMBRE_ROL || (rol as any).nombre || `Rol #${rolId}`

    if (!isActivo) {
      Swal.fire({
        icon: 'warning',
        title: 'Usuario inactivo',
        text: `No se pueden modificar los roles del usuario "${nombreUsuario}" porque se encuentra inactivo.`,
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    const currentRolesSet = new Set(userRolesMap[usuarioId] || [])
    const isCurrentlyAssigned = currentRolesSet.has(rolId)

    // Salvaguarda: El usuario actual en sesión no debe quitarse su propio rol si es el único
    const currentActiveId = Number(activeUser?.ID_USUARIO ?? activeUser?.id ?? 0)
    if (currentActiveId === usuarioId && isCurrentlyAssigned && currentRolesSet.size <= 1) {
      Swal.fire({
        icon: 'warning',
        title: 'Acción no permitida',
        text: 'No puedes remover tu único rol asignado para no perder acceso a la sesión del sistema.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    const actionText = isCurrentlyAssigned ? 'remover' : 'asignar'
    const titleText = isCurrentlyAssigned ? '¿Remover rol?' : '¿Asignar rol?'
    const confirmBtnColor = isCurrentlyAssigned ? '#dc3545' : '#198754'
    const confirmBtnText = isCurrentlyAssigned ? 'Sí, remover' : 'Sí, asignar'

    const result = await Swal.fire({
      title: titleText,
      html: `¿Estás seguro de que deseas <b>${actionText}</b> el rol <b>${nombreRol}</b> al usuario <b>${nombreUsuario}</b>?`,
      icon: isCurrentlyAssigned ? 'warning' : 'question',
      showCancelButton: true,
      confirmButtonColor: confirmBtnColor,
      cancelButtonColor: '#6c757d',
      confirmButtonText: confirmBtnText,
      cancelButtonText: 'Cancelar',
    })

    if (!result.isConfirmed) return

    const tienePermiso = await verificarAccionEnServidor('btn_checkbox_roles')
    if (!tienePermiso) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para modificar la asignación de roles a los usuarios.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    // Calcular nuevos roles estrictamente como números
    const updatedRolesSet = new Set(currentRolesSet)
    if (isCurrentlyAssigned) {
      updatedRolesSet.delete(rolId)
    } else {
      updatedRolesSet.add(rolId)
    }
    const cleanRolesArray = Array.from(updatedRolesSet)
      .map(Number)
      .filter((n) => !isNaN(n) && n > 0)

    setSavingUserId(usuarioId)
    try {
      await asignarRolesUsuario(usuarioId, cleanRolesArray)

      // Actualizar estado local inmediatamente
      const updatedMap = {
        ...userRolesMap,
        [usuarioId]: new Set(cleanRolesArray),
      }
      setUserRolesMap(updatedMap)

      marcarCambioPermisos()

      Swal.fire({
        icon: 'success',
        title: isCurrentlyAssigned ? 'Rol removido' : 'Rol asignado',
        text: `Se ${isCurrentlyAssigned ? 'removió' : 'asignó'} el rol "${nombreRol}" a ${nombreUsuario}.`,
        timer: 1800,
        showConfirmButton: false,
      })

    } catch (error: any) {
      console.error('Error al actualizar roles del usuario:', error)
      const { title, messages } = parseApiErrors(error, 'Error al actualizar roles del usuario')
      showErrorAlert(title, messages)
    } finally {
      setSavingUserId(null)
    }
  }, [userRolesMap, activeUser, canCheckboxRoles, verificarAccionEnServidor])

  // Filtrado de usuarios por búsqueda
  const usuariosFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    if (!q) return usuarios
    return usuarios.filter((u) => {
      const nick = String(u.NICK_USUARIO || u.usuario || '').toLowerCase()
      const nombre = String(u.NOMBRES_USUARIO || u.nombres || '').toLowerCase()
      return nick.includes(q) || nombre.includes(q)
    })
  }, [usuarios, busqueda])

  return {
    usuarios,
    usuariosFiltrados,
    userRolesMap,
    loadingUsuarios,
    savingUserId,
    busqueda,
    setBusqueda,
    isRolAsignado,
    handleConfirmarCambioRol,
    handleRefrescarTodo,
    fetchUsuarios,
    canCheckboxRoles,
  }
}

export default useRolesUsuariosMatriz
