import { useState, useEffect, useCallback } from 'react'
import Swal from 'sweetalert2'
import { getStoredUser, setAuthSession } from '@/utils/auth'
import { useDispatch } from 'react-redux'
import { loginSuccess } from '@/authSlice'
import { actualizar, crear, eliminar, listar, perfil, ver } from '@/Service/amd/AdminUser'
import { listarRoles } from '@/Service/amd/rolService'
import { UserData } from '@/models/auth'
import useAuth from '@/hooks/useAuth'

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true
})

const formatApiError = (error: any, defaultMsg: string): string => {
  const data = error?.response?.data
  if (!data) return error?.message || defaultMsg
  if (typeof data === 'string') return data
  if (data.errors && typeof data.errors === 'object') {
    const msgs = Object.entries(data.errors)
      .map(([field, msgList]: [string, any]) => {
        const text = Array.isArray(msgList) ? msgList.join(', ') : String(msgList)
        return `${field}: ${text}`
      })
      .join(' | ')
    if (msgs) return msgs
  }
  if (data.message && typeof data.message === 'string') return data.message
  if (data.error && typeof data.error === 'string') return data.error
  if (data.msg && typeof data.msg === 'string') return data.msg
  return defaultMsg
}

export const useUsers = () => {
  const [usuarios, setUsuarios] = useState<any[]>([])
  const [rolesList, setRolesList] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showTablePassword, setShowTablePassword] = useState(false)
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string | number, boolean>>({})
  const [modalVisible, setModalVisible] = useState(false)
  const [modalEdit, setModalEdit] = useState(false)
  const [filtroRol, setFiltroRol] = useState<string>('todos')
  const [formData, setFormData] = useState({
    nombres: '',
    password: '',
    usuario: '',
    rol: '',
    estado: 'Activo'
  })
  const [editFormData, setEditFormData] = useState({
    id: '',
    nombres: '',
    password: '',
    usuario: '',
    rol: '',
    estado: 'Activo'
  })
  const dispatch = useDispatch()
  const { user } = useAuth()
  const activeUser = user || getStoredUser()


  const fetchUsuarios = useCallback(async () => {
    setLoading(true)
    setErrorMsg(null)
    try {
      const datos = await listar()
      const lista = Array.isArray(datos)
        ? datos
        : datos?.data || datos?.users || datos?.usuarios || []
      setUsuarios(lista)
    } catch (error: any) {
      console.error('Error al listar usuarios:', error)
      if (error?.response?.status === 401) {
        setErrorMsg(
          'El servidor rechazó la autenticación (Error 401: Unauthenticated). Por favor, haz clic en "Iniciar Sesión" para reintentar.',
        )
      } else {
        setErrorMsg('No se pudo conectar con el servidor para obtener los usuarios.')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchRoles = useCallback(async () => {
    try {
      const datos = await listarRoles()
      const lista = Array.isArray(datos) ? datos : datos?.data || datos?.roles || []
      if (lista.length > 0) {
        setRolesList(lista)
      }
    } catch (error) {
      console.error('Error al cargar roles:', error)
    }
  }, [])

  const handleCrearUsuario = async (formData: any): Promise<boolean> => {
    if (
      !formData.usuario?.trim() ||
      !formData.password?.trim() ||
      !formData.nombres?.trim() ||
      !formData.rol
    ) {
      Toast.fire({
        icon: 'warning',
        title: 'Por favor, completa todos los campos requeridos',
      })
      return false
    }

    try {
      setGuardando(true)
      const estadoNum = formData.estado === 'Activo' || formData.estado === '1' ? 1 : 0
      const rolNum = Number(formData.rol) || formData.rol

      const payload: any = {
        NICK_USUARIO: formData.usuario.trim(),
        PASSWORD_USUARIO: formData.password,
        NOMBRES_USUARIO: formData.nombres.trim(),
        ID_ROL: rolNum,
        ESTADO_USUARIO: estadoNum,
        rol: rolNum,
        estado: estadoNum,
        usuario: formData.usuario.trim(),
        password: formData.password,
        nombres: formData.nombres.trim(),
      }

      await crear(payload)
      Toast.fire({
        icon: 'success',
        title: 'Usuario creado exitosamente',
      })
      await fetchUsuarios()
      return true
    } catch (error: any) {
      console.error('Error al crear usuario:', error)
      const msg = formatApiError(error, 'Error al crear el usuario')
      Toast.fire({
        icon: 'error',
        title: msg,
      })
      return false
    } finally {
      setGuardando(false)
    }
  }

  const handleActualizarUsuario = async (
    id: string | number,
    editFormData: any,
  ): Promise<boolean> => {
    if (!editFormData.usuario?.trim() || !editFormData.nombres?.trim() || !editFormData.rol) {
      Toast.fire({
        icon: 'warning',
        title: 'Por favor, completa los campos requeridos',
      })
      return false
    }

    try {
      setGuardando(true)
      const estadoNum = editFormData.estado === 'Activo' || editFormData.estado === '1' ? 1 : 0
      const rolNum = Number(editFormData.rol) || editFormData.rol

      const payload: any = {
        NICK_USUARIO: editFormData.usuario.trim(),
        NOMBRES_USUARIO: editFormData.nombres.trim(),
        ID_ROL: rolNum,
        ESTADO_USUARIO: estadoNum,
        rol: rolNum,
        estado: estadoNum,
      }
      if (editFormData.password && editFormData.password.trim() !== '') {
        payload.PASSWORD_USUARIO = editFormData.password
        payload.password = editFormData.password
      }

      await actualizar(id, payload)
      Toast.fire({
        icon: 'success',
        title: 'Usuario actualizado exitosamente',
      })
      await fetchUsuarios()
      return true
    } catch (error: any) {
      console.error('Error al actualizar usuario:', error)
      const msg = formatApiError(error, 'Error al actualizar el usuario')
      Toast.fire({
        icon: 'error',
        title: msg,
      })
      return false
    } finally {
      setGuardando(false)
    }
  }

  const handleEliminarUsuario = async (id: string | number, nombre?: string): Promise<boolean> => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar al usuario ${nombre ? `"${nombre}"` : ''}? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e55353',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    })

    if (!result.isConfirmed) return false

    try {
      setGuardando(true)
      await eliminar(id)
      Toast.fire({
        icon: 'success',
        title: 'Usuario eliminado exitosamente',
      })
      await fetchUsuarios()
      return true
    } catch (error: any) {
      console.error('Error al eliminar usuario:', error)
      const msg = formatApiError(error, 'Error al eliminar el usuario')
      Toast.fire({
        icon: 'error',
        title: msg,
      })
      return false
    } finally {
      setGuardando(false)
    }
  }

  const cambiarEstadoUsuario = async (item: any): Promise<boolean> => {
    const u = item.raw || item
    const id = item.id || u.ID_USUARIO
    const estadoActual = item.Estado || u.ESTADO_USUARIO || 'Activo'
    const nuevoEstado = estadoActual === 'Activo' ? 'Inactivo' : 'Activo'
    const estadoNum = nuevoEstado === 'Activo' ? 1 : 0

    try {
      setGuardando(true)
      const payload: any = {
        NICK_USUARIO: item.Usuario || u.NICK_USUARIO,
        NOMBRES_USUARIO: item.Nombres || u.NOMBRES_USUARIO,
        ID_ROL: u.ID_ROL ?? item.Rol,
        ESTADO_USUARIO: estadoNum,
        estado: estadoNum,
      }
      await actualizar(id, payload)
      Toast.fire({
        icon: 'success',
        title: `Usuario ${nuevoEstado === 'Activo' ? 'activado' : 'desactivado'} exitosamente`,
      })
      await fetchUsuarios()
      return true
    } catch (error: any) {
      console.error('Error al cambiar estado:', error)
      const msg = formatApiError(error, 'Error al cambiar el estado del usuario')
      Toast.fire({
        icon: 'error',
        title: msg,
      })
      return false
    } finally {
      setGuardando(false)
    }
  }

  const getRolNombre = (rolVal: string | number) => {
    if (!rolVal) return 'Sin Rol'
    const target = String(rolVal).toLowerCase()
    const found = rolesList.find((r: any) => {
      const id = String(r.ID_ROL ?? r.id ?? '').toLowerCase()
      const nom = String(r.NOMBRE_ROL ?? r.nombre ?? r.name ?? '').toLowerCase()
      return id === target || nom === target
    })
    if (found) {
      return found.NOMBRE_ROL || found.nombre || found.name || 'Sin Rol'
    }
    if (target === '1' || target === 'admin' || target === 'administrador') return 'Administrador'
    if (target === '2' || target === 'bibliotecario') return 'Bibliotecario'
    return String(rolVal)
  }

  useEffect(() => {
    fetchUsuarios()
    fetchRoles()
  }, [fetchUsuarios, fetchRoles])

  const handleGuardarUsuario = async () => {
    const ok = await handleCrearUsuario(formData)
    if (ok) {
      setModalVisible(false)
      setFormData({
        nombres: '',
        password: '',
        usuario: '',
        rol: '',
        estado: 'Activo'
      })
    }
  }

  const handleGuardarEditar = async () => {
    const ok = await handleActualizarUsuario(editFormData.id, editFormData)
    if (ok) {
      setModalEdit(false)
    }
  }

  const togglePasswordVisibility = (id: string | number) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const handleAbrirEditar = async (item: any) => {
    const u = item.raw || item
    const id = String(item.id || u.ID_USUARIO || '')
    const rawRol = u.ID_ROL ?? u.rol ?? item.Rol ?? ''
    let rolVal = String(rawRol)

    const found = rolesList.find((r: any) => {
      const rId = String(r.ID_ROL ?? r.id ?? '')
      const nom = String(r.NOMBRE_ROL ?? r.nombre ?? r.name ?? '').toLowerCase()
      return rId === rolVal || nom === rolVal.toLowerCase()
    })
    if (found) {
      rolVal = String(found.ID_ROL ?? found.id)
    } else {
      const r = rolVal.toLowerCase()
      if (r === 'admin' || r === 'administrador') rolVal = '1'
      else if (r === 'bibliotecario') rolVal = '2'
    }

    let existingPassword =
      u.PASSWORD_USUARIO ||
      u.password ||
      u.contrasena ||
      u.clave ||
      (item.Contraseña && item.Contraseña !== '••••••••' ? item.Contraseña : '') ||
      ''

    if (!existingPassword) {
      const current = activeUser || getStoredUser()
      if (
        current &&
        (String(current.ID_USUARIO) === id ||
          String(current.id) === id ||
          (current.NICK_USUARIO && current.NICK_USUARIO === (item.Usuario || u.NICK_USUARIO)))
      ) {
        existingPassword = current.PASSWORD_USUARIO || current.password || ''
      }
    }

    setEditFormData({
      id,
      usuario: item.Usuario || u.NICK_USUARIO || '',
      password: existingPassword,
      nombres: item.Nombres || u.NOMBRES_USUARIO || '',
      rol: rolVal,
      estado: item.Estado || u.ESTADO_USUARIO || 'Activo',
    })
    setShowPassword(false)
    setModalEdit(true)

    if (!existingPassword && id) {
      try {
        const res = await ver(id)
        const detalle = res?.data || res?.usuario || res?.user || res
        const foundPass = detalle?.PASSWORD_USUARIO || detalle?.password || detalle?.contrasena || detalle?.clave
        if (foundPass) {
          setEditFormData((prev) => ({
            ...prev,
            password: foundPass,
          }))
        }
      } catch (err) {
        console.error('Error al obtener detalle del usuario:', err)
      }
    }
  }

  const handleOpenEditModal = () => {
    const current = user || getStoredUser()
    setFormData((prev) => ({
      ...prev,
      usuario: current?.NICK_USUARIO || current?.Usuario || current?.usuario || prev.usuario,
      rol: String(current?.ID_ROL || current?.rol || prev.rol || ''),
      estado: current?.ESTADO_USUARIO || current?.Estado || prev.estado,
      nombres: current?.NOMBRES_USUARIO || current?.NOMBRE_USUARIO || current?.Nombres || current?.nombres || '',
      password: current?.PASSWORD_USUARIO || current?.password || '',
    }))
    setShowPassword(false)
    setModalVisible(true)
  }

  const items = activeUser
    ? [
      {
        id: activeUser.ID_USUARIO || activeUser.id || 1,
        Usuario: activeUser.NICK_USUARIO || activeUser.Usuario || activeUser.usuario || '',
        Contraseña: activeUser.PASSWORD_USUARIO || activeUser.password || '••••••••',
        Nombres: activeUser.NOMBRES_USUARIO || activeUser.NOMBRE_USUARIO || 'No disponible',
        fecha_registro: activeUser.FECHA_REGISTRO || activeUser.fecha_registro || '',
        Estado: activeUser.ESTADO_USUARIO || activeUser.NOMBRE_ESTADO || 'Activo',
      },
    ]
    : []

  const handleGuardar = async () => {
    const current = user || getStoredUser()
    const userId = current?.ID_USUARIO || current?.id
    if (!userId) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo identificar el ID del usuario actual.',
      })
      return
    }

    setLoading(true)
    try {
      const passToSave = formData.password || current?.PASSWORD_USUARIO || current?.password
      const payload = {
        ...current,
        NOMBRES_USUARIO: formData.nombres,
        PASSWORD_USUARIO: passToSave,
        password: passToSave,
      }

      await actualizar(userId, payload)

      const updatedUser: UserData = {
        ...current,
        NOMBRES_USUARIO: formData.nombres,
        PASSWORD_USUARIO: passToSave,
        password: passToSave,
        token: current?.token,
      }

      setAuthSession(updatedUser, current?.token)
      dispatch(loginSuccess(updatedUser))

      await Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 900,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.onmouseenter = Swal.stopTimer;
          toast.onmouseleave = Swal.resumeTimer;
        }
      }).fire({
        icon: "success",
        title: "Datos actualizados correctamente"
      });
      setModalVisible(false)
    } catch (error) {
      console.error('Error actualizando usuario:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error al actualizar',
        text: 'No se ha podido actualizar. Intentelo Nuevamente',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true
    const fetchUserData = async () => {
      const current = user || getStoredUser()
      if (!current) return
      try {
        const res = await perfil()
        const fresh = res?.user || res?.cliente || res?.data || res
        if (isMounted && fresh) {
          const pass = fresh.PASSWORD_USUARIO || fresh.password || current?.PASSWORD_USUARIO || current?.password
          const updatedUser: UserData = {
            ...current,
            ...fresh,
            PASSWORD_USUARIO: pass,
            password: pass,
            token: current.token,
          }
          setAuthSession(updatedUser, current.token)
          dispatch(loginSuccess(updatedUser))
        }
      } catch {
      }
    }
    fetchUserData()
    return () => {
      isMounted = false
    }
  }, [dispatch])

  return {
    usuarios,
    rolesList,
    loading,
    guardando,
    errorMsg,
    showPassword,
    setShowPassword,
    showTablePassword,
    setShowTablePassword,
    visiblePasswords,
    togglePasswordVisibility,
    modalVisible,
    setModalVisible,
    modalEdit,
    setModalEdit,
    filtroRol,
    setFiltroRol,
    formData,
    setFormData,
    editFormData,
    setEditFormData,
    fetchUsuarios,
    fetchRoles,
    handleCrearUsuario,
    handleActualizarUsuario,
    handleEliminarUsuario,
    handleGuardarEditar,
    handleGuardarUsuario,
    handleAbrirEditar,
    cambiarEstadoUsuario,
    getRolNombre,
    handleOpenEditModal,
    handleGuardar,
    items,
    user: activeUser,
    activeUser,
    getStoredUser,
  }
}

export default useUsers
