// The API serializes entity responses in camelCase (permitType, siteStreet,
// mimeType, uploadedAt, ...), but the frontend resource types and components
// read snake_case (permit_type, site_street, mime_type, uploaded_at, ...).
// Left unconverted, every field is `undefined` at runtime — which crashed date
// formatting on the permit list (`new Date(undefined)` → "Invalid time value")
// and blanked loaded edit forms. Convert an entity object's keys to snake_case.
// Entity objects are flat, so a shallow key rewrite is sufficient.
export function toSnakeKeys<T>(raw: unknown): T {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries((raw ?? {}) as Record<string, unknown>)) {
    out[k.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`)] = v;
  }
  return out as T;
}
