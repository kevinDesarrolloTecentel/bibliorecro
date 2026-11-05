import React, { useState, useMemo } from 'react'
import Select, { SingleValue } from 'react-select'

interface PaisOption {
  value: string
  label: string
}

const PAISES: PaisOption[] = [
  { value: 'Afganistán', label: 'Afganistán' },
  { value: 'Albania', label: 'Albania' },
  { value: 'Alemania', label: 'Alemania' },
  { value: 'Andorra', label: 'Andorra' },
  { value: 'Angola', label: 'Angola' },
  { value: 'Antigua y Barbuda', label: 'Antigua y Barbuda' },
  { value: 'Arabia Saudita', label: 'Arabia Saudita' },
  { value: 'Argelia', label: 'Argelia' },
  { value: 'Argentina', label: 'Argentina' },
  { value: 'Armenia', label: 'Armenia' },
  { value: 'Australia', label: 'Australia' },
  { value: 'Austria', label: 'Austria' },
  { value: 'Azerbaiyán', label: 'Azerbaiyán' },
  { value: 'Bahamas', label: 'Bahamas' },
  { value: 'Bangladés', label: 'Bangladés' },
  { value: 'Barbados', label: 'Barbados' },
  { value: 'Bélgica', label: 'Bélgica' },
  { value: 'Belice', label: 'Belice' },
  { value: 'Benín', label: 'Benín' },
  { value: 'Bielorrusia', label: 'Bielorrusia' },
  { value: 'Bolivia', label: 'Bolivia' },
  { value: 'Bosnia y Herzegovina', label: 'Bosnia y Herzegovina' },
  { value: 'Botsuana', label: 'Botsuana' },
  { value: 'Brasil', label: 'Brasil' },
  { value: 'Brunéi', label: 'Brunéi' },
  { value: 'Bulgaria', label: 'Bulgaria' },
  { value: 'Burkina Faso', label: 'Burkina Faso' },
  { value: 'Burundi', label: 'Burundi' },
  { value: 'Bután', label: 'Bután' },
  { value: 'Cabo Verde', label: 'Cabo Verde' },
  { value: 'Camboya', label: 'Camboya' },
  { value: 'Camerún', label: 'Camerún' },
  { value: 'Canadá', label: 'Canadá' },
  { value: 'Chad', label: 'Chad' },
  { value: 'Chile', label: 'Chile' },
  { value: 'China', label: 'China' },
  { value: 'Chipre', label: 'Chipre' },
  { value: 'Colombia', label: 'Colombia' },
  { value: 'Comoras', label: 'Comoras' },
  { value: 'Congo', label: 'Congo' },
  { value: 'Corea del Norte', label: 'Corea del Norte' },
  { value: 'Corea del Sur', label: 'Corea del Sur' },
  { value: 'Costa de Marfil', label: 'Costa de Marfil' },
  { value: 'Costa Rica', label: 'Costa Rica' },
  { value: 'Croacia', label: 'Croacia' },
  { value: 'Cuba', label: 'Cuba' },
  { value: 'Dinamarca', label: 'Dinamarca' },
  { value: 'Dominica', label: 'Dominica' },
  { value: 'Ecuador', label: 'Ecuador' },
  { value: 'Egipto', label: 'Egipto' },
  { value: 'El Salvador', label: 'El Salvador' },
  { value: 'Emiratos Árabes Unidos', label: 'Emiratos Árabes Unidos' },
  { value: 'Eritrea', label: 'Eritrea' },
  { value: 'Eslovaquia', label: 'Eslovaquia' },
  { value: 'Eslovenia', label: 'Eslovenia' },
  { value: 'España', label: 'España' },
  { value: 'Estados Unidos', label: 'Estados Unidos' },
  { value: 'Estonia', label: 'Estonia' },
  { value: 'Etiopía', label: 'Etiopía' },
  { value: 'Filipinas', label: 'Filipinas' },
  { value: 'Finlandia', label: 'Finlandia' },
  { value: 'Fiyi', label: 'Fiyi' },
  { value: 'Francia', label: 'Francia' },
  { value: 'Gabón', label: 'Gabón' },
  { value: 'Gambia', label: 'Gambia' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Ghana', label: 'Ghana' },
  { value: 'Granada', label: 'Granada' },
  { value: 'Grecia', label: 'Grecia' },
  { value: 'Guatemala', label: 'Guatemala' },
  { value: 'Guinea', label: 'Guinea' },
  { value: 'Guinea Ecuatorial', label: 'Guinea Ecuatorial' },
  { value: 'Guinea-Bisáu', label: 'Guinea-Bisáu' },
  { value: 'Guyana', label: 'Guyana' },
  { value: 'Haití', label: 'Haití' },
  { value: 'Honduras', label: 'Honduras' },
  { value: 'Hungría', label: 'Hungría' },
  { value: 'India', label: 'India' },
  { value: 'Indonesia', label: 'Indonesia' },
  { value: 'Irak', label: 'Irak' },
  { value: 'Irán', label: 'Irán' },
  { value: 'Irlanda', label: 'Irlanda' },
  { value: 'Islandia', label: 'Islandia' },
  { value: 'Islas Marshall', label: 'Islas Marshall' },
  { value: 'Islas Salomón', label: 'Islas Salomón' },
  { value: 'Israel', label: 'Israel' },
  { value: 'Italia', label: 'Italia' },
  { value: 'Jamaica', label: 'Jamaica' },
  { value: 'Japón', label: 'Japón' },
  { value: 'Jordania', label: 'Jordania' },
  { value: 'Kazajistán', label: 'Kazajistán' },
  { value: 'Kenia', label: 'Kenia' },
  { value: 'Kirguistán', label: 'Kirguistán' },
  { value: 'Kiribati', label: 'Kiribati' },
  { value: 'Kuwait', label: 'Kuwait' },
  { value: 'Laos', label: 'Laos' },
  { value: 'Lesoto', label: 'Lesoto' },
  { value: 'Letonia', label: 'Letonia' },
  { value: 'Líbano', label: 'Líbano' },
  { value: 'Liberia', label: 'Liberia' },
  { value: 'Libia', label: 'Libia' },
  { value: 'Liechtenstein', label: 'Liechtenstein' },
  { value: 'Lituania', label: 'Lituania' },
  { value: 'Luxemburgo', label: 'Luxemburgo' },
  { value: 'Madagascar', label: 'Madagascar' },
  { value: 'Malasia', label: 'Malasia' },
  { value: 'Malaui', label: 'Malaui' },
  { value: 'Maldivas', label: 'Maldivas' },
  { value: 'Malí', label: 'Malí' },
  { value: 'Malta', label: 'Malta' },
  { value: 'Marruecos', label: 'Marruecos' },
  { value: 'Mauricio', label: 'Mauricio' },
  { value: 'Mauritania', label: 'Mauritania' },
  { value: 'México', label: 'México' },
  { value: 'Micronesia', label: 'Micronesia' },
  { value: 'Moldavia', label: 'Moldavia' },
  { value: 'Mónaco', label: 'Mónaco' },
  { value: 'Mongolia', label: 'Mongolia' },
  { value: 'Montenegro', label: 'Montenegro' },
  { value: 'Mozambique', label: 'Mozambique' },
  { value: 'Myanmar', label: 'Myanmar' },
  { value: 'Namibia', label: 'Namibia' },
  { value: 'Nauru', label: 'Nauru' },
  { value: 'Nepal', label: 'Nepal' },
  { value: 'Nicaragua', label: 'Nicaragua' },
  { value: 'Níger', label: 'Níger' },
  { value: 'Nigeria', label: 'Nigeria' },
  { value: 'Noruega', label: 'Noruega' },
  { value: 'Nueva Zelanda', label: 'Nueva Zelanda' },
  { value: 'Omán', label: 'Omán' },
  { value: 'Países Bajos', label: 'Países Bajos' },
  { value: 'Pakistán', label: 'Pakistán' },
  { value: 'Palaos', label: 'Palaos' },
  { value: 'Palestina', label: 'Palestina' },
  { value: 'Panamá', label: 'Panamá' },
  { value: 'Papúa Nueva Guinea', label: 'Papúa Nueva Guinea' },
  { value: 'Paraguay', label: 'Paraguay' },
  { value: 'Perú', label: 'Perú' },
  { value: 'Polonia', label: 'Polonia' },
  { value: 'Portugal', label: 'Portugal' },
  { value: 'Qatar', label: 'Qatar' },
  { value: 'Reino Unido', label: 'Reino Unido' },
  { value: 'República Centroafricana', label: 'República Centroafricana' },
  { value: 'República Checa', label: 'República Checa' },
  { value: 'República del Congo', label: 'República del Congo' },
  { value: 'República Democrática del Congo', label: 'República Democrática del Congo' },
  { value: 'República Dominicana', label: 'República Dominicana' },
  { value: 'Ruanda', label: 'Ruanda' },
  { value: 'Rumanía', label: 'Rumanía' },
  { value: 'Rusia', label: 'Rusia' },
  { value: 'Samoa', label: 'Samoa' },
  { value: 'San Cristóbal y Nieves', label: 'San Cristóbal y Nieves' },
  { value: 'San Marino', label: 'San Marino' },
  { value: 'San Vicente y las Granadinas', label: 'San Vicente y las Granadinas' },
  { value: 'Santa Lucía', label: 'Santa Lucía' },
  { value: 'Santo Tomé y Príncipe', label: 'Santo Tomé y Príncipe' },
  { value: 'Senegal', label: 'Senegal' },
  { value: 'Serbia', label: 'Serbia' },
  { value: 'Seychelles', label: 'Seychelles' },
  { value: 'Sierra Leona', label: 'Sierra Leona' },
  { value: 'Singapur', label: 'Singapur' },
  { value: 'Siria', label: 'Siria' },
  { value: 'Somalia', label: 'Somalia' },
  { value: 'Sri Lanka', label: 'Sri Lanka' },
  { value: 'Suazilandia', label: 'Suazilandia' },
  { value: 'Sudáfrica', label: 'Sudáfrica' },
  { value: 'Sudán', label: 'Sudán' },
  { value: 'Sudán del Sur', label: 'Sudán del Sur' },
  { value: 'Suecia', label: 'Suecia' },
  { value: 'Suiza', label: 'Suiza' },
  { value: 'Surinam', label: 'Surinam' },
  { value: 'Tailandia', label: 'Tailandia' },
  { value: 'Tanzania', label: 'Tanzania' },
  { value: 'Tayikistán', label: 'Tayikistán' },
  { value: 'Timor Oriental', label: 'Timor Oriental' },
  { value: 'Togo', label: 'Togo' },
  { value: 'Tonga', label: 'Tonga' },
  { value: 'Trinidad y Tobago', label: 'Trinidad y Tobago' },
  { value: 'Túnez', label: 'Túnez' },
  { value: 'Turkmenistán', label: 'Turkmenistán' },
  { value: 'Turquía', label: 'Turquía' },
  { value: 'Tuvalu', label: 'Tuvalu' },
  { value: 'Ucrania', label: 'Ucrania' },
  { value: 'Uganda', label: 'Uganda' },
  { value: 'Uruguay', label: 'Uruguay' },
  { value: 'Uzbekistán', label: 'Uzbekistán' },
  { value: 'Vanuatu', label: 'Vanuatu' },
  { value: 'Venezuela', label: 'Venezuela' },
  { value: 'Vietnam', label: 'Vietnam' },
  { value: 'Yemen', label: 'Yemen' },
  { value: 'Yibuti', label: 'Yibuti' },
  { value: 'Zambia', label: 'Zambia' },
  { value: 'Zimbabue', label: 'Zimbabue' },
]

interface PaisSelectProps {
  value: string
  onChange: (value: string) => void
  invalid?: boolean
  disabled?: boolean
}

export const PaisSelect: React.FC<PaisSelectProps> = ({
  value,
  onChange,
  invalid = false,
  disabled = false,
}) => {
  const [searchText, setSearchText] = useState('')

  const selectedOption = useMemo(
    () => PAISES.find((p) => p.value === value) || null,
    [value]
  )

  const displayedOptions = useMemo(() => {
    const q = searchText.trim().toLowerCase()
    if (!q) return PAISES
    return PAISES.filter((p) => p.label.toLowerCase().includes(q))
  }, [searchText])

  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <Select<PaisOption>
        value={selectedOption}
        onChange={(selected: SingleValue<PaisOption>) => onChange(selected ? selected.value : '')}
        onInputChange={(val: string, action: any) => {
          if (action.action === 'input-change') setSearchText(val)
          else if (action.action === 'menu-close') setSearchText('')
        }}
        options={displayedOptions}
        placeholder="Seleccionar país o buscar..."
        isDisabled={disabled}
        isClearable
        isSearchable
        filterOption={() => true}
        noOptionsMessage={() => 'No se encontraron países'}
        classNamePrefix="searchable-select"
        menuPortalTarget={typeof document !== 'undefined' ? document.body : undefined}
        menuPosition="fixed"
        styles={{
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
          }),
          valueContainer: (base: any) => ({ ...base, height: '38px', padding: '0 8px' }),
          input: (base: any) => ({ ...base, margin: '0px' }),
          indicatorsContainer: (base: any) => ({ ...base, height: '38px' }),
          menu: (base: any) => ({ ...base, fontSize: '0.875rem' }),
        }}
      />
    </div>
  )
}

export default PaisSelect
