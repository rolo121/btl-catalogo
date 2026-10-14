export type FaqItem = {
    question: string
    answer: string
}

export type FaqGroup = {
    id: string
    label: string
    description: string
    questions: FaqItem[]
}

export const faqGroups: FaqGroup[] = [
    {
        id: 'catalogo',
        label: 'Catálogo y productos',
        description: 'Información sobre productos promocionales, disponibilidad e imágenes del catálogo.',
        questions: [
            {
                question: '¿Qué tipo de productos encuentro en BTL Marketing?',
                answer: 'En BTL Marketing encontrás artículos promocionales personalizados para empresas, eventos, campañas y marcas. El catálogo incluye productos como termos, tazas, bolsos, mochilas, artículos de oficina, tecnología, textiles, accesorios para eventos y más opciones promocionales.'
            },
            {
                question: '¿El catálogo muestra productos de diferentes líneas?',
                answer: 'Sí. El catálogo reúne productos locales y productos de importación para que podás comparar opciones según disponibilidad, estilo, uso y necesidades de tu marca.'
            },
            {
                question: '¿La disponibilidad puede cambiar?',
                answer: 'Sí. La disponibilidad puede variar porque el catálogo trabaja con diferentes fuentes de inventario. Por eso, al solicitar información se confirma el stock, color, cantidad y tiempo estimado antes de avanzar con la propuesta.'
            },
            {
                question: '¿Por qué algunos productos no tienen imagen?',
                answer: 'Algunos productos pueden depender de imágenes externas o de información pendiente de proveedor. En esos casos se puede mostrar una imagen referencial o placeholder mientras se valida la información final del producto.'
            }
        ]
    },
    {
        id: 'cotizacion',
        label: 'Cotización',
        description: 'Cómo funciona el proceso para solicitar información o armar una propuesta.',
        questions: [
            {
                question: '¿Cómo puedo solicitar una cotización?',
                answer: 'Podés explorar el catálogo, seleccionar los productos de interés y solicitar información para recibir una propuesta personalizada. El equipo revisa producto, cantidad, disponibilidad y detalles de personalización antes de confirmar la cotización.'
            },
            {
                question: '¿Puedo cotizar varios productos a la vez?',
                answer: 'Sí. La web está pensada para que podás revisar diferentes productos y armar una solicitud más completa, especialmente si estás preparando una campaña, evento corporativo o compra empresarial.'
            },
            {
                question: '¿Los precios aparecen directamente en la web?',
                answer: 'No necesariamente. En productos promocionales el precio puede variar según cantidad, técnica de personalización, colores, disponibilidad y tipo de producto. Por eso se trabaja mejor mediante cotización personalizada.'
            },
            {
                question: '¿Qué información ayuda a preparar una mejor cotización?',
                answer: 'Lo ideal es indicar el producto de interés, cantidad aproximada, color, fecha estimada de entrega, si lleva logo o diseño, y cualquier detalle importante de la campaña o evento.'
            }
        ]
    },
    {
        id: 'personalizacion',
        label: 'Personalización',
        description: 'Detalles sobre aplicación de marca, logos y recomendaciones de uso.',
        questions: [
            {
                question: '¿Se pueden personalizar los productos con logo?',
                answer: 'Sí. La mayoría de productos promocionales pueden personalizarse con logo, nombre de marca o mensaje de campaña, dependiendo del material, tamaño, área disponible y técnica recomendada.'
            },
            {
                question: '¿Qué archivo debo enviar para personalizar un producto?',
                answer: 'Lo ideal es enviar el logo en formato vectorial como AI, PDF, EPS o SVG. También se puede revisar un PNG en buena calidad, pero para producción final normalmente se recomienda archivo editable o vectorial.'
            },
            {
                question: '¿Puedo recibir recomendación sobre qué producto usar?',
                answer: 'Sí. Si no tenés definido el producto, se puede orientar la selección según tipo de campaña, presupuesto, público objetivo, tiempo de entrega y uso esperado del artículo promocional.'
            },
            {
                question: '¿Todos los productos usan la misma técnica de impresión?',
                answer: 'No. La técnica depende del producto y material. Algunos artículos permiten serigrafía, tampografía, grabado, sublimación u otras técnicas. La opción adecuada se confirma durante la revisión del producto.'
            }
        ]
    },
    {
        id: 'entregas',
        label: 'Entregas y tiempos',
        description: 'Información general sobre tiempos estimados y confirmación de productos.',
        questions: [
            {
                question: '¿Manejan productos de entrega inmediata?',
                answer: 'Sí. Hay productos locales que pueden tener disponibilidad inmediata, siempre sujetos a confirmación de stock, color y cantidad al momento de solicitar la información.'
            },
            {
                question: '¿Qué tiempos de entrega manejan?',
                answer: 'Los tiempos pueden variar según el origen del producto, disponibilidad y personalización. Algunas opciones pueden ser inmediatas y otras pueden trabajar con rangos estimados de 10 a 15 días o 15 a 20 días.'
            },
            {
                question: '¿El tiempo de entrega incluye personalización?',
                answer: 'Depende del producto y del proceso solicitado. El tiempo final debe confirmarse considerando disponibilidad, aprobación de arte, técnica de personalización y producción.'
            },
            {
                question: '¿Puedo solicitar productos para una fecha específica?',
                answer: 'Sí. Se recomienda indicar la fecha requerida desde el inicio para validar si el producto y la personalización pueden cumplir con el tiempo necesario.'
            }
        ]
    },
    {
        id: 'contacto',
        label: 'Atención y contacto',
        description: 'Canales oficiales y datos de contacto de BTL Marketing.',
        questions: [
            {
                question: '¿Cuál es el correo de atención?',
                answer: 'Podés escribir a ventas1@btlmarketing.com.ni para consultas, solicitudes de información y seguimiento de propuestas.'
            },
            {
                question: '¿Dónde está ubicado BTL Marketing?',
                answer: 'BTL Marketing está ubicado en Altamira, Managua, Nicaragua. También podés encontrar la información de contacto en el footer y en la página de contacto.'
            },
            {
                question: '¿Tienen redes sociales?',
                answer: 'Sí. Podés encontrar a BTL Marketing en Facebook e Instagram para ver publicaciones, referencias de productos y novedades de la marca.'
            },
            {
                question: '¿Puedo recibir atención personalizada?',
                answer: 'Sí. El enfoque de BTL Marketing es ayudarte a encontrar productos promocionales adecuados para tu empresa, evento o campaña, con acompañamiento durante el proceso de selección y cotización.'
            }
        ]
    }
]
