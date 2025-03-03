export interface Event {
  type: string;
  status?: string;
  amount?: number;
  currency?: string;
  timestamp: string;
  details: string;
  email?: string;
  plan?: string;
  quantity?: number;
  country?: string;
} 