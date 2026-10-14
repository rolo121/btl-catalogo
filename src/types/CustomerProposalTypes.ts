export type CustomerProposalQuoteSummary = {
  quote_number: string
  client_name: string | null
  company: string | null
}

export type CustomerProposalSummary = {
  id: number
  proposal_number: string
  version: number
  status: string
  status_label: string
  currency: string
  subtotal: string
  discount: string
  tax: string
  total: string
  issued_at: string | null
  valid_until: string | null
  sent_at: string | null
  accepted_at: string | null
  rejected_at: string | null
  created_at: string | null
  updated_at: string | null
  items_count: number
  download_url: string
  quote: CustomerProposalQuoteSummary | null
}

export type CustomerProposalSeller = {
  name: string | null
  email: string | null
  phone: string | null
}

export type CustomerProposalConditions = {
  tax_condition: string | null
  payment_terms: string | null
  delivery_terms: string | null
  commercial_notes: string | null
}

export type CustomerProposalQuoteDetail = CustomerProposalQuoteSummary & {
  email: string | null
  phone: string | null
  city: string | null
  address: string | null
  contact_person: string | null
}

export type CustomerProposalItem = {
  id: number
  type: string | null
  product_name: string
  sku: string | null
  description: string | null
  specifications: string | null
  image: string | null
  quantity: string
  unit: string | null
  unit_price: string
  discount: string
  line_subtotal: string
}

export type CustomerProposalDetail = Omit<CustomerProposalSummary, 'quote'> & {
  seller: CustomerProposalSeller
  conditions: CustomerProposalConditions
  quote: CustomerProposalQuoteDetail
  items: CustomerProposalItem[]
}

export type CustomerProposalPagination = {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export type CustomerProposalListResponse = {
  data: CustomerProposalSummary[]
  meta: CustomerProposalPagination
}

export type CustomerProposalDetailResponse = {
  data: CustomerProposalDetail
}

