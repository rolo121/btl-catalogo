export const CUSTOMER_SESSION_CHANGED_EVENT =
  'btlmarketing:customer-session-changed'

export type CustomerSessionChangedDetail = {
  customerId: number | null
}

const normalizeCustomerId = (
  customerId: string | number | null | undefined,
): number | null => {
  if (customerId === null || customerId === undefined) {
    return null
  }

  const normalizedId = Number(customerId)

  return Number.isFinite(normalizedId) ? normalizedId : null
}

export const emitCustomerSessionChanged = (
  customerId: string | number | null | undefined,
) => {
  if (typeof window === 'undefined') return

  window.dispatchEvent(
    new CustomEvent<CustomerSessionChangedDetail>(
      CUSTOMER_SESSION_CHANGED_EVENT,
      {
        detail: {
          customerId: normalizeCustomerId(customerId),
        },
      },
    ),
  )
}
