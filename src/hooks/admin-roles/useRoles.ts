import { useState, useEffect, useCallback } from 'react'
import Swal from 'sweetalert2'
import { Rol } from '@/models/adm/rol.model'
import { actualizarRol, crearRol, eliminarRol, listarRoles } from '@/Service/amd/rolService'

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer
    toast.onmouseleave = Swal.resumeTimer
  },
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

export const useRoles = () => {
  const [roles, setRoles] = useState<Rol[]>([])
  const [loading, setLoading] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [modalEditar, setModalEditar] = useState(false)
  const [modalCrear, setModalCrear] = useState(false)

  const fetchRoles = useCallback(async () => {
    setLoading(true)
    setErrorMsg(null)
    try {
      const response = await listarRoles()
      let lista: any[] = []
      if (Array.isArray(response)) {
        lista = response
      } else if (response && Array.isArray(response.data)) {
        lista = response.data
      } else if (response && Array.isArray(response.roles)) {
        lista = response.roles
      }
      setRoles(lista)
    } catch (error: any) {
      const msg = formatApiError(error, 'Error al obtener la lista de roles.')
      setErrorMsg(msg)
      Toast.fire({ icon: 'error', title: msg })
    } finally {
      setLoading(false)
    }
  }, [])

  const handleCrearRol = async (formData: any): Promise<boolean> => {
    setGuardando(true)
    try {
      const payload = {
        NOMBRE_ROL: formData.nombre,
        DESCRIPCION_ROL: formData.descripcion,
        NIVEL_ACCESO: Number(formData.nivel || 1),
        ESTADO_ROL: formData.estado || 'Activo',
      }
      await crearRol(payload)
      Toast.fire({ icon: 'success', title: 'Rol creado exitosamente' })
      await fetchRoles()
      return true
    } catch (error: any) {
      const msg = formatApiError(error, 'No se pudo crear el rol')
      Swal.fire('Error al crear rol', msg, 'error')
      return false
    } finally {
      setGuardando(false)
    }
  }
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    nivel: 1,
    estado: 'Activo'
  })

  const [editFormData, setEditFormData] = useState({
    id: '',
    nombre: '',
    descripcion: '',
    nivel: 1,
    estado: 'Activo'
  })

  const handleListarRoles = async () => {
    try {
      setLoading(true)
      setErrorMsg(null)
      const res = await listarRoles()
      const lista = Array.isArray(res) ? res : (res?.data || res?.roles || [])
      setRoles(lista)
    } catch (error: any) {
      console.error('Error al listar roles:', error)
      if (error?.response?.status === 401) {
        setErrorMsg('El servidor rechazó la autenticación (401: Unauthenticated). Inicia sesión nuevamente.')
      } else {
        setErrorMsg('No se pudo conectar con el servidor para obtener los roles.')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    handleListarRoles()
  }, [])

  const handleAbrirEditar = (item: any) => {
    const r = item.raw || item
    const id = String(item.ID || r.ID_ROL || r.id || '')
    const nombre = String(item.Nombre || r.NOMBRE_ROL || r.nombre || '')
    const rawDesc = r.DESCRIPCION_ROL ?? r.DESCRIPCION ?? ''
    const descripcion = String(item.Descripcion && item.Descripcion !== '-' ? item.Descripcion : rawDesc)
    const nivel = Number(r.NIVEL_ROL ?? r.nivel ?? 1)
    const estado = item.Estado || 'Activo'

    setEditFormData({
      id,
      nombre,
      descripcion,
      nivel,
      estado
    })
    setModalEditar(true)
  }

  const handleGuardarRol = async () => {
    if (!formData.nombre.trim()) {
      Toast.fire({
        icon: 'warning',
        title: 'Por favor, ingresa el nombre del rol'
      })
      return
    }

    try {
      setGuardando(true)
      const estadoNum = (formData.estado === 'Activo' || formData.estado === '1') ? 1 : 0
      const nivelNum = Number(formData.nivel) || 1
      const payload: any = {
        NOMBRE_ROL: formData.nombre.trim(),
        DESCRIPCION_ROL: formData.descripcion.trim(),
        DESCRIPCION: formData.descripcion.trim(),
        descripcion_rol: formData.descripcion.trim(),
        descripcion: formData.descripcion.trim(),
        description: formData.descripcion.trim(),
        DETALLE_ROL: formData.descripcion.trim(),
        NIVEL_ROL: nivelNum,
        nivel_rol: nivelNum,
        nivel: nivelNum,
        ESTADO_ROL: estadoNum,
        estado: estadoNum,
        nombre: formData.nombre.trim(),
        name: formData.nombre.trim()
      }

      await crearRol(payload)
      setModalCrear(false)
      setFormData({
        nombre: '',
        descripcion: '',
        nivel: 1,
        estado: 'Activo'
      })
      await handleListarRoles()
      Toast.fire({
        icon: 'success',
        title: 'Rol creado exitosamente'
      })
    } catch (error: any) {
      console.error('Error al crear rol:', error)
      const msg = formatApiError(error, 'Error al crear el rol')
      Toast.fire({
        icon: 'error',
        title: msg
      })
    } finally {
      setGuardando(false)
    }
  }

  const handleActualizarRol = async () => {
    if (!editFormData.nombre.trim()) {
      Toast.fire({
        icon: 'warning',
        title: 'Por favor, ingresa el nombre del rol'
      })
      return
    }

    try {
      setGuardando(true)
      const estadoNum = (editFormData.estado === 'Activo' || editFormData.estado === '1') ? 1 : 0
      const nivelNum = Number(editFormData.nivel) || 1
      const payload: any = {
        NOMBRE_ROL: editFormData.nombre.trim(),
        DESCRIPCION_ROL: editFormData.descripcion.trim(),
        DESCRIPCION: editFormData.descripcion.trim(),
        descripcion_rol: editFormData.descripcion.trim(),
        descripcion: editFormData.descripcion.trim(),
        description: editFormData.descripcion.trim(),
        DETALLE_ROL: editFormData.descripcion.trim(),
        NIVEL_ROL: nivelNum,
        nivel_rol: nivelNum,
        nivel: nivelNum,
        ESTADO_ROL: estadoNum,
        estado: estadoNum,
        nombre: editFormData.nombre.trim(),
        name: editFormData.nombre.trim()
      }

      await actualizarRol(editFormData.id, payload)
      setModalEditar(false)
      await handleListarRoles()
      Toast.fire({
        icon: 'success',
        title: 'Rol actualizado exitosamente'
      })
    } catch (error: any) {
      console.error('Error al actualizar rol:', error)
      const msg = formatApiError(error, 'Error al actualizar el rol')
      Toast.fire({
        icon: 'error',
        title: msg
      })
    } finally {
      setGuardando(false)
    }
  }

  const handleEliminarRol = async (id: string | number, nombre?: string) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar el rol ${nombre ? `"${nombre}"` : ''}? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e55353',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    })

    if (!result.isConfirmed) return

    try {
      setGuardando(true)
      await eliminarRol(id)
      setModalEditar(false)
      await handleListarRoles()
      Toast.fire({
        icon: 'success',
        title: 'Rol eliminado exitosamente'
      })
    } catch (error: any) {
      console.error('Error al eliminar rol:', error)
      const msg = formatApiError(error, 'Error al eliminar el rol')
      Toast.fire({
        icon: 'error',
        title: msg
      })
    } finally {
      setGuardando(false)
    }
  }

  return {
    roles,
    loading,
    guardando,
    errorMsg,
    modalEditar,
    setModalEditar,
    modalCrear,
    setModalCrear,
    formData,
    setFormData,
    editFormData,
    setEditFormData,
    fetchRoles,
    handleCrearRol,
    handleActualizarRol,
    handleEliminarRol,
    handleAbrirEditar,
    handleGuardarRol,
    handleListarRoles,
  }
}

export default useRoles
