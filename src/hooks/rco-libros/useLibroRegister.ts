import React, { useState } from 'react'
import Swal from 'sweetalert2'
import { LibroFormData, initialLibroFormData } from '@/models/rco/libros'

import { useCatalogosLibros } from './useCatalogosLibros'
import { NuevoLibro } from '@/Service/rco/Libros'
import { parseDatePickerValue } from '@/utils/dateUtils'
import { usePermissions } from '@/context/PermissionsContext'

export interface UseLibroRegisterProps {
  visible?: boolean
  setVisible?: (visible: boolean) => void
  onSuccess?: () => void
  canGuardarLibro?: boolean
}

export const useLibroRegister = ({
  visible,
  setVisible,
  onSuccess,
  canGuardarLibro = true,
}: UseLibroRegisterProps = {}) => {
  const { verificarAccionEnServidor } = usePermissions()

  const [internalVisible, setInternalVisible] = useState(false)
  const isVisible = visible !== undefined ? visible : internalVisible

  const [formData, setFormData] = useState<LibroFormData>(initialLibroFormData)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const catalogos = useCatalogosLibros(true)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target
    let sanitizedValue = value

    if (name === 'TITULOTEJUELO_LIBROS') {
      sanitizedValue = value.slice(0, 10)
    } else if (name === 'AUTORTEJUELO_LIBROS') {
      sanitizedValue = value.slice(0, 3).toUpperCase()
    } else if (name === 'PRECIO_LIBROS') {
      sanitizedValue = value.replace(/[^0-9.]/g, '')
      const parts = sanitizedValue.split('.')
      if (parts.length > 2) {
        sanitizedValue = `${parts[0]}.${parts.slice(1).join('')}`
      }
      if (parts.length === 2 && parts[1].length > 2) {
        sanitizedValue = `${parts[0]}.${parts[1].slice(0, 2)}`
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: sanitizedValue,
    }))

    if (errors[name]) {
      setErrors((prev) => {
        const updated = { ...prev }
        delete updated[name]
        return updated
      })
    }
  }

  const handleSelectChange = (name: keyof LibroFormData, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    if (errors[name]) {
      setErrors((prev) => {
        const updated = { ...prev }
        delete updated[name]
        return updated
      })
    }
  }

  const handleClose = () => {
    setFormData(initialLibroFormData)
    setErrors({})
    if (setVisible) {
      setVisible(false)
    } else {
      setInternalVisible(false)
    }
  }

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {}
    const camposFaltantes: string[] = []

    if (!formData.TITULO_LIBROS || !formData.TITULO_LIBROS.trim()) {
      newErrors.TITULO_LIBROS = 'El título es obligatorio'
      camposFaltantes.push('Título')
    }
    if (!formData.FECHAEDICION_LIBROS) {
      newErrors.FECHAEDICION_LIBROS = 'La fecha de edición es obligatoria'
      camposFaltantes.push('Fecha de Edición')
    }
    if (!formData.ID_CATEGORIA) {
      newErrors.ID_CATEGORIA = 'Seleccione una categoría'
      camposFaltantes.push('Categoría')
    }
    if (!formData.ID_AUTOR) {
      newErrors.ID_AUTOR = 'Seleccione un autor'
      camposFaltantes.push('Autor')
    }
    if (!formData.ID_EDITORIAL) {
      newErrors.ID_EDITORIAL = 'Seleccione una editorial'
      camposFaltantes.push('Editorial')
    }
    if (!formData.ID_PROVEEDOR) {
      newErrors.ID_PROVEEDOR = 'Seleccione un proveedor'
      camposFaltantes.push('Proveedor')
    }
    if (!formData.ID_RCOGENERO) {
      newErrors.ID_RCOGENERO = 'Seleccione un género'
      camposFaltantes.push('Género')
    }
    if (!formData.ID_FORMATOS) {
      newErrors.ID_FORMATOS = 'Seleccione un formato'
      camposFaltantes.push('Formato')
    }
    if (!formData.ID_TIPO) {
      newErrors.ID_TIPO = 'Seleccione un tipo'
      camposFaltantes.push('Tipo')
    }
    if (!formData.ISBN_LIBROS || !formData.ISBN_LIBROS.trim()) {
      newErrors.ISBN_LIBROS = 'El ISBN es obligatorio (o marque S/N)'
      camposFaltantes.push('ISBN')
    }
    if (!formData.VOLUMEN_LIBROS || !formData.VOLUMEN_LIBROS.trim()) {
      newErrors.VOLUMEN_LIBROS = 'El volumen es obligatorio'
      camposFaltantes.push('Volumen')
    }
    if (!formData.PAIS_LIBROS || !formData.PAIS_LIBROS.trim()) {
      newErrors.PAIS_LIBROS = 'Seleccione o ingrese un país'
      camposFaltantes.push('País')
    }
    if (!formData.CODIGODEBARRAS_LIBROS || !formData.CODIGODEBARRAS_LIBROS.trim()) {
      newErrors.CODIGODEBARRAS_LIBROS = 'El código de barras es obligatorio (o marque S/N)'
      camposFaltantes.push('Código de Barras')
    }
    if (!formData.PRECIO_LIBROS || !String(formData.PRECIO_LIBROS).trim()) {
      newErrors.PRECIO_LIBROS = 'El precio es obligatorio'
      camposFaltantes.push('Precio')
    } else if (!/^\d+(\.\d{1,2})?$/.test(String(formData.PRECIO_LIBROS))) {
      newErrors.PRECIO_LIBROS = 'El precio debe contener solo números y hasta 2 decimales'
      camposFaltantes.push('Precio válido')
    }
    if (!formData.TITULOTEJUELO_LIBROS || !formData.TITULOTEJUELO_LIBROS.trim()) {
      newErrors.TITULOTEJUELO_LIBROS = 'El título tejuelo es obligatorio'
      camposFaltantes.push('Título tejuelo')
    } else if (formData.TITULOTEJUELO_LIBROS.length > 10) {
      newErrors.TITULOTEJUELO_LIBROS = 'El título tejuelo no debe superar 10 caracteres'
      camposFaltantes.push('Título tejuelo (máx 10)')
    }
    if (!formData.AUTORTEJUELO_LIBROS || !formData.AUTORTEJUELO_LIBROS.trim()) {
      newErrors.AUTORTEJUELO_LIBROS = 'El autor tejuelo es obligatorio'
      camposFaltantes.push('Autor tejuelo')
    } else if (formData.AUTORTEJUELO_LIBROS.length > 3) {
      newErrors.AUTORTEJUELO_LIBROS = 'El autor tejuelo no debe superar 3 caracteres'
      camposFaltantes.push('Autor tejuelo (máx 3)')
    }

    setErrors(newErrors)

    if (camposFaltantes.length > 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos requeridos o inválidos',
        text: `Por favor, revisa los siguientes campos: ${camposFaltantes.join(', ')}.`,
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return false
    }

    return true
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    if (!canGuardarLibro) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para guardar libros.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    const tienePermiso = await verificarAccionEnServidor('btn_guardar_libro')
    if (!tienePermiso) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para guardar libros.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    if (!validate()) return

    setLoading(true)
    try {
      const payload = new FormData()
      payload.append('ID_CATEGORIA', String(formData.ID_CATEGORIA))
      payload.append('ID_EDITORIAL', String(formData.ID_EDITORIAL))
      payload.append('ID_PROVEEDOR', String(formData.ID_PROVEEDOR))
      payload.append('ID_RCOGENERO', String(formData.ID_RCOGENERO))
      payload.append('ID_FORMATOS', String(formData.ID_FORMATOS))
      payload.append('ID_TIPO', String(formData.ID_TIPO))
      payload.append('ID_AUTOR', String(formData.ID_AUTOR))
      payload.append('ISBN_LIBROS', formData.ISBN_LIBROS || 'S/N')
      payload.append('TITULO_LIBROS', formData.TITULO_LIBROS.trim())
      payload.append('PRECIO_LIBROS', String(formData.PRECIO_LIBROS || '0'))
      payload.append('CODIGODEBARRAS_LIBROS', formData.CODIGODEBARRAS_LIBROS || 'S/N')
      payload.append('VOLUMEN_LIBROS', formData.VOLUMEN_LIBROS || '')
      const fechaNormalizada = parseDatePickerValue(formData.FECHAEDICION_LIBROS)
      payload.append('FECHAEDICION_LIBROS', fechaNormalizada || formData.FECHAEDICION_LIBROS)
      payload.append('PAIS_LIBROS', formData.PAIS_LIBROS || '')
      payload.append('DESCRIPCION_LIBROS', formData.DESCRIPCION_LIBROS || '')
      payload.append('TITULOTEJUELO_LIBROS', formData.TITULOTEJUELO_LIBROS || '')
      payload.append('AUTORTEJUELO_LIBROS', formData.AUTORTEJUELO_LIBROS || '')
      payload.append('ESTADO_LIBROS', '1')

      await NuevoLibro(payload)

      Swal.fire({
        icon: 'success',
        title: '¡Libro registrado!',
        text: 'El libro fue registrado exitosamente.',
        timer: 1800,
        showConfirmButton: false,
      })

      handleClose()
      if (onSuccess) {
        onSuccess()
      }
    } catch (err: any) {
      console.error(err)
      const errorMsg =
        err?.response?.data?.message ||
        'Ocurrió un error al registrar el libro. Por favor intenta de nuevo.'
      Swal.fire({
        icon: 'error',
        title: 'Error al registrar',
        text: errorMsg,
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
    } finally {
      setLoading(false)
    }
  }

  return {
    isVisible,
    formData,
    loading,
    errors,
    catalogos,
    handleChange,
    handleSelectChange,
    handleClose,
    handleSubmit,
    canGuardarLibro,
    verificarAccionEnServidor,
  }
}

export default useLibroRegister
