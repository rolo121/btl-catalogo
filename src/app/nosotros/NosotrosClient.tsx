'use client'

import React from 'react'
import Link from 'next/link'
import * as Icon from '@phosphor-icons/react/dist/ssr'
import TopNavOne from '@/components/Header/TopNav/TopNavOne'
import MenuOne from '@/components/Header/Menu/MenuOne'
import Footer from '@/components/Footer/Footer'

const NosotrosClient = () => {
  // aquí va todo el contenido actual que tienes en page.tsx
    const whatsappNumber = '50577182047'
    const phoneLabel = '+505 7718 2047'
    const email = 'ventas1@btlmarketing.com.ni'
    const location = 'Altamira, Managua, Nicaragua'
    const whatsappMessage = encodeURIComponent('Hola, quiero recibir información sobre artículos promocionales.')
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`

    const services = [
        {
            title: 'Artículos promocionales',
            description: 'Opciones funcionales para empresas, eventos, campañas, lanzamientos y regalos corporativos.',
            icon: Icon.Package,
        },
        {
            title: 'Personalización para marcas',
            description: 'Productos pensados para acompañar tu identidad visual, mensaje de campaña y objetivo comercial.',
            icon: Icon.Palette,
        },
        {
            title: 'Atención y cotización',
            description: 'Un proceso práctico para explorar productos, solicitar información y recibir acompañamiento personalizado.',
            icon: Icon.ChatCircleText,
        },
    ]

    const steps = [
        {
            number: '01',
            title: 'Explorás el catálogo',
            description: 'Revisá productos promocionales por categoría, disponibilidad o tipo de artículo.',
        },
        {
            number: '02',
            title: 'Elegís productos de interés',
            description: 'Seleccioná las opciones que mejor se ajusten a tu marca, evento o campaña.',
        },
        {
            number: '03',
            title: 'Recibís atención personalizada',
            description: 'Te acompañamos para definir cantidades, personalización y próximos pasos.',
        },
    ]

    const highlights = [
        'Catálogo amplio de productos promocionales',
        'Atención directa por WhatsApp',
        'Opciones para empresas, eventos y campañas',
        'Proceso práctico para solicitar información',
    ]

    return (
        <>
            <TopNavOne
                props="style-marketplace bg-primary-dark border-b border-primary"
                slogan="Cotizá artículos promocionales personalizados para tu marca."
            />
            <div id="header" className="relative w-full">
                <MenuOne props="bg-white" />
            </div>

            <section className="bg-surface-warm border-b border-line overflow-hidden">
                <div className="container relative md:py-20 py-12">
                    <div className="absolute -left-20 -bottom-24 w-44 h-44 rounded-full border-[24px] border-brand-dark hidden md:block"></div>
                    <div className="absolute right-[-80px] top-[-120px] w-72 h-72 rounded-full bg-primary/10 hidden lg:block"></div>

                    <div className="relative z-[1] max-w-[760px] mx-auto text-center">
                        <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm border border-line mb-5">
                            <Icon.Sparkle size={16} weight="fill" className="text-primary-dark" />
                            <span className="caption1 text-primary-dark uppercase tracking-widest font-semibold">Sobre BTL Marketing</span>
                        </div>
                        <p className="heading1 text-text-strong">Nosotros</p>
                        <p className="body1 text-text-secondary mt-4 max-w-[680px] mx-auto">
                            Conocé cómo ayudamos a marcas, empresas y eventos a encontrar artículos promocionales personalizados.
                        </p>
                        <div className="flex items-center justify-center gap-2 mt-6 caption1 text-text-muted">
                            <Link href="/" className="hover:text-primary-dark duration-200">Inicio</Link>
                            <Icon.CaretRight size={14} />
                            <span className="text-text-strong font-semibold">Nosotros</span>
                        </div>
                    </div>
                </div>
            </section>

            <main className='about-page'>
                <section className="about-hero md:py-20 py-12 bg-white">
                    <div className="container">
                        <div className="grid lg:grid-cols-12 grid-cols-1 gap-10 items-center">
                            <div className="lg:col-span-7">
                                <div className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-4 py-2 mb-5">
                                    <span className="w-2 h-2 rounded-full bg-primary"></span>
                                    <span className="caption1 text-text-secondary uppercase tracking-widest">Sobre BTL Marketing</span>
                                </div>

                                <h1 className="heading1 max-w-[760px] text-text-strong">
                                    Impulsamos marcas con artículos promocionales personalizados
                                </h1>

                                <p className="body1 text-text-secondary md:mt-6 mt-4 max-w-[700px]">
                                    En BTL Marketing ayudamos a empresas, negocios y marcas a encontrar productos promocionales funcionales, atractivos y alineados a sus objetivos de comunicación. Nuestro enfoque combina variedad de productos, atención personalizada y un proceso práctico para solicitar información.
                                </p>

                               <div className="hidden sm:flex items-center gap-4 mt-8">
                                    <Link href="/productos" className="button-main">
                                        Ver catálogo
                                    </Link>
                                    <Link
                                        href={whatsappUrl}
                                        target="_blank"
                                        className="button-main bg-white text-primary-dark border border-primary hover:bg-primary hover:text-white"
                                    >
                                        Escribir por WhatsApp
                                    </Link>
                                    </div>
                            </div>

                            <div className="lg:col-span-5">
                                <div className="relative rounded-[32px] bg-brand-dark text-white md:p-8 p-6 overflow-hidden">
                                    <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-primary/25"></div>
                                    <div className="absolute -left-20 -bottom-20 w-60 h-60 rounded-full bg-white/5"></div>

                                    <div className="relative z-[1]">
                                        <div className="caption1 uppercase tracking-widest text-white/60">BTL Marketing</div>
                                        <h2 className="heading3 mt-4 text-white">
                                            Todo lo que tu marca necesita, en un solo lugar.
                                        </h2>

                                        <div className="grid grid-cols-2 gap-4 mt-8 max-sm:grid-cols-1">
                                            <div className="rounded-2xl bg-white/10 border border-white/10 p-5">
                                                <div className="heading5 text-white">Catálogo diverso</div>
                                                <div className="caption1 text-white/65 mt-2">
                                                Opciones promocionales para diferentes necesidades de marca.
                                                </div>
                                            </div>

                                            <div className="rounded-2xl bg-white/10 border border-white/10 p-5">
                                                <div className="heading5 text-white">Disponibilidad flexible</div>
                                                <div className="caption1 text-white/65 mt-2">
                                                Alternativas según tipo de producto, campaña y tiempos requeridos.
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-8 pt-6 border-t border-white/10 flex items-center gap-3">
                                            <Icon.WhatsappLogo size={26} />
                                            <div>
                                                <div className="caption1 text-white/60">Atención directa</div>
                                                <div className="text-button text-white">{phoneLabel}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="what-we-do md:py-20 py-12 bg-surface">
                    <div className="container">
                        <div className="max-w-[760px] mx-auto text-center">
                            <div className="caption1 text-text-secondary uppercase tracking-widest mb-3">Qué hacemos</div>
                            <h2 className="heading2 text-text-strong">Soluciones promocionales para empresas, eventos y marcas</h2>
                            <p className="body1 text-text-secondary mt-4">
                                Convertimos productos cotidianos en herramientas de recordación, presencia y comunicación para tu marca.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 md:mt-12 mt-8">
                        {services.map((item, index) => {
                            const ServiceIcon = item.icon

                            return (
                            <div
                                key={item.title}
                                className={`group rounded-[24px] bg-white border border-line px-4 py-5 text-center duration-300 hover:shadow-lg hover:border-primary/30 md:rounded-[28px] md:p-8 md:text-left ${
                                index === 2
                                    ? 'col-span-2 mx-auto w-[58%] md:col-span-1 md:mx-0 md:w-auto'
                                    : ''
                                }`}
                            >
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary-dark duration-300 group-hover:bg-primary group-hover:text-white md:mx-0 md:h-14 md:w-14">
                                <ServiceIcon size={24} className="md:hidden" />
                                <ServiceIcon size={28} className="hidden md:block" />
                                </div>

                                <h3 className="mt-4 text-[14px] font-semibold leading-tight text-text-strong md:mt-6 md:heading5">
                                {item.title}
                                </h3>

                                <p className="hidden body2 text-text-secondary mt-3 md:block">
                                {item.description}
                                </p>
                            </div>
                            )
                        })}
                        </div>
                    </div>
                </section>

                <section className="why-BTL Marketing md:py-20 py-12 bg-white">
                    <div className="container">
                        <div className="grid lg:grid-cols-2 grid-cols-1 gap-10 items-center">
                            <div>
                                <div className="caption1 text-text-secondary uppercase tracking-widest mb-3">Por qué elegirnos</div>
                                <h2 className="heading2 text-text-strong">Una forma más simple de encontrar productos para tu marca</h2>
                                <p className="body1 text-text-secondary mt-5">
                                    Sabemos que cada proyecto tiene una necesidad distinta. Por eso reunimos opciones promocionales y atención personalizada para ayudarte a tomar una mejor decisión antes de cotizar.
                                </p>

                                <div className="grid sm:grid-cols-2 grid-cols-1 gap-4 mt-8">
                                    {highlights.map((item) => (
                                        <div key={item} className="flex items-start gap-3">
                                            <div className="w-6 h-6 rounded-full bg-primary/10 text-primary-dark flex items-center justify-center shrink-0 mt-0.5">
                                                <Icon.Check size={16} weight="bold" />
                                            </div>
                                            <p className="body2 text-text-secondary">{item}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="hidden md:block rounded-[32px] bg-surface-warm md:p-8 p-5 border border-line">
                                <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
                                    <div className="rounded-[24px] bg-white border border-line p-6 min-h-[170px] flex flex-col justify-between">
                                        <Icon.MagnifyingGlass size={30} />
                                        <div>
                                            <div className="heading5 text-text-strong">Explorá</div>
                                            <p className="caption1 text-text-secondary mt-2">Buscá productos según tu necesidad.</p>
                                        </div>
                                    </div>
                                    <div className="rounded-[24px] bg-primary text-white p-6 min-h-[170px] flex flex-col justify-between shadow-brand">
                                        <Icon.Handbag size={30} />
                                        <div>
                                            <div className="heading5 text-white">Seleccioná</div>
                                            <p className="caption1 text-white/75 mt-2">Elegí artículos de interés.</p>
                                        </div>
                                    </div>
                                    <div className="rounded-[24px] bg-brand-dark text-white p-6 min-h-[170px] flex flex-col justify-between">
                                        <Icon.ChatCircleText size={30} />
                                        <div>
                                            <div className="heading5 text-white">Consultá</div>
                                            <p className="caption1 text-white/75 mt-2">Recibí atención personalizada.</p>
                                        </div>
                                    </div>
                                    <div className="rounded-[24px] bg-white border border-line p-6 min-h-[170px] flex flex-col justify-between">
                                        <Icon.SealCheck size={30} />
                                        <div>
                                            <div className="heading5 text-text-strong">Cotizá</div>
                                            <p className="caption1 text-text-secondary mt-2">Definí productos, cantidad y detalles.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="how-work md:py-20 py-12 bg-surface">
                    <div className="container">
                        <div className="flex items-end justify-between gap-8 max-md:flex-col max-md:items-start">
                            <div className="max-w-[620px]">
                                <div className="caption1 text-text-secondary uppercase tracking-widest mb-3">Cómo trabajamos</div>
                                <h2 className="heading2 text-text-strong">Un proceso práctico para encontrar el producto ideal</h2>
                            </div>
                            <p className="body1 text-text-secondary max-w-[520px]">
                                Nuestro flujo está pensado para que podás pasar de la búsqueda a la atención personalizada sin complicaciones.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 grid-cols-1 gap-6 md:mt-12 mt-8">
                            {steps.map((step) => (
                                <div key={step.number} className="relative rounded-[28px] bg-white border border-line p-7 overflow-hidden hover:shadow-lg hover:border-primary/30 duration-300">
                                    <div className="absolute -right-3 -top-6 text-[96px] font-semibold text-text-strong/[0.04] leading-none">
                                        {step.number}
                                    </div>
                                    <div className="relative z-[1]">
                                        <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-button shadow-brand">
                                            {step.number}
                                        </div>
                                        <h3 className="heading5 mt-6 text-text-strong">{step.title}</h3>
                                        <p className="body2 text-text-secondary mt-3">{step.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="about-contact md:py-20 py-12 bg-white">
                    <div className="container">
                        <div className="rounded-[32px] bg-brand-dark text-white md:p-10 p-6">
                            <div className="grid lg:grid-cols-2 grid-cols-1 gap-8 items-center">
                                <div>
                                    <div className="caption1 uppercase tracking-widest text-white/60 mb-3">Contacto</div>
                                    <h2 className="heading2 text-white">¿Buscás productos promocionales para tu marca?</h2>
                                    <p className="body1 text-white/70 mt-4">
                                        Escribinos y recibí asesoría personalizada para encontrar artículos promocionales alineados a tu marca, evento o campaña.
                                    </p>

                                    <div className="flex items-center gap-4 mt-8 max-sm:flex-col max-sm:items-stretch">
                                        <Link href={whatsappUrl} target="_blank" className="button-main bg-whatsapp text-white hover:bg-whatsapp/90 max-sm:text-center">
                                            WhatsApp
                                        </Link>
                                        <Link href={`mailto:${email}`} className="button-main bg-transparent text-white border border-white hover:bg-white hover:text-brand-dark max-sm:text-center">
                                            Enviar correo
                                        </Link>
                                    </div>
                                </div>

                                <div className="grid sm:grid-cols-1 grid-cols-1 gap-4">
                                    <Link href={whatsappUrl} target="_blank" className="rounded-2xl bg-white/10 border border-white/10 p-5 flex items-center gap-4">
                                        <Icon.WhatsappLogo size={28} />
                                        <div>
                                            <div className="caption1 text-white/60">WhatsApp</div>
                                            <div className="text-button text-white">{phoneLabel}</div>
                                        </div>
                                    </Link>
                                    <Link href={`mailto:${email}`} className="rounded-2xl bg-white/10 border border-white/10 p-5 flex items-center gap-4">
                                        <Icon.EnvelopeSimple size={28} />
                                        <div>
                                            <div className="caption1 text-white/60">Correo</div>
                                            <div className="text-button text-white break-all">{email}</div>
                                        </div>
                                    </Link>
                                    <div className="rounded-2xl bg-white/10 border border-white/10 p-5 flex items-center gap-4">
                                        <Icon.MapPin size={28} />
                                        <div>
                                            <div className="caption1 text-white/60">Ubicación</div>
                                            <div className="text-button text-white">{location}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </>
    )
}


export default NosotrosClient
