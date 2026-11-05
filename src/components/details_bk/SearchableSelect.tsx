import React, { useState, useMemo } from 'react'
import Select, { SingleValue } from 'react-select'
import { CatalogoOption } from '@/models/rco/libros'

interface SearchableSelectProps {
  name: string
  value: string | number
  onChange: (value: string | number) => void
  options: CatalogoOption[]
  placeholder?: string
  invalid?: boolean
  disabled?: boolean
  loading?: boolean
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  name,
  value,
  onChange,
  options,
  placeholder = 'Seleccionar o escribir para buscar...',
  invalid = false,
  disabled = false,
  loading = false,
}) => {
  const [searchText, setSearchText] = useState('')

  const selectedOption = useMemo(() => {
    if (!value && value !== 0 && value !== '0') return null
    const found = options.find((opt) => String(opt.value) === String(value))
    if (found) return found
    return null
  }, [options, value])

  const displayedOptions = useMemo(() => {
    let list: CatalogoOption[]
    const q = searchText.trim().toLowerCase()
    if (!q) {
      list = options.slice(0, 80)
    } else {
      list = options.filter((opt) => opt.label.toLowerCase().includes(q)).slice(0, 80)
    }

    if (
      selectedOption &&
      !list.some((opt) => String(opt.value) === String(selectedOption.value))
    ) {
      return [selectedOption, ...list]
    }
    return list
  }, [options, searchText, selectedOption])

  const commonProps = {
    name,
    value: selectedOption,
    onChange: (selected: SingleValue<CatalogoOption>) => {
      onChange(selected ? selected.value : '')
    },
    onInputChange: (val: string, action: any) => {
      if (action.action === 'input-change') {
        setSearchText(val)
      } else if (action.action === 'menu-close') {
        setSearchText('')
      }
    },
    options: displayedOptions,
    placeholder: loading ? 'Cargando datos...' : placeholder,
    isDisabled: disabled,
    isLoading: loading,
    isClearable: true,
    isSearchable: true,
    filterOption: () => true,
    noOptionsMessage: () =>
      searchText ? 'No se encontraron resultados' : 'Escribe para buscar...',
    classNamePrefix: 'searchable-select',
    menuPortalTarget: typeof document !== 'undefined' ? document.body : undefined,
    menuPosition: 'fixed' as const,
    styles: {
      menuPortal: (base: any) => ({ ...base, zIndex: 99999 }),
      control: (base: any, state: any) => ({
        ...base,
        borderColor: invalid ? '#e55353' : state.isFocused ? '#86b7fe' : '#ced4da',
        boxShadow: state.isFocused
          ? invalid
            ? '0 0 0 0.25rem rgba(229, 83, 83, 0.25)'
            : '0 0 0 0.25rem rgba(13, 110, 253, 0.25)'
          : 'none',
        minHeight: '38px',
        height: '38px',
        borderRadius: '0.375rem',
        fontSize: '0.875rem',
        backgroundColor: disabled ? '#e9ecef' : '#fff',
        cursor: disabled ? 'not-allowed' : 'default',
      }),
      valueContainer: (base: any) => ({
        ...base,
        height: '38px',
        padding: '0 8px',
      }),
      input: (base: any) => ({
        ...base,
        margin: '0px',
      }),
      indicatorsContainer: (base: any) => ({
        ...base,
        height: '38px',
      }),
      menu: (base: any) => ({
        ...base,
        fontSize: '0.875rem',
      }),
    },
  }

  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <Select {...commonProps} />
    </div>
  )
}

export default SearchableSelect
