'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import * as Icon from '@phosphor-icons/react/dist/ssr'
import HandlePagination from '@/components/Other/HandlePagination'
import { ApiError } from '@/lib/apiClient'
import { customerQuotesApi } from '@/lib/customerQuotesApi'
import type {
  CustomerQuoteDetail,
  CustomerQuotePagination,
  CustomerQuoteSummary,
} from '@/types/CustomerQuoteTypes'

type Props = {
  isActive: boolean
  refreshKey?: number
}

const initialPagination: CustomerQuotePagination = {
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0,
}

const formatDate = (value: string | null) => {
  if (!value) return 'Sin fecha'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return 'Sin fecha'

  return new Intl.DateTimeFormat('es-NI', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

const statusClass = (status: string) => {
  const normalized = status.toLowerCase()

  if (['closed', 'won'].includes(normalized)) {
    return 'bg-green-50 text-green-700'
  }

  if (['cancelled', 'lost'].includes(normalized)) {
    return 'bg-red-50 text-red-700'
  }

  if (['proposal_sent'].includes(normalized)) {
    return 'bg-blue-50 text-blue-700'
  }

  if (['reviewing', 'in_review', 'preparing', 'in_preparation'].includes(normalized)) {
    return 'bg-orange-50 text-orange-700'
  }

  return 'bg-primary-soft text-primary-dark'
}

const CustomerRequestsPanel = ({ isActive, refreshKey = 0 }: Props) => {
  const [quotes, setQuotes] = useState<CustomerQuoteSummary[]>([])
  const [pagination, setPagination] =
    useState<CustomerQuotePagination>(initialPagination)
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [selectedQuote, setSelectedQuote] =
    useState<CustomerQuoteDetail | null>(null)
  const [isDetailLoading, setIsDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState('')

  useEffect(() => {
    if (!isActive) return

    let cancelled = false

    const loadQuotes = async () => {
      setIsLoading(true)
      setLoadError('')

      try {
        const response = await customerQuotesApi.list(page, 10)

        if (cancelled) return

        setQuotes(Array.isArray(response.data) ? response.data : [])
        setPagination(response.meta || initialPagination)
      } catch (error) {
        if (cancelled) return

        const apiError = error instanceof ApiError ? error : null
        setQuotes([])
        setPagination(initialPagination)
        setLoadError(
          apiError?.message ||
            'No fue posible cargar tus solicitudes en este momento.',
        )
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void loadQuotes()

    return () => {
      cancelled = true
    }
  }, [isActive, page, refreshKey])

  const openDetail = async (quoteNumber: string) => {
    setIsDetailLoading(true)
    setDetailError('')
    setSelectedQuote(null)

    try {
      const detail = await customerQuotesApi.detail(quoteNumber)
      setSelectedQuote(detail)
    } catch (error) {
      const apiError = error instanceof ApiError ? error : null
      setDetailError(
        apiError?.message ||
          'No fue posible consultar el detalle de esta solicitud.',
      )
    } finally {
      setIsDetailLoading(false)
    }
  }

  const closeDetail = () => {
    if (isDetailLoading) return
    setSelectedQuote(null)
    setDetailError('')
  }

  return (
    <>
      <div className="rounded-3xl border border-line bg-white p-7 shadow-sm md:p-9">
        <div className="flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="caption1 uppercase tracking-wider text-primary-dark">
              Seguimiento
            </p>
            <h2 className="heading3 mt-2 text-text-strong">
              Mis solicitudes
            </h2>
            <p className="mt-3 max-w-2xl leading-7 text-text-secondary">
              Consulta las solicitudes vinculadas a tu cuenta y revisa su
              estado actual.
            </p>
          </div>

          <span className="inline-flex self-start rounded-full bg-surface px-4 py-2 text-sm font-semibold text-text-secondary">
            {pagination.total} solicitud
            {pagination.total === 1 ? '' : 'es'}
          </span>
        </div>

        {isLoading ? (
          <div className="flex min-h-[260px] flex-col items-center justify-center text-center">
            <Icon.SpinnerGap
              size={34}
              className="animate-spin text-primary-dark"
            />
            <p className="mt-4 text-text-secondary">
              Cargando tus solicitudes...
            </p>
          </div>
        ) : loadError ? (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-7 text-center">
            <Icon.WarningCircle size={36} className="mx-auto text-red-600" />
            <h3 className="heading6 mt-4 text-text-strong">
              No pudimos cargar tus solicitudes
            </h3>
            <p className="mt-2 text-red-700">{loadError}</p>
            <button
              type="button"
              className="button-main mt-5"
              onClick={() => setPage((current) => current)}
            >
              Intentar nuevamente
            </button>
          </div>
        ) : quotes.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-line bg-surface p-8 text-center">
            <Icon.ClipboardText size={42} className="mx-auto text-text-muted" />
            <h3 className="heading6 mt-4 text-text-strong">
              Todavía no tienes solicitudes
            </h3>
            <p className="mx-auto mt-2 max-w-lg text-text-secondary">
              Las solicitudes enviadas mientras tengas tu sesión activa
              aparecerán en esta sección.
            </p>
            <Link href="/productos" className="button-main mt-6 inline-flex">
              Explorar catálogo
            </Link>
          </div>
        ) : (
          <div className="mt-7 space-y-4">
            {quotes.map((quote) => (
              <article
                key={quote.id}
                className="rounded-2xl border border-line bg-white p-5 duration-300 hover:border-primary/40 hover:shadow-sm"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="heading6 text-text-strong">
                        {quote.quote_number}
                      </h3>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass(quote.status)}`}
                      >
                        {quote.status_label}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-3 text-sm text-text-secondary sm:grid-cols-3">
                      <div className="flex items-center gap-2">
                        <Icon.CalendarBlank size={18} />
                        <span>{formatDate(quote.created_at)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Icon.Package size={18} />
                        <span>
                          {quote.items_count} producto
                          {quote.items_count === 1 ? '' : 's'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Icon.ArrowsClockwise size={18} />
                        <span>Actualizada {formatDate(quote.updated_at)}</span>
                      </div>
                    </div>

                    {quote.proposal ? (
                      <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700">
                        <Icon.FileText size={17} />
                        Propuesta {quote.proposal.proposal_number}
                      </div>
                    ) : null}
                  </div>

                  <button
                    type="button"
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-line px-5 py-3 font-semibold text-text-strong duration-300 hover:border-primary hover:text-primary-dark"
                    onClick={() => void openDetail(quote.quote_number)}
                  >
                    Ver detalle
                    <Icon.ArrowRight size={17} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        {!isLoading && !loadError && pagination.last_page > 1 ? (
          <div className="mt-8 flex justify-center">
            <HandlePagination
              pageCount={pagination.last_page}
              forcePage={page - 1}
              onPageChange={(selected) => {
                setPage(selected + 1)
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
            />
          </div>
        ) : null}
      </div>

      {isDetailLoading || selectedQuote || detailError ? (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/50 px-4 py-6">
          <button
            type="button"
            className="absolute inset-0 cursor-default"
            aria-label="Cerrar detalle"
            onClick={closeDetail}
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="quote-detail-title"
            className="relative z-10 max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl md:p-8"
          >
            <div className="flex items-start justify-between gap-4 border-b border-line pb-5">
              <div>
                <p className="caption1 uppercase tracking-wider text-primary-dark">
                  Detalle de solicitud
                </p>
                <h2 id="quote-detail-title" className="heading4 mt-2 text-text-strong">
                  {selectedQuote?.quote_number || 'Cargando solicitud'}
                </h2>
              </div>

              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-text-secondary"
                onClick={closeDetail}
                disabled={isDetailLoading}
                aria-label="Cerrar"
              >
                <Icon.X size={20} />
              </button>
            </div>

            {isDetailLoading ? (
              <div className="flex min-h-[280px] flex-col items-center justify-center">
                <Icon.SpinnerGap
                  size={34}
                  className="animate-spin text-primary-dark"
                />
                <p className="mt-4 text-text-secondary">
                  Consultando el detalle...
                </p>
              </div>
            ) : detailError ? (
              <div className="py-10 text-center">
                <Icon.WarningCircle
                  size={40}
                  className="mx-auto text-red-600"
                />
                <p className="mt-4 text-red-700">{detailError}</p>
              </div>
            ) : selectedQuote ? (
              <div className="mt-6 space-y-7">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl bg-surface p-4">
                    <p className="text-sm text-text-secondary">Estado</p>
                    <p className="mt-1 font-semibold text-text-strong">
                      {selectedQuote.status_label}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-surface p-4">
                    <p className="text-sm text-text-secondary">Fecha</p>
                    <p className="mt-1 font-semibold text-text-strong">
                      {formatDate(selectedQuote.created_at)}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-surface p-4">
                    <p className="text-sm text-text-secondary">Productos</p>
                    <p className="mt-1 font-semibold text-text-strong">
                      {selectedQuote.items.length}
                    </p>
                  </div>
                </div>

                <section>
                  <h3 className="heading6 text-text-strong">
                    Productos solicitados
                  </h3>

                  <div className="mt-4 space-y-3">
                    {selectedQuote.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex gap-4 rounded-2xl border border-line p-4"
                      >
                        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-surface">
                          {item.image ? (
                            <Image
                              src={item.image}
                              width={160}
                              height={160}
                              alt={item.product_name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <Icon.Package
                                size={28}
                                className="text-text-muted"
                              />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold text-text-strong">
                            {item.product_name}
                          </h4>
                          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-text-secondary">
                            <span>Cantidad: {item.quantity}</span>
                            {item.sku ? <span>Código: {item.sku}</span> : null}
                            {item.color ? <span>Color: {item.color}</span> : null}
                            {item.size ? <span>Talla: {item.size}</span> : null}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {selectedQuote.observations ? (
                  <section className="rounded-2xl border border-line bg-surface p-5">
                    <h3 className="font-semibold text-text-strong">
                      Observaciones
                    </h3>
                    <p className="mt-2 whitespace-pre-line text-text-secondary">
                      {selectedQuote.observations}
                    </p>
                  </section>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  )
}

export default CustomerRequestsPanel
