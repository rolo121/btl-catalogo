'use client'

import { appAsset } from '@/lib/appPaths'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import * as Icon from '@phosphor-icons/react/dist/ssr'
import AuthFeedbackModal from '@/components/Auth/AuthFeedbackModal'
import CartProductImage from '@/components/Cart/CartProductImage'
import HandlePagination from '@/components/Other/HandlePagination'
import { ApiError } from '@/lib/apiClient'
import { customerProposalsApi } from '@/lib/customerProposalsApi'
import type {
  CustomerProposalDetail,
  CustomerProposalPagination,
  CustomerProposalSummary,
} from '@/types/CustomerProposalTypes'

type Props = {
  isActive: boolean
  refreshKey?: number
}

const initialPagination: CustomerProposalPagination = {
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0,
}

const formatDate = (value: string | null) => {
  if (!value) return 'Sin fecha'

  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? `${value}T12:00:00`
    : value
  const date = new Date(normalized)

  if (Number.isNaN(date.getTime())) return 'Sin fecha'

  return new Intl.DateTimeFormat('es-NI', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

const formatMoney = (
  value: string | number | null | undefined,
  currency = 'NIO',
) => {
  const amount = Number(value || 0)
  const safeAmount = Number.isFinite(amount) ? amount : 0
  const safeCurrency = String(currency || 'NIO').trim().toUpperCase() || 'NIO'

  try {
    return new Intl.NumberFormat('es-NI', {
      style: 'currency',
      currency: safeCurrency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(safeAmount)
  } catch {
    return `${safeCurrency} ${safeAmount.toLocaleString('es-NI', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  }
}

const statusClass = (status: string) => {
  const normalized = status.toLowerCase()

  if (normalized === 'accepted') {
    return 'bg-green-50 text-green-700'
  }

  if (normalized === 'rejected') {
    return 'bg-red-50 text-red-700'
  }

  if (normalized === 'expired') {
    return 'bg-gray-100 text-gray-700'
  }

  return 'bg-blue-50 text-blue-700'
}

const CustomerProposalsPanel = ({
  isActive,
  refreshKey = 0,
}: Props) => {
  const [proposals, setProposals] = useState<CustomerProposalSummary[]>([])
  const [pagination, setPagination] =
    useState<CustomerProposalPagination>(initialPagination)
  const [page, setPage] = useState(1)
  const [reloadKey, setReloadKey] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [selectedProposal, setSelectedProposal] =
    useState<CustomerProposalDetail | null>(null)
  const [isDetailLoading, setIsDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState('')
  const [downloadingProposal, setDownloadingProposal] = useState('')
  const [feedback, setFeedback] = useState({
    open: false,
    title: '',
    message: '',
    errors: [] as string[],
    tone: 'error' as 'error' | 'success',
  })

  useEffect(() => {
    if (!isActive) return

    let cancelled = false

    const loadProposals = async () => {
      setIsLoading(true)
      setLoadError('')

      try {
        const response = await customerProposalsApi.list(page, 10)

        if (cancelled) return

        const rows = Array.isArray(response.data) ? response.data : []
        const nextPagination = response.meta || initialPagination

        if (rows.length === 0 && page > 1 && nextPagination.last_page < page) {
          setPage(Math.max(1, nextPagination.last_page))
          return
        }

        setProposals(rows)
        setPagination(nextPagination)
      } catch (error) {
        if (cancelled) return

        const apiError = error instanceof ApiError ? error : null

        setProposals([])
        setPagination(initialPagination)
        setLoadError(
          apiError?.message ||
            'No fue posible cargar tus propuestas en este momento.',
        )
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void loadProposals()

    return () => {
      cancelled = true
    }
  }, [isActive, page, refreshKey, reloadKey])

  const openDetail = async (proposalNumber: string) => {
    setIsDetailLoading(true)
    setDetailError('')
    setSelectedProposal(null)

    try {
      const detail = await customerProposalsApi.detail(proposalNumber)
      setSelectedProposal(detail)
    } catch (error) {
      const apiError = error instanceof ApiError ? error : null

      setDetailError(
        apiError?.message ||
          'No fue posible consultar el detalle de esta propuesta.',
      )
    } finally {
      setIsDetailLoading(false)
    }
  }

  const closeDetail = () => {
    if (isDetailLoading) return

    setSelectedProposal(null)
    setDetailError('')
  }

  const downloadProposal = async (proposalNumber: string) => {
    if (downloadingProposal) return

    setDownloadingProposal(proposalNumber)

    try {
      const blob = await customerProposalsApi.download(proposalNumber)
      const objectUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')

      link.href = objectUrl
      link.download = `${proposalNumber}.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()

      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000)
    } catch (error) {
      const apiError = error instanceof ApiError ? error : null

      setFeedback({
        open: true,
        title: 'No fue posible descargar la propuesta',
        message:
          apiError?.message ||
          'Ocurrió un error inesperado al preparar el documento.',
        errors: [],
        tone: 'error',
      })
    } finally {
      setDownloadingProposal('')
    }
  }

  return (
    <>
      <div className="rounded-3xl border border-line bg-white p-7 shadow-sm md:p-9">
        <div className="flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="caption1 uppercase tracking-wider text-primary-dark">
              Propuestas comerciales
            </p>
            <h2 className="heading3 mt-2 text-text-strong">
              Mis propuestas
            </h2>
            <p className="mt-3 max-w-2xl leading-7 text-text-secondary">
              Revisa las propuestas preparadas por el equipo comercial,
              consulta sus productos, revisa el resumen económico y descarga
              el PDF desde tu cuenta.
            </p>
          </div>

          <span className="inline-flex self-start rounded-full bg-surface px-4 py-2 text-sm font-semibold text-text-secondary">
            {pagination.total} propuesta
            {pagination.total === 1 ? '' : 's'}
          </span>
        </div>

        {isLoading ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center text-center">
            <Icon.SpinnerGap
              size={34}
              className="animate-spin text-primary-dark"
            />
            <p className="mt-4 text-text-secondary">
              Cargando tus propuestas...
            </p>
          </div>
        ) : loadError ? (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-7 text-center">
            <Icon.WarningCircle size={36} className="mx-auto text-red-600" />
            <h3 className="heading6 mt-4 text-text-strong">
              No pudimos cargar tus propuestas
            </h3>
            <p className="mt-2 text-red-700">{loadError}</p>
            <button
              type="button"
              className="button-main mt-5 inline-flex items-center gap-2"
              onClick={() => setReloadKey((current) => current + 1)}
            >
              <Icon.ArrowClockwise size={18} />
              Intentar nuevamente
            </button>
          </div>
        ) : proposals.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-line bg-surface p-8 text-center">
            <Icon.FileText size={42} className="mx-auto text-text-muted" />
            <h3 className="heading6 mt-4 text-text-strong">
              No hay propuestas disponibles
            </h3>
            <p className="mx-auto mt-2 max-w-lg text-text-secondary">
              Las propuestas aparecerán cuando el equipo comercial envíe una
              respuesta a una solicitud vinculada a tu cuenta.
            </p>
            <Link href="/productos" className="button-main mt-6 inline-flex">
              Explorar catálogo
            </Link>
          </div>
        ) : (
          <div className="mt-7 space-y-4">
            {proposals.map((proposal) => (
              <article
                key={proposal.id}
                className="rounded-2xl border border-line bg-white p-5 duration-300 hover:border-primary/40 hover:shadow-sm"
              >
                <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="heading6 break-all text-text-strong">
                        {proposal.proposal_number}
                      </h3>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass(proposal.status)}`}
                      >
                        {proposal.status_label}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-3 text-sm text-text-secondary sm:grid-cols-2 lg:grid-cols-4">
                      <div className="flex items-center gap-2">
                        <Icon.Receipt size={18} />
                        <span>
                          Solicitud {proposal.quote?.quote_number || 'N/D'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Icon.CalendarBlank size={18} />
                        <span>Emitida {formatDate(proposal.issued_at)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Icon.Clock size={18} />
                        <span>Válida hasta {formatDate(proposal.valid_until)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Icon.Package size={18} />
                        <span>
                          {proposal.items_count} producto
                          {proposal.items_count === 1 ? '' : 's'}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <span className="rounded-xl bg-surface px-3 py-2 text-sm font-semibold text-text-strong">
                        Total: {formatMoney(proposal.total, proposal.currency)}
                      </span>
                      <span className="text-sm text-text-secondary">
                        Versión {proposal.version}
                      </span>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-line px-5 py-3 font-semibold text-text-strong duration-300 hover:border-primary hover:text-primary-dark"
                      onClick={() => void openDetail(proposal.proposal_number)}
                    >
                      Ver detalle
                      <Icon.ArrowRight size={17} />
                    </button>

                    <button
                      type="button"
                      className="button-main inline-flex items-center justify-center gap-2"
                      onClick={() =>
                        void downloadProposal(proposal.proposal_number)
                      }
                      disabled={Boolean(downloadingProposal)}
                    >
                      {downloadingProposal === proposal.proposal_number ? (
                        <Icon.SpinnerGap size={18} className="animate-spin" />
                      ) : (
                        <Icon.DownloadSimple size={18} />
                      )}
                      Descargar PDF
                    </button>
                  </div>
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

      {isDetailLoading || selectedProposal || detailError ? (
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
            aria-labelledby="proposal-detail-title"
            className="relative z-10 max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl md:p-8"
          >
            <div className="flex items-start justify-between gap-4 border-b border-line pb-5">
              <div>
                <p className="caption1 uppercase tracking-wider text-primary-dark">
                  Detalle de propuesta
                </p>
                <h2
                  id="proposal-detail-title"
                  className="heading4 mt-2 break-all text-text-strong"
                >
                  {selectedProposal?.proposal_number || 'Cargando propuesta'}
                </h2>
              </div>

              <button
                type="button"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line text-text-secondary"
                onClick={closeDetail}
                disabled={isDetailLoading}
                aria-label="Cerrar"
              >
                <Icon.X size={20} />
              </button>
            </div>

            {isDetailLoading ? (
              <div className="flex min-h-[320px] flex-col items-center justify-center">
                <Icon.SpinnerGap
                  size={34}
                  className="animate-spin text-primary-dark"
                />
                <p className="mt-4 text-text-secondary">
                  Consultando el detalle...
                </p>
              </div>
            ) : detailError ? (
              <div className="py-12 text-center">
                <Icon.WarningCircle
                  size={40}
                  className="mx-auto text-red-600"
                />
                <p className="mt-4 text-red-700">{detailError}</p>
              </div>
            ) : selectedProposal ? (
              <div className="mt-6 space-y-7">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-2xl bg-surface p-4">
                    <p className="text-sm text-text-secondary">Estado</p>
                    <span
                      className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusClass(selectedProposal.status)}`}
                    >
                      {selectedProposal.status_label}
                    </span>
                  </div>
                  <div className="rounded-2xl bg-surface p-4">
                    <p className="text-sm text-text-secondary">Emisión</p>
                    <p className="mt-1 font-semibold text-text-strong">
                      {formatDate(selectedProposal.issued_at)}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-surface p-4">
                    <p className="text-sm text-text-secondary">Vigencia</p>
                    <p className="mt-1 font-semibold text-text-strong">
                      {formatDate(selectedProposal.valid_until)}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-surface p-4">
                    <p className="text-sm text-text-secondary">Total</p>
                    <p className="mt-1 font-semibold text-text-strong">
                      {formatMoney(
                        selectedProposal.total,
                        selectedProposal.currency,
                      )}
                    </p>
                  </div>
                </div>

                <section className="rounded-2xl border border-line p-5">
                  <div className="flex flex-col gap-5 lg:flex-row lg:justify-between">
                    <div>
                      <p className="caption1 uppercase tracking-wider text-primary-dark">
                        Solicitud de origen
                      </p>
                      <h3 className="heading6 mt-2 text-text-strong">
                        {selectedProposal.quote.quote_number}
                      </h3>
                      <p className="mt-2 text-text-secondary">
                        {selectedProposal.quote.client_name || 'Cliente'}
                        {selectedProposal.quote.company
                          ? ` · ${selectedProposal.quote.company}`
                          : ''}
                      </p>
                    </div>

                    <div className="grid gap-2 text-sm text-text-secondary sm:grid-cols-2 lg:min-w-[460px]">
                      {selectedProposal.quote.email ? (
                        <div className="flex items-center gap-2">
                          <Icon.EnvelopeSimple size={17} />
                          <span className="break-all">
                            {selectedProposal.quote.email}
                          </span>
                        </div>
                      ) : null}
                      {selectedProposal.quote.phone ? (
                        <div className="flex items-center gap-2">
                          <Icon.Phone size={17} />
                          <span>{selectedProposal.quote.phone}</span>
                        </div>
                      ) : null}
                      {selectedProposal.quote.city ? (
                        <div className="flex items-center gap-2">
                          <Icon.MapPin size={17} />
                          <span>{selectedProposal.quote.city}</span>
                        </div>
                      ) : null}
                      {selectedProposal.quote.contact_person ? (
                        <div className="flex items-center gap-2">
                          <Icon.User size={17} />
                          <span>
                            {selectedProposal.quote.contact_person}
                          </span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </section>

                <section>
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="heading6 text-text-strong">
                      Productos cotizados
                    </h3>
                    <span className="text-sm text-text-secondary">
                      {selectedProposal.items.length} línea
                      {selectedProposal.items.length === 1 ? '' : 's'}
                    </span>
                  </div>

                  <div className="mt-4 space-y-3">
                    {selectedProposal.items.map((item) => (
                      <article
                        key={item.id}
                        className="rounded-2xl border border-line p-4"
                      >
                        <div className="flex flex-col gap-4 sm:flex-row">
                          <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-surface">
                            <CartProductImage
                              src={
                                item.image ||
                                appAsset('/images/product-placeholder.webp')
                              }
                              width={192}
                              height={192}
                              alt={item.product_name}
                              className="h-full w-full object-cover"
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                              <div>
                                <h4 className="font-semibold text-text-strong">
                                  {item.product_name}
                                </h4>
                                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-text-secondary">
                                  <span>
                                    Cantidad: {item.quantity} {item.unit || ''}
                                  </span>
                                  {item.sku ? (
                                    <span>Código: {item.sku}</span>
                                  ) : null}
                                </div>
                              </div>

                              <div className="text-left lg:text-right">
                                <p className="text-sm text-text-secondary">
                                  Subtotal de línea
                                </p>
                                <p className="mt-1 font-semibold text-text-strong">
                                  {formatMoney(
                                    item.line_subtotal,
                                    selectedProposal.currency,
                                  )}
                                </p>
                              </div>
                            </div>

                            {item.description ? (
                              <p className="mt-3 whitespace-pre-line text-sm leading-6 text-text-secondary">
                                {item.description}
                              </p>
                            ) : null}

                            <div className="mt-3 flex flex-wrap gap-3 text-sm">
                              <span className="rounded-lg bg-surface px-3 py-1.5 text-text-secondary">
                                Unitario:{' '}
                                {formatMoney(
                                  item.unit_price,
                                  selectedProposal.currency,
                                )}
                              </span>
                              {Number(item.discount || 0) > 0 ? (
                                <span className="rounded-lg bg-red-50 px-3 py-1.5 text-red-700">
                                  Descuento:{' '}
                                  {formatMoney(
                                    item.discount,
                                    selectedProposal.currency,
                                  )}
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>

                <div className="grid gap-5 rounded-3xl border border-line bg-surface-warm p-5 md:p-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-stretch">
                  <section className="order-2 flex flex-col justify-between overflow-hidden rounded-2xl bg-brand-dark p-6 text-white lg:order-1">
                    <div>
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
                        <Icon.FilePdf size={25} />
                      </span>

                      <p className="caption1 mt-5 uppercase tracking-[0.16em] text-white/60">
                        Documento de propuesta
                      </p>

                      <h3 className="heading5 mt-2 text-white">
                        Descarga la propuesta completa
                      </h3>

                      <p className="mt-3 max-w-xl text-sm leading-6 text-white/75">
                        Consulta en el PDF los productos, precios y detalles
                        comerciales correspondientes a esta versión.
                      </p>
                    </div>

                    <button
                      type="button"
                      className="button-main mt-6 inline-flex w-full items-center justify-center gap-2 sm:w-fit"
                      onClick={() =>
                        void downloadProposal(
                          selectedProposal.proposal_number,
                        )
                      }
                      disabled={Boolean(downloadingProposal)}
                    >
                      {downloadingProposal ===
                      selectedProposal.proposal_number ? (
                        <Icon.SpinnerGap
                          size={18}
                          className="animate-spin"
                        />
                      ) : (
                        <Icon.DownloadSimple size={18} />
                      )}

                      {downloadingProposal ===
                      selectedProposal.proposal_number
                        ? 'Preparando PDF...'
                        : 'Descargar PDF'}
                    </button>
                  </section>

                  <section className="order-1 rounded-2xl border border-line bg-white p-5 shadow-sm lg:order-2">
                    <div className="flex items-start justify-between gap-4 border-b border-line pb-4">
                      <div>
                        <p className="caption1 uppercase tracking-[0.14em] text-primary-dark">
                          Totales
                        </p>

                        <h3 className="heading6 mt-1 text-text-strong">
                          Resumen económico
                        </h3>
                      </div>

                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary-dark">
                        <Icon.Receipt size={21} />
                      </span>
                    </div>

                    <dl className="mt-5 space-y-3">
                      <div className="flex items-center justify-between gap-4 text-sm">
                        <dt className="text-text-secondary">
                          Subtotal
                        </dt>

                        <dd className="font-semibold text-text-strong">
                          {formatMoney(
                            selectedProposal.subtotal,
                            selectedProposal.currency,
                          )}
                        </dd>
                      </div>

                      <div className="flex items-center justify-between gap-4 text-sm">
                        <dt className="text-text-secondary">
                          Descuento
                        </dt>

                        <dd
                          className={
                            Number(selectedProposal.discount || 0) > 0
                              ? 'font-semibold text-red-700'
                              : 'font-semibold text-text-strong'
                          }
                        >
                          {Number(selectedProposal.discount || 0) > 0
                            ? '- '
                            : ''}
                          {formatMoney(
                            selectedProposal.discount,
                            selectedProposal.currency,
                          )}
                        </dd>
                      </div>

                      <div className="flex items-center justify-between gap-4 text-sm">
                        <dt className="text-text-secondary">
                          Impuestos
                        </dt>

                        <dd className="font-semibold text-text-strong">
                          {formatMoney(
                            selectedProposal.tax,
                            selectedProposal.currency,
                          )}
                        </dd>
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-4 rounded-xl bg-primary-soft px-4 py-4">
                        <dt className="font-semibold text-text-strong">
                          Total
                        </dt>

                        <dd className="heading6 text-primary-dark">
                          {formatMoney(
                            selectedProposal.total,
                            selectedProposal.currency,
                          )}
                        </dd>
                      </div>
                    </dl>
                  </section>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      <AuthFeedbackModal
        open={feedback.open}
        title={feedback.title}
        message={feedback.message}
        errors={feedback.errors}
        tone={feedback.tone}
        onClose={() =>
          setFeedback((current) => ({
            ...current,
            open: false,
          }))
        }
      />
    </>
  )
}

export default CustomerProposalsPanel
