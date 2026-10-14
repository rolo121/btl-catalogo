import type {
  CustomerProfile,
  CustomerUser,
} from '@/types/AuthTypes'

type CustomerIdentity = {
  user: CustomerUser | null
  profile: CustomerProfile | null
}

export type StandardQuoteCustomerPrefill = {
  nombre: string
  cedula: string
  direccion: string
  telefono: string
  ciudad: string
  correo: string
}

const clean = (value: unknown) => String(value ?? '').trim()

export const buildStandardQuoteCustomerPrefill = ({
  user,
  profile,
}: CustomerIdentity): StandardQuoteCustomerPrefill => ({
  nombre: clean(user?.name),
  cedula: clean(profile?.tax_id),
  direccion: clean(profile?.address),
  telefono: clean(profile?.phone),
  ciudad: clean(profile?.city),
  correo: clean(user?.email),
})

export const buildIndividualQuotePrefill =
  buildStandardQuoteCustomerPrefill

export const buildCartQuotePrefill =
  buildStandardQuoteCustomerPrefill
