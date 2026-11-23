import ts from 'file:///C:/Users/USER/Desktop/BiblioRecro/bibliorecro/node_modules/typescript/lib/typescript.js';
import path from 'path';

const projectDir = 'c:\\Users\\USER\\Desktop\\BiblioRecro\\bibliorecro';
const configPath = path.join(projectDir, 'tsconfig.json');

const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
if (configFile.error) {
  console.error(configFile.error);
  process.exit(1);
}

const parsedCommandLine = ts.parseJsonConfigFileContent(
  configFile.config,
  ts.sys,
  projectDir
);

const filesToCheck = [
  // Models
  path.join(projectDir, 'src', 'models', 'adm', 'user.model.ts'),
  path.join(projectDir, 'src', 'models', 'adm', 'rol.model.ts'),
  path.join(projectDir, 'src', 'models', 'adm', 'permiso.model.ts'),
  path.join(projectDir, 'src', 'models', 'adm', 'permisoAccion.model.ts'),
  path.join(projectDir, 'src', 'models', 'adm', 'catalogo.model.ts'),
  path.join(projectDir, 'src', 'models', 'tab', 'persona.model.ts'),
  // Slices
  path.join(projectDir, 'src', 'slices', 'authSlice.ts'),
  path.join(projectDir, 'src', 'slices', 'adminSlice.ts'),
  path.join(projectDir, 'src', 'slices', 'personaSlice.ts'),
  // Services
  path.join(projectDir, 'src', 'Service', 'ApiClient.ts'),
  path.join(projectDir, 'src', 'Service', 'adm', 'AdminUser.ts'),
  path.join(projectDir, 'src', 'Service', 'adm', 'Permisos.ts'),
  path.join(projectDir, 'src', 'Service', 'adm', 'Rol.ts'),
  path.join(projectDir, 'src', 'Service', 'tab', 'Persona.ts'),
  // Utils
  path.join(projectDir, 'src', 'utils', 'auth.ts'),
  path.join(projectDir, 'src', 'utils', 'errors.ts'),
  path.join(projectDir, 'src', 'utils', 'imageUtils.ts'),
  // Gestión de Usuarios - Renovaciones
  path.join(projectDir, 'src', 'hooks', 'tab-persona', 'useRenovaciones.ts'),
  path.join(projectDir, 'src', 'components', 'clients', 'ModalAceptarSolicitud.tsx'),
  path.join(projectDir, 'src', 'views', 'pages', 'clients', 'Renovate.tsx'),
  // Gestión de Usuarios - Registrados
  path.join(projectDir, 'src', 'hooks', 'tab-persona', 'usePersonas.ts'),
  path.join(projectDir, 'src', 'hooks', 'tab-persona', 'useClienteDs.ts'),
  path.join(projectDir, 'src', 'hooks', 'tab-persona', 'usePersonaRegister.ts'),
  path.join(projectDir, 'src', 'hooks', 'tab-persona', 'usePersonaEdit.ts'),
  path.join(projectDir, 'src', 'components', 'clients', 'HeaderCliente.tsx'),
  path.join(projectDir, 'src', 'components', 'clients', 'Modal_Register.tsx'),
  path.join(projectDir, 'src', 'components', 'clients', 'Modal_Edit.tsx'),
  path.join(projectDir, 'src', 'components', 'clients', 'ModalRenovaciones.tsx'),
  path.join(projectDir, 'src', 'views', 'pages', 'clients', 'ClienteDs.tsx'),
  // Auth Module
  path.join(projectDir, 'src', 'hooks', 'auth', 'usePermissions.ts'),
  path.join(projectDir, 'src', 'hooks', 'auth', 'useAuth.ts'),
  path.join(projectDir, 'src', 'views', 'pages', 'login', 'Login.tsx'),
  path.join(projectDir, 'src', 'components', 'ui', 'login.tsx'),
  // Profile Module
  path.join(projectDir, 'src', 'hooks', 'adm-user', 'useProfile.ts'),
  path.join(projectDir, 'src', 'components', 'users', 'ModalProfile.tsx'),
  path.join(projectDir, 'src', 'components', 'users', 'ModalVerRoles.tsx'),
  path.join(projectDir, 'src', 'components', 'users', 'ModalVerPermisos.tsx'),
  path.join(projectDir, 'src', 'views', 'pages', 'profile', 'Profile.tsx'),
  // Users Module
  path.join(projectDir, 'src', 'hooks', 'adm-user', 'useUsers.ts'),
  path.join(projectDir, 'src', 'components', 'users', 'ModalNew_user.tsx'),
  path.join(projectDir, 'src', 'components', 'users', 'ModalEdit.tsx'),
  path.join(projectDir, 'src', 'components', 'users', 'UserMatrixTable.tsx'),
  path.join(projectDir, 'src', 'views', 'pages', 'users', 'User.tsx'),
  // Roles & Permissions Module
  path.join(projectDir, 'src', 'hooks', 'admin-roles', 'useRoles.ts'),
  path.join(projectDir, 'src', 'hooks', 'admin-roles', 'useRolesUsuariosMatriz.ts'),
  path.join(projectDir, 'src', 'hooks', 'admin-roles', 'useDetalleAcciones.ts'),
  path.join(projectDir, 'src', 'hooks', 'admin-roles', 'usePermisosMatriz.ts'),
  path.join(projectDir, 'src', 'components', 'roles', 'ModalCreate.tsx'),
  path.join(projectDir, 'src', 'components', 'roles', 'ModalRol.tsx'),
  path.join(projectDir, 'src', 'components', 'roles', 'ModalAccionesPantalla.tsx'),
  path.join(projectDir, 'src', 'components', 'roles', 'ModalDetalleAccion.tsx'),
  path.join(projectDir, 'src', 'views', 'pages', 'roles', 'Roles.tsx'),
];

console.log(`Checking TypeScript for ${filesToCheck.length} files across all restructured modules...`);

const program = ts.createProgram(parsedCommandLine.fileNames, parsedCommandLine.options);
let hasError = false;

for (const file of filesToCheck) {
  const sourceFile = program.getSourceFile(file);
  if (!sourceFile) {
    console.error(`Could not find source file: ${file}`);
    hasError = true;
    continue;
  }
  const diagnostics = ts.getPreEmitDiagnostics(program, sourceFile);
  if (diagnostics.length > 0) {
    hasError = true;
    console.error(`\n❌ Diagnostics for ${file}:`);
    for (const diag of diagnostics) {
      const message = ts.flattenDiagnosticMessageText(diag.messageText, '\n');
      if (diag.file && diag.start !== undefined) {
        const { line, character } = diag.file.getLineAndCharacterOfPosition(diag.start);
        console.error(`  Line ${line + 1}, Col ${character + 1}: TS${diag.code} - ${message}`);
      } else {
        console.error(`  TS${diag.code}: ${message}`);
      }
    }
  }
}

if (!hasError) {
  console.log(`\n🎉 ZERO TypeScript errors across all ${filesToCheck.length} files in the restructured architecture!`);
} else {
  process.exit(1);
}
