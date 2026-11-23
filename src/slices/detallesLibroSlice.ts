import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Categoria } from '@/models/rco/categoria.model'
import { Editorial } from '@/models/rco/editorial.model'
import { Proveedor } from '@/models/rco/proveedor.model'
import { Autor } from '@/models/rco/autor.model'
import { GeneroLibro } from '@/models/rco/genero.model'

export interface DetallesLibroState {
  categorias: Categoria[]
  editoriales: Editorial[]
  proveedores: Proveedor[]
  autores: Autor[]
  generos: GeneroLibro[]
  categoriaSeleccionada: Categoria | null
  editorialSeleccionada: Editorial | null
  proveedorSeleccionado: Proveedor | null
  autorSeleccionado: Autor | null
  generoSeleccionado: GeneroLibro | null
}

const initialState: DetallesLibroState = {
  categorias: [],
  editoriales: [],
  proveedores: [],
  autores: [],
  generos: [],
  categoriaSeleccionada: null,
  editorialSeleccionada: null,
  proveedorSeleccionado: null,
  autorSeleccionado: null,
  generoSeleccionado: null,
}

// Helper para extraer el array de la respuesta
function extractList<T>(payload: any, key?: string): T[] {
  if (!payload) return []
  if (Array.isArray(payload)) return payload
  if (key && Array.isArray(payload[key])) return payload[key]
  if (Array.isArray(payload?.data)) return payload.data
  return []
}

export const detallesLibroSlice = createSlice({
  name: 'detallesLibro',
  initialState,
  reducers: {
    // ----------------------------------------------------
    // CATEGORÍAS
    // ----------------------------------------------------
    setCategorias: (state, action: PayloadAction<any>) => {
      state.categorias = extractList<Categoria>(action.payload, 'categorias')
    },
    setCategoriaSeleccionada: (state, action: PayloadAction<Categoria | null>) => {
      state.categoriaSeleccionada = action.payload
    },
    addCategoria: (state, action: PayloadAction<Categoria>) => {
      state.categorias.unshift(action.payload)
    },
    updateCategoria: (state, action: PayloadAction<Categoria>) => {
      const id = String(action.payload.ID_CATEGORIA)
      const index = state.categorias.findIndex((c) => String(c.ID_CATEGORIA) === id)
      if (index !== -1) {
        state.categorias[index] = { ...state.categorias[index], ...action.payload }
      }
      if (state.categoriaSeleccionada && String(state.categoriaSeleccionada.ID_CATEGORIA) === id) {
        state.categoriaSeleccionada = { ...state.categoriaSeleccionada, ...action.payload }
      }
    },
    removeCategoria: (state, action: PayloadAction<number | string>) => {
      const id = String(action.payload)
      state.categorias = state.categorias.filter((c) => String(c.ID_CATEGORIA) !== id)
      if (state.categoriaSeleccionada && String(state.categoriaSeleccionada.ID_CATEGORIA) === id) {
        state.categoriaSeleccionada = null
      }
    },
    resetCategorias: (state) => {
      state.categorias = []
      state.categoriaSeleccionada = null
    },

    // ----------------------------------------------------
    // EDITORIALES
    // ----------------------------------------------------
    setEditoriales: (state, action: PayloadAction<any>) => {
      state.editoriales = extractList<Editorial>(action.payload, 'editoriales')
    },
    setEditorialSeleccionada: (state, action: PayloadAction<Editorial | null>) => {
      state.editorialSeleccionada = action.payload
    },
    addEditorial: (state, action: PayloadAction<Editorial>) => {
      state.editoriales.unshift(action.payload)
    },
    updateEditorial: (state, action: PayloadAction<Editorial>) => {
      const id = String(action.payload.ID_EDITORIAL)
      const index = state.editoriales.findIndex((e) => String(e.ID_EDITORIAL) === id)
      if (index !== -1) {
        state.editoriales[index] = { ...state.editoriales[index], ...action.payload }
      }
      if (state.editorialSeleccionada && String(state.editorialSeleccionada.ID_EDITORIAL) === id) {
        state.editorialSeleccionada = { ...state.editorialSeleccionada, ...action.payload }
      }
    },
    removeEditorial: (state, action: PayloadAction<number | string>) => {
      const id = String(action.payload)
      state.editoriales = state.editoriales.filter((e) => String(e.ID_EDITORIAL) !== id)
      if (state.editorialSeleccionada && String(state.editorialSeleccionada.ID_EDITORIAL) === id) {
        state.editorialSeleccionada = null
      }
    },
    resetEditoriales: (state) => {
      state.editoriales = []
      state.editorialSeleccionada = null
    },

    // ----------------------------------------------------
    // PROVEEDORES
    // ----------------------------------------------------
    setProveedores: (state, action: PayloadAction<any>) => {
      state.proveedores = extractList<Proveedor>(action.payload, 'proveedores')
    },
    setProveedorSeleccionado: (state, action: PayloadAction<Proveedor | null>) => {
      state.proveedorSeleccionado = action.payload
    },
    addProveedor: (state, action: PayloadAction<Proveedor>) => {
      state.proveedores.unshift(action.payload)
    },
    updateProveedor: (state, action: PayloadAction<Proveedor>) => {
      const id = String(action.payload.ID_PROVEEDOR)
      const index = state.proveedores.findIndex((p) => String(p.ID_PROVEEDOR) === id)
      if (index !== -1) {
        state.proveedores[index] = { ...state.proveedores[index], ...action.payload }
      }
      if (state.proveedorSeleccionado && String(state.proveedorSeleccionado.ID_PROVEEDOR) === id) {
        state.proveedorSeleccionado = { ...state.proveedorSeleccionado, ...action.payload }
      }
    },
    removeProveedor: (state, action: PayloadAction<number | string>) => {
      const id = String(action.payload)
      state.proveedores = state.proveedores.filter((p) => String(p.ID_PROVEEDOR) !== id)
      if (state.proveedorSeleccionado && String(state.proveedorSeleccionado.ID_PROVEEDOR) === id) {
        state.proveedorSeleccionado = null
      }
    },
    resetProveedores: (state) => {
      state.proveedores = []
      state.proveedorSeleccionado = null
    },

    // ----------------------------------------------------
    // AUTORES
    // ----------------------------------------------------
    setAutores: (state, action: PayloadAction<any>) => {
      state.autores = extractList<Autor>(action.payload, 'autores')
    },
    setAutorSeleccionado: (state, action: PayloadAction<Autor | null>) => {
      state.autorSeleccionado = action.payload
    },
    addAutor: (state, action: PayloadAction<Autor>) => {
      state.autores.unshift(action.payload)
    },
    updateAutor: (state, action: PayloadAction<Autor>) => {
      const id = String(action.payload.ID_AUTOR)
      const index = state.autores.findIndex((a) => String(a.ID_AUTOR) === id)
      if (index !== -1) {
        state.autores[index] = { ...state.autores[index], ...action.payload }
      }
      if (state.autorSeleccionado && String(state.autorSeleccionado.ID_AUTOR) === id) {
        state.autorSeleccionado = { ...state.autorSeleccionado, ...action.payload }
      }
    },
    removeAutor: (state, action: PayloadAction<number | string>) => {
      const id = String(action.payload)
      state.autores = state.autores.filter((a) => String(a.ID_AUTOR) !== id)
      if (state.autorSeleccionado && String(state.autorSeleccionado.ID_AUTOR) === id) {
        state.autorSeleccionado = null
      }
    },
    resetAutores: (state) => {
      state.autores = []
      state.autorSeleccionado = null
    },

    // ----------------------------------------------------
    // GÉNEROS
    // ----------------------------------------------------
    setGeneros: (state, action: PayloadAction<any>) => {
      state.generos = extractList<GeneroLibro>(action.payload, 'generos')
    },
    setGeneroSeleccionado: (state, action: PayloadAction<GeneroLibro | null>) => {
      state.generoSeleccionado = action.payload
    },
    addGenero: (state, action: PayloadAction<GeneroLibro>) => {
      state.generos.unshift(action.payload)
    },
    updateGenero: (state, action: PayloadAction<GeneroLibro>) => {
      const id = String(action.payload.ID_RCOGENERO)
      const index = state.generos.findIndex((g) => String(g.ID_RCOGENERO) === id)
      if (index !== -1) {
        state.generos[index] = { ...state.generos[index], ...action.payload }
      }
      if (state.generoSeleccionado && String(state.generoSeleccionado.ID_RCOGENERO) === id) {
        state.generoSeleccionado = { ...state.generoSeleccionado, ...action.payload }
      }
    },
    removeGenero: (state, action: PayloadAction<number | string>) => {
      const id = String(action.payload)
      state.generos = state.generos.filter((g) => String(g.ID_RCOGENERO) !== id)
      if (state.generoSeleccionado && String(state.generoSeleccionado.ID_RCOGENERO) === id) {
        state.generoSeleccionado = null
      }
    },
    resetGeneros: (state) => {
      state.generos = []
      state.generoSeleccionado = null
    },

    // ----------------------------------------------------
    // RESET TOTAL
    // ----------------------------------------------------
    resetAllDetalles: () => initialState,
  },
})

export const {
  // Categorías
  setCategorias,
  setCategoriaSeleccionada,
  addCategoria,
  updateCategoria,
  removeCategoria,
  resetCategorias,

  // Editoriales
  setEditoriales,
  setEditorialSeleccionada,
  addEditorial,
  updateEditorial,
  removeEditorial,
  resetEditoriales,

  // Proveedores
  setProveedores,
  setProveedorSeleccionado,
  addProveedor,
  updateProveedor,
  removeProveedor,
  resetProveedores,

  // Autores
  setAutores,
  setAutorSeleccionado,
  addAutor,
  updateAutor,
  removeAutor,
  resetAutores,

  // Géneros
  setGeneros,
  setGeneroSeleccionado,
  addGenero,
  updateGenero,
  removeGenero,
  resetGeneros,

  // Global
  resetAllDetalles,
} = detallesLibroSlice.actions

export default detallesLibroSlice.reducer
