import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AdminUsuario } from '@/models/adm/user.model'
import { AdminRol } from '@/models/adm/rol.model'
import { CatalogoModulo } from '@/models/adm/catalogo.model'

// Estado Global del Módulo de Administración
export interface AdminState {
  usuarios: AdminUsuario[]
  usuarioSeleccionado: AdminUsuario | null
  roles: AdminRol[]
  rolSeleccionado: AdminRol | null
  catalogo: CatalogoModulo[]
}

const initialState: AdminState = {
  usuarios: [],
  usuarioSeleccionado: null,
  roles: [],
  rolSeleccionado: null,
  catalogo: [],
}

export const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    // Usuarios
    setUsuarios: (state, action: PayloadAction<AdminUsuario[]>) => {
      state.usuarios = action.payload
      if (state.usuarioSeleccionado) {
        const matching = action.payload.find(
          (u) => String(u.ID_USUARIO) === String(state.usuarioSeleccionado?.ID_USUARIO),
        )
        if (matching) {
          state.usuarioSeleccionado = matching
        }
      }
    },
    setUsuarioSeleccionado: (state, action: PayloadAction<AdminUsuario | null>) => {
      state.usuarioSeleccionado = action.payload
    },
    agregarUsuario: (state, action: PayloadAction<AdminUsuario>) => {
      state.usuarios.unshift(action.payload)
    },
    actualizarUsuarioEnLista: (state, action: PayloadAction<AdminUsuario>) => {
      const idx = state.usuarios.findIndex(
        (u) => String(u.ID_USUARIO) === String(action.payload.ID_USUARIO),
      )
      if (idx !== -1) {
        state.usuarios[idx] = { ...state.usuarios[idx], ...action.payload }
      }
      if (String(state.usuarioSeleccionado?.ID_USUARIO) === String(action.payload.ID_USUARIO)) {
        state.usuarioSeleccionado = { ...state.usuarioSeleccionado, ...action.payload }
      }
    },
    actualizarRolesUsuario: (
      state,
      action: PayloadAction<{ idUsuario: number | string; roles: AdminRol[] }>,
    ) => {
      const { idUsuario, roles } = action.payload
      const idx = state.usuarios.findIndex((u) => String(u.ID_USUARIO) === String(idUsuario))
      if (idx !== -1) {
        state.usuarios[idx] = {
          ...state.usuarios[idx],
          ROLES: roles,
        }
      }
      if (String(state.usuarioSeleccionado?.ID_USUARIO) === String(idUsuario)) {
        state.usuarioSeleccionado = {
          ...state.usuarioSeleccionado,
          ROLES: roles,
        }
      }
    },
    eliminarUsuarioDeLista: (state, action: PayloadAction<number | string>) => {
      state.usuarios = state.usuarios.filter(
        (u) => String(u.ID_USUARIO) !== String(action.payload),
      )
      if (String(state.usuarioSeleccionado?.ID_USUARIO) === String(action.payload)) {
        state.usuarioSeleccionado = null
      }
    },

    // Roles
    setRoles: (state, action: PayloadAction<AdminRol[]>) => {
      state.roles = action.payload
    },
    setRolSeleccionado: (state, action: PayloadAction<AdminRol | null>) => {
      state.rolSeleccionado = action.payload
    },
    agregarRol: (state, action: PayloadAction<AdminRol>) => {
      state.roles.unshift(action.payload)
    },
    actualizarRolEnLista: (state, action: PayloadAction<AdminRol>) => {
      const idx = state.roles.findIndex(
        (r) => String(r.ID_ROL) === String(action.payload.ID_ROL),
      )
      if (idx !== -1) {
        state.roles[idx] = { ...state.roles[idx], ...action.payload }
      }
      if (String(state.rolSeleccionado?.ID_ROL) === String(action.payload.ID_ROL)) {
        state.rolSeleccionado = { ...state.rolSeleccionado, ...action.payload }
      }
    },
    eliminarRolDeLista: (state, action: PayloadAction<number | string>) => {
      state.roles = state.roles.filter((r) => String(r.ID_ROL) !== String(action.payload))
      if (String(state.rolSeleccionado?.ID_ROL) === String(action.payload)) {
        state.rolSeleccionado = null
      }
    },

    // Catálogo (Administración de Permisos)
    setCatalogo: (state, action: PayloadAction<CatalogoModulo[]>) => {
      state.catalogo = action.payload
    },
  },
})

export const {
  setUsuarios,
  setUsuarioSeleccionado,
  agregarUsuario,
  actualizarUsuarioEnLista,
  actualizarRolesUsuario,
  eliminarUsuarioDeLista,
  setRoles,
  setRolSeleccionado,
  agregarRol,
  actualizarRolEnLista,
  eliminarRolDeLista,
  setCatalogo,
} = adminSlice.actions

export default adminSlice.reducer
