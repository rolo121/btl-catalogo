'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import BtlPageHero from "@/components/BTL/BtlPageHero"
import BtlCatalogFooter from "@/components/BTL/BtlCatalogFooter"
import { useRouter } from 'next/navigation'
import * as Icon from '@phosphor-icons/react/dist/ssr'
import AuthFeedbackModal from '@/components/Auth/AuthFeedbackModal'
import CustomerRequestsPanel from '@/components/Account/CustomerRequestsPanel'
import CustomerProposalsPanel from '@/components/Account/CustomerProposalsPanel'
import { useAuth } from '@/hooks/useAuth'
import { ApiError } from '@/lib/apiClient'
import { customerQuotesApi } from '@/lib/customerQuotesApi'
import type { CustomerAccountSummary } from '@/types/CustomerQuoteTypes'
import {
  addFieldError,
  formatNicaraguaPhone,
  hasFormErrors,
  validateEmail,
  validateNicaraguaPhone,
  validateRequired,
  type FormErrors,
} from '@/lib/formValidation'

type AccountTab = 'resumen' | 'solicitudes' | 'propuestas' | 'perfil'

type ProfileForm = {
  name: string
  email: string
  phone: string
  company_name: string
  tax_id: string
  city: string
  address: string
}

const emptyProfileForm: ProfileForm = {
  name: '',
  email: '',
  phone: '',
  company_name: '',
  tax_id: '',
  city: '',
  address: '',
}

const MiCuentaClient = () => {
  const router = useRouter()
  const {
    user,
    profile,
    isAuthenticated,
    isLoading,
    logout,
    updateProfile,
  } = useAuth()

  const [activeTab, setActiveTab] = useState<AccountTab>('resumen')
  const [accountSummary, setAccountSummary] =
    useState<CustomerAccountSummary | null>(null)
  const [isSummaryLoading, setIsSummaryLoading] = useState(false)
  const [summaryError, setSummaryError] = useState('')
  const [accountRefreshKey] = useState(0)
  const [formData, setFormData] = useState<ProfileForm>(emptyProfileForm)
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSaving, setIsSaving] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false)
  const [feedback, setFeedback] = useState({
    open: false,
    title: '',
    message: '',
    errors: [] as string[],
    tone: 'error' as 'error' | 'success',
  })

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/iniciar-sesion?redirect=/mi-cuenta')
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    if (!isAuthenticated) {
      setAccountSummary(null)
      return
    }

    let cancelled = false

    const loadSummary = async () => {
      setIsSummaryLoading(true)
      setSummaryError('')

      try {
        const summary = await customerQuotesApi.summary()

        if (!cancelled) {
          setAccountSummary(summary)
        }
      } catch (error) {
        if (cancelled) return

        const apiError = error instanceof ApiError ? error : null
        setSummaryError(
          apiError?.message ||
            'No fue posible cargar el resumen de tu cuenta.',
        )
      } finally {
        if (!cancelled) setIsSummaryLoading(false)
      }
    }

    void loadSummary()

    return () => {
      cancelled = true
    }
  }, [accountRefreshKey, isAuthenticated])

  useEffect(() => {
    if (!user) return

    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: formatNicaraguaPhone(profile?.phone || ''),
      company_name: profile?.company_name || '',
      tax_id: profile?.tax_id || '',
      city: profile?.city || '',
      address: profile?.address || '',
    })
  }, [user, profile])

  const initials = useMemo(() => {
    const parts = String(user?.name || 'Cliente')
      .trim()
      .split(/\s+/)
      .filter(Boolean)

    return parts
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('')
  }, [user?.name])

  const firstName = useMemo(() => {
    return String(user?.name || 'Cliente').trim().split(/\s+/)[0] || 'Cliente'
  }, [user?.name])

  const clearFieldError = (field: keyof ProfileForm) => {
    setErrors((current) => {
      if (!current[field]) return current

      const next = { ...current }
      delete next[field]

      return next
    })
  }

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target
    const field = name as keyof ProfileForm
    const nextValue = field === 'phone' ? formatNicaraguaPhone(value) : value

    setFormData((current) => ({
      ...current,
      [field]: nextValue,
    }))

    clearFieldError(field)
  }

  const validateProfile = () => {
    const nextErrors: FormErrors = {}

    addFieldError(
      nextErrors,
      'name',
      validateRequired(formData.name, 'Nombre completo'),
    )
    addFieldError(
      nextErrors,
      'email',
      validateEmail(formData.email, 'Correo electrónico'),
    )
    addFieldError(
      nextErrors,
      'phone',
      validateNicaraguaPhone(formData.phone, 'Teléfono'),
    )
    addFieldError(
      nextErrors,
      'city',
      validateRequired(formData.city, 'Ciudad'),
    )

    if (!nextErrors.name && formData.name.trim().length < 3) {
      nextErrors.name = 'Nombre completo debe tener al menos 3 caracteres.'
    }

    if (formData.company_name.trim().length > 120) {
      nextErrors.company_name = 'Empresa no debe superar 120 caracteres.'
    }

    if (formData.tax_id.trim().length > 60) {
      nextErrors.tax_id =
        'Identificación fiscal no debe superar 60 caracteres.'
    }

    if (formData.city.trim().length > 100) {
      nextErrors.city = 'Ciudad no debe superar 100 caracteres.'
    }

    if (formData.address.trim().length > 255) {
      nextErrors.address = 'Dirección no debe superar 255 caracteres.'
    }

    setErrors(nextErrors)

    return nextErrors
  }

  const handleProfileSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    const validationErrors = validateProfile()

    if (hasFormErrors(validationErrors)) {
      setFeedback({
        open: true,
        title: 'Revisa tus datos',
        message: 'Corrige los campos marcados antes de guardar los cambios.',
        errors: Object.values(validationErrors),
        tone: 'error',
      })
      return
    }

    setIsSaving(true)

    try {
      await updateProfile({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone,
        company_name: formData.company_name.trim() || null,
        tax_id: formData.tax_id.trim() || null,
        city: formData.city.trim(),
        address: formData.address.trim() || null,
      })

      setFeedback({
        open: true,
        title: 'Datos actualizados',
        message: 'Tu información de contacto se guardó correctamente.',
        errors: [],
        tone: 'success',
      })
    } catch (error) {
      const apiError = error instanceof ApiError ? error : null
      const fieldErrors = apiError?.errors || {}
      const normalizedErrors = Object.fromEntries(
        Object.entries(fieldErrors).map(([field, messages]) => [
          field,
          messages[0] || 'Revisa este campo.',
        ]),
      )

      setErrors(normalizedErrors)
      setFeedback({
        open: true,
        title: 'No fue posible guardar los cambios',
        message:
          apiError?.message ||
          'Ocurrió un error inesperado al actualizar tus datos.',
        errors: Object.values(normalizedErrors),
        tone: 'error',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)

    try {
      await logout()
      router.replace('/iniciar-sesion')
      router.refresh()
    } catch (error) {
      const apiError = error instanceof ApiError ? error : null

      setFeedback({
        open: true,
        title: 'No fue posible cerrar la sesión',
        message:
          apiError?.message ||
          'Ocurrió un error inesperado al cerrar la sesión.',
        errors: [],
        tone: 'error',
      })
      setShowLogoutConfirmation(false)
    } finally {
      setIsLoggingOut(false)
    }
  }

  const fieldClass = (field: keyof ProfileForm) =>
    `mt-2 w-full rounded-xl border bg-white px-4 py-3 outline-none duration-300 focus:border-primary ${
      errors[field] ? 'border-red-500' : 'border-line'
    }`

  const renderFieldError = (field: keyof ProfileForm) => {
    if (!errors[field]) return null

    return (
      <p className="caption1 mt-1 text-red-600">
        {errors[field]}
      </p>
    )
  }

  const tabButtonClass = (tab: AccountTab) =>
    `flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left duration-300 ${
      activeTab === tab
        ? 'bg-white text-primary-dark shadow-sm'
        : 'text-text-secondary hover:bg-white/70 hover:text-text-strong'
    }`

  if (isLoading || !isAuthenticated || !user) {
    return (
      <>
        <BtlPageHero
          eyebrow="BTL Marketing · Mi cuenta"
          title="Mi"
          accent="cuenta"
          description="Consulta tus solicitudes, propuestas comerciales y datos de contacto desde un solo lugar."
          type="account"
        />

<main className="min-h-[480px] bg-[#F5F9FB] py-16">
          <div className="container">
            <div className="flex flex-col items-center justify-center rounded-3xl border border-line bg-white px-6 py-16 text-center shadow-sm">
              <Icon.SpinnerGap
                size={34}
                className="animate-spin text-primary-dark"
              />
              <h1 className="heading5 mt-5 text-text-strong">
                Cargando tu cuenta
              </h1>
              <p className="mt-2 text-text-secondary">
                Estamos verificando tu sesión y preparando tu información.
              </p>
            </div>
          </div>
        </main>

        <BtlCatalogFooter />
      </>
    )
  }

  return (
    <>
        <BtlPageHero
          eyebrow="BTL Marketing · Mi cuenta"
          title="Mi"
          accent="cuenta"
          description="Consulta tus solicitudes, propuestas comerciales y datos de contacto desde un solo lugar."
          type="account"
        />

<main className="bg-[#F5F9FB] md:py-16 py-10">
        <div className="container">
          <div className="grid gap-8 lg:grid-cols-[300px_minmax(0,1fr)]">
            <aside className="h-fit rounded-3xl border border-line bg-surface-warm p-5 shadow-sm lg:sticky lg:top-6">
              <div className="flex flex-col items-center border-b border-line pb-6 text-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary text-3xl font-semibold text-white shadow-brand">
                  {initials}
                </div>

                <h1 className="heading5 mt-4 text-text-strong">{user.name}</h1>
                <p className="mt-1 break-all text-sm text-text-secondary">
                  {user.email}
                </p>

                {profile?.company_name ? (
                  <span className="mt-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-primary-dark">
                    <Icon.Buildings size={16} />
                    {profile.company_name}
                  </span>
                ) : null}
              </div>

              <nav className="mt-5 space-y-2" aria-label="Menú de la cuenta">
                <button
                  type="button"
                  className={tabButtonClass('resumen')}
                  onClick={() => setActiveTab('resumen')}
                >
                  <Icon.HouseLine size={20} />
                  <span className="font-semibold">Resumen</span>
                </button>

                <button
                  type="button"
                  className={tabButtonClass('solicitudes')}
                  onClick={() => setActiveTab('solicitudes')}
                >
                  <Icon.ClipboardText size={20} />
                  <span className="font-semibold">Mis solicitudes</span>
                </button>

                <button
                  type="button"
                  className={tabButtonClass('propuestas')}
                  onClick={() => setActiveTab('propuestas')}
                >
                  <Icon.FileText size={20} />
                  <span className="font-semibold">Mis propuestas</span>
                </button>

                <button
                  type="button"
                  className={tabButtonClass('perfil')}
                  onClick={() => setActiveTab('perfil')}
                >
                  <Icon.UserCircle size={20} />
                  <span className="font-semibold">Datos de contacto</span>
                </button>

                <Link
                  href="/mi-cuenta/seguridad"
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-text-secondary duration-300 hover:bg-white hover:text-text-strong"
                >
                  <Icon.LockKey size={20} />
                  <span className="font-semibold">Seguridad</span>
                </Link>

                <button
                  type="button"
                  className="mt-4 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-red-600 duration-300 hover:bg-red-50"
                  onClick={() => setShowLogoutConfirmation(true)}
                >
                  <Icon.SignOut size={20} />
                  <span className="font-semibold">Cerrar sesión</span>
                </button>
              </nav>
            </aside>

            <section className="min-w-0">
              {activeTab === 'resumen' ? (
                <div className="space-y-6">
                  <div className="overflow-hidden rounded-3xl bg-brand-dark p-7 text-white shadow-soft md:p-9">
                    <p className="caption1 uppercase tracking-[0.16em] text-white/60">
                      Área de cliente
                    </p>
                    <h2 className="heading3 mt-3 text-white">
                      Bienvenido, {firstName}
                    </h2>
                    <p className="mt-3 max-w-2xl leading-7 text-white/75">
                      Desde aquí podrás consultar tus solicitudes, revisar las
                      propuestas comerciales recibidas y mantener actualizados
                      tus datos de contacto.
                    </p>

                    <div className="mt-7 flex flex-wrap gap-3">
                      <Link
                        href="/productos"
                        className="button-main inline-flex items-center gap-2"
                      >
                        Explorar catálogo
                        <Icon.ArrowRight size={18} />
                      </Link>

                      <button
                        type="button"
                        className="inline-flex items-center justify-center rounded-full border border-white/30 px-6 py-3 font-semibold text-white duration-300 hover:bg-white hover:text-brand-dark"
                        onClick={() => setActiveTab('perfil')}
                      >
                        Actualizar mis datos
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    {[
                      {
                        label: 'Solicitudes enviadas',
                        value: isSummaryLoading
                          ? '...'
                          : String(accountSummary?.requests_total ?? 0),
                        icon: Icon.ClipboardText,
                      },
                      {
                        label: 'Propuestas recibidas',
                        value: isSummaryLoading
                          ? '...'
                          : String(accountSummary?.proposals_received ?? 0),
                        icon: Icon.FileText,
                      },
                      {
                        label: 'Propuestas pendientes',
                        value: isSummaryLoading
                          ? '...'
                          : String(accountSummary?.proposals_pending ?? 0),
                        icon: Icon.Clock,
                      },
                    ].map((item) => {
                      const ItemIcon = item.icon

                      return (
                        <article
                          key={item.label}
                          className="rounded-2xl border border-line bg-white p-5 shadow-sm"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-sm text-text-secondary">
                                {item.label}
                              </p>
                              <p className="heading4 mt-2 text-text-strong">
                                {item.value}
                              </p>
                            </div>

                            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-soft text-primary-dark">
                              <ItemIcon size={22} />
                            </span>
                          </div>
                        </article>
                      )
                    })}
                  </div>

                  {summaryError ? (
                    <div className="rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm text-orange-800">
                      {summaryError}
                    </div>
                  ) : null}

                  <div className="grid gap-6 xl:grid-cols-2">
                    <article className="rounded-3xl border border-line bg-white p-6 shadow-sm">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="caption1 uppercase tracking-wider text-primary-dark">
                            Información de contacto
                          </p>
                          <h3 className="heading5 mt-2 text-text-strong">
                            Tus datos actuales
                          </h3>
                        </div>

                        <button
                          type="button"
                          className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-text-secondary duration-300 hover:border-primary hover:text-primary-dark"
                          onClick={() => setActiveTab('perfil')}
                          aria-label="Editar datos"
                          title="Editar datos"
                        >
                          <Icon.PencilSimple size={19} />
                        </button>
                      </div>

                      <dl className="mt-6 space-y-4">
                        <div className="flex gap-3">
                          <Icon.Phone size={20} className="mt-0.5 text-primary-dark" />
                          <div>
                            <dt className="text-sm text-text-secondary">Teléfono</dt>
                            <dd className="font-semibold text-text-strong">
                              {profile?.phone || 'Sin registrar'}
                            </dd>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <Icon.MapPin size={20} className="mt-0.5 text-primary-dark" />
                          <div>
                            <dt className="text-sm text-text-secondary">Ciudad</dt>
                            <dd className="font-semibold text-text-strong">
                              {profile?.city || 'Sin registrar'}
                            </dd>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <Icon.Buildings size={20} className="mt-0.5 text-primary-dark" />
                          <div>
                            <dt className="text-sm text-text-secondary">Empresa</dt>
                            <dd className="font-semibold text-text-strong">
                              {profile?.company_name || 'No especificada'}
                            </dd>
                          </div>
                        </div>
                      </dl>
                    </article>

                    <article className="rounded-3xl border border-line bg-white p-6 shadow-sm">
                      <p className="caption1 uppercase tracking-wider text-primary-dark">
                        Próximo paso
                      </p>
                      <h3 className="heading5 mt-2 text-text-strong">
                        Prepará una nueva solicitud
                      </h3>
                      <p className="mt-3 leading-6 text-text-secondary">
                        Explorá el catálogo, seleccioná productos y agregalos al
                        carrito para enviar una solicitud de cotización.
                      </p>

                      <Link
                        href="/productos"
                        className="mt-6 inline-flex items-center gap-2 font-semibold text-primary-dark hover:underline"
                      >
                        Ir al catálogo
                        <Icon.ArrowRight size={17} />
                      </Link>
                    </article>
                  </div>
                </div>
              ) : null}

              {activeTab === 'solicitudes' ? (
                <CustomerRequestsPanel
                  isActive={activeTab === 'solicitudes'}
                  refreshKey={accountRefreshKey}
                />
              ) : null}

              {activeTab === 'propuestas' ? (
                <CustomerProposalsPanel
                  isActive={activeTab === 'propuestas'}
                  refreshKey={accountRefreshKey}
                />
              ) : null}

              {activeTab === 'perfil' ? (
                <div className="rounded-3xl border border-line bg-white p-7 shadow-sm md:p-9">
                  <div className="flex flex-col gap-3 border-b border-line pb-6 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="caption1 uppercase tracking-wider text-primary-dark">
                        Perfil del cliente
                      </p>
                      <h2 className="heading3 mt-2 text-text-strong">
                        Datos de contacto
                      </h2>
                      <p className="mt-2 text-text-secondary">
                        Mantén esta información actualizada para agilizar futuras
                        solicitudes.
                      </p>
                    </div>

                    <span className="inline-flex items-center gap-2 self-start rounded-full bg-green-50 px-3 py-2 text-sm font-semibold text-green-700">
                      <Icon.CheckCircle size={18} weight="fill" />
                      Cuenta activa
                    </span>
                  </div>

                  <form
                    className="mt-7"
                    onSubmit={handleProfileSubmit}
                    noValidate
                  >
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="name"
                          className="caption1 font-semibold text-text-strong"
                        >
                          Nombre completo *
                        </label>
                        <input
                          id="name"
                          name="name"
                          type="text"
                          value={formData.name}
                          onChange={handleChange}
                          className={fieldClass('name')}
                          maxLength={120}
                          autoComplete="name"
                          aria-invalid={Boolean(errors.name)}
                        />
                        {renderFieldError('name')}
                      </div>

                      <div>
                        <label
                          htmlFor="email"
                          className="caption1 font-semibold text-text-strong"
                        >
                          Correo electrónico *
                        </label>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          className={fieldClass('email')}
                          maxLength={120}
                          autoComplete="email"
                          aria-invalid={Boolean(errors.email)}
                        />
                        {renderFieldError('email')}
                      </div>

                      <div>
                        <label
                          htmlFor="phone"
                          className="caption1 font-semibold text-text-strong"
                        >
                          Teléfono *
                        </label>
                        <input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleChange}
                          className={fieldClass('phone')}
                          maxLength={9}
                          placeholder="8888-8888"
                          autoComplete="tel"
                          aria-invalid={Boolean(errors.phone)}
                        />
                        <p className="caption1 mt-1 text-text-muted">
                          Formato: 8888-8888
                        </p>
                        {renderFieldError('phone')}
                      </div>

                      <div>
                        <label
                          htmlFor="city"
                          className="caption1 font-semibold text-text-strong"
                        >
                          Ciudad *
                        </label>
                        <input
                          id="city"
                          name="city"
                          type="text"
                          value={formData.city}
                          onChange={handleChange}
                          className={fieldClass('city')}
                          maxLength={100}
                          autoComplete="address-level2"
                          aria-invalid={Boolean(errors.city)}
                        />
                        {renderFieldError('city')}
                      </div>

                      <div>
                        <label
                          htmlFor="company_name"
                          className="caption1 font-semibold text-text-strong"
                        >
                          Empresa
                        </label>
                        <input
                          id="company_name"
                          name="company_name"
                          type="text"
                          value={formData.company_name}
                          onChange={handleChange}
                          className={fieldClass('company_name')}
                          maxLength={120}
                          autoComplete="organization"
                          aria-invalid={Boolean(errors.company_name)}
                        />
                        <p className="caption1 mt-1 text-text-muted">Opcional</p>
                        {renderFieldError('company_name')}
                      </div>

                      <div>
                        <label
                          htmlFor="tax_id"
                          className="caption1 font-semibold text-text-strong"
                        >
                          Identificación fiscal
                        </label>
                        <input
                          id="tax_id"
                          name="tax_id"
                          type="text"
                          value={formData.tax_id}
                          onChange={handleChange}
                          className={fieldClass('tax_id')}
                          maxLength={60}
                          aria-invalid={Boolean(errors.tax_id)}
                        />
                        <p className="caption1 mt-1 text-text-muted">Opcional</p>
                        {renderFieldError('tax_id')}
                      </div>

                      <div className="sm:col-span-2">
                        <label
                          htmlFor="address"
                          className="caption1 font-semibold text-text-strong"
                        >
                          Dirección
                        </label>
                        <textarea
                          id="address"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          className={fieldClass('address')}
                          rows={3}
                          maxLength={255}
                          autoComplete="street-address"
                          aria-invalid={Boolean(errors.address)}
                        />
                        <p className="caption1 mt-1 text-text-muted">Opcional</p>
                        {renderFieldError('address')}
                      </div>
                    </div>

                    <div className="mt-7 flex flex-wrap items-center gap-4">
                      <button
                        type="submit"
                        className="button-main inline-flex items-center gap-2"
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <>
                            <Icon.SpinnerGap size={18} className="animate-spin" />
                            Guardando...
                          </>
                        ) : (
                          <>
                            <Icon.FloppyDisk size={18} />
                            Guardar cambios
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        className="font-semibold text-text-secondary hover:text-text-strong"
                        onClick={() => {
                          setFormData({
                            name: user.name || '',
                            email: user.email || '',
                            phone: formatNicaraguaPhone(profile?.phone || ''),
                            company_name: profile?.company_name || '',
                            tax_id: profile?.tax_id || '',
                            city: profile?.city || '',
                            address: profile?.address || '',
                          })
                          setErrors({})
                        }}
                        disabled={isSaving}
                      >
                        Descartar cambios
                      </button>
                    </div>
                  </form>
                </div>
              ) : null}
            </section>
          </div>
        </div>
      </main>

      <BtlCatalogFooter />

      <AuthFeedbackModal
        {...feedback}
        onClose={() =>
          setFeedback((current) => ({
            ...current,
            open: false,
          }))
        }
      />

      {showLogoutConfirmation ? (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/50 px-4">
          <button
            type="button"
            className="absolute inset-0 cursor-default"
            aria-label="Cancelar cierre de sesión"
            onClick={() => {
              if (!isLoggingOut) setShowLogoutConfirmation(false)
            }}
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-title"
            className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange-100 text-primary-dark">
                <Icon.SignOut size={23} />
              </span>

              <div>
                <h2 id="logout-title" className="heading6 text-text-strong">
                  Cerrar sesión
                </h2>
                <p className="mt-2 leading-6 text-text-secondary">
                  ¿Confirmas que deseas cerrar tu sesión en BTL Marketing?
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                className="rounded-full border border-line px-6 py-3 font-semibold text-text-secondary duration-300 hover:border-black hover:text-black"
                onClick={() => setShowLogoutConfirmation(false)}
                disabled={isLoggingOut}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="button-main inline-flex items-center justify-center gap-2"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? (
                  <>
                    <Icon.SpinnerGap size={18} className="animate-spin" />
                    Cerrando...
                  </>
                ) : (
                  'Cerrar sesión'
                )}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}

export default MiCuentaClient
