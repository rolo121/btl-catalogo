"use client";

import { appAsset } from '@/lib/appPaths'

import React, { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ProductType } from "@/type/ProductType";
import * as Icon from "@phosphor-icons/react/dist/ssr";
import { useCart } from "@/context/CartContext";
import { useModalCartContext } from "@/context/ModalCartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useModalWishlistContext } from "@/context/ModalWishlistContext";
import { useCompare } from "@/context/CompareContext";
import { useModalCompareContext } from "@/context/ModalCompareContext";
import { useModalQuickviewContext } from "@/context/ModalQuickviewContext";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { catalogStoreActions } from "@/store/useCatalogStore";
import Marquee from "react-fast-marquee";
import { getColorSwatchStyle } from "@/lib/colors";
import { getCartItemImage } from "@/lib/productImages";

interface ProductProps {
  data: ProductType;
  type: string;
  style?: string;
  showAddToCart?: boolean;
  priorityImage?: boolean;
  buttonMode?: "quote" | "detail";
  buttonLabel?: string;
}

const loadedProductImages = new Set<string>();

const markProductImageAsLoaded = (imageUrl: string) => {
  if (!imageUrl) return;
  loadedProductImages.add(imageUrl);
};

const hasProductImageLoaded = (imageUrl: string) => {
  if (!imageUrl) return false;
  return loadedProductImages.has(imageUrl);
};

const ProductContent: React.FC<ProductProps> = ({
  data,
  type,
  style = "default",
  showAddToCart = true,
  priorityImage = false,
  buttonMode = "quote",
  buttonLabel,
}) => {
  const [activeColor, setActiveColor] = useState<string>("");
  const [activeSize, setActiveSize] = useState<string>("");
  const [openQuickShop, setOpenQuickShop] = useState<boolean>(false);
  const { addToCart, updateCart, cartState } = useCart();
  const { openModalCart } = useModalCartContext();
  const { addToWishlist, removeFromWishlist, wishlistState } = useWishlist();
  const { openModalWishlist } = useModalWishlistContext();
  const { addToCompare, removeFromCompare, compareState } = useCompare();
  const { openModalCompare } = useModalCompareContext();
  const { openQuickview } = useModalQuickviewContext();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleActiveColor = (item: string) => {
    setActiveColor(item);
  };

  const handleActiveSize = (item: string) => {
    setActiveSize(item);
  };

  const handleAddToCart = () => {
    const selectedVariation =
      data.variation.find(
        (variation) =>
          (!activeColor || variation.color === activeColor) &&
          (!activeSize || variation.size === activeSize),
      ) ||
      data.variation.find(
        (variation) => variation.color === activeColor,
      ) ||
      data.variation[0];

    const quantity = Math.max(
      1,
      Number(data.quantityPurchase || 1),
    );
    const selectedSize =
      activeSize || selectedVariation?.size || "S/T";
    const selectedColor =
      activeColor || selectedVariation?.color || "";
    const variationSnapshot = selectedVariation
      ? [selectedVariation]
      : [];

    if (!cartState.cartArray.find((item) => item.id === data.id)) {
      addToCart({
        ...data,
        quantity,
        quantityPurchase: quantity,
        selectedSize,
        selectedColor,
        variation: variationSnapshot,
        cartImage: getCartItemImage({
          ...data,
          variation: variationSnapshot,
        }),
      } as Parameters<typeof addToCart>[0]);
    } else {
      updateCart(
        data.id,
        quantity,
        selectedSize,
        selectedColor,
      );
    }

    openModalCart();
  };

  const handleAddToWishlist = () => {
    // if product existed in wishlit, remove from wishlist and set state to false
    if (wishlistState.wishlistArray.some((item) => item.id === data.id)) {
      removeFromWishlist(data.id);
    } else {
      // else, add to wishlist and set state to true
      addToWishlist(data);
    }
    openModalWishlist();
  };

  const handleAddToCompare = () => {
    // if product existed in wishlit, remove from wishlist and set state to false
    if (compareState.compareArray.length < 3) {
      if (compareState.compareArray.some((item) => item.id === data.id)) {
        removeFromCompare(data.id);
      } else {
        // else, add to wishlist and set state to true
        addToCompare(data);
      }
    } else {
      alert("Comparar hasta 3 productos");
    }

    openModalCompare();
  };

  const prefetchProductDetail = () => {
    router.prefetch(`/producto/${data.slug || data.id}`);

    if (data.slug && process.env.NEXT_PUBLIC_API_URL) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/catalog/${data.slug}`, {
        cache: "force-cache",
      }).catch(() => {});
    }
  };

const handleQuickviewOpen = () => {
  prefetchProductDetail();
  openQuickview(data as Parameters<typeof openQuickview>[0]);
};

  const productHref = `/producto/${data.slug || data.id}`;

  const saveCatalogContext = () => {
    const currentQuery = searchParams.toString();

    if (
      pathname.startsWith("/productos") ||
      pathname.startsWith("/categoria") ||
      pathname.startsWith("/shop")
    ) {
      const categoryFromPath = pathname.startsWith("/categoria/")
        ? pathname.split("/categoria/")[1]?.split("/")[0] || null
        : null;

      catalogStoreActions.setCatalogContext({
        pathname,
        search: currentQuery ? `?${currentQuery}` : "",
        filters: {
          brand: searchParams.get("brand"),
          category: searchParams.get("commercial_category") || categoryFromPath,
          subcategory: searchParams.get("subcategory"),
          searchTerm: searchParams.get("search") || "",
          sort: searchParams.get("sort"),
          page: Number(searchParams.get("page") || 1),
          provider: searchParams.get("provider"),
          color: searchParams.get("color"),
        },
        scrollY: typeof window !== "undefined" ? window.scrollY : 0,
      });
    }
  };

  const handleProductLinkClick = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    saveCatalogContext();
  };

  const handleDetailProduct = (productId: string) => {
    saveCatalogContext();
    router.push(`/producto/${productId}`);
  };

  //Comentariamos esta parte
  //let percentSale = Math.floor(100 - ((data.price / data.originPrice) * 100))
  //let percentSold = Math.floor((data.sold / data.quantity) * 100)
  const percentSale = Math.floor(100 - (data.price / data.originPrice) * 100);

  const activeVariationImage = activeColor
    ? data.variation.find((item) => item.color === activeColor)?.image
    : "";

  const fallbackImage = appAsset('/images/product-placeholder.webp');
  const mainImage =
    activeVariationImage || data.thumbImage?.[0] || fallbackImage;
  const hoverImage =
    !activeColor && data.thumbImage?.[1] && data.thumbImage[1] !== mainImage
      ? data.thumbImage[1]
      : "";

  const originalMainImage = data.images?.[0] || fallbackImage;
  const originalHoverImage = data.images?.[1] || "";

  const [imgLoaded, setImgLoaded] = useState(() =>
    hasProductImageLoaded(mainImage),
  );
  const [hoverImgLoaded, setHoverImgLoaded] = useState(() =>
    hasProductImageLoaded(hoverImage),
  );
  const [safeMainImage, setSafeMainImage] = useState(mainImage);
  const [safeHoverImage, setSafeHoverImage] = useState(hoverImage);

  useEffect(() => {
    setImgLoaded(hasProductImageLoaded(mainImage));
    setHoverImgLoaded(hasProductImageLoaded(hoverImage));
    setSafeMainImage(mainImage);
    setSafeHoverImage(hoverImage);
  }, [mainImage, hoverImage]);

  const stopProductAction = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleProductCardClick = (e: React.MouseEvent<HTMLElement>) => {
    const target = e.target as HTMLElement;

    if (
      target.closest(
        ".quick-view-btn, .quick-view-btn-list, .compare-btn, .add-cart-btn, .add-wishlist-btn, .quick-shop-btn, .quick-shop-block, .color-item, .size-item",
      )
    ) {
      return;
    }

    handleDetailProduct(data.slug || data.id);
  };

  if (type === "grid") {
    return (
      <div className={`product-item grid-type ${style} h-full`}>
        <div
          onMouseEnter={prefetchProductDetail}
          onFocus={prefetchProductDetail}
          onClick={handleProductCardClick}
          className="product-main group flex h-full cursor-pointer flex-col rounded-2xl border border-line bg-white p-3 shadow-[0_10px_30px_rgba(31,41,51,0.05)] duration-300 hover:border-primary/30 hover:shadow-[0_16px_36px_rgba(31,41,51,0.10)]"
        >
          <div className="product-thumb relative overflow-hidden rounded-xl bg-surface-alt">
            {(data.new || data.sale) && (
              <div
                className={`product-tag text-button-uppercase absolute left-3 top-3 z-[1] inline-block rounded-full px-3 py-0.5 ${
                  data.sale
                    ? "bg-danger text-white"
                    : "bg-primary-soft text-primary-dark"
                }`}
              >
                {data.sale ? "Oferta" : "Nuevo"}
              </div>
            )}

            <Link
              href={productHref}
              aria-label={`Ver detalle de ${data.name}`}
              onClick={handleProductLinkClick}
              onMouseEnter={prefetchProductDetail}
              onFocus={prefetchProductDetail}
              className="product-img relative block aspect-[3/4] w-full overflow-hidden rounded-xl bg-surface-alt"
            >
              {!imgLoaded && (
                <div className="absolute inset-0 z-0 flex items-center justify-center bg-surface-alt">
                  <div className="h-12 w-12 animate-pulse rounded-full bg-white shadow-sm" />
                </div>
              )}

              <Image
                key={safeMainImage}
                src={safeMainImage}
                width={500}
                height={500}
                alt={data.name}
                {...(priorityImage
                  ? { priority: true }
                  : { loading: "lazy" as const })}
                unoptimized
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                onLoad={() => {
                  markProductImageAsLoaded(safeMainImage);
                  setImgLoaded(true);
                }}
                onError={() => {
                  if (
                    safeMainImage !== originalMainImage &&
                    originalMainImage &&
                    originalMainImage !== fallbackImage
                  ) {
                    setSafeMainImage(originalMainImage);
                    return;
                  }

                  if (safeMainImage !== fallbackImage) {
                    setSafeMainImage(fallbackImage);
                    return;
                  }

                  setImgLoaded(true);
                }}
                className={`absolute inset-0 z-10 h-full w-full object-contain bg-surface-alt p-4 opacity-100 transition-opacity duration-300 ${
                  safeHoverImage && hoverImgLoaded
                    ? "group-hover:opacity-0"
                    : ""
                }`}
              />

              {imgLoaded && safeHoverImage && (
                <Image
                  key={safeHoverImage}
                  src={safeHoverImage}
                  width={500}
                  height={500}
                  alt={`${data.name} hover`}
                  loading="lazy"
                  fetchPriority="low"
                  unoptimized
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  onLoad={() => {
                    markProductImageAsLoaded(safeHoverImage);
                    setHoverImgLoaded(true);
                  }}
                  onError={() => {
                    if (
                      safeHoverImage !== originalHoverImage &&
                      originalHoverImage &&
                      originalHoverImage !== safeMainImage
                    ) {
                      setSafeHoverImage(originalHoverImage);
                      return;
                    }

                    setSafeHoverImage("");
                    setHoverImgLoaded(true);
                  }}
                  className={`absolute inset-0 z-20 h-full w-full object-contain bg-surface-alt p-4 transition-opacity duration-300 ${
                    hoverImgLoaded
                      ? "opacity-0 group-hover:opacity-100"
                      : "opacity-0"
                  }`}
                />
              )}
            </Link>

            <div className="absolute bottom-3 left-3 right-3 z-[20] hidden items-center justify-center gap-2 lg:flex lg:opacity-0 lg:translate-y-2 duration-300 group-hover:opacity-100 group-hover:translate-y-0">
              <button
                className="quick-view-btn flex h-9 w-9 items-center justify-center rounded-full bg-white text-text shadow-[0_8px_18px_rgba(31,41,51,0.12)] duration-300 hover:bg-primary hover:text-white"
                onClick={(e) => {
                  stopProductAction(e);
                  handleQuickviewOpen();
                }}
                aria-label="Vista rápida"
                title="Vista rápida"
              >
                <Icon.Eye size={18} />
              </button>

              <button
                className={`add-wishlist-btn flex h-9 w-9 items-center justify-center rounded-full bg-white text-text shadow-[0_8px_18px_rgba(31,41,51,0.12)] duration-300 hover:bg-primary hover:text-white ${
                  wishlistState.wishlistArray.some(
                    (item) => item.id === data.id,
                  )
                    ? "active bg-primary text-white"
                    : ""
                }`}
                onClick={(e) => {
                  stopProductAction(e);
                  handleAddToWishlist();
                }}
                aria-label={
                  wishlistState.wishlistArray.some(
                    (item) => item.id === data.id,
                  )
                    ? "Quitar de favoritos"
                    : "Agregar a favoritos"
                }
                title={
                  wishlistState.wishlistArray.some(
                    (item) => item.id === data.id,
                  )
                    ? "Quitar de favoritos"
                    : "Agregar a favoritos"
                }
              >
                <Icon.Heart
                  size={18}
                  weight={
                    wishlistState.wishlistArray.some(
                      (item) => item.id === data.id,
                    )
                      ? "fill"
                      : "regular"
                  }
                />
              </button>

              <button
                className={`compare-btn flex h-9 w-9 items-center justify-center rounded-full bg-white text-text shadow-[0_8px_18px_rgba(31,41,51,0.12)] duration-300 hover:bg-primary hover:text-white ${
                  compareState.compareArray.some((item) => item.id === data.id)
                    ? "active"
                    : ""
                }`}
                onClick={(e) => {
                  stopProductAction(e);
                  handleAddToCompare();
                }}
                aria-label="Comparar"
                title="Comparar"
              >
                <Icon.Repeat size={18} className="compare-icon" />
                <Icon.CheckCircle size={20} className="checked-icon" />
              </button>
            </div>
          </div>

          <div className="product-infor mt-4 flex flex-1 flex-col">
            {/*
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span
                className={`caption1 inline-flex items-center rounded-full border px-3 py-1 font-semibold ${availabilityBadgeClass}`}
              >
                {availabilityLabel}
              </span>
              {data.brand && (
                <span className="caption1 inline-flex items-center rounded-full bg-surface-alt px-3 py-1 font-medium text-text-muted">
                  {data.brand}
                </span>
              )}
            </div>
              */}
            <Link
              href={productHref}
              onClick={handleProductLinkClick}
              onMouseEnter={prefetchProductDetail}
              onFocus={prefetchProductDetail}
              className="product-name text-title min-h-[44px] line-clamp-2 text-text-strong duration-300 group-hover:text-primary-dark"
            >
              {data.name}
            </Link>

            {data.variation.length > 0 && (
              <div className="list-color py-3 flex items-center gap-2 flex-wrap duration-500">
                {data.variation.slice(0, 6).map((item, index) => (
                  <div
                    key={index}
                    className={`color-item relative h-6 w-6 rounded-full border border-line duration-300 ${
                      activeColor === item.color
                        ? "active ring-2 ring-primary ring-offset-2"
                        : ""
                    }`}
                    style={getColorSwatchStyle(item.color || item.colorCode)}
                    onClick={(e) => {
                      stopProductAction(e);
                      handleActiveColor(item.color);
                    }}
                  >
                    <div className="tag-action rounded-sm bg-brand-dark px-1.5 py-0.5 caption2 capitalize text-white">
                      {item.color}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {showAddToCart && (
              <button
                className="add-cart-btn mt-auto w-full rounded-full bg-primary px-5 py-3 text-button-uppercase text-white shadow-[0_10px_24px_rgba(242,106,27,0.22)] duration-300 hover:bg-primary-dark"
                onClick={(e) => {
                  stopProductAction(e);

                  if (buttonMode === "detail") {
                    handleDetailProduct(data.slug || data.id);
                    return;
                  }

                  handleAddToCart();
                }}
              >
                {buttonLabel || (buttonMode === "detail" ? "Ver" : "Cotizar")}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {type === "grid" ? (
        <div className={`product-item grid-type ${style}`}>
          <div
            onMouseEnter={prefetchProductDetail}
            onFocus={prefetchProductDetail}
            onClick={handleProductCardClick}
            className="product-main cursor-pointer block"
          >
            <div className="product-thumb bg-white relative overflow-hidden rounded-2xl">
              {data.new && (
                <div className="product-tag text-button-uppercase bg-primary-soft px-3 py-0.5 inline-block rounded-full absolute top-3 left-3 z-[1]">
                  New
                </div>
              )}
              {data.sale && (
                <div className="product-tag text-button-uppercase text-white bg-danger px-3 py-0.5 inline-block rounded-full absolute top-3 left-3 z-[1]">
                  Sale
                </div>
              )}
              {style === "style-1" ||
              style === "style-3" ||
              style === "style-4" ? (
                <div
                  className="list-action-right absolute top-3 right-3 z-[100] pointer-events-auto max-lg:hidden"
                  style={{ zIndex: 100, transform: "translateX(0)" }}
                >
                  {style === "style-4" && (
                    <div
                      className={`add-cart-btn w-[32px] h-[32px] flex items-center justify-center rounded-full bg-white duration-300 relative mb-2 ${compareState.compareArray.some((item) => item.id === data.id) ? "active" : ""}`}
                      onClick={(e) => {
                        stopProductAction(e);
                        handleAddToCart();
                      }}
                    >
                      <div className="tag-action bg-black text-white caption2 px-1.5 py-0.5 rounded-sm">
                        Agregar al carrito
                      </div>
                      <Icon.ShoppingBagOpen size={20} />
                    </div>
                  )}
                  <div
                    className={`add-wishlist-btn w-[32px] h-[32px] flex items-center justify-center rounded-full bg-white duration-300 relative ${wishlistState.wishlistArray.some((item) => item.id === data.id) ? "active" : ""}`}
                    onClick={(e) => {
                      stopProductAction(e);
                      handleAddToWishlist();
                    }}
                  >
                    <div className="tag-action bg-black text-white caption2 px-1.5 py-0.5 rounded-sm">
                      Lista de deseos
                    </div>
                    {wishlistState.wishlistArray.some(
                      (item) => item.id === data.id,
                    ) ? (
                      <>
                        <Icon.Heart
                          size={18}
                          weight="fill"
                          className="text-white"
                        />
                      </>
                    ) : (
                      <>
                        <Icon.Heart size={18} />
                      </>
                    )}
                  </div>
                  {style === "style-3" || style === "style-4" ? (
                    <div
                      className={`quick-view-btn w-[32px] h-[32px] flex items-center justify-center rounded-full bg-white duration-300 relative mt-2 ${compareState.compareArray.some((item) => item.id === data.id) ? "active" : ""}`}
                      onClick={(e) => {
                        e.preventDefault();
                        stopProductAction(e);
                        handleQuickviewOpen();
                      }}
                    >
                      <div className="tag-action bg-black text-white caption2 px-1.5 py-0.5 rounded-sm">
                        Vista rápida
                      </div>
                      <Icon.Eye size={20} />
                    </div>
                  ) : (
                    <></>
                  )}
                </div>
              ) : (
                <></>
              )}
              <div className="product-img pointer-events-none relative w-full h-full aspect-[3/4] bg-gray-100 overflow-hidden rounded-2xl group">
                {!imgLoaded && (
                  <div className="absolute inset-0 z-0 bg-gray-200/80 animate-pulse" />
                )}

                <Image
                  key={safeMainImage}
                  src={safeMainImage}
                  width={500}
                  height={500}
                  alt={data.name}
                  loading="lazy"
                  unoptimized
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  onLoad={() => {
                    markProductImageAsLoaded(safeMainImage);
                    setImgLoaded(true);
                  }}
                  onError={() => {
                    if (safeMainImage !== fallbackImage) {
                      setSafeMainImage(fallbackImage);
                    }
                    setImgLoaded(true);
                  }}
                  className={`absolute inset-0 z-10 w-full h-full object-contain bg-white duration-300 transition-opacity opacity-100 ${
                    safeHoverImage && hoverImgLoaded
                      ? "group-hover:opacity-0"
                      : ""
                  }`}
                />

                {imgLoaded && safeHoverImage && (
                  <Image
                    key={safeHoverImage}
                    src={safeHoverImage}
                    width={500}
                    height={500}
                    alt={`${data.name} hover`}
                    loading="lazy"
                  fetchPriority="low"
                    unoptimized
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    onLoad={() => {
                      markProductImageAsLoaded(safeHoverImage);
                      setHoverImgLoaded(true);
                    }}
                    onError={() => {
                      setSafeHoverImage("");
                      setHoverImgLoaded(true);
                    }}
                    className={`absolute inset-0 z-20 w-full h-full object-contain bg-white duration-300 transition-opacity ${
                      hoverImgLoaded
                        ? "opacity-0 group-hover:opacity-100"
                        : "opacity-0"
                    }`}
                  />
                )}
              </div>
              {data.sale && (
                <>
                  <Marquee className="banner-sale-auto bg-black absolute bottom-0 left-0 w-full py-1.5">
                    <div
                      className={`caption2 font-semibold uppercase text-white px-2.5`}
                    >
                      Hot Sale {percentSale}% OFF
                    </div>
                    <Icon.Lightning weight="fill" className="text-danger" />
                    <div
                      className={`caption2 font-semibold uppercase text-white px-2.5`}
                    >
                      Hot Sale {percentSale}% OFF
                    </div>
                    <Icon.Lightning weight="fill" className="text-danger" />
                    <div
                      className={`caption2 font-semibold uppercase text-white px-2.5`}
                    >
                      Hot Sale {percentSale}% OFF
                    </div>
                    <Icon.Lightning weight="fill" className="text-danger" />
                    <div
                      className={`caption2 font-semibold uppercase text-white px-2.5`}
                    >
                      Hot Sale {percentSale}% OFF
                    </div>
                    <Icon.Lightning weight="fill" className="text-danger" />
                    <div
                      className={`caption2 font-semibold uppercase text-white px-2.5`}
                    >
                      Hot Sale {percentSale}% OFF
                    </div>
                    <Icon.Lightning weight="fill" className="text-danger" />
                  </Marquee>
                </>
              )}
              {style === "style-2" || style === "style-4" ? (
                <div className="list-size-block flex items-center justify-center gap-4 absolute bottom-0 left-0 w-full h-8">
                  {data.sizes.map((item, index) => (
                    <strong
                      key={index}
                      className="size-item text-xs font-bold uppercase"
                    >
                      {item}
                    </strong>
                  ))}
                </div>
              ) : (
                <></>
              )}
              {style === "style-1" || style === "style-3" ? (
                <div
                  className={`list-action ${
                    style === "style-1" ? "grid grid-cols-2 gap-3" : ""
                  } px-5 absolute z-[80] pointer-events-auto w-full bottom-5 max-lg:hidden`}
                  style={{ zIndex: 90 }}
                >
                  {style === "style-1" ? (
                    <>
                      <div
                        className="quick-view-btn relative z-[90] w-full text-button-uppercase py-2 text-center rounded-full duration-300 bg-white hover:bg-black hover:text-white"
                        onClick={(e) => {
                          stopProductAction(e);
                          handleQuickviewOpen();
                        }}
                      >
                        Vista rápida
                      </div>

                      <div
                        className={`compare-btn relative z-[90] w-full text-button-uppercase py-2 text-center rounded-full duration-300 bg-white hover:bg-black hover:text-white ${
                          compareState.compareArray.some(
                            (item) => item.id === data.id,
                          )
                            ? "active"
                            : ""
                        }`}
                        onClick={(e) => {
                          stopProductAction(e);
                          handleAddToCompare();
                        }}
                      >
                        {compareState.compareArray.some(
                          (item) => item.id === data.id,
                        )
                          ? "Comparado"
                          : "Comparar"}
                      </div>
                    </>
                  ) : (
                    <></>
                  )}
                </div>
              ) : (
                <></>
              )}
              {style === "style-2" || style === "style-5" ? (
                <>
                  <div
                    className={`list-action flex items-center justify-center gap-3 px-5 absolute z-[80] pointer-events-auto w-full ${style === "style-2" ? "bottom-12" : "bottom-5"} max-lg:hidden`}
                  >
                    {style === "style-2" && (
                      <div
                        className={`add-cart-btn w-9 h-9 flex items-center justify-center rounded-full bg-white duration-300 relative ${compareState.compareArray.some((item) => item.id === data.id) ? "active" : ""}`}
                        onClick={(e) => {
                          stopProductAction(e);
                          handleAddToCart();
                        }}
                      >
                        <div className="tag-action bg-black text-white caption2 px-1.5 py-0.5 rounded-sm">
                          Agregar al carrito
                        </div>
                        <Icon.ShoppingBagOpen size={20} />
                      </div>
                    )}
                    <div
                      className={`add-wishlist-btn w-9 h-9 flex items-center justify-center rounded-full bg-white duration-300 relative ${wishlistState.wishlistArray.some((item) => item.id === data.id) ? "active" : ""}`}
                      onClick={(e) => {
                        stopProductAction(e);
                        handleAddToWishlist();
                      }}
                    >
                      <div className="tag-action bg-black text-white caption2 px-1.5 py-0.5 rounded-sm">
                        Lista de deseos
                      </div>
                      {wishlistState.wishlistArray.some(
                        (item) => item.id === data.id,
                      ) ? (
                        <>
                          <Icon.Heart
                            size={18}
                            weight="fill"
                            className="text-white"
                          />
                        </>
                      ) : (
                        <>
                          <Icon.Heart size={18} />
                        </>
                      )}
                    </div>
                    <div
                      className={`compare-btn w-9 h-9 flex items-center justify-center rounded-full bg-white duration-300 relative ${compareState.compareArray.some((item) => item.id === data.id) ? "active" : ""}`}
                      onClick={(e) => {
                        stopProductAction(e);
                        handleAddToCompare();
                      }}
                    >
                      <div className="tag-action bg-black text-white caption2 px-1.5 py-0.5 rounded-sm">
                        Comparar Producto
                      </div>
                      <Icon.Repeat size={18} className="compare-icon" />
                      <Icon.CheckCircle size={20} className="checked-icon" />
                    </div>
                    <div
                      className={`quick-view-btn w-9 h-9 flex items-center justify-center rounded-full bg-white duration-300 relative ${compareState.compareArray.some((item) => item.id === data.id) ? "active" : ""}`}
                      onClick={(e) => {
                        stopProductAction(e);
                        handleQuickviewOpen();
                      }}
                    >
                      <div className="tag-action bg-black text-white caption2 px-1.5 py-0.5 rounded-sm">
                        Vista rápida
                      </div>
                      <Icon.Eye size={20} />
                    </div>
                    {style === "style-5" && data.action !== "add to cart" && (
                      <div
                        className={`quick-shop-block absolute left-5 right-5 bg-white p-5 rounded-[20px] ${openQuickShop ? "open" : ""}`}
                        onClick={(e) => {
                          stopProductAction(e);
                        }}
                      >
                        <div className="list-size flex items-center justify-center flex-wrap gap-2">
                          {data.sizes.map((item, index) => (
                            <div
                              className={`size-item w-10 h-10 rounded-full flex items-center justify-center text-button bg-white border border-line ${activeSize === item ? "active" : ""}`}
                              key={index}
                              onClick={() => handleActiveSize(item)}
                            >
                              {item}
                            </div>
                          ))}
                        </div>
                        <div
                          className="button-main w-full text-center rounded-full py-3 mt-4"
                          onClick={() => {
                            handleAddToCart();
                            setOpenQuickShop(false);
                          }}
                        >
                          Agregar al carrito
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <></>
              )}
              <div className="list-action-icon flex items-center justify-center gap-2 absolute w-full bottom-3 z-[80] pointer-events-auto lg:hidden">
                <div
                  className="quick-view-btn relative z-[90] w-9 h-9 flex items-center justify-center rounded-lg duration-300 bg-white hover:bg-black hover:text-white"
                  onClick={(e) => {
                    stopProductAction(e);
                    handleQuickviewOpen();
                  }}
                >
                  <Icon.Eye className="text-lg" />
                </div>

                <div
                  className={`compare-btn relative z-[90] w-9 h-9 flex items-center justify-center rounded-lg duration-300 bg-white hover:bg-black hover:text-white ${
                    compareState.compareArray.some(
                      (item) => item.id === data.id,
                    )
                      ? "active"
                      : ""
                  }`}
                  onClick={(e) => {
                    stopProductAction(e);
                    handleAddToCompare();
                  }}
                >
                  <Icon.Repeat className="compare-icon text-lg" />
                  <Icon.CheckCircle className="checked-icon text-lg" />
                </div>
              </div>
            </div>
            <div className="product-infor mt-4 lg:mb-7">
              {/*
              <div className="product-sold sm:pb-4 pb-2">
                <div className="flex items-center gap-2 flex-wrap mt-2">
                  <span className="text-button-uppercase text-text-muted max-sm:text-xs">
                    Estado:
                  </span>
                  <span
                    className={`text-button-uppercase max-sm:text-xs font-semibold ${
                      hasStock ? "text-primary-dark" : "text-danger"
                    }`}
                  >
                    {hasStock ? "Disponible" : "No Disponible"}
                  </span>
                </div>
              </div>
               */}
              <div className="product-name text-title duration-300">
                {data.name}
              </div>
              {data.variation.length > 0 && data.action === "add to cart" && (
                <div className="list-color py-2 max-md:hidden flex items-center gap-2 flex-wrap duration-500">
                  {data.variation.map((item, index) => (
                    <div
                      key={index}
                      className={`color-item w-6 h-6 rounded-full duration-300 relative ${activeColor === item.color ? "active" : ""}`}
                      style={getColorSwatchStyle(item.color || item.colorCode)}
                      onClick={(e) => {
                        stopProductAction(e);
                        handleActiveColor(item.color);
                      }}
                    >
                      <div className="tag-action bg-black text-white caption2 capitalize px-1.5 py-0.5 rounded-sm">
                        {item.color}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {data.variation.length > 0 && data.action === "quick shop" && (
                <div className="list-color-image max-md:hidden flex items-center gap-2 flex-wrap duration-500">
                  {data.variation.map((item, index) => (
                    <div
                      className={`color-item w-8 h-8 rounded-lg duration-300 relative ${activeColor === item.color ? "active" : ""}`}
                      key={index}
                      onClick={(e) => {
                        stopProductAction(e);
                        handleActiveColor(item.color);
                      }}
                    >
                      <Image
                        src={item.colorImage}
                        width={100}
                        height={100}
                        alt="color"
                        loading="lazy"
                        unoptimized
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <div className="tag-action bg-black text-white caption2 capitalize px-1.5 py-0.5 rounded-sm">
                        {item.color}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/*Quitamows el precio original
                            <div className="product-price-block flex items-center gap-2 flex-wrap mt-1 duration-300 relative z-[1]">
                                <div className="product-price text-title">${data.price}.00</div>
                                {percentSale > 0 && (
                                    <>
                                        <div className="product-origin-price caption1 text-text-muted"><del>${data.originPrice}.00</del></div>
                                        <div className="product-sale caption1 font-medium bg-primary-soft px-3 py-0.5 inline-block rounded-full">
                                            -{percentSale}%
                                        </div>
                                    </>
                                )}
                            </div>
                                */}
              {style === "style-5" && (
                <>
                  {data.action === "add to cart" ? (
                    <div
                      className="add-cart-btn w-full text-button-uppercase py-2.5 text-center mt-2 rounded-full duration-300 bg-white border border-black hover:bg-black hover:text-white max-lg:hidden"
                      onClick={(e) => {
                        stopProductAction(e);
                        handleAddToCart();
                      }}
                    >
                      Agregar al carrito
                    </div>
                  ) : (
                    <div
                      className="quick-shop-btn text-button-uppercase py-2.5 text-center mt-2 rounded-full duration-300 bg-white border border-black hover:bg-black hover:text-white max-lg:hidden"
                      onClick={(e) => {
                        stopProductAction(e);
                        setOpenQuickShop(!openQuickShop);
                      }}
                    >
                      Quick Shop
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        <>
          {type === "list" ? (
            <>
              <div className="product-item list-type">
                <div className="product-main cursor-pointer flex lg:items-center sm:justify-between gap-7 max-lg:gap-5">
                  <div
                    onMouseEnter={prefetchProductDetail}
                    onFocus={prefetchProductDetail}
                    onClick={handleProductCardClick}
                    className="product-thumb bg-white relative overflow-hidden rounded-2xl block max-sm:w-1/2"
                  >
                    {data.new && (
                      <div className="product-tag text-button-uppercase bg-primary-soft px-3 py-0.5 inline-block rounded-full absolute top-3 left-3 z-[1]">
                        New
                      </div>
                    )}
                    {data.sale && (
                      <div className="product-tag text-button-uppercase text-white bg-danger px-3 py-0.5 inline-block rounded-full absolute top-3 left-3 z-[1]">
                        Sale
                      </div>
                    )}
                    <div className="product-img relative w-full aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100 group">
                      {!imgLoaded && (
                        <div className="absolute inset-0 z-0 bg-gray-200/80 animate-pulse" />
                      )}

                      <Image
                        key={safeMainImage}
                        src={safeMainImage}
                        width={500}
                        height={500}
                        {...(priorityImage
                          ? { priority: true }
                          : { loading: "lazy" as const })}
                        unoptimized
                        alt={data.name}
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        onLoad={() => {
                          markProductImageAsLoaded(safeMainImage);
                          setImgLoaded(true);
                        }}
                        onError={() => {
                          if (safeMainImage !== fallbackImage) {
                            setSafeMainImage(fallbackImage);
                          }
                          setImgLoaded(true);
                        }}
                        className={`absolute inset-0 z-10 w-full h-full object-cover duration-700 transition-opacity opacity-100 ${
                          safeHoverImage && hoverImgLoaded
                            ? "group-hover:opacity-0"
                            : ""
                        }`}
                      />

                      {safeHoverImage && (
                        <Image
                          key={safeHoverImage}
                          src={safeHoverImage}
                          width={500}
                          height={500}
                          loading="lazy"
                          unoptimized
                          alt={`${data.name} hover`}
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          onLoad={() => {
                            markProductImageAsLoaded(safeHoverImage);
                            setHoverImgLoaded(true);
                          }}
                          onError={() => {
                            setSafeHoverImage("");
                            setHoverImgLoaded(true);
                          }}
                          className={`absolute inset-0 z-20 w-full h-full object-cover duration-700 transition-opacity ${
                            hoverImgLoaded
                              ? "opacity-0 group-hover:opacity-100"
                              : "opacity-0"
                          }`}
                        />
                      )}
                    </div>
                    <div className="list-action px-5 absolute z-[80] pointer-events-auto w-full bottom-5 max-lg:hidden">
                      <div
                        className={`quick-shop-block absolute left-5 right-5 bg-white p-5 rounded-[20px] ${openQuickShop ? "open" : ""}`}
                        onClick={(e) => {
                          stopProductAction(e);
                        }}
                      >
                        <div className="list-size flex items-center justify-center flex-wrap gap-2">
                          {data.sizes.map((item, index) => (
                            <div
                              className={`size-item ${item !== "freesize" ? "w-10 h-10" : "h-10 px-4"} flex items-center justify-center text-button bg-white rounded-full border border-line ${activeSize === item ? "active" : ""}`}
                              key={index}
                              onClick={() => handleActiveSize(item)}
                            >
                              {item}
                            </div>
                          ))}
                        </div>
                        <div
                          className="button-main w-full text-center rounded-full py-3 mt-4"
                          onClick={() => {
                            handleAddToCart();
                            setOpenQuickShop(false);
                          }}
                        >
                          Agregar al carrito
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex sm:items-center gap-7 max-lg:gap-4 max-lg:flex-wrap max-lg:w-full max-sm:flex-col max-sm:w-1/2">
                    <div className="product-infor max-sm:w-full">
                      <div
                        onClick={() =>
                          handleDetailProduct(data.slug || data.id)
                        }
                        className="product-name heading6 inline-block duration-300"
                      >
                        {data.name}
                      </div>
                      <div className="product-price-block flex items-center gap-2 flex-wrap mt-2 duration-300 relative z-[1]">
                        <div className="product-price text-title">
                          ${data.price}.00
                        </div>
                        <div className="product-origin-price caption1 text-text-muted">
                          <del>${data.originPrice}.00</del>
                        </div>
                        {data.originPrice && (
                          <div className="product-sale caption1 font-medium bg-primary-soft px-3 py-0.5 inline-block rounded-full">
                            -{percentSale}%
                          </div>
                        )}
                      </div>
                      {data.variation.length > 0 &&
                      data.action === "add to cart" ? (
                        <div className="list-color max-md:hidden py-2 mt-5 mb-1 flex items-center gap-3 flex-wrap duration-300">
                          {data.variation.map((item, index) => (
                            <div
                              key={index}
                              className={`color-item w-8 h-8 rounded-full duration-300 relative`}
                              style={{ backgroundColor: `${item.colorCode}` }}
                            >
                              <div className="tag-action bg-black text-white caption2 capitalize px-1.5 py-0.5 rounded-sm">
                                {item.color}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <>
                          {data.variation.length > 0 &&
                          data.action === "quick shop" ? (
                            <>
                              <div className="list-color flex items-center gap-2 flex-wrap mt-5">
                                {data.variation.map((item, index) => (
                                  <div
                                    className={`color-item w-12 h-12 rounded-xl duration-300 relative ${activeColor === item.color ? "active" : ""}`}
                                    key={index}
                                    onClick={(e) => {
                                      stopProductAction(e);
                                      handleActiveColor(item.color);
                                    }}
                                  >
                                    <Image
                                      src={item.colorImage}
                                      width={100}
                                      height={100}
                                      alt="color"
                                      loading="lazy"
                                      unoptimized
                                      className="rounded-xl"
                                    />
                                    <div className="tag-action bg-black text-white caption2 capitalize px-1.5 py-0.5 rounded-sm">
                                      {item.color}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </>
                          ) : (
                            <></>
                          )}
                        </>
                      )}
                      <div className="text-text-secondary desc mt-5 max-sm:hidden">
                        {data.description}
                      </div>
                    </div>
                    <div className="action w-fit flex flex-col items-center justify-center">
                      <div
                        className="quick-shop-btn button-main whitespace-nowrap py-2 px-9 max-lg:px-5 rounded-full bg-white text-black border border-black hover:bg-black hover:text-white"
                        onClick={(e) => {
                          stopProductAction(e);
                          setOpenQuickShop(!openQuickShop);
                        }}
                      >
                        Quick Shop
                      </div>
                      <div className="list-action-right flex items-center justify-center gap-3 mt-4">
                        <div
                          className={`add-wishlist-btn w-[32px] h-[32px] flex items-center justify-center rounded-full bg-white duration-300 relative ${wishlistState.wishlistArray.some((item) => item.id === data.id) ? "active" : ""}`}
                          onClick={(e) => {
                            stopProductAction(e);
                            handleAddToWishlist();
                          }}
                        >
                          <div className="tag-action bg-black text-white caption2 px-1.5 py-0.5 rounded-sm">
                            Lista de deseos
                          </div>
                          {wishlistState.wishlistArray.some(
                            (item) => item.id === data.id,
                          ) ? (
                            <>
                              <Icon.Heart
                                size={18}
                                weight="fill"
                                className="text-white"
                              />
                            </>
                          ) : (
                            <>
                              <Icon.Heart size={18} />
                            </>
                          )}
                        </div>
                        <div
                          className={`compare-btn w-[32px] h-[32px] flex items-center justify-center rounded-full bg-white duration-300 relative ${compareState.compareArray.some((item) => item.id === data.id) ? "active" : ""}`}
                          onClick={(e) => {
                            stopProductAction(e);
                            handleAddToCompare();
                          }}
                        >
                          <div className="tag-action bg-black text-white caption2 px-1.5 py-0.5 rounded-sm">
                            Comparar Producto
                          </div>
                          <Icon.ArrowsCounterClockwise
                            size={18}
                            className="compare-icon"
                          />
                          <Icon.CheckCircle
                            size={20}
                            className="checked-icon"
                          />
                        </div>
                        <div
                          className="quick-view-btn-list w-[32px] h-[32px] flex items-center justify-center rounded-full bg-white duration-300 relative"
                          onClick={(e) => {
                            stopProductAction(e);
                            handleQuickviewOpen();
                          }}
                        >
                          <div className="tag-action bg-black text-white caption2 px-1.5 py-0.5 rounded-sm">
                            Vista rápida
                          </div>
                          <Icon.Eye size={18} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <></>
          )}
        </>
      )}

      {type === "marketplace" ? (
        <div
          className="product-item style-marketplace p-4 border border-line rounded-2xl"
          onMouseEnter={prefetchProductDetail}
          onFocus={prefetchProductDetail}
          onClick={handleProductCardClick}
        >
          <div className="bg-img relative w-full">
            <Image
              className="w-full aspect-square"
              width={5000}
              height={5000}
              src={data.thumbImage?.[0] || fallbackImage}
              alt="img"
            />
            <div className="list-action flex flex-col gap-1 absolute top-0 right-0">
              <span
                className={`add-wishlist-btn w-8 h-8 bg-white flex items-center justify-center rounded-full box-shadow-sm duration-300 ${wishlistState.wishlistArray.some((item) => item.id === data.id) ? "active" : ""}`}
                onClick={(e) => {
                  stopProductAction(e);
                  handleAddToWishlist();
                }}
              >
                {wishlistState.wishlistArray.some(
                  (item) => item.id === data.id,
                ) ? (
                  <>
                    <Icon.Heart
                      size={18}
                      weight="fill"
                      className="text-white"
                    />
                  </>
                ) : (
                  <>
                    <Icon.Heart size={18} />
                  </>
                )}
              </span>
              <span
                className={`compare-btn w-8 h-8 bg-white flex items-center justify-center rounded-full box-shadow-sm duration-300 ${compareState.compareArray.some((item) => item.id === data.id) ? "active" : ""}`}
                onClick={(e) => {
                  stopProductAction(e);
                  handleAddToCompare();
                }}
              >
                <Icon.Repeat size={18} className="compare-icon" />
                <Icon.CheckCircle size={20} className="checked-icon" />
              </span>
              <span
                className="quick-view-btn w-8 h-8 bg-white flex items-center justify-center rounded-full box-shadow-sm duration-300"
                onClick={(e) => {
                  stopProductAction(e);
                  handleQuickviewOpen();
                }}
              >
                <Icon.Eye />
              </span>
            </div>
          </div>
        </div>
      ) : (
        <></>
      )}
    </>
  );
};

const Product: React.FC<ProductProps> = (props) => {
  return (
    <Suspense fallback={null}>
      <ProductContent {...props} />
    </Suspense>
  );
};

export default Product;
