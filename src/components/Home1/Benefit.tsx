import React from 'react'

interface Props {
  props: string
}

const benefits = [
  {
    icon: 'icon-phone-call',
    title: 'Atención personalizada',
    shortTitle: 'Atención',
    shortText: 'Asesoría personalizada',
    text: 'Asesoría experta para elegir artículos según tu marca, presupuesto y objetivo.',
  },
  {
    icon: 'icon-guarantee',
    title: 'Amplio catálogo',
    shortTitle: 'Catálogo',
    shortText: 'Muchas opciones',
    text: 'Opciones para empresas, eventos, activaciones y regalos corporativos.',
  },
  {
    icon: 'icon-return',
    title: 'Cotización sencilla',
    shortTitle: 'Cotización',
    shortText: 'Proceso fácil',
    text: 'Agregá productos, enviá tu solicitud y recibí respuesta de forma clara.',
  },
  {
    icon: 'icon-delivery-truck',
    title: 'Entrega inmediata y bajo pedido',
    shortTitle: 'Disponibilidad',
    shortText: 'Inmediata o bajo pedido',
    text: 'Productos según disponibilidad, necesidad de entrega y tipo de campaña.',
  },
]

const Benefit: React.FC<Props> = ({ props }) => {
  return (
    <div className="container bg-white">
      <div className={`benefit-block ${props}`}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="group rounded-[22px] border border-[#EFE7DD] bg-white px-4 py-5 text-center shadow-[0_10px_28px_rgba(15,23,42,0.05)] duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_16px_36px_rgba(31,31,31,0.08)] lg:flex lg:items-start lg:gap-4 lg:p-5 lg:text-left"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF3EA] text-primary-dark shadow-sm lg:mx-0 lg:h-12 lg:w-12 lg:shrink-0 lg:rounded-full">
                <i className={`${benefit.icon} text-2xl lg:text-3xl`}></i>
              </div>

              <div className="mt-3 lg:mt-0">
                <h3 className="text-[14px] font-semibold leading-tight text-text lg:hidden">
                  {benefit.shortTitle}
                </h3>

                <div className="mt-1 text-[12px] leading-[1.35] text-text-text-secondary lg:hidden">
                  {benefit.shortText}
                </div>

                <h3 className="hidden heading6 text-text lg:block">
                  {benefit.title}
                </h3>

                <div className="hidden caption1 text-text-text-secondary mt-2 leading-relaxed lg:block">
                  {benefit.text}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Benefit