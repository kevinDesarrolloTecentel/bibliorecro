import { useState, useEffect, useCallback } from 'react'
import Swal from 'sweetalert2'
import { Rol } from '@/models/adm/rol.model'
import { actualizarRol, crearRol, eliminarRol, listarRoles } from '@/Service/adm/Rol'
import { usePermissions, marcarCambioPermisos } from '@/context/PermissionsContext'

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

export const ordenarRoles = (lista: any[]) => {
  return [...lista].sort((a: any, b: any) => {
    const idA = Number(a.ID_ROL ?? a.id ?? 0)
    const idB = Number(b.ID_ROL ?? b.id ?? 0)
    const nivelA = Number(a.NIVEL_ROL ?? a.nivel ?? 1)
    const nivelB = Number(b.NIVEL_ROL ?? b.nivel ?? 1)

    //El ADMINISTRADOR siempre de primero
    const isPrincipalA = idA === 1 || Boolean(a.ES_ADMINISTRADOR)
    const isPrincipalB = idB === 1 || Boolean(b.ES_ADMINISTRADOR)
    if (isPrincipalA && !isPrincipalB) return -1
    if (!isPrincipalA && isPrincipalB) return 1

    // Ordenar por nivel ascendente 
    if (nivelA !== nivelB) {
      return nivelA - nivelB
    }

    // A mismo nivel, por ID ascendente
    return idA - idB
  })
}

export const useRoles = () => {
  const { canDoAction, verificarAccionEnServidor } = usePermissions()

  const canCrearRol = canDoAction('btn_crear_rol')
  const canGuardarRol = canDoAction('btn_guardar_rol')
  const canEditarRol = canDoAction('btn_editar_rol')
  const canActualizarRol = canDoAction('btn_actualizar_rol')
  const canEliminarRol = canDoAction('btn_eliminar_rol')

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
      setRoles(ordenarRoles(lista))
    } catch (error: any) {
      const msg = formatApiError(error, 'Error al obtener la lista de roles.')
      setErrorMsg(msg)
      Swal.fire({
        icon: 'error',
        title: 'Error al cargar roles',
        text: msg,
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
    } finally {
      setLoading(false)
    }
  }, [])

  const handleCrearRol = async (formData: any): Promise<boolean> => {
    if (!canGuardarRol && !canCrearRol) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para crear o guardar roles.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return false
    }


    setGuardando(true)
    try {
      const payload = {
        NOMBRE_ROL: formData.nombre,
        DESCRIPCION_ROL: formData.descripcion,
        NIVEL_ROL: Number(formData.nivel || 1),
        NIVEL_ACCESO: Number(formData.nivel || 1),
        ESTADO_ROL: formData.estado || 'Activo',
      }
      await crearRol(payload)
      marcarCambioPermisos()
      Swal.fire({
        icon: 'success',
        title: '¡Rol creado!',
        text: `El rol "${formData.nombre}" ha sido creado exitosamente.`,
        timer: 1800,
        showConfirmButton: false,
      })
      await fetchRoles()
      return true
    } catch (error: any) {
      const msg = formatApiError(error, 'No se pudo crear el rol')
      Swal.fire({
        icon: 'error',
        title: 'Error al crear rol',
        text: msg,
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return false
    } finally {
      setGuardando(false)
    }
  }
  const initialFormData = {
    nombre: '',
    descripcion: '',
    nivel: 1,
    estado: 'Activo'
  }

  const initialEditFormData = {
    id: '',
    nombre: '',
    descripcion: '',
    nivel: 1,
    estado: 'Activo'
  }

  const [formData, setFormData] = useState(initialFormData)
  const [editFormData, setEditFormData] = useState(initialEditFormData)

  const resetFormData = useCallback(() => {
    setFormData(initialFormData)
  }, [])

  const resetEditFormData = useCallback(() => {
    setEditFormData(initialEditFormData)
  }, [])

  const handleAbrirCrear = useCallback(async () => {
    if (!canCrearRol) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para crear roles.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    resetFormData()
    setModalCrear(true)
  }, [resetFormData, canCrearRol, verificarAccionEnServidor])

  const handleCerrarCrear = useCallback(() => {
    setModalCrear(false)
    resetFormData()
  }, [resetFormData])

  const handleCerrarEditar = useCallback(() => {
    setModalEditar(false)
    resetEditFormData()
    setGuardando(false)
  }, [resetEditFormData])

  const handleListarRoles = async () => {
    try {
      setLoading(true)
      setErrorMsg(null)
      const res = await listarRoles()
      const lista = Array.isArray(res) ? res : (res?.data || res?.roles || [])
      setRoles(ordenarRoles(lista))
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

  const handleAbrirEditar = useCallback(async (item: any) => {
    if (!canEditarRol) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para editar este rol.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }


    if (!item) return
    const r = item.raw || item
    const id = String(r.ID_ROL ?? r.id ?? item.ID ?? '')
    const nombre = String(r.NOMBRE_ROL ?? r.nombre ?? r.name ?? item.Nombre ?? '')
    const rawDesc = r.DESCRIPCION_ROL ?? r.DESCRIPCION ?? r.descripcion ?? ''
    const descripcion = String(item.Descripcion && item.Descripcion !== '-' ? item.Descripcion : rawDesc)
    const nivel = Number(r.NIVEL_ROL ?? r.nivel ?? item.Nivel ?? 1)

    // Normalizar Estado de forma robusta
    const rawEstado = r.ESTADO_ROL ?? r.estado ?? r.ESTADO ?? item.Estado
    const estado =
      rawEstado === 0 || rawEstado === '0' || rawEstado === 'Inactivo' || rawEstado === false
        ? 'Inactivo'
        : 'Activo'

    setEditFormData({
      id,
      nombre,
      descripcion,
      nivel: isNaN(nivel) || nivel < 1 ? 1 : nivel,
      estado,
    })
    setGuardando(false)
    setModalEditar(true)
  }, [canEditarRol, verificarAccionEnServidor])

  const handleGuardarRol = async () => {
    if (!canGuardarRol && !canCrearRol) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para guardar roles.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    const tienePermiso = (await verificarAccionEnServidor('btn_guardar_rol'))
    if (!tienePermiso) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para guardar roles.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    const nombreLimpio = formData.nombre.trim()
    if (!nombreLimpio) {
      Swal.fire({
        icon: 'warning',
        title: 'Campo requerido',
        text: 'Por favor, ingresa el nombre del rol.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    // Validar que no exista ya un rol con el mismo nombre
    const nombreNormalizado = nombreLimpio.toLowerCase()
    const existeDuplicadoCrear = roles.some((r: any) => {
      const rNombre = String(r.NOMBRE_ROL ?? r.nombre ?? r.name ?? '').trim().toLowerCase()
      return rNombre === nombreNormalizado
    })

    if (existeDuplicadoCrear) {
      Swal.fire({
        icon: 'warning',
        title: 'Rol ya existente',
        text: `Ya existe un rol con el nombre "${nombreLimpio}". Por favor, ingresa un nombre diferente.`,
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
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
      marcarCambioPermisos()
      setModalCrear(false)
      resetFormData()
      await handleListarRoles()
      Swal.fire({
        icon: 'success',
        title: '¡Rol creado!',
        text: `El rol "${formData.nombre.trim()}" ha sido registrado exitosamente.`,
        timer: 1800,
        showConfirmButton: false,
      })
    } catch (error: any) {
      console.error('Error al crear rol:', error)
      const msg = formatApiError(error, 'Error al crear el rol')
      Swal.fire({
        icon: 'error',
        title: 'Error al crear rol',
        text: msg,
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
    } finally {
      setGuardando(false)
    }
  }

  const handleActualizarRol = async () => {
    if (!canActualizarRol && !canEditarRol) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para actualizar roles.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    const tienePermiso = (await verificarAccionEnServidor('btn_actualizar_rol')) || (await verificarAccionEnServidor('btn_editar_rol'))
    if (!tienePermiso) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para actualizar roles.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    const nombreLimpio = editFormData.nombre.trim()
    if (!nombreLimpio) {
      Swal.fire({
        icon: 'warning',
        title: 'Campo requerido',
        text: 'Por favor, ingresa el nombre del rol.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    // Validar que no exista otro rol con el mismo nombre (excluyendo el rol que se está editando)
    const nombreNormalizado = nombreLimpio.toLowerCase()
    const existeDuplicadoEditar = roles.some((r: any) => {
      const rId = String(r.ID_ROL ?? r.id ?? '')
      const rNombre = String(r.NOMBRE_ROL ?? r.nombre ?? r.name ?? '').trim().toLowerCase()
      return rId !== String(editFormData.id) && rNombre === nombreNormalizado
    })

    if (existeDuplicadoEditar) {
      Swal.fire({
        icon: 'warning',
        title: 'Rol ya existente',
        text: `Ya existe un rol con el nombre "${nombreLimpio}". Por favor, ingresa un nombre diferente.`,
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
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
      marcarCambioPermisos()
      setModalEditar(false)
      resetEditFormData()
      await handleListarRoles()
      Swal.fire({
        icon: 'success',
        title: '¡Rol actualizado!',
        text: `El rol "${editFormData.nombre.trim()}" se actualizó exitosamente.`,
        timer: 1800,
        showConfirmButton: false,
      })
    } catch (error: any) {
      console.error('Error al actualizar rol:', error)
      const msg = formatApiError(error, 'Error al actualizar el rol')
      Swal.fire({
        icon: 'error',
        title: 'Error al actualizar rol',
        text: msg,
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
    } finally {
      setGuardando(false)
    }
  }

  const handleEliminarRol = async (id: string | number, nombre?: string) => {
    if (!canEliminarRol) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para eliminar roles.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    const rolEncontrado = roles.find((r: any) => Number(r.ID_ROL ?? r.id) === Number(id))
    const nivelRol = Number(rolEncontrado?.NIVEL_ROL ?? rolEncontrado?.nivel ?? editFormData.nivel ?? 0)

    if (nivelRol === 1) {
      Swal.fire({
        icon: 'warning',
        title: 'Acción no permitida',
        text: 'El rol con Nivel 1 no puede ser eliminado del sistema.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar el rol ${nombre ? `"${nombre}"` : ''}? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    })

    if (!result.isConfirmed) return

    const tienePermiso = await verificarAccionEnServidor('btn_eliminar_rol')
    if (!tienePermiso) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para eliminar roles.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    try {
      setGuardando(true)
      await eliminarRol(id)
      marcarCambioPermisos()
      setModalEditar(false)
      resetEditFormData()
      await handleListarRoles()
      Swal.fire({
        icon: 'success',
        title: '¡Rol eliminado!',
        text: `El rol ${nombre ? `"${nombre}"` : ''} ha sido eliminado del sistema.`,
        timer: 1800,
        showConfirmButton: false,
      })
    } catch (error: any) {
      console.error('Error al eliminar rol:', error)
      let msg = formatApiError(error, 'Error al eliminar el rol')

      const msgLower = (msg || '').toLowerCase()
      if (
        msgLower.includes('registros relacionados') ||
        msgLower.includes('restricción') ||
        msgLower.includes('foreign key') ||
        msgLower.includes('constraint') ||
        error?.response?.status === 400 ||
        error?.response?.status === 409
      ) {
        msg = 'No se puede eliminar el rol porque actualmente se encuentra asignado a uno o más usuarios.'
      }

      Swal.fire({
        icon: 'error',
        title: 'No se puede eliminar el rol',
        text: msg,
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
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
    handleCerrarEditar,
    handleAbrirCrear,
    handleCerrarCrear,
    resetFormData,
    resetEditFormData,
    handleGuardarRol,
    handleListarRoles,
    canCrearRol,
    canGuardarRol,
    canEditarRol,
    canActualizarRol,
    canEliminarRol,
  }
}

export default useRoles
