'use client'

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import BtlPageHero from "@/components/BTL/BtlPageHero"
import BtlCatalogFooter from "@/components/BTL/BtlCatalogFooter"
import { useRouter, useSearchParams } from 'next/navigation'
import * as Icon from '@phosphor-icons/react/dist/ssr'
import AuthFeedbackModal from '@/components/Auth/AuthFeedbackModal'
import { ApiError } from '@/lib/apiClient'
import { authApi } from '@/lib/authApi'
import {
  validateEmail,
  validateNewPassword,
  validatePasswordConfirmation,
  type FormErrors,
} from '@/lib/formValidation'

const RestablecerContrasenaClient = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = useMemo(() => searchParams.get('token')?.trim() || '', [searchParams])
  const email = useMemo(
    () => searchParams.get('email')?.trim().toLowerCase() || '',
    [searchParams],
  )

  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [feedback, setFeedback] = useState({
    open: false,
    title: '',
    message: '',
    errors: [] as string[],
    tone: 'error' as 'error' | 'success',
  })

  const invalidLink = !token || !email || !validateEmail(email).isValid

  const validateForm = () => {
    const nextErrors: FormErrors = {}
    const passwordValidation = validateNewPassword(password, 'Nueva contraseña')
    const confirmationValidation = validatePasswordConfirmation(
      password,
      passwordConfirmation,
    )

    if (!passwordValidation.isValid) {
      nextErrors.password = passwordValidation.message
    }

    if (!confirmationValidation.isValid) {
      nextErrors.password_confirmation = confirmationValidation.message
    }

    setErrors(nextErrors)
    return nextErrors
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (invalidLink) {
      setFeedback({
        open: true,
        title: 'Enlace no válido',
        message: 'El enlace no contiene la información necesaria. Solicitá uno nuevo.',
        errors: [],
        tone: 'error',
      })
      return
    }

    const nextErrors = validateForm()
    if (Object.keys(nextErrors).length > 0) return

    setIsSubmitting(true)

    try {
      const response = await authApi.resetPassword({
        email,
        token,
        password,
        password_confirmation: passwordConfirmation,
      })

      setCompleted(true)
      setFeedback({
        open: true,
        title: 'Contraseña actualizada',
        message:
          response.message ||
          'Tu contraseña fue actualizada correctamente. Ya podés iniciar sesión.',
        errors: [],
        tone: 'success',
      })
    } catch (error) {
      const apiError = error instanceof ApiError ? error : null
      const fieldErrors: FormErrors = {}

      Object.entries(apiError?.errors || {}).forEach(([field, messages]) => {
        if (messages[0]) fieldErrors[field] = messages[0]
      })

      setErrors(fieldErrors)
      setFeedback({
        open: true,
        title: 'No se pudo actualizar la contraseña',
        message:
          apiError?.message ||
          'El enlace puede haber vencido o ya fue utilizado. Solicitá uno nuevo.',
        errors: Object.values(fieldErrors),
        tone: 'error',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const fieldClass = (field: string) =>
    `w-full rounded-lg border px-4 py-3 pr-12 outline-none focus:border-primary ${
      errors[field] ? 'border-red-500' : 'border-line'
    }`

  const handleFeedbackClose = () => {
    setFeedback((current) => ({ ...current, open: false }))

    if (completed) {
      router.replace('/iniciar-sesion')
    }
  }

  return (
    <>
      <BtlPageHero
        eyebrow="BTL Marketing · Seguridad"
        title="Nueva"
        accent="contraseña"
        description="Define una nueva contraseña para recuperar el acceso a tu cuenta de BTL Marketing."
        type="security"
      />

<main className="bg-[#F5F9FB] md:py-16 py-10 lg:min-h-[500px]">
        <div className="container">
          <div className="mx-auto max-w-xl rounded-3xl border border-line bg-white p-7 shadow-sm md:p-10">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Icon.LockKey size={25} weight="fill" />
            </div>
            <h1 className="heading4 mt-5">Crea una nueva contraseña</h1>
            <p className="mt-2 text-text-secondary">
              La contraseña debe contener al menos 8 caracteres, una letra y un número.
            </p>

            {invalidLink ? (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
                <p className="font-semibold">El enlace no es válido o está incompleto.</p>
                <p className="mt-2 text-sm">
                  Solicitá un nuevo enlace desde la pantalla de recuperación.
                </p>
                <Link href="/recuperar-contrasena" className="button-main mt-5 inline-flex">
                  Solicitar nuevo enlace
                </Link>
              </div>
            ) : (
              <form className="mt-7 space-y-5" onSubmit={handleSubmit} noValidate>
                <div>
                  <label htmlFor="password" className="caption1 mb-2 block font-semibold">
                    Nueva contraseña
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      autoComplete="new-password"
                      className={fieldClass('password')}
                      onChange={(event) => {
                        setPassword(event.target.value)
                        setErrors((current) => ({ ...current, password: '' }))
                      }}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary"
                      onClick={() => setShowPassword((current) => !current)}
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                      {showPassword ? <Icon.EyeSlash size={21} /> : <Icon.Eye size={21} />}
                    </button>
                  </div>
                  {errors.password ? (
                    <p className="caption1 mt-1 text-red-600">{errors.password}</p>
                  ) : null}
                </div>

                <div>
                  <label
                    htmlFor="password_confirmation"
                    className="caption1 mb-2 block font-semibold"
                  >
                    Confirmar nueva contraseña
                  </label>
                  <div className="relative">
                    <input
                      id="password_confirmation"
                      type={showConfirmation ? 'text' : 'password'}
                      value={passwordConfirmation}
                      autoComplete="new-password"
                      className={fieldClass('password_confirmation')}
                      onChange={(event) => {
                        setPasswordConfirmation(event.target.value)
                        setErrors((current) => ({
                          ...current,
                          password_confirmation: '',
                        }))
                      }}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary"
                      onClick={() => setShowConfirmation((current) => !current)}
                      aria-label={showConfirmation ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                      {showConfirmation ? <Icon.EyeSlash size={21} /> : <Icon.Eye size={21} />}
                    </button>
                  </div>
                  {errors.password_confirmation ? (
                    <p className="caption1 mt-1 text-red-600">
                      {errors.password_confirmation}
                    </p>
                  ) : null}
                </div>

                <button type="submit" className="button-main w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Actualizando...' : 'Guardar nueva contraseña'}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <BtlCatalogFooter />
      <AuthFeedbackModal
        {...feedback}
        onClose={handleFeedbackClose}
      />
    </>
  )
}

export default RestablecerContrasenaClient
