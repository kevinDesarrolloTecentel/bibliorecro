import { useCallback, useEffect, useState } from 'react'
import Swal from 'sweetalert2'
import { Libros } from '@/models/rco/libros'
import { ActualizarLibro, EliminarLibro, getLibros } from '@/Service/rco/libros'


export type LibroItem = Libros

export const useLibro = () => {
  const [libros, setLibros] = useState<Libros[]>([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeQuery, setActiveQuery] = useState('')

  const [modalRegister, setModalRegister] = useState(false)
  const [modalEdit, setModalEdit] = useState(false)
  const [libroSeleccionado, setLibroSeleccionado] = useState<Libros | null>(null)

  const [details, setDetails] = useState<(string | number)[]>([])

  const toggleDetails = (id: string | number) => {
    setDetails((prev) => {
      const position = prev.indexOf(id)
      let newDetails = [...prev]
      if (position !== -1) {
        newDetails.splice(position, 1)
      } else {
        newDetails = [...prev, id]
      }
      return newDetails
    })
  }

  const fetchLibros = useCallback(
    async () => {
      setLoading(true)
      try {
        const response = await getLibros()
        const rawData = response?.data || []
        const pagination = response?.pagination

        const parsedList: Libros[] = rawData.map((item: any, index: number) => {
          const id = item.ID_LIBROS ?? item.id ?? index + 1
          const estadoLibroRaw = item.ESTADO_LIBROS ?? item.estado ?? 1
          const enPrestamoRaw = item.EN_PRESTAMO ?? 0

          return {
            ...item,
            id,
            ID_LIBROS: id,
            ISBN: item.ISBN_LIBROS || item.isbn || 'S/C',
            Titulo: item.TITULO_LIBROS || item.titulo || '',
            Autor: item.NOMBRE_AUTOR || item.autor || 'Sin autor',
            Categoria: item.NOMBRE_CATEGORIA || item.categoria || 'Sin categoría',
            Editorial: item.NOMBRE_EDITORIAL || item.editorial || 'Sin editorial',
            Proveedor: item.NOMBRE_PROVEEDOR || item.proveedor || 'Sin proveedor',
            Formatos: item.NOMBRE_FORMATOS || item.formato || 'Libros',
            Tipo: item.NOMBRE_TIPO || item.tipo || 'General',
            Genero: item.NOMBRE_RCOGENERO || item.genero || 'Sin género',
            FechaEdicion: item.FECHA_EDICION_FORMAT || (item.FECHAEDICION_LIBROS ? new Date(item.FECHAEDICION_LIBROS).toLocaleDateString() : '-'),
            FechaRegistro: item.FECHA_REGISTRO_FORMAT || (item.FECHAREGISTRO_LIBROS ? new Date(item.FECHAREGISTRO_LIBROS).toLocaleDateString() : '-'),
            Disponibilidad: enPrestamoRaw === 0 ? 'Disponible' : 'En préstamo',
            Estado: Number(estadoLibroRaw) === 1 ? 'Activo' : 'Inactivo',
            Pais: item.PAIS_LIBROS || item.pais || '-',
            Precio: item.PRECIO_LIBROS ?? item.precio ?? 0,
            Volumen: item.VOLUMEN_LIBROS || item.volumen || '-',
            CodigoBarras: item.CODIGODEBARRAS_LIBROS || item.codigo || 'S/C',
            TituloTejuelo: item.TITULOTEJUELO_LIBROS || item.titulo_tejuelo || '-',
            AutorTejuelo: item.AUTORTEJUELO_LIBROS || item.autor_tejuelo || '-',
            Descripcion: item.DESCRIPCION_LIBROS || item.descripcion || 'Sin descripción',
          }
        })

        setLibros(parsedList)
        setCurrentPage(pagination?.current_page || response?.current_page)
        setTotalPages(pagination?.last_page || response?.last_page)
        setTotalItems(pagination?.total || response?.total)
      } catch (error) {
        console.error('Error al obtener libros:', error)
        setLibros([])
      } finally {
        setLoading(false)
      }
    },
    [activeQuery],
  )

  useEffect(() => {
    fetchLibros()
  }, [fetchLibros])

  const handleBuscar = () => {
    const q = searchTerm.trim()
    setActiveQuery(q)
    setCurrentPage(1)
    fetchLibros()
  }

  const handleLimpiarBusqueda = () => {
    setSearchTerm('')
    setActiveQuery('')
    setCurrentPage(1)
    fetchLibros()
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    fetchLibros()
  }

  const handleAbrirCrear = () => {
    setModalRegister(true)
  }

  const handleAbrirEditar = (libro: Libros) => {
    setLibroSeleccionado(libro)
    setModalEdit(true)
  }

  const handleInactivarLibro = async (libro: Libros) => {
    const id = libro.ID_LIBROS ?? libro.id
    if (!id) return

    const estadoNum = Number(libro.ESTADO_LIBROS)
    if (estadoNum === 0) {
      Swal.fire({
        icon: 'info',
        title: 'Libro ya dado de baja',
        text: 'El libro ya está marcado como inactivo o dado de baja.',
        confirmButtonColor: '#044c8c',
      })
      return
    }

    const confirmResult = await Swal.fire({
      title: 'Confirmar Dar de baja',
      text: `¿Estás seguro de que quieres inactivar el libro "${libro.TITULO_LIBROS || 'este libro'}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#044c8c',
      cancelButtonColor: '#e4342c',
      confirmButtonText: 'Sí, dar de baja',
      cancelButtonText: 'Cancelar',
    })

    if (!confirmResult.isConfirmed) return

    try {
      await ActualizarLibro(id)
      Swal.fire({
        icon: 'success',
        title: '¡Éxito!',
        text: 'El estado del libro ha sido actualizado a Inactivo.',
        confirmButtonColor: '#04833c',
      })
      fetchLibros()
    } catch (err: any) {
      console.error(err)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err?.response?.data?.message || 'Hubo un error al inactivar el libro.',
        confirmButtonColor: '#d33',
      })
    }
  }

  const handleEliminarLibro = async (libro?: Libros) => {
    const target = libro || libroSeleccionado
    if (!target) return
    const id = target.ID_LIBROS ?? target.id
    if (!id) return

    const confirmResult = await Swal.fire({
      title: '¿Está Seguro?',
      text: `¡No podrás revertir esto! Se eliminará el libro "${target.TITULO_LIBROS || 'este libro'}".`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#044c8c',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, ¡bórralo!',
      cancelButtonText: 'Cancelar',
    })

    if (!confirmResult.isConfirmed) return

    try {
      await EliminarLibro(id)
      Swal.fire({
        icon: 'success',
        title: '¡Eliminado!',
        text: 'Libro eliminado con éxito.',
        confirmButtonColor: '#044c8c',
      })
      fetchLibros()
    } catch (err: any) {
      console.error(err)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err?.response?.data?.message || 'No se pudo eliminar el libro.',
        confirmButtonColor: '#d33',
      })
    }
  }

  return {
    libros,
    loading,
    currentPage,
    totalPages,
    totalItems,
    searchTerm,
    setSearchTerm,
    activeQuery,
    handleBuscar,
    handleLimpiarBusqueda,
    handlePageChange,
    fetchLibros,
    modalRegister,
    setModalRegister,
    modalEdit,
    setModalEdit,
    libroSeleccionado,
    setLibroSeleccionado,
    details,
    toggleDetails,
    handleAbrirCrear,
    handleAbrirEditar,
    handleInactivarLibro,
    handleEliminarLibro,
  }
}

export const useLibroReg = useLibro
export default useLibro