'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import AuthFeedbackModal from '@/components/Auth/AuthFeedbackModal'
import * as Icon from '@phosphor-icons/react/dist/ssr'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/hooks/useAuth'
import { buildCartQuotePrefill } from '@/lib/customerQuotePrefill'
import { ApiError, apiRequest, initializeCsrf } from '@/lib/apiClient'
import {
  buildCartQuotePayload,
  type CartQuoteSubmissionResponse,
} from '@/lib/cartQuote'
import { getCartItemImage } from '@/lib/productImages'
import CartProductImage from '@/components/Cart/CartProductImage'
import BtlHeroHeader from '@/components/BTL/BtlHeroHeader'
import BtlCatalogFooter from '@/components/BTL/BtlCatalogFooter'
import UnifiedQuoteForm from '@/components/Quote/UnifiedQuoteForm'
import useProductFlowStore from '@/store/useProductFlowStore'
import type { ProductType } from '@/type/ProductType'
import {
  addFieldError,
  formatCedulaNI,
  formatNicaraguaPhone,
  hasFormErrors,
  validateCedulaNI,
  validateEmail,
  validateNicaraguaPhone,
  validateNewPassword,
  validatePasswordConfirmation,
  validateRequired,
  type FormErrors,
} from '@/lib/formValidation'

type CheckoutCartItem = {
  selectedSize?: string | null
  selectedColor?: string | null
  sizes?: Array<string | null | undefined> | null
  variation?: Array<{
    color?: string | null
  }> | null
}

type FeedbackModalState = {
  open: boolean
  title: string
  message: string
  errors: string[]
  tone: 'error' | 'success'
}

const INITIAL_FEEDBACK_MODAL: FeedbackModalState = {
  open: false,
  title: '',
  message: '',
  errors: [],
  tone: 'error',
}

const API_FIELD_TO_CHECKOUT_FIELD: Record<string, string> = {
  client_name: 'fullName',
  company: 'taxId',
  email: 'email',
  phone: 'phone',
  city: 'billingCity',
  address: 'billingAddress',
  observations: 'customerNote',
  password: 'password',
  password_confirmation: 'confirmPassword',
  terms_accepted: 'privacyAccepted',
  create_account: 'createAccount',
}

type FinalizarCompraClientProps = {
  directProduct?: ProductType | null
}

const FinalizarCompraClient = ({
  directProduct = null,
}: FinalizarCompraClientProps = {}) => {
  const router = useRouter()
  const {
    user,
    profile,
    isAuthenticated,
    isLoading: isAuthLoading,
    refreshSession,
  } = useAuth()

  const {
    items: directSelectionItems,
  } = useProductFlowStore()

  const {
    cartState,
    setCustomerNote,
    setCheckoutField,
    setCheckoutFields,
    setBillingAddress,
    resetCheckoutMeta,
    clearCart,
    isCartHydrated,
  } = useCart()

  const [errors, setErrors] = useState<FormErrors>({})
  const [formNotice, setFormNotice] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedbackModal, setFeedbackModal] =
    useState<FeedbackModalState>(INITIAL_FEEDBACK_MODAL)
  const [submittedQuoteNumber, setSubmittedQuoteNumber] =
    useState<string | null>(null)
  const [submissionCompleted, setSubmissionCompleted] = useState(false)
  const [accountCreatedWithQuote, setAccountCreatedWithQuote] =
    useState(false)

  const prefilledCustomerIdRef = useRef<number | null>(null)
  const previousAuthenticatedCustomerIdRef = useRef<number | null>(null)
  const submitInFlightRef = useRef(false)

  const {
    fullName,
    taxId,
    email,
    phone,
    billingCity,
    billingAddress,
    customerNote,
    privacyAccepted,
    createAccount,
    password,
    confirmPassword,
  } = cartState.checkoutMeta

  const isDirectQuote = Boolean(directProduct)

  const directQuoteProducts = useMemo<ProductType[]>(() => {
    if (!directProduct || !Array.isArray(directSelectionItems)) return []

    return directSelectionItems
      .filter((item) => Number(item?.quantity || 0) > 0)
      .map((item, index) => {
        const sku = String(item?.sku || "").trim()
        const color = String(item?.color || "").trim()
        const size = String(item?.size || "S/T").trim() || "S/T"

        const matchedVariation = (directProduct.variation || []).find(
          (variation) =>
            (sku && String(variation?.sku || "").trim() === sku) ||
            (
              color &&
              String(variation?.color || "").trim() === color &&
              String(variation?.size || "S/T").trim() === size
            ),
        )

        const normalizedVariation = {
          ...(matchedVariation || {}),
          sku: sku || String(matchedVariation?.sku || ""),
          color: color || String(matchedVariation?.color || ""),
          size: size || String(matchedVariation?.size || "S/T"),
          stockFisico:
            Number(item?.stockFisico ?? matchedVariation?.stockFisico) || 0,
          stockTransito:
            Number(item?.stockTransito ?? matchedVariation?.stockTransito) || 0,
          fechaLlegada:
            String(item?.fechaLlegada || matchedVariation?.fechaLlegada || ""),
          colorImage:
            String(
              item?.colorImage ||
                item?.image ||
                matchedVariation?.colorImage ||
                matchedVariation?.image ||
                "",
            ),
          image:
            String(
              item?.image ||
                item?.colorImage ||
                matchedVariation?.image ||
                matchedVariation?.colorImage ||
                "",
            ),
          providerCode:
            String(
              item?.providerCode ||
                matchedVariation?.providerCode ||
                "",
            ),
          providerName:
            String(
              item?.providerName ||
                matchedVariation?.providerName ||
                "",
            ),
          variantId:
            item?.productVariantId ??
            matchedVariation?.variantId ??
            null,
          immediateVariantId:
            item?.source === "immediate"
              ? (
                  item?.productVariantId ??
                  matchedVariation?.immediateVariantId ??
                  matchedVariation?.variantId ??
                  null
                )
              : matchedVariation?.immediateVariantId ?? null,
          stockControlled:
            typeof item?.stockControlled === "boolean"
              ? item.stockControlled
              : matchedVariation?.stockControlled ?? null,
          stockStatus:
            String(item?.stockStatus || matchedVariation?.stockStatus || "") || null,
        }

        return {
          ...directProduct,
          id: sku || `${directProduct.id}-direct-${index}`,
          quantity: Math.max(1, Number(item?.quantity) || 1),
          quantityPurchase: Math.max(1, Number(item?.quantity) || 1),
          selectedSize: normalizedVariation.size,
          selectedColor: normalizedVariation.color,
          variation: [normalizedVariation],
          cartImage:
            normalizedVariation.colorImage ||
            normalizedVariation.image ||
            directProduct.images?.[0] ||
            "",
          providerType:
            item?.source === "immediate"
              ? "immediate"
              : String(item?.providerCode || ""),
          isImmediateVariant: Boolean(
            item?.isImmediateVariant || item?.source === "immediate",
          ),
        } as ProductType
      })
  }, [directProduct, directSelectionItems])

  const quoteProducts = isDirectQuote
    ? directQuoteProducts
    : cartState.cartArray

  const hasCartItems = quoteProducts.length > 0

  useEffect(() => {
    if (isAuthLoading) return

    const currentCustomerId =
      isAuthenticated && user ? Number(user.id) : null
    const previousCustomerId = previousAuthenticatedCustomerIdRef.current

    if (previousCustomerId !== null && currentCustomerId === null) {
      resetCheckoutMeta()
      setErrors({})
      setFormNotice('')
      prefilledCustomerIdRef.current = null
    }

    if (
      previousCustomerId !== null &&
      currentCustomerId !== null &&
      previousCustomerId !== currentCustomerId
    ) {
      resetCheckoutMeta()
      setErrors({})
      setFormNotice('')
      prefilledCustomerIdRef.current = null
    }

    previousAuthenticatedCustomerIdRef.current = currentCustomerId
  }, [
    isAuthLoading,
    isAuthenticated,
    resetCheckoutMeta,
    user,
  ])

  useEffect(() => {
    if (isAuthLoading || !isAuthenticated || !user) return

    const customerId = Number(user.id)

    if (prefilledCustomerIdRef.current === customerId) return

    const prefill = buildCartQuotePrefill({ user, profile })

    setCheckoutFields({
      fullName: prefill.nombre,
      taxId: formatCedulaNI(prefill.cedula),
      email: prefill.correo,
      phone: formatNicaraguaPhone(prefill.telefono),
      billingCity: prefill.ciudad,
      billingAddress: prefill.direccion,
      customerNote: '',
      privacyAccepted: false,
      createAccount: false,
      password: '',
      confirmPassword: '',
    })

    setErrors({})
    setFormNotice('')
    prefilledCustomerIdRef.current = customerId
  }, [
    isAuthLoading,
    isAuthenticated,
    profile,
    setCheckoutFields,
    user,
  ])

  useEffect(() => {
    if ((!isDirectQuote && !isCartHydrated) || submissionCompleted) return

    if (!hasCartItems) {
      const fallbackSlug = String(directProduct?.slug || directProduct?.id || "")
      router.replace(
        isDirectQuote && fallbackSlug
          ? `/producto/${encodeURIComponent(fallbackSlug)}`
          : '/carrito',
      )
    }
  }, [
    directProduct,
    hasCartItems,
    isCartHydrated,
    isDirectQuote,
    router,
    submissionCompleted,
  ])

  const clearFieldError = (field: string) => {
    setFormNotice('')

    setErrors((current) => {
      if (!current[field]) return current

      const next = { ...current }
      delete next[field]
      return next
    })
  }

  const getFieldClass = (field: string) =>
    `w-full rounded-xl border bg-white px-4 py-3 text-[#1F2E53] outline-none transition focus:border-[#38A0A2] focus:ring-2 focus:ring-[#38A0A2]/10 ${
      errors[field] ? 'border-red-500' : 'border-[#DCE6EA]'
    }`

  const renderError = (field: string) => {
    if (!errors[field]) return null

    return (
      <p className="caption1 mt-1 text-red-600">
        {errors[field]}
      </p>
    )
  }

  const openErrorModal = (
    message: string,
    errorMessages: string[] = [],
  ) => {
    setFeedbackModal({
      open: true,
      title: 'No se pudo enviar la solicitud',
      message,
      errors: Array.from(new Set(errorMessages.filter(Boolean))),
      tone: 'error',
    })
  }

  const mapApiErrorsToForm = (error: ApiError) => {
    const mappedErrors: FormErrors = {}

    Object.entries(error.errors).forEach(([apiField, messages]) => {
      const rootField = apiField.split('.')[0]
      const checkoutField = API_FIELD_TO_CHECKOUT_FIELD[rootField]
      const firstMessage = messages.find(Boolean)

      if (checkoutField && firstMessage && !mappedErrors[checkoutField]) {
        mappedErrors[checkoutField] = firstMessage
      }
    })

    return mappedErrors
  }

  const getApiErrorMessages = (error: ApiError) => {
    return Object.values(error.errors)
      .flat()
      .filter((message): message is string => Boolean(message))
  }

  const handleFeedbackClose = () => {
    setFeedbackModal(INITIAL_FEEDBACK_MODAL)

    if (!submittedQuoteNumber) return

    router.replace(
      isAuthenticated || accountCreatedWithQuote
        ? '/mi-cuenta'
        : '/productos',
    )
  }

  const getSelectedSize = (product: CheckoutCartItem) =>
    String(product.selectedSize || product.sizes?.[0] || '').trim()

  const getSelectedColor = (product: CheckoutCartItem) =>
    String(
      product.selectedColor ||
        product.variation?.[0]?.color ||
        '',
    ).trim()

  const validateCheckoutForm = () => {
    const nextErrors: FormErrors = {}

    addFieldError(
      nextErrors,
      'fullName',
      validateRequired(fullName, 'Nombre completo'),
    )

    addFieldError(
      nextErrors,
      'taxId',
      validateCedulaNI(taxId, 'Cédula'),
    )

    addFieldError(
      nextErrors,
      'phone',
      validateNicaraguaPhone(phone, 'Teléfono'),
    )

    addFieldError(
      nextErrors,
      'email',
      validateEmail(email, 'Correo electrónico'),
    )

    addFieldError(
      nextErrors,
      'billingCity',
      validateRequired(billingCity, 'Ciudad'),
    )

    addFieldError(
      nextErrors,
      'billingAddress',
      validateRequired(billingAddress, 'Dirección'),
    )

    if (!privacyAccepted) {
      nextErrors.privacyAccepted =
        'Debes aceptar la política de privacidad.'
    }

    if (!isAuthenticated && createAccount) {
      addFieldError(
        nextErrors,
        'password',
        validateNewPassword(password, 'Contraseña'),
      )

      addFieldError(
        nextErrors,
        'confirmPassword',
        validatePasswordConfirmation(
          password,
          confirmPassword,
        ),
      )
    }

    setErrors(nextErrors)

    if (hasFormErrors(nextErrors)) {
      openErrorModal(
        'Revisa los campos marcados antes de enviar tu solicitud.',
        Object.values(nextErrors),
      )
      return false
    }

    return true
  }

  const handleSubmitCheckout = async () => {
    if (submitInFlightRef.current || isSubmitting) return

    setFormNotice('')
    setSubmittedQuoteNumber(null)
    setAccountCreatedWithQuote(false)

    if (!hasCartItems) {
      const message =
        'No hay productos en el carrito para enviar la solicitud.'
      setFormNotice(message)
      openErrorModal(message)
      return
    }

    if (quoteProducts.length > 50) {
      const message =
        'No se pueden enviar más de 50 líneas de producto en una sola solicitud.'
      setFormNotice(message)
      openErrorModal(message)
      return
    }

    if (!validateCheckoutForm()) {
      setFormNotice(
        'Revisa los campos marcados antes de enviar tu solicitud.',
      )
      return
    }

    const payload = buildCartQuotePayload({
      products: quoteProducts,
      customer: {
        fullName,
        taxId,
        email,
        phone,
        city: billingCity,
        address: billingAddress,
        observations: customerNote,
      },
      account: {
        create: !isAuthenticated && createAccount,
        password,
        passwordConfirmation: confirmPassword,
        termsAccepted: privacyAccepted,
      },
    })

    if (payload.items.length === 0) {
      const message = 'No hay líneas válidas para crear la cotización.'
      setFormNotice(message)
      openErrorModal(message)
      return
    }

    submitInFlightRef.current = true
    setIsSubmitting(true)

    try {
      await initializeCsrf()

      const result = await apiRequest<CartQuoteSubmissionResponse>(
        '/quotes',
        {
          method: 'POST',
          body: JSON.stringify(payload),
        },
      )

      const quoteNumber =
        result.data?.quote_number?.trim() || 'Solicitud registrada'
      const productsCount = payload.items.length
      const productsLabel =
        productsCount === 1 ? 'producto' : 'productos'
      const accountWasCreated = Boolean(result.account_created)
      const welcomeMailQueued = Boolean(result.mail_queued?.welcome)
      const quoteMailQueued = Boolean(result.mail_queued?.quote)

      if (accountWasCreated) {
        await refreshSession()
      }

      setSubmissionCompleted(true)
      setAccountCreatedWithQuote(accountWasCreated)
      setSubmittedQuoteNumber(quoteNumber)
      setErrors({})
      setFormNotice('')
      if (!isDirectQuote) {
        clearCart()
      }

      setFeedbackModal({
        open: true,
        title: accountWasCreated
          ? 'Cuenta y solicitud creadas correctamente'
          : 'Solicitud enviada correctamente',
        message: accountWasCreated
          ? `${quoteNumber} quedó registrada con ${productsCount} ${productsLabel}. También creamos tu cuenta con el correo ${email.trim()} y la solicitud ya está disponible en Mi cuenta.${welcomeMailQueued || quoteMailQueued ? ' Programamos los correos de confirmación correspondientes.' : ''}`
          : `${quoteNumber} quedó registrada con ${productsCount} ${productsLabel} y asociada al correo ${email.trim()}. Uno de nuestros asesores revisará disponibilidad, personalización y tiempos de entrega.${quoteMailQueued ? ' También programamos un correo de confirmación.' : ''}`,
        errors: [],
        tone: 'success',
      })
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        const mappedErrors = mapApiErrorsToForm(error)
        const apiMessages = getApiErrorMessages(error)
        const retryMessage =
          error.status === 429 && error.retryAfter
            ? `Podrás volver a intentarlo en ${error.retryAfter} segundos.`
            : ''
        const message = [error.message, retryMessage]
          .filter(Boolean)
          .join(' ')

        if (hasFormErrors(mappedErrors)) {
          setErrors((current) => ({
            ...current,
            ...mappedErrors,
          }))
        }

        setFormNotice(message)
        openErrorModal(message, apiMessages)
      } else {
        const message =
          error instanceof Error
            ? error.message
            : 'Ocurrió un error inesperado al enviar la solicitud.'

        setFormNotice(message)
        openErrorModal(message)
      }
    } finally {
      submitInFlightRef.current = false
      setIsSubmitting(false)
    }
  }

  if (!isDirectQuote && !isCartHydrated) {
    return (
      <>
        <header className="bg-[#071A33] pb-6 text-white">
          <BtlHeroHeader />
        </header>

        <div className="py-10 md:py-20">
          <div className="container">
            <div className="rounded-2xl bg-surface p-8 text-center">
              <Icon.CircleNotch
                size={30}
                className="mx-auto animate-spin text-primary-dark"
              />
              <div className="heading5 mt-4">
                Cargando tu carrito
              </div>
              <p className="mt-3 text-text-secondary">
                Estamos recuperando los productos seleccionados.
              </p>
            </div>
          </div>
        </div>

        <BtlCatalogFooter />
      </>
    )
  }

  if (!hasCartItems && !submissionCompleted) {
    return (
      <>
        <header className="bg-[#071A33] pb-6 text-white">
          <BtlHeroHeader />
        </header>

        <div className="py-10 md:py-20">
          <div className="container">
            <div className="rounded-2xl bg-surface p-8 text-center">
              <div className="heading5">Tu carrito está vacío</div>
              <p className="mt-3 text-text-secondary">
                Agrega productos antes de solicitar una cotización.
              </p>
              <Link
                href="/productos"
                className="mt-6 inline-flex rounded-xl bg-[#21577B] px-5 py-3 text-sm font-extrabold text-white transition hover:bg-[#1F2E53]"
              >
                Ver catálogo
              </Link>
            </div>
          </div>
        </div>

        <BtlCatalogFooter />
      </>
    )
  }

  return (
    <>
      <header className="bg-[#071A33] pb-6 text-white">
          <BtlHeroHeader />
        </header>

      <main className="cart-block bg-[#F5F9FB] py-10 md:py-14 lg:py-16">
        <div className="container">
          <div className="content-main flex justify-between gap-x-10 gap-y-10 max-lg:flex-col">
            <section className="order-2 w-full rounded-[28px] border border-[#DCE6EA] bg-white p-5 shadow-[0_12px_34px_rgba(31,46,83,.06)] sm:p-6 lg:order-1 lg:w-7/12 lg:p-8">
              {isAuthenticated && user ? (
                <div className="mb-7 flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                  <Icon.CheckCircle
                    size={22}
                    weight="fill"
                    className="mt-0.5 shrink-0"
                  />
                  <div>
                    <p className="font-semibold">
                      Cotización vinculada a tu cuenta
                    </p>
                    <p className="mt-1">
                      Completamos los datos disponibles de {user.name}.
                      Puedes editarlos únicamente para esta solicitud.
                    </p>
                  </div>
                </div>
              ) : null}

              {!isAuthLoading && !isAuthenticated ? (
                <section className="mt-7 rounded-2xl border border-line bg-surface p-5">
                  <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h2 className="text-title text-text-strong">
                          ¿Ya tienes una cuenta?
                        </h2>
                        <p className="mt-1 text-sm leading-6 text-text-secondary">
                          Inicia sesión para completar tus datos automáticamente
                          y vincular esta solicitud a tu cuenta.
                        </p>
                      </div>

                      <Link
                        href="/iniciar-sesion?redirect=/finalizar-compra"
                        className="inline-flex shrink-0 items-center justify-center rounded-full border border-primary px-5 py-3 font-semibold text-primary-dark duration-300 hover:bg-primary hover:text-white"
                      >
                        Iniciar sesión
                      </Link>
                    </div>

                    <div className="h-px bg-line" />

                    <label className="flex cursor-pointer items-start gap-3 font-semibold text-text-strong">
                      <input
                        type="checkbox"
                        checked={createAccount}
                        onChange={(event) => {
                          setCheckoutField(
                            'createAccount',
                            event.target.checked,
                          )

                          if (!event.target.checked) {
                            setCheckoutFields({
                              password: '',
                              confirmPassword: '',
                            })
                            clearFieldError('password')
                            clearFieldError('confirmPassword')
                          }
                        }}
                        disabled={isSubmitting}
                        className="mt-1 h-4 w-4 shrink-0 disabled:cursor-not-allowed disabled:opacity-60"
                      />
                      <span>Crear una cuenta con esta cotización</span>
                    </label>

                    {createAccount ? (
                      <p className="-mt-2 text-sm leading-6 text-text-secondary">
                        La cuenta, el perfil y la cotización se crearán en una
                        sola operación. Al finalizar, iniciarás sesión
                        automáticamente.
                      </p>
                    ) : null}

                    {createAccount ? (
                      <div className="grid gap-5 sm:grid-cols-2">
                        <div>
                          <label className="caption1 mb-2 block font-semibold">
                            Contraseña *
                          </label>
                          <input
                            className={getFieldClass('password')}
                            type="password"
                            autoComplete="new-password"
                            disabled={isSubmitting}
                            value={password}
                            onChange={(event) => {
                              setCheckoutField(
                                'password',
                                event.target.value,
                              )
                              clearFieldError('password')
                            }}
                          />
                          {renderError('password')}
                        </div>

                        <div>
                          <label className="caption1 mb-2 block font-semibold">
                            Confirmar contraseña *
                          </label>
                          <input
                            className={getFieldClass('confirmPassword')}
                            type="password"
                            autoComplete="new-password"
                            disabled={isSubmitting}
                            value={confirmPassword}
                            onChange={(event) => {
                              setCheckoutField(
                                'confirmPassword',
                                event.target.value,
                              )
                              clearFieldError('confirmPassword')
                            }}
                          />
                          {renderError('confirmPassword')}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </section>
              ) : null}

              <div className="mt-8">
                <UnifiedQuoteForm
                  values={{
                    name: fullName,
                    taxId,
                    phone,
                    email,
                    city: billingCity,
                    address: billingAddress,
                    notes: customerNote,
                    privacyAccepted,
                  }}
                  errors={{
                    name: errors.fullName,
                    taxId: errors.taxId,
                    phone: errors.phone,
                    email: errors.email,
                    city: errors.billingCity,
                    address: errors.billingAddress,
                    notes: errors.customerNote,
                    privacyAccepted: errors.privacyAccepted,
                  }}
                  disabled={isSubmitting}
                  isSubmitting={isSubmitting}
                  submitDisabled={!hasCartItems}
                  submitLabel="Enviar solicitud de cotización"
                  submittingLabel="Enviando solicitud..."
                  onSubmit={handleSubmitCheckout}
                  onChange={(field, value) => {
                    if (field === "name") {
                      setCheckoutField("fullName", String(value))
                      clearFieldError("fullName")
                    } else if (field === "taxId") {
                      setCheckoutField("taxId", formatCedulaNI(String(value)))
                      clearFieldError("taxId")
                    } else if (field === "phone") {
                      setCheckoutField("phone", formatNicaraguaPhone(String(value)))
                      clearFieldError("phone")
                    } else if (field === "email") {
                      setCheckoutField("email", String(value))
                      clearFieldError("email")
                    } else if (field === "city") {
                      setBillingAddress({ billingCity: String(value) })
                      clearFieldError("billingCity")
                    } else if (field === "address") {
                      setBillingAddress({ billingAddress: String(value) })
                      clearFieldError("billingAddress")
                    } else if (field === "notes") {
                      setCustomerNote(String(value))
                      clearFieldError("customerNote")
                    } else if (field === "privacyAccepted") {
                      setCheckoutField("privacyAccepted", Boolean(value))
                      clearFieldError("privacyAccepted")
                    }
                  }}
                  notice={
                    formNotice ? (
                      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                        {formNotice}
                      </div>
                    ) : null
                  }
                  secondaryAction={
                    <Link
                      href={
                        isDirectQuote
                          ? `/producto/${encodeURIComponent(
                              String(directProduct?.slug || directProduct?.id || ""),
                            )}`
                          : "/carrito"
                      }
                      className="flex min-h-[50px] w-full items-center justify-center rounded-xl border border-[#DCE6EA] bg-white px-5 text-sm font-extrabold text-[#52637A] transition hover:border-[#38A0A2] hover:text-[#21577B]"
                    >
                      {isDirectQuote ? "Volver al producto" : "Volver al carrito"}
                    </Link>
                  }
                />
              </div>

            </section>

            <aside className="order-1 w-full lg:order-2 lg:w-5/12">
              <div className="checkout-block rounded-[24px] border border-[#DCE6EA] bg-white p-6 shadow-[0_10px_30px_rgba(31,46,83,.05)]">
                <p className="text-xs font-extrabold uppercase tracking-[.14em] text-[#38A0A2]">Resumen</p>
                <h2 className="mt-2 text-xl font-black text-[#1F2E53]">
                  {isDirectQuote ? "Producto a cotizar" : "Tu solicitud"}
                </h2>

                <div className="list-product-checkout">
                  {quoteProducts.map((product) => {
                    const selectedSize = getSelectedSize(product)
                    const selectedColor = getSelectedColor(product)

                    return (
                      <article
                        className="mt-5 flex w-full items-start gap-4 border-b border-line pb-5 sm:items-center sm:justify-between sm:gap-6"
                        key={product.id}
                      >
                        <div className="h-[92px] w-[92px] shrink-0 overflow-hidden rounded-xl bg-white sm:h-[100px] sm:w-[100px]">
                          <CartProductImage
                            src={getCartItemImage(product)}
                            width={500}
                            height={500}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        </div>

                        <div className="flex min-w-0 flex-1 flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-4">
                          <div>
                            <p className="text-title">{product.name}</p>
                            <p className="caption1 mt-2 text-text-secondary">
                              {[selectedSize, selectedColor]
                                .filter(Boolean)
                                .join(' / ') || 'Sin variante'}
                            </p>
                          </div>

                          <p className="whitespace-nowrap text-sm font-extrabold text-[#1F2E53] sm:text-title">
                            Cantidad: {product.quantity}
                          </p>
                        </div>
                      </article>
                    )
                  })}
                </div>

                <div className="border-b border-line py-5">
                  <p className="text-title">Resumen de solicitud</p>
                  <p className="caption1 mt-2 text-text-secondary">
                    Revisaremos disponibilidad, cantidades,
                    personalización y tiempos de entrega antes de
                    confirmar la cotización final.
                  </p>
                </div>

              </div>
            </aside>
          </div>
        </div>
      </main>

      <AuthFeedbackModal
        open={feedbackModal.open}
        title={feedbackModal.title}
        message={feedbackModal.message}
        errors={feedbackModal.errors}
        tone={feedbackModal.tone}
        onClose={handleFeedbackClose}
      />

      <BtlCatalogFooter />
    </>
  )
}

export default FinalizarCompraClient
