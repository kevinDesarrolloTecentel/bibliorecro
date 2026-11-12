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
        borderColor: invalid
          ? '#e55353'
          : state.isFocused
            ? '#86b7fe'
            : 'var(--cui-border-color, #ced4da)',
        boxShadow: state.isFocused
          ? invalid
            ? '0 0 0 0.25rem rgba(229, 83, 83, 0.25)'
            : '0 0 0 0.25rem rgba(13, 110, 253, 0.25)'
          : 'none',
        minHeight: '38px',
        height: '38px',
        borderRadius: '0.375rem',
        fontSize: '0.875rem',
        backgroundColor: disabled
          ? 'var(--cui-tertiary-bg, #e9ecef)'
          : 'var(--cui-body-bg, #fff)',
        color: 'var(--cui-body-color, #212529)',
        cursor: disabled ? 'not-allowed' : 'default',
        '&:hover': {
          borderColor: state.isFocused ? '#86b7fe' : 'var(--cui-border-color, #ced4da)',
        },
      }),
      singleValue: (base: any) => ({
        ...base,
        color: 'var(--cui-body-color, #212529)',
      }),
      input: (base: any) => ({
        ...base,
        margin: '0px',
        color: 'var(--cui-body-color, #212529)',
      }),
      placeholder: (base: any) => ({
        ...base,
        color: 'var(--cui-secondary-color, #6c757d)',
      }),
      valueContainer: (base: any) => ({
        ...base,
        height: '38px',
        padding: '0 8px',
      }),
      indicatorsContainer: (base: any) => ({
        ...base,
        height: '38px',
      }),
      dropdownIndicator: (base: any) => ({
        ...base,
        color: 'var(--cui-secondary-color, #6c757d)',
        '&:hover': {
          color: 'var(--cui-body-color, #212529)',
        },
      }),
      clearIndicator: (base: any) => ({
        ...base,
        color: 'var(--cui-secondary-color, #6c757d)',
        '&:hover': {
          color: 'var(--cui-body-color, #212529)',
        },
      }),
      indicatorSeparator: (base: any) => ({
        ...base,
        backgroundColor: 'var(--cui-border-color, #ced4da)',
      }),
      menu: (base: any) => ({
        ...base,
        fontSize: '0.875rem',
        backgroundColor: 'var(--cui-body-bg, #fff)',
        border: '1px solid var(--cui-border-color, #ced4da)',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
        zIndex: 99999,
      }),
      menuList: (base: any) => ({
        ...base,
        backgroundColor: 'var(--cui-body-bg, #fff)',
        padding: 0,
      }),
      option: (base: any, state: any) => ({
        ...base,
        backgroundColor: state.isSelected
          ? 'var(--cui-primary, #0d6efd)'
          : state.isFocused
            ? 'var(--cui-tertiary-bg, rgba(255, 255, 255, 0.08))'
            : 'transparent',
        color: state.isSelected
          ? '#ffffff'
          : 'var(--cui-body-color, #212529)',
        cursor: 'pointer',
        '&:active': {
          backgroundColor: 'var(--cui-primary, #0d6efd)',
          color: '#ffffff',
        },
      }),
      noOptionsMessage: (base: any) => ({
        ...base,
        color: 'var(--cui-secondary-color, #6c757d)',
      }),
      loadingMessage: (base: any) => ({
        ...base,
        color: 'var(--cui-secondary-color, #6c757d)',
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
