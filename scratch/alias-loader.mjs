export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith('@/')) {
    let subpath = specifier.slice(2);
    // If it doesn't end with .ts, append .ts
    if (!subpath.endsWith('.ts')) {
      subpath += '.ts';
    }
    const targetUrl = new URL('../src/' + subpath, import.meta.url).href;
    return nextResolve(targetUrl, context);
  }
  return nextResolve(specifier, context);
}
