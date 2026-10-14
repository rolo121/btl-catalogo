import { apiRequest, initializeCsrf } from '@/lib/apiClient'
import { withCommercialSitePayload } from '@/lib/commercialSite'
import type {
  AuthSession,
  ChangePasswordPayload,
  ForgotPasswordPayload,
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
  UpdateProfilePayload,
} from '@/types/AuthTypes'

type MessageResponse = {
  message: string
}

type SessionStatusResponse =
  | {
      authenticated: false
      user: null
      profile: null
    }
  | ({
      authenticated: true
    } & AuthSession)

const authMutation = async <T>(path: string, payload?: unknown) => {
  await initializeCsrf()

  return apiRequest<T>(path, {
    method: 'POST',
    body: payload === undefined ? undefined : JSON.stringify(payload),
  })
}

export const authApi = {
  current: async (): Promise<AuthSession | null> => {
    const response = await apiRequest<SessionStatusResponse>('/auth/session')

    if (!response.authenticated) {
      return null
    }

    return {
      user: response.user,
      profile: response.profile,
    }
  },

  login: (payload: LoginPayload) =>
    authMutation<AuthSession>('/auth/login', payload),

  register: (payload: RegisterPayload) =>
    authMutation<AuthSession>(
      '/auth/register',
      withCommercialSitePayload(payload),
    ),

  logout: () => authMutation<MessageResponse>('/auth/logout'),

  forgotPassword: (payload: ForgotPasswordPayload) =>
    authMutation<MessageResponse>(
      '/auth/forgot-password',
      withCommercialSitePayload(payload),
    ),

  resetPassword: (payload: ResetPasswordPayload) =>
    authMutation<MessageResponse>(
      '/auth/reset-password',
      withCommercialSitePayload(payload),
    ),

  changePassword: async (payload: ChangePasswordPayload) => {
    await initializeCsrf()

    return apiRequest<MessageResponse>('/auth/password', {
      method: 'PUT',
      body: JSON.stringify(withCommercialSitePayload(payload)),
    })
  },

  updateProfile: async (payload: UpdateProfilePayload) => {
    await initializeCsrf()

    return apiRequest<AuthSession>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
  },
}
