export function normalizeScheme(scheme) {
  if (!scheme || typeof scheme !== 'object') return null;

  const externalSchemeId = scheme.external_scheme_id ?? null;
  const id = scheme.id ?? scheme.scheme_id ?? externalSchemeId;
  if (id === null || id === undefined || String(id).trim() === '') return null;

  const name = scheme.name || scheme.title || scheme.scheme_name || '';
  const benefits = scheme.benefits || scheme.benefitAmount || scheme.benefit || '';

  return {
    ...scheme,
    id,
    scheme_id: scheme.scheme_id ?? scheme.id ?? null,
    external_scheme_id: externalSchemeId,
    name,
    title: scheme.title || name,
    benefits,
    benefitAmount: scheme.benefitAmount || benefits,
  };
}

export function normalizeSchemes(schemes) {
  const normalized = [];
  const ids = new Set();

  for (const rawScheme of schemes) {
    const scheme = normalizeScheme(rawScheme);
    if (!scheme) continue;

    const id = String(scheme.id);
    if (ids.has(id)) {
      throw new Error(`Duplicate scheme ID "${id}" in scheme catalogue.`);
    }

    ids.add(id);
    normalized.push(scheme);
  }

  return normalized;
}

export function getSchemeRouteId(scheme) {
  return scheme?.external_scheme_id || scheme?.id || scheme?.scheme_id || null;
}

export function findSchemeByReference(reference, schemes) {
  if (reference === null || reference === undefined || String(reference).trim() === '') {
    return null;
  }

  const value = String(reference);
  return schemes.find((scheme) =>
    String(scheme.external_scheme_id ?? '') === value ||
    String(scheme.id ?? '') === value ||
    String(scheme.scheme_id ?? '') === value
  ) ?? null;
}

export function findSchemeForApplication(application, schemes) {
  if (!application) return null;

  const externalId = application.external_scheme_id || application.scheme_external_id;
  if (externalId) {
    return findSchemeByReference(externalId, schemes);
  }

  return findSchemeByReference(application.schemeId ?? application.scheme_id, schemes);
}

export function filterSchemes(schemes, searchText = '', category = 'All') {
  const search = searchText.toLowerCase().trim();

  return schemes.filter((scheme) => {
    const title = (scheme.title || scheme.name || scheme.scheme_name || '').toLowerCase();
    const description = (scheme.description || '').toLowerCase();
    const benefits = (scheme.benefits || scheme.benefitAmount || '').toLowerCase();
    const matchesSearch = !search ||
      title.includes(search) ||
      description.includes(search) ||
      benefits.includes(search);
    const matchesCategory = category === 'All' ||
      (scheme.category || '').toLowerCase() === category.toLowerCase();
    return matchesSearch && matchesCategory;
  });
}
