import React, { useState, useEffect } from 'react'
import { cilBookmark } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { CCard, CCardBody, CCardHeader, CSmartTable } from '@coreui/react-pro'
import { LibroIngresoItem } from '@/models/dashboard/dashboard.model'

export interface LibrosIngTablaProps {
  libros: LibroIngresoItem[]
  loading?: boolean
  haBuscado?: boolean
}

export const COLUMNAS_LIBROS: Array<{ key: string; label: string; _style?: React.CSSProperties }> = [
  { key: 'isbn', label: 'ISBN', _style: { minWidth: '125px' } },
  { key: 'titulo', label: 'Título', _style: { minWidth: '150px' } },
  { key: 'autor', label: 'Autor', _style: { minWidth: '150px' } },
  { key: 'editorial', label: 'Editorial', _style: { minWidth: '150px' } },
  { key: 'proveedor', label: 'Proveedor', _style: { minWidth: '150px' } },
  { key: 'categoria', label: 'Categoría', _style: { minWidth: '150px' } },
  { key: 'genero', label: 'Género', _style: { minWidth: '150px' } },
  { key: 'formato', label: 'Formato', _style: { minWidth: '150px' } },
  { key: 'volumen', label: 'Volumen', _style: { minWidth: '110px' } },
  { key: 'pais', label: 'País', _style: { minWidth: '110px' } },
  { key: 'fechaEdicion', label: 'Fecha Edición', _style: { minWidth: '150px' } },
  { key: 'fechaIngreso', label: 'Fecha Ingreso', _style: { minWidth: '150px' } },
  { key: 'estado', label: 'Estado', _style: { minWidth: '90px' } },
]

export const LibrosIngTabla: React.FC<LibrosIngTablaProps> = ({ libros, loading = false, haBuscado = false }) => {
  const [tableKey, setTableKey] = useState<number>(0)
  useEffect(() => {
    if (loading) {
      setTableKey((prev) => prev + 1)
    }
  }, [loading])

  return (
    <CCard className="shadow-sm border-0">
      <CCardHeader className="bg-body py-3 border-bottom d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center">
          <CIcon icon={cilBookmark} className="me-2" size="xl" style={{ color: '#b60741ff' }} />
          <span className="fw-bold text-body">
            Tabla de Ingreso de los Nuevos Libros
          </span>
        </div>
        <span className={`badge font-monospace ${haBuscado && libros.length > 0 ? 'bg-primary' : 'bg-secondary'}`}>
          {haBuscado ? `${libros.length} ${libros.length === 1 ? 'libro' : 'libros'}` : '0 libros'}
        </span>
      </CCardHeader>
      <CCardBody className="p-0">
        <CSmartTable
          key={tableKey}
          activePage={1}
          columns={COLUMNAS_LIBROS}
          items={libros}
          itemsPerPage={10}
          itemsPerPageSelect
          pagination
          tableFilter={haBuscado && !loading && libros.length > 0}
          tableFilterLabel="Filter:"
          tableFilterPlaceholder="Buscar por título, autor, isbn..."
          columnSorter
          noItemsLabel={
            <div className="text-center py-4 text-muted">
              {loading ? (
                'Cargando información de libros...'
              ) : !haBuscado ? (
                'No hay libros ingresados en el rango seleccionado.'
              ) : (
                'No se encontraron libros ingresados en este período.'
              )}
            </div>
          }
          scopedColumns={{
            isbn: (item: any) => (
              <td>
                <span className="font-monospace small text-muted badge bg-body rounded-pill border">
                  {item.isbn}
                </span>
              </td>
            ),
            titulo: (item: any) => (
              <td>
                <span className="font-monospace small text-body fw-medium">
                  {item.titulo}
                </span>
              </td>
            ),
            autor: (item: any) => (
              <td>
                <span className="badge bg-body small font-monospace text-body border rounded-pill">
                  {item.autor}
                </span>
              </td>
            ),
            editorial: (item: any) => (
              <td>
                <span className="font-monospace small">{item.editorial}</span>
              </td>
            ),
            proveedor: (item: any) => (
              <td>
                <span className="font-monospace small">{item.proveedor}</span>
              </td>
            ),
            categoria: (item: any) => (
              <td>
                <span className="font-monospace small fw-semibold">
                  {item.categoria}
                </span>
              </td>
            ),
            genero: (item: any) => (
              <td>
                <span className="font-monospace small">{item.genero}</span>
              </td>
            ),
            formato: (item: any) => (
              <td>
                <span className="font-monospace small">{item.formato}</span>
              </td>
            ),
            volumen: (item: any) => (
              <td>
                <span className="font-monospace small">{item.volumen}</span>
              </td>
            ),
            pais: (item: any) => (
              <td>
                <span className="font-monospace small badge bg-body text-body border rounded-pill">
                  {item.pais}
                </span>
              </td>
            ),
            fechaEdicion: (item: any) => (
              <td>
                <span className="badge bg-body rounded-pill text-primary border">
                  {item.fechaEdicion}
                </span>
              </td>
            ),
            fechaIngreso: (item: any) => (
              <td>
                <span className="badge bg-body border text-success rounded-pill">
                  {item.fechaIngreso}
                </span>
              </td>
            ),
            estado: (item: any) => (
              <td>
                <span className={`badge ${item.estado === 'Activo' ? 'bg-success' : 'bg-danger'}`}>
                  {item.estado}
                </span>
              </td>
            ),
          }}
          tableProps={{
            responsive: true,
            striped: true,
            hover: true,
            className: 'mb-0',
          }}
          tableBodyProps={{
            className: 'align-middle',
          }}
        />
      </CCardBody>
    </CCard>
  )
}

export default LibrosIngTabla
