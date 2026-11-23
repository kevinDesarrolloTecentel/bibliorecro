import { useState, useEffect, useCallback, useRef } from 'react'
import Swal from 'sweetalert2'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/store'
import {
  setRoles as setRolesSlice,
  setRolSeleccionado,
  agregarRol,
  actualizarRolEnLista,
  eliminarRolDeLista,
} from '@/slices/adminSlice'
import { AdminRol } from '@/models/adm/rol.model'
import { actualizarRol, crearRol, eliminarRol, listarRoles } from '@/Service/adm/Rol'
import { usePermissions } from '@/hooks/auth/usePermissions'
import { parseApiErrors } from '@/utils/errors'

// Ordena los roles por NIVEL_ROL ascendente
export const ordenarRoles = (lista: AdminRol[]): AdminRol[] => {
  if (!Array.isArray(lista)) return []
  return [...lista].sort((a, b) => {
    const nivelA = Number(a.NIVEL_ROL ?? 999)
    const nivelB = Number(b.NIVEL_ROL ?? 999)
    if (nivelA !== nivelB) {
      return nivelA - nivelB
    }
    const idA = Number(a.ID_ROL ?? 0)
    const idB = Number(b.ID_ROL ?? 0)
    return idA - idB
  })
}

const initialFormData: AdminRol = {
  NOMBRE_ROL: '',
  NIVEL_ROL: 2,
}

const initialEditFormData: AdminRol = {
  ID_ROL: undefined,
  NOMBRE_ROL: '',
  NIVEL_ROL: 2,
}

export const useRoles = () => {
  const dispatch = useDispatch()
  const { canDoAction } = usePermissions()

  // Permisos de roles
  const canCrearRol = canDoAction('btn_crear_rol')
  const canGuardarRol = canDoAction('btn_guardar_rol')
  const canEditarRol = canDoAction('btn_editar_rol')
  const canActualizarRol = canDoAction('btn_actualizar_rol')
  const canEliminarRol = canDoAction('btn_eliminar_rol')

  const roles = useSelector((state: RootState) => state.admin.roles)
  const rolSeleccionado = useSelector((state: RootState) => state.admin.rolSeleccionado)

  const [loading, setLoading] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [modalEditar, setModalEditar] = useState(false)
  const [modalCrear, setModalCrear] = useState(false)

  const [formData, setFormData] = useState<AdminRol>(initialFormData)
  const [editFormData, setEditFormData] = useState<AdminRol>(initialEditFormData)
  const isFetchingRolesRef = useRef<boolean>(false)

  // Consultar lista de roles
  const fetchRoles = useCallback(async () => {
    if (isFetchingRolesRef.current) return
    isFetchingRolesRef.current = true
    setLoading(true)
    setErrorMsg(null)
    try {
      const response = await listarRoles()
      const lista: AdminRol[] = Array.isArray(response)
        ? response
        : response?.data || []
      dispatch(setRolesSlice(ordenarRoles(lista)))
    } catch (error: any) {
      const { title, messages } = parseApiErrors(error, 'Error al obtener roles')
      setErrorMsg(messages.join(', '))
      Swal.fire({
        icon: 'error',
        title,
        text: messages.join('\n'),
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
    } finally {
      isFetchingRolesRef.current = false
      setLoading(false)
    }
  }, [dispatch])

  useEffect(() => {
    if (roles.length === 0) {
      fetchRoles()
    }
  }, [fetchRoles, roles.length])

  const resetFormData = useCallback(() => {
    setFormData(initialFormData)
  }, [])

  const resetEditFormData = useCallback(() => {
    setEditFormData(initialEditFormData)
  }, [])

  const handleAbrirCrear = useCallback(() => {
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
  }, [canCrearRol, resetFormData])

  const handleCerrarCrear = useCallback(() => {
    resetFormData()
    setModalCrear(false)
  }, [resetFormData])

  const handleAbrirEditar = useCallback(
    (rol: AdminRol) => {
      if (!canEditarRol) {
        Swal.fire({
          icon: 'error',
          title: 'Acceso Denegado',
          text: 'No tienes permisos para editar roles.',
          confirmButtonColor: '#dc3545',
          confirmButtonText: 'Entendido',
        })
        return
      }
      dispatch(setRolSeleccionado(rol))
      setEditFormData({
        ID_ROL: rol.ID_ROL,
        NOMBRE_ROL: rol.NOMBRE_ROL || '',
        NIVEL_ROL: Number(rol.NIVEL_ROL) || 2,
      })
      setModalEditar(true)
    },
    [canEditarRol, dispatch],
  )

  const handleCerrarEditar = useCallback(() => {
    dispatch(setRolSeleccionado(null))
    resetEditFormData()
    setModalEditar(false)
  }, [dispatch, resetEditFormData])

  // Guardar nuevo rol
  const handleGuardarRol = async (): Promise<boolean> => {
    if (!canGuardarRol && !canCrearRol) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para guardar roles.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return false
    }

    const nombreLimpio = String(formData.NOMBRE_ROL || '').trim()
    if (!nombreLimpio) {
      Swal.fire({
        icon: 'warning',
        title: 'Campo requerido',
        text: 'Por favor, ingresa el nombre del rol.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return false
    }

    if (nombreLimpio.length > 25) {
      Swal.fire({
        icon: 'warning',
        title: 'Nombre demasiado largo',
        text: 'El nombre del rol no puede superar los 25 caracteres.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return false
    }

    // Validar nombre duplicado
    const existeDuplicado = roles.some(
      (r) => String(r.NOMBRE_ROL || '').trim().toLowerCase() === nombreLimpio.toLowerCase(),
    )
    if (existeDuplicado) {
      Swal.fire({
        icon: 'warning',
        title: 'Rol duplicado',
        text: 'Ya existe un rol registrado con este nombre.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return false
    }

    setGuardando(true)
    try {
      const payload: Partial<AdminRol> = {
        NOMBRE_ROL: nombreLimpio.toUpperCase(),
        NIVEL_ROL: Number(formData.NIVEL_ROL) || 2,
      }

      const res = await crearRol(payload)
      const nuevoRol: AdminRol = res?.data || res || {
        ...payload,
        ID_ROL: res?.ID_ROL ?? res?.data?.ID_ROL,
      }

      dispatch(agregarRol(nuevoRol))

      Swal.fire({
        icon: 'success',
        title: '¡Rol creado!',
        text: 'El rol se registró exitosamente.',
        timer: 1800,
        showConfirmButton: false,
      })

      handleCerrarCrear()
      await fetchRoles()
      return true
    } catch (error: any) {
      console.error('Error al crear rol:', error)
      const { title, messages } = parseApiErrors(error, 'Error al crear el rol')
      Swal.fire({
        icon: 'error',
        title,
        text: messages.join('\n'),
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return false
    } finally {
      setGuardando(false)
    }
  }

  // Actualizar rol existente
  const handleActualizarRol = async (): Promise<boolean> => {
    if (!canActualizarRol && !canEditarRol) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para actualizar roles.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return false
    }

    const id = editFormData.ID_ROL
    if (!id) return false

    const nombreLimpio = String(editFormData.NOMBRE_ROL || '').trim()
    if (!nombreLimpio) {
      Swal.fire({
        icon: 'warning',
        title: 'Campo requerido',
        text: 'El nombre del rol no puede quedar vacío.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return false
    }

    if (nombreLimpio.length > 25) {
      Swal.fire({
        icon: 'warning',
        title: 'Nombre demasiado largo',
        text: 'El nombre del rol no puede superar los 25 caracteres.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return false
    }

    // Validar nombre duplicado en otros roles
    const existeDuplicado = roles.some(
      (r) =>
        String(r.ID_ROL) !== String(id) &&
        String(r.NOMBRE_ROL || '').trim().toLowerCase() === nombreLimpio.toLowerCase(),
    )
    if (existeDuplicado) {
      Swal.fire({
        icon: 'warning',
        title: 'Rol duplicado',
        text: 'Ya existe otro rol registrado con este nombre.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return false
    }

    setGuardando(true)
    try {
      const payload: Partial<AdminRol> = {
        NOMBRE_ROL: nombreLimpio.toUpperCase(),
        NIVEL_ROL: Number(editFormData.NIVEL_ROL) || 2,
      }

      await actualizarRol(id, payload)

      dispatch(actualizarRolEnLista({ ...editFormData, ...payload }))

      Swal.fire({
        icon: 'success',
        title: '¡Rol actualizado!',
        text: 'El rol se actualizó exitosamente.',
        timer: 1800,
        showConfirmButton: false,
      })

      handleCerrarEditar()
      await fetchRoles()
      return true
    } catch (error: any) {
      console.error('Error al actualizar rol:', error)
      const { title, messages } = parseApiErrors(error, 'Error al actualizar el rol')
      Swal.fire({
        icon: 'error',
        title,
        text: messages.join('\n'),
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return false
    } finally {
      setGuardando(false)
    }
  }

  // Eliminar rol
  const handleEliminarRol = async (id: string | number, nombre?: string): Promise<boolean> => {
    if (!canEliminarRol) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para eliminar roles.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return false
    }

    const rolEncontrado = roles.find((r) => String(r.ID_ROL) === String(id))
    const nivelRol = Number(rolEncontrado?.NIVEL_ROL ?? 0)

    if (nivelRol === 1) {
      Swal.fire({
        icon: 'warning',
        title: 'Operación no permitida',
        text: 'El rol de Administrador (Nivel 1) no puede ser eliminado.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return false
    }

    const result = await Swal.fire({
      title: '¿Eliminar este rol?',
      html: `¿Estás seguro de que deseas eliminar el rol <strong>"${nombre || rolEncontrado?.NOMBRE_ROL || id}"</strong>?<br/><br/><span class="text-danger small">Esta acción no se puede deshacer.</span>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    })

    if (!result.isConfirmed) return false

    setGuardando(true)
    try {
      await eliminarRol(id)
      dispatch(eliminarRolDeLista(id))

      Swal.fire({
        icon: 'success',
        title: '¡Rol eliminado!',
        text: 'El rol ha sido eliminado correctamente.',
        timer: 1800,
        showConfirmButton: false,
      })

      handleCerrarEditar()
      await fetchRoles()
      return true
    } catch (error: any) {
      console.error('Error al eliminar rol:', error)
      const { title, messages } = parseApiErrors(error, 'Error al eliminar el rol')
      Swal.fire({
        icon: 'error',
        title,
        text: messages.join('\n'),
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return false
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
    handleGuardarRol,
    handleActualizarRol,
    handleEliminarRol,
    handleAbrirEditar,
    handleCerrarEditar,
    handleAbrirCrear,
    handleCerrarCrear,
    resetFormData,
    resetEditFormData,
    canCrearRol,
    canGuardarRol,
    canEditarRol,
    canActualizarRol,
    canEliminarRol,
    rolSeleccionado,
  }
}

export default useRoles
