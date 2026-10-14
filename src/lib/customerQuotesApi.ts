import { apiRequest } from '@/lib/apiClient'
import { withCommercialSiteQuery } from '@/lib/commercialSite'
import type {
  CustomerAccountSummary,
  CustomerAccountSummaryResponse,
  CustomerQuoteDetail,
  CustomerQuoteDetailResponse,
  CustomerQuoteListResponse,
} from '@/types/CustomerQuoteTypes'

export const customerQuotesApi = {
  summary: async (): Promise<CustomerAccountSummary> => {
    const response =
      await apiRequest<CustomerAccountSummaryResponse>(
        withCommercialSiteQuery('/customer/summary'),
      )

    return response.data
  },

  list: (page = 1, perPage = 10) =>
    apiRequest<CustomerQuoteListResponse>(
      withCommercialSiteQuery(
        `/customer/quotes?page=${page}&per_page=${perPage}`,
      ),
    ),

  detail: async (quoteNumber: string): Promise<CustomerQuoteDetail> => {
    const response = await apiRequest<CustomerQuoteDetailResponse>(
      withCommercialSiteQuery(
        `/customer/quotes/${encodeURIComponent(quoteNumber)}`,
      ),
    )

    return response.data
  },
}
