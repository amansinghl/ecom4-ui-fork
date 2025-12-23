export type InvoiceType = {
  invoice_no: string;
  invoice_date: string;
  created_at: string;
  month_year: string;
  invoice_type: string;
  category: string;
  total: string;
  paid: string;
  pending: string;
};

// apiClient already extracts the "data" property, so this is what we get after extraction
export type InvoicesApiData = {
  invoices: {
    data: InvoiceType[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from?: number;
    to?: number;
  };
};

export type PassbookTransactionType = {
  date: string | null;
  remark: string;
  credit: string;
  debit: string;
  balance: string;
};

// apiClient already extracts the "data" property, so this is what we get after extraction
export type AccountSummaryApiData = {
  opening_balance: string;
  closing_balance: string;
  transactions: PassbookTransactionType[];
};

