export type CustomerProposalSummary = {
  proposal_number: string
  status: string
  issued_at: string | null
  valid_until: string | null
  sent_at: string | null
}

export type CustomerQuoteSummary = {
  id: number
  quote_number: string
  status: string
  status_label: string
  items_count: number
  created_at: string | null
  updated_at: string | null
  proposal: CustomerProposalSummary | null
}

export type CustomerQuoteItem = {
  id: number
  product_name: string
  sku: string | null
  color: string | null
  size: string | null
  quantity: number
  marking_area: string | null
  marking_technique: string | null
  marking_area_image: string | null
  image: string | null
}

export type CustomerQuoteContact = {
  client_name: string | null
  company: string | null
  email: string | null
  phone: string | null
  city: string | null
  address: string | null
  contact_person: string | null
}

export type CustomerQuoteDetail = CustomerQuoteSummary & {
  contact: CustomerQuoteContact
  observations: string | null
  items: CustomerQuoteItem[]
}

export type CustomerQuotePagination = {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export type CustomerQuoteListResponse = {
  data: CustomerQuoteSummary[]
  meta: CustomerQuotePagination
}

export type CustomerQuoteDetailResponse = {
  data: CustomerQuoteDetail
}

export type CustomerAccountSummary = {
  requests_total: number
  requests_open: number
  proposals_received: number
  proposals_pending: number
}

export type CustomerAccountSummaryResponse = {
  data: CustomerAccountSummary
}
