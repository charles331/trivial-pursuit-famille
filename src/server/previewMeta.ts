/**
 * Balises d'aperçu des liens partagés.
 *
 * Le domaine de déploiement n'est pas connu à la compilation, et les messageries
 * comme les réseaux sociaux ignorent un `og:image` relatif : le lien s'affiche
 * alors sans vignette. Les adresses d'image sont donc réécrites en absolu à la
 * livraison de la page.
 */

/**
 * Origine à annoncer. `PUBLIC_ORIGIN` a le dernier mot ; à défaut on prend
 * l'hôte de la requête — `trust proxy` est actif côté serveur, si bien que le
 * protocole vaut bien https derrière l'hébergeur.
 */
export function previewOrigin(
  request: { protocol: string; get(header: string): string | undefined },
  configuredOrigin = process.env.PUBLIC_ORIGIN,
): string {
  const configured = configuredOrigin?.trim();
  if (configured) return configured.replace(/\/+$/, '');

  const host = request.get('host');
  return host ? `${request.protocol}://${host}` : '';
}

export function withAbsolutePreviewImages(html: string, origin: string): string {
  if (!origin) return html;
  return html.replace(
    /(<meta\s[^>]*?(?:property|name)="(?:og:image|twitter:image)"[^>]*?content=")\/([^"]*)"/g,
    (_match, prefix: string, assetPath: string) => `${prefix}${origin}/${assetPath}"`,
  );
}
