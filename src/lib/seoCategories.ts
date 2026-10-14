export type SeoCategoryFAQ = {
  question: string;
  answer: string;
};

export type SeoCategoryBenefit = {
  title: string;
  description: string;
};

export type SeoCategory = {
  slug: string;
  label: string;
  h1: string;
  title: string;
  description: string;
  intro: string;
  relatedSlugs?: string[];
  commercialIntro?: string;
  benefits?: SeoCategoryBenefit[];
  useCases?: string[];
  faqs?: SeoCategoryFAQ[];
};

function buildSeoCategory(
  slug: string,
  label: string,
): SeoCategory {
  return {
    slug,
    label,
    h1: `${label} promocionales personalizados`,
    title: `${label} promocionales en Nicaragua`,
    description: `Explorá ${label.toLowerCase()} promocionales personalizados para empresas, eventos, campañas publicitarias y regalos corporativos en Nicaragua.`,
    intro: `En BTL Marketing encontrás opciones de ${label.toLowerCase()} promocionales pensadas para empresas, marcas, eventos y campañas corporativas. Esta categoría reúne productos personalizables que pueden ayudarte a reforzar la presencia de tu marca en Nicaragua.`,
  };
}

export const seoCategories: SeoCategory[] = [
  {
    slug: "agricultura",
    label: "Agricultura",
    h1: "Artículos promocionales para agricultura",
    title: "Artículos promocionales para agricultura en Nicaragua",
    description:
      "Explorá artículos promocionales para agricultura, campañas rurales, ferias, marcas agroindustriales y empresas del sector agrícola en Nicaragua.",
    intro:
      "Los artículos promocionales para agricultura son una excelente opción para marcas agroindustriales, ferias del sector, campañas rurales y empresas que buscan conectar con productores, distribuidores y clientes del campo.",
  },
  buildSeoCategory("antiestres", "Antiestrés"),
  {
    slug: "sostenibles",
    label: "Artículos Sostenibles",
    h1: "Artículos promocionales sostenibles personalizados",
    title: "Artículos promocionales sostenibles en Nicaragua",
    description:
      "Cotizá artículos promocionales sostenibles para empresas, campañas ecológicas, eventos corporativos y regalos responsables en Nicaragua.",
    intro:
      "Los artículos sostenibles ayudan a comunicar compromiso ambiental y responsabilidad de marca. Son ideales para campañas ecológicas, eventos corporativos y regalos empresariales con enfoque consciente.",
  },
  {
    slug: "bebidas-bar-termos",
    label: "Bebidas, Bar y Termos",
    h1: "Termos, botellas y artículos para bebidas personalizados",
    title: "Termos y botellas personalizados en Nicaragua",
    description:
      "Encontrá termos, botellas, tazas y artículos para bebidas personalizados para empresas, eventos y regalos corporativos en Nicaragua.",
    intro:
      "Los termos, botellas, tazas y accesorios para bebidas son productos promocionales de alta utilidad. Son ideales para campañas empresariales, eventos, regalos corporativos y acciones de marca de uso diario.",
  },
  buildSeoCategory("belleza", "Belleza"),
  {
    slug: "bolsas",
    label: "Bolsas",
    h1: "Bolsas promocionales personalizadas",
    title: "Bolsas promocionales personalizadas en Nicaragua",
    description:
      "Cotizá bolsas promocionales personalizadas para empresas, eventos, tiendas, campañas corporativas y activaciones de marca en Nicaragua.",
    intro:
      "Las bolsas promocionales son una solución práctica para eventos, ferias, comercios y campañas empresariales. Permiten transportar productos y mantener visible la marca en diferentes contextos de uso.",
  },
  {
    slug: "deportes-aire-libre",
    label: "Deportes y Aire Libre",
    h1: "Artículos deportivos promocionales y de aire libre",
    title: "Artículos deportivos promocionales en Nicaragua",
    description:
      "Explorá artículos deportivos promocionales y productos de aire libre personalizados para eventos, marcas, campañas y actividades corporativas.",
    intro:
      "Los artículos deportivos y de aire libre son ideales para campañas activas, eventos recreativos, promociones de verano, torneos y marcas que desean asociarse con bienestar, movimiento y estilo de vida.",
  },
  buildSeoCategory("embalaje-especial", "Embalaje Especial"),
  {
    slug: "escritura",
    label: "Escritura",
    h1: "Artículos de escritura promocionales personalizados",
    title: "Artículos de escritura promocionales en Nicaragua",
    description:
      "Explorá bolígrafos, lápices, notas y artículos de escritura promocionales personalizados para empresas, eventos y regalos corporativos.",
    intro:
      "Los artículos de escritura promocionales son una de las opciones más prácticas para campañas masivas, oficinas, ferias y regalos corporativos. Su uso cotidiano permite que la marca tenga presencia constante.",
  },
  {
    slug: "eventos-regalos",
    label: "Eventos y Regalos",
    h1: "Regalos promocionales para eventos y empresas",
    title: "Regalos promocionales para eventos en Nicaragua",
    description:
      "Encontrá regalos promocionales personalizados para eventos, activaciones, campañas corporativas y empresas en Nicaragua.",
    intro:
      "Los regalos promocionales para eventos ayudan a generar recordación de marca y fortalecer la relación con clientes, colaboradores y prospectos. Son ideales para activaciones, ferias, lanzamientos y campañas empresariales.",
  },
  {
    slug: "gorras",
    label: "Gorras",
    h1: "Gorras promocionales personalizadas",
    title: "Gorras promocionales personalizadas en Nicaragua",
    description:
      "Cotizá gorras promocionales personalizadas para empresas, eventos, uniformes, campañas publicitarias y activaciones de marca en Nicaragua.",
    intro:
      "Las gorras promocionales son productos visibles, funcionales y versátiles. Funcionan muy bien en activaciones, uniformes, eventos deportivos, campañas de verano y regalos corporativos.",
  },
  buildSeoCategory("herramientas-automovil", "Herramientas y Automóvil"),
  {
    slug: "hogar-decoracion",
    label: "Hogar y Decoración",
    h1: "Artículos promocionales para hogar y decoración",
    title: "Artículos promocionales para hogar en Nicaragua",
    description:
      "Explorá artículos promocionales para hogar, cocina, decoración y regalos corporativos personalizados en Nicaragua.",
    intro:
      "Los artículos para hogar y decoración son productos promocionales útiles y de alta permanencia. Son ideales para regalos corporativos, campañas de fidelización y acciones comerciales orientadas al uso cotidiano.",
  },
  {
    slug: "libretas-carpetas",
    label: "Libretas y Carpetas",
    h1: "Libretas y carpetas promocionales personalizadas",
    title: "Libretas y carpetas promocionales en Nicaragua",
    description:
      "Cotizá libretas, carpetas y artículos de oficina personalizados para empresas, eventos, capacitaciones y regalos corporativos.",
    intro:
      "Las libretas y carpetas promocionales son ideales para capacitaciones, congresos, reuniones comerciales, eventos corporativos y regalos empresariales con utilidad diaria.",
  },
  buildSeoCategory("llaveros", "Llaveros"),
  {
    slug: "lluvia-frio",
    label: "Lluvia y Frío",
    h1: "Artículos promocionales para lluvia y frío",
    title: "Paraguas e impermeables promocionales en Nicaragua",
    description:
      "Explorá artículos promocionales para lluvia y frío, como paraguas, impermeables y accesorios personalizados para empresas y campañas.",
    intro:
      "Los productos para lluvia y frío tienen gran utilidad y exposición de marca. Son ideales para campañas de temporada, regalos empresariales y acciones promocionales con alto valor práctico.",
  },
  buildSeoCategory("made-in-europe", "Made In Europe"),
  buildSeoCategory("marcas", "Marcas"),
  buildSeoCategory("mascotas", "Mascotas"),
  {
    slug: "mochilas",
    label: "Mochilas",
    h1: "Mochilas promocionales personalizadas",
    title: "Mochilas promocionales personalizadas en Nicaragua",
    description:
      "Cotizá mochilas promocionales personalizadas para empresas, eventos, colegios, campañas corporativas y regalos de marca en Nicaragua.",
    intro:
      "Las mochilas promocionales son una excelente opción para empresas, ferias, eventos, colegios y campañas corporativas. En BTL Marketing encontrás modelos prácticos y personalizables para destacar tu marca.",
  },
  buildSeoCategory("mujer-makito-1-11", "Mujer"),
  buildSeoCategory("navidad", "Navidad"),
  {
    slug: "ninos-infantil",
    label: "Niños e Infantil",
    h1: "Artículos promocionales para niños e infantil",
    title: "Artículos promocionales infantiles en Nicaragua",
    description:
      "Explorá artículos promocionales infantiles personalizados para campañas, eventos, colegios, marcas familiares y regalos corporativos.",
    intro:
      "Los artículos promocionales infantiles son ideales para campañas familiares, eventos escolares, activaciones de marca y promociones dirigidas a públicos jóvenes o familiares.",
  },
  {
    slug: "novedades",
    label: "Novedades",
    h1: "Novedades promocionales personalizadas",
    title: "Novedades promocionales en Nicaragua",
    description:
      "Descubrí novedades promocionales personalizadas para empresas, eventos, campañas publicitarias y regalos corporativos en Nicaragua.",
    intro:
      "La categoría de novedades reúne productos promocionales recientes y opciones actualizadas para marcas que buscan propuestas frescas, útiles y diferenciadas para sus campañas.",
  },
  {
    slug: "oficina",
    label: "Oficina",
    h1: "Artículos promocionales para oficina",
    title: "Artículos de oficina promocionales en Nicaragua",
    description:
      "Cotizá artículos promocionales para oficina, negocios, reuniones, capacitaciones y regalos corporativos personalizados en Nicaragua.",
    intro:
      "Los artículos de oficina promocionales son ideales para empresas, capacitaciones, reuniones, ferias y regalos corporativos. Son productos útiles que mantienen la marca presente en espacios laborales.",
  },
  buildSeoCategory("outlet-ediciones", "Outlet y Ediciones Especiales"),
  {
    slug: "salud-cuidado-personal",
    label: "Salud y Cuidado Personal",
    h1: "Artículos promocionales de salud y cuidado personal",
    title: "Artículos promocionales de salud en Nicaragua",
    description:
      "Explorá artículos promocionales de salud, higiene y cuidado personal personalizados para empresas, campañas y eventos corporativos.",
    intro:
      "Los artículos de salud y cuidado personal son útiles para campañas de bienestar, prevención, regalos corporativos y acciones promocionales orientadas al cuidado diario.",
  },
  buildSeoCategory("servicios", "Servicios"),
  buildSeoCategory("spain-line", "Spain Line"),
  buildSeoCategory("sublimacion", "Sublimación"),
  buildSeoCategory("sudaderas", "Sudaderas"),
  {
    slug: "tecnologia",
    label: "Tecnología",
    h1: "Tecnología promocional personalizada",
    title: "Tecnología promocional personalizada en Nicaragua",
    description:
      "Cotizá artículos tecnológicos promocionales personalizados para empresas, eventos y campañas publicitarias en Nicaragua.",
    intro:
      "La tecnología promocional es ideal para marcas que buscan proyectar innovación y utilidad. En esta categoría encontrás accesorios tecnológicos, gadgets, USB y productos personalizables para campañas empresariales.",
  },
  {
    slug: "textil",
    label: "Textil",
    h1: "Artículos textiles promocionales personalizados",
    title: "Textiles promocionales personalizados en Nicaragua",
    description:
      "Cotizá artículos textiles promocionales personalizados para empresas, activaciones, uniformes, eventos y campañas de marca en Nicaragua.",
    intro:
      "Los productos textiles promocionales ayudan a reforzar la identidad visual de una marca en eventos, activaciones y campañas corporativas. Son opciones versátiles para uniformes, regalos y presencia de marca.",
  },
  {
    slug: "viaje",
    label: "Viaje",
    h1: "Artículos promocionales para viaje",
    title: "Artículos promocionales para viaje en Nicaragua",
    description:
      "Explorá artículos promocionales para viaje, maletas, accesorios y productos personalizados para empresas, turismo, eventos y regalos corporativos.",
    intro:
      "Los artículos promocionales para viaje son útiles para campañas corporativas, turismo, eventos y regalos empresariales. Ayudan a que la marca acompañe al usuario en desplazamientos y actividades fuera de casa.",
  },
];


const commercialSeoContentBySlug: Record<
  string,
  Pick<SeoCategory, "commercialIntro" | "benefits" | "useCases" | "faqs">
> = {
  mochilas: {
    commercialIntro:
      "Las mochilas promocionales personalizadas son una opción funcional para empresas que buscan presencia de marca en el uso diario. Funcionan muy bien para ferias, universidades, congresos, equipos comerciales, kits corporativos y campañas donde el producto debe ser útil, visible y duradero.",
    benefits: [
      {
        title: "Alta utilidad diaria",
        description:
          "Son productos que acompañan al usuario en trabajo, estudio, viajes y actividades cotidianas.",
      },
      {
        title: "Buena exposición de marca",
        description:
          "Su superficie permite destacar el logotipo con buena visibilidad en diferentes contextos.",
      },
      {
        title: "Ideal para eventos",
        description:
          "Funcionan como regalo corporativo, kit de bienvenida o material para ferias y congresos.",
      },
      {
        title: "Percepción de valor",
        description:
          "Una mochila personalizada suele percibirse como un obsequio práctico y de mayor permanencia.",
      },
    ],
    useCases: [
      "Kits de bienvenida para colaboradores",
      "Ferias comerciales y congresos",
      "Regalos para estudiantes o universidades",
      "Campañas corporativas de alto impacto",
    ],
    faqs: [
      {
        question: "¿Se pueden personalizar las mochilas promocionales?",
        answer:
          "Sí, podés cotizar mochilas personalizadas con técnicas de marcaje según el material, modelo y disponibilidad del producto.",
      },
      {
        question: "¿Para qué tipo de campañas funcionan las mochilas?",
        answer:
          "Son recomendadas para eventos corporativos, universidades, ferias, kits empresariales y regalos de marca con uso frecuente.",
      },
      {
        question: "¿Puedo cotizar diferentes modelos de mochilas?",
        answer:
          "Sí, el catálogo permite explorar modelos variados para solicitar una cotización según estilo, disponibilidad y necesidad de marca.",
      },
    ],
  },
  "bebidas-bar-termos": {
    commercialIntro:
      "Los termos, botellas, tazas y artículos para bebidas son productos promocionales de uso frecuente. Ayudan a mantener la marca visible en oficinas, eventos, actividades al aire libre y campañas corporativas enfocadas en utilidad diaria.",
    benefits: [
      {
        title: "Uso constante",
        description:
          "Son artículos prácticos para oficina, gimnasio, viajes, eventos y actividades cotidianas.",
      },
      {
        title: "Regalo corporativo versátil",
        description:
          "Funcionan para clientes, colaboradores, activaciones de marca y campañas institucionales.",
      },
      {
        title: "Buena visibilidad",
        description:
          "El logotipo puede mantenerse presente en espacios de trabajo y momentos de consumo diario.",
      },
      {
        title: "Variedad de estilos",
        description:
          "Podés explorar opciones como termos, botellas, vasos, tazas y accesorios para bebidas.",
      },
    ],
    useCases: [
      "Regalos corporativos para clientes",
      "Campañas de bienestar empresarial",
      "Eventos deportivos o de marca",
      "Kits promocionales sostenibles",
    ],
    faqs: [
      {
        question: "¿Qué artículos para bebidas se pueden cotizar?",
        answer:
          "Podés cotizar termos, botellas, tazas, vasos y accesorios para bebidas según disponibilidad del catálogo.",
      },
      {
        question: "¿Son adecuados para regalos empresariales?",
        answer:
          "Sí, son una de las categorías más utilizadas para regalos corporativos por su utilidad y buena presencia de marca.",
      },
      {
        question: "¿Puedo solicitar opciones para una campaña específica?",
        answer:
          "Sí, podés seleccionar productos y enviar una solicitud de cotización para revisar opciones según tu campaña.",
      },
    ],
  },
  tecnologia: {
    commercialIntro:
      "La tecnología promocional personalizada ayuda a proyectar una imagen moderna, útil e innovadora. Es una categoría ideal para empresas que buscan regalos corporativos funcionales, campañas digitales, eventos empresariales y acciones de marca con productos de alto valor percibido.",
    benefits: [
      {
        title: "Alta percepción de valor",
        description:
          "Los artículos tecnológicos suelen destacar como regalos corporativos útiles y memorables.",
      },
      {
        title: "Marca asociada a innovación",
        description:
          "Ayudan a comunicar modernidad, practicidad y cercanía con las necesidades actuales.",
      },
      {
        title: "Uso en oficina y movilidad",
        description:
          "Funcionan para equipos de trabajo, clientes, eventos, ferias y campañas comerciales.",
      },
      {
        title: "Opciones variadas",
        description:
          "La categoría puede incluir gadgets, accesorios, USB, cargadores y productos tecnológicos promocionales.",
      },
    ],
    useCases: [
      "Regalos para clientes corporativos",
      "Ferias de tecnología o innovación",
      "Campañas digitales y lanzamientos",
      "Kits ejecutivos o comerciales",
    ],
    faqs: [
      {
        question: "¿Qué tipo de tecnología promocional puedo cotizar?",
        answer:
          "Podés explorar accesorios tecnológicos, gadgets, memorias USB, cargadores y otros artículos promocionales según disponibilidad.",
      },
      {
        question: "¿Estos productos son útiles para eventos empresariales?",
        answer:
          "Sí, son ideales para eventos, ferias, activaciones y regalos corporativos con enfoque moderno y funcional.",
      },
      {
        question: "¿Se pueden personalizar los artículos tecnológicos?",
        answer:
          "Sí, la personalización depende del modelo, material y técnica de marcaje disponible para cada producto.",
      },
    ],
  },
  escritura: {
    commercialIntro:
      "Los artículos de escritura promocionales son una solución clásica, práctica y efectiva para campañas masivas. Son ideales para oficinas, ferias, capacitaciones, universidades, activaciones y regalos corporativos donde se busca una presencia de marca constante.",
    benefits: [
      {
        title: "Ideal para campañas masivas",
        description:
          "Los bolígrafos, lápices y accesorios de escritura son prácticos para grandes volúmenes de promoción.",
      },
      {
        title: "Uso cotidiano",
        description:
          "Mantienen la marca presente en oficinas, reuniones, eventos y espacios de trabajo.",
      },
      {
        title: "Fácil integración en kits",
        description:
          "Combinan bien con libretas, carpetas, bolsas y otros artículos promocionales.",
      },
      {
        title: "Amplia variedad",
        description:
          "Permiten seleccionar estilos básicos, ejecutivos, ecológicos o de mayor valor percibido.",
      },
    ],
    useCases: [
      "Ferias y activaciones de marca",
      "Capacitaciones y eventos corporativos",
      "Material promocional para oficinas",
      "Kits de bienvenida o inscripción",
    ],
    faqs: [
      {
        question: "¿Los artículos de escritura son recomendados para campañas masivas?",
        answer:
          "Sí, son productos prácticos y versátiles para campañas con alto alcance y presencia frecuente de marca.",
      },
      {
        question: "¿Puedo combinar escritura con libretas o carpetas?",
        answer:
          "Sí, suelen funcionar muy bien dentro de kits corporativos, capacitaciones, congresos y paquetes promocionales.",
      },
      {
        question: "¿Hay opciones de escritura sostenibles?",
        answer:
          "Según disponibilidad del catálogo, podés encontrar opciones con materiales o enfoques más sostenibles.",
      },
    ],
  },
  textil: {
    commercialIntro:
      "Los textiles promocionales personalizados ayudan a reforzar la identidad visual de una marca en eventos, uniformes, activaciones y campañas corporativas. Son productos visibles, versátiles y adecuados para equipos, clientes y acciones de promoción.",
    benefits: [
      {
        title: "Alta visibilidad",
        description:
          "El textil promocional permite que la marca se vea en eventos, equipos de trabajo y activaciones.",
      },
      {
        title: "Refuerzo de identidad",
        description:
          "Ayuda a unificar la imagen visual de colaboradores, promotores o equipos comerciales.",
      },
      {
        title: "Versatilidad de uso",
        description:
          "Puede utilizarse en campañas, lanzamientos, eventos, uniformes y regalos promocionales.",
      },
      {
        title: "Presencia de marca prolongada",
        description:
          "Un producto textil útil puede seguir generando exposición después del evento o campaña.",
      },
    ],
    useCases: [
      "Uniformes promocionales",
      "Activaciones de marca",
      "Eventos deportivos o corporativos",
      "Campañas de lanzamiento",
    ],
    faqs: [
      {
        question: "¿Qué productos textiles puedo cotizar?",
        answer:
          "Podés explorar artículos textiles promocionales según disponibilidad, como prendas, accesorios y opciones para activaciones o uniformes.",
      },
      {
        question: "¿Son útiles para uniformar equipos?",
        answer:
          "Sí, los textiles promocionales ayudan a reforzar identidad visual en equipos de trabajo, eventos y activaciones.",
      },
      {
        question: "¿La personalización depende del material?",
        answer:
          "Sí, la técnica de marcaje puede variar según el tipo de textil, material y modelo disponible.",
      },
    ],
  },
  "eventos-regalos": {
    commercialIntro:
      "Los regalos promocionales para eventos ayudan a generar recordación de marca, fortalecer relaciones comerciales y mejorar la experiencia de clientes, colaboradores o asistentes. Son ideales para ferias, congresos, activaciones, lanzamientos y campañas empresariales.",
    benefits: [
      {
        title: "Mejor recordación de marca",
        description:
          "Un regalo útil ayuda a que la marca permanezca presente después del evento o activación.",
      },
      {
        title: "Conecta con diferentes públicos",
        description:
          "Permite adaptar la selección de productos a clientes, asistentes, colaboradores o prospectos.",
      },
      {
        title: "Ideal para kits promocionales",
        description:
          "Puede combinarse con bolsas, libretas, termos, escritura, tecnología y otros artículos.",
      },
      {
        title: "Apoya campañas comerciales",
        description:
          "Funciona para lanzamientos, ferias, promociones, activaciones y presencia en punto de venta.",
      },
    ],
    useCases: [
      "Ferias y congresos",
      "Activaciones de marca",
      "Lanzamientos de productos",
      "Regalos para clientes y colaboradores",
    ],
    faqs: [
      {
        question: "¿Qué regalos promocionales funcionan mejor para eventos?",
        answer:
          "Depende del público y objetivo de la campaña. Termos, libretas, bolsas, tecnología y escritura suelen ser opciones frecuentes.",
      },
      {
        question: "¿Puedo armar un kit de regalos corporativos?",
        answer:
          "Sí, podés seleccionar diferentes productos del catálogo y solicitar una cotización para revisar alternativas.",
      },
      {
        question: "¿Los regalos promocionales ayudan a mejorar la recordación de marca?",
        answer:
          "Sí, cuando son útiles y están bien alineados con la campaña, pueden extender la presencia de marca después del evento.",
      },
    ],
  },
  gorras: {
    commercialIntro:
      "Las gorras promocionales personalizadas son productos visibles y funcionales para campañas de verano, eventos deportivos, activaciones, uniformes promocionales y regalos corporativos. Ayudan a llevar la marca a espacios abiertos y de alta exposición.",
    benefits: [
      {
        title: "Visibilidad inmediata",
        description:
          "La gorra mantiene el logotipo en una zona de alta exposición durante el uso.",
      },
      {
        title: "Ideal para exteriores",
        description:
          "Funciona muy bien en eventos deportivos, activaciones, ferias y campañas de verano.",
      },
      {
        title: "Útil para equipos",
        description:
          "Puede integrarse en uniformes promocionales, equipos comerciales o personal de eventos.",
      },
      {
        title: "Regalo práctico",
        description:
          "Es un artículo promocional fácil de usar, transportar y adaptar a diferentes campañas.",
      },
    ],
    useCases: [
      "Eventos deportivos",
      "Activaciones al aire libre",
      "Uniformes promocionales",
      "Campañas de temporada",
    ],
    faqs: [
      {
        question: "¿Las gorras promocionales se pueden personalizar?",
        answer:
          "Sí, la personalización depende del modelo, material y técnica de marcaje disponible.",
      },
      {
        question: "¿Para qué campañas funcionan mejor las gorras?",
        answer:
          "Son recomendadas para eventos al aire libre, activaciones, uniformes promocionales y campañas de temporada.",
      },
      {
        question: "¿Puedo cotizar diferentes estilos de gorra?",
        answer:
          "Sí, podés explorar los modelos disponibles y solicitar una cotización según tus necesidades.",
      },
    ],
  },
  sostenibles: {
    commercialIntro:
      "Los artículos promocionales sostenibles ayudan a comunicar responsabilidad ambiental y compromiso de marca. Son ideales para empresas que desean promover campañas ecológicas, regalos responsables, eventos corporativos y acciones comerciales con enfoque consciente.",
    benefits: [
      {
        title: "Comunican responsabilidad",
        description:
          "Refuerzan mensajes de sostenibilidad, conciencia ambiental y compromiso empresarial.",
      },
      {
        title: "Diferencian la marca",
        description:
          "Ayudan a que la campaña se perciba más actual, responsable y alineada con nuevas expectativas.",
      },
      {
        title: "Útiles en campañas verdes",
        description:
          "Funcionan para eventos ecológicos, programas internos y comunicaciones institucionales.",
      },
      {
        title: "Amplia aplicación",
        description:
          "Pueden combinarse con bolsas, escritura, termos, oficina y regalos corporativos.",
      },
    ],
    useCases: [
      "Campañas ecológicas",
      "Regalos corporativos responsables",
      "Eventos institucionales",
      "Programas de sostenibilidad empresarial",
    ],
    faqs: [
      {
        question: "¿Qué son los artículos promocionales sostenibles?",
        answer:
          "Son productos promocionales que ayudan a comunicar un enfoque más responsable o consciente, según materiales, uso o concepto de campaña.",
      },
      {
        question: "¿Son adecuados para empresas con campañas ambientales?",
        answer:
          "Sí, funcionan muy bien para campañas ecológicas, programas internos, eventos institucionales y regalos corporativos responsables.",
      },
      {
        question: "¿Puedo combinar productos sostenibles con otras categorías?",
        answer:
          "Sí, se pueden combinar con bolsas, escritura, termos, oficina u otros artículos para crear kits promocionales más completos.",
      },
    ],
  },
};

seoCategories.forEach((category) => {
  const commercialContent = commercialSeoContentBySlug[category.slug];

  if (commercialContent) {
    Object.assign(category, commercialContent);
  }
});

const relatedCategoryMap: Record<string, string[]> = {
  tecnologia: ["oficina", "escritura", "eventos-regalos", "mochilas"],
  mochilas: ["viaje", "textil", "deportes-aire-libre", "eventos-regalos"],
  "bebidas-bar-termos": [
    "eventos-regalos",
    "sostenibles",
    "hogar-decoracion",
    "oficina",
  ],
  textil: ["gorras", "sudaderas", "eventos-regalos", "deportes-aire-libre"],
  escritura: ["oficina", "libretas-carpetas", "eventos-regalos", "tecnologia"],
  "eventos-regalos": [
    "mochilas",
    "bebidas-bar-termos",
    "escritura",
    "tecnologia",
  ],
  sostenibles: ["bebidas-bar-termos", "bolsas", "oficina", "hogar-decoracion"],
  gorras: ["textil", "deportes-aire-libre", "eventos-regalos", "sudaderas"],
  oficina: ["escritura", "libretas-carpetas", "tecnologia", "eventos-regalos"],
  bolsas: ["sostenibles", "eventos-regalos", "embalaje-especial", "mochilas"],
  "salud-cuidado-personal": [
    "belleza",
    "eventos-regalos",
    "sostenibles",
    "oficina",
  ],
  "hogar-decoracion": [
    "bebidas-bar-termos",
    "sostenibles",
    "eventos-regalos",
    "novedades",
  ],
  viaje: ["mochilas", "bebidas-bar-termos", "tecnologia", "lluvia-frio"],
};

export const footerSeoCategorySlugs = [
  "mochilas",
  "bebidas-bar-termos",
  "tecnologia",
  "escritura",
  "textil",
  "eventos-regalos",
  "gorras",
  "sostenibles",
];

export function getSeoCategory(slug: string) {
  return seoCategories.find((category) => category.slug === slug);
}

export function getRelatedSeoCategories(slug: string, limit = 4) {
  const relatedSlugs = relatedCategoryMap[slug] || [];

  const related = relatedSlugs
    .map((relatedSlug) => getSeoCategory(relatedSlug))
    .filter((category): category is SeoCategory => {
      if (!category) {
        return false;
      }

      return category.slug !== slug;
    });

  if (related.length >= limit) {
    return related.slice(0, limit);
  }

  const fallback = seoCategories.filter(
    (category) =>
      category.slug !== slug &&
      !related.some(
        (relatedCategory) => relatedCategory.slug === category.slug,
      ),
  );

  return [...related, ...fallback].slice(0, limit);
}

export function getFooterSeoCategories() {
  return footerSeoCategorySlugs
    .map((slug) => getSeoCategory(slug))
    .filter((category): category is SeoCategory => Boolean(category));
}
