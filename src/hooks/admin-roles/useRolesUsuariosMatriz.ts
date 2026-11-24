import { useState, useEffect, useCallback, useMemo } from 'react'
import Swal from 'sweetalert2'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/store'
import { setUsuarios, actualizarRolesUsuario } from '@/slices/adminSlice'
import { asignarRolesUsuario, listarUsuariosConRoles } from '@/Service/adm/Rol'
import { AdminUsuario } from '@/models/adm/user.model'
import { AdminRol } from '@/models/adm/rol.model'
import { usePermissions, marcarCambioPermisos } from '@/hooks/auth/usePermissions'
import useAuth from '@/hooks/auth/useAuth'
import { parseApiErrors, showErrorAlert } from '@/utils/errors'

export const useRolesUsuariosMatriz = (_rolesList: AdminRol[] = [], fetchRoles?: () => Promise<void>) => {
  const { user } = useAuth()
  const { canDoAction } = usePermissions()

  const canCheckboxRoles = canDoAction('btn_checkbox_roles')

  const dispatch = useDispatch()
  const usuarios = useSelector((state: RootState) => state.admin.usuarios)
  const [userRolesMap, setUserRolesMap] = useState<Record<number, Set<number>>>({})
  const [loadingUsuarios, setLoadingUsuarios] = useState<boolean>(true)
  const [savingUserId, setSavingUserId] = useState<number | null>(null)
  const [busqueda, setBusqueda] = useState<string>('')

  // Extraer los IDs de roles asignados a un usuario desde el modelo oficial AdminUsuario
  const extractUserRoleIds = useCallback((u: AdminUsuario): number[] => {
    const ids = new Set<number>()

    if (u.ROLES && Array.isArray(u.ROLES)) {
      u.ROLES.forEach((r: AdminRol) => {
        const id = Number(r?.ID_ROL)
        if (!isNaN(id) && id > 0) ids.add(id)
      })
    }

    if (ids.size === 0 && u.ID_ROL) {
      const id = Number(u.ID_ROL)
      if (!isNaN(id) && id > 0) ids.add(id)
    }

    return Array.from(ids)
  }, [])

  const fetchUsuarios = useCallback(async () => {
    setLoadingUsuarios(true)
    try {
      const datos = await listarUsuariosConRoles()
      const lista: AdminUsuario[] = Array.isArray(datos)
        ? datos
        : datos?.data || []

      dispatch(setUsuarios(lista))

      // Construir mapa de asignación usuarioId -> Set(rolIds) estrictamente desde el backend
      const newMap: Record<number, Set<number>> = {}
      lista.forEach((u) => {
        const uId = Number(u.ID_USUARIO ?? 0)
        if (uId > 0) {
          const roleIds = extractUserRoleIds(u)
          newMap[uId] = new Set(roleIds)
        }
      })

      setUserRolesMap(newMap)
    } catch (error) {
      console.error('Error al cargar usuarios para matriz de roles:', error)
    } finally {
      setLoadingUsuarios(false)
    }
  }, [extractUserRoleIds, dispatch])

  useEffect(() => {
    fetchUsuarios()
  }, [fetchUsuarios])

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
    usuario: AdminUsuario,
    rol: AdminRol,
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

    const usuarioId = Number(usuario.ID_USUARIO ?? 0)
    const rolId = Number(rol.ID_ROL ?? 0)
    if (!usuarioId || !rolId) return

    const isActivo = Number(usuario.ESTADO_USUARIO) === 1

    const nombreUsuario = usuario.NICK_USUARIO || usuario.NOMBRES_USUARIO || `Usuario #${usuarioId}`
    const nombreRol = rol.NOMBRE_ROL || `Rol #${rolId}`

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
    const currentActiveId = Number(user?.ID_USUARIO ?? 0)
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

      // Sincronizar inmediatamente en Redux (lista de usuarios y usuarioSeleccionado)
      const updatedRolesObjects: AdminRol[] = cleanRolesArray
        .map((rId) => _rolesList.find((r) => Number(r.ID_ROL) === rId))
        .filter(Boolean) as AdminRol[]

      dispatch(actualizarRolesUsuario({ idUsuario: usuarioId, roles: updatedRolesObjects }))

      marcarCambioPermisos()

      Swal.fire({
        icon: 'success',
        title: isCurrentlyAssigned ? 'Rol removido' : 'Rol asignado',
        text: `Se ${isCurrentlyAssigned ? 'removió' : 'asignó'} el rol "${nombreRol}" a ${nombreUsuario}.`,
        timer: 1800,
        showConfirmButton: false,
      })

      // Sincronizar en segundo plano con el backend
      await fetchUsuarios()
    } catch (error: any) {
      console.error('Error al actualizar roles del usuario:', error)
      const { title, messages } = parseApiErrors(error, 'Error al actualizar roles del usuario')
      showErrorAlert(title, messages)
    } finally {
      setSavingUserId(null)
    }
  }, [userRolesMap, user, canCheckboxRoles, _rolesList, dispatch, fetchUsuarios])

  // Filtrado de usuarios por búsqueda
  const usuariosFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    if (!q) return usuarios
    return usuarios.filter((u) => {
      const nick = String(u.NICK_USUARIO || '').toLowerCase()
      const nombre = String(u.NOMBRES_USUARIO || '').toLowerCase()
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
