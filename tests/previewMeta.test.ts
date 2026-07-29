import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { previewOrigin, withAbsolutePreviewImages } from '../src/server/previewMeta';

const indexHtml = readFileSync(path.join(process.cwd(), 'index.html'), 'utf-8');

test('les images d’aperçu passent en adresse absolue', () => {
  const rendered = withAbsolutePreviewImages(indexHtml, 'https://jeu.example.com');

  assert.match(
    rendered,
    /<meta property="og:image" content="https:\/\/jeu\.example\.com\/og-image\.png" \/>/,
  );
  assert.match(
    rendered,
    /<meta name="twitter:image" content="https:\/\/jeu\.example\.com\/og-image\.png" \/>/,
  );
  assert.equal(rendered.includes('content="/og-image.png"'), false);
});

test('les autres balises et les icônes ne sont pas touchées', () => {
  const rendered = withAbsolutePreviewImages(indexHtml, 'https://jeu.example.com');

  assert.match(rendered, /<title>Trivial Pursuit Famille<\/title>/);
  assert.match(rendered, /<link rel="icon" type="image\/svg\+xml" href="\/favicon\.svg" \/>/);
  assert.match(rendered, /<link rel="apple-touch-icon" sizes="180x180" href="\/apple-touch-icon\.png" \/>/);
  assert.match(rendered, /<meta property="og:image:width" content="1200" \/>/);
});

test('sans origine connue, la page est livrée telle quelle', () => {
  assert.equal(withAbsolutePreviewImages(indexHtml, ''), indexHtml);
});

test('l’origine annoncée suit la requête, ou la configuration si elle existe', () => {
  const request = {
    protocol: 'https',
    get: (header: string) => (header === 'host' ? 'trivial.up.railway.app' : undefined),
  };

  assert.equal(previewOrigin(request, undefined), 'https://trivial.up.railway.app');
  assert.equal(previewOrigin(request, ''), 'https://trivial.up.railway.app');
  assert.equal(previewOrigin(request, 'https://jeu.famille.be/'), 'https://jeu.famille.be');
  assert.equal(
    previewOrigin({ protocol: 'http', get: () => undefined }, undefined),
    '',
    'sans hôte, aucune réécriture plutôt qu’une adresse inventée',
  );
});

test('la page annonce bien un visuel d’aperçu et ses icônes', () => {
  for (const expected of [
    'property="og:image"',
    'property="og:image:width"',
    'property="og:image:height"',
    'name="twitter:card" content="summary_large_image"',
    'rel="apple-touch-icon"',
    'rel="icon" type="image/svg+xml"',
  ]) {
    assert.ok(indexHtml.includes(expected), `balise manquante : ${expected}`);
  }
});
