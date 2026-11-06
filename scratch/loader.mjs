import { pathToFileURL } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith('@/')) {
    const projectRoot = path.resolve('.');
    const relativePath = specifier.slice(2);
    let fullPath = path.join(projectRoot, 'src', relativePath);
    if (!path.extname(fullPath)) {
      if (fs.existsSync(fullPath + '.ts')) {
        fullPath += '.ts';
      } else if (fs.existsSync(fullPath + '.tsx')) {
        fullPath += '.tsx';
      } else if (fs.existsSync(path.join(fullPath, 'index.ts'))) {
        fullPath = path.join(fullPath, 'index.ts');
      }
    }
    return nextResolve(pathToFileURL(fullPath).href, context);
  }
  return nextResolve(specifier, context);
}
