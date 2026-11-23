// Modelo de rco_proveedor
export interface RcoProveedor {
  id?: number | string
  ID_PROVEEDOR?: number | string
  NOMBRE_PROVEEDOR: string
  FECHAINGRESO_PROVEEDOR?: string | null
}

export type Proveedor = RcoProveedor
