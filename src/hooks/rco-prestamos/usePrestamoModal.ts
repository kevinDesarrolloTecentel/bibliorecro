import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import Swal from 'sweetalert2'

import { LibroOption, UsuarioOption } from '@/models/rco/prestamos'
import { NuevoPrestamo } from '@/Service/rco/Prestamos'
import { BuscarLibros } from '@/Service/rco/libros'
import { Personas } from '@/Service/tab/Persona'

const toArray = (val: any): any[] => {
  if (!val) return []
  if (Array.isArray(val)) return val
  if (Array.isArray(val.personas?.data)) return val.personas.data
  if (Array.isArray(val.personas)) return val.personas
  if (Array.isArray(val.data?.data)) return val.data.data
  if (Array.isArray(val.data)) return val.data
  if (Array.isArray(val.usuarios?.data)) return val.usuarios.data
  if (Array.isArray(val.usuarios)) return val.usuarios
  if (Array.isArray(val.inscripciones?.data)) return val.inscripciones.data
  if (Array.isArray(val.inscripciones)) return val.inscripciones
  if (Array.isArray(val.registradas?.data)) return val.registradas.data
  if (Array.isArray(val.registradas)) return val.registradas
  return []
}

export const isUserActivoYDisponible = (u: any): boolean => {
  const estRaw = String(u.ESTADO_PERSONA ?? u.estado ?? '1').toLowerCase().trim()
  const isActivo = estRaw === '1' || estRaw === 'activo' || (!estRaw.includes('inactiv') && estRaw !== '0')

  const estInscRaw = String(u.ESTADO_INSCRIPCION ?? u.ESTADOINSCRIPCION_PERSONA ?? '1').toLowerCase().trim()
  const isInscrito = estInscRaw === '1' || estInscRaw === 'activo' || estInscRaw === 'true' || (!estInscRaw.includes('inactiv') && estInscRaw !== '0')

  const isSancionado = Boolean(
    u.ESTADO_SANCION === 1 ||
    u.ESTADO_SANCION === '1' ||
    u.ESTADO_PERSONA === 2 ||
    u.ESTADO_PERSONA === '2' ||
    (u.DETALLE_SANCION && !String(u.DETALLE_SANCION).toLowerCase().includes('sin sancion') && String(u.DETALLE_SANCION).trim() !== '')
  )
  return isActivo && isInscrito && !isSancionado
}

export const isLibroDisponible = (l: any): boolean => {
  const activo = Number(l.ESTADO_LIBROS ?? 1) === 1 && String(l.ESTADO_LIBRO ?? 'Activo').toLowerCase() !== 'inactivo'
  const prestado =
    Number(l.EN_PRESTAMO ?? 0) === 1 ||
    String(l.ESTADO_PRESTAMO || '').toLowerCase().includes('préstamo')
  return activo && !prestado
}

const fetchInscripcionesData = async (busqueda: string = ''): Promise<any[]> => {
  try {
    const q = busqueda.trim()
    // 1. Consultamos enviando estado: 1 y sancion: 0 para obtener directamente los usuarios activos
    const res = await Personas(1, 50, q || undefined, 1, 0)
    let list = toArray(res)

    // 2. Si el backend devolvió vacío por el filtro compuesto, consultamos sin el filtro de estado estricto
    if (list.length === 0) {
      const fallbackRes = await Personas(1, 50, q || undefined)
      list = toArray(fallbackRes)
    }

    return list.filter(isUserActivoYDisponible)
  } catch (err) {
    console.warn('Error al consultar usuarios inscritos activos:', err)
  }
  return []
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
  const [loadingUsuarios, setLoadingUsuarios] = useState(false)

  const [selectedLibro, setSelectedLibro] = useState<LibroOption | null>(null)
  const [selectedUsuario, setSelectedUsuario] = useState<UsuarioOption | null>(null)
  const [busquedaLibro, setBusquedaLibro] = useState('')
  const [busquedaUsuario, setBusquedaUsuario] = useState('')
  const [guardando, setGuardando] = useState(false)

  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null)
  const searchLibroDebounceRef = useRef<NodeJS.Timeout | null>(null)

  const fetchUsuarios = useCallback(async (query: string = '') => {
    try {
      setLoadingUsuarios(true)
      const rawData = await fetchInscripcionesData(query)
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
            estado: 'Activo',
          }
        })
        .filter((u: UsuarioOption) => u.value !== undefined && u.value !== null && u.value !== '')

      setUsuarios(mapped)
    } catch (err) {
      console.error('Error al cargar inscripciones de usuarios:', err)
      setUsuarios([])
    } finally {
      setLoadingUsuarios(false)
    }
  }, [])

  const fetchLibros = useCallback(async (query: string = '') => {
    try {
      setLoadingCatalogos(true)
      const res = await BuscarLibros(query.trim(), 1, 30)
      const list = toArray(res)
      const disponibles = list.filter(isLibroDisponible)

      const mapped: LibroOption[] = disponibles.map((l: any) => {
        const idLibro = l.ID_LIBROS ?? l.id
        const isbn = String(l.ISBN_LIBROS ?? l.isbn ?? '').trim()
        const titulo = String(l.TITULO_LIBROS ?? l.titulo ?? 'Sin título').trim()
        const autor = String(l.NOMBRE_AUTOR ?? l.AUTORTEJUELO_LIBROS ?? l.autor ?? '').trim()
        const tejuelo = String(l.TITULOTEJUELO_LIBROS ?? l.AUTORTEJUELO_LIBROS ?? '').trim()

        return {
          value: idLibro,
          label: `ISBN: ${isbn || 'S/N'} - Título: ${titulo} - Autor: ${autor || '-'}`,
          isbn,
          titulo,
          autor: autor || tejuelo,
        }
      })
      setLibros(mapped)
    } catch (err) {
      console.error('Error al cargar libros disponibles:', err)
      setLibros([])
    } finally {
      setLoadingCatalogos(false)
    }
  }, [])

  // Carga y búsqueda dinámica de libros disponibles
  useEffect(() => {
    if (!isVisible) return

    if (searchLibroDebounceRef.current) {
      clearTimeout(searchLibroDebounceRef.current)
    }

    const delay = busquedaLibro.trim() ? 350 : 0
    searchLibroDebounceRef.current = setTimeout(() => {
      fetchLibros(busquedaLibro)
    }, delay)

    return () => {
      if (searchLibroDebounceRef.current) {
        clearTimeout(searchLibroDebounceRef.current)
      }
    }
  }, [busquedaLibro, isVisible, fetchLibros])

  // Carga y búsqueda dinámica de usuarios
  useEffect(() => {
    if (!isVisible) return

    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current)
    }

    const delay = busquedaUsuario.trim() ? 350 : 0
    searchDebounceRef.current = setTimeout(() => {
      fetchUsuarios(busquedaUsuario)
    }, delay)

    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current)
      }
    }
  }, [busquedaUsuario, isVisible, fetchUsuarios])

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
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current)
    }
    if (searchLibroDebounceRef.current) {
      clearTimeout(searchLibroDebounceRef.current)
    }
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

  const librosFiltrados = useMemo(() => {
    let list = libros
    // Si hay un libro seleccionado que no está en la lista actual de resultados de búsqueda, lo incluimos al inicio para que no desaparezca
    if (selectedLibro && !list.some((l) => l.value === selectedLibro.value)) {
      list = [selectedLibro, ...list]
    }
    return list
  }, [libros, selectedLibro])

  const usuariosFiltrados = useMemo(() => {
    let list = usuarios
    // Si hay un usuario seleccionado que no está en la lista actual de resultados de búsqueda, lo incluimos al inicio para que no desaparezca
    if (selectedUsuario && !list.some((u) => u.value === selectedUsuario.value)) {
      list = [selectedUsuario, ...list]
    }
    return list
  }, [usuarios, selectedUsuario])

  return {
    isVisible,
    isControlled,
    handleOpen,
    handleClose,
    libros,
    usuarios,
    loadingCatalogos,
    loadingUsuarios,
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
  }
}

export default usePrestamoModal
