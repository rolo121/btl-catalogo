import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import QuoteClient from "@/components/Quote/QuoteClient";
import { getColorHex } from "@/lib/colors";
import type { ProductFeatureObject, ProductType } from "@/type/ProductType";

export const metadata: Metadata = {
  title: "Solicitar cotización",
  description:
    "Formulario para solicitar una cotización personalizada de productos promocionales con BTL Marketing.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: "/productos",
  },
};

type QuoteProvider = {
  code?: string | null;
  name?: string | null;
  default_eta_label?: string | null;
};

type QuoteStockLocation = {
  provider_sku?: string | null;
  available_stock?: string | number | null;
  incoming_transit?: string | number | null;
  dynamic_eta_label?: string | null;

  /*
   * Identidad operacional real.
   */
  source_provider?: string | null;

  provider?: QuoteProvider | null;
  [key: string]: unknown;
};

type QuoteVariant = {
  id?: string | number | null;
  sku?: string | null;
  provider_sku?: string | null;
  color?: string | null;
  size?: string | null;
  base_price?: string | number | null;
  total_aggregated_stock?: string | number | null;
  image?: string | null;
  image_url?: string | null;
  imageUrl?: string | null;
  main_image?: string | null;
  mainImage?: string | null;
  colorImage?: string | null;
  stockLocations?: QuoteStockLocation[] | null;
  stock_locations?: QuoteStockLocation[] | null;
  [key: string]: unknown;
};

type QuoteCategory = {
  id?: string | number | null;
  name?: string | null;
  slug?: string | null;
  [key: string]: unknown;
};

type QuoteRawProduct = {
  id?: string | number | null;
  product_id?: string | number | null;
  catalog_product_id?: string | number | null;
  slug?: string | null;
  name?: string | null;
  nombre?: string | null;
  product_name?: string | null;
  title?: string | null;
  display_name?: string | null;
  descripcion?: string | null;
  description?: string | null;
  provider?: string | null;
  brand?: string | null;

  /*
   * Identidad operacional real.
   */
  source_brand?: string | null;
  source_provider?: string | null;

  images?: unknown;
  features?: unknown;
  variants?: QuoteVariant[] | null;
  categories?: QuoteCategory[] | null;
  [key: string]: unknown;
};

type QuoteImmediateInventory = {
  items?: unknown[];
  has_match?: boolean | number | string | null;
  total_stock?: string | number | null;
  [key: string]: unknown;
};

type QuoteProductResponse = {
  product?: QuoteRawProduct | null;
  immediate_inventory?: QuoteImmediateInventory | null;
};

type PromoImages = {
  mainImages: string[];
  variantImages: string[];
  vectorImages: string[];
};

type QuoteMappedVariation = {
  color: string;
  colorCode: string;
  colorImage: string;
  image: string;
  sku: string;
  size: string;
  stockFisico: number;
  stockTransito: number;
  disponibilidadLabel: string;
  fechaLlegada: string;
  providerCode: string;
  providerName: string;
};

type QuoteMappedProduct = ProductType & {
  databaseId?: number | null;
  categories?: QuoteCategory[];
};

type QuotePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const fallbackImage = "https://via.placeholder.com/600";

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

async function getProductBySlug(
  slug: string,
): Promise<QuoteProductResponse | null> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_API_URL no está configurada.");
  }

  const res = await fetch(`${baseUrl}/catalog/${encodeURIComponent(slug)}`, {
    cache: "no-store",
  });

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error(`No se pudo cargar el producto: ${slug}`);
  }

  const json = (await res.json()) as unknown;

  return isRecord(json) ? (json as QuoteProductResponse) : null;
}

function parseJsonField<T>(value: unknown, fallback: T): T {
  if (!value) return fallback;

  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }

  return value as T;
}

function cleanText(value: unknown) {
  return String(value ?? "")
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function getFeatureText(features: ProductFeatureObject, key: string) {
  return cleanText(features[key]);
}

function resolveQuoteProductName(
  product: QuoteRawProduct,
  features: ProductFeatureObject = {},
) {
  const candidates = [
    product.name,
    product.nombre,
    product.product_name,
    product.title,
    product.display_name,
    getFeatureText(features, "ag_display_name"),
    getFeatureText(features, "ag_producto_nombre"),
    getFeatureText(features, "producto_nombre"),
    getFeatureText(features, "nombre_producto"),
    product.descripcion,
    product.description,
    product.slug,
  ];

  return candidates.map(cleanText).find(Boolean) || "Producto promocional";
}

function getVariantStockLocations(variant: QuoteVariant): QuoteStockLocation[] {
  if (Array.isArray(variant.stockLocations)) return variant.stockLocations;
  if (Array.isArray(variant.stock_locations)) return variant.stock_locations;

  return [];
}

function getFirstStockLocation(variant: QuoteVariant): QuoteStockLocation {
  return getVariantStockLocations(variant)[0] || {};
}

function getVariantProviderCode(
  product: QuoteRawProduct,
  variant: QuoteVariant,
) {
  const location = getFirstStockLocation(variant);

  return String(
    location.source_provider ||
      product.source_provider ||
      location.provider?.code ||
      product.provider ||
      product.source_brand ||
      product.brand ||
      "",
  )
    .trim()
    .toLowerCase();
}

function getVariantProviderSku(variant: QuoteVariant) {
  const location = getFirstStockLocation(variant);

  return String(
    location.provider_sku || variant.provider_sku || variant.sku || "",
  ).trim();
}

function getFileNameFromUrl(url: unknown) {
  return (
    String(url || "")
      .split("?")[0]
      .split("#")[0]
      .split("/")
      .pop() || ""
  );
}

function normalizeImageToken(value: unknown) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function isValidImageUrl(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.trim() !== "" &&
    !value.includes("/areas/")
  );
}

function toStringImages(value: unknown, excludeAreas = false) {
  if (!Array.isArray(value)) return [];

  return value.filter(
    (url): url is string =>
      typeof url === "string" &&
      url.trim() !== "" &&
      (!excludeAreas || !url.includes("/areas/")),
  );
}

function getMakitoRef(product: QuoteRawProduct, imageUrls: string[]) {
  const slug = String(product.slug || "").trim();

  if (slug.toUpperCase().startsWith("MAK-")) {
    return slug.replace(/^MAK-/i, "");
  }

  const firstVariantImage = imageUrls.find((url) =>
    String(url).includes("/variantes/"),
  );

  const fileName = getFileNameFromUrl(firstVariantImage);
  const matchFromImage = fileName.match(/^([^-]+)-/);

  if (matchFromImage?.[1]) {
    return matchFromImage[1];
  }

  const firstSku = String(product.variants?.[0]?.sku || "");
  const matchFromSku = firstSku.match(/^(\d+)/);

  return matchFromSku?.[1] || "";
}

function getMakitoColorCodeFromProviderSku(providerSku: unknown) {
  const digits = String(providerSku || "").replace(/\D/g, "");

  if (digits.length >= 6) {
    return digits.slice(-6, -3);
  }

  return "";
}

function resolveMakitoVariantImage(
  product: QuoteRawProduct,
  variant: QuoteVariant,
  imageUrls: string[],
) {
  const ref = getMakitoRef(product, imageUrls);
  const providerSku = getVariantProviderSku(variant);
  const colorCode = getMakitoColorCodeFromProviderSku(providerSku);

  if (!ref || !colorCode) {
    return null;
  }

  const exactMatch = imageUrls.find((url) => {
    const cleanUrl = String(url || "");
    const fileName = getFileNameFromUrl(cleanUrl);

    return (
      cleanUrl.includes("/variantes/") &&
      fileName
        .toLowerCase()
        .includes(`${ref.toLowerCase()}-${colorCode.toLowerCase()}-`)
    );
  });

  if (exactMatch) {
    return exactMatch;
  }

  return (
    imageUrls.find((url) => {
      const fileName = getFileNameFromUrl(url).toLowerCase();
      return fileName.includes(`-${colorCode.toLowerCase()}-`);
    }) || null
  );
}

function getPromoVariantSuffix(variant: QuoteVariant) {
  const rawSku = getVariantProviderSku(variant) || variant.sku || "";
  const parts = String(rawSku)
    .trim()
    .replace(/\//g, " ")
    .split(/[\s-]+/)
    .filter(Boolean);

  return parts[parts.length - 1] || "";
}

function resolvePromoVariantImage(
  variant: QuoteVariant,
  promoImages: PromoImages,
) {
  const suffix = getPromoVariantSuffix(variant);
  const variantImages = promoImages.variantImages;

  if (!suffix || !variantImages.length) {
    return null;
  }

  const escapedSuffix = suffix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const exactRegex = new RegExp(`-${escapedSuffix}\\.[a-z0-9]+$`, "i");
  const exactMatch = variantImages.find((url) =>
    exactRegex.test(getFileNameFromUrl(url)),
  );

  if (exactMatch) {
    return exactMatch;
  }

  const looseRegex = new RegExp(
    `-${escapedSuffix}(?:_\\d+)?\\.[a-z0-9]+$`,
    "i",
  );

  const looseMatch = variantImages.find((url) =>
    looseRegex.test(getFileNameFromUrl(url)),
  );

  if (looseMatch) {
    return looseMatch;
  }

  const normalizedSku = normalizeImageToken(variant.sku);
  const normalizedProviderSku = normalizeImageToken(getVariantProviderSku(variant));

  return (
    variantImages.find((url) => {
      const normalizedFile = normalizeImageToken(getFileNameFromUrl(url));

      return (
        (Boolean(normalizedSku) && normalizedFile.includes(normalizedSku)) ||
        (Boolean(normalizedProviderSku) &&
          normalizedFile.includes(normalizedProviderSku))
      );
    }) || null
  );
}

function resolveVariantImage(
  product: QuoteRawProduct,
  variant: QuoteVariant,
  imageUrls: string[],
  promoImages: PromoImages,
) {
  const explicitImage =
    variant.image ||
    variant.image_url ||
    variant.imageUrl ||
    variant.main_image ||
    variant.mainImage ||
    variant.colorImage ||
    null;

  if (explicitImage) {
    return String(explicitImage);
  }

  const providerCode = getVariantProviderCode(product, variant);
  const brand = String(product.brand || "").toUpperCase();

  if (providerCode === "promo" || brand === "PROMO") {
    return resolvePromoVariantImage(variant, promoImages) || imageUrls[0] || null;
  }

  if (providerCode === "makito" || brand === "MAKITO") {
    return resolveMakitoVariantImage(product, variant, imageUrls) || imageUrls[0] || null;
  }

  return imageUrls[0] || null;
}

function getPromoImagesFromRawImages(images: unknown) {
  const promoImages: PromoImages = {
    mainImages: [],
    variantImages: [],
    vectorImages: [],
  };

  if (!isRecord(images)) return promoImages;

  promoImages.mainImages = toStringImages(images.mainImages);
  promoImages.variantImages = toStringImages(images.variantImages);
  promoImages.vectorImages = toStringImages(images.vectorImages);

  return promoImages;
}

function resolveProductImages(product: QuoteRawProduct) {
  let imageUrls = [fallbackImage];

  let promoImages: PromoImages = {
    mainImages: [],
    variantImages: [],
    vectorImages: [],
  };

  try {
    const imgs = parseJsonField<unknown>(product.images, []);

    if (Array.isArray(imgs) && imgs.length > 0) {
      imageUrls = toStringImages(imgs, true);
      promoImages.mainImages = imageUrls;
    } else if (isRecord(imgs)) {
      promoImages = getPromoImagesFromRawImages(imgs);

      imageUrls = [
        ...promoImages.mainImages,
        ...promoImages.variantImages,
      ].filter(isValidImageUrl);
    }

    if (!imageUrls.length) {
      imageUrls = [fallbackImage];
    }
  } catch (error) {
    console.error("Error parseando imágenes para cotizar:", error);
  }

  return { imageUrls, promoImages };
}

function mapLaravelToQuoteProduct(productRaw: QuoteRawProduct): QuoteMappedProduct {
  const { imageUrls, promoImages } = resolveProductImages(productRaw);

  const parsedRawFeatures = parseJsonField<ProductFeatureObject>(
    productRaw.features,
    {},
  );

  const imagekit = isRecord(parsedRawFeatures.imagekit)
    ? parsedRawFeatures.imagekit
    : null;

  const imagekitImages = Array.isArray(imagekit?.images)
    ? imagekit.images.filter(isValidImageUrl)
    : [];

  const variantImageUrls = imagekitImages.length > 0 ? imagekitImages : imageUrls;

  const parsedFeatures = {
    ...parsedRawFeatures,
    _promoImages: promoImages,
  } as ProductFeatureObject;

  const productName = resolveQuoteProductName(productRaw, parsedFeatures);

  const rawProductId =
    productRaw.id ?? productRaw.product_id ?? productRaw.catalog_product_id;

  const numericProductId = Number(rawProductId);
  const variants = Array.isArray(productRaw.variants) ? productRaw.variants : [];

  const basePrice = variants[0]?.base_price
    ? parseFloat(String(variants[0].base_price))
    : 0;

  const mappedVariations: QuoteMappedVariation[] = variants.map((variant) => {
    const location = getFirstStockLocation(variant);

    const providerCode =
      getVariantProviderCode(productRaw, variant);

    const stockFisico = Number(location.available_stock) || 0;

    const variantImage =
      resolveVariantImage(productRaw, variant, variantImageUrls, promoImages) ||
      imageUrls[0];

    return {
      color: String(variant.color || ""),
      colorCode: getColorHex(variant.color || ""),
      colorImage: variantImage,
      image: variantImage,
      sku: String(variant.sku || ""),
      size: String(variant.size || "-"),
      stockFisico,
      stockTransito: Number(location.incoming_transit) || 0,
      disponibilidadLabel:
        providerCode === "makito"
          ? location.provider?.default_eta_label || "Sin fecha"
          : stockFisico > 0
            ? "Inmediata"
            : location.dynamic_eta_label ||
              location.provider?.default_eta_label ||
              "Sin fecha",
      fechaLlegada:
        location.dynamic_eta_label ||
        location.provider?.default_eta_label ||
        "Sin fecha",
      providerCode,
      providerName:
        providerCode === "kyte"
          ? "KYTE"
          : (location.provider?.name || ""),
    };
  });

  return {
    id: String(productRaw.slug || rawProductId || ""),
    databaseId: Number.isFinite(numericProductId) ? numericProductId : null,
    name: productName,
    price: basePrice,
    originPrice: basePrice > 0 ? basePrice * 1.2 : 0,
    brand:
      productRaw.brand === "PROMO"
        ? "Premium"
        : productRaw.brand === "MAKITO"
          ? "EcoLine"
          : productRaw.brand || "Producto",
    category: "Promocional",
    images: imageUrls,
    thumbImage:
      imageUrls.length > 1
        ? [imageUrls[0], imageUrls[1]]
        : [imageUrls[0], imageUrls[0]],
    rate: 5,
    quantity: mappedVariations.reduce(
      (sum, variation) => sum + (Number(variation.stockFisico) || 0),
      0,
    ),
    description:
      productRaw.description || "Producto promocional de alta calidad",
    slug: String(productRaw.slug || ""),
    variation: mappedVariations as ProductType["variation"],
    features: parsedFeatures,
    categories: Array.isArray(productRaw.categories) ? productRaw.categories : [],
    type: "General",
    gender: "Unisex",
    sizes: ["S/T"],
    action: "add to cart",
    sold: 0,
    quantityPurchase: 1,
    new: false,
    sale: false,
  };
}

export default async function QuotePage({ params }: QuotePageProps) {
  const { slug } = await params;

  if (!slug) {
    notFound();
  }

  const productResponse = await getProductBySlug(slug);

  if (!productResponse?.product) {
    notFound();
  }

  const productRaw = productResponse.product;
  const canonicalSlug = cleanText(productRaw.slug);

  if (canonicalSlug && canonicalSlug !== slug) {
    permanentRedirect(`/cotizar/${canonicalSlug}`);
  }

  const immediateInventory =
    productResponse.immediate_inventory ||
    {};

  const linkedLocalProductsRaw = Array.isArray(immediateInventory.items)
    ? immediateInventory.items
    : [];

  const product = mapLaravelToQuoteProduct(productRaw);

  product.features = {
    ...(product.features && typeof product.features === "object"
      ? product.features
      : {}),
    _linkedImmediateProducts: linkedLocalProductsRaw,
    _hasImmediate: Boolean(immediateInventory.has_match),
    _immediateStockTotal: Number(immediateInventory.total_stock) || 0,
  } as ProductFeatureObject;

  return (
    <QuoteClient
      product={product}
      initialQty={0}
      initialColor=""
      initialSku=""
      initialItems=""
    />
  );
}
