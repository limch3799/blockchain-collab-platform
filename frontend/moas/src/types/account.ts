export interface LeaderSummary {
  totalDepositAmount: number;
  totalAmount: number;
}

export interface ArtistSummary {
  totalAmount: number;
}

export interface Summary {
  leaderSummary?: LeaderSummary;
  artistSummary?: ArtistSummary;
}

export interface Transaction {
  transactionId: number;
  type: 'payment' | 'fee' | 'settlement';
  amount: number;
  description: string;
  createdAt: string;
}

export interface Pagination {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface TransactionsResponse {
  summary: Summary;
  transactions: Transaction[];
  pagination: Pagination;
}
