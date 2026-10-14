'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import * as Icon from "@phosphor-icons/react/dist/ssr";
import { usePathname } from 'next/navigation';
import useMenuMobile from '@/store/useMenuMobile';
import { useModalCartContext } from '@/context/ModalCartContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import AccountHeaderButton from '@/components/Auth/AccountHeaderButton';

interface Props {
    props: string;
}

const MenuOne: React.FC<Props> = ({ props }) => {
    const pathname = usePathname()
    const { openMenuMobile, handleMenuMobile } = useMenuMobile()
    const { openModalCart } = useModalCartContext()
    const { cartState } = useCart()
    const { wishlistState } = useWishlist()

    const [fixedHeader, setFixedHeader] = useState(false)
    const [lastScrollPosition, setLastScrollPosition] = useState(0)

    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY
            setFixedHeader(scrollPosition > 0 && scrollPosition < lastScrollPosition)
            setLastScrollPosition(scrollPosition)
        }

        window.addEventListener('scroll', handleScroll)
        return () => {
            window.removeEventListener('scroll', handleScroll)
        }
    }, [lastScrollPosition])

    const menuItems = [
        { label: 'Catálogo', href: '/productos' },
        { label: 'Nosotros', href: '/nosotros' },
        { label: 'Contacto', href: '/contacto' },
        { label: 'Preguntas frecuentes', href: '/preguntas-frecuentes' },
    ]

    return (
        <>
            <div className={`header-menu style-one catalog-menu-one ${fixedHeader ? 'fixed bg-white/95 shadow-sm backdrop-blur-md' : 'relative bg-white'} top-0 left-0 right-0 w-full md:h-[78px] h-[60px] border-b border-line z-[100] ${props}`}>
                <div className="container mx-auto h-full">
                    <div className="header-main flex items-center justify-between h-full">
                        <button
                            type="button"
                            aria-label="Abrir menú"
                            className="menu-mobile-icon lg:hidden flex items-center justify-center w-10 h-10 rounded-full bg-surface-alt text-text-strong"
                            onClick={handleMenuMobile}
                        >
                            <Icon.List size={24} weight="bold" />
                        </button>

                        <div className="left flex items-center h-full shrink-0">
                            <Link href={'/'} className='flex items-center max-lg:absolute max-lg:left-1/2 max-lg:-translate-x-1/2'>
                                <div className="leading-none tracking-tight">
                                    <div className="text-[18px] font-medium text-primary uppercase">Total</div>
                                    <div className="-mt-1 text-[26px] font-extrabold text-primary uppercase">Promo</div>
                                </div>
                            </Link>
                        </div>

                        <nav className="center flex-1 flex justify-center h-full max-lg:hidden" aria-label="Navegación principal">
                            <div className="menu-main h-full">
                                <ul className='flex items-center gap-8 h-full'>
                                    {menuItems.map((item) => {
                                        const isActive = pathname === item.href
                                        return (
                                            <li className='h-full' key={item.href}>
                                                <Link
                                                    href={item.href}
                                                    className={`text-button-uppercase duration-300 h-full flex items-center justify-center text-text-strong hover:text-primary-dark relative before:hidden after:hidden ${isActive ? 'text-primary-dark' : ''}`}
                                                >
                                                    {item.label}
                                                    {isActive && (
                                                        <span className="absolute bottom-[18px] left-0 right-0 h-[2px] rounded-full bg-primary" />
                                                    )}
                                                </Link>
                                            </li>
                                        )
                                    })}
                                </ul>
                            </div>
                        </nav>

                        <div className="right flex items-center gap-5 shrink-0">
                            <div className="list-action flex items-center gap-4">
                                <AccountHeaderButton />

                                <Link href="/favoritos" className="wishlist-icon flex items-center justify-center cursor-pointer relative" aria-label="Ver favoritos">
                                    <Icon.Heart size={24} weight="bold" className="text-text-strong hover:text-primary-dark duration-300" />
                                    <span className="quantity wishlist-quantity absolute -right-1.5 -top-1.5 text-xs text-white bg-primary w-4 h-4 flex items-center justify-center rounded-full">
                                        {wishlistState.wishlistArray.length}
                                    </span>
                                </Link>
                                     
                                <div className="cart-icon flex items-center relative cursor-pointer" onClick={openModalCart}>
                                    <Icon.Handbag size={24} className="text-text-strong hover:text-primary-dark duration-300" />
                                    <span className="quantity cart-quantity absolute -right-1.5 -top-1.5 text-xs text-white bg-primary w-4 h-4 flex items-center justify-center rounded-full">
                                        {cartState.cartArray.length}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            <style jsx global>{`
                .catalog-menu-one .menu-main ul li a::before,
                .catalog-menu-one .menu-main ul li a::after {
                    display: none !important;
                    content: none !important;
                }

                .catalog-menu-one .menu-main ul li a:hover::before,
                .catalog-menu-one .menu-main ul li a:hover::after {
                    display: none !important;
                    content: none !important;
                }
            `}</style>

            <div id="menu-mobile" className={`${openMenuMobile ? 'open' : ''}`}>
                <div className="menu-container bg-white h-full">
                    <div className="container h-full">
                        <div className="menu-main h-full overflow-hidden">
                            <div className="heading py-3 relative flex items-center justify-center border-b border-line">
                                <button
                                    type="button"
                                    aria-label="Cerrar menú"
                                    className="close-menu-mobile-btn absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-surface flex items-center justify-center text-text-strong"
                                    onClick={handleMenuMobile}
                                >
                                    <Icon.X size={16} />
                                </button>
                                <Link href={'/'} className='logo text-2xl font-bold text-center text-primary'>BTL Marketing</Link>
                            </div>

                            <div className="mt-6">
                                <AccountHeaderButton variant="menu" onNavigate={handleMenuMobile} />
                            </div>

                            <div className="list-nav mt-8">
                                <ul className="flex flex-col gap-5">
                                    {menuItems.map((item) => (
                                        <li key={item.href}>
                                            <Link
                                                href={item.href}
                                                className={`text-xl font-semibold block duration-300 ${pathname === item.href ? 'text-primary-dark' : 'text-text-strong hover:text-primary-dark'}`}
                                                onClick={handleMenuMobile}
                                            >
                                                {item.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

           <div className="menu_bar fixed bg-white bottom-0 left-0 w-full h-[70px] sm:hidden z-[101] border-t border-line">
    <div className="menu_bar-inner grid grid-cols-4 items-center h-full">
        <Link
            href={'/'}
            className={`menu_bar-link flex flex-col items-center gap-1 ${
                pathname === '/'
                    ? 'text-primary-dark'
                    : 'text-text-secondary hover:text-primary-dark'
            }`}
        >
            <Icon.House weight={pathname === '/' ? 'fill' : 'bold'} className='text-2xl' />
            <span className="menu_bar-title caption2 font-semibold">Inicio</span>
        </Link>

        <Link
            href={'/productos'}
            className={`menu_bar-link flex flex-col items-center gap-1 ${
                pathname.startsWith('/productos')
                    ? 'text-primary-dark'
                    : 'text-text-secondary hover:text-primary-dark'
            }`}
        >
            <Icon.List weight='bold' className='text-2xl' />
            <span className="menu_bar-title caption2 font-semibold">Catálogo</span>
        </Link>

        <Link
            href={'/contacto'}
            className={`menu_bar-link flex flex-col items-center gap-1 ${
                pathname.startsWith('/contacto')
                    ? 'text-primary-dark'
                    : 'text-text-secondary hover:text-primary-dark'
            }`}
        >
            <Icon.ChatCircleDots weight={pathname.startsWith('/contacto') ? 'fill' : 'bold'} className='text-2xl' />
            <span className="menu_bar-title caption2 font-semibold">Contacto</span>
        </Link>

        <AccountHeaderButton
            variant="bottom"
            className={pathname.startsWith('/mi-cuenta') || pathname.startsWith('/iniciar-sesion') ? 'text-primary-dark' : 'text-text-secondary hover:text-primary-dark'}
        />
    </div>
</div>
        </>
    )
}

export default MenuOne
