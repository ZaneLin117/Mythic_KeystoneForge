/**
 * Resolves files copied from `public/` for both root deployments and sub-path hosts
 * such as GitHub Pages (`/<repository>/`).
 */
export function publicAssetUrl(path: string): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`
}
