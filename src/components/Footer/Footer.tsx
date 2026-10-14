import React from "react";
import Link from "next/link";
import * as Icon from "@phosphor-icons/react/dist/ssr";
import { getFooterSeoCategories } from "@/lib/seoCategories";

const Footer = () => {
  const whatsappNumber = "50577182047";
  const phoneLabel = "+505 7718 2047";
  const email = "ventas1@btlmarketing.com.ni";
  const address = "Altamira, Managua, Nicaragua";
  const whatsappMessage = encodeURIComponent(
    "Hola, quiero recibir información sobre artículos promocionales.",
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;
  const footerCategories = getFooterSeoCategories();

  return (
    <div id="footer" className="footer">
      <div className="footer-main bg-surface">
        <div className="container">
          <div className="content-footer py-[60px] flex justify-between flex-wrap gap-y-8">
            <div className="company-infor basis-1/3 max-lg:basis-full pr-8">
              <Link href={"/"} className="logo">
                <div className="heading4">BTL Marketing</div>
              </Link>

              <div className="caption1 text-text-secondary mt-3 max-w-[360px]">
                Artículos promocionales personalizados para empresas, eventos y
                marcas.
              </div>

              <div className="flex flex-col gap-3 mt-5">
                <Link
                  href={whatsappUrl}
                  target="_blank"
                  className="flex items-center gap-3 w-fit"
                >
                  <Icon.WhatsappLogo size={20} />
                  <span>{phoneLabel}</span>
                </Link>

                <Link
                  href={`mailto:${email}`}
                  className="flex items-center gap-3 w-fit"
                >
                  <Icon.EnvelopeSimple size={20} />
                  <span>{email}</span>
                </Link>

                <div className="flex items-center gap-3">
                  <Icon.MapPin size={20} />
                  <span>{address}</span>
                </div>
              </div>
            </div>

            <div className="right-content flex flex-wrap gap-y-8 basis-2/3 max-lg:basis-full">
              <div className="list-nav grid grid-cols-1 sm:grid-cols-3 gap-8 basis-2/3 max-md:basis-full">
                <div className="item flex flex-col">
                  <div className="text-button-uppercase pb-3">Navegación</div>
                  <Link
                    className="caption1 has-line-before duration-300 w-fit"
                    href={"/"}
                  >
                    Inicio
                  </Link>
                  <Link
                    className="caption1 has-line-before duration-300 w-fit pt-2"
                    href={"/productos"}
                  >
                    Catálogo
                  </Link>
                  <Link
                    className="caption1 has-line-before duration-300 w-fit pt-2"
                    href={"/contacto"}
                  >
                    Contacto
                  </Link>
                </div>

                <div className="item flex flex-col">
                  <div className="text-button-uppercase pb-3">Servicio</div>
                  <Link
                    className="caption1 has-line-before duration-300 w-fit"
                    href={whatsappUrl}
                    target="_blank"
                  >
                    Atención por WhatsApp
                  </Link>
                  <Link
                    className="caption1 has-line-before duration-300 w-fit pt-2"
                    href={"/productos"}
                  >
                    Productos promocionales
                  </Link>
                  <Link
                    className="caption1 has-line-before duration-300 w-fit pt-2"
                    href={"/contacto"}
                  >
                    Solicitar información
                  </Link>
                </div>

                <div className="item flex flex-col">
                  <div className="text-button-uppercase pb-3">
                    Categorías destacadas
                  </div>
                  {footerCategories.map((category) => (
                    <Link
                      key={category.slug}
                      className="caption1 has-line-before duration-300 w-fit pt-2 first:pt-0"
                      href={`/categoria/${category.slug}`}
                    >
                      {category.label}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="newsletter basis-1/3 pl-7 max-md:basis-full max-md:pl-0">
                <div className="text-button-uppercase">Cotizá con nosotros</div>
                <div className="caption1 mt-3">
                  Recibí atención personalizada y encontrá el artículo ideal
                  para tu marca.
                </div>

                <Link
                  href={whatsappUrl}
                  target="_blank"
                  className="button-main w-full mt-5 text-center"
                >
                  Escribir por WhatsApp
                </Link>

                <div className="list-social flex items-center gap-5 mt-5">
                  <Link
                    href={
                      "https://www.facebook.com/BTLmarketingNic/?locale=es_LA"
                    }
                    target="_blank"
                  >
                    <div className="icon-facebook text-2xl text-black"></div>
                  </Link>
                  <Link
                    href={"https://www.instagram.com/btlmarketing"}
                    target="_blank"
                  >
                    <div className="icon-instagram text-2xl text-black"></div>
                  </Link>
                  <Link href={whatsappUrl} target="_blank">
                    <Icon.WhatsappLogo size={24} />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="footer-bottom py-3 flex items-center justify-between gap-5 max-lg:justify-center max-lg:flex-col border-t border-line">
            <div className="copyright caption1 text-text-secondary">
              ©2026 BTL Marketing. Todos los derechos reservados.
            </div>

            <div className="caption1 text-text-secondary text-center">
              Todo lo que tu marca necesita, en un solo lugar.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
