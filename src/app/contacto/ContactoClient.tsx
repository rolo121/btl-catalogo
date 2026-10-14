"use client";

import React, { useState } from "react";
import { appPath } from "@/lib/appPaths";
import Link from "next/link";
import * as Icon from "@phosphor-icons/react/dist/ssr";
import TopNavOne from "@/components/Header/TopNav/TopNavOne";
import MenuOne from "@/components/Header/Menu/MenuOne";
import Footer from "@/components/Footer/Footer";
import {
  addFieldError,
  formatNicaraguaPhone,
  hasFormErrors,
  validateEmail,
  validateNicaraguaPhone,
  validateRequired,
  type FormErrors,
} from "@/lib/formValidation";

type ContactField = "name" | "email" | "phone" | "message";

const ContactoClient = () => {
  const email = "ventas1@btlmarketing.com.ni";
  const phone = "+505 7718 2047";
  const whatsappUrl = "https://wa.me/50577182047";
  const address = "Altamira, Managua, Nicaragua";
  const instagramUrl = "https://www.instagram.com/btlmarketing";
  const facebookUrl = "https://www.facebook.com/BTLmarketingNic/?locale=es_LA";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    website: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | "">("");
  const [errors, setErrors] = useState<FormErrors>({});

  const clearFieldError = (field: string) => {
    setSubmitMessage("");
    setSubmitStatus("");
  
    setErrors((prev) => {
      if (!prev[field]) return prev;
  
      const nextErrors = { ...prev };
      delete nextErrors[field];
  
      return nextErrors;
    });
  };
  
  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
  
    const nextValue = name === "phone" ? formatNicaraguaPhone(value) : value;
  
    setFormData((prev) => ({ ...prev, [name]: nextValue }));
    clearFieldError(name);
  };

  const getFieldClass = (field: ContactField) => {
    return `w-full rounded-xl border bg-white px-4 py-3 outline-none duration-300 placeholder:text-text-soft focus:border-primary ${
      errors[field] ? "border-red-500" : "border-line"
    }`;
  };
  
  const renderError = (field: ContactField) => {
    if (!errors[field]) return null;
  
    return <p className="caption1 mt-1 text-red-600">{errors[field]}</p>;
  };
  
  const validateContactForm = () => {
    const nextErrors: FormErrors = {};
    const name = formData.name.trim();
    const email = formData.email.trim();
    const message = formData.message.trim();
  
    addFieldError(nextErrors, "name", validateRequired(name, "Nombre completo"));
    addFieldError(nextErrors, "email", validateEmail(email, "Correo electrónico"));
    addFieldError(nextErrors, "phone", validateNicaraguaPhone(formData.phone, "Teléfono"));
    addFieldError(nextErrors, "message", validateRequired(message, "Mensaje"));

    if (!nextErrors.name && name.length < 3) {
      nextErrors.name = "Nombre completo debe tener al menos 3 caracteres.";
    }

    if (!nextErrors.name && name.length > 80) {
      nextErrors.name = "Nombre completo no debe superar 80 caracteres.";
    }

    if (!nextErrors.email && email.length > 120) {
      nextErrors.email = "Correo electrónico no debe superar 120 caracteres.";
    }

    if (!nextErrors.message && message.length < 10) {
      nextErrors.message = "Mensaje debe tener al menos 10 caracteres.";
    }

    if (!nextErrors.message && message.length > 1500) {
      nextErrors.message = "Mensaje no debe superar 1500 caracteres.";
    }
  
    setErrors(nextErrors);
  
    return !hasFormErrors(nextErrors);
  };

 
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  
    setSubmitMessage("");
    setSubmitStatus("");
  
    const isValid = validateContactForm();
  
    if (!isValid) {
      setSubmitStatus("error");
      setSubmitMessage("Revisa los campos marcados antes de enviar tu consulta.");
      return;
    }
  
    setIsSubmitting(true);
  
    try {
      const response = await fetch(appPath("/api/contacto"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
  
      const result = await response.json();
  
      if (!response.ok || !result.success) {
        throw new Error(result.message || "No se pudo enviar la consulta.");
      }
  
      setSubmitStatus("success");
      setSubmitMessage("Tu consulta fue enviada correctamente. Pronto te contactaremos.");
  
      setFormData({
        name: "",
        email: "",
        phone: "",
        message: "",
        website: "",
      });
  
      setErrors({});
    } catch (error) {
      setSubmitStatus("error");
      setSubmitMessage(
        error instanceof Error
          ? error.message
          : "Ocurrió un error al enviar la consulta.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactItems = [
    {
      icon: Icon.WhatsappLogo,
      label: "WhatsApp",
      value: phone,
      href: whatsappUrl,
      target: "_blank",
    },
    {
      icon: Icon.EnvelopeSimple,
      label: "Correo",
      value: email,
      href: `mailto:${email}`,
    },
    {
      icon: Icon.MapPin,
      label: "Ubicación",
      value: address,
      href: "#ubicacion",
    },
  ];

  const steps = [
    {
      icon: Icon.Package,
      title: "Contanos qué buscás",
      description:
        "Indicá el tipo de producto, cantidad aproximada o necesidad de tu campaña.",
    },
    {
      icon: Icon.ChatCircleText,
      title: "Revisamos opciones",
      description:
        "Te orientamos con alternativas según tu marca, presupuesto y disponibilidad.",
    },
    {
      icon: Icon.FileText,
      title: "Recibís información",
      description:
        "Nuestro equipo te acompaña con una respuesta clara para avanzar con tu solicitud.",
    },
  ];

  return (
    <>
      <TopNavOne
        props="style-marketplace bg-primary-dark border-b border-primary"
        slogan="Cotizá artículos promocionales personalizados para tu marca."
      />

      <div id="header" className="relative w-full">
        <MenuOne props="bg-white" />
      </div>

      <main className="contact-us bg-surface">
        <section className="relative overflow-hidden bg-surface-warm border-y border-line">
          <div className="absolute -left-16 -bottom-20 h-44 w-44 rounded-full border-[28px] border-brand-dark opacity-95" />
          <div className="absolute -right-20 top-10 h-52 w-52 rounded-full bg-secondary-soft opacity-80" />

          <div className="container relative py-16 md:py-20">
            <div className="grid items-center gap-10 lg:grid-cols-2">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-button-uppercase text-primary-dark shadow-sm">
                  <Icon.Sparkle size={16} weight="fill" />
                  Contacto BTL Marketing
                </span>

                <h1 className="heading1 mt-7 max-w-[720px] text-text-strong">
                  Hablemos de tu próxima idea promocional
                </h1>

                <p className="body1 mt-5 max-w-[680px] text-text-secondary">
                  Estamos listos para ayudarte a encontrar artículos
                  personalizados para tu empresa, evento o campaña. Contanos qué
                  necesitás y te orientamos con atención personalizada.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href={whatsappUrl}
                    target="_blank"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-whatsapp px-8 py-4 text-button-uppercase text-white shadow-lg duration-300 hover:scale-[1.02]"
                  >
                    <Icon.WhatsappLogo size={20} />
                    Escribir por WhatsApp
                  </Link>
                  <Link
                    href="/catalogo"
                    className="inline-flex items-center justify-center rounded-full border border-primary px-8 py-4 text-button-uppercase text-primary-dark duration-300 hover:bg-primary hover:text-white"
                  >
                    Ver catálogo
                  </Link>
                </div>
              </div>

              <div className="rounded-[32px] border border-line bg-white p-5 shadow-soft md:p-7">
                <div className="rounded-[26px] bg-brand-dark p-6 text-white md:p-8">
                  <div className="text-button-uppercase text-white/70">
                    Atención personalizada
                  </div>
                  <h2 className="heading3 mt-4 max-w-[420px] text-white">
                    Te ayudamos a elegir el producto ideal para tu marca.
                  </h2>

                 <div className="mt-7 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/20 p-5">
                      <h3 className="heading5 text-white">Catálogo variado</h3>
                      <p className="caption1 mt-2 text-white/70">
                        Opciones promocionales para diferentes necesidades de marca.
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/20 p-5">
                      <h3 className="heading5 text-white">Disponibilidad flexible</h3>
                      <p className="caption1 mt-2 text-white/70">
                        Alternativas según producto, campaña y tiempos requeridos.
                      </p>
                    </div>
                  </div>

                  <div className="mt-7 border-t border-white/20 pt-6">
                    <div className="flex items-center gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10">
                        <Icon.PhoneCall size={22} />
                      </span>
                      <div>
                        <p className="caption1 text-white/60">Atención directa</p>
                        <Link
                          href={whatsappUrl}
                          target="_blank"
                          className="text-button text-white hover:text-secondary-soft"
                        >
                          {phone}
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

       <section className="py-10 md:py-16">
          <div className="container">
            <div className="grid gap-3 md:grid-cols-3 md:gap-5">
              {contactItems.map((item) => {
                const ContactIcon = item.icon;

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    target={item.target}
                    className="group flex items-center gap-4 rounded-[22px] border border-line bg-white p-4 shadow-sm duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-soft md:block md:rounded-[28px] md:p-6"
                  >
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary-dark duration-300 group-hover:bg-primary group-hover:text-white">
                      <ContactIcon size={24} />
                    </span>

                    <span className="block min-w-0 flex-1 md:mt-5">
                      <span className="caption1 block text-text-muted">
                        {item.label}
                      </span>

                      <span className="mt-1 block break-words text-[14px] font-semibold leading-snug text-text-strong md:text-button">
                        {item.value}
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-white py-14 md:py-20">
          <div className="container">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
              <div className="lg:col-span-2">
                <div className="text-button-uppercase text-primary-dark">
                  Solicitá información
                </div>
                <h2 className="heading3 mt-3 text-text-strong">
                  Contanos qué necesitás
                </h2>
                <p className="body1 mt-4 text-text-secondary">
                  Completá el formulario y se abrirá tu correo con la
                  información lista para enviar. Esto nos ayuda a entender mejor
                  tu solicitud y brindarte una respuesta más ordenada.
                </p>

                <div className="mt-8 grid gap-4">
                  {steps.map((step, index) => {
                    const StepIcon = step.icon;

                    return (
                      <div
                        key={step.title}
                        className="flex gap-4 rounded-2xl border border-line bg-surface p-5"
                      >
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                          <StepIcon size={22} />
                        </div>
                        <div>
                            <h3 className="flex items-center gap-2 text-button text-text-strong">
                            <span className="text-primary-dark">
                              {String(index + 1).padStart(2, "0")}
                            </span>
                            {step.title}
                          </h3>
                          <div className="caption1 mt-1 text-text-secondary">
                            {step.description}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="lg:col-span-3 rounded-[32px] border border-line bg-surface-warm p-4 shadow-soft md:p-6">
                <form
                  onSubmit={handleSubmit}
                  className="rounded-[26px] bg-white p-5 md:p-8"
                >
                  <div className="hidden" aria-hidden="true">
                    <label htmlFor="website">Sitio web</label>
                    <input
                      id="website"
                      name="website"
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      value={formData.website}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 gap-y-5 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="name"
                        className="caption1 mb-2 block text-text-secondary"
                      >
                        Nombre completo
                      </label>
                      <input
                        className={getFieldClass("name")}
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Tu nombre"
                        value={formData.name}
                        maxLength={80}
                        onChange={handleChange}
                      />
                      {renderError("name")}
                    </div>
                    <div>
                      <label
                        htmlFor="email"
                        className="caption1 mb-2 block text-text-secondary"
                      >
                        Correo electrónico
                      </label>
                      <input
                        className={getFieldClass("email")}
                        id="email"
                        name="email"
                        type="email"
                        placeholder="correo@empresa.com"
                        value={formData.email}
                        maxLength={120}
                        onChange={handleChange}
                      />
                      {renderError("email")}
                    </div>
                    <div className="sm:col-span-2">
                      <label
                        htmlFor="phone"
                        className="caption1 mb-2 block text-text-secondary"
                      >
                        Teléfono
                      </label>
                      <input
                        className={getFieldClass("phone")}
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="8888-8888"
                        value={formData.phone}
                        maxLength={9}
                        onChange={handleChange}
                      />
                      {renderError("phone")}
                    </div>
                    <div className="sm:col-span-2">
                      <label
                        htmlFor="message"
                        className="caption1 mb-2 block text-text-secondary"
                      >
                        Mensaje
                      </label>
                      <textarea
                        className={getFieldClass("message")}
                        id="message"
                        name="message"
                        rows={5}
                        placeholder="Contanos qué producto, cantidad o necesidad tenés para tu marca."
                        value={formData.message}
                        maxLength={1500}
                        onChange={handleChange}
                      />
                      {renderError("message")}
                    </div>
                  </div>
                  <div className="mt-6">
                      <button
  type="submit"
  disabled={isSubmitting}
  className="button-main flex items-center justify-center gap-2 !bg-primary !text-white hover:!bg-primary-dark disabled:cursor-not-allowed disabled:opacity-70"
>
  {isSubmitting ? "Enviando..." : "Enviar consulta"}
  {!isSubmitting && <Icon.ArrowRight size={18} />}
</button> 
{submitMessage && (
  <p
    className={`mt-4 text-sm font-medium ${
      submitStatus === "success" ? "text-green-700" : "text-red-600"
    }`}
  >
    {submitMessage}
  </p>
)}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>

        <section id="ubicacion" className="py-14 md:py-20">
          <div className="container">
            <div className="mx-auto mb-10 max-w-[720px] text-center">
              <div className="text-button-uppercase text-primary-dark">
                También podés encontrarnos
              </div>
              <h2 className="heading3 mt-3 text-text-strong">
                Canales y ubicación
              </h2>
              <p className="body1 mt-3 text-text-secondary">
                Estamos disponibles para orientarte con información de productos,
                disponibilidad y opciones para tu marca.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="rounded-[28px] border border-line bg-white p-6 shadow-sm">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-primary-dark">
                  <Icon.MapPin size={26} />
                </span>
                <div className="heading5 mt-5 text-text-strong">Ubicación</div>
                <p className="body1 mt-3 text-text-secondary">
                  Altamira, Managua, Nicaragua.
                </p>
                <p className="caption1 mt-2 text-text-muted">
                  De los semáforos Los Zelsa 2½ cuadras al norte, sobre la
                  avenida principal de Altamira.
                </p>
              </div>

              <div className="rounded-[28px] border border-line bg-white p-6 shadow-sm">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-primary-dark">
                  <Icon.Clock size={26} />
                </span>
                <div className="heading5 mt-5 text-text-strong">Atención</div>
                <p className="body1 mt-3 text-text-secondary">
                  Escribinos para recibir asesoría personalizada.
                </p>
                <p className="caption1 mt-2 text-text-muted">
                  Te recomendamos contactar antes de visitarnos para coordinar
                  mejor tu atención.
                </p>
              </div>

              <div
                id="redes-sociales"
                className="rounded-[28px] border border-brand-dark bg-brand-dark p-6 text-white shadow-soft"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white">
                  <Icon.ShareNetwork size={26} />
                </span>
                <div className="heading5 mt-5 text-white">Redes sociales</div>
                <p className="body1 mt-3 text-white/75">
                  Seguinos para ver ideas, productos y novedades promocionales.
                </p>
                <div className="mt-5 flex gap-4">
                  <Link
                    href={facebookUrl}
                    target="_blank"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 duration-300 hover:bg-white hover:text-brand-dark"
                  >
                    <div className="icon-facebook text-xl" />
                  </Link>
                  <Link
                    href={instagramUrl}
                    target="_blank"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 duration-300 hover:bg-white hover:text-brand-dark"
                  >
                    <div className="icon-instagram text-xl" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default ContactoClient;
