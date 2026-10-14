import { apiDownload, apiRequest } from '@/lib/apiClient'
import { withCommercialSiteQuery } from '@/lib/commercialSite'
import type {
  CustomerProposalDetail,
  CustomerProposalDetailResponse,
  CustomerProposalListResponse,
} from '@/types/CustomerProposalTypes'

export const customerProposalsApi = {
  list: (page = 1, perPage = 10) =>
    apiRequest<CustomerProposalListResponse>(
      withCommercialSiteQuery(
        `/customer/proposals?page=${page}&per_page=${perPage}`,
      ),
    ),

  detail: async (
    proposalNumber: string,
  ): Promise<CustomerProposalDetail> => {
    const response = await apiRequest<CustomerProposalDetailResponse>(
      withCommercialSiteQuery(
        `/customer/proposals/${encodeURIComponent(proposalNumber)}`,
      ),
    )

    return response.data
  },

  download: (proposalNumber: string) =>
    apiDownload(
      withCommercialSiteQuery(
        `/customer/proposals/${encodeURIComponent(proposalNumber)}/download`,
      ),
    ),
}
