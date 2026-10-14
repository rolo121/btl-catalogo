"use client";

import { appAsset } from '@/lib/appPaths'

import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
  Suspense,
} from "react";
import CatalogSkeleton from "@/components/BTL/CatalogSkeleton";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import * as Icon from "@phosphor-icons/react/dist/ssr";
import { ProductType } from "@/type/ProductType";
import CatalogProductCard from "@/components/BTL/CatalogProductCard";
import useCatalogStore from "@/store/useCatalogStore";
import HandlePagination from "../Other/HandlePagination";
import type {
  CatalogInitialCategoriesData,
  CatalogInitialData,
} from "@/lib/catalogServer";
import {
  getCommercialCategories,
  getCommercialCategoriesCacheKey,
  primeCommercialCategoriesCache,
} from "@/lib/commercialCategories";
import type { CommercialCategoryItem } from "@/lib/commercialCategories";
import { getCatalogJson } from "@/lib/catalogClient";
import { getCatalogHeroConfig } from "@/lib/catalogHero";

interface Props {
  dataType: string | null;
  initialCommercialCategory?: string | null;
  hideCatalogHero?: boolean;
  categoryBasePath?: string;
  initialCatalog?: CatalogInitialData | null;
  initialCategories?: CatalogInitialCategoriesData | null;
}

type CategoryItem = CommercialCategoryItem;

interface CatalogApiProvider {
  code?: string | null;
  name?: string | null;
  default_eta_label?: string | null;
}

interface CatalogApiStockLocation {
  available_stock?: string | number | null;
  incoming_transit?: string | number | null;
  dynamic_eta_label?: string | null;
  source_provider?: string | null;
  provider?: CatalogApiProvider | null;
  [key: string]: unknown;
}

interface CatalogApiVariant {
  sku?: string | null;
  color?: string | null;
  size?: string | null;
  base_price?: string | number | null;
  total_aggregated_stock?: string | number | null;
  available_stock?: string | number | null;
  disponibilidadLabel?: string | null;
  fechaLlegada?: string | null;
  stockLocations?: CatalogApiStockLocation[] | null;
  stock_locations?: CatalogApiStockLocation[] | null;
  [key: string]: unknown;
}

interface CatalogApiCategory {
  slug?: string | null;
  name?: string | null;
  [key: string]: unknown;
}

interface CatalogApiFeatures {
  imagekit?: {
    images?: unknown[];
    catalog?: {
      main?: unknown;
      hover?: unknown;
    };
  };
  [key: string]: unknown;
}

interface CatalogApiCommercialVariant {
  id?: string | number | null;
  slug?: string | null;
  name?: string | null;
  description?: string | null;
  brand?: string | null;
  images?: unknown;
  total_stock?: string | number | null;
  codigo_sac?: string | null;
  codigo_sac_base?: string | null;
  codigo_sac_color_code?: string | null;
  variants?: CatalogApiVariant[] | null;
}

interface CatalogApiProduct {
  id?: string | number | null;
  slug?: string | null;
  type?: string | null;
  name?: string | null;
  gender?: string | null;
  new?: boolean | number | string | null;
  brand?: string | null;
  source_brand?: string | null;
  sold?: string | number | null;
  total_stock?: string | number | null;
  quantityPurchase?: string | number | null;
  description?: string | null;
  images?: unknown;
  features?: string | CatalogApiFeatures | null;
  variants?: CatalogApiVariant[] | null;
  commercial_variants?: CatalogApiCommercialVariant[] | null;
  categories?: CatalogApiCategory[] | null;
  codigo_sac?: string | null;
  categoria_producto_nombre?: string | null;
  clase_producto_nombre?: string | null;
  [key: string]: unknown;
}

interface CatalogApiResponse {
  data?: CatalogApiProduct[];
  total?: string | number | null;
  last_page?: string | number | null;
}

const fallbackProductImage = appAsset('/images/product-placeholder.webp');

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

const normalizeProductImage = (img: unknown): string | null => {
  if (!img) return null;

  if (typeof img === "string") {
    const cleanImage = img.trim();
    return cleanImage && !cleanImage.includes("/areas/") ? cleanImage : null;
  }

  if (!isRecord(img)) return null;

  const value = img.url || img.image || img.src;

  return typeof value === "string" &&
    value.trim() !== "" &&
    !value.includes("/areas/")
    ? value.trim()
    : null;
};

const isValidImage = (value: string | null): value is string => {
  return typeof value === "string" && value.trim() !== "";
};

const isKnownPlaceholderImage = (value: unknown): boolean => {
  if (typeof value !== "string") return false;

  const normalized = value.trim().toLowerCase().split("#")[0].split("?")[0];

  return (
    normalized.endsWith("/images/product-placeholder.webp") ||
    normalized.includes("via.placeholder.com/")
  );
};

const isDirectKyteCatalogProduct = (product: CatalogApiProduct): boolean => {
  const brand = String(product.brand || "")
    .trim()
    .toUpperCase();

  return brand === "KYTE" || brand === "LOCAL";
};

const parseJsonField = <T,>(value: unknown, fallback: T): T => {
  if (!value) return fallback;

  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }

  return value as T;
};

const parseCatalogFeatures = (
  features: CatalogApiProduct["features"],
): CatalogApiFeatures => {
  const parsed = parseJsonField<unknown>(features, {});

  return isRecord(parsed) ? (parsed as CatalogApiFeatures) : {};
};

const collectProductImages = (
  rawImages: unknown,
  excludePlaceholders = false,
): string[] => {
  const parsedImages = parseJsonField<unknown>(rawImages, []);
  const candidates: unknown[] = [];

  if (Array.isArray(parsedImages)) {
    candidates.push(...parsedImages);
  } else if (isRecord(parsedImages)) {
    const mainImages = Array.isArray(parsedImages.mainImages)
      ? parsedImages.mainImages
      : [];

    const variantImages = Array.isArray(parsedImages.variantImages)
      ? parsedImages.variantImages
      : [];

    candidates.push(...mainImages, ...variantImages);
  }

  const images = Array.from(
    new Set(
      candidates
        .map(normalizeProductImage)
        .filter(isValidImage)
        .map((url) => url.trim()),
    ),
  );

  const realImages = excludePlaceholders
    ? images.filter((url) => !isKnownPlaceholderImage(url))
    : images;

  if (realImages.length > 0) {
    return realImages;
  }

  return excludePlaceholders ? [] : [fallbackProductImage];
};

const getVariantStockLocations = (
  variant: CatalogApiVariant,
): CatalogApiStockLocation[] => {
  if (Array.isArray(variant.stockLocations)) return variant.stockLocations;
  if (Array.isArray(variant.stock_locations)) return variant.stock_locations;

  return [];
};

const getCatalogStockLocationProviderCode = (
  location: CatalogApiStockLocation,
) => {
  return String(
    location?.source_provider ||
      location?.provider?.code ||
      "",
  )
    .trim()
    .toLowerCase();
};

const isImmediateProviderCode = (code: unknown) => {
  const normalized = String(code || "")
    .trim()
    .toLowerCase();

  return normalized === "kyte" || normalized === "local";
};

const isImmediateProduct = (
  product: CatalogApiProduct,
) => {
  const sourceBrand = String(
    product.source_brand || "",
  )
    .trim()
    .toUpperCase();

  const brand = String(product.brand || "")
    .trim()
    .toUpperCase();

  return (
    sourceBrand === "KYTE" ||
    brand === "KYTE" ||
    brand === "LOCAL"
  );
};


const sumVariantLocations = (
  variants: CatalogApiVariant[] | null | undefined,
  stockKey: "available_stock" | "incoming_transit",
) => {
  return (
    variants?.reduce((sum, variant) => {
      const locations = getVariantStockLocations(variant);

      return (
        sum +
        locations.reduce(
          (locSum, loc) => locSum + Number(loc?.[stockKey] || 0),
          0,
        )
      );
    }, 0) || 0
  );
};

const cleanImmediateProductName = (name?: string | null) => {
  if (!name) return "";
  return name.replace(/^[\d-]+\s*-\s*/, "").trim();
};

const mapCatalogProduct = (
  laravelProduct: CatalogApiProduct,
): ProductType => {
  const isDirectKyte = isDirectKyteCatalogProduct(laravelProduct);
  const imageUrls = collectProductImages(
    laravelProduct.images,
    isDirectKyte,
  );
  const parsedFeatures = parseCatalogFeatures(laravelProduct.features);

  const imagekit = isRecord(parsedFeatures.imagekit)
    ? parsedFeatures.imagekit
    : null;

  const rawImagekitImages = Array.isArray(imagekit?.images)
    ? imagekit.images.filter(
        (url): url is string =>
          typeof url === "string" && url.trim() !== "",
      )
    : [];

  const imagekitImages = isDirectKyte
    ? rawImagekitImages.filter((url) => !isKnownPlaceholderImage(url))
    : rawImagekitImages;

  const imagekitCatalog = isRecord(imagekit?.catalog)
    ? imagekit.catalog
    : null;

  const normalizeCatalogCandidate = (value: unknown): string => {
    if (typeof value !== "string") return "";

    const cleanValue = value.trim();

    if (!cleanValue) return "";
    if (isDirectKyte && isKnownPlaceholderImage(cleanValue)) return "";

    return cleanValue;
  };

  const imagekitCatalogMain = normalizeCatalogCandidate(
    imagekitCatalog?.main,
  );

  const imagekitCatalogHover = normalizeCatalogCandidate(
    imagekitCatalog?.hover,
  );

  const catalogImages = Array.from(
    new Set(
      [
        imagekitCatalogMain || imagekitImages[0] || imageUrls[0],
        imagekitCatalogHover || imagekitImages[1] || imageUrls[1],
      ].filter(
        (url): url is string =>
          typeof url === "string" && url.trim() !== "",
      ),
    ),
  );

  const basePrice = laravelProduct.variants?.[0]?.base_price
    ? parseFloat(String(laravelProduct.variants[0].base_price))
    : 0;

  const isPromo = laravelProduct.brand === "PROMO";
  const isImmediate = isImmediateProduct(laravelProduct);
  const commercialVariants =
    isDirectKyte && Array.isArray(laravelProduct.commercial_variants)
      ? laravelProduct.commercial_variants
      : [];
  const groupedKyteVariants =
    commercialVariants.length > 1 ? commercialVariants : [];

  const groupedVariantImages = Array.from(
    new Set(
      groupedKyteVariants.flatMap((member) =>
        collectProductImages(member.images, true),
      ),
    ),
  );

  const effectiveImageUrls =
    groupedVariantImages.length > 0
      ? Array.from(new Set([...groupedVariantImages, ...imageUrls]))
      : imageUrls;

  const effectiveCatalogImages =
    groupedVariantImages.length > 0
      ? groupedVariantImages.slice(0, 2)
      : catalogImages;

  const groupedVariantEntries = groupedKyteVariants.flatMap((member) => {
    const memberImage =
      collectProductImages(member.images, true)[0] ||
      effectiveImageUrls[0] ||
      fallbackProductImage;

    return (member.variants || []).map((variant) => ({
      variant,
      image: memberImage,
    }));
  });

  const catalogVariantEntries =
    groupedVariantEntries.length > 0
      ? groupedVariantEntries
      : (laravelProduct.variants || []).map((variant) => ({
          variant,
          image:
            effectiveCatalogImages[0] ||
            effectiveImageUrls[0] ||
            fallbackProductImage,
        }));

  const promoAvailableStock = isPromo
    ? sumVariantLocations(laravelProduct.variants, "available_stock")
    : 0;

  const promoTransitStock = isPromo
    ? sumVariantLocations(laravelProduct.variants, "incoming_transit")
    : 0;

  const makitoAvailableStock = !isPromo
    ? sumVariantLocations(laravelProduct.variants, "available_stock")
    : 0;

  const makitoTransitStock = !isPromo
    ? sumVariantLocations(laravelProduct.variants, "incoming_transit")
    : 0;

  const immediateAvailableStock = isImmediate
    ? groupedKyteVariants.length > 0
      ? groupedKyteVariants.reduce(
          (sum, member) => sum + Math.max(0, Number(member.total_stock || 0)),
          0,
        )
      : Number(laravelProduct.total_stock || 0) ||
        laravelProduct.variants?.reduce(
          (sum, variant) =>
            sum +
            Number(
              variant?.available_stock || variant?.total_aggregated_stock || 0,
            ),
          0,
        ) ||
        0
    : 0;

  const totalStock = isImmediate
    ? immediateAvailableStock
    : isPromo
      ? promoAvailableStock
      : makitoAvailableStock;

  const comercialBrand =
    laravelProduct.brand === "PROMO"
      ? "Premium"
      : laravelProduct.brand === "MAKITO"
        ? "EcoLine"
        : isImmediate
          ? "KYTE"
          : laravelProduct.brand || "Producto";

  const mappedVariations = catalogVariantEntries.map(({ variant, image }) => {
    const stockLocations = getVariantStockLocations(variant);

    const providerStockLocations = isImmediate
      ? stockLocations
      : stockLocations.filter((loc) => {
          const providerCode =
            getCatalogStockLocationProviderCode(loc);

          return !isImmediateProviderCode(providerCode);
        });

    const variantAvailableStock = providerStockLocations.reduce(
      (sum, loc) => sum + Number(loc?.available_stock || 0),
      0,
    );

    const variantTransitStock = providerStockLocations.reduce(
      (sum, loc) => sum + Number(loc?.incoming_transit || 0),
      0,
    );

    const firstLocation = providerStockLocations[0] || {};

    return {
      color: String(variant?.color || "Sin color"),
      size: String(variant?.size || "S/T"),
      sku: String(variant?.sku || ""),
      colorCode: String(variant?.color || "Sin color"),
      colorImage: image,
      image,
      stockFisico: variantAvailableStock,
      stockTransito: variantTransitStock,
      disponibilidadLabel:
        String(variant?.disponibilidadLabel || "").trim() ||
        String(firstLocation?.dynamic_eta_label || "").trim() ||
        String(firstLocation?.provider?.default_eta_label || "").trim() ||
        "Sin stock",
      fechaLlegada:
        String(variant?.fechaLlegada || "").trim() ||
        String(firstLocation?.dynamic_eta_label || "").trim() ||
        String(firstLocation?.provider?.default_eta_label || "").trim() ||
        "",
      stockLocations,
    };
  });

  return {
    id: String(laravelProduct.slug || laravelProduct.id || ""),
    type: laravelProduct.type || comercialBrand || "Producto",
    name: isImmediate
      ? cleanImmediateProductName(laravelProduct.name)
      : laravelProduct.name || "",
    gender: laravelProduct.gender || comercialBrand || "general",
    new: Boolean(laravelProduct.new),
    sale: false,
    rate: 5,
    price: 0,
    originPrice: basePrice > 0 ? basePrice * 1.2 : 0,
    brand: comercialBrand,
    category: comercialBrand,
    sold: Number(laravelProduct.sold || 0),
    quantity: totalStock,
    quantityPurchase: Number(laravelProduct.quantityPurchase || 1),
    sizes: Array.from(
      new Set(
        mappedVariations
          .map((variant) => String(variant?.size || "S/T"))
          .filter(Boolean),
      ),
    ),
    images:
      effectiveImageUrls.length > 0
        ? effectiveImageUrls
        : [fallbackProductImage],
    thumbImage:
      effectiveCatalogImages.length > 1
        ? [effectiveCatalogImages[0], effectiveCatalogImages[1]]
        : [
            effectiveCatalogImages[0] ||
              effectiveImageUrls[0] ||
              fallbackProductImage,
          ],
    stockFisico: isImmediate
      ? immediateAvailableStock
      : isPromo
        ? promoAvailableStock
        : makitoAvailableStock,
    stockTransito: isImmediate
      ? 0
      : isPromo
        ? promoTransitStock
        : makitoTransitStock,
    description:
      laravelProduct.description || "Producto promocional de alta calidad",
    action: "add to cart",
    slug: String(laravelProduct.slug || ""),
    features: parsedFeatures as ProductType["features"],
    variants: (laravelProduct.variants || []) as ProductType["variants"],
    variation: mappedVariations as ProductType["variation"],
  };
};

// Función para formatear etiquetas de categorías
const formatCategoryLabel = (name: string) => {
  const smallWords = [
    "y",
    "de",
    "del",
    "la",
    "las",
    "el",
    "los",
    "para",
    "en",
    "con",
  ];

  return name
    .replace(/_/g, " ")
    .toLocaleLowerCase("es")
    .split(" ")
    .map((word, index) => {
      if (!word) return word;
      if (index > 0 && smallWords.includes(word)) return word;
      return word.charAt(0).toLocaleUpperCase("es") + word.slice(1);
    })
    .join(" ");
};

const normalizeCatalogBrandFilter = (
  value: string | null,
) => {
  const normalized = String(value || "").trim();

  if (!normalized) return null;

  /*
   * Compatibilidad de lectura para URLs antiguas:
   * ?brand=Local -> KYTE
   */
  return normalized.toLowerCase() === "local"
    ? "KYTE"
    : normalized;
};

const getProviderFromBrand = (brand: string | null) => {
  if (brand === "Premium") return "promo";
  if (brand === "EcoLine") return "makito";
  if (brand === "KYTE") return "kyte";
  return null;
};

const ShopBreadCrumbImgContent: React.FC<Props> = ({
  dataType,
  initialCommercialCategory = null,
  hideCatalogHero = false,
  categoryBasePath = "/categoria",
  initialCatalog = null,
  initialCategories = null,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // ==========================================
  // 1. ESTADOS DE INTERFAZ (UI)
  // ==========================================
  const [layoutCol] = useState<number | null>(4);
  const [openSidebar, setOpenSidebar] = useState(false);
  const [isLoading, setIsLoading] = useState(!initialCatalog);
  const [isLoadingCategories, setIsLoadingCategories] = useState(
    !initialCategories?.loaded,
  );
  const [categoriesLoadAttempted, setCategoriesLoadAttempted] = useState(
    Boolean(initialCategories?.loaded),
  );
  // ==========================================
  // 2. ESTADOS DE FILTROS (MOTOR DE BÚSQUEDA)
  // ==========================================
  const [category] = useState<string | null>(dataType);
  const [color, setColor] = useState<string | null>(searchParams.get("color"));
  const [brand, setBrand] = useState<string | null>(
    normalizeCatalogBrandFilter(searchParams.get("brand")),
  );
  const [search, setSearch] = useState<string>(
    searchParams.get("search") || "",
  );
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    initialCommercialCategory || searchParams.get("commercial_category"),
  );
  const [currentPage, setCurrentPage] = useState<number>(
    Number(searchParams.get("page") || 1),
  );

  const searchParamsString = searchParams.toString();

  useEffect(() => {
    const params = new URLSearchParams(searchParamsString);

    setColor(params.get("color"));
    setBrand(normalizeCatalogBrandFilter(params.get("brand")));
    setSearch(params.get("search") || "");
    setSelectedCategory(
      initialCommercialCategory || params.get("commercial_category"),
    );
    setCurrentPage(Number(params.get("page") || 1));
  }, [searchParamsString, initialCommercialCategory]);

  // ==========================================
  // 3. ESTADOS DE DATOS (LARAVEL)
  // ==========================================
  const [products, setProducts] = useState<ProductType[]>(
    initialCatalog?.products || [],
  );
  const [availableCategories, setAvailableCategories] = useState<
    CategoryItem[]
  >(initialCategories?.categories || []);
  const [totalPages, setTotalPages] = useState(
    initialCatalog?.totalPages || 1,
  );
  const [totalProducts, setTotalProducts] = useState(
    initialCatalog?.totalProducts || 0,
  );

  const selectedCategoryLabel = useMemo(() => {
    if (!selectedCategory) return null;

    const currentCategory = availableCategories.find(
      (item) => item.value === selectedCategory,
    );

    return currentCategory?.label || null;
  }, [availableCategories, selectedCategory]);

  const catalogHero = useMemo(
    () => getCatalogHeroConfig(selectedCategory, selectedCategoryLabel),
    [selectedCategory, selectedCategoryLabel],
  );

  const {
    shouldRestoreScroll,
    scrollY,
    markRestoreScroll,
    setCatalogContext,
    getCatalogCache,
    setCatalogCache,
  } = useCatalogStore();
  const isFirstCatalogLoad = useRef(true);
  const initialCatalogUsedRef = useRef(false);
  const initialCategoriesUsedRef = useRef(false);
  const previousSearchRef = useRef(search);

  const getCatalogCacheKey = useCallback(() => {
    const params = new URLSearchParams();

    params.set("page", String(currentPage));
    if (category) params.set("type", category);
    if (color) params.set("color", color);
    if (brand) params.set("brand", brand);
    if (search.trim()) params.set("search", search.trim());
    if (selectedCategory) params.set("commercial_category", selectedCategory);

    return params.toString();
  }, [currentPage, category, color, brand, search, selectedCategory]);

  // Colores con swatch (sin cambiar valores hacia Laravel)
  const colorOptions = useMemo(
    () => [
      { label: "NEGRO", value: "NEGRO", hex: "#000000" },
      { label: "BLANCO", value: "BLANCO", hex: "#FFFFFF" },
      { label: "AZUL", value: "AZUL", hex: "#1D4ED8" },
      { label: "ROJO", value: "ROJO", hex: "#DC2626" },
      { label: "VERDE", value: "VERDE", hex: "#16A34A" },
      { label: "GRIS", value: "GRIS", hex: "#6B7280" },
    ],
    [],
  );

  const updateUrlParams = (nextValues: {
    color?: string | null;
    brand?: string | null;
    search?: string;
    commercialCategory?: string | null;
    page?: number;
  }) => {
    const params = new URLSearchParams(searchParams.toString());

    const nextColor = nextValues.color !== undefined ? nextValues.color : color;
    const nextBrand = nextValues.brand !== undefined ? nextValues.brand : brand;
    const nextSearch =
      nextValues.search !== undefined ? nextValues.search : search;
    const nextCategory =
      nextValues.commercialCategory !== undefined
        ? nextValues.commercialCategory
        : selectedCategory;
    const nextPage =
      nextValues.page !== undefined ? nextValues.page : currentPage;

    if (nextColor) params.set("color", nextColor);
    else params.delete("color");

    if (nextBrand) params.set("brand", nextBrand);
    else params.delete("brand");

    if (nextSearch && nextSearch.trim() !== "")
      params.set("search", nextSearch.trim());
    else params.delete("search");

    if (initialCommercialCategory) {
      params.delete("commercial_category");
    } else if (nextCategory) {
      params.set("commercial_category", nextCategory);
    } else {
      params.delete("commercial_category");
    }

    // Limpieza de compatibilidad: si venía una URL antigua con "category",
    // la eliminamos para evitar filtros duplicados.
    params.delete("category");

    if (nextPage && nextPage > 1) params.set("page", String(nextPage));
    else params.delete("page");

    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
      scroll: false,
    });
  };

  // La búsqueda del catálogo ya aplica un debounce antes de consultar Laravel.
  // El parámetro `search` se conserva en la URL, pero evitamos navegar con
  // router.replace() por cada tecla. La URL se sincroniza después de una pausa
  // mediante History API, sin volver a ejecutar la página Server Component.
  useEffect(() => {
    const cleanSearch = search.trim();
    const params = new URLSearchParams(searchParamsString);
    const currentUrlSearch = (params.get("search") || "").trim();

    if (currentUrlSearch === cleanSearch) return;

    const timeoutId = window.setTimeout(() => {
      if (cleanSearch) params.set("search", cleanSearch);
      else params.delete("search");

      // Una búsqueda nueva siempre comienza desde la primera página.
      params.delete("page");

      const queryString = params.toString();
      const nextUrl = queryString ? `${pathname}?${queryString}` : pathname;
      const currentUrl = `${window.location.pathname}${window.location.search}`;

      if (nextUrl !== currentUrl) {
        window.history.replaceState(null, "", nextUrl);
      }
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [pathname, search, searchParamsString]);

  // ==========================================
  // 4. CARGAR CATEGORÍAS COMERCIALES DESDE LARAVEL
  //    Regla:
  //    - Sin línea seleccionada => todas las categorías comerciales
  //    - Premium => categorías comerciales con productos Promo
  //    - EcoLine => categorías comerciales con productos Makito
  //    - Inmediata => categorías comerciales con productos KYTE
  // ==========================================
useEffect(() => {
  let ignore = false;

  const provider = getProviderFromBrand(brand);
  const filters = {
    color,
    search: search.trim(),
  };
  const currentCacheKey = getCommercialCategoriesCacheKey(provider, filters);

  if (
    initialCategories?.loaded &&
    !initialCategoriesUsedRef.current &&
    initialCategories.cacheKey === currentCacheKey
  ) {
    primeCommercialCategoriesCache(
      initialCategories.provider,
      {
        color: initialCategories.color,
        search: initialCategories.search,
      },
      initialCategories.categories,
    );
    setAvailableCategories(initialCategories.categories);
    setCategoriesLoadAttempted(true);
    setIsLoadingCategories(false);
    initialCategoriesUsedRef.current = true;
    return;
  }

  const fetchCategories = async () => {
    setIsLoadingCategories(true);

    try {
      const categories = await getCommercialCategories<CategoryItem>(
        provider,
        filters,
      );

      if (!ignore) {
        setAvailableCategories(categories);
      }
    } catch (error) {
      console.error("Error cargando categorías comerciales:", error);
      // Si ya hay facets visibles, los conservamos para evitar parpadeos
      // o un sidebar vacío ante una falla temporal del backend.
    } finally {
      if (!ignore) {
        setCategoriesLoadAttempted(true);
        setIsLoadingCategories(false);
      }
    }
  };

  // El contador de categorías es un facet del catálogo. La búsqueda se
  // debouncea para no consultar Laravel por cada tecla. Color/disponibilidad
  // actualizan inmediatamente.
  const timeoutId = window.setTimeout(
    fetchCategories,
    search.trim() ? 300 : 0,
  );

  return () => {
    ignore = true;
    window.clearTimeout(timeoutId);
  };
}, [brand, color, search, initialCategories]);

  // ==========================================
  // 5. CONEXIÓN EN TIEMPO REAL CON LA API
  // ==========================================
  useEffect(() => {
    const fetchCatalog = async () => {
      const catalogCacheKey = getCatalogCacheKey();

      if (
        initialCatalog &&
        !initialCatalogUsedRef.current &&
        initialCatalog.cacheKey === catalogCacheKey
      ) {
        setProducts(initialCatalog.products);
        setTotalPages(initialCatalog.totalPages);
        setTotalProducts(initialCatalog.totalProducts);
        setCatalogCache(catalogCacheKey, {
          products: initialCatalog.products,
          totalPages: initialCatalog.totalPages,
          totalProducts: initialCatalog.totalProducts,
        });
        setIsLoading(false);
        initialCatalogUsedRef.current = true;
        return;
      }

      const cachedCatalog = getCatalogCache(catalogCacheKey);

      if (cachedCatalog) {
        setProducts(cachedCatalog.products as ProductType[]);
        setTotalPages(cachedCatalog.totalPages);
        setTotalProducts(cachedCatalog.totalProducts);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        const params = new URLSearchParams();

        params.set("page", String(currentPage));

        if (category) params.set("type", category);
        if (color) params.set("color", color);

        if (brand === "Premium") {
          params.set("provider", "promo");
        } else if (brand === "EcoLine") {
          params.set("provider", "makito");
        } else if (brand === "KYTE") {
          params.set("availability", "immediate");
        } else if (brand) {
          params.set("brand", brand);
        }

        if (search.trim() !== "") {
          params.set("search", search.trim());
        }

        if (selectedCategory) {
          params.set("commercial_category", selectedCategory);
        }

        const url = `${process.env.NEXT_PUBLIC_API_URL}/catalog?${params.toString()}`;
        const json = await getCatalogJson<CatalogApiResponse>(url);
        const sourceProducts = Array.isArray(json.data) ? json.data : [];

        const mappedProducts = sourceProducts.map((laravelProduct) =>
          mapCatalogProduct(laravelProduct),
        );

        const nextTotalPages = Number(json.last_page || 1);
        const nextTotalProducts = Number(
          json.total || mappedProducts.length || 0,
        );

        setProducts(mappedProducts);
        setTotalPages(nextTotalPages);
        setTotalProducts(nextTotalProducts);
        setCatalogCache(catalogCacheKey, {
          products: mappedProducts,
          totalPages: nextTotalPages,
          totalProducts: nextTotalProducts,
        });
      } catch (error) {
        console.error("Error cargando el catálogo:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const searchChanged = previousSearchRef.current !== search;
    const shouldDebounce = !isFirstCatalogLoad.current && searchChanged;

    const timeoutId = setTimeout(
      () => {
        fetchCatalog().finally(() => {
          isFirstCatalogLoad.current = false;
          previousSearchRef.current = search;
        });
      },
      shouldDebounce ? 300 : 0,
    );

    return () => clearTimeout(timeoutId);
  }, [
    currentPage,
    category,
    color,
    brand,
    search,
    selectedCategory,
    getCatalogCacheKey,
    getCatalogCache,
    setCatalogCache,
    initialCatalog,
  ]);

  // ==========================================
  // 6. MANEJADORES
  // ==========================================
  const handlePageChange = (selected: number) => {
    const nextPage = selected + 1;
    setCurrentPage(nextPage);
    updateUrlParams({ page: nextPage });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearAllFilters = () => {
    setColor(null);
    setBrand(null);
    setSearch("");
    setSelectedCategory(initialCommercialCategory || null);
    setCurrentPage(1);
    router.replace(pathname, { scroll: false });
  };

  useEffect(() => {
    setCatalogContext({
      pathname,
      search: searchParams.toString() ? `?${searchParams.toString()}` : "",
      filters: {
        brand,
        category: selectedCategory,
        searchTerm: search,
        page: currentPage,
        color,
      },
      scrollY: typeof window !== "undefined" ? window.scrollY : 0,
    });
  }, [
    pathname,
    searchParams,
    brand,
    selectedCategory,
    search,
    currentPage,
    color,
    setCatalogContext,
  ]);

  useEffect(() => {
    if (!shouldRestoreScroll || isLoading) return;

    const restore = window.requestAnimationFrame(() => {
      window.scrollTo({ top: scrollY, behavior: "auto" });
      markRestoreScroll(false);
    });

    return () => window.cancelAnimationFrame(restore);
  }, [shouldRestoreScroll, isLoading, scrollY, markRestoreScroll]);
  const gridColsClass =
    layoutCol === 3
      ? "lg:grid-cols-3"
      : layoutCol === 5
        ? "lg:grid-cols-5"
        : "lg:grid-cols-4";

  const activeFiltersCount = [
    color,
    brand,
    search,
    initialCommercialCategory ? null : selectedCategory,
  ].filter(Boolean).length;

  const showBackToCatalogButton = Boolean(initialCommercialCategory);
  const showClearFiltersButton = Boolean(
    color ||
    brand ||
    search.trim() ||
    (!initialCommercialCategory && selectedCategory),
  );

  const FiltersContent = (
    <div className="filter-inner rounded-2xl border border-line bg-white p-6 shadow-[0_12px_32px_rgba(31,41,51,0.06)]">
      <div className="mb-6 border-b border-line pb-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="heading6 text-text-strong">Filtros</div>
            <p className="caption1 mt-1 text-text-muted">Refiná tu búsqueda</p>
          </div>
          {activeFiltersCount > 0 && (
            <span className="caption1 rounded-full bg-primary-soft px-3 py-1 font-semibold text-primary-dark">
              {activeFiltersCount}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-7">
        <div className="filter-search">
          <div className="text-title mb-3 text-text-strong">Buscar</div>
          <div className="relative">
            <input
              type="text"
              placeholder="Ej. termo, USB, gorra..."
              value={search}
              onChange={(e) => {
                const value = e.target.value;
                setSearch(value);
                setCurrentPage(1);
              }}
              className="h-11 w-full rounded-xl border border-line bg-surface px-4 pr-11 text-sm text-text outline-none duration-300 placeholder:text-text-muted focus:border-primary focus:bg-white"
            />
            <Icon.MagnifyingGlass
              className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted"
              size={20}
            />
          </div>
        </div>

        <div className="filter-brand border-t border-line pt-6">
          <div className="text-title mb-3 text-text-strong">Disponibilidad</div>
          <div className="flex flex-col gap-2.5">
            {[
              { value: "Premium", label: "10 a 15 días" },
              { value: "EcoLine", label: "15 a 20 días" },
              { value: "KYTE", label: "Inmediata" },
            ].map((item) => {
              const isActive = brand === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => {
                    const nextBrand = brand === item.value ? null : item.value;
                    setBrand(nextBrand);
                    setSelectedCategory(
                      initialCommercialCategory || selectedCategory,
                    );
                    setCurrentPage(1);
                    updateUrlParams({
                      brand: nextBrand,
                      commercialCategory:
                        initialCommercialCategory || selectedCategory,
                      page: 1,
                    });
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left text-sm duration-300 ${
                    isActive
                      ? "border-primary bg-primary-soft text-primary-dark"
                      : "border-transparent bg-white text-text-secondary hover:border-primary/30 hover:bg-primary-soft/60 hover:text-text"
                  }`}
                >
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                      isActive
                        ? "border-primary bg-primary text-white"
                        : "border-line bg-white"
                    }`}
                  >
                    {isActive && <Icon.Check size={11} weight="bold" />}
                  </span>
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="filter-color border-t border-line pt-6">
          <div className="text-title mb-3 text-text-strong">Color</div>
          <div className="flex flex-wrap gap-2">
            {colorOptions.map((opt) => {
              const isActive = color === opt.value;
              return (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => {
                    const nextColor = color === opt.value ? null : opt.value;
                    setColor(nextColor);
                    setCurrentPage(1);
                    updateUrlParams({ color: nextColor, page: 1 });
                  }}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold duration-300 ${
                    isActive
                      ? "border-primary bg-primary-soft text-primary-dark"
                      : "border-line bg-white text-text-secondary hover:border-primary/40 hover:text-primary-dark"
                  }`}
                >
                  <span
                    className="inline-block h-3.5 w-3.5 rounded-full border border-line"
                    style={{ backgroundColor: opt.hex }}
                  />
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="filter-category border-t border-line pt-6">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="text-title text-text-strong">Categorías</div>
            {isLoadingCategories && availableCategories.length > 0 ? (
              <span className="text-xs text-text-muted">Actualizando...</span>
            ) : null}
          </div>

          <div className="flex max-h-[520px] flex-col gap-2 overflow-y-auto pr-1">
            {availableCategories.length === 0 &&
            (isLoadingCategories || !categoriesLoadAttempted) ? (
              <div className="text-sm text-text-muted">
                Cargando categorías...
              </div>
            ) : availableCategories.length === 0 ? (
              <div className="text-sm text-text-muted">
                No hay categorías disponibles.
              </div>
            ) : (
              availableCategories.map((cat) => {
                const isActive = selectedCategory === cat.value;
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => {
                      /*
                       * Las categorías del sidebar son filtros de catálogo, no
                       * necesariamente páginas SEO. `commercial-categories`
                       * también devuelve categorías automáticas con slugs del
                       * proveedor (p. ej. antibacterial-makito-1-7), y esas
                       * rutas no existen en /categoria/[slug].
                       */
                      const nextCategory =
                        !initialCommercialCategory &&
                        selectedCategory === cat.value
                          ? null
                          : cat.value;

                      setSelectedCategory(nextCategory);
                      setCurrentPage(1);

                      const params = new URLSearchParams(searchParams.toString());
                      params.delete("provider");
                      params.delete("category");
                      params.delete("page");

                      if (brand) params.set("brand", brand);
                      else params.delete("brand");

                      if (color) params.set("color", color);
                      else params.delete("color");

                      if (search.trim()) params.set("search", search.trim());
                      else params.delete("search");

                      if (nextCategory) {
                        params.set("commercial_category", nextCategory);
                      } else {
                        params.delete("commercial_category");
                      }

                      const queryString = params.toString();

                      /*
                       * Si venimos de una landing SEO /categoria/{slug}, salimos
                       * al catálogo para no mezclar dos categorías distintas.
                       * En /catalogo mantenemos la ruta y solo cambiamos filtros.
                       */
                      const nextPath = initialCommercialCategory
                        ? "/productos"
                        : pathname;

                      router.push(
                        queryString ? `${nextPath}?${queryString}` : nextPath,
                        { scroll: false },
                      );
                    }}
                    className={`group flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-2 text-left duration-300 ${
                      isActive
                        ? "border-primary bg-primary-soft text-primary-dark"
                        : "border-transparent bg-white text-text-secondary hover:border-primary/30 hover:bg-primary-soft/50 hover:text-text"
                    }`}
                  >
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">
                      {formatCategoryLabel(cat.label)}
                    </span>
                    <span
                      className={`caption1 shrink-0 rounded-full px-2 py-0.5 ${
                        isActive
                          ? "bg-white text-primary-dark"
                          : "bg-surface-alt text-text-muted"
                      }`}
                    >
                      {cat.products_count ?? 0}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {showClearFiltersButton && (
          <button
            type="button"
            onClick={clearAllFilters}
            className="mt-1 flex w-full items-center justify-center gap-2 rounded-full border border-danger/20 bg-[#FEECEC] px-4 py-3 text-button-uppercase text-danger duration-300 hover:bg-danger hover:text-white"
          >
            <Icon.X size={18} />
            Limpiar filtros
          </button>
        )}

        {!showClearFiltersButton && showBackToCatalogButton && (
          <button
            type="button"
            onClick={() => router.push("/productos")}
            className="mt-1 flex w-full items-center justify-center gap-2 rounded-full border border-primary/30 bg-white px-4 py-3 text-button-uppercase text-primary-dark duration-300 hover:bg-primary hover:text-white"
          >
            <Icon.ArrowLeft size={18} />
            Ver todo el catálogo
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {!hideCatalogHero && (
        <section className="relative isolate min-h-[680px] overflow-hidden border-b border-[#DCE6EA] bg-[#061B3B] text-white md:min-h-[720px]">
          <Image
            src={catalogHero.image}
            alt={`${catalogHero.title} ${catalogHero.accent || ""} BTL Marketing`.trim()}
            fill
            priority
            className="object-cover"
            style={{ objectPosition: catalogHero.objectPosition }}
            sizes="100vw"
          />

          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(4,24,57,.93)_0%,rgba(4,28,63,.72)_36%,rgba(4,31,66,.24)_58%,rgba(4,31,66,.02)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_34%_52%,rgba(56,160,162,.10),transparent_34%)]" />

          <div className="container relative z-[1] flex min-h-[680px] items-center pt-40 pb-16 md:min-h-[720px] md:pt-44 md:pb-20">
            <div className="max-w-[650px]">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[.14em] text-white backdrop-blur-sm">
                <Icon.Sparkle size={15} weight="fill" className="text-[#8DBC21]" />
                {catalogHero.eyebrow}
              </div>

              <h1 className="max-w-[650px] text-4xl font-black leading-[1.05] text-white md:text-5xl lg:text-6xl">
                {catalogHero.title}{" "}
                {catalogHero.accent ? (
                  <span className="text-[#8DBC21]">{catalogHero.accent}</span>
                ) : null}
              </h1>

              <p className="mt-5 max-w-[580px] text-base leading-7 text-white/85 md:text-lg">
                {catalogHero.description}
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-bold text-white backdrop-blur-sm">
                  <Icon.CheckCircle size={17} weight="fill" className="text-[#8DBC21]" />
                  Amplio catálogo
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-bold text-white backdrop-blur-sm">
                  <Icon.ChatCircleText size={17} weight="fill" className="text-[#38A0A2]" />
                  Atención personalizada
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="shop-product bg-[#F5F9FB] lg:py-16 md:py-12 py-9">
        <div className="container">
          <div className="mb-7 flex flex-col gap-4 rounded-[22px] border border-[#DCE6EA] bg-white p-4 shadow-[0_10px_30px_rgba(31,46,83,.05)] md:flex-row md:items-center md:justify-between">
            <div className="flex items-center justify-between gap-3 md:justify-start">
              <button
                type="button"
                className="filter-block inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-button-uppercase text-text md:hidden"
                onClick={() => setOpenSidebar((v) => !v)}
              >
                <Icon.Faders size={20} />
                Filtrar
              </button>
              <div className="text-sm text-text-secondary">
                Mostrando{" "}
                <span className="font-semibold text-text-strong">
                  {products.length}
                </span>{" "}
                de{" "}
                <span className="font-semibold text-text-strong">
                  {totalProducts}
                </span>{" "}
                productos
              </div>
            </div>

          </div>

          <div
            className="md:hidden overflow-hidden transition-[max-height] duration-300 ease-in-out"
            style={{ maxHeight: openSidebar ? 1400 : 0 }}
          >
            <div
              className={`mb-6 ${openSidebar ? "opacity-100" : "opacity-0"} transition-opacity duration-200`}
            >
              {FiltersContent}
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-[290px_minmax(0,1fr)] lg:grid-cols-[320px_minmax(0,1fr)]">
            <aside className="hidden md:block">{FiltersContent}</aside>

            <div className="min-w-0">
              {isLoading ? (
                <div className="flex w-full justify-center rounded-2xl border border-line bg-white py-20">
                  <div className="h-12 w-12 animate-spin rounded-full border-2 border-line border-b-primary" />
                </div>
              ) : (
                <div
                  className={`list-product grid ${gridColsClass} sm:grid-cols-3 grid-cols-2 sm:gap-[30px] gap-[20px]`}
                >
                  {products.length === 0 ? (
                    <div className="col-span-full rounded-2xl border border-line bg-white px-6 py-14 text-center">
                      <Icon.MagnifyingGlass
                        size={34}
                        className="mx-auto mb-3 text-text-muted"
                      />
                      <div className="heading6 text-text-strong">
                        No encontramos productos
                      </div>
                      <p className="mt-2 text-text-secondary">
                        Probá limpiar filtros o usar otra palabra de búsqueda.
                      </p>
                    </div>
                  ) : (
                    products.map((item, index) => (
                      <CatalogProductCard
                        key={item.id}
                        product={item}
                        priorityImage={index < 8}
                      />
                    ))
                  )}
                </div>
              )}

              {totalPages > 1 && (
                <div
                  className="list-pagination flex items-center justify-center md:mt-10 mt-7"
                  style={{
                    opacity: isLoading ? 0.6 : 1,
                    pointerEvents: isLoading ? "none" : "auto",
                  }}
                >
                  <HandlePagination
                    pageCount={totalPages}
                    onPageChange={handlePageChange}
                    forcePage={currentPage - 1}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

const ShopBreadCrumbImg: React.FC<Props> = (props) => {
  return (
    <Suspense fallback={<div className="py-20 text-center">Cargando catálogo...</div>}>
      <ShopBreadCrumbImgContent {...props} />
    </Suspense>
  );
};

export default ShopBreadCrumbImg;
