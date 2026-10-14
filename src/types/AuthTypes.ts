export type CustomerUser = {
  id: number | string
  name: string
  email: string
  role: 'customer'
  active?: boolean
  email_verified_at?: string | null
}

export type CustomerProfile = {
  company_name?: string | null
  tax_id?: string | null
  phone?: string | null
  address?: string | null
  city?: string | null
  contact_person?: string | null
  status?: string | null
}

export type AuthSession = {
  user: CustomerUser
  profile: CustomerProfile | null
  mail_queued?: boolean
}

export type LoginPayload = {
  email: string
  password: string
  remember?: boolean
}

export type RegisterPayload = {
  name: string
  email: string
  phone: string
  company_name?: string
  tax_id?: string
  city?: string
  address?: string
  password: string
  password_confirmation: string
  terms_accepted: boolean
}

export type UpdateProfilePayload = Partial<
  Pick<CustomerUser, 'name' | 'email'> & CustomerProfile
>

export type ForgotPasswordPayload = {
  email: string
}

export type ResetPasswordPayload = {
  email: string
  token: string
  password: string
  password_confirmation: string
}

export type ChangePasswordPayload = {
  current_password: string
  password: string
  password_confirmation: string
}
