"use client"

import type { ReactNode } from "react"
import QuoteCustomerForm, {
  type QuoteCustomerValues,
} from "@/components/Quote/QuoteCustomerForm"

type Props = {
  values: QuoteCustomerValues
  errors?: Record<string, string | undefined>
  disabled?: boolean
  beforeFields?: ReactNode
  afterFields?: ReactNode
  onChange: (
    field: keyof QuoteCustomerValues,
    value: string | boolean,
  ) => void
  onSubmit: () => void
  isSubmitting?: boolean
  submitDisabled?: boolean
  submitLabel?: string
  submittingLabel?: string
  secondaryAction?: ReactNode
  notice?: ReactNode
}

export default function UnifiedQuoteForm({
  values,
  errors = {},
  disabled = false,
  beforeFields,
  afterFields,
  onChange,
  onSubmit,
  isSubmitting = false,
  submitDisabled = false,
  submitLabel = "Enviar solicitud de cotización",
  submittingLabel = "Enviando solicitud...",
  secondaryAction,
  notice,
}: Props) {
  return (
    <section className="rounded-[28px] border border-[#DCE6EA] bg-white p-5 shadow-[0_12px_34px_rgba(31,46,83,.06)] sm:p-6 lg:p-8">
      {beforeFields ? <div className="mb-7">{beforeFields}</div> : null}

      <QuoteCustomerForm
        values={values}
        errors={errors}
        disabled={disabled}
        onChange={onChange}
      />

      {afterFields ? <div className="mt-7">{afterFields}</div> : null}

      {notice ? <div className="mt-6">{notice}</div> : null}

      <div className="mt-8 border-t border-[#E7EEF1] pt-6">
        <button
          type="button"
          onClick={onSubmit}
          disabled={disabled || isSubmitting || submitDisabled}
          className={`flex min-h-[54px] w-full items-center justify-center rounded-xl px-5 text-sm font-extrabold text-white transition ${
            disabled || isSubmitting || submitDisabled
              ? "cursor-not-allowed bg-[#8492A6]"
              : "bg-[#21577B] hover:bg-[#1F2E53]"
          }`}
        >
          {isSubmitting ? submittingLabel : submitLabel}
        </button>

        {secondaryAction ? (
          <div className="mt-3">
            {secondaryAction}
          </div>
        ) : null}
      </div>
    </section>
  )
}
