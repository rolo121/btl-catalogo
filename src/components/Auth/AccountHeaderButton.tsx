'use client'

import React, { useMemo } from 'react'
import Link from 'next/link'
import * as Icon from '@phosphor-icons/react/dist/ssr'
import { useAuth } from '@/hooks/useAuth'

type AccountHeaderButtonProps = {
  variant?: 'icon' | 'menu' | 'bottom'
  onNavigate?: () => void
  className?: string
}

const getInitials = (name?: string | null) => {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('') || 'TP'
}

const AccountHeaderButton = ({
  variant = 'icon',
  onNavigate,
  className = '',
}: AccountHeaderButtonProps) => {
  const { user, isAuthenticated, isLoading } = useAuth()

  const initials = useMemo(() => getInitials(user?.name), [user?.name])
  const href = isAuthenticated ? '/mi-cuenta' : '/iniciar-sesion'
  const label = isAuthenticated ? 'Mi cuenta' : 'Iniciar sesión'

  if (variant === 'menu') {
    return (
      <Link
        href={href}
        onClick={onNavigate}
        className={`flex items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3 duration-300 hover:border-primary/40 hover:bg-primary-soft ${className}`}
        aria-label={label}
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-primary-dark shadow-sm">
          {isLoading ? (
            <span className="h-5 w-5 animate-pulse rounded-full bg-line" />
          ) : isAuthenticated ? (
            <span className="text-sm font-bold">{initials}</span>
          ) : (
            <Icon.UserCircle size={24} weight="bold" />
          )}
        </span>

        <span className="min-w-0">
          <span className="block text-sm text-text-secondary">
            {isAuthenticated ? 'Sesión activa' : 'Área de cliente'}
          </span>
          <span className="block truncate font-semibold text-text-strong">
            {isLoading ? 'Verificando sesión...' : isAuthenticated ? user?.name || label : label}
          </span>
        </span>
      </Link>
    )
  }

  if (variant === 'bottom') {
    return (
      <Link
        href={href}
        onClick={onNavigate}
        className={`menu_bar-link flex flex-col items-center gap-1 duration-300 ${className}`}
        aria-label={label}
      >
        {isLoading ? (
          <span className="h-6 w-6 animate-pulse rounded-full bg-line" />
        ) : isAuthenticated ? (
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
            {initials}
          </span>
        ) : (
          <Icon.UserCircle size={24} weight="bold" />
        )}
        <span className="menu_bar-title caption2 font-semibold">
          {isAuthenticated ? 'Mi cuenta' : 'Ingresar'}
        </span>
      </Link>
    )
  }

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`account-header-button flex h-9 w-9 items-center justify-center rounded-full border duration-300 ${
        isAuthenticated
          ? 'border-primary bg-primary text-white shadow-sm hover:bg-primary-dark'
          : 'border-line bg-white text-text-strong hover:border-primary hover:text-primary-dark'
      } ${className}`}
      aria-label={label}
      title={label}
    >
      {isLoading ? (
        <span className="h-5 w-5 animate-pulse rounded-full bg-line" />
      ) : isAuthenticated ? (
        <span className="text-[11px] font-bold leading-none">{initials}</span>
      ) : (
        <Icon.UserCircle size={23} weight="bold" />
      )}
    </Link>
  )
}

export default AccountHeaderButton
