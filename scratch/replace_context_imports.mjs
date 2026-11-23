import fs from 'fs';
import path from 'path';

const srcDir = 'c:\\Users\\USER\\Desktop\\BiblioRecro\\bibliorecro\\src';

function replaceInDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'context') {
        replaceInDir(fullPath);
      }
    } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      if (content.includes('@/context/PermissionsContext')) {
        content = content.replace(/@\/context\/PermissionsContext/g, '@/hooks/auth/usePermissions');
        changed = true;
      }
      if (content.includes('./context/PermissionsContext')) {
        content = content.replace(/\.\/context\/PermissionsContext/g, '@/hooks/auth/usePermissions');
        changed = true;
      }
      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated imports in: ${fullPath}`);
      }
    }
  }
}

replaceInDir(srcDir);
console.log('Finished updating imports!');
