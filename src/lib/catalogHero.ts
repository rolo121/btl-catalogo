import { appAsset } from '@/lib/appPaths'
export type CatalogHeroConfig = {
  image: string
  eyebrow: string
  title: string
  accent?: string
  description: string
  objectPosition?: string
}

const DEFAULT_CATALOG_HERO: CatalogHeroConfig = {
  image: appAsset('/images/btl/banner_catalogo.webp'),
  eyebrow: "BTL Marketing · Catálogo",
  title: "Catálogo",
  accent: "promocional",
  description:
    "Explorá soluciones promocionales para empresas, eventos y campañas. Encontrá productos que conecten con tu marca y solicitá una cotización de forma rápida.",
  objectPosition: "55% center",
}

/*
 * Preparado para banners específicos por categoría.
 *
 * Cuando exista un banner nuevo, solo hay que agregar `image` al registro:
 *
 * tecnologia: {
 *   image: "/images/btl/banners/tecnologia.webp",
 *   ...
 * }
 *
 * Si `image` no está definido, automáticamente usa banner_catalogo.webp.
 */
const CATEGORY_HERO_CONFIG: Record<
  string,
  Partial<CatalogHeroConfig>
> = {
  mochilas: {
    eyebrow: "BTL Marketing · Mochilas",
    title: "Mochilas",
    accent: "promocionales",
  },
  "bebidas-bar-termos": {
    eyebrow: "BTL Marketing · Bebidas, Bar y Termos",
    title: "Bebidas, Bar y Termos",
    accent: "promocionales",
  },
  textil: {
    eyebrow: "BTL Marketing · Textil",
    title: "Textil",
    accent: "promocional",
  },
  escritura: {
    eyebrow: "BTL Marketing · Escritura",
    title: "Escritura",
    accent: "promocional",
  },
  tecnologia: {
    eyebrow: "BTL Marketing · Tecnología",
    title: "Tecnología",
    accent: "promocional",
  },
  "eventos-regalos": {
    eyebrow: "BTL Marketing · Eventos y Regalos",
    title: "Eventos y Regalos",
    accent: "promocionales",
  },
}

const titleFromLabel = (label?: string | null) => {
  const clean = String(label || "").trim()
  return clean || DEFAULT_CATALOG_HERO.title
}

export function getCatalogHeroConfig(
  categorySlug?: string | null,
  categoryLabel?: string | null,
): CatalogHeroConfig {
  const slug = String(categorySlug || "").trim().toLowerCase()

  if (!slug) {
    return DEFAULT_CATALOG_HERO
  }

  const categoryConfig = CATEGORY_HERO_CONFIG[slug] || {}
  const fallbackTitle = titleFromLabel(categoryLabel)

  return {
    ...DEFAULT_CATALOG_HERO,
    ...categoryConfig,
    image: categoryConfig.image || DEFAULT_CATALOG_HERO.image,
    eyebrow:
      categoryConfig.eyebrow ||
      `BTL Marketing · ${fallbackTitle}`,
    title: categoryConfig.title || fallbackTitle,
    accent: categoryConfig.accent || "promocional",
    description:
      categoryConfig.description ||
      `Explorá opciones de ${fallbackTitle.toLowerCase()} para empresas, eventos y campañas. Encontrá productos para tu marca y solicitá una cotización de forma rápida.`,
    objectPosition:
      categoryConfig.objectPosition || DEFAULT_CATALOG_HERO.objectPosition,
  }
}
