'use client'

import React from 'react'
import * as Icon from '@phosphor-icons/react/dist/ssr'

type AuthFeedbackModalProps = {
  open: boolean
  title: string
  message: string
  errors?: string[]
  tone?: 'error' | 'success'
  onClose: () => void
}

const AuthFeedbackModal = ({
  open,
  title,
  message,
  errors = [],
  tone = 'error',
  onClose,
}: AuthFeedbackModalProps) => {
  if (!open) return null

  const isSuccess = tone === 'success'

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 px-4">
      <button
        type="button"
        aria-label="Cerrar mensaje"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-feedback-title"
        className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
      >
        <div className="flex items-start gap-4">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
              isSuccess ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
            }`}
          >
            {isSuccess ? (
              <Icon.CheckCircle size={24} weight="fill" />
            ) : (
              <Icon.WarningCircle size={24} weight="fill" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h2 id="auth-feedback-title" className="heading6 text-text-strong">
              {title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-text-secondary">{message}</p>

            {errors.length > 0 ? (
              <ul className="mt-4 space-y-2 rounded-xl bg-surface p-4 text-sm text-text-secondary">
                {errors.map((error) => (
                  <li key={error} className="flex gap-2">
                    <span aria-hidden="true">•</span>
                    <span>{error}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button type="button" className="button-main" onClick={onClose}>
            Entendido
          </button>
        </div>
      </div>
    </div>
  )
}

export default AuthFeedbackModal
