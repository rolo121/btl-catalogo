"use client";

import React, { useState } from "react";
import Link from "next/link";
import BtlPageHero from "@/components/BTL/BtlPageHero"
import BtlCatalogFooter from "@/components/BTL/BtlCatalogFooter"
import AuthFeedbackModal from "@/components/Auth/AuthFeedbackModal";
import { ApiError } from "@/lib/apiClient";
import { authApi } from "@/lib/authApi";
import { validateEmail } from "@/lib/formValidation";

const RecuperarContrasenaClient = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({
    open: false,
    title: "",
    message: "",
    tone: "error" as "error" | "success",
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validation = validateEmail(email);

    if (!validation.isValid) {
      setError(validation.message);
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await authApi.forgotPassword({
        email: email.trim().toLowerCase(),
      });
      setFeedback({
        open: true,
        title: "Revisa tu correo",
        message:
          response.message ||
          "Si el correo está registrado, recibirás un enlace para crear una nueva contraseña.",
        tone: "success",
      });
    } catch (requestError) {
      const apiError = requestError instanceof ApiError ? requestError : null;
      setFeedback({
        open: true,
        title: "No fue posible enviar la solicitud",
        message:
          apiError?.message || "Ocurrió un error inesperado. Intenta nuevamente.",
        tone: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <BtlPageHero
        eyebrow="BTL Marketing · Seguridad"
        title="Recuperar"
        accent="contraseña"
        description="Solicita un enlace seguro para recuperar el acceso a tu cuenta."
        type="security"
      />

<main className="forgot-pass bg-[#F5F9FB] md:py-16 py-10 lg:min-h-[460px]">
        <div className="container">
          <div className="content-main flex gap-y-10 max-md:flex-col">
            <div className="left md:w-1/2 w-full lg:pr-[60px] md:pr-[40px] md:border-r border-line">
              <div className="heading4">Recupera tu contraseña</div>
              <div className="body1 mt-2 text-text-secondary">
                Ingresa el correo asociado a tu cuenta y te enviaremos un enlace
                para crear una nueva contraseña.
              </div>

              <form className="md:mt-7 mt-5" onSubmit={handleSubmit} noValidate>
                <label
                  htmlFor="email"
                  className="caption1 mb-2 block font-semibold"
                >
                  Correo electrónico
                </label>
                <input
                  className={`border-line px-4 py-3 w-full rounded-lg outline-none focus:border-primary ${
                    error ? "border-red-500" : ""
                  }`}
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setError("");
                  }}
                  aria-invalid={Boolean(error)}
                />
                {error ? (
                  <p className="caption1 mt-1 text-red-600">{error}</p>
                ) : null}

                <div className="block-button md:mt-7 mt-5">
                  <button
                    className="button-main"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Enviando..." : "Enviar enlace de recuperación"}
                  </button>
                </div>
              </form>
            </div>

            <div className="right md:w-1/2 w-full lg:pl-[60px] md:pl-[40px] flex items-center">
              <div className="text-content max-w-[480px]">
                <div className="heading4">¿Recordaste tu contraseña?</div>
                <div className="mt-2 text-text-secondary">
                  Regresa al inicio de sesión para acceder a tu cuenta.
                </div>
                <div className="block-button md:mt-7 mt-5">
                  <Link href="/iniciar-sesion" className="button-main">
                    Iniciar sesión
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <BtlCatalogFooter />
      <AuthFeedbackModal
        open={feedback.open}
        title={feedback.title}
        message={feedback.message}
        tone={feedback.tone}
        onClose={() =>
          setFeedback((current) => ({ ...current, open: false }))
        }
      />
    </>
  );
};

export default RecuperarContrasenaClient;
