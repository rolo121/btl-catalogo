'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import * as Icon from '@phosphor-icons/react/dist/ssr'
import useMenuMobile from '@/store/useMenuMobile'
import { useModalCartContext } from '@/context/ModalCartContext'
import { useCart } from '@/context/CartContext'
import { useWishlist } from '@/context/WishlistContext'
import AccountHeaderButton from '@/components/Auth/AccountHeaderButton'
import CatalogNavigationLoading from '@/components/Other/CatalogNavigationLoading'

const SEARCH_TRANSITION_MIN_MS = 420

const MenuMarketplace = () => {
  const pathname = usePathname()
  const { openMenuMobile, handleMenuMobile } = useMenuMobile()
  const { openModalCart } = useModalCartContext()
  const { cartState } = useCart()
  const { wishlistState } = useWishlist()

  const [searchKeyword, setSearchKeyword] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [pendingSearch, setPendingSearch] = useState('')
  const navigationTimerRef = useRef<number | null>(null)
  const router = useRouter()

  const phoneLabel = '+505 7718 2047'

  useEffect(() => {
    return () => {
      if (navigationTimerRef.current !== null) {
        window.clearTimeout(navigationTimerRef.current)
      }
    }
  }, [])

  const handleSearch = (value: string) => {
    const nextValue = value.trim()

    if (!nextValue || isSearching) return

    setPendingSearch(nextValue)
    setIsSearching(true)

    if (openMenuMobile) {
      handleMenuMobile()
    }

    const searchUrl = `/productos?search=${encodeURIComponent(nextValue)}`

    navigationTimerRef.current = window.setTimeout(() => {
      navigationTimerRef.current = null
      router.push(searchUrl)
    }, SEARCH_TRANSITION_MIN_MS)
  }

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    handleSearch(searchKeyword)
  }

  return (
    <>
      <div className="header-menu bg-white w-full top-0 z-10 duration-500 shadow-[0_8px_24px_rgba(31,31,31,0.04)]">
        <div className="header-menu-main style-marketplace relative bg-white w-full md:h-[82px] h-[64px] border-b border-line">
          <div className="container mx-auto h-full">
            <div className="header-main flex items-center justify-between gap-5 h-full">
              <div className="menu-mobile-icon lg:hidden flex items-center" onClick={handleMenuMobile}>
                <Icon.List className="text-text text-2xl" />
              </div>

              <Link href="/" className="flex items-center shrink-0 leading-none">
                <div className="uppercase tracking-tight">
                  <div className="text-[20px] leading-[18px] font-light text-primary-dark">Total</div>
                  <div className="text-[27px] leading-[25px] font-extrabold text-primary">Promo</div>
                </div>
              </Link>

              <form
                className="form-search flex-1 max-w-[640px] flex items-center h-[46px] max-lg:hidden"
                onSubmit={handleSearchSubmit}
                aria-busy={isSearching}
              >
                <div className="w-full flex items-center h-full rounded-full border border-line bg-surface overflow-hidden focus-within:border-primary focus-within:bg-white duration-300">
                  <Icon.MagnifyingGlass size={20} className="ml-5 text-text-text-secondary" />
                  <input
                    className="search-input h-full px-3 w-full bg-transparent outline-none text-sm text-text placeholder:text-text-muted disabled:cursor-wait disabled:opacity-70"
                    placeholder="Buscar productos promocionales..."
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    disabled={isSearching}
                    aria-label="Buscar productos promocionales"
                  />
                  <button
                    type="submit"
                    className="search-button h-full min-w-[118px] flex items-center justify-center gap-2 px-7 bg-primary-dark text-white font-bold uppercase text-sm duration-300 hover:bg-black disabled:cursor-wait disabled:opacity-80"
                    disabled={isSearching || !searchKeyword.trim()}
                    aria-label={isSearching ? 'Buscando productos' : 'Buscar productos'}
                  >
                    {isSearching ? (
                      <>
                        <Icon.CircleNotch size={18} className="animate-spin" />
                        Buscando...
                      </>
                    ) : (
                      'Buscar'
                    )}
                  </button>
                </div>
              </form>

              <div className="right flex items-center gap-5 shrink-0">
                <div className="list-action flex items-center md:gap-5 gap-4">
                  <AccountHeaderButton />

                  <Link
                    href="/favoritos"
                    className="wishlist-icon relative flex items-center justify-center cursor-pointer text-text duration-300 hover:text-primary-dark"
                    aria-label="Ver favoritos"
                  >
                    <Icon.Heart weight="bold" size={24} />
                    <span className="quantity wishlist-quantity absolute -right-1.5 -top-1.5 text-xs text-white bg-primary w-4 h-4 flex items-center justify-center rounded-full">
                      {wishlistState.wishlistArray.length}
                    </span>
                  </Link>

                  <div className="cart-icon flex items-center relative cursor-pointer text-text duration-300 hover:text-primary-dark" onClick={openModalCart}>
                    <Icon.Handbag weight="bold" size={24} />
                    <span className="quantity cart-quantity absolute -right-1.5 -top-1.5 text-xs text-white bg-primary w-4 h-4 flex items-center justify-center rounded-full">
                      {cartState.cartArray.length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="top-nav-menu relative bg-white border-b border-line h-[46px] max-lg:hidden z-10">
          <div className="container h-full">
            <div className="top-nav-menu-main flex items-center justify-between h-full">
              <div className="menu-main style-eight h-full">
                <ul className="flex items-center gap-8 h-full">
                  <li className="h-full">
                    <Link href="/productos" className={`text-button-uppercase duration-300 h-full flex items-center justify-center hover:text-primary-dark ${pathname === '/productos' ? 'active text-primary-dark' : 'text-text'}`}>
                      Catálogo
                    </Link>
                  </li>
                  <li className="h-full">
                    <Link href="/nosotros" className={`text-button-uppercase duration-300 h-full flex items-center justify-center hover:text-primary-dark ${pathname === '/nosotros' ? 'active text-primary-dark' : 'text-text'}`}>
                      Nosotros
                    </Link>
                  </li>
                  <li className="h-full">
                    <Link href="/contacto" className={`text-button-uppercase duration-300 h-full flex items-center justify-center hover:text-primary-dark ${pathname === '/contacto' ? 'active text-primary-dark' : 'text-text'}`}>
                      Contacto
                    </Link>
                  </li>
                  <li className="h-full">
                    <Link href="/preguntas-frecuentes" className={`text-button-uppercase duration-300 h-full flex items-center justify-center hover:text-primary-dark ${pathname === '/preguntas-frecuentes' ? 'active text-primary-dark' : 'text-text'}`}>
                      Preguntas frecuentes
                    </Link>
                  </li>
                </ul>
              </div>

              <a
                href="https://wa.me/50577182047"
                target="_blank"
                rel="noreferrer"
                className="right flex items-center gap-2 text-text duration-300 hover:text-whatsapp"
              >
                <Icon.WhatsappLogo size={20} weight="fill" className="text-whatsapp" />
                <div className="caption1 text-text-text-secondary">WhatsApp:</div>
                <div className="text-button-uppercase">{phoneLabel}</div>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div id="menu-mobile" className={`${openMenuMobile ? 'open' : ''}`}>
        <div className="menu-container bg-white h-full">
          <div className="container h-full">
            <div className="menu-main h-full overflow-hidden">
              <div className="heading py-2 relative flex items-center justify-center">
                <div
                  className="close-menu-mobile-btn absolute left-0 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-surface flex items-center justify-center"
                  onClick={handleMenuMobile}
                >
                  <Icon.X size={14} />
                </div>
                <Link href="/" className="logo text-3xl font-semibold text-center text-primary">BTL Marketing</Link>
              </div>

              <form
                className="form-search relative mt-2"
                onSubmit={handleSearchSubmit}
                aria-busy={isSearching}
              >
                <button
                  type="submit"
                  className="absolute left-3 top-1/2 z-10 -translate-y-1/2 text-text-text-secondary disabled:cursor-wait"
                  disabled={isSearching || !searchKeyword.trim()}
                  aria-label={isSearching ? 'Buscando productos' : 'Buscar productos'}
                >
                  {isSearching ? (
                    <Icon.CircleNotch size={20} className="animate-spin" />
                  ) : (
                    <Icon.MagnifyingGlass size={20} />
                  )}
                </button>
                <input
                  placeholder="Buscar productos promocionales..."
                  className="h-12 rounded-lg border border-line text-sm w-full pl-10 pr-4 text-text placeholder:text-text-muted disabled:cursor-wait disabled:opacity-70"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  disabled={isSearching}
                  aria-label="Buscar productos promocionales"
                />
              </form>

              <div className="mt-5">
                <AccountHeaderButton variant="menu" onNavigate={handleMenuMobile} />
              </div>

              <div className="list-nav mt-6">
                <ul className="flex flex-col gap-5">
                  <li>
                    <Link href="/productos" className={`text-xl font-semibold block ${pathname === '/productos' ? 'active text-primary-dark' : 'text-text'}`} onClick={handleMenuMobile}>
                      Catálogo
                    </Link>
                  </li>
                  <li>
                    <Link href="/nosotros" className={`text-xl font-semibold block ${pathname === '/nosotros' ? 'active text-primary-dark' : 'text-text'}`} onClick={handleMenuMobile}>
                      Nosotros
                    </Link>
                  </li>
                  <li>
                    <Link href="/contacto" className={`text-xl font-semibold block ${pathname === '/contacto' ? 'active text-primary-dark' : 'text-text'}`} onClick={handleMenuMobile}>
                      Contacto
                    </Link>
                  </li>
                  <li>
                    <Link href="/preguntas-frecuentes" className={`text-xl font-semibold block ${pathname === '/preguntas-frecuentes' ? 'active text-primary-dark' : 'text-text'}`} onClick={handleMenuMobile}>
                      Preguntas frecuentes
                    </Link>
                  </li>
                </ul>
              </div>

              <a
                href="https://wa.me/50577182047"
                target="_blank"
                rel="noreferrer"
                className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-whatsapp px-5 py-3 font-bold text-white"
              >
                <Icon.WhatsappLogo size={22} weight="fill" />
                WhatsApp: {phoneLabel}
              </a>
            </div>
          </div>
        </div>
      </div>

      {isSearching ? (
        <CatalogNavigationLoading query={pendingSearch} overlay />
      ) : null}
    </>
  )
}

export default MenuMarketplace
