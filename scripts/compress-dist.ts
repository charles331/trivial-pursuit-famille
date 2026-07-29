import { brotliCompressSync, constants, gzipSync } from 'node:zlib';
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const distDir = path.resolve(process.cwd(), 'dist');
const compressibleExtensions = new Set(['.css', '.html', '.js', '.json', '.svg']);

function walk(directory: string): string[] {
  return readdirSync(directory).flatMap(name => {
    const absolutePath = path.join(directory, name);
    return statSync(absolutePath).isDirectory() ? walk(absolutePath) : [absolutePath];
  });
}

let compressedCount = 0;
for (const filePath of walk(distDir)) {
  if (!compressibleExtensions.has(path.extname(filePath)) || filePath.endsWith('.map')) continue;
  const source = readFileSync(filePath);
  if (source.length < 1024) continue;

  writeFileSync(
    `${filePath}.br`,
    brotliCompressSync(source, {
      params: {
        [constants.BROTLI_PARAM_QUALITY]: 11,
      },
    }),
  );
  writeFileSync(`${filePath}.gz`, gzipSync(source, { level: 9 }));
  compressedCount += 1;
}

console.log(`Précompression: ${compressedCount} fichier(s) en Brotli et gzip.`);
