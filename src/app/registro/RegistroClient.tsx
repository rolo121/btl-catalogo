"use client";

import React, { useState } from "react";
import Link from "next/link";
import BtlPageHero from "@/components/BTL/BtlPageHero"
import BtlCatalogFooter from "@/components/BTL/BtlCatalogFooter"
import { useRouter } from "next/navigation";
import * as Icon from "@phosphor-icons/react/dist/ssr";
import AuthFeedbackModal from "@/components/Auth/AuthFeedbackModal";
import { ApiError } from "@/lib/apiClient";
import { useAuth } from "@/hooks/useAuth";
import {
  addFieldError,
  formatNicaraguaPhone,
  hasFormErrors,
  validateEmail,
  validateNicaraguaPhone,
  validateNewPassword,
  validatePasswordConfirmation,
  validateRequired,
  type FormErrors,
} from "@/lib/formValidation";

const RegistroClient = () => {
  const router = useRouter();
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company_name: "",
    tax_id: "",
    city: "",
    address: "",
    password: "",
    password_confirmation: "",
    terms_accepted: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationCompleted, setRegistrationCompleted] = useState(false);
  const [feedback, setFeedback] = useState({
    open: false,
    title: "",
    message: "",
    errors: [] as string[],
    tone: "error" as "error" | "success",
  });

  const clearError = (field: string) => {
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = event.target;
    const nextValue =
      name === "phone"
        ? formatNicaraguaPhone(value)
        : type === "checkbox"
          ? checked
          : value;

    setFormData((current) => ({ ...current, [name]: nextValue }));
    clearError(name);
  };

  const validateForm = () => {
    const nextErrors: FormErrors = {};
    addFieldError(nextErrors, "name", validateRequired(formData.name, "Nombre completo"));
    addFieldError(nextErrors, "email", validateEmail(formData.email));
    addFieldError(nextErrors, "phone", validateNicaraguaPhone(formData.phone));
    addFieldError(nextErrors, "city", validateRequired(formData.city, "Ciudad"));
    addFieldError(nextErrors, "password", validateNewPassword(formData.password));
    addFieldError(
      nextErrors,
      "password_confirmation",
      validatePasswordConfirmation(
        formData.password,
        formData.password_confirmation,
      ),
    );

    if (!formData.terms_accepted) {
      nextErrors.terms_accepted =
        "Debes aceptar la política de privacidad para crear la cuenta.";
    }

    if (!nextErrors.name && formData.name.trim().length > 100) {
      nextErrors.name = "El nombre completo no puede superar los 100 caracteres.";
    }

    setErrors(nextErrors);
    return nextErrors;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateForm();

    if (hasFormErrors(nextErrors)) {
      setFeedback({
        open: true,
        title: "Revisa el formulario",
        message: "Corrige los campos marcados antes de crear tu cuenta.",
        errors: Object.values(nextErrors),
        tone: "error",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const session = await register({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone,
        company_name: formData.company_name.trim(),
        tax_id: formData.tax_id.trim(),
        city: formData.city.trim(),
        address: formData.address.trim(),
        password: formData.password,
        password_confirmation: formData.password_confirmation,
        terms_accepted: formData.terms_accepted,
      });

      setRegistrationCompleted(true);
      setFeedback({
        open: true,
        title: "Cuenta creada correctamente",
        message: session.mail_queued
          ? `Tu cuenta ya está activa. También programamos un correo de confirmación para ${formData.email.trim().toLowerCase()}.`
          : "Tu cuenta ya está activa. Podés ingresar a Mi cuenta para continuar.",
        errors: [],
        tone: "success",
      });
    } catch (error) {
      const apiError = error instanceof ApiError ? error : null;
      const normalizedErrors = Object.fromEntries(
        Object.entries(apiError?.errors || {}).map(([field, messages]) => [
          field,
          messages[0] || "Revisa este campo.",
        ]),
      );

      setErrors(normalizedErrors);
      setFeedback({
        open: true,
        title: "No fue posible crear la cuenta",
        message:
          apiError?.message || "Ocurrió un error inesperado durante el registro.",
        errors: Object.values(normalizedErrors),
        tone: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldClass = (field: string) =>
    `border-line px-4 py-3 w-full rounded-lg outline-none focus:border-primary ${
      errors[field] ? "border-red-500" : ""
    }`;

  const renderField = (
    field: keyof typeof formData,
    label: string,
    type = "text",
    required = false,
    helper?: string,
  ) => {
    const isPassword = field === "password" || field === "password_confirmation";
    const isVisible =
      field === "password" ? showPassword : showPasswordConfirmation;
    const toggleVisibility = () => {
      if (field === "password") {
        setShowPassword((current) => !current);
      } else {
        setShowPasswordConfirmation((current) => !current);
      }
    };

    return (
      <div>
        <label htmlFor={field} className="caption1 mb-2 block font-semibold">
          {label}
          {required ? " *" : ""}
        </label>
        <div className={isPassword ? "relative" : undefined}>
          <input
            id={field}
            name={field}
            type={isPassword ? (isVisible ? "text" : "password") : type}
            className={`${fieldClass(field)} ${isPassword ? "pr-12" : ""}`}
            value={typeof formData[field] === "string" ? String(formData[field]) : ""}
            onChange={handleChange}
            aria-invalid={Boolean(errors[field])}
            autoComplete={
              field === "email"
                ? "email"
                : field === "name"
                  ? "name"
                  : field === "phone"
                    ? "tel"
                    : field === "password"
                      ? "new-password"
                      : field === "password_confirmation"
                        ? "new-password"
                        : undefined
            }
          />
          {isPassword ? (
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary duration-300 hover:text-black"
              onClick={toggleVisibility}
              aria-label={isVisible ? "Ocultar contraseña" : "Mostrar contraseña"}
              title={isVisible ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {isVisible ? <Icon.EyeSlash size={21} /> : <Icon.Eye size={21} />}
            </button>
          ) : null}
        </div>
        {helper && !errors[field] ? (
          <p className="caption2 mt-1 text-text-muted">{helper}</p>
        ) : null}
        {errors[field] ? (
          <p className="caption1 mt-1 text-red-600">{errors[field]}</p>
        ) : null}
      </div>
    );
  };

  return (
    <>
      <BtlPageHero
        eyebrow="BTL Marketing · Mi cuenta"
        title="Crear"
        accent="cuenta"
        description="Guarda tus datos para agilizar solicitudes de cotización y dar seguimiento a tus propuestas."
        type="account"
      />

<main className="register-block bg-[#F5F9FB] md:py-16 py-10">
        <div className="container">
          <div className="content-main flex gap-y-10 max-md:flex-col">
            <div className="left md:w-2/3 w-full lg:pr-[60px] md:pr-[40px] md:border-r border-line">
              <div className="heading4">Datos de tu cuenta</div>
              <p className="mt-2 text-text-secondary">
                Completa tus datos una sola vez para agilizar futuras solicitudes
                de cotización.
              </p>

              <form className="md:mt-7 mt-5" onSubmit={handleSubmit} noValidate>
                <section>
                  <div className="mb-4 flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-surface text-primary">
                      <Icon.User size={20} weight="bold" />
                    </span>
                    <div>
                      <h2 className="text-title">Datos personales</h2>
                      <p className="caption2 text-text-muted">
                        Información para identificarte y mantener contacto contigo.
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    {renderField("name", "Nombre completo", "text", true)}
                    {renderField("email", "Correo electrónico", "email", true)}
                    {renderField("phone", "Teléfono", "tel", true, "Formato: 8888-8888")}
                    {renderField("city", "Ciudad", "text", true)}
                  </div>
                </section>

                <section className="mt-8 border-t border-line pt-7">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-surface text-primary">
                      <Icon.Buildings size={20} weight="bold" />
                    </span>
                    <div>
                      <h2 className="text-title">Datos comerciales</h2>
                      <p className="caption2 text-text-muted">
                        Estos campos son opcionales y puedes completarlos más adelante.
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    {renderField("company_name", "Empresa", "text", false, "Opcional")}
                    {renderField("tax_id", "Identificación fiscal", "text", false, "Opcional")}
                  </div>
                  <div className="mt-5">
                    {renderField("address", "Dirección", "text", false, "Opcional")}
                  </div>
                </section>

                <section className="mt-8 border-t border-line pt-7">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-surface text-primary">
                      <Icon.LockKey size={20} weight="bold" />
                    </span>
                    <div>
                      <h2 className="text-title">Seguridad de la cuenta</h2>
                      <p className="caption2 text-text-muted">
                        Utiliza una contraseña segura y que puedas recordar.
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    {renderField("password", "Contraseña", "password", true)}
                    {renderField(
                      "password_confirmation",
                      "Confirmar contraseña",
                      "password",
                      true,
                    )}
                  </div>
                </section>

                <div className="mt-6">
                  <div className="flex items-start">
                    <div className="block-input mt-0.5">
                      <input
                        type="checkbox"
                        name="terms_accepted"
                        id="terms_accepted"
                        checked={formData.terms_accepted}
                        onChange={handleChange}
                      />
                      <Icon.CheckSquare
                        size={20}
                        weight="fill"
                        className="icon-checkbox"
                      />
                    </div>
                    <label
                      htmlFor="terms_accepted"
                      className="pl-2 cursor-pointer text-text-muted"
                    >
                      Acepto el tratamiento de mis datos conforme a la política de
                      privacidad.
                    </label>
                  </div>
                  {errors.terms_accepted ? (
                    <p className="caption1 mt-1 text-red-600">
                      {errors.terms_accepted}
                    </p>
                  ) : null}
                </div>

                <div className="block-button md:mt-7 mt-5">
                  <button
                    className="button-main"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
                  </button>
                </div>
              </form>
            </div>

            <aside className="right md:w-1/3 w-full lg:pl-[60px] md:pl-[40px] flex items-start md:pt-20">
              <div className="text-content max-w-[420px] rounded-3xl border border-line bg-surface p-6 md:p-8">
                <div className="heading4">¿Ya tienes una cuenta?</div>
                <div className="mt-2 text-text-secondary">
                  Inicia sesión para consultar tus solicitudes y propuestas
                  comerciales.
                </div>
                <ul className="mt-5 space-y-3 text-sm text-text-secondary">
                  <li className="flex gap-2">
                    <Icon.CheckCircle size={19} weight="fill" className="mt-0.5 shrink-0 text-primary" />
                    Consulta el estado de tus solicitudes.
                  </li>
                  <li className="flex gap-2">
                    <Icon.CheckCircle size={19} weight="fill" className="mt-0.5 shrink-0 text-primary" />
                    Revisa las propuestas comerciales recibidas.
                  </li>
                  <li className="flex gap-2">
                    <Icon.CheckCircle size={19} weight="fill" className="mt-0.5 shrink-0 text-primary" />
                    Mantén tus datos de contacto actualizados.
                  </li>
                </ul>
                <div className="block-button md:mt-7 mt-5">
                  <Link href="/iniciar-sesion" className="button-main">
                    Iniciar sesión
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <BtlCatalogFooter />
      <AuthFeedbackModal
        {...feedback}
        onClose={() => {
          setFeedback((current) => ({ ...current, open: false }));

          if (registrationCompleted) {
            router.replace("/mi-cuenta");
            router.refresh();
          }
        }}
      />
    </>
  );
};

export default RegistroClient;
