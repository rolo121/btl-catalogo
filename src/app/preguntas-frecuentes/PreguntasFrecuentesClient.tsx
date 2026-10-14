'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import TopNavOne from '@/components/Header/TopNav/TopNavOne'
import MenuOne from '@/components/Header/Menu/MenuOne'
import Footer from '@/components/Footer/Footer'
import * as Icon from "@phosphor-icons/react/dist/ssr"

import { faqGroups } from '@/lib/faqData'

const PreguntasFrecuentesClient = () => {
    const [activeTab, setActiveTab] = useState<string>(faqGroups[0].id)
    const [activeQuestion, setActiveQuestion] = useState<string>('')

    const activeGroup = faqGroups.find((group) => group.id === activeTab) || faqGroups[0]

    const handleActiveTab = (tab: string) => {
        setActiveTab(tab)
        setActiveQuestion('')
    }

    const handleActiveQuestion = (question: string) => {
        setActiveQuestion((prevQuestion) => prevQuestion === question ? '' : question)
    }

    return (
        <>
            <TopNavOne
                props="style-marketplace bg-primary-dark border-b border-primary"
                slogan="Cotizá artículos promocionales personalizados para tu marca."
            />

            <div id="header" className="relative w-full">
                <MenuOne props="bg-white" />
            </div>

            <section className="relative overflow-hidden bg-surface-warm border-t border-line">
                <div className="absolute -left-16 bottom-[-70px] h-[180px] w-[180px] rounded-full border-[28px] border-brand-dark/95 max-md:hidden" />
                <div className="absolute right-[-80px] top-[-80px] h-[220px] w-[220px] rounded-full bg-secondary-soft/70 max-md:hidden" />

                <div className="container md:py-20 py-12">
                    <div className="grid lg:grid-cols-[1fr_420px] grid-cols-1 items-center gap-10">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-button-uppercase text-primary-dark shadow-sm">
                                <Icon.Sparkle size={16} weight="fill" />
                                Centro de ayuda
                            </div>

                            <h1 className="heading1 mt-6 text-text-strong max-w-[760px]">
                                Preguntas frecuentes
                            </h1>

                            <p className="body1 mt-4 max-w-[680px] text-text-secondary">
                                Resolvé tus dudas sobre catálogo, disponibilidad, personalización, tiempos de entrega
                                y el proceso para solicitar información de artículos promocionales.
                            </p>

                            <div className="mt-7 flex items-center gap-2 text-text-muted">
                                <Link href="/" className="duration-300 hover:text-primary-dark">Inicio</Link>
                                <Icon.CaretRight size={16} />
                                <span className="font-semibold text-text-strong">Preguntas frecuentes</span>
                            </div>
                        </div>

                        <div className="rounded-[28px] border border-line bg-white/80 p-5 shadow-soft backdrop-blur-sm">
                            <div className="rounded-[22px] border border-dashed border-line bg-white px-7 py-8">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft text-primary-dark">
                                    <Icon.Question size={30} weight="duotone" />
                                </div>
                                <h2 className="heading5 mt-5 text-text-strong">¿Necesitás ayuda personalizada?</h2>
                                <p className="body2 mt-3 text-text-secondary">
                                    Si tenés una consulta específica, podés escribirnos y te orientamos según el producto,
                                    cantidad, presupuesto o fecha de entrega.
                                </p>
                                <div className="mt-6 flex flex-wrap gap-3">
                                    <Link href="/contacto" className="button-main">
                                        Ir a contacto
                                    </Link>
                                    <Link
                                        href="/productos"
                                        className="button-main bg-white text-text-strong border border-line hover:border-primary hover:bg-primary-soft"
                                    >
                                        Ver catálogo
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <main className="faqs-block bg-surface md:py-20 py-12">
                <div className="container">
                   <section className="mb-12 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5">
                    <div className="rounded-[22px] border border-line bg-white px-4 py-5 text-center shadow-sm md:p-6 md:text-left">
                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-primary-dark md:mx-0 md:mb-4">
                        <Icon.Package size={24} weight="duotone" />
                        </div>

                        <h3 className="text-[14px] font-semibold leading-tight text-text-strong md:heading6">
                        Catálogo claro
                        </h3>

                        <p className="hidden body2 mt-2 text-text-secondary md:block">
                        Información útil para revisar productos, disponibilidad e imágenes referenciales.
                        </p>
                    </div>

                    <div className="rounded-[22px] border border-line bg-white px-4 py-5 text-center shadow-sm md:p-6 md:text-left">
                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-primary-dark md:mx-0 md:mb-4">
                        <Icon.PencilSimpleLine size={24} weight="duotone" />
                        </div>

                        <h3 className="text-[14px] font-semibold leading-tight text-text-strong md:heading6">
                        Personalización
                        </h3>

                        <p className="hidden body2 mt-2 text-text-secondary md:block">
                        Recomendaciones sobre logo, archivos, técnicas y detalles para aplicar tu marca.
                        </p>
                    </div>

                    <div className="col-span-2 mx-auto w-[58%] rounded-[22px] border border-line bg-white px-4 py-5 text-center shadow-sm md:col-span-1 md:mx-0 md:w-auto md:p-6 md:text-left">
                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-primary-dark md:mx-0 md:mb-4">
                        <Icon.Headset size={24} weight="duotone" />
                        </div>

                        <h3 className="text-[14px] font-semibold leading-tight text-text-strong md:heading6">
                        Atención directa
                        </h3>

                        <p className="hidden body2 mt-2 text-text-secondary md:block">
                        Acompañamiento para validar disponibilidad, cantidades, tiempos y opciones para tu campaña.
                        </p>
                    </div>
                    </section>

                    <section className="grid lg:grid-cols-[330px_1fr] grid-cols-1 gap-8">
                        <aside className="lg:sticky lg:top-28 h-fit">
                            <div className="rounded-[26px] border border-line bg-white md:p-6 p-4 shadow-sm">
                                <div>
                                    <h2 className="heading5 text-text-strong">Temas de ayuda</h2>
                                    <p className="body2 mt-2 text-text-secondary">Seleccioná una categoría para ver preguntas relacionadas.</p>
                                </div>

                                <div className="mt-6 h-px bg-line" />

                                <div className="menu-tab mt-6 flex lg:flex-col flex-row gap-3 overflow-x-auto lg:overflow-visible pb-1">
                                    {faqGroups.map((item) => {
                                        const isActive = activeTab === item.id

                                        return (
                                            <button
                                                type="button"
                                                key={item.id}
                                                className={`tab-item group flex min-w-fit items-center justify-between gap-4 rounded-2xl border px-4 py-3 text-left duration-300 lg:min-w-0 ${isActive
                                                    ? 'bg-primary-soft text-primary-dark border-primary/40'
                                                    : 'bg-white text-text-secondary border-line hover:border-primary/40 hover:bg-surface-alt hover:text-text-strong'
                                                    }`}
                                                onClick={() => handleActiveTab(item.id)}
                                            >
                                                <span className="text-button">{item.label}</span>
                                                <Icon.CaretRight
                                                    size={16}
                                                    className={`shrink-0 duration-300 ${isActive ? 'text-primary-dark' : 'text-text-muted group-hover:text-primary-dark'}`}
                                                />
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        </aside>

                        <div>
                            <div className="mb-6 rounded-[26px] border border-line bg-white p-6 shadow-sm">
                                <div className="text-button-uppercase text-primary-dark">{activeGroup.label}</div>
                                <h2 className="heading4 mt-2 text-text-strong">Información sobre {activeGroup.label.toLowerCase()}</h2>
                                <p className="body1 mt-3 text-text-secondary">{activeGroup.description}</p>
                            </div>

                            <div className="tab-question flex flex-col gap-4 active">
                                {activeGroup.questions.map((item, index) => {
                                    const questionId = `${activeGroup.id}-${index}`
                                    const isOpen = activeQuestion === questionId

                                    return (
                                        <div
                                            key={questionId}
                                            className={`question-item overflow-hidden rounded-[22px] border px-7 py-5 duration-300 ${isOpen
                                                ? 'open border-primary/35 bg-primary-soft/70 shadow-sm'
                                                : 'border-line bg-white hover:border-primary/35 hover:shadow-sm'
                                                }`}
                                        >
                                            <button
                                                type="button"
                                                className="heading flex w-full items-center justify-between gap-6 text-left"
                                                onClick={() => handleActiveQuestion(questionId)}
                                            >
                                                <span className="heading6 text-text-strong">{item.question}</span>
                                                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border duration-300 ${isOpen
                                                    ? 'border-primary bg-primary text-white'
                                                    : 'border-line bg-white text-text-secondary'
                                                    }`}>
                                                    <Icon.CaretDown
                                                        size={20}
                                                        className={`duration-300 ${isOpen ? 'rotate-180' : ''}`}
                                                    />
                                                </span>
                                            </button>

                                            <div className={`grid duration-300 ${isOpen ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0'}`}>
                                                <div className="overflow-hidden">
                                                    <p className="body1 text-text-secondary">
                                                        {item.answer}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </section>

                    <section className="mt-16 overflow-hidden rounded-[28px] bg-brand-dark text-white md:px-10 px-6 md:py-9 py-7 shadow-soft">
                        <div className="flex items-center justify-between gap-7 max-lg:flex-col max-lg:items-start">
                            <div>
                                <div className="text-button-uppercase text-white/60">Siguiente paso</div>
                                <h2 className="heading4 mt-2 text-white">¿Querés revisar opciones para tu marca?</h2>
                                <p className="body1 mt-3 max-w-[680px] text-white/75">
                                    Explorá el catálogo y encontrá productos promocionales que se ajusten a tu empresa,
                                    evento o campaña.
                                </p>
                            </div>

                            <div className="flex gap-3 max-sm:w-full max-sm:flex-col">
                                <Link href="/productos" className="button-main max-sm:w-full text-center">
                                    Explorar catálogo
                                </Link>
                                <Link
                                    href="/contacto"
                                    className="button-main bg-white text-text-strong hover:bg-primary-soft max-sm:w-full text-center"
                                >
                                    Contactar asesor
                                </Link>
                            </div>
                        </div>
                    </section>
                </div>
            </main>

            <Footer />
        </>
    )
}

export default PreguntasFrecuentesClient;
