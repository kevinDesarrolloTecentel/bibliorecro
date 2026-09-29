import React, { useState, useEffect, useCallback } from 'react'
import Swal from 'sweetalert2'

import { LibroOption, UsuarioOption } from '@/models/rco/prestamos'
import { Lista, NuevoPrestamo } from '@/Service/rco/Prestamos'
import apiClient, { BACKEND_API_BASE } from '@/Service/apiClient'
import {
  getInscripcionesUsuarios,
  Personas,
  PersonasActivasReport,
  PersonasE,
} from '@/Service/tab/Persona'

const toArray = (val: any): any[] => {
  if (!val) return []
  if (Array.isArray(val)) return val
  if (Array.isArray(val.data)) return val.data
  if (Array.isArray(val.data?.data)) return val.data.data
  if (Array.isArray(val.personas)) return val.personas
  if (Array.isArray(val.usuarios)) return val.usuarios
  if (Array.isArray(val.inscripciones)) return val.inscripciones
  if (Array.isArray(val.registradas)) return val.registradas
  return []
}

const fetchInscripcionesData = async (): Promise<any[]> => {
  // 1. Intentar POST /tab-persona/personasRegistradas (definida en Laravel como POST)
  try {
    const res = await apiClient.post(`${BACKEND_API_BASE}/tab-persona/personasRegistradas`, {})
    const list = toArray(res?.data)
    if (list.length > 0) return list
  } catch (err) {
    console.warn('POST /tab-persona/personasRegistradas no respondió o falló:', err)
  }

  // 2. Intentar getInscripcionesUsuarios() del servicio (GET /personasRegistradas)
  try {
    const res = await getInscripcionesUsuarios()
    const list = toArray(res)
    if (list.length > 0) return list
  } catch (err) {
    console.warn('getInscripcionesUsuarios() falló:', err)
  }

  // 3. Intentar PersonasActivasReport() (usuarios con inscripción activa)
  try {
    const res = await PersonasActivasReport()
    const list = toArray(res)
    if (list.length > 0) return list
  } catch (err) {
    console.warn('PersonasActivasReport() falló:', err)
  }

  // 4. Intentar Personas() con paginación amplia
  try {
    const res = await Personas(1, 500)
    const list = toArray(res)
    if (list.length > 0) return list
  } catch (err) {
    console.warn('Personas() falló:', err)
  }

  // 5. Intentar PersonasE()
  try {
    const res = await PersonasE()
    return toArray(res)
  } catch (err) {
    console.error('Todos los intentos de carga de usuarios fallaron:', err)
    return []
  }
}

export interface UsePrestamoModalProps {
  visible?: boolean
  setVisible?: (visible: boolean) => void
  onPrestamoCreado?: () => void
}

export const usePrestamoModal = ({
  visible,
  setVisible,
  onPrestamoCreado,
}: UsePrestamoModalProps = {}) => {
  const [internalVisible, setInternalVisible] = useState(false)
  const isControlled = typeof visible === 'boolean'
  const isVisible = isControlled ? visible : internalVisible

  const [libros, setLibros] = useState<LibroOption[]>([])
  const [usuarios, setUsuarios] = useState<UsuarioOption[]>([])
  const [loadingCatalogos, setLoadingCatalogos] = useState(false)

  const [selectedLibro, setSelectedLibro] = useState<LibroOption | null>(null)
  const [selectedUsuario, setSelectedUsuario] = useState<UsuarioOption | null>(null)
  const [busquedaLibro, setBusquedaLibro] = useState('')
  const [busquedaUsuario, setBusquedaUsuario] = useState('')
  const [guardando, setGuardando] = useState(false)

  const fetchUsuarios = useCallback(async () => {
    try {
      const rawData = await fetchInscripcionesData()
      const mapped: UsuarioOption[] = rawData
        .map((p: any) => {
          const idInscripcion =
            p.ID_INSCRIPCION ??
            p.id_inscripcion ??
            p.idInscripcion ??
            p.inscripcion?.ID_INSCRIPCION ??
            p.inscripcion?.id ??
            p.ID_PERSONA ??
            p.id_persona ??
            p.id

          const cedula = String(
            p.IDENTIFICACION_PERSONA ??
            p.identificacion ??
            p.identificacion_persona ??
            p.cedula ??
            p.CEDULA ??
            '',
          ).trim()

          const nombre = String(
            p.NOMBRE_PERSONA ??
            p.nombre ??
            p.nombres ??
            p.NOMBRES_PERSONA ??
            '',
          ).trim()

          const apellido = String(
            p.APELLIDO_PERSONA ??
            p.apellido ??
            p.apellidos ??
            p.APELLIDOS_PERSONA ??
            '',
          ).trim()

          const fullName = `${nombre} ${apellido}`.trim()
          const labelParts: string[] = []
          if (cedula) labelParts.push(cedula)
          if (fullName) labelParts.push(fullName)

          return {
            value: idInscripcion,
            label: labelParts.join(' - ') || `Usuario #${idInscripcion}`,
            cedula,
            nombre,
            apellido,
          }
        })
        .filter((u: UsuarioOption) => u.value !== undefined && u.value !== null && u.value !== '')

      setUsuarios(mapped)
    } catch (err) {
      console.error('Error al cargar inscripciones de usuarios:', err)
    }
  }, [])

  const fetchLibros = useCallback(async () => {
    try {
      const res = await Lista()
      const list = res?.data || (Array.isArray(res) ? res : [])
      const mapped: LibroOption[] = list.map((l: any) => ({
        value: l.ID_LIBROS,
        label: `ISBN: ${l.ISBN_LIBROS || 'S/N'} - Título: ${l.TITULO_LIBROS || 'Sin título'} - Autor: ${l.AUTORTEJUELO_LIBROS || l.NOMBRE_AUTOR || '-'}`,
        isbn: l.ISBN_LIBROS || '',
        titulo: l.TITULO_LIBROS || '',
        autor: l.AUTORTEJUELO_LIBROS || l.NOMBRE_AUTOR || '',
      }))
      setLibros(mapped)
    } catch (err) {
      console.error('Error al cargar libros disponibles:', err)
    }
  }, [])

  useEffect(() => {
    if (isVisible) {
      setLoadingCatalogos(true)
      Promise.allSettled([fetchUsuarios(), fetchLibros()]).finally(() => {
        setLoadingCatalogos(false)
      })
    }
  }, [isVisible, fetchUsuarios, fetchLibros])

  const handleBuscarLibro = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value
    setBusquedaLibro(q)
  }

  const handleBuscarLibroText = (q: string) => {
    setBusquedaLibro(q)
  }

  const handleOpen = () => {
    if (setVisible) {
      setVisible(true)
    } else {
      setInternalVisible(true)
    }
  }

  const handleClose = () => {
    setSelectedLibro(null)
    setSelectedUsuario(null)
    setBusquedaLibro('')
    setBusquedaUsuario('')
    if (setVisible) {
      setVisible(false)
    } else {
      setInternalVisible(false)
    }
  }

  const handleGuardarPrestamo = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    if (!selectedLibro || !selectedUsuario) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Por favor, seleccione el libro y el usuario para el préstamo.',
        confirmButtonColor: '#044c8c',
      })
      return
    }

    setGuardando(true)
    try {
      const formData = new FormData()
      formData.append('ID_INSCRIPCION', String(selectedUsuario.value))
      formData.append('ID_LIBROS', String(selectedLibro.value))
      formData.append('ESTADO_PRESTAMO', '1')

      await NuevoPrestamo(formData)

      Swal.fire({
        icon: 'success',
        title: '¡Éxito!',
        text: 'Préstamo registrado con éxito.',
        confirmButtonColor: '#044c8c',
      })

      handleClose()
      if (onPrestamoCreado) {
        onPrestamoCreado()
      }
    } catch (err: any) {
      console.error(err)
      if (err?.response?.data?.error === 'El libro ya está en préstamo') {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'El libro ya está en préstamo.',
          confirmButtonColor: '#d33',
        })
      } else if (err?.response?.data?.sancion) {
        Swal.fire({
          icon: 'question',
          title: 'Atención',
          text: err.response.data.sancion,
          confirmButtonColor: '#044c8c',
        })
      } else if (err?.response?.data?.message) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.response.data.message,
          confirmButtonColor: '#d33',
        })
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un error al guardar los datos del préstamo.',
          confirmButtonColor: '#d33',
        })
      }
    } finally {
      setGuardando(false)
    }
  }

  const librosFiltrados = libros.filter((l) => {
    if (!busquedaLibro.trim()) return true
    const q = busquedaLibro.toLowerCase()
    return (
      (l.titulo && l.titulo.toLowerCase().includes(q)) ||
      (l.autor && l.autor.toLowerCase().includes(q)) ||
      (l.isbn && l.isbn.toLowerCase().includes(q)) ||
      (l.label && l.label.toLowerCase().includes(q))
    )
  })

  const usuariosFiltrados = usuarios.filter((u) => {
    if (!busquedaUsuario.trim()) return true
    const q = busquedaUsuario.toLowerCase()
    return (
      (u.label && u.label.toLowerCase().includes(q)) ||
      (u.cedula && u.cedula.toLowerCase().includes(q)) ||
      (u.nombre && u.nombre.toLowerCase().includes(q)) ||
      (u.apellido && u.apellido.toLowerCase().includes(q))
    )
  })

  return {
    isVisible,
    isControlled,
    handleOpen,
    handleClose,
    libros,
    usuarios,
    loadingCatalogos,
    selectedLibro,
    setSelectedLibro,
    selectedUsuario,
    setSelectedUsuario,
    busquedaLibro,
    setBusquedaLibro,
    handleBuscarLibro,
    handleBuscarLibroText,
    busquedaUsuario,
    setBusquedaUsuario,
    guardando,
    handleGuardarPrestamo,

    libroSeleccionado: selectedLibro,
    setLibroSeleccionado: setSelectedLibro,
    usuarioSeleccionado: selectedUsuario,
    setUsuarioSeleccionado: setSelectedUsuario,
    librosFiltrados,
    usuariosFiltrados,
    loadingUsuarios: loadingCatalogos,
  }
}

export default usePrestamoModal
