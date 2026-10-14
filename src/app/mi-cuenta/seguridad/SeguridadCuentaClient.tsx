'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import BtlPageHero from "@/components/BTL/BtlPageHero"
import BtlCatalogFooter from "@/components/BTL/BtlCatalogFooter"
import { useRouter } from 'next/navigation'
import * as Icon from '@phosphor-icons/react/dist/ssr'
import AuthFeedbackModal from '@/components/Auth/AuthFeedbackModal'
import { useAuth } from '@/hooks/useAuth'
import { ApiError } from '@/lib/apiClient'
import { authApi } from '@/lib/authApi'
import {
  validateNewPassword,
  validatePasswordConfirmation,
  type FormErrors,
} from '@/lib/formValidation'

const SeguridadCuentaClient = () => {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()
  const [currentPassword, setCurrentPassword] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState({
    open: false,
    title: '',
    message: '',
    errors: [] as string[],
    tone: 'error' as 'error' | 'success',
  })

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/iniciar-sesion')
    }
  }, [isAuthenticated, isLoading, router])

  const validateForm = () => {
    const nextErrors: FormErrors = {}

    if (!currentPassword) {
      nextErrors.current_password = 'La contraseña actual es obligatoria.'
    }

    const passwordValidation = validateNewPassword(password, 'Nueva contraseña')
    if (!passwordValidation.isValid) {
      nextErrors.password = passwordValidation.message
    }

    if (currentPassword && password && currentPassword === password) {
      nextErrors.password = 'La nueva contraseña debe ser diferente de la actual.'
    }

    const confirmationValidation = validatePasswordConfirmation(
      password,
      passwordConfirmation,
    )
    if (!confirmationValidation.isValid) {
      nextErrors.password_confirmation = confirmationValidation.message
    }

    setErrors(nextErrors)
    return nextErrors
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors = validateForm()

    if (Object.keys(nextErrors).length > 0) return

    setIsSubmitting(true)

    try {
      const response = await authApi.changePassword({
        current_password: currentPassword,
        password,
        password_confirmation: passwordConfirmation,
      })

      setCurrentPassword('')
      setPassword('')
      setPasswordConfirmation('')
      setErrors({})
      setFeedback({
        open: true,
        title: 'Contraseña actualizada',
        message: response.message || 'Tu contraseña fue actualizada correctamente.',
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
          'Revisá la contraseña actual y volvé a intentarlo.',
        errors: Object.values(fieldErrors),
        tone: 'error',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const fieldClass = (field: string) =>
    `w-full rounded-xl border bg-white px-4 py-3 pr-12 outline-none focus:border-primary ${
      errors[field] ? 'border-red-500' : 'border-line'
    }`

  const passwordField = (
    id: string,
    label: string,
    value: string,
    setValue: React.Dispatch<React.SetStateAction<string>>,
    visible: boolean,
    setVisible: React.Dispatch<React.SetStateAction<boolean>>,
    autoComplete: 'current-password' | 'new-password',
  ) => (
    <div>
      <label htmlFor={id} className="caption1 mb-2 block font-semibold text-text-strong">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          value={value}
          autoComplete={autoComplete}
          className={fieldClass(id)}
          onChange={(event) => {
            setValue(event.target.value)
            setErrors((current) => ({ ...current, [id]: '' }))
          }}
        />
        <button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        >
          {visible ? <Icon.EyeSlash size={21} /> : <Icon.Eye size={21} />}
        </button>
      </div>
      {errors[id] ? (
        <p className="caption1 mt-1 text-red-600">{errors[id]}</p>
      ) : null}
    </div>
  )

  if (isLoading || !isAuthenticated) {
    return (
      <main className="flex min-h-[420px] items-center justify-center">
        <Icon.CircleNotch size={30} className="animate-spin text-primary" />
      </main>
    )
  }

  return (
    <>
      <BtlPageHero
        eyebrow="BTL Marketing · Mi cuenta"
        title="Seguridad"
        accent="de cuenta"
        description="Administra tu contraseña y protege el acceso a la información de tus solicitudes."
        type="security"
      />

<main className="bg-[#F5F9FB] md:py-16 py-10">
        <div className="container">
          <div className="mx-auto max-w-2xl rounded-3xl border border-line bg-white p-7 shadow-sm md:p-10">
            <div className="flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="caption1 uppercase tracking-wider text-primary-dark">
                  Seguridad de la cuenta
                </p>
                <h1 className="heading3 mt-2 text-text-strong">Cambiar contraseña</h1>
                <p className="mt-2 text-text-secondary">
                  Al guardar el cambio se cerrarán las demás sesiones activas de tu cuenta.
                </p>
              </div>
              <Link href="/mi-cuenta" className="button-main bg-black">
                Volver a Mi cuenta
              </Link>
            </div>

            <form className="mt-7 space-y-5" onSubmit={handleSubmit} noValidate>
              {passwordField(
                'current_password',
                'Contraseña actual',
                currentPassword,
                setCurrentPassword,
                showCurrent,
                setShowCurrent,
                'current-password',
              )}

              {passwordField(
                'password',
                'Nueva contraseña',
                password,
                setPassword,
                showPassword,
                setShowPassword,
                'new-password',
              )}

              {passwordField(
                'password_confirmation',
                'Confirmar nueva contraseña',
                passwordConfirmation,
                setPasswordConfirmation,
                showConfirmation,
                setShowConfirmation,
                'new-password',
              )}

              <p className="rounded-xl bg-surface px-4 py-3 text-sm text-text-secondary">
                Usá al menos 8 caracteres e incluí una letra y un número.
              </p>

              <button type="submit" className="button-main w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Actualizando...' : 'Actualizar contraseña'}
              </button>
            </form>
          </div>
        </div>
      </main>

      <BtlCatalogFooter />
      <AuthFeedbackModal
        {...feedback}
        onClose={() => setFeedback((current) => ({ ...current, open: false }))}
      />
    </>
  )
}

export default SeguridadCuentaClient
