"use client";

import React, { useEffect, useRef, useState } from "react";
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
  hasFormErrors,
  validateEmail,
  validatePassword,
  type FormErrors,
} from "@/lib/formValidation";

const IniciarSesionClient = () => {
  const router = useRouter();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [retryAfter, setRetryAfter] = useState(0);
  const submittingRef = useRef(false);
  const [feedback, setFeedback] = useState({
    open: false,
    title: "",
    message: "",
    errors: [] as string[],
  });

  useEffect(() => {
    if (retryAfter <= 0) return

    const timer = window.setInterval(() => {
      setRetryAfter((current) => Math.max(0, current - 1))
    }, 1000)

    return () => window.clearInterval(timer)
  }, [retryAfter])

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
    setFormData((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
    clearError(name);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (submittingRef.current || retryAfter > 0) {
      return;
    }

    const nextErrors: FormErrors = {};
    addFieldError(nextErrors, "email", validateEmail(formData.email));
    addFieldError(nextErrors, "password", validatePassword(formData.password));
    setErrors(nextErrors);

    if (hasFormErrors(nextErrors)) {
      setFeedback({
        open: true,
        title: "Revisa el formulario",
        message: "Corrige los campos marcados antes de iniciar sesión.",
        errors: Object.values(nextErrors),
      });
      return;
    }

    submittingRef.current = true;
    setIsSubmitting(true);

    try {
      await login({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        remember: formData.remember,
      });

      const redirect = new URLSearchParams(window.location.search).get("redirect");
      router.replace(redirect?.startsWith("/") ? redirect : "/mi-cuenta");
      router.refresh();
    } catch (error) {
      const apiError = error instanceof ApiError ? error : null;
      const fieldErrors = apiError?.errors || {};
      const normalizedErrors = Object.fromEntries(
        Object.entries(fieldErrors).map(([field, messages]) => [
          field,
          messages[0] || "Revisa este campo.",
        ]),
      );

      setErrors(normalizedErrors);

      if (apiError?.status === 429) {
        const seconds = Math.max(1, apiError.retryAfter || 60);
        setRetryAfter(seconds);
        setFeedback({
          open: true,
          title: "Espera antes de volver a intentar",
          message:
            apiError.message ||
            `Has realizado demasiados intentos. Podrás volver a intentarlo en ${seconds} segundos.`,
          errors: [],
        });
      } else {
        setFeedback({
          open: true,
          title: "No fue posible iniciar sesión",
          message:
            apiError?.message ||
            "Ocurrió un error inesperado al iniciar sesión.",
          errors: Object.values(normalizedErrors),
        });
      }
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const fieldClass = (field: string) =>
    `border-line px-4 py-3 w-full rounded-lg outline-none focus:border-primary ${
      errors[field] ? "border-red-500" : ""
    }`;

  return (
    <>
      <BtlPageHero
        eyebrow="BTL Marketing · Mi cuenta"
        title="Iniciar"
        accent="sesión"
        description="Accede a tus solicitudes, propuestas y datos guardados para continuar con tus cotizaciones."
        type="account"
      />

<main className="login-block bg-[#F5F9FB] md:py-16 py-10 lg:min-h-[500px]">
        <div className="container">
          <div className="content-main flex gap-y-10 max-md:flex-col">
            <div className="left md:w-1/2 w-full lg:pr-[60px] md:pr-[40px] md:border-r border-line">
              <div className="heading4">Accede a tu cuenta</div>
              <p className="mt-2 text-text-secondary">
                Consulta tus solicitudes, propuestas y datos de contacto.
              </p>

              <form className="md:mt-7 mt-5" onSubmit={handleSubmit} noValidate>
                <div>
                  <label
                    htmlFor="email"
                    className="caption1 mb-2 block font-semibold"
                  >
                    Correo electrónico
                  </label>
                  <input
                    className={fieldClass("email")}
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    aria-invalid={Boolean(errors.email)}
                  />
                  {errors.email ? (
                    <p className="caption1 mt-1 text-red-600">{errors.email}</p>
                  ) : null}
                </div>

                <div className="mt-5">
                  <label
                    htmlFor="password"
                    className="caption1 mb-2 block font-semibold"
                  >
                    Contraseña
                  </label>
                  <div className="relative">
                    <input
                      className={`${fieldClass("password")} pr-12`}
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={formData.password}
                      onChange={handleChange}
                      aria-invalid={Boolean(errors.password)}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary duration-300 hover:text-black"
                      onClick={() => setShowPassword((current) => !current)}
                      aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                      title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                      {showPassword ? <Icon.EyeSlash size={21} /> : <Icon.Eye size={21} />}
                    </button>
                  </div>
                  {errors.password ? (
                    <p className="caption1 mt-1 text-red-600">{errors.password}</p>
                  ) : null}
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center">
                    <div className="block-input">
                      <input
                        type="checkbox"
                        name="remember"
                        id="remember"
                        checked={formData.remember}
                        onChange={handleChange}
                      />
                      <Icon.CheckSquare
                        size={20}
                        weight="fill"
                        className="icon-checkbox"
                      />
                    </div>
                    <label htmlFor="remember" className="pl-2 cursor-pointer">
                      Mantener sesión iniciada
                    </label>
                  </div>
                  <Link
                    href="/recuperar-contrasena"
                    className="font-semibold hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>

                <div className="block-button md:mt-7 mt-5">
                  <button
                    className="button-main"
                    type="submit"
                    disabled={isSubmitting || retryAfter > 0}
                  >
                    {isSubmitting
                      ? "Ingresando..."
                      : retryAfter > 0
                        ? `Intenta de nuevo en ${retryAfter} s`
                        : "Iniciar sesión"}
                  </button>
                </div>
              </form>
            </div>

            <div className="right md:w-1/2 w-full lg:pl-[60px] md:pl-[40px] flex items-center">
              <div className="text-content max-w-[480px]">
                <div className="heading4">¿Todavía no tienes cuenta?</div>
                <div className="mt-2 text-text-secondary">
                  Regístrate para consultar el seguimiento de tus solicitudes y
                  propuestas comerciales.
                </div>
                <div className="block-button md:mt-7 mt-5">
                  <Link href="/registro" className="button-main">
                    Crear cuenta
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <BtlCatalogFooter />
      <AuthFeedbackModal
        {...feedback}
        onClose={() =>
          setFeedback((current) => ({ ...current, open: false }))
        }
      />
    </>
  );
};

export default IniciarSesionClient;
