"use client";

import { appAsset } from '@/lib/appPaths'

import React, { useRef, useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useCatalogStore from "@/store/useCatalogStore";
import useProductFlowStore from "@/store/useProductFlowStore";
import { ProductType, ProductFeatureObject } from "@/type/ProductType";
import CatalogProductCard from "@/components/BTL/CatalogProductCard";
import { getColorLabel, getColorSwatchStyle } from "@/lib/colors";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import { Navigation, Thumbs, FreeMode } from "swiper/modules";
import "swiper/css/bundle";
import * as Icon from "@phosphor-icons/react/dist/ssr";
import { useCart } from "@/context/CartContext";
import { useModalCartContext } from "@/context/ModalCartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useModalWishlistContext } from "@/context/ModalWishlistContext";
import { useCompare } from "@/context/CompareContext";
import { useModalCompareContext } from "@/context/ModalCompareContext";
import ModalSizeguide from "@/components/Modal/ModalSizeguide";
import { getCartItemImage, shouldBypassNextImageOptimization } from "@/lib/productImages";

type DetailPrimitive = string | number | boolean | null | undefined;

type DetailPackageDimensions = {
  lengthInCentimeters?: DetailPrimitive;
  heightInCentimeters?: DetailPrimitive;
  widthInCentimeters?: DetailPrimitive;
  [key: string]: unknown;
};

type DetailPackageWeight = {
  grossWeight?: DetailPrimitive;
  [key: string]: unknown;
};

type DetailPackageUnits = {
  piecesPerBox?: DetailPrimitive;
  [key: string]: unknown;
};

type DetailFeatureRecord = ProductFeatureObject & {
  _promoImages?: PromoImages;
  _linkedImmediateProducts?: DetailImmediateProduct[];
  _isDirectKyte?: boolean;
  imagekit?: {
    catalog?: {
      main?: unknown;
      hover?: unknown;
    };
    images?: unknown[];
  };
  print_areas?: unknown;
  package?: {
    individualBox?: unknown;
    dimensions?: DetailPackageDimensions;
    weight?: DetailPackageWeight;
    units?: DetailPackageUnits;
  };
  printing?: {
    printArea?: unknown;
    printTechnique?: unknown;
  };
  view_360?: string | null;
  printcode?: DetailPrimitive;
  length?: DetailPrimitive;
  height?: DetailPrimitive;
  width?: DetailPrimitive;
  weight?: DetailPrimitive;
  material?: DetailPrimitive;
  measure?: DetailPrimitive;
  capacity?: DetailPrimitive;
  pf_description?: DetailPrimitive;
  pi1_units?: DetailPrimitive;
  pi1_type?: DetailPrimitive;
  pi2_units?: DetailPrimitive;
  pi2_type?: DetailPrimitive;
  ptc_units?: DetailPrimitive;
  ptc_height?: DetailPrimitive;
  ptc_width?: DetailPrimitive;
  ptc_length?: DetailPrimitive;
  ptc_weight?: DetailPrimitive;
  pallet_units?: DetailPrimitive;
  bundle_pallets?: DetailPrimitive;
  pallet_weight?: DetailPrimitive;
};

type DetailCategory = {
  id?: number | string | null;
  name?: string | null;
  slug?: string | null;
  provider?: string | null;
  external_id?: number | string | null;
  lang?: number | string | null;
};

import { getCommercialCategories } from "@/lib/commercialCategories";

type CommercialCategoryMatch = {
  provider?: string | null;
  slug?: string | null;
};

type CommercialCategory = {
  label?: string | null;
  value?: string | null;
  slug?: string | null;
  matches?: CommercialCategoryMatch[];
};

type DetailProvider = {
  code?: string | null;
  name?: string | null;
  default_eta_label?: string | null;
};

type DetailStockLocation = {
  provider_sku?: string | null;
  available_stock?: number | string | null;
  incoming_transit?: number | string | null;
  stock_controlled?: boolean | number | string | null;
  stock_status?: string | null;
  dynamic_eta_label?: string | null;

  /*
   * Identidad operacional real.
   */
  source_provider?: string | null;

  provider?: DetailProvider | null;
};

type DetailVariant = ProductType["variation"][number] & {
  localKey?: string;
  immediateProductId?: string | number | null;
  immediateProductSlug?: string | null;
  immediateProductName?: string | null;
  immediateVariantId?: string | number | null;
  providerCode?: string | null;
  providerName?: string | null;
  disponibilidadLabel?: string;
  fechaLlegada?: string;
  stockLocations?: DetailStockLocation[];
};

type DetailImmediateVariant = DetailVariant & {
  id?: string | number | null;
  variant_id?: string | number | null;
  base_price?: number | string | null;
  currency?: string | null;
  stock_locations?: DetailStockLocation[];
  stockLocations?: DetailStockLocation[];
  available_stock?: number | string | null;
  total_aggregated_stock?: number | string | null;
  provider_sku?: string | null;
  sourceDescription?: string | null;
};

type DetailImmediateProduct = {
  id?: string | number | null;
  slug?: string | null;
  name?: string | null;
  description?: string | null;
  color?: string | null;
  size?: string | null;
  images?: unknown[] | null;
  codigo_sac_color_code?: string | null;
  ag_prod_codigo_original?: string | null;
  variants?: DetailImmediateVariant[];
};

type PromoImages = {
  mainImages?: unknown[];
  variantImages?: unknown[];
  vectorImages?: unknown[];
};

type PrintAreaRaw = {
  area_img?: unknown;
  width?: unknown;
  height?: unknown;
  technique_name?: unknown;
  max_colors?: unknown;
};

type PrintTechnique = {
  technique_name: string;
  max_colors: number;
};

type PrintAreaGroup = {
  area_img: string;
  width: number;
  height: number;
  techniques: PrintTechnique[];
};

type ExternalAvailabilityBlock = {
  key: string;
  title: string;
  subtitle: string;
};

type ExternalVariationItem = {
  variant: DetailVariant;
  index: number;
};

type ExternalAvailabilityGroup = ExternalAvailabilityBlock & {
  items: ExternalVariationItem[];
};

type SelectedVariantItem =
  | {
      variant: DetailVariant;
      index: number;
      quantity: number;
      source: "regular";
    }
  | {
      variant: DetailImmediateVariant;
      index: number;
      quantity: number;
      source: "immediate";
    };

type QuoteReturnItem = {
  sku?: string;
  color?: string;
  quantity?: number | string;
};

type ExtendedProductType = ProductType & {
  features?: DetailFeatureRecord | string | null;
  categories?: DetailCategory[];
};

interface Props {
  data: Array<ExtendedProductType>;
  productId: string | number | null;
}

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

const normalizeQuoteReturnItems = (value: unknown): QuoteReturnItem[] => {
  if (!Array.isArray(value)) return [];

  return value.filter(isRecord).map((item) => ({
    sku: typeof item.sku === "string" ? item.sku : String(item.sku || ""),
    color:
      typeof item.color === "string" ? item.color : String(item.color || ""),
    quantity:
      typeof item.quantity === "number" || typeof item.quantity === "string"
        ? item.quantity
        : 0,
  }));
};

const parseDetailFeatures = (
  features: ExtendedProductType["features"],
): DetailFeatureRecord => {
  if (!features) return {} as DetailFeatureRecord;

  if (typeof features === "string") {
    try {
      const parsed = JSON.parse(features) as unknown;
      return isRecord(parsed) ? (parsed as DetailFeatureRecord) : ({} as DetailFeatureRecord);
    } catch {
      return {} as DetailFeatureRecord;
    }
  }

  return features as DetailFeatureRecord;
};

const isNonEmptyString = (value: unknown): value is string => {
  return typeof value === "string" && value.trim() !== "";
};

const cleanImmediateProductName = (name?: string | null) => {
  if (!name) return "";
  return name.replace(/^[\d-]+\s*-\s*/, "").trim();
};

const isImmediateProduct = (
  product: Pick<ExtendedProductType, "brand" | "slug"> | null | undefined,
) => {
  const brand = String(product?.brand || "")
    .trim()
    .toUpperCase();

  /*
   * KYTE es la identidad pública canónica.
   * LOCAL se acepta únicamente como compatibilidad de lectura.
   */
  return brand === "LOCAL" || brand === "KYTE";
};

const formatStockNumber = (value: unknown) => {
  const number = Number(value);

  if (!Number.isFinite(number)) return "0";

  return new Intl.NumberFormat("es-NI").format(number);
};

const getDetailVariantStockLocations = (
  variant: DetailVariant | DetailImmediateVariant,
): DetailStockLocation[] => {
  const immediateVariant = variant as DetailImmediateVariant;

  if (Array.isArray(immediateVariant?.stockLocations)) {
    return immediateVariant.stockLocations;
  }

  if (Array.isArray(immediateVariant?.stock_locations)) {
    return immediateVariant.stock_locations;
  }

  return [];
};

const getDetailStockLocationProviderCode = (
  location: DetailStockLocation,
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


const resolveDetailVariantProviderCode = (
  variant: DetailVariant | DetailImmediateVariant,
  fallbackProvider: string,
  mainProductIsImmediate: boolean,
) => {
  const explicitProvider = String(variant?.providerCode || "")
    .trim()
    .toLowerCase();

  if (explicitProvider) {
    return isImmediateProviderCode(explicitProvider)
      ? "kyte"
      : explicitProvider;
  }

  const stockProvider = getDetailVariantStockLocations(variant)
    .map(getDetailStockLocationProviderCode)
    .find(Boolean);

  if (stockProvider) {
    return isImmediateProviderCode(stockProvider)
      ? "kyte"
      : stockProvider;
  }

  const providerName = String(variant?.providerName || "")
    .trim()
    .toLowerCase();

  if (
    providerName.includes("local") ||
    providerName.includes("kyte")
  ) {
    return "kyte";
  }

  if (providerName.includes("makito")) return "makito";

  if (
    providerName.includes("promo") ||
    providerName.includes("premium")
  ) {
    return "promo";
  }

  if (mainProductIsImmediate) return "kyte";

  const normalizedFallback =
    String(fallbackProvider || "proveedor")
      .trim()
      .toLowerCase();

  return isImmediateProviderCode(normalizedFallback)
    ? "kyte"
    : normalizedFallback;
};



const buildImmediateVariations = (
  product: ExtendedProductType | null | undefined,
  features: DetailFeatureRecord,
  fallbackProvider: string,
): DetailImmediateVariant[] => {
  const immediateVariationsMap: Record<string, DetailImmediateVariant> = {};
  const mainProductIsImmediate =
    isImmediateProduct(product);

  const addImmediateVariant = (
    variant: DetailImmediateVariant,
    variantIndex: number,
    immediateProduct?: DetailImmediateProduct,
  ) => {
    const providerCode = resolveDetailVariantProviderCode(
      variant,
      fallbackProvider,
      mainProductIsImmediate,
    );

    if (providerCode !== "kyte") return;

    const stockLocations = getDetailVariantStockLocations(variant);
    const localStockLocations = stockLocations.filter((location) => {
      const locationProvider =
        getDetailStockLocationProviderCode(location);

      return (
        !locationProvider ||
        isImmediateProviderCode(locationProvider)
      );
    });

    const knownImmediateStockLocations = localStockLocations.filter((location) => {
      const controlled =
        location?.stock_controlled === true ||
        location?.stock_controlled === 1 ||
        String(location?.stock_controlled ?? "").toLowerCase() === "true";

      return (
        controlled &&
        location?.available_stock !== null &&
        location?.available_stock !== undefined
      );
    });

    /*
     * Stock desconocido/no controlado no equivale a cero.
     * No se ofrece como entrega inmediata hasta tener cantidad real.
     */
    if (
      localStockLocations.length > 0 &&
      knownImmediateStockLocations.length === 0
    ) {
      return;
    }

    const stockFromLocations = knownImmediateStockLocations.reduce(
      (sum, location) => sum + Math.max(0, Number(location?.available_stock) || 0),
      0,
    );
    const transitFromLocations = localStockLocations.reduce(
      (sum, location) => sum + Math.max(0, Number(location?.incoming_transit) || 0),
      0,
    );

    const stockFisico =
      knownImmediateStockLocations.length > 0
        ? stockFromLocations
        : Math.max(
            0,
            Number(variant?.stockFisico) ||
              Number(variant?.available_stock) ||
              Number(variant?.total_aggregated_stock) ||
              0,
          );

    const stockTransito =
      localStockLocations.length > 0
        ? transitFromLocations
        : Math.max(0, Number(variant?.stockTransito) || 0);

    const rawColor =
      variant?.color ||
      immediateProduct?.codigo_sac_color_code ||
      immediateProduct?.color ||
      "Sin color";
    const color = getColorLabel(rawColor);
    const size = String(variant?.size || immediateProduct?.size || "-");

    /*
     * En KYTE cada color puede existir como Product físico independiente.
     * La imagen vive en el Product hermano, no necesariamente en su variante.
     * Vinculamos esa foto a la variante comercial para que galería y selección
     * de color utilicen la imagen correcta.
     */
    const immediateProductImage = Array.isArray(immediateProduct?.images)
      ? immediateProduct.images.find(isNonEmptyString) || ""
      : "";

    /*
     * KYTE puede no entregar fotografía propia para el color.
     * En ese caso buscamos la variante visual equivalente
     * del producto canónico Makito/Promo.
     */
    const mainVariantImage = Array.isArray(product?.variation)
      ? product.variation
          .map((candidate) => {
            const candidateColor = getColorLabel(
              String(candidate?.color || ""),
            );

            if (candidateColor !== color) {
              return "";
            }

            return String(
              candidate?.image ||
                candidate?.colorImage ||
                "",
            ).trim();
          })
          .find(Boolean) || ""
      : "";

    /*
     * Último fallback: imagen principal del producto canónico.
     */
    const mainProductImage = Array.isArray(product?.images)
      ? product.images.find(isNonEmptyString) || ""
      : "";

    const variantImage = String(
      variant?.image ||
        variant?.colorImage ||
        immediateProductImage ||
        mainVariantImage ||
        mainProductImage ||
        "",
    ).trim();
    const providerSku = String(
      localStockLocations
        .map((location) => location?.provider_sku)
        .find(Boolean) ||
        variant?.provider_sku ||
        immediateProduct?.ag_prod_codigo_original ||
        "",
    ).trim();
    const sku = String(
      variant?.sku ||
        providerSku ||
        `LOCAL-${immediateProduct?.id || "PRODUCTO"}-${variantIndex}`,
    ).trim();

    const normalizedSku = String(sku || providerSku || `KYTE-${variantIndex}`)
      .trim()
      .toUpperCase();
    const normalizedColor = String(color || rawColor || "SIN-COLOR")
      .trim()
      .toUpperCase();
    const normalizedSize = String(size || "-")
      .trim()
      .toUpperCase();
    const localKey = `${normalizedSku}__${normalizedColor}__${normalizedSize}`;

    const normalizedVariant: DetailImmediateVariant = {
      ...variant,
      localKey,
      immediateProductId: immediateProduct?.id ?? variant?.immediateProductId ?? null,
      immediateProductSlug:
        immediateProduct?.slug ?? variant?.immediateProductSlug ?? null,
      immediateProductName:
        immediateProduct?.name ?? variant?.immediateProductName ?? null,
      immediateVariantId:
        variant?.immediateVariantId ??
        variant?.variant_id ??
        variant?.id ??
        null,
      variantId:
        variant?.variantId ??
        variant?.variant_id ??
        variant?.id ??
        null,
      color,
      colorCode: String(variant?.colorCode || rawColor || color || ""),
      colorImage: variantImage,
      image: variantImage,
      sourceDescription: String(
        immediateProduct?.description || product?.description || "",
      ).trim(),
      size,
      sku,
      provider_sku: providerSku || sku,
      stockFisico,
      stockTransito,
      disponibilidadLabel:
        stockFisico > 0
          ? "Inmediata"
          : String(
              variant?.disponibilidadLabel ||
                variant?.fechaLlegada ||
                "Sin stock",
            ),
      fechaLlegada:
        stockFisico > 0
          ? "Inmediata"
          : String(variant?.fechaLlegada || "Sin stock"),
      /*
       * La clasificación sigue siendo inmediata,
       * pero la identidad de la variación ya es KYTE.
       */
      providerCode: "kyte",
      providerName: "KYTE",
      stockControlled: true,
      stockStatus: knownImmediateStockLocations[0]?.stock_status || null,
      stockLocations: knownImmediateStockLocations,
    };

    const current = immediateVariationsMap[localKey];

    if (!current) {
      immediateVariationsMap[localKey] = normalizedVariant;
      return;
    }

    current.stockFisico = Math.max(
      Number(current.stockFisico || 0),
      stockFisico,
    );
    current.stockTransito = Math.max(
      Number(current.stockTransito || 0),
      stockTransito,
    );

    if (!current.provider_sku && normalizedVariant.provider_sku) {
      current.provider_sku = normalizedVariant.provider_sku;
    }
  };

  if (Array.isArray(product?.variation)) {
    product.variation.forEach((variant, index) => {
      addImmediateVariant(variant as DetailImmediateVariant, index);
    });
  }

  const linkedImmediateProducts = Array.isArray(features?._linkedImmediateProducts)
    ? features._linkedImmediateProducts
    : [];

  linkedImmediateProducts.forEach((immediateProduct) => {
    const variants = Array.isArray(immediateProduct?.variants)
      ? immediateProduct.variants
      : [];

    variants.forEach((variant, index) => {
      addImmediateVariant(variant, index, immediateProduct);
    });
  });

  return Object.values(immediateVariationsMap);
};


const Default: React.FC<Props> = ({ data, productId }) => {
  const swiperRef = useRef<SwiperType | null>(null);
  const lightboxSwiperRef = useRef<SwiperType | null>(null);
  const router = useRouter();
  const [photoIndex, setPhotoIndex] = useState(0);
  const [openPopupImg, setOpenPopupImg] = useState(false);
  const [openSizeGuide, setOpenSizeGuide] = useState<boolean>(false);
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);
  const [activeColor, setActiveColor] = useState<string>("");
  const [activeSize] = useState<string>("S/T");
  const [activeTab, setActiveTab] = useState<string | undefined>("description");
  const [variantQuantities, setVariantQuantities] = useState<
    Record<string, string>
  >({});
  const [immediateVariantQuantities, setLocalVariantQuantities] = useState<
    Record<string, string>
  >({});
  const quantityProductIdentityRef = useRef("");
  const restoredQuoteSignatureRef = useRef("");
  const [relatedProducts, setRelatedProducts] = useState<ProductType[]>([]);
  const [commercialCategories, setCommercialCategories] = useState<CommercialCategory[]>([]);
  const [mainGalleryLoaded, setMainGalleryLoaded] = useState<
    Record<string, boolean>
  >({});
  const [thumbGalleryLoaded, setThumbGalleryLoaded] = useState<
    Record<string, boolean>
  >({});
  const [promoVectorLoaded, setPromoVectorLoaded] = useState(false);
  const [lightboxGalleryLoaded, setLightboxGalleryLoaded] = useState<
    Record<string, boolean>
  >({});
  const [failedGalleryImages, setFailedGalleryImages] = useState<
    Record<string, boolean>
  >({});
  const [failedPromoVectorImage, setFailedPromoVectorImage] = useState(false);
  const { addToCart } = useCart();
  const { openModalCart } = useModalCartContext();
  const { addToWishlist, removeFromWishlist, wishlistState } = useWishlist();
  const { openModalWishlist } = useModalWishlistContext();
  const { compareState, addToCompare, removeFromCompare } = useCompare();
  const { openModalCompare } = useModalCompareContext();
  const {
    pathname: catalogPathname,
    search: catalogSearch,
    shouldRestoreScroll,
    markRestoreScroll,
  } = useCatalogStore();
  const {
    productId: flowProductId,
    slug: flowSlug,
    items: flowItems,
    setActiveProduct,
    setQuoteSelection,
    setCurrentStep,
  } = useProductFlowStore();

  const productMain = (data.find((product) => product.id === productId) || data[0]) as ExtendedProductType;

  const currentProvider =
    Array.isArray(productMain?.categories) && productMain.categories.length > 0
      ? String(productMain.categories[0]?.provider || "")
          .trim()
          .toLowerCase()
      : String(productMain?.brand || "")
          .trim()
          .toLowerCase();

  const currentProductId = String(productMain?.id || productMain?.slug || "");
  const currentProductSlug = String(productMain?.slug || productMain?.id || "");
  const features = useMemo(
    () => parseDetailFeatures(productMain?.features),
    [productMain?.features],
  );
  const immediateVariations = useMemo(
    () => buildImmediateVariations(productMain, features, currentProvider),
    [currentProvider, features, productMain],
  );
  const hasImmediateVariations = immediateVariations.length > 0;
  const isGroupedDirectKyte =
    isImmediateProduct(productMain) && immediateVariations.length > 1;
  const activeImmediateVariation =
    immediateVariations.find(
      (variant) => String(variant?.color || "") === activeColor,
    ) || immediateVariations[0];
  const activeDescription = String(
    activeImmediateVariation?.sourceDescription ||
      productMain?.description ||
      productMain?.name ||
      "",
  ).trim();
  const immediateColorLabels = Array.from(
    new Set(
      immediateVariations
        .map((variant) => getColorLabel(variant?.color || ""))
        .filter(Boolean),
    ),
  );


  useEffect(() => {
    if (!currentProductId || !currentProductSlug) return;

    setActiveProduct({
      productId: currentProductId,
      slug: currentProductSlug,
      provider: currentProvider,
    });
    setCurrentStep("detail");
  }, [
    currentProductId,
    currentProductSlug,
    currentProvider,
    setActiveProduct,
    setCurrentStep,
  ]);

  useEffect(() => {
    const quantityProductIdentity = `${currentProductId}::${currentProductSlug}`;
    const sameProduct =
      quantityProductIdentityRef.current === quantityProductIdentity;
    const regularVariations = Array.isArray(productMain?.variation)
      ? (productMain.variation as DetailVariant[]).filter(
          (variant) =>
            resolveDetailVariantProviderCode(
              variant,
              currentProvider,
              isImmediateProduct(productMain),
            ) !== "kyte",
        )
      : [];

    if (
      !productMain ||
      (regularVariations.length === 0 && immediateVariations.length === 0)
    ) {
      setVariantQuantities({});
      setLocalVariantQuantities({});
      quantityProductIdentityRef.current = quantityProductIdentity;
      restoredQuoteSignatureRef.current = "";
      return;
    }

    const firstVariant = regularVariations[0] || immediateVariations[0];
    let nextActiveColor = firstVariant?.color || "";
    let itemsFromReturn: QuoteReturnItem[] =
      flowProductId === currentProductId && flowSlug === currentProductSlug
        ? normalizeQuoteReturnItems(flowItems)
        : [];

    if (typeof window !== "undefined" && itemsFromReturn.length === 0) {
      try {
        const storageKey = `quote-return:${String(productMain?.slug || productMain?.id || "product")}`;
        const storedRaw = window.sessionStorage.getItem(storageKey);

        if (storedRaw) {
          const stored = JSON.parse(storedRaw) as unknown;

          if (isRecord(stored)) {
            itemsFromReturn = normalizeQuoteReturnItems(stored.items);
          }

          window.sessionStorage.removeItem(storageKey);
        }
      } catch {}
    }

    const findMatchedItem = (
      variant: DetailVariant | DetailImmediateVariant,
    ) => {
      const variantSku = String(variant?.sku || "")
        .trim()
        .toUpperCase();
      const variantColor = String(variant?.color || "")
        .trim()
        .toUpperCase();

      return itemsFromReturn.find((item) => {
        const itemSku = String(item?.sku || "")
          .trim()
          .toUpperCase();
        const itemColor = String(item?.color || "")
          .trim()
          .toUpperCase();

        return (
          (itemSku && itemSku === variantSku) ||
          (!itemSku && itemColor && itemColor === variantColor)
        );
      });
    };

    const initialQuantities = regularVariations.reduce(
      (acc: Record<string, string>, variant, index) => {
        const key = String(variant?.sku || variant?.color || index);
        const matchedItem = findMatchedItem(variant);
        const matchedQty = Number(matchedItem?.quantity);

        acc[key] =
          Number.isFinite(matchedQty) && matchedQty > 0
            ? String(Math.floor(matchedQty))
            : "";

        if (matchedItem?.color && !nextActiveColor) {
          nextActiveColor = String(matchedItem.color);
        }

        return acc;
      },
      {},
    );

    const initialImmediateQuantities = immediateVariations.reduce(
      (acc: Record<string, string>, variant, index) => {
        const key = String(
          variant?.localKey ||
            variant?.sku ||
            `${variant?.color || "SIN-COLOR"}-${variant?.size || "-"}-${index}`,
        );
        const matchedItem = findMatchedItem(variant);
        const matchedQty = Number(matchedItem?.quantity);

        acc[key] =
          Number.isFinite(matchedQty) && matchedQty > 0
            ? String(Math.floor(matchedQty))
            : "";

        if (matchedItem?.color && !nextActiveColor) {
          nextActiveColor = String(matchedItem.color);
        }

        return acc;
      },
      {},
    );

    const quoteReturnSignature = itemsFromReturn
      .map((item) =>
        [
          String(item?.sku || "").trim().toUpperCase(),
          String(item?.color || "").trim().toUpperCase(),
          Math.max(0, Math.floor(Number(item?.quantity) || 0)),
        ].join(":"),
      )
      .sort()
      .join("|");
    const shouldRestoreQuoteSelection =
      !sameProduct ||
      (quoteReturnSignature !== "" &&
        restoredQuoteSignatureRef.current !== quoteReturnSignature);
    const clampExistingQuantity = (
      value: string | undefined,
      stock: unknown,
    ) => {
      const parsedQuantity = Math.floor(Number(value));
      const availableStock = Math.max(0, Math.floor(Number(stock) || 0));

      if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) return "";
      if (availableStock <= 0) return "";

      return String(Math.min(parsedQuantity, availableStock));
    };

    const firstSelectedItem = itemsFromReturn.find(
      (item) => Number(item?.quantity) > 0,
    );

    if (firstSelectedItem?.color) {
      nextActiveColor = String(firstSelectedItem.color);
    }

    if (shouldRestoreQuoteSelection) {
      setActiveColor(nextActiveColor);
    }

    setVariantQuantities((current) => {
      if (shouldRestoreQuoteSelection) return initialQuantities;

      return regularVariations.reduce(
        (acc: Record<string, string>, variant, index) => {
          const key = String(variant?.sku || variant?.color || index);
          acc[key] = clampExistingQuantity(
            current[key],
            variant?.stockFisico,
          );
          return acc;
        },
        {},
      );
    });

    setLocalVariantQuantities((current) => {
      if (shouldRestoreQuoteSelection) return initialImmediateQuantities;

      return immediateVariations.reduce(
        (acc: Record<string, string>, variant, index) => {
          const key = String(
            variant?.localKey ||
              variant?.sku ||
              `${variant?.color || "SIN-COLOR"}-${variant?.size || "-"}-${index}`,
          );
          acc[key] = clampExistingQuantity(
            current[key],
            variant?.stockFisico,
          );
          return acc;
        },
        {},
      );
    });

    quantityProductIdentityRef.current = quantityProductIdentity;

    if (quoteReturnSignature !== "") {
      restoredQuoteSignatureRef.current = quoteReturnSignature;
    }
  }, [
    productMain,
    currentProductId,
    currentProductSlug,
    currentProvider,
    flowItems,
    flowProductId,
    flowSlug,
    immediateVariations,
  ]);

  useEffect(() => {
    if (!openPopupImg) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [openPopupImg]);

  useEffect(() => {
    setMainGalleryLoaded({});
    setThumbGalleryLoaded({});
    setLightboxGalleryLoaded({});
    setFailedGalleryImages({});
    setPromoVectorLoaded(false);
    setFailedPromoVectorImage(false);
  }, [currentProductSlug]);

  useEffect(() => {
    let isMounted = true;

    const fetchCommercialCategories = async () => {
      if (!process.env.NEXT_PUBLIC_API_URL) return;

      try {
        const items = await getCommercialCategories<CommercialCategory>();

        if (isMounted) {
          setCommercialCategories(items);
        }
      } catch (error) {
        console.error("Error cargando categorías comerciales:", error);
      }
    };

    fetchCommercialCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  const currentCategories: string[] = useMemo(() => {
    return Array.isArray(productMain?.categories)
      ? productMain.categories
          .map((cat: DetailCategory) => String(cat?.name ?? "").trim())
          .filter((name: string) => name !== "")
      : [];
  }, [productMain?.categories]);

  const productCategoryKeys = Array.isArray(productMain?.categories)
    ? productMain.categories.map((cat: DetailCategory) => ({
        provider: String(cat?.provider || "")
          .trim()
          .toLowerCase(),
        slug: String(cat?.slug || "").trim(),
      }))
    : [];

  const commercialCategory = commercialCategories.find((item) => {
    const matches = Array.isArray(item?.matches) ? item.matches : [];

    return matches.some((match) => {
      const matchProvider = String(match?.provider || "")
        .trim()
        .toLowerCase();
      const matchSlug = String(match?.slug || "").trim();

      return productCategoryKeys.some((cat) => {
        return cat.provider === matchProvider && cat.slug === matchSlug;
      });
    });
  });

  const commercialCategoryName = String(commercialCategory?.label || "").trim();
  const commercialCategorySlug = String(
    commercialCategory?.slug || commercialCategory?.value || "",
  ).trim();
  const categoryName =
    commercialCategoryName ||
    (currentCategories.length > 0 ? currentCategories[0] : "");
  const categoryHref = commercialCategorySlug
    ? `/categoria/${commercialCategorySlug}`
    : "/productos";

  const getProductProvider = (product: ExtendedProductType | null | undefined): string => {
    if (Array.isArray(product?.categories) && product.categories.length > 0) {
      const providerFromCategory = product.categories[0]?.provider;
      if (providerFromCategory)
        return String(providerFromCategory).trim().toLowerCase();
    }

    const slug = String(product?.slug ?? product?.id ?? "")
      .trim()
      .toUpperCase();
    if (slug.startsWith("MAK-")) return "makito";

    const brand = String(product?.brand ?? "")
      .trim()
      .toUpperCase();
    if (brand === "PROMO" || brand === "PREMIUM") return "promo";
    if (brand === "MAKITO" || brand === "ECOLINE") return "makito";
    if (brand === "LOCAL" || brand === "KYTE") return "kyte";

    return "";
  };

  useEffect(() => {
    const mainKeys = new Set(
      [currentProductId, currentProductSlug]
        .map((value) => String(value || "").trim())
        .filter(Boolean),
    );
    const usedKeys = new Set<string>();

    const resolved = data
      .slice(1)
      .filter((item: ExtendedProductType) => {
        const itemId = String(item?.id || "").trim();
        const itemSlug = String(item?.slug || "").trim();
        const itemKey = itemSlug || itemId;

        if (!itemKey) return false;
        if (mainKeys.has(itemId) || mainKeys.has(itemSlug)) return false;
        if (usedKeys.has(itemKey)) return false;

        usedKeys.add(itemKey);
        return true;
      })
      .slice(0, 4);

    setRelatedProducts(resolved);
  }, [data, currentProductId, currentProductSlug]);

  if (!productMain) return null;

  const detailProvider = getProductProvider(productMain);
  const isMakito = detailProvider === "makito";
  const mainProvider = String(
    productMain?.brand ||
      productMain?.categories?.[0]?.provider ||
      detailProvider ||
      "",
  )
    .trim()
    .toLowerCase();
  const view360Url = typeof features?.view_360 === "string" ? features.view_360 : "";

  const detailProductName = isImmediateProduct(productMain)
    ? cleanImmediateProductName(productMain?.name)
    : productMain?.name;

  const promoImages = features?._promoImages || {};
  const promoMainImages = Array.isArray(promoImages?.mainImages)
    ? promoImages.mainImages.filter(isNonEmptyString)
    : [];
  const promoVariantImages = Array.isArray(promoImages?.variantImages)
    ? promoImages.variantImages.filter(isNonEmptyString)
    : [];
  const promoVectorImages = Array.isArray(promoImages?.vectorImages)
    ? promoImages.vectorImages.filter(isNonEmptyString)
    : [];

  const fallbackImage = appAsset('/images/product-placeholder.webp');
  const isDirectKyte = Boolean(features?._isDirectKyte);

  const isKnownPlaceholderImage = (url: unknown) => {
    if (typeof url !== "string") return false;

    const normalized = url
      .trim()
      .toLowerCase()
      .split("#")[0]
      .split("?")[0];

    return (
      normalized.endsWith("/images/product-placeholder.webp") ||
      normalized.includes("via.placeholder.com/")
    );
  };

  const normalizeGalleryImage = (url: unknown) => {
    if (typeof url !== "string") return "";

    const cleanUrl = url.trim();

    if (!cleanUrl || cleanUrl.includes("/areas/")) return "";
    if (isDirectKyte && isKnownPlaceholderImage(cleanUrl)) return "";

    return cleanUrl;
  };

  const imagekitCatalogMain = normalizeGalleryImage(
    features?.imagekit?.catalog?.main,
  );
  const imagekitCatalogHover = normalizeGalleryImage(
    features?.imagekit?.catalog?.hover,
  );

  const imagekitRawImages = Array.isArray(features?.imagekit?.images)
    ? features.imagekit.images
    : [];

  const thumbGalleryImages = Array.isArray(productMain?.thumbImage)
    ? productMain.thumbImage.map(normalizeGalleryImage).filter(isNonEmptyString)
    : [];

  const imagekitGalleryImages = Array.from(
    new Set(
      [
        imagekitCatalogMain,
        imagekitCatalogHover,
        ...imagekitRawImages.map(normalizeGalleryImage),
        ...thumbGalleryImages,
      ].filter(isNonEmptyString),
    ),
  );

  const originalGalleryImages = Array.isArray(productMain?.images)
    ? productMain.images.map(normalizeGalleryImage).filter(isNonEmptyString)
    : [];

  const kyteVariantGalleryImages = isDirectKyte
    ? immediateVariations
        .flatMap((variant) => [variant?.image, variant?.colorImage])
        .map(normalizeGalleryImage)
        .filter(isNonEmptyString)
    : [];

  const makitoGalleryImages =
    imagekitGalleryImages.length > 0
      ? imagekitGalleryImages
      : originalGalleryImages;

  const getGalleryFallbackImage = (currentImage: string, index: number) => {
    const originalByIndex = originalGalleryImages[index];

    if (
      currentImage !== originalByIndex &&
      originalByIndex &&
      originalByIndex !== fallbackImage &&
      !isKnownPlaceholderImage(originalByIndex)
    ) {
      return originalByIndex;
    }

    return fallbackImage;
  };

  const isSameImageSource = (currentSrc: string, targetSrc: string) => {
    const decodedCurrentSrc = decodeURIComponent(String(currentSrc || ""));
    const decodedTargetSrc = decodeURIComponent(String(targetSrc || ""));

    return (
      decodedCurrentSrc === decodedTargetSrc ||
      decodedCurrentSrc.includes(decodedTargetSrc)
    );
  };

  const handleGalleryImageError = (
    event: React.SyntheticEvent<HTMLImageElement, Event>,
    item: string,
    index: number,
    loadedSetter: React.Dispatch<React.SetStateAction<Record<string, boolean>>>,
  ) => {
    const fallbackSrc = getGalleryFallbackImage(item, index);
    const currentSrc =
      event.currentTarget.currentSrc || event.currentTarget.src || "";

    if (
      fallbackSrc &&
      fallbackSrc !== fallbackImage &&
      !isSameImageSource(currentSrc, fallbackSrc)
    ) {
      event.currentTarget.src = fallbackSrc;
      return;
    }

    event.currentTarget.src = fallbackImage;

    setFailedGalleryImages((prev) => ({
      ...prev,
      [item]: true,
    }));

    loadedSetter((prev) => ({
      ...prev,
      [item]: true,
    }));
  };

  const galleryImages: string[] = Array.from(
    new Set<string>(
      (isMakito
        ? makitoGalleryImages
        : [
            ...promoMainImages,
            ...promoVariantImages,
            ...originalGalleryImages,
            ...kyteVariantGalleryImages,
          ]
      )
        .map(normalizeGalleryImage)
        .filter(isNonEmptyString),
    ),
  ).slice(0, 12);

  const safeGalleryImages =
    galleryImages.length > 0 ? galleryImages : [fallbackImage];
  const hasMultipleGalleryImages = safeGalleryImages.length > 1;
  const isFallbackGallery = galleryImages.length === 0;

  const rawPrintAreas = Array.isArray(features?.print_areas)
    ? features.print_areas
    : typeof features?.print_areas === "string"
      ? (() => {
          try {
            const parsed = JSON.parse(features.print_areas) as unknown;
            return Array.isArray(parsed) ? parsed : [];
          } catch {
            return [];
          }
        })()
      : [];

  const groupedPrintAreas = (rawPrintAreas as PrintAreaRaw[]).reduce(
    (acc: Record<string, PrintAreaGroup>, item: PrintAreaRaw) => {
      const key = String(item?.area_img || "").trim();
      if (!key) return acc;

      if (!acc[key]) {
        acc[key] = {
          area_img: key,
          width: Number(item?.width) || 0,
          height: Number(item?.height) || 0,
          techniques: [],
        };
      }

      const techniqueName = String(
        item?.technique_name || "Sin técnica",
      ).trim();
      const maxColors = Number(item?.max_colors) || 0;
      const exists = acc[key].techniques.some(
        (tech: PrintTechnique) =>
          tech.technique_name === techniqueName &&
          tech.max_colors === maxColors,
      );

      if (!exists) {
        acc[key].techniques.push({
          technique_name: techniqueName,
          max_colors: maxColors,
        });
      }

      return acc;
    },
    {},
  );

  const printAreasList: PrintAreaGroup[] = Object.values(groupedPrintAreas);
  const printAreasCount = printAreasList.length;
  const printCode = String(features?.printcode || "").trim();
  const makitoCode = String(productMain?.slug || "")
    .replace(/^MAK-/i, "")
    .trim();

  const getAreaImageUrl = (areaImg: string) => {
    const cleanAreaImg = String(areaImg || "").trim();
    if (!cleanAreaImg || !makitoCode) return "";
    return `https://imgresources.makito.es/media/img_web/1000/${makitoCode}/areas/${cleanAreaImg}`;
  };

  const formatMeasureMm = (value: number) => {
    const n = Number(value) || 0;
    return n * 10;
  };

  const hasValue = (value: unknown) =>
    value !== null &&
    value !== undefined &&
    value !== "" &&
    Number(value) !== 0;

  const getPackagingTypeLabel = (type: unknown) => {
    const normalized = String(type ?? "").trim();
    if (normalized === "2004") return "Bolsa";
    if (normalized === "2001") return "Caja";
    return normalized;
  };

  const articleDimensions = [
    features?.length,
    features?.height,
    features?.width,
  ]
    .filter((value: unknown) => String(value ?? "").trim() !== "")
    .join(" x ");

  const packagingFinalText = String(features?.pf_description || "").trim();
  const packagingIntermedio1Text =
    hasValue(features?.pi1_units) && hasValue(features?.pi1_type)
      ? `${features.pi1_units} pcs/${getPackagingTypeLabel(features.pi1_type)}`
      : "";
  const packagingIntermedio2Text =
    hasValue(features?.pi2_units) && hasValue(features?.pi2_type)
      ? `${features.pi2_units} pcs/${getPackagingTypeLabel(features.pi2_type)}`
      : "";

  const promoCapacity = String(features?.capacity ?? "").trim();
  const promoPrintingArea = String(features?.printing?.printArea ?? "").trim();
  const promoPrintingTechnique = String(
    features?.printing?.printTechnique ?? "",
  ).trim();
  const promoVectorImage = promoVectorImages[0] || "";

  const promoPackageDimensions = features?.package?.dimensions || {};
  const promoPackageWeight = features?.package?.weight || {};
  const promoPackageUnits = features?.package?.units || {};

  const promoMeasurePackagingText = [
    hasValue(promoPackageDimensions?.lengthInCentimeters)
      ? String(promoPackageDimensions.lengthInCentimeters)
      : "",
    hasValue(promoPackageDimensions?.heightInCentimeters)
      ? String(promoPackageDimensions.heightInCentimeters)
      : "",
    hasValue(promoPackageDimensions?.widthInCentimeters)
      ? String(promoPackageDimensions.widthInCentimeters)
      : "",
  ]
    .filter(Boolean)
    .join(" x ");

  const promoWeightText = hasValue(promoPackageWeight?.grossWeight)
    ? `${promoPackageWeight.grossWeight} KGS`
    : "";

  const promoPiecesPerBox = hasValue(promoPackageUnits?.piecesPerBox)
    ? `${promoPackageUnits.piecesPerBox} pza(s)`
    : "";

  const promoIndividualBox = String(
    features?.package?.individualBox ?? "",
  ).trim();

  const activeImmediatePrice = Number(
    activeImmediateVariation?.base_price ?? 0,
  );
  const showPrice = false;
  const formattedImmediatePrice = showPrice
    ? `C$ ${activeImmediatePrice.toLocaleString("es-NI", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`
    : "";

  const handleCloseLightbox = () => {
    setOpenPopupImg(false);
  };

  const handleCloseSizeGuide = () => {
    setOpenSizeGuide(false);
  };

  const handleSwiper = (swiper: SwiperType) => {
    setThumbsSwiper(swiper);
  };

  const handleActiveColor = (item: string) => {
    setActiveColor(item);
  };

  const handleImmediateVariantFocus = (variant: DetailImmediateVariant) => {
    handleActiveColor(String(variant?.color || ""));

    const targetImage = normalizeGalleryImage(
      variant?.image || variant?.colorImage || "",
    );

    if (!targetImage) return;

    const targetIndex = safeGalleryImages.findIndex((galleryImage) =>
      isSameImageSource(galleryImage, targetImage) ||
      isSameImageSource(targetImage, galleryImage),
    );

    if (targetIndex < 0) return;

    setPhotoIndex(targetIndex);
    swiperRef.current?.slideTo(targetIndex);
  };

  const syncImmediateVariantFromGallery = (index: number) => {
    const galleryImage = safeGalleryImages[index];

    if (!galleryImage) return;

    const matchingVariant = immediateVariations.find((variant) => {
      const variantImage = normalizeGalleryImage(
        variant?.image || variant?.colorImage || "",
      );

      return Boolean(
        variantImage &&
          (isSameImageSource(galleryImage, variantImage) ||
            isSameImageSource(variantImage, galleryImage)),
      );
    });

    if (matchingVariant) {
      setActiveColor(String(matchingVariant?.color || ""));
    }
  };

  const handleActiveTab = (tab: string) => {
    setActiveTab(tab);
  };

  const getVariantKey = (variant: DetailVariant, index: number) =>
    String(variant?.sku || variant?.color || index);

  const getImmediateVariantKey = (variant: DetailImmediateVariant, index: number) =>
    String(
      variant?.localKey ||
        variant?.sku ||
        `${variant?.color || "SIN-COLOR"}-${variant?.size || "-"}-${index}`,
    );

  const getVariantQuantity = (variant: DetailVariant, index: number) => {
    const key = getVariantKey(variant, index);
    const raw = variantQuantities[key];
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 0;
  };

  const getVariantProviderCode = (
    variant: DetailVariant | DetailImmediateVariant,
  ) =>
    resolveDetailVariantProviderCode(
      variant,
      currentProvider || detailProvider || mainProvider,
      isImmediateProduct(productMain),
    );

  const getExternalAvailabilityBlock = (variant: DetailVariant): ExternalAvailabilityBlock => {
    const providerCode = getVariantProviderCode(variant);

    if (providerCode === "makito") {
      return {
        key: "makito",
        title: "Disponibilidad 15 a 20 días",
        subtitle: "",
      };
    }

    if (providerCode === "promo") {
      return {
        key: "promo",
        title: "Disponibilidad 10 a 15 días",
        subtitle: "",
      };
    }

    const label = String(
      variant?.disponibilidadLabel || variant?.fechaLlegada || "",
    ).trim();

    return {
      key: providerCode || label || "proveedor",
      title: label ? `Disponibilidad ${label}` : "Disponibilidad de proveedor",
      subtitle: "",
    };
  };

  const externalVariationItems = Array.isArray(productMain?.variation)
    ? productMain.variation
        .map((variant: DetailVariant, index: number): ExternalVariationItem => ({ variant, index }))
        .filter(({ variant }) => !isImmediateProviderCode(getVariantProviderCode(variant)))
    : [];

  const externalAvailabilityGroupsMap = externalVariationItems.reduce(
    (groups: Record<string, ExternalAvailabilityGroup>, item: ExternalVariationItem) => {
      const block = getExternalAvailabilityBlock(item.variant);

      if (!groups[block.key]) {
        groups[block.key] = {
          ...block,
          items: [],
        };
      }

      groups[block.key].items.push(item);

      return groups;
    },
    {},
  );

  const externalAvailabilityGroupOrder = ["makito", "promo"];
  const orderedExternalAvailabilityGroups = Object.values(
    externalAvailabilityGroupsMap,
  ).sort((groupA, groupB) => {
    const indexA = externalAvailabilityGroupOrder.indexOf(groupA.key);
    const indexB = externalAvailabilityGroupOrder.indexOf(groupB.key);

    if (indexA === -1 && indexB === -1) {
      return String(groupA.title).localeCompare(String(groupB.title));
    }

    if (indexA === -1) return 1;
    if (indexB === -1) return -1;

    return indexA - indexB;
  });

  const updateVariantQuantity = (
    variant: DetailVariant,
    index: number,
    nextValue: string | number,
  ) => {
    const key = getVariantKey(variant, index);
    const stock = Math.max(0, Number(variant?.stockFisico) || 0);

    if (nextValue === "") {
      setVariantQuantities((prev) => ({ ...prev, [key]: "" }));
      return;
    }

    let nextNumber = Number(nextValue);
    if (!Number.isFinite(nextNumber)) return;

    nextNumber = Math.floor(nextNumber);
    if (nextNumber < 0) nextNumber = 0;
    if (stock > 0 && nextNumber > stock) nextNumber = stock;
    if (stock === 0) nextNumber = 0;

    setVariantQuantities((prev) => ({ ...prev, [key]: String(nextNumber) }));
  };

  const getImmediateVariantQuantity = (variant: DetailImmediateVariant, index: number) => {
    const key = getImmediateVariantKey(variant, index);
    const raw = immediateVariantQuantities[key];
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 0;
  };

  const updateLocalVariantQuantity = (
    variant: DetailImmediateVariant,
    index: number,
    nextValue: string | number,
  ) => {
    const key = getImmediateVariantKey(variant, index);
    const stock = Math.max(0, Number(variant?.stockFisico) || 0);

    if (nextValue === "") {
      setLocalVariantQuantities((prev) => ({ ...prev, [key]: "" }));
      return;
    }

    let nextNumber = Number(nextValue);
    if (!Number.isFinite(nextNumber)) return;

    nextNumber = Math.floor(nextNumber);
    if (nextNumber < 0) nextNumber = 0;
    if (stock > 0 && nextNumber > stock) nextNumber = stock;
    if (stock === 0) nextNumber = 0;

    setLocalVariantQuantities((prev) => ({
      ...prev,
      [key]: String(nextNumber),
    }));
  };

  const selectedRegularVariants: SelectedVariantItem[] = Array.isArray(productMain?.variation)
    ? productMain.variation
        .map((variant: DetailVariant, index: number) => ({
          variant,
          index,
          quantity: getVariantQuantity(variant, index),
          source: "regular" as const,
        }))
        .filter(
          (item) =>
            !isImmediateProviderCode(getVariantProviderCode(item.variant)) &&
            item.quantity > 0,
        )
    : [];

  const selectedImmediateVariants: SelectedVariantItem[] = immediateVariations
    .map((variant: DetailImmediateVariant, index: number) => ({
      variant,
      index,
      quantity: getImmediateVariantQuantity(variant, index),
      source: "immediate" as const,
    }))
    .filter((item) => item.quantity > 0);

  const selectedItems: SelectedVariantItem[] = [
    ...selectedRegularVariants,
    ...selectedImmediateVariants,
  ];

  // El detalle mantiene dos caminos:
  // 1) cotización directa del producto seleccionado;
  // 2) agregar varias variantes al carrito de cotización.
  const showCartActions = true;

  const selectedVariantsCount = selectedItems.length;
  const totalSelectedUnits = selectedItems.reduce(
    (sum: number, item: SelectedVariantItem) => sum + item.quantity,
    0,
  );
  const canSubmitSelections = selectedVariantsCount > 0;

  const handleAddToCart = () => {
    if (!canSubmitSelections) return;

    selectedItems.forEach(({ variant, index, quantity, source }) => {
      const sku = String(
        variant?.sku ||
          (source === "immediate"
            ? getImmediateVariantKey(variant, index)
            : getVariantKey(variant, index)),
      );

      const selectedColor = String(variant?.color || "");
      const selectedSize = String(variant?.size || activeSize || "S/T");

      const selectedVariation = [variant];

      const productToAdd = {
        ...productMain,
        id: sku,
        quantity,
        quantityPurchase: quantity,
        selectedSize,
        selectedColor,
        variation: selectedVariation,
        cartImage: getCartItemImage({
          ...productMain,
          variation: selectedVariation,
        }),
        providerType: source,
        isImmediateVariant: source === "immediate",
      };

      addToCart(productToAdd as Parameters<typeof addToCart>[0]);
    });

    openModalCart();
  };

  const handleAddToWishlist = () => {
    if (
      wishlistState.wishlistArray.some((item) => item.id === productMain.id)
    ) {
      removeFromWishlist(productMain.id);
    } else {
      addToWishlist(productMain);
    }
    openModalWishlist();
  };

  const isCompared = compareState.compareArray.some(
    (item) => String(item.id) === String(productMain.id),
  );

  const handleCompareProduct = () => {
    if (isCompared) {
      removeFromCompare(productMain.id);
      openModalCompare();
      return;
    }

    if (compareState.compareArray.length >= 3) {
      openModalCompare();
      return;
    }

    addToCompare(productMain);
    openModalCompare();
  };

  const handleGoToQuote = () => {
    if (!canSubmitSelections) return;

    const slug = String(productMain?.slug || "");

    const items = selectedItems.map(
      ({ variant, index, quantity, source }) => ({
        sku: String(
          variant?.sku ||
            (source === "immediate"
              ? getImmediateVariantKey(variant, index)
              : getVariantKey(variant, index)),
        ),
        color: String(variant?.color || ""),
        size: String(variant?.size || "S/T"),
        quantity,
        stockFisico: Number(variant?.stockFisico) || 0,
        stockTransito: Number(variant?.stockTransito) || 0,
        fechaLlegada: String(variant?.fechaLlegada || ""),
        image: String(variant?.image || variant?.colorImage || ""),
        colorImage: String(variant?.colorImage || variant?.image || ""),
        providerCode: String(variant?.providerCode || currentProvider || ""),
        providerName: String(variant?.providerName || ""),
        productVariantId:
          variant?.immediateVariantId ??
          variant?.variantId ??
          null,
        stockControlled:
          typeof variant?.stockControlled === "boolean"
            ? variant.stockControlled
            : null,
        stockStatus: String(variant?.stockStatus || "") || null,
        source,
        isImmediateVariant: source === "immediate",
      }),
    );

    setQuoteSelection({
      productId: currentProductId,
      slug,
      provider: currentProvider,
      quantity: totalSelectedUnits,
      items,
    });

    router.push(`/cotizar/${slug}`);
  };

  const handleBackToCatalog = () => {
    const nextPath = catalogPathname || "/productos";
    const nextSearch = catalogSearch || "";

    // Si este detalle se abrió desde una card del catálogo, la ruta anterior
    // ya vive en el historial/router cache de Next. Volver en lugar de hacer
    // un push nuevo evita reconstruir perceptiblemente el catálogo.
    if (
      shouldRestoreScroll &&
      typeof window !== "undefined" &&
      window.history.length > 1
    ) {
      router.back();
      return;
    }

    // Acceso directo al producto (Google, favoritos, enlace externo, etc.).
    // En ese caso no confiamos en el historial y usamos el catálogo guardado.
    markRestoreScroll(true);
    router.push(`${nextPath}${nextSearch}`, { scroll: false });
  };

  return (
    <>
      <div className="product-detail default bg-[#F5F9FB] text-[#1F2E53]">
        <div className="featured-product py-8 md:py-12 lg:py-14">
          <div className="container grid grid-cols-1 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] items-start gap-8 lg:gap-10 xl:gap-12">
            <div className="list-img w-full min-w-0 lg:pr-2 xl:pr-6 self-start">
              <Swiper
                onSwiper={(Swiper) => {
                  swiperRef.current = Swiper;
                }}
                onSlideChange={(swiper) => {
                  setPhotoIndex(swiper.activeIndex);
                  syncImmediateVariantFromGallery(swiper.activeIndex);
                }}
                slidesPerView={1}
                spaceBetween={0}
                thumbs={
                  hasMultipleGalleryImages &&
                  thumbsSwiper &&
                  !thumbsSwiper.destroyed
                    ? { swiper: thumbsSwiper }
                    : undefined
                }
                modules={[Thumbs]}
                className="mySwiper2 overflow-hidden rounded-[28px] border border-[#DCE6EA] bg-white shadow-[0_14px_40px_rgba(31,46,83,.07)]"
              >
                {safeGalleryImages.map((item: string, index: number) => (
                  <SwiperSlide
                    key={index}
                    onClick={() => {
                      setPhotoIndex(index);
                      setOpenPopupImg(true);
                    }}
                    className="cursor-zoom-in"
                  >
                    <div className="relative w-full aspect-[4/4.6] lg:aspect-[4/4.8] overflow-hidden rounded-[28px] bg-white p-3 sm:p-5">
                      {!isFallbackGallery && !mainGalleryLoaded[item] && (
                        <div className="absolute inset-0 z-10 animate-pulse bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100" />
                      )}

                      <Image
                        src={
                          failedGalleryImages[item]
                            ? getGalleryFallbackImage(item, index)
                            : item
                        }
                        width={1000}
                        height={1000}
                        alt={detailProductName || "Imagen del producto"}
                        priority={index === 0}
                        unoptimized={shouldBypassNextImageOptimization(item)}
                        loading={index === 0 ? "eager" : "lazy"}
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        onLoad={() =>
                          setMainGalleryLoaded((prev) => ({
                            ...prev,
                            [item]: true,
                          }))
                        }
                        onError={(event) =>
                          handleGalleryImageError(
                            event,
                            item,
                            index,
                            setMainGalleryLoaded,
                          )
                        }
                        className={`w-full h-full object-contain bg-white rounded-[22px] transition-all duration-300 ${
                          isFallbackGallery || mainGalleryLoaded[item]
                            ? "opacity-100"
                            : "opacity-0"
                        }`}
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>

              {hasMultipleGalleryImages && (
                <div className="thumbs-container relative mt-4 sm:mt-5">
                  <button
                    className="thumbs-nav thumbs-prev"
                    type="button"
                    aria-label="Anterior"
                  />
                  <button
                    className="thumbs-nav thumbs-next"
                    type="button"
                    aria-label="Siguiente"
                  />
                  <Swiper
                    navigation={{
                      prevEl: ".thumbs-prev",
                      nextEl: ".thumbs-next",
                    }}
                    onBeforeInit={(swiper) => {
                      const navigation = swiper.params.navigation;
                      if (navigation && typeof navigation !== "boolean") {
                        navigation.prevEl = ".thumbs-prev";
                        navigation.nextEl = ".thumbs-next";
                      }
                    }}
                    onSwiper={(swiper) => {
                      handleSwiper(swiper);
                    }}
                    spaceBetween={12}
                    slidesPerView={2.4}
                    breakpoints={{
                      480: { slidesPerView: 3 },
                      640: { slidesPerView: 4 },
                      1024: { slidesPerView: 4 },
                    }}
                    freeMode={true}
                    watchSlidesProgress={true}
                    modules={[Navigation, Thumbs, FreeMode]}
                    className="mySwiper"
                  >
                    {safeGalleryImages.map((item: string, index: number) => (
                      <SwiperSlide key={index} className="!h-auto">
                        <button
                          type="button"
                          onClick={() => {
                            setPhotoIndex(index);
                            syncImmediateVariantFromGallery(index);
                            swiperRef.current?.slideTo(index);
                          }}
                          className={`relative w-full aspect-[4/4.6] overflow-hidden rounded-xl border bg-[#f3f4f6] ${
                            photoIndex === index
                              ? "border-[#21577B] ring-2 ring-[#21577B]/10"
                              : "border-[#DCE6EA] hover:border-[#38A0A2]"
                          }`}
                        >
                          {!thumbGalleryLoaded[item] && (
                            <div className="absolute inset-0 z-10 animate-pulse bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100" />
                          )}

                          <Image
                            src={
                              failedGalleryImages[item]
                                ? getGalleryFallbackImage(item, index)
                                : item
                            }
                            width={500}
                            height={500}
                            alt={detailProductName || "Miniatura del producto"}
                            loading="lazy"
                            unoptimized={shouldBypassNextImageOptimization(item)}
                            sizes="(max-width: 640px) 25vw, 120px"
                            onLoad={() =>
                              setThumbGalleryLoaded((prev) => ({
                                ...prev,
                                [item]: true,
                              }))
                            }
                            onError={(event) =>
                              handleGalleryImageError(
                                event,
                                item,
                                index,
                                setThumbGalleryLoaded,
                              )
                            }
                            className={`w-full h-full object-contain rounded-xl bg-white transition-opacity duration-300 ${
                              thumbGalleryLoaded[item]
                                ? "opacity-100"
                                : "opacity-0"
                            }`}
                          />
                        </button>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>
              )}
            </div>

            <div className="product-infor w-full min-w-0 rounded-[28px] border border-[#DCE6EA] bg-white p-5 shadow-[0_14px_40px_rgba(31,46,83,.07)] sm:p-6 lg:p-7 xl:p-8">
              <div className="mb-6">
                <button
                  type="button"
                  onClick={handleBackToCatalog}
                  className="inline-flex items-center gap-2 rounded-full bg-[#21577B]/8 px-3 py-2 text-xs font-extrabold uppercase tracking-[.08em] text-[#21577B] transition hover:bg-[#21577B] hover:text-white group"
                >
                  <Icon.CaretLeft
                    size={16}
                    weight="bold"
                    className="group-hover:-translate-x-1 duration-300"
                  />
                  <span className="caption1 font-bold uppercase tracking-wider">
                    Regresar al Catálogo
                  </span>
                </button>
              </div>

              <div className="flex justify-between gap-4">
                <div className="min-w-0">
                  <h1 className="break-words text-3xl font-black leading-tight text-[#1F2E53] md:text-4xl">
                    {detailProductName}
                  </h1>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    className={`grid h-11 w-11 place-items-center rounded-full border transition ${
                      wishlistState.wishlistArray.some((item) => item.id === productMain.id)
                        ? "border-[#21577B] bg-[#21577B] text-white"
                        : "border-[#DCE6EA] bg-white text-[#1F2E53] hover:border-[#21577B] hover:text-[#21577B]"
                    }`}
                    onClick={handleAddToWishlist}
                    aria-label="Guardar en favoritos"
                    title="Favoritos"
                  >
                    <Icon.Heart
                      size={20}
                      weight={
                        wishlistState.wishlistArray.some((item) => item.id === productMain.id)
                          ? "fill"
                          : "regular"
                      }
                    />
                  </button>

                  <button
                    type="button"
                    className={`grid h-11 w-11 place-items-center rounded-full border transition ${
                      isCompared
                        ? "border-[#38A0A2] bg-[#38A0A2] text-white"
                        : "border-[#DCE6EA] bg-white text-[#1F2E53] hover:border-[#38A0A2] hover:text-[#38A0A2]"
                    }`}
                    onClick={handleCompareProduct}
                    aria-label="Comparar producto"
                    title="Comparar"
                  >
                    {isCompared ? (
                      <Icon.CheckCircle size={20} weight="fill" />
                    ) : (
                      <Icon.ArrowsCounterClockwise size={20} weight="bold" />
                    )}
                  </button>
                </div>
              </div>

              <div className="mt-5 border-b border-[#E7EEF1] pb-6">
                {showPrice && (
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="product-price heading5">
                      {formattedImmediatePrice}
                    </div>
                  </div>
                )}

                <div
                  className={`flex flex-wrap items-center gap-3 ${showPrice ? "mt-3" : "mt-0"}`}
                >
                  {categoryName ? (
                    <div>
                      <span className="text-sm text-text-secondary">
                        Categoría:{" "}
                      </span>
                      <Link
                        href={categoryHref}
                        className="text-sm font-extrabold text-[#21577B] underline-offset-4 duration-300 hover:text-[#38A0A2] hover:underline"
                      >
                        {categoryName}
                      </Link>
                    </div>
                  ) : null}

                  <Link
                    href="/productos"
                    className="inline-flex items-center gap-1 text-sm font-extrabold text-[#38A0A2] duration-300 hover:gap-2 hover:text-[#21577B]"
                  >
                    Ver catálogo
                    <Icon.ArrowRight size={16} />
                  </Link>
                </div>
              </div>

              <div className="list-action mt-6 w-full max-w-none xl:max-w-[760px]">
                <div className="inventory-table mt-2">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                    <div>
                      <div className="text-xs font-extrabold uppercase tracking-[.14em] text-[#38A0A2]">Disponibilidad</div>
                      <div className="mt-1 text-lg font-black text-[#1F2E53]">Disponibilidad por variante</div>
                    </div>
                    {canSubmitSelections && (
                      <div className="text-sm text-text-secondary">
                        {selectedVariantsCount} variante
                        {selectedVariantsCount > 1 ? "s" : ""} seleccionada
                        {selectedVariantsCount > 1 ? "s" : ""} ·{" "}
                        {totalSelectedUnits} unidad
                        {totalSelectedUnits > 1 ? "es" : ""}
                      </div>
                    )}
                  </div>

                  <div className="overflow-hidden rounded-[20px] border border-[#DCE6EA] bg-white shadow-[0_8px_24px_rgba(31,46,83,.05)]">
                    {hasImmediateVariations && (
                      <div className="border-t border-[#DCE6EA]">
                        <div className="px-4 py-3 text-sm font-semibold text-black bg-[#EEF5F7]">
                          Disponibilidad inmediata
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full min-w-full table-fixed text-left text-xs sm:text-sm">
                            <thead className="bg-white">
                              <tr>
                                <th className="w-[30%] sm:w-[32%] px-2 sm:px-4 py-3 font-semibold text-text-secondary border-b border-[#DCE6EA]">
                                  Color
                                </th>
                                <th className="w-[15%] sm:w-[12%] px-2 sm:px-4 py-3 font-semibold text-text-secondary border-b border-[#DCE6EA] text-center">
                                  Talla
                                </th>
                                <th className="w-[18%] sm:w-[15%] px-2 sm:px-4 py-3 font-semibold text-text-secondary border-b border-[#DCE6EA] text-right">
                                  Existencias
                                </th>
                                <th className="w-[20%] sm:w-[15%] px-2 sm:px-4 py-3 font-semibold text-text-secondary border-b border-[#DCE6EA] text-right">
                                  Precio
                                </th>
                                <th className="hidden sm:table-cell w-[16%] px-2 sm:px-4 py-3 font-semibold text-text-secondary border-b border-[#DCE6EA] text-center">
                                  Disponibilidad
                                </th>
                                <th className="w-[30%] sm:w-[18%] px-2 sm:px-4 py-3 font-semibold text-text-secondary border-b border-[#DCE6EA] text-center">
                                  Cantidad
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-line bg-white">
                              {immediateVariations.map(
                                (variant: DetailImmediateVariant, index: number) => {
                                  const variantKey = getImmediateVariantKey(
                                    variant,
                                    index,
                                  );
                                  const stockFisico =
                                    Number(variant?.stockFisico) || 0;
                                  const variantPrice = Number(
                                    variant?.base_price ?? 0,
                                  );
                                  const formattedVariantPrice =
                                    Number.isFinite(variantPrice) && variantPrice > 1
                                      ? `C$ ${variantPrice.toLocaleString("es-NI", {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                        })}`
                                      : "—";
                                  const quantityValue =
                                    immediateVariantQuantities[variantKey] ?? "";
                                  const isSelected =
                                    getImmediateVariantQuantity(variant, index) > 0;
                                  const availabilityLabel =
                                    stockFisico > 0
                                      ? "Inmediata"
                                      : variant?.fechaLlegada || "Sin stock";

                                  return (
                                    <tr
                                      key={variantKey}
                                      onClick={() =>
                                        handleImmediateVariantFocus(variant)
                                      }
                                      className={`transition-colors cursor-pointer ${isSelected ? "bg-black/[0.02]" : "hover:bg-[#EEF5F7]"}`}
                                    >
                                      <td className="px-2 sm:px-4 py-3">
                                        <div className="flex items-center gap-2 sm:gap-3">
                                          <span
                                            className="block h-4 w-4 rounded-full"
                                            style={getColorSwatchStyle(
                                              variant?.color,
                                            )}
                                          />
                                          <div>
                                            <div className="font-medium text-black text-[0.65rem] sm:text-sm">
                                              {getColorLabel(variant?.color)}
                                            </div>
                                            
                                          </div>
                                        </div>
                                      </td>
                                      <td className="px-2 sm:px-4 py-3 text-center text-black">
                                        {variant?.size || "-"}
                                      </td>
                                      <td
                                        className={`px-2 sm:px-4 py-3 text-right font-bold ${stockFisico > 0 ? "text-primary-dark-600" : "text-danger-500"}`}
                                      >
                                        {formatStockNumber(stockFisico)}
                                      </td>
                                      <td className="px-2 sm:px-4 py-3 text-right font-semibold text-black whitespace-nowrap">
                                        {formattedVariantPrice}
                                      </td>
                                      <td className="hidden sm:table-cell px-2 sm:px-4 py-3 text-center text-black">
                                        {availabilityLabel}
                                      </td>
                                      <td className="px-2 sm:px-4 py-3">
                                        <div className="mx-auto flex w-full max-w-[108px] items-center justify-between rounded-lg border border-[#DCE6EA] px-2 py-1.5">
                                          <button
                                            type="button"
                                            onClick={() =>
                                              updateLocalVariantQuantity(
                                                variant,
                                                index,
                                                Math.max(
                                                  0,
                                                  getImmediateVariantQuantity(
                                                    variant,
                                                    index,
                                                  ) - 1,
                                                ),
                                              )
                                            }
                                            className={`flex h-6 w-6 items-center justify-center ${getImmediateVariantQuantity(variant, index) <= 0 ? "opacity-30 cursor-not-allowed pointer-events-none" : "cursor-pointer"}`}
                                          >
                                            <Icon.Minus size={16} />
                                          </button>

                                          <input
                                            type="number"
                                            min={0}
                                            max={Math.max(0, stockFisico)}
                                            value={quantityValue}
                                            onChange={(e) =>
                                              updateLocalVariantQuantity(
                                                variant,
                                                index,
                                                e.target.value,
                                              )
                                            }
                                            onBlur={() => {
                                              const nextValue =
                                                immediateVariantQuantities[
                                                  variantKey
                                                ];
                                              if (nextValue === "") return;
                                              updateLocalVariantQuantity(
                                                variant,
                                                index,
                                                nextValue,
                                              );
                                            }}
                                            className="w-12 bg-transparent text-center font-semibold outline-none border-0 ring-0 focus:ring-0 focus:outline-none"
                                            placeholder="0"
                                            disabled={stockFisico <= 0}
                                          />

                                          <button
                                            type="button"
                                            onClick={() =>
                                              updateLocalVariantQuantity(
                                                variant,
                                                index,
                                                getImmediateVariantQuantity(
                                                  variant,
                                                  index,
                                                ) + 1,
                                              )
                                            }
                                            className={`flex h-6 w-6 items-center justify-center ${stockFisico <= 0 || getImmediateVariantQuantity(variant, index) >= stockFisico ? "opacity-30 cursor-not-allowed pointer-events-none" : "cursor-pointer"}`}
                                          >
                                            <Icon.Plus size={16} />
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                },
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                    {orderedExternalAvailabilityGroups.map((group) => (
                      <div key={group.key} className="border-t border-[#DCE6EA]">
                        <div className="px-4 py-3 bg-[#EEF5F7]">
                          <div className="text-sm font-semibold text-black">
                            {group.title}
                          </div>
                          {group.subtitle && (
                            <div className="mt-1 text-xs text-text-secondary">
                              {group.subtitle}
                            </div>
                          )}
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full min-w-full table-fixed text-left text-xs sm:text-sm">
                            <thead className="bg-white">
                              <tr>
                                <th className="w-[30%] sm:w-[32%] px-2 sm:px-4 py-3 font-semibold text-text-secondary border-b border-[#DCE6EA]">
                                  Color
                                </th>
                                <th className="w-[15%] sm:w-[12%] px-2 sm:px-4 py-3 font-semibold text-text-secondary border-b border-[#DCE6EA] text-center">
                                  Talla
                                </th>
                                <th className="w-[20%] sm:w-[18%] px-2 sm:px-4 py-3 font-semibold text-text-secondary border-b border-[#DCE6EA] text-right">
                                  Existencias
                                </th>
                                <th className="hidden sm:table-cell w-[18%] px-2 sm:px-4 py-3 font-semibold text-text-secondary border-b border-[#DCE6EA] text-center">
                                  Disponibilidad
                                </th>
                                <th className="w-[35%] sm:w-[20%] px-2 sm:px-4 py-3 font-semibold text-text-secondary border-b border-[#DCE6EA] text-center">
                                  Cantidad
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-line bg-white">
                              {group.items.map(({ variant, index }) => {
                                const variantKey = getVariantKey(variant, index);
                                const stockFisico =
                                  Number(variant?.stockFisico) || 0;
                                const quantityValue =
                                  variantQuantities[variantKey] ?? "";
                                const isSelected =
                                  getVariantQuantity(variant, index) > 0;
                                const availabilityLabel =
                                  variant?.disponibilidadLabel ||
                                  group.title.replace("Disponibilidad ", "") ||
                                  "Sin fecha";

                                return (
                                  <tr
                                    key={variantKey}
                                    className={`transition-colors ${isSelected ? "bg-black/[0.02]" : "hover:bg-[#EEF5F7]"}`}
                                  >
                                    <td className="px-2 sm:px-4 py-3">
                                      <div className="flex items-center gap-2 sm:gap-3">
                                        <span
                                          className="block h-4 w-4 rounded-full"
                                          style={getColorSwatchStyle(
                                            variant?.color,
                                          )}
                                        />
                                        <div className="font-medium text-black text-[0.65rem] sm:text-sm">
                                          {getColorLabel(variant?.color)}
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-2 sm:px-4 py-3 text-center text-black">
                                      {variant?.size || "-"}
                                    </td>
                                    <td
                                      className={`px-2 sm:px-4 py-3 text-right font-bold ${stockFisico > 0 ? "text-primary-dark-600" : "text-danger-500"}`}
                                    >
                                      {formatStockNumber(stockFisico)}
                                    </td>
                                    <td className="hidden sm:table-cell px-2 sm:px-4 py-3 text-center text-black">
                                      {availabilityLabel}
                                    </td>
                                    <td className="px-2 sm:px-4 py-3">
                                      <div className="mx-auto flex w-full max-w-[108px] items-center justify-between rounded-lg border border-[#DCE6EA] px-2 py-1.5">
                                        <button
                                          type="button"
                                          onClick={() =>
                                            updateVariantQuantity(
                                              variant,
                                              index,
                                              Math.max(
                                                0,
                                                getVariantQuantity(
                                                  variant,
                                                  index,
                                                ) - 1,
                                              ),
                                            )
                                          }
                                          className={`flex h-6 w-6 items-center justify-center ${getVariantQuantity(variant, index) <= 0 ? "opacity-30 cursor-not-allowed pointer-events-none" : "cursor-pointer"}`}
                                        >
                                          <Icon.Minus size={16} />
                                        </button>

                                        <input
                                          type="number"
                                          min={0}
                                          max={Math.max(0, stockFisico)}
                                          value={quantityValue}
                                          onFocus={() =>
                                            handleActiveColor(
                                              String(variant?.color || ""),
                                            )
                                          }
                                          onChange={(e) =>
                                            updateVariantQuantity(
                                              variant,
                                              index,
                                              e.target.value,
                                            )
                                          }
                                          onBlur={() => {
                                            const nextValue =
                                              variantQuantities[variantKey];
                                            if (nextValue === "") return;
                                            updateVariantQuantity(
                                              variant,
                                              index,
                                              nextValue,
                                            );
                                          }}
                                          className="w-12 bg-transparent text-center font-semibold outline-none border-0 ring-0 focus:ring-0 focus:outline-none"
                                          placeholder="0"
                                          disabled={stockFisico <= 0}
                                        />

                                        <button
                                          type="button"
                                          onClick={() =>
                                            updateVariantQuantity(
                                              variant,
                                              index,
                                              getVariantQuantity(
                                                variant,
                                                index,
                                              ) + 1,
                                            )
                                          }
                                          className={`flex h-6 w-6 items-center justify-center ${stockFisico <= 0 || getVariantQuantity(variant, index) >= stockFisico ? "opacity-30 cursor-not-allowed pointer-events-none" : "cursor-pointer"}`}
                                        >
                                          <Icon.Plus size={16} />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}

                    {externalVariationItems.some(
                      ({ variant }) =>
                        (Number(variant?.stockTransito) || 0) > 0,
                    ) && (
                      <div className="border-t border-[#DCE6EA]">
                        <div className="px-4 py-3 text-sm font-semibold text-black bg-[#EEF5F7]">
                          Próximas llegadas
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full min-w-full table-fixed text-left text-xs sm:text-sm">
                            <thead className="bg-white">
                              <tr>
                                <th className="w-[38%] px-2 sm:px-4 py-3 font-semibold text-text-secondary border-b border-[#DCE6EA]">
                                  Color
                                </th>
                                <th className="w-[12%] px-2 sm:px-4 py-3 font-semibold text-text-secondary border-b border-[#DCE6EA] text-center">
                                  Talla
                                </th>
                                <th className="w-[22%] px-2 sm:px-4 py-3 font-semibold text-text-secondary border-b border-[#DCE6EA] text-right">
                                  En tránsito
                                </th>
                                <th className="w-[28%] px-2 sm:px-4 py-3 font-semibold text-text-secondary border-b border-[#DCE6EA] text-center">
                                  Fecha llegada
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-line bg-white">
                              {externalVariationItems
                                .filter(
                                  ({ variant }) =>
                                    (Number(variant?.stockTransito) || 0) > 0,
                                )
                                .map(({ variant, index }) => {
                                  const variantKey = `${getVariantKey(variant, index)}-transit`;
                                  const stockTransito =
                                    Number(variant?.stockTransito) || 0;
                                  return (
                                    <tr
                                      key={variantKey}
                                      className="hover:bg-surface transition-colors"
                                    >
                                      <td className="px-2 sm:px-4 py-3">
                                        <div className="flex items-center gap-2 sm:gap-3">
                                          <span
                                            className="block h-4 w-4 rounded-full"
                                            style={getColorSwatchStyle(
                                              variant?.color,
                                            )}
                                          />
                                          <div className="font-medium text-black text-[0.65rem] sm:text-sm">
                                            {getColorLabel(variant?.color)}
                                          </div>
                                        </div>
                                      </td>
                                      <td className="px-2 sm:px-4 py-3 text-center text-black">
                                        {variant?.size || "-"}
                                      </td>
                                      <td className="px-2 sm:px-4 py-3 text-right font-bold text-black">
                                        {formatStockNumber(stockTransito)}
                                      </td>
                                      <td className="px-2 sm:px-4 py-3 text-center text-text-secondary">
                                        {variant?.fechaLlegada || "-"}
                                      </td>
                                    </tr>
                                  );
                                })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="button-block mt-5 space-y-3">
                  <div
                    className={`grid grid-cols-1 ${
                      showCartActions ? "md:grid-cols-2" : ""
                    } gap-3`}
                  >
                    {showCartActions && (
                      <button
                        type="button"
                        onClick={handleAddToCart}
                        disabled={!canSubmitSelections}
                        className={`flex min-h-[56px] w-full items-center justify-center gap-2 rounded-xl border px-5 text-sm font-extrabold transition ${
                          canSubmitSelections
                            ? "border-[#38A0A2] bg-[#38A0A2] text-white shadow-[0_8px_22px_rgba(56,160,162,.18)] hover:border-[#21577B] hover:bg-[#21577B] cursor-pointer"
                            : "border-[#DCE6EA] bg-[#EEF3F5] text-[#8492A6] cursor-not-allowed opacity-70"
                        }`}
                      >
                        <Icon.Handbag size={20} weight="bold" />
                        {canSubmitSelections
                          ? "Agregar a cotización"
                          : "Selecciona cantidades"}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleGoToQuote}
                      disabled={!canSubmitSelections}
                      className={`flex min-h-[56px] w-full items-center justify-center gap-2 rounded-xl border px-5 text-sm font-extrabold transition ${
                        canSubmitSelections
                          ? "border-[#21577B] bg-[#21577B] text-white shadow-[0_8px_22px_rgba(33,87,123,.18)] hover:bg-[#1F2E53] hover:border-[#1F2E53] cursor-pointer"
                          : "border-[#DCE6EA] bg-[#EEF3F5] text-[#8492A6] cursor-not-allowed opacity-70"
                      }`}
                    >
                      <Icon.FileText size={20} weight="bold" />
                      Cotizar este producto
                    </button>
                  </div>

                  {view360Url && (
                    <a
                      href={view360Url}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full min-h-[52px] rounded-xl flex items-center justify-center gap-2 border border-[#21577B] bg-white px-5 text-sm font-extrabold text-[#21577B] transition hover:bg-[#21577B] hover:text-white"
                    >
                      <Icon.CubeFocus size={24} />
                      Vista 360° del Producto
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="desc-tab pb-10 md:pb-14">
          <div className="container">
            <div className="flex items-center justify-center w-full overflow-x-auto">
              <div className="menu-tab flex items-center md:gap-[60px] gap-8 min-w-max px-2">
                <div
                  className={`tab-item heading5 has-line-before text-text-muted hover:text-black duration-300 ${activeTab === "description" ? "active" : ""}`}
                  onClick={() => handleActiveTab("description")}
                >
                  Descripción General
                </div>
                <div
                  className={`tab-item heading5 has-line-before text-text-muted hover:text-black duration-300 ${activeTab === "specifications" ? "active" : ""}`}
                  onClick={() => handleActiveTab("specifications")}
                >
                  Marcaje
                </div>
                <div
                  className={`tab-item heading5 has-line-before text-text-muted hover:text-black duration-300 ${activeTab === "measurePackaging" ? "active" : ""}`}
                  onClick={() => handleActiveTab("measurePackaging")}
                >
                  Medida y Packaging
                </div>
              </div>
            </div>
            <div className="desc-block mt-8 rounded-[28px] border border-[#DCE6EA] bg-white p-5 shadow-[0_10px_30px_rgba(31,46,83,.05)] sm:p-7">
              <div
                className={`desc-item description ${activeTab === "description" ? "open" : ""}`}
              >
                <div className="w-full lg:w-3/4 mx-auto">
                  {isGroupedDirectKyte && (
                    <div className="mb-5 flex flex-col items-center gap-3">
                      <div className="text-xs font-semibold uppercase tracking-[0.14em] text-text-secondary">
                        Variante seleccionada
                      </div>
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        {immediateColorLabels.map((label) => (
                          <button
                            key={label}
                            type="button"
                            onClick={() => {
                              const variant = immediateVariations.find(
                                (item) =>
                                  getColorLabel(item?.color || "") === label,
                              );

                              if (variant) {
                                handleImmediateVariantFocus(variant);
                              }
                            }}
                            className={`rounded-full border px-3 py-1 text-sm duration-200 ${
                              getColorLabel(activeImmediateVariation?.color || "") === label
                                ? "border-black bg-black text-white"
                                : "border-[#DCE6EA] bg-white text-text-secondary hover:border-black hover:text-black"
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="text-text-secondary leading-relaxed text-base whitespace-pre-line text-center">
                    {activeDescription}
                  </div>
                </div>
              </div>

              <div
                className={`desc-item specifications flex items-center justify-center ${activeTab === "specifications" ? "open" : ""}`}
              >
                <div className="lg:w-3/4 sm:w-11/12 w-full">
                  {Object.keys(features).length > 0 ? (
                    isMakito ? (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="rounded-2xl border border-[#DCE6EA] bg-white p-5 md:p-6">
                            <div className="flex items-start gap-3">
                              <div className="w-11 h-11 rounded-full border border-[#DCE6EA] bg-surface flex items-center justify-center shrink-0">
                                <Icon.SquaresFour size={20} />
                              </div>
                              <div className="min-w-0">
                                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary mb-2">
                                  Áreas de impresión
                                </div>
                                <div className="text-title text-black break-words">
                                  {printAreasCount || "No disponible"}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="rounded-2xl border border-[#DCE6EA] bg-white p-5 md:p-6">
                            <div className="flex items-start gap-3">
                              <div className="w-11 h-11 rounded-full border border-[#DCE6EA] bg-surface flex items-center justify-center shrink-0">
                                <Icon.SealCheck size={20} />
                              </div>
                              <div className="min-w-0">
                                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary mb-2">
                                  Códigos de impresión
                                </div>
                                <div className="text-title text-black break-words">
                                  {printCode || "No disponible"}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {printAreasList.length > 0 ? (
                          <div className="grid grid-cols-1 gap-4">
                            {printAreasList.map((area, index: number) => {
                              const areaImageUrl = getAreaImageUrl(
                                area.area_img,
                              );
                              return (
                                <div
                                  key={area.area_img || index}
                                  className="rounded-2xl border border-[#DCE6EA] bg-white p-5 md:p-6"
                                >
                                  <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1.3fr)_240px] gap-6 md:gap-8 items-center">
                                    <div className="min-w-0">
                                      <div className="flex flex-wrap items-center gap-3 mb-4">
                                        <div className="text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary">
                                          Área {index + 1}
                                        </div>
                                        <span className="inline-flex items-center rounded-full border border-[#DCE6EA] bg-surface px-3 py-1 text-sm font-medium text-black">
                                          {formatMeasureMm(area.width)} x{" "}
                                          {formatMeasureMm(area.height)} mm
                                        </span>
                                      </div>

                                      <div className="text-title text-black mb-3">
                                        Técnicas disponibles
                                      </div>

                                      <div className="flex flex-wrap gap-2.5">
                                        {area.techniques.length > 0 ? (
                                          area.techniques.map(
                                            (tech: PrintTechnique, techIndex: number) => (
                                              <div
                                                key={techIndex}
                                                className="rounded-xl border border-[#DCE6EA] bg-surface px-4 py-3"
                                              >
                                                <div className="text-sm font-medium text-black leading-snug">
                                                  {tech.technique_name}
                                                </div>
                                                <div className="text-xs text-text-secondary mt-1">
                                                  Máx. {tech.max_colors}{" "}
                                                  {tech.max_colors === 1
                                                    ? "color"
                                                    : "colores"}
                                                </div>
                                              </div>
                                            ),
                                          )
                                        ) : (
                                          <div className="text-text-secondary">
                                            No hay técnicas disponibles.
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    <div className="flex justify-center md:justify-end">
                                      {areaImageUrl ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                          src={areaImageUrl}
                                          alt={`Área ${index + 1}`}
                                          className="w-full max-w-[220px] h-auto object-contain"
                                        />
                                      ) : (
                                        <div className="w-full max-w-[220px] min-h-[160px] rounded-2xl border border-dashed border-[#DCE6EA] bg-surface flex items-center justify-center text-text-secondary text-sm text-center px-4">
                                          Imagen no disponible
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="rounded-2xl border border-[#DCE6EA] bg-white p-6 text-text-secondary text-center">
                            No hay áreas de impresión disponibles.
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="rounded-2xl border border-[#DCE6EA] bg-white p-5 md:p-6">
                            <div className="flex items-start gap-3">
                              <div className="w-11 h-11 rounded-full border border-[#DCE6EA] bg-surface flex items-center justify-center shrink-0">
                                <Icon.Cube size={20} />
                              </div>
                              <div className="min-w-0">
                                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary mb-2">
                                  Material
                                </div>
                                <div className="text-title text-black break-words">
                                  {String(
                                    features?.material || "No disponible",
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="rounded-2xl border border-[#DCE6EA] bg-white p-5 md:p-6">
                            <div className="flex items-start gap-3">
                              <div className="w-11 h-11 rounded-full border border-[#DCE6EA] bg-surface flex items-center justify-center shrink-0">
                                <Icon.Ruler size={20} />
                              </div>
                              <div className="min-w-0">
                                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary mb-2">
                                  Medidas
                                </div>
                                <div className="text-title text-black break-words">
                                  {String(features?.measure || "No disponible")}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="rounded-2xl border border-[#DCE6EA] bg-white p-5 md:p-6">
                            <div className="flex items-start gap-3">
                              <div className="w-11 h-11 rounded-full border border-[#DCE6EA] bg-surface flex items-center justify-center shrink-0">
                                <Icon.Drop size={20} />
                              </div>
                              <div className="min-w-0">
                                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary mb-2">
                                  Capacidad
                                </div>
                                <div className="text-title text-black break-words">
                                  {promoCapacity || "No disponible"}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="rounded-2xl border border-[#DCE6EA] bg-white p-5 md:p-6">
                            <div className="flex items-start gap-3">
                              <div className="w-11 h-11 rounded-full border border-[#DCE6EA] bg-surface flex items-center justify-center shrink-0">
                                <Icon.PaintBrushBroad size={20} />
                              </div>
                              <div className="min-w-0">
                                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary mb-2">
                                  Técnica de impresión
                                </div>
                                <div className="text-title text-black break-words">
                                  {promoPrintingTechnique || "No disponible"}
                                </div>
                                {promoPrintingArea && (
                                  <div className="text-sm text-text-secondary mt-2">
                                    Área: {promoPrintingArea}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {promoVectorImage && (
                          <div className="rounded-2xl border border-[#DCE6EA] bg-white p-5 md:p-6">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-11 h-11 rounded-full border border-[#DCE6EA] bg-surface flex items-center justify-center shrink-0">
                                <Icon.ImageSquare size={20} />
                              </div>
                              <div>
                                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary">
                                  Área visual de impresión
                                </div>
                                <div className="text-title text-black">
                                  Referencia del marcaje
                                </div>
                              </div>
                            </div>

                            <div className="relative w-full max-w-[260px] aspect-square overflow-hidden rounded-xl border border-[#DCE6EA] bg-[#f3f4f6]">
                              {!promoVectorLoaded && (
                                <div className="absolute inset-0 z-10 animate-pulse bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100" />
                              )}

                              <Image
                                src={
                                  failedPromoVectorImage
                                    ? fallbackImage
                                    : promoVectorImage
                                }
                                width={500}
                                height={500}
                                alt="Área de impresión"
                                unoptimized={shouldBypassNextImageOptimization(promoVectorImage)}
                                loading="lazy"
                                onLoad={() => setPromoVectorLoaded(true)}
                                onError={() => {
                                  setFailedPromoVectorImage(true);
                                  setPromoVectorLoaded(true);
                                }}
                                className={`w-full h-full object-contain bg-surface p-3 transition-opacity duration-300 ${
                                  promoVectorLoaded
                                    ? "opacity-100"
                                    : "opacity-0"
                                }`}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  ) : (
                    <p className="text-center text-text-secondary">
                      Especificaciones técnicas no disponibles.
                    </p>
                  )}
                </div>
              </div>

              <div
                className={`desc-item specifications flex items-center justify-center ${activeTab === "measurePackaging" ? "open" : ""}`}
              >
                <div className="lg:w-3/4 sm:w-11/12 w-full">
                  {isMakito ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="rounded-2xl border border-[#DCE6EA] bg-white p-5 md:p-6">
                          <div className="flex items-start gap-3">
                            <div className="w-11 h-11 rounded-full border border-[#DCE6EA] bg-surface flex items-center justify-center shrink-0">
                              <Icon.Ruler size={20} />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary mb-2">
                                Medidas del artículo
                              </div>
                              <div className="text-title text-black break-words">
                                {articleDimensions
                                  ? `${articleDimensions} cm`
                                  : "No disponible"}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-[#DCE6EA] bg-white p-5 md:p-6">
                          <div className="flex items-start gap-3">
                            <div className="w-11 h-11 rounded-full border border-[#DCE6EA] bg-surface flex items-center justify-center shrink-0">
                              <Icon.Barbell size={20} />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary mb-2">
                                Peso del artículo
                              </div>
                              <div className="text-title text-black break-words">
                                {hasValue(features?.weight)
                                  ? `${features.weight} gr.`
                                  : "No disponible"}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-[#DCE6EA] bg-white p-5 md:p-6">
                        <div className="flex items-center gap-3 mb-5">
                          <div className="w-11 h-11 rounded-full border border-[#DCE6EA] bg-surface flex items-center justify-center shrink-0">
                            <Icon.Package size={20} />
                          </div>
                          <div>
                            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary">
                              Packaging
                            </div>
                            <div className="text-title text-black">
                              Presentación logística del producto
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="rounded-xl border border-[#DCE6EA] bg-surface p-4">
                            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-text-secondary mb-2">
                              Empaque final
                            </div>
                            <div className="text-title text-black">
                              {packagingFinalText
                                ? `1 ${packagingFinalText}`
                                : "No disponible"}
                            </div>
                          </div>

                          <div className="rounded-xl border border-[#DCE6EA] bg-surface p-4">
                            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-text-secondary mb-2">
                              Intermedio 1
                            </div>
                            <div className="text-title text-black">
                              {packagingIntermedio1Text || "No disponible"}
                            </div>
                          </div>

                          <div className="rounded-xl border border-[#DCE6EA] bg-surface p-4">
                            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-text-secondary mb-2">
                              Intermedio 2
                            </div>
                            <div className="text-title text-black">
                              {packagingIntermedio2Text || "No disponible"}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="rounded-2xl border border-[#DCE6EA] bg-white p-5 md:p-6">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full border border-[#DCE6EA] bg-surface flex items-center justify-center shrink-0">
                              <Icon.Package size={18} />
                            </div>
                            <div>
                              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary">
                                Caja master
                              </div>
                              <div className="text-title text-black">
                                Datos de embalaje principal
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-text-secondary">
                                Unidades
                              </span>
                              <span className="font-medium text-black">
                                {hasValue(features?.ptc_units)
                                  ? features.ptc_units
                                  : "No disponible"}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-text-secondary">
                                Dimensiones
                              </span>
                              <span className="font-medium text-black text-right">
                                {hasValue(features?.ptc_height) ||
                                hasValue(features?.ptc_width) ||
                                hasValue(features?.ptc_length)
                                  ? `${hasValue(features?.ptc_height) ? `${features.ptc_height} cm` : "-"} · ${hasValue(features?.ptc_width) ? `${features.ptc_width} cm` : "-"} · ${hasValue(features?.ptc_length) ? `${features.ptc_length} cm` : "-"}`
                                  : "No disponible"}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-text-secondary">Peso</span>
                              <span className="font-medium text-black">
                                {hasValue(features?.ptc_weight)
                                  ? `${features.ptc_weight} kg`
                                  : "No disponible"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-[#DCE6EA] bg-white p-5 md:p-6">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full border border-[#DCE6EA] bg-surface flex items-center justify-center shrink-0">
                              <Icon.Truck size={18} />
                            </div>
                            <div>
                              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary">
                                Palet
                              </div>
                              <div className="text-title text-black">
                                Datos de transporte
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-text-secondary">
                                Unidades
                              </span>
                              <span className="font-medium text-black">
                                {hasValue(features?.pallet_units)
                                  ? features.pallet_units
                                  : "No disponible"}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-text-secondary">
                                Bultos
                              </span>
                              <span className="font-medium text-black">
                                {hasValue(features?.bundle_pallets)
                                  ? features.bundle_pallets
                                  : "No disponible"}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-text-secondary">
                                Peso aprox.
                              </span>
                              <span className="font-medium text-black">
                                {hasValue(features?.pallet_weight)
                                  ? `${features.pallet_weight} kg`
                                  : "No disponible"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="rounded-2xl border border-[#DCE6EA] bg-white p-5 md:p-6">
                          <div className="flex items-start gap-3">
                            <div className="w-11 h-11 rounded-full border border-[#DCE6EA] bg-surface flex items-center justify-center shrink-0">
                              <Icon.Ruler size={20} />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary mb-2">
                                Medida
                              </div>
                              <div className="text-title text-black break-words">
                                {promoMeasurePackagingText
                                  ? `${promoMeasurePackagingText} CM`
                                  : "No disponible"}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-[#DCE6EA] bg-white p-5 md:p-6">
                          <div className="flex items-start gap-3">
                            <div className="w-11 h-11 rounded-full border border-[#DCE6EA] bg-surface flex items-center justify-center shrink-0">
                              <Icon.Barbell size={20} />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary mb-2">
                                Peso
                              </div>
                              <div className="text-title text-black break-words">
                                {promoWeightText || "No disponible"}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-[#DCE6EA] bg-white p-5 md:p-6">
                        <div className="flex items-center gap-3 mb-5">
                          <div className="w-11 h-11 rounded-full border border-[#DCE6EA] bg-surface flex items-center justify-center shrink-0">
                            <Icon.Package size={20} />
                          </div>
                          <div>
                            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary">
                              Packaging
                            </div>
                            <div className="text-title text-black">
                              Resumen de empaque
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="rounded-xl border border-[#DCE6EA] bg-surface p-4">
                            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-text-secondary mb-2">
                              Cantidad por caja
                            </div>
                            <div className="text-title text-black">
                              {promoPiecesPerBox || "No disponible"}
                            </div>
                          </div>

                          <div className="rounded-xl border border-[#DCE6EA] bg-surface p-4">
                            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-text-secondary mb-2">
                              Caja individual
                            </div>
                            <div className="text-title text-black">
                              {promoIndividualBox || "No disponible"}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="related-product border-t border-[#E3ECEF] bg-white py-10 md:py-14">
          <div className="container">
            <div className="text-center"><p className="text-xs font-extrabold uppercase tracking-[.16em] text-[#38A0A2]">También podría interesarte</p><h2 className="mt-2 text-3xl font-black text-[#1F2E53]">Productos relacionados</h2></div>

            <div className="mt-3 text-center">
              <Link
                href={categoryHref}
                className="inline-flex items-center gap-2 text-sm font-extrabold text-[#21577B] duration-300 hover:gap-3 hover:text-[#38A0A2]"
              >
                {categoryName
                  ? `Ver más en ${categoryName}`
                  : "Explorar catálogo"}
                <Icon.ArrowRight size={18} />
              </Link>
            </div>

            {relatedProducts.length > 0 ? (
              <div className="list-product hide-product-sold grid lg:grid-cols-4 grid-cols-2 md:gap-[30px] gap-5 md:mt-10 mt-6">
                {relatedProducts.map((item, index) => (
                  <CatalogProductCard
                    key={String(item?.id ?? item?.slug ?? index)}
                    product={item}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center text-text-secondary md:mt-10 mt-6">
                No hay productos relacionados en esta categoría.
              </div>
            )}
          </div>
        </div>
      </div>

      {openPopupImg && (
        <div
          className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-[2px] flex items-center justify-center p-4 sm:p-6"
          onClick={handleCloseLightbox}
        >
          <button
            type="button"
            aria-label="Cerrar galería"
            className="absolute top-4 right-4 sm:top-6 sm:right-6 z-[10001] flex h-11 w-11 items-center justify-center rounded-full bg-black/55 text-white transition hover:bg-black/75"
            onClick={handleCloseLightbox}
          >
            <Icon.X size={24} />
          </button>

          <div
            className="relative z-[10000] w-full max-w-[1100px]"
            onClick={(e) => e.stopPropagation()}
          >
            <Swiper
              initialSlide={photoIndex}
              spaceBetween={0}
              slidesPerView={1}
              modules={[Navigation]}
              navigation={true}
              loop={safeGalleryImages.length > 1}
              className="popupSwiper rounded-2xl overflow-hidden bg-white"
              onSwiper={(swiper) => {
                lightboxSwiperRef.current = swiper;
              }}
            >
              {safeGalleryImages.map((item: string, index: number) => (
                <SwiperSlide key={index}>
                  <div className="flex items-center justify-center bg-white min-h-[60vh] max-h-[85vh] p-4 sm:p-6 md:p-10">
                    <div className="relative flex min-h-[50vh] w-full items-center justify-center overflow-hidden rounded-xl bg-[#f3f4f6]">
                      {!lightboxGalleryLoaded[item] && (
                        <div className="absolute inset-0 z-10 animate-pulse bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100" />
                      )}

                      <Image
                        src={
                          failedGalleryImages[item]
                            ? getGalleryFallbackImage(item, index)
                            : item
                        }
                        width={1400}
                        height={1400}
                        unoptimized={shouldBypassNextImageOptimization(item)}
                        alt={
                          detailProductName || "Imagen ampliada del producto"
                        }
                        priority={index === photoIndex}
                        loading={index === photoIndex ? "eager" : "lazy"}
                        sizes="100vw"
                        onLoad={() =>
                          setLightboxGalleryLoaded((prev) => ({
                            ...prev,
                            [item]: true,
                          }))
                        }
                        onError={(event) =>
                          handleGalleryImageError(
                            event,
                            item,
                            index,
                            setLightboxGalleryLoaded,
                          )
                        }
                        className={`max-h-[72vh] w-auto max-w-full object-contain transition-opacity duration-300 ${
                          lightboxGalleryLoaded[item]
                            ? "opacity-100"
                            : "opacity-0"
                        }`}
                      />
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      )}

      <ModalSizeguide
        data={productMain}
        isOpen={openSizeGuide}
        onClose={handleCloseSizeGuide}
      />
    </>
  );
};

export default Default;
